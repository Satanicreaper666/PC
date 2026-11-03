/**
 * Checklists: tick items off, see each section's progress, and, when the reader
 * asks, give each item an owner and a due date. Overdue items get a pink
 * highlighter (a deadline at risk). Download as CSV or print with ticks and owners.
 *
 * Storage:
 * - "pc_cl_<id>": the ticks, one true/false per item in order (unchanged from the first version);
 * - "pc-cl-plan-<id>": owners and due dates, keyed by section and item text so they
 *   stay with the right item if the list is edited.
 */
import { downloadCsv, fileStem } from "./csv.ts";
import { isoDate, readJson, writeJson } from "./store.ts";

type PlanEntry = { o?: string; d?: string };
type Plan = { show?: boolean; items: Record<string, PlanEntry> };
type Item = {
  i: number;
  box: HTMLInputElement;
  li: HTMLLIElement;
  text: string;
  section: number;
  key: string;
  /** "HR", "Manager", "IT": who the list suggests, used as the owner box's hint. */
  hint: string;
  meta: HTMLElement;
  owner?: HTMLInputElement;
  due?: HTMLInputElement;
  odTag?: HTMLElement;
};

const PEN_TICK =
  '<svg class="pen pen-tick" viewBox="0 0 24 24" aria-hidden="true"><path class="pen-stroke" d="M3.5 13.2c1.6 1.2 3.2 3 4.6 5.3.3.5.9.5 1.2 0C11.9 13 15.6 8.1 20.8 4.2"/></svg>';

const root = document.querySelector<HTMLElement>("[data-checklist]");
if (root) init(root);

function init(root: HTMLElement) {
  const id = root.dataset.checklist!;
  const title = root.dataset.title ?? "Checklist";
  const tickKey = `pc_cl_${id}`;
  const planKey = `pc-cl-plan-${id}`;
  const body = root.querySelector<HTMLElement>("[data-cl-body]")!;
  const count = root.querySelector<HTMLElement>("[data-cl-count]")!;
  const bar = root.querySelector<HTMLElement>("[data-cl-bar]")!;
  const status = root.querySelector<HTMLElement>("[data-cl-status]")!;
  const planBtn = root.querySelector<HTMLButtonElement>("[data-cl-plan]")!;
  const printHead = root.querySelector<HTMLElement>("[data-cl-print-head]")!;
  const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const showDate = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? iso : shortDate.format(d);
  };

  const ticks = readJson<boolean[]>(tickKey) ?? [];
  const raw = readJson<Plan>(planKey);
  const plan: Plan = { show: !!raw?.show, items: raw && typeof raw.items === "object" ? raw.items : {} };

  /* ---------- Sections and items ---------- */
  const headings = Array.from(body.querySelectorAll<HTMLElement>("h2"));
  const sectionNames = headings.map((h) => (h.textContent ?? "").trim());
  const items: Item[] = [];
  let section = -1;
  for (const el of Array.from(body.querySelectorAll<HTMLElement>("h2, li"))) {
    if (el.tagName === "H2") {
      section = headings.indexOf(el);
      continue;
    }
    const box = el.querySelector<HTMLInputElement>(':scope > input[type="checkbox"]');
    if (!box) continue;
    const i = items.length;
    box.disabled = false;
    box.checked = !!ticks[i];
    el.classList.add("task");
    // The whole line is the checkbox's label, for a bigger target.
    const label = document.createElement("label");
    label.className = "task-main";
    const tx = document.createElement("span");
    tx.className = "tx";
    tx.id = `cl-tx-${i}`;
    while (el.firstChild) {
      const n = el.firstChild;
      if (n === box) label.appendChild(n);
      else tx.appendChild(n);
    }
    label.appendChild(tx);
    const meta = document.createElement("p");
    meta.className = "task-meta";
    el.append(label, meta);
    const text = (tx.textContent ?? "").replace(/\s+/g, " ").trim();
    const sec = Math.max(0, section);
    items.push({
      i,
      box,
      li: el as HTMLLIElement,
      text,
      section: sec,
      key: `${sectionNames[sec] ?? ""}|${text}`.slice(0, 240),
      hint: text.match(/\(([^()]{1,40})\)\s*$/)?.[1] ?? "",
      meta
    });
  }

  // Each section heading gets its own progress: a short bar, "3 of 9", and a pen tick when done.
  const secProg = headings.map((h) => {
    const s = document.createElement("span");
    s.className = "sec-prog";
    s.innerHTML = `<span class="sec-bar" aria-hidden="true"><i></i></span>${PEN_TICK}<span class="sec-num"></span>`;
    h.appendChild(s);
    return s;
  });

  /* ---------- Owners and due dates ---------- */
  const entry = (it: Item): PlanEntry => plan.items[it.key] ?? {};
  const isOverdue = (it: Item, today: string) => {
    const d = entry(it).d;
    return !!d && d < today && !it.box.checked;
  };

  function buildInputs(it: Item) {
    if (it.owner) return;
    const wrap = document.createElement("div");
    wrap.className = "task-plan";
    const mk = (labelText: string, type: string, value: string, placeholder?: string) => {
      const l = document.createElement("label");
      l.className = "mini";
      const span = document.createElement("span");
      span.textContent = labelText;
      const input = document.createElement("input");
      input.type = type;
      input.className = "control";
      input.value = value;
      input.autocomplete = "off";
      input.setAttribute("aria-describedby", `cl-tx-${it.i}`);
      if (placeholder) input.placeholder = placeholder;
      l.append(span, input);
      wrap.append(l);
      return input;
    };
    it.owner = mk("Owner", "text", entry(it).o ?? "", it.hint ? `e.g. ${it.hint}` : "Name");
    it.due = mk("Due", "date", entry(it).d ?? "");
    it.odTag = document.createElement("mark");
    it.odTag.className = "hl hl-pink od-tag";
    it.odTag.textContent = "Overdue";
    it.odTag.hidden = true;
    wrap.append(it.odTag);
    it.li.insertBefore(wrap, it.meta);
    const save = () => {
      const o = it.owner!.value.trim();
      const d = it.due!.value;
      if (o || d) plan.items[it.key] = { ...(o ? { o } : {}), ...(d ? { d } : {}) };
      else delete plan.items[it.key];
      savePlan();
      render();
    };
    it.owner.addEventListener("input", save);
    it.due.addEventListener("input", save);
    it.due.addEventListener("change", save);
  }

  const hasPlan = () => Object.keys(plan.items).length > 0;
  function savePlan() {
    if (!writeJson(planKey, plan)) status.textContent = "Owners and dates couldn't be saved: this browser's storage is full or turned off.";
  }

  function setPlanning(on: boolean, announce = true) {
    plan.show = on;
    if (on) items.forEach(buildInputs);
    root.classList.toggle("planning", on);
    savePlan();
    render();
    if (announce)
      status.textContent = on
        ? "Each item now has an owner box and a due date. They save as you type."
        : hasPlan()
          ? "Owner and date boxes hidden. Owners and dates still show under each item."
          : "Owner and date boxes hidden.";
  }

  planBtn.addEventListener("click", () => setPlanning(!plan.show));

  /* ---------- Render ---------- */
  function render() {
    const today = isoDate();
    const done = items.filter((it) => it.box.checked).length;
    let overdue = 0;
    for (const it of items) {
      const e = entry(it);
      const od = isOverdue(it, today);
      if (od) overdue++;
      it.li.classList.toggle("overdue", od);
      if (it.odTag) it.odTag.hidden = !od;
      // The read-only line: shown when the boxes are hidden, and always on paper.
      const parts: Node[] = [];
      if (e.o) parts.push(document.createTextNode(`Owner: ${e.o}`));
      if (e.d) {
        if (parts.length) parts.push(document.createTextNode(" · "));
        if (od) {
          const m = document.createElement("mark");
          m.className = "hl hl-pink";
          m.textContent = `Overdue: due ${showDate(e.d)}`;
          parts.push(m);
        } else parts.push(document.createTextNode(`Due ${showDate(e.d)}`));
      }
      it.meta.replaceChildren(...parts);
    }
    const label = plan.show ? "Hide owners and dates" : hasPlan() ? "Edit owners and dates" : "Add owners and dates";
    planBtn.querySelector("[data-label]")!.textContent = label;

    count.replaceChildren(`${done} of ${items.length} done`);
    if (overdue) {
      const m = document.createElement("mark");
      m.className = "hl hl-pink";
      m.textContent = `${overdue} overdue`;
      count.append(" · ", m);
    }
    bar.style.width = `${items.length ? (done / items.length) * 100 : 0}%`;
    secProg.forEach((s, si) => {
      const inSec = items.filter((it) => it.section === si);
      const d = inSec.filter((it) => it.box.checked).length;
      s.hidden = !inSec.length;
      s.classList.toggle("complete", inSec.length > 0 && d === inSec.length);
      (s.querySelector(".sec-bar i") as HTMLElement).style.width = `${inSec.length ? (d / inSec.length) * 100 : 0}%`;
      s.querySelector(".sec-num")!.textContent = `${d} of ${inSec.length}${d === inSec.length && inSec.length ? " done" : ""}`;
    });
    printHead.textContent = `${title}. Printed ${longDate.format(new Date())}: ${done} of ${items.length} done${overdue ? `, ${overdue} overdue` : ""}.`;
  }

  body.addEventListener("change", (e) => {
    if (!(e.target as HTMLElement).matches('input[type="checkbox"]')) return;
    try {
      localStorage.setItem(tickKey, JSON.stringify(items.map((it) => it.box.checked)));
    } catch {
      status.textContent = "Ticks couldn't be saved: this browser's storage is full or turned off.";
    }
    render();
  });

  root.querySelector("[data-cl-reset]")?.addEventListener("click", () => {
    items.forEach((it) => (it.box.checked = false));
    try {
      localStorage.setItem(tickKey, JSON.stringify(items.map(() => false)));
    } catch {
      /* nothing saved, nothing to clear */
    }
    render();
    status.textContent = hasPlan() ? "All items unticked. Owners and dates are kept." : "All items unticked.";
  });

  root.querySelector("[data-cl-csv]")?.addEventListener("click", () => {
    const rows: string[][] = [["Item", "Section", "Done", "Owner", "Due date"]];
    for (const it of items) {
      const e = entry(it);
      rows.push([it.text, sectionNames[it.section] ?? "", it.box.checked ? "Yes" : "No", e.o ?? "", e.d ?? ""]);
    }
    downloadCsv(`${fileStem(title)}-${isoDate()}.csv`, rows);
    status.textContent = `Downloaded ${items.length} items as a CSV file, for Excel or Google Sheets.`;
  });

  window.addEventListener("beforeprint", render);
  window.addEventListener("storage", (e) => {
    if (e.key !== planKey && e.key !== tickKey) return;
    const t = readJson<boolean[]>(tickKey) ?? [];
    items.forEach((it) => (it.box.checked = !!t[it.i]));
    const p = readJson<Plan>(planKey);
    plan.items = p?.items ?? {};
    for (const it of items) {
      if (it.owner) it.owner.value = entry(it).o ?? "";
      if (it.due) it.due.value = entry(it).d ?? "";
    }
    render();
  });

  if (plan.show) setPlanning(true, false);
  render();
}
