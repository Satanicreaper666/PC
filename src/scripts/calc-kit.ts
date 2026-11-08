/**
 * Calculator wiring shared by every toolkit calculator.
 *
 *   import { bindCalculator } from "../../scripts/calc-kit";
 *   import { compute } from "../../lib/calc/gratuity";
 *   bindCalculator("gratuity", (v) => compute({ wages: v.num("wages"), ... }));
 *
 * - Recomputes on every input, so there is no "Calculate" button to miss.
 * - Keeps inputs in the URL (?wages=40000&years=6) so a result can be shared.
 * - Renders headline outputs ([data-out]), a line-by-line table ([data-lines])
 *   and an optional bar comparison ([data-bars]).
 * - Every calculator in a CalcShell also gets, with no extra code: saved
 *   scenarios with a side-by-side comparison, and a CSV of the inputs and results
 *   (src/components/calc/scenario-ui.ts).
 *
 * Opt-in hooks a calculator can add to its result:
 * - `working`: steps for "How this was worked out" (label = formula = result).
 * - `warnings`: unusual inputs to check, using rules the calculator already states.
 *   They show on a pink sticky note; the result still shows.
 * - `better` (outputs) and `CalcLine.better`: which way is better, so the compare
 *   table can mark the best scenario. Leave it out when better is a matter of view.
 * - `CalcLine.key`: a stable id for comparing scenarios when a label changes.
 */
import { setupScenarios, type ScenarioHost } from "../components/calc/scenario-ui";
import { setupPaper } from "../components/calc/working-paper";

export type Better = "higher" | "lower";
export type CalcLine = {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
  tone?: "good" | "bad";
  /** Stable id for the compare table (defaults to the label). */
  key?: string;
  /** Mark the best scenario in the compare table: only where better is not a matter of view. */
  better?: Better;
};
export type CalcBar = { label: string; value: number; display: string };
/** One step of the working: `label` = `formula` = `result`, with an optional rule or source. */
export type CalcStep = { label: string; formula: string; result: string; note?: string };
export type CalcResult = {
  outputs: Record<string, string>;
  lines?: CalcLine[];
  bars?: CalcBar[];
  notes?: string[];
  /** Set when inputs are incomplete or invalid; shown instead of results. */
  message?: string;
  /** "How this was worked out": each step with its formula and numbers. */
  working?: CalcStep[];
  /** Unusual inputs worth a second look. Never blocks the result. */
  warnings?: string[];
  /** Which headline outputs are better when higher or lower, for the compare table. */
  better?: Record<string, Better>;
};

export type Values = {
  raw: (name: string) => string;
  num: (name: string, fallback?: number) => number;
  str: (name: string, fallback?: string) => string;
  bool: (name: string) => boolean;
};

export const inr = (n: number, frac = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: frac, minimumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
export const num = (n: number, frac = 1) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: frac }).format(Number.isFinite(n) ? n : 0);
export const longDate = (d: Date) => new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(d);
/** Rupees for the working: paise only when there are any (₹16,885.32, ₹37,500). */
export const inrExact = (n: number) => {
  const r = Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
  return Number.isInteger(r) ? inr(r) : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(r);
};

/** Messages that ask for a missing input are a tip to act on (yellow note); anything else is a problem to check (pink). */
const PROMPT = /^(Enter|Choose|Add|Pick|Select|Tick|Type|Paste)\b/;

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function bindCalculator(id: string, compute: (v: Values) => CalcResult) {
  const root = document.querySelector<HTMLElement>(`[data-calc="${id}"]`);
  if (!root) return;
  const form = root.querySelector<HTMLFormElement>("form")!;
  const fields = () => Array.from(form.querySelectorAll<Field>("[name]"));

  // Restore from the URL first (shared links), then from defaults already in the markup.
  const params = new URLSearchParams(location.search);
  for (const el of fields()) {
    const v = params.get(el.name);
    if (v === null) continue;
    setField(el, v);
  }

  const values: Values = {
    raw: (name) => {
      const el = form.elements.namedItem(name);
      if (el instanceof RadioNodeList) return el.value;
      return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement ? el.value : "";
    },
    num: (name, fallback = 0) => {
      const s = values.raw(name).replace(/[₹,\s]/g, "");
      if (s === "") return fallback;
      const n = Number(s);
      return Number.isFinite(n) ? n : fallback;
    },
    str: (name, fallback = "") => values.raw(name) || fallback,
    bool: (name) => {
      const el = form.elements.namedItem(name);
      return el instanceof HTMLInputElement ? el.checked : false;
    }
  };

  const msg = root.querySelector<HTMLElement>("[data-calc-message]");
  const prompt = root.querySelector<HTMLElement>("[data-calc-prompt]");
  const check = root.querySelector<HTMLElement>("[data-calc-check]");
  const checkMsg = root.querySelector<HTMLElement>("[data-check-message]");
  const warnList = root.querySelector<HTMLElement>("[data-warnings]");
  const resultsBox = root.querySelector<HTMLElement>("[data-calc-results]");
  const working = root.querySelector<HTMLDetailsElement>("[data-working]");
  const steps = root.querySelector<HTMLElement>("[data-working-steps]");
  let last: CalcResult | null = null;
  let scenarios: ReturnType<typeof setupScenarios> = null;

  /** Every named field, as the URL encodes it ("" for a blank field): enough to restore the form exactly. */
  function fieldState(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const el of fields()) {
      if (el instanceof HTMLInputElement && el.type === "checkbox") out[el.name] = el.checked ? "1" : "0";
      else if (el instanceof HTMLInputElement && el.type === "radio") {
        if (el.checked) out[el.name] = el.value;
        else if (!(el.name in out)) out[el.name] = "";
      } else out[el.name] = el.value;
    }
    return out;
  }

  /** Put saved values back; fields a scenario does not mention go back to their defaults. */
  function applyState(state: Record<string, string>) {
    for (const el of fields()) {
      const v = state[el.name];
      if (v === undefined) resetField(el);
      else setField(el, v);
    }
    form.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function renderMessage(res: CalcResult) {
    const m = res.message ?? "";
    const isPrompt = !!m && PROMPT.test(m);
    const warnings = res.message ? [] : (res.warnings ?? []).filter(Boolean);
    if (msg) msg.textContent = isPrompt ? m : "";
    if (prompt) prompt.hidden = !isPrompt;
    if (checkMsg) {
      checkMsg.textContent = m && !isPrompt ? m : "";
      checkMsg.hidden = !(m && !isPrompt);
    }
    if (warnList) {
      warnList.replaceChildren(...warnings.map((w) => Object.assign(document.createElement("li"), { textContent: w })));
      warnList.hidden = warnings.length === 0;
    }
    if (check) check.hidden = !((m && !isPrompt) || warnings.length);
  }

  function renderWorking(res: CalcResult) {
    if (!working || !steps) return;
    const list = res.message ? [] : (res.working ?? []);
    steps.replaceChildren(
      ...list.map((s) => {
        const li = document.createElement("li");
        const label = Object.assign(document.createElement("span"), { className: "w-label", textContent: s.label });
        const eq = () => Object.assign(document.createElement("span"), { className: "w-eq", textContent: " = " });
        li.append(label);
        if (s.formula) li.append(eq(), Object.assign(document.createElement("span"), { className: "pencil w-formula", textContent: s.formula }));
        li.append(eq(), Object.assign(document.createElement("strong"), { className: "w-result", textContent: s.result }));
        if (s.note) li.append(Object.assign(document.createElement("span"), { className: "w-note", textContent: s.note }));
        return li;
      })
    );
    working.hidden = list.length === 0;
  }

  function run() {
    let res: CalcResult;
    try {
      res = compute(values);
    } catch (e) {
      res = { outputs: {}, message: "Check the numbers you entered." };
      console.error(e);
    }
    renderMessage(res);
    resultsBox?.classList.toggle("is-empty", !!res.message);
    for (const [k, v] of Object.entries(res.outputs)) {
      root!.querySelectorAll<HTMLElement>(`[data-out="${k}"]`).forEach((el) => (el.textContent = v));
    }
    const linesEl = root!.querySelector<HTMLElement>("[data-lines]");
    if (linesEl) {
      linesEl.replaceChildren(
        ...(res.lines ?? []).map((l) => {
          const tr = document.createElement("tr");
          if (l.strong) tr.className = "strong";
          if (l.tone) tr.classList.add(`tone-${l.tone}`);
          const th = document.createElement("th");
          th.scope = "row";
          th.textContent = l.label;
          if (l.note) {
            const n = document.createElement("span");
            n.className = "line-note";
            n.textContent = l.note;
            th.appendChild(n);
          }
          const td = document.createElement("td");
          td.textContent = l.value;
          tr.append(th, td);
          return tr;
        })
      );
    }
    const barsEl = root!.querySelector<HTMLElement>("[data-bars]");
    if (barsEl) {
      const bars = res.bars ?? [];
      const max = Math.max(1, ...bars.map((b) => Math.abs(b.value)));
      barsEl.replaceChildren(
        ...bars.map((b, i) => {
          const row = document.createElement("div");
          row.className = "bar-row";
          const name = document.createElement("span");
          name.className = "bn";
          name.textContent = b.label;
          const track = document.createElement("span");
          track.className = "bt";
          const fill = document.createElement("span");
          fill.className = "bf";
          fill.style.width = `${(Math.abs(b.value) / max) * 100}%`;
          fill.style.background = `var(--c${(i % 6) + 1})`;
          track.appendChild(fill);
          const val = document.createElement("span");
          val.className = "bv";
          val.textContent = b.display;
          row.append(name, track, val);
          return row;
        })
      );
      barsEl.hidden = bars.length === 0;
    }
    renderWorking(res);
    const notesEl = root!.querySelector<HTMLElement>("[data-notes]");
    if (notesEl) {
      notesEl.replaceChildren(
        ...(res.notes ?? []).map((n) => {
          const li = document.createElement("li");
          li.textContent = n;
          return li;
        })
      );
      notesEl.hidden = !(res.notes ?? []).length;
    }
    // Mirror inputs into the URL without adding history entries.
    const sp = new URLSearchParams();
    for (const el of fields()) {
      if (el instanceof HTMLInputElement && el.type === "checkbox") {
        // Write unticked boxes too ("0"), so a shared link can't fall back to a ticked default.
        if (el.checked || el.defaultChecked) sp.set(el.name, el.checked ? "1" : "0");
      } else if (el instanceof HTMLInputElement && el.type === "radio") {
        if (el.checked) sp.set(el.name, el.value);
      } else if (el.value !== "") sp.set(el.name, el.value);
    }
    history.replaceState(null, "", `${location.pathname}${sp.toString() ? `?${sp}` : ""}`);
    last = res;
    scenarios?.refresh();
  }

  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("reset", () => setTimeout(run));

  root.querySelector("[data-calc-link]")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const label = btn.querySelector("[data-label]");
    try {
      await navigator.clipboard.writeText(location.href);
      if (label) {
        const old = label.textContent;
        label.textContent = "Link copied";
        setTimeout(() => (label.textContent = old), 1800);
      }
    } catch {
      /* clipboard blocked */
    }
  });
  root.querySelector("[data-calc-print]")?.addEventListener("click", () => window.print());

  // Print the working too: open it for the printout, then put it back as it was.
  let wasOpen = false;
  window.addEventListener("beforeprint", () => {
    if (!working || working.hidden) return;
    wasOpen = working.open;
    working.open = true;
  });
  window.addEventListener("afterprint", () => {
    if (working && !working.hidden) working.open = wasOpen;
  });

  const host: ScenarioHost = {
    id,
    root,
    form,
    resultLabel: root.dataset.resultLabel ?? "Result",
    scenarioLabel: root.dataset.scenarioLabel ?? "Scenario {1}",
    last: () => last,
    fieldState,
    applyState,
    focusResults: () => resultsBox?.focus()
  };
  run();
  scenarios = setupScenarios(host);
  scenarios?.refresh();
  setupPaper(host);
}

function setField(el: Field, v: string) {
  if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
    if (el.type === "checkbox") el.checked = v === "1";
    else el.checked = el.value === v;
  } else el.value = v;
}

function resetField(el: Field) {
  if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) el.checked = el.defaultChecked;
  else if (el instanceof HTMLSelectElement) {
    const def = Array.from(el.options).find((o) => o.defaultSelected) ?? el.options[0];
    el.value = def?.value ?? "";
  } else el.value = el.defaultValue;
}
