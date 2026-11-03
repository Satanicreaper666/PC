/**
 * Surveys and self-assessments. One person answers and sees their scores, as
 * before. A manager can also collect several people's answers on one device
 * (in a team meeting, say) with "Add another person's answers": the form
 * clears for the next person and the team's averages build up, closed by
 * default so the next person doesn't see them.
 *
 * Storage: "pc-sv-<id>", only once a second person is added. Responses are kept
 * in a random order with no names or times, so a response number can't be
 * matched to whoever answered first, second or third.
 */
import { downloadCsv, fileStem } from "./csv.ts";
import { isoDate, readJson, removeKey, writeJson } from "./store.ts";

type Band = { min: number; max: number; label: string; advice: string };
type Answers = Record<string, number>;
type Store = { v: 1; responses: Answers[] };

/** The few-responses warning shows below this many: smaller groups can be identified. */
export const ANON_MIN = 5;

const root = document.querySelector<HTMLElement>("[data-survey]");
if (root) init(root);

function init(root: HTMLElement) {
  const id = root.dataset.survey!;
  const title = root.dataset.title ?? "Survey";
  const key = `pc-sv-${id}`;
  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const form = q<HTMLFormElement>("[data-sv-form]");
  const min = Number(root.dataset.min);
  const max = Number(root.dataset.max);
  const bands = JSON.parse(root.dataset.bands ?? "[]") as Band[];
  const qs = Array.from(form.querySelectorAll<HTMLFieldSetElement>("fieldset.q"));
  const progress = q("[data-sv-progress]");
  const results = q("[data-sv-results]");
  const next = q("[data-sv-next]");
  const team = q("[data-sv-team]");
  const details = q<HTMLDetailsElement>("[data-sv-team-details]");
  const teamStatus = q("[data-sv-team-status]");
  const confirm = q("[data-sv-confirm]");
  const questions = qs.map((f) => ({
    id: f.dataset.q ?? f.querySelector<HTMLInputElement>("input")!.name,
    text: (f.querySelector("legend")?.textContent ?? "").trim(),
    dim: f.dataset.dim ?? "Overall",
    rev: f.dataset.rev === "1"
  }));
  const dims = Array.from(new Set(questions.map((x) => x.dim)));

  const stored = readJson<Store>(key);
  let responses: Answers[] = Array.isArray(stored?.responses) ? stored!.responses.filter((r) => r && typeof r === "object") : [];
  /** Where this person's submitted answers sit in `responses`, once they have submitted. */
  let current: number | null = null;
  let teamMode = responses.length > 0;
  let nextPerson = false;

  const answered = () => qs.filter((f) => f.querySelector("input:checked")).length;
  const showProgress = () => (progress.textContent = `${answered()} of ${qs.length} answered`);
  const answers = (): Answers => {
    const out: Answers = {};
    for (const x of questions) {
      const v = form.querySelector<HTMLInputElement>(`input[name="${CSS.escape(x.id)}"]:checked`)?.value;
      if (v != null) out[x.id] = Number(v);
    }
    return out;
  };
  const complete = (a: Answers) => questions.every((x) => Number.isFinite(a[x.id]));
  const scored = (x: (typeof questions)[number], v: number) => (x.rev ? max + min - v : v);
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
  const bandOf = (v: number) => bands.find((b) => v >= b.min && v <= b.max) ?? bands[bands.length - 1];
  const plural = (n: number) => `${n} ${n === 1 ? "response" : "responses"}`;

  /** Area averages for a set of responses, reverse-worded questions flipped so higher is better. */
  function areaScores(set: Answers[]): { dim: string; avg: number }[] {
    return dims.map((d) => {
      const vals: number[] = [];
      for (const r of set) for (const x of questions) if (x.dim === d && Number.isFinite(r[x.id])) vals.push(scored(x, r[x.id]));
      return { dim: d, avg: avg(vals) };
    });
  }
  function overallOf(set: Answers[]): number {
    const vals: number[] = [];
    for (const r of set) for (const x of questions) if (Number.isFinite(r[x.id])) vals.push(scored(x, r[x.id]));
    return avg(vals);
  }

  function drawBars(el: HTMLElement, scores: { dim: string; avg: number }[]) {
    el.replaceChildren(
      ...scores.map(({ dim, avg: a }) => {
        const row = document.createElement("div");
        row.className = "bar-row";
        const name = document.createElement("span");
        name.className = "bn";
        name.textContent = dim;
        const track = document.createElement("span");
        track.className = "bt";
        const fill = document.createElement("span");
        fill.className = "bf";
        fill.style.width = `${Math.max(0, ((a - min) / (max - min)) * 100)}%`;
        track.appendChild(fill);
        const val = document.createElement("span");
        val.className = "bv";
        val.textContent = Number.isFinite(a) ? a.toFixed(1) : "–";
        row.append(name, track, val);
        return row;
      })
    );
  }

  function save(): boolean {
    if (!responses.length) {
      removeKey(key);
      return true;
    }
    return writeJson(key, { v: 1, responses } satisfies Store);
  }

  /** Put this person's answers in the team set: a new response at a random place, or an update to theirs. */
  function record(a: Answers) {
    if (current != null && responses[current]) responses[current] = a;
    else {
      current = Math.floor(Math.random() * (responses.length + 1));
      responses.splice(current, 0, a);
    }
    if (!save()) teamStatus.textContent = "The answers couldn't be saved: this browser's storage is full or turned off. Download the CSV to keep them.";
  }

  function renderTeam() {
    team.hidden = !teamMode || !responses.length;
    const n = responses.length;
    q("[data-sv-team-count]").textContent = plural(n);
    next.hidden = !teamMode || !n || current != null;
    next.textContent = n ? `Answering as part of a team: ${plural(n)} saved so far on this device. Your answers stay anonymous.` : "";
    if (!n) return;
    const overall = overallOf(responses);
    const band = bandOf(overall);
    const head = q("[data-sv-team-overall]");
    const mark = document.createElement("mark");
    mark.className = "hl";
    mark.textContent = `${overall.toFixed(1)} out of ${max}`;
    head.replaceChildren(`Team average `, mark, band ? `: ${band.label}` : "");
    q("[data-sv-team-advice]").textContent = band?.advice ?? "";
    const scores = areaScores(responses);
    drawBars(q("[data-sv-team-bars]"), scores);
    const low = [...scores].filter((s) => Number.isFinite(s.avg)).sort((a, b) => a.avg - b.avg)[0];
    q("[data-sv-team-low]").textContent = dims.length > 1 && low ? `Lowest area: ${low.dim}, ${low.avg.toFixed(1)}. Start there.` : "";
    q("[data-sv-team-few]").hidden = n >= ANON_MIN;
  }

  form.addEventListener("change", showProgress);
  form.addEventListener("reset", () =>
    setTimeout(() => {
      // "Start again" in a team session takes this person's submitted answers out again.
      if (!nextPerson && teamMode && current != null) {
        responses.splice(current, 1);
        current = null;
        save();
        teamStatus.textContent = "Your answers were cleared and taken out of the team results.";
        if (!responses.length) teamMode = false;
      }
      nextPerson = false;
      showProgress();
      results.hidden = true;
      renderTeam();
    })
  );
  showProgress();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (answered() < qs.length) {
      const first = qs.find((f) => !f.querySelector("input:checked"));
      progress.textContent = `Answer every question to see results. ${qs.length - answered()} left.`;
      first?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    const mine = answers();
    const overall = overallOf([mine]);
    const band = bandOf(overall);
    q("[data-sv-band]").textContent = `Overall ${overall.toFixed(1)} out of ${max}${band ? `: ${band.label}` : ""}`;
    q("[data-sv-advice]").textContent = band?.advice ?? "";
    drawBars(q("[data-sv-bars]"), areaScores([mine]));
    if (teamMode) {
      record(mine);
      teamStatus.textContent = `Your answers are saved as one of ${plural(responses.length)} on this device.`;
    }
    renderTeam();
    results.hidden = false;
    results.focus();
  });

  q("[data-sv-another]").addEventListener("click", () => {
    const mine = answers();
    if (!complete(mine)) {
      results.hidden = true;
      progress.textContent = `Answer every question first. ${qs.length - answered()} left.`;
      qs.find((f) => !f.querySelector("input:checked"))?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    teamMode = true;
    record(mine);
    current = null;
    nextPerson = true;
    form.reset();
    details.open = false;
    results.hidden = true;
    const n = responses.length;
    teamStatus.textContent = `Saved. ${plural(n)} so far. The form is clear for the next person.`;
    renderTeam();
    showProgress();
    // Back to the first question for the next person; their answers start blank.
    root.scrollIntoView({ block: "start" });
    form.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  });

  q("[data-sv-csv]").addEventListener("click", () => {
    const header = [
      "Response",
      ...questions.map((x) => (x.rev ? `${x.text} (reverse-worded)` : x.text)),
      ...(dims.length > 1 ? dims.map((d) => `${d} average`) : []),
      `Overall average (${min} to ${max})`
    ];
    const rows = responses.map((r, i) => [
      String(i + 1),
      ...questions.map((x) => (Number.isFinite(r[x.id]) ? String(r[x.id]) : "")),
      ...(dims.length > 1 ? areaScores([r]).map((s) => (Number.isFinite(s.avg) ? s.avg.toFixed(2) : "")) : []),
      Number.isFinite(overallOf([r])) ? overallOf([r]).toFixed(2) : ""
    ]);
    downloadCsv(`${fileStem(title)}-responses-${isoDate()}.csv`, [header, ...rows]);
    teamStatus.textContent = `Downloaded ${plural(responses.length)} as a CSV file. Each row is one anonymous response.`;
  });

  q("[data-sv-clear]").addEventListener("click", () => {
    q("[data-sv-confirm-text]").textContent = `Delete all ${plural(responses.length)} from this device? Download the CSV first if you need them. This can't be undone.`;
    confirm.hidden = false;
    q<HTMLButtonElement>("[data-sv-clear-yes]").focus();
  });
  const closeConfirm = () => {
    confirm.hidden = true;
    q<HTMLButtonElement>("[data-sv-clear]").focus();
  };
  q("[data-sv-clear-no]").addEventListener("click", closeConfirm);
  confirm.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeConfirm();
  });
  q("[data-sv-clear-yes]").addEventListener("click", () => {
    const n = responses.length;
    responses = [];
    current = null;
    teamMode = false;
    removeKey(key);
    confirm.hidden = true;
    renderTeam();
    teamStatus.textContent = `${plural(n)} deleted from this device.`;
    // The team section has gone; put focus back on the survey.
    form.querySelector<HTMLInputElement>("input")?.focus();
  });

  renderTeam();
}
