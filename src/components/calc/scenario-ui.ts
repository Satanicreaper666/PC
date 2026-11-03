/**
 * Saved scenarios under every calculator in a CalcShell:
 * - "Save this scenario" keeps the inputs and the results shown, in this browser
 *   only (localStorage, key `pc-scenarios:<calculator id>`).
 * - Saved scenarios are index cards with Load, Rename and Delete (with Undo).
 * - Two or more ticked scenarios are compared side by side on notepaper, with
 *   differences in ₹ and %, copy as a table and CSV download.
 * - "Download CSV" exports the inputs and results on screen.
 * The arithmetic, labels and CSV text come from src/lib/calc/scenarios.ts (tested).
 */
import type { CalcResult } from "../../scripts/calc-kit";
import {
  addScenario,
  baseIndexIn,
  buildComparison,
  cleanLabel,
  compareSet,
  comparisonRows,
  csvFileName,
  diffHeader,
  figureNumber,
  findSame,
  nextLabel,
  parseFigure,
  readStore,
  removeScenario,
  renameScenario,
  restoreScenario,
  sameParams,
  SCENARIO_MAX,
  setBase,
  setCompare,
  toCsv,
  toTsv,
  writeStore,
  type Comparison,
  type Scenario,
  type ScenarioStore
} from "../../lib/calc/scenarios";

export type ScenarioHost = {
  id: string;
  root: HTMLElement;
  form: HTMLFormElement;
  resultLabel: string;
  scenarioLabel: string;
  last: () => CalcResult | null;
  fieldState: () => Record<string, string>;
  applyState: (state: Record<string, string>) => void;
  focusResults: () => void;
};

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type FieldInfo = { name: string; label: string; display: (raw: string | undefined) => string; isHidden: () => boolean };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function dateText(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : iso;
}
function todayText(d = new Date()): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function savedText(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(d);
  return `Saved ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}, ${time}`;
}

/* ---------- Reading the form: labels and display values ---------- */

function labelOf(form: HTMLFormElement, el: Field): string {
  if (el instanceof HTMLInputElement && el.type === "radio") {
    const legend = el.closest("fieldset")?.querySelector("legend");
    if (legend) return clean(legend.textContent);
  }
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    const l = el.closest("label");
    if (l) return clean(l.textContent);
  }
  if (el.id) {
    const l = form.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (l) return clean(l.textContent);
  }
  const aria = el.getAttribute("aria-label");
  if (aria) return clean(aria);
  return clean(el.closest("label")?.textContent) || el.name;
}

function formatTyped(n: number, typed: string): string {
  const decimals = Math.min(4, (typed.replace(/[₹,\s]/g, "").split(".")[1] ?? "").length);
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

function displayer(form: HTMLFormElement, el: Field): (raw: string | undefined) => string {
  if (el instanceof HTMLInputElement && el.type === "radio") {
    const opts = Array.from(form.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(el.name)}"]`));
    return (raw) => {
      const o = opts.find((x) => x.value === raw);
      return o ? clean(o.closest("label")?.textContent) || o.value : (raw ?? "");
    };
  }
  if (el instanceof HTMLInputElement && el.type === "checkbox") return (raw) => (raw === undefined ? "" : raw === "1" ? "Yes" : "No");
  if (el instanceof HTMLSelectElement)
    return (raw) => {
      const o = Array.from(el.options).find((x) => x.value === raw);
      return o ? clean(o.textContent) : (raw ?? "");
    };
  if (el instanceof HTMLInputElement && el.type === "date") return (raw) => (raw ? dateText(raw) : "");
  if (el instanceof HTMLTextAreaElement)
    return (raw) =>
      (raw ?? "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join("; ");
  const pre = el.dataset.prefix ?? "";
  const suf = el.dataset.suffix ?? "";
  return (raw) => {
    const t = (raw ?? "").trim();
    if (!t) return "";
    const n = Number(t.replace(/[₹,\s]/g, ""));
    const body = /\d/.test(t) && Number.isFinite(n) ? formatTyped(n, t) : t;
    return `${pre}${body}${suf ? (suf.startsWith("%") ? suf : ` ${suf}`) : ""}`;
  };
}

function fieldInfos(form: HTMLFormElement): FieldInfo[] {
  const seen = new Set<string>();
  const out: FieldInfo[] = [];
  for (const el of Array.from(form.querySelectorAll<Field>("[name]"))) {
    if (!el.name || seen.has(el.name)) continue;
    seen.add(el.name);
    out.push({ name: el.name, label: labelOf(form, el), display: displayer(form, el), isHidden: () => !!el.closest("[hidden]") });
  }
  return out;
}

function outputLabel(root: HTMLElement, key: string, resultLabel: string): string {
  const el = root.querySelector<HTMLElement>(`[data-out="${CSS.escape(key)}"]`);
  if (!el) return key;
  if (el.dataset.outLabel) return el.dataset.outLabel;
  const head = el.closest(".headline");
  if (head) return head.querySelector("[data-out]") === el ? resultLabel : "Summary";
  const by = el.closest("[aria-labelledby]")?.getAttribute("aria-labelledby")?.split(/\s+/)[0];
  return (by ? clean(document.getElementById(by)?.textContent) : "") || key;
}

/** What gets saved with a scenario: the results as shown. Null while the inputs are incomplete. */
function snapshot(host: ScenarioHost): Pick<Scenario, "outputs" | "lines" | "warnings"> | null {
  const r = host.last();
  if (!r || r.message) return null;
  return {
    outputs: Object.entries(r.outputs).map(([key, value]) => ({ key, label: outputLabel(host.root, key, host.resultLabel), value, ...(r.better?.[key] ? { better: r.better[key] } : {}) })),
    lines: (r.lines ?? []).map((l) => ({
      key: l.key ?? l.label,
      label: l.label,
      value: l.value,
      ...(l.note ? { note: l.note } : {}),
      ...(l.better ? { better: l.better } : {}),
      ...(l.strong ? { strong: true } : {})
    })),
    ...(r.warnings?.length ? { warnings: [...r.warnings] } : {})
  };
}

/* ---------- Files and the clipboard ---------- */

function slug(host: ScenarioHost): string {
  return location.pathname.split("/").filter(Boolean).pop() || host.id;
}

function pageTitle(host: ScenarioHost): string {
  return clean(document.querySelector("h1")?.textContent) || host.resultLabel;
}

function download(name: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

/** The inputs and results on screen, as rows for a CSV file. */
export function currentRows(host: ScenarioHost): string[][] {
  const r = host.last();
  const state = host.fieldState();
  const asAt = /^(.*\bas at)\s+(.+)$/.exec(clean(document.querySelector(".asat .when")?.textContent));
  const rows: string[][] = [
    [`${pageTitle(host)}, PeopleCraft`],
    ["Worked out on", todayText()],
    ...(asAt ? [[asAt[1], asAt[2]]] : []),
    ["Link to these numbers", location.href],
    [],
    ["Section", "Item", "Value", "Number", "Note"]
  ];
  for (const f of fieldInfos(host.form)) {
    if (f.isHidden()) continue;
    const v = f.display(state[f.name]);
    rows.push(["Input", f.label, v, figureNumber(v), ""]);
  }
  if (!r) return rows;
  if (r.message) {
    rows.push(["Check", "", r.message, "", ""]);
    return rows;
  }
  for (const [key, value] of Object.entries(r.outputs)) rows.push(["Result", outputLabel(host.root, key, host.resultLabel), value, figureNumber(value), ""]);
  for (const l of r.lines ?? []) rows.push(["Breakdown", l.label, l.value, figureNumber(l.value), l.note ?? ""]);
  for (const s of r.working ?? []) rows.push(["Working", s.label, s.result, figureNumber(s.result), [s.formula, s.note].filter(Boolean).join("; ")]);
  for (const w of r.warnings ?? []) rows.push(["Check", "", w, "", ""]);
  for (const n of r.notes ?? []) rows.push(["Note", "", n, "", ""]);
  return rows;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A plain HTML table, for pasting the comparison into an email. */
function tableHtml(title: string, rows: string[][]): string {
  const width = Math.max(...rows.map((r) => r.length));
  const cell = "border:1px solid #c9cee0;padding:4px 8px;text-align:left";
  const body = rows
    .map((r, i) => {
      if (i === 0) return `<tr>${r.map((c) => `<th style="${cell}">${esc(c)}</th>`).join("")}</tr>`;
      if (r.length === 1) return `<tr><th colspan="${width}" style="${cell};background:#f5f6fa">${esc(r[0])}</th></tr>`;
      return `<tr>${r.map((c, j) => (j === 0 ? `<th style="${cell};font-weight:normal">${esc(c)}</th>` : `<td style="${cell};text-align:right">${esc(c)}</td>`)).join("")}</tr>`;
    })
    .join("");
  return `<p><strong>${esc(title)}</strong></p><table style="border-collapse:collapse;font-family:sans-serif;font-size:13px">${body}</table>`;
}

async function copyRows(title: string, rows: string[][]): Promise<boolean> {
  const tsv = `${title}\n${toTsv(rows)}`;
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([tableHtml(title, rows)], { type: "text/html" }),
          "text/plain": new Blob([tsv], { type: "text/plain" })
        })
      ]);
      return true;
    }
  } catch {
    /* fall back to plain text */
  }
  try {
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch {
    return false;
  }
}

/** Set a live region's text so that the same message is announced again. */
function say(el: HTMLElement | null, text: string) {
  if (!el) return;
  el.textContent = "";
  window.setTimeout(() => (el.textContent = text), 60);
}

/* ---------- Saved scenarios ---------- */

export function setupScenarios(host: ScenarioHost): { refresh: () => void } | null {
  const { id, root } = host;
  const saveOpen = root.querySelector<HTMLButtonElement>("[data-save-open]");
  const saveForm = root.querySelector<HTMLFormElement>("[data-save-form]");
  const saveName = root.querySelector<HTMLInputElement>("[data-save-name]");
  const saveStatus = root.querySelector<HTMLElement>("[data-save-status]");
  const scnLink = root.querySelector<HTMLAnchorElement>("[data-scn-link]");
  const csvBtn = root.querySelector<HTMLButtonElement>("[data-calc-csv]");
  const panel = document.querySelector<HTMLElement>(`[data-scenarios-for="${CSS.escape(id)}"]`);

  // "Download CSV" works even without the panel.
  csvBtn?.addEventListener("click", () => {
    const name = csvFileName(slug(host), new Date());
    download(name, toCsv(currentRows(host)));
    say(saveStatus, `Downloaded ${name}: the inputs and results on screen.`);
  });

  if (!panel || !saveOpen || !saveForm || !saveName) return null;

  const cards = panel.querySelector<HTMLElement>("[data-cards]")!;
  const tpl = panel.querySelector<HTMLTemplateElement>("[data-card-tpl]")!;
  const scnStatus = panel.querySelector<HTMLElement>("[data-scn-status]");
  const undoBtn = panel.querySelector<HTMLButtonElement>("[data-scn-undo]");
  const hint = panel.querySelector<HTMLElement>("[data-compare-hint]");
  const cmp = panel.querySelector<HTMLElement>("[data-compare]")!;
  const cmpTable = panel.querySelector<HTMLElement>("[data-cmp-table]")!;
  const cmpBase = panel.querySelector<HTMLSelectElement>("[data-cmp-base]");
  const cmpBaseWrap = panel.querySelector<HTMLElement>("[data-cmp-base-wrap]");
  const cmpLegend = panel.querySelector<HTMLElement>("[data-cmp-legend]");
  const cmpCopy = panel.querySelector<HTMLButtonElement>("[data-cmp-copy]");
  const cmpCsv = panel.querySelector<HTMLButtonElement>("[data-cmp-csv]");
  const scnTitle = panel.querySelector<HTMLElement>("[data-scn-title]");

  const KEY = `pc-scenarios:${id}`;
  let storageOk = true;
  let store: ScenarioStore = readStore(null);
  try {
    store = readStore(localStorage.getItem(KEY));
  } catch {
    storageOk = false;
  }
  let pendingUndo: { scenario: Scenario; index: number } | null = null;
  let comparison: Comparison | null = null;

  function persist(next: ScenarioStore) {
    store = next;
    try {
      if (store.items.length) localStorage.setItem(KEY, writeStore(store));
      else localStorage.removeItem(KEY);
    } catch {
      storageOk = false;
    }
  }
  const keptNote = () => (storageOk ? "" : " This browser is not keeping saved scenarios, so they will go when you leave the page.");

  /* ----- Save ----- */
  function openSave() {
    say(saveStatus, "");
    const snap = snapshot(host);
    if (!snap) {
      say(saveStatus, `Nothing to save yet. ${host.last()?.message ?? ""}`.trim());
      return;
    }
    const same = findSame(store, host.fieldState());
    if (same) {
      say(saveStatus, `These numbers are already saved as “${same.label}”.`);
      return;
    }
    if (store.items.length >= SCENARIO_MAX) {
      say(saveStatus, `You can keep ${SCENARIO_MAX} scenarios. Delete one below to save another.`);
      return;
    }
    saveName!.value = nextLabel(host.scenarioLabel, store.items.map((s) => s.label));
    saveForm!.hidden = false;
    saveOpen!.setAttribute("aria-expanded", "true");
    saveName!.focus();
    saveName!.select();
  }
  function closeSave(focus = true) {
    saveForm!.hidden = true;
    saveOpen!.setAttribute("aria-expanded", "false");
    if (focus) saveOpen!.focus();
  }
  saveOpen.addEventListener("click", () => (saveForm.hidden ? openSave() : closeSave()));
  saveForm.querySelector("[data-save-cancel]")?.addEventListener("click", () => closeSave());
  saveForm.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeSave();
    }
  });
  saveForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const snap = snapshot(host);
    if (!snap) {
      closeSave();
      say(saveStatus, `Nothing to save yet. ${host.last()?.message ?? ""}`.trim());
      return;
    }
    const label = cleanLabel(saveName.value) || nextLabel(host.scenarioLabel, store.items.map((s) => s.label));
    const scenario: Scenario = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      label,
      savedAt: new Date().toISOString(),
      params: host.fieldState(),
      ...snap
    };
    pendingUndo = null;
    persist(addScenario(store, scenario));
    render();
    closeSave();
    const n = store.items.length;
    const ticked = compareSet(store).length;
    say(
      saveStatus,
      `Saved “${label}”. ${n === 1 ? "Change the inputs and save another to compare them side by side." : ticked >= 2 ? `${plural(ticked, "scenario")} side by side below.` : `${plural(n, "scenario")} saved.`}${keptNote()}`
    );
  });

  /* ----- Cards ----- */
  function cardFor(s: Scenario, index: number): HTMLElement {
    const li = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    li.dataset.id = s.id;
    li.style.setProperty("--i", String(index));
    const q = <T extends Element = HTMLElement>(sel: string) => li.querySelector<T>(sel)!;
    const titleId = `pc-${id}-card-${s.id}`;
    q("[data-card-title]").textContent = s.label;
    q("[data-card-title]").id = titleId;
    li.querySelectorAll("[data-card-name]").forEach((n) => (n.textContent = ` ${s.label}`));
    const main = s.outputs[0];
    q("[data-card-what]").textContent = main?.label ?? host.resultLabel;
    q("[data-card-value]").textContent = main?.value || "—";
    q("[data-card-when]").textContent = savedText(s.savedAt);
    const box = q<HTMLInputElement>("[data-card-compare]");
    box.checked = s.compare !== false;
    box.addEventListener("change", () => {
      persist(setCompare(store, s.id, box.checked));
      renderCompare();
      const t = compareSet(store).length;
      say(scnStatus, `${box.checked ? "Added" : "Took"} “${s.label}” ${box.checked ? "to" : "out of"} the comparison. ${t >= 2 ? `Comparing ${plural(t, "scenario")}.` : "Tick at least two to compare."}`);
    });
    q("[data-card-load]").addEventListener("click", () => {
      pendingUndo = null;
      host.applyState(s.params);
      say(saveStatus, `Loaded “${s.label}” into the calculator.`);
      host.focusResults();
    });
    const renameForm = q<HTMLFormElement>("[data-card-rename]");
    const renameInput = q<HTMLInputElement>("[data-rename-input]");
    const renameLabel = q<HTMLLabelElement>("[data-rename-label]");
    renameInput.id = `${titleId}-name`;
    renameLabel.htmlFor = renameInput.id;
    renameLabel.textContent = `New name for ${s.label}`;
    const renameOpen = q<HTMLButtonElement>("[data-card-rename-open]");
    const closeRename = () => {
      renameForm.hidden = true;
      renameOpen.setAttribute("aria-expanded", "false");
      renameOpen.focus();
    };
    renameOpen.addEventListener("click", () => {
      renameForm.hidden = false;
      renameOpen.setAttribute("aria-expanded", "true");
      renameInput.value = s.label;
      renameInput.focus();
      renameInput.select();
    });
    renameForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const label = cleanLabel(renameInput.value);
      if (!label || label === s.label) return closeRename();
      pendingUndo = null;
      persist(renameScenario(store, s.id, label));
      render();
      cards.querySelector<HTMLElement>(`[data-id="${CSS.escape(s.id)}"] [data-card-rename-open]`)?.focus();
      say(scnStatus, `Renamed “${s.label}” to “${label}”.`);
    });
    renameForm.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRename();
      }
    });
    q("[data-rename-cancel]").addEventListener("click", closeRename);
    q("[data-card-delete]").addEventListener("click", () => {
      const r = removeScenario(store, s.id);
      if (!r.removed) return;
      pendingUndo = { scenario: r.removed, index: r.index };
      persist(r.store);
      render();
      const next = cards.children[Math.min(r.index, cards.children.length - 1)] as HTMLElement | undefined;
      (next?.querySelector<HTMLElement>("[data-card-load]") ?? undoBtn)?.focus();
      say(scnStatus, `Deleted “${s.label}”. Undo puts it back.`);
    });
    return li;
  }

  undoBtn?.addEventListener("click", () => {
    if (!pendingUndo) return;
    const { scenario, index } = pendingUndo;
    pendingUndo = null;
    persist(restoreScenario(store, scenario, index));
    render();
    cards.querySelector<HTMLElement>(`[data-id="${CSS.escape(scenario.id)}"] [data-card-load]`)?.focus();
    say(scnStatus, `Put back “${scenario.label}”.`);
  });

  /* ----- Compare ----- */
  function renderCompare() {
    const set = compareSet(store);
    if (set.length < 2) {
      comparison = null;
      cmp.hidden = true;
      if (hint) {
        hint.hidden = store.items.length === 0;
        hint.textContent =
          store.items.length < 2 ? "Change the inputs and save another scenario to compare them side by side." : "Tick Compare on at least two scenarios to see them side by side.";
      }
      return;
    }
    if (hint) hint.hidden = true;
    cmp.hidden = false;
    const base = baseIndexIn(set, store.base);
    const infos = fieldInfos(host.form);
    const c = buildComparison(
      set,
      base,
      infos.map((f) => ({ key: f.name, label: f.label, values: set.map((s) => (f.name in s.params ? f.display(s.params[f.name]) : "")) }))
    );
    comparison = c;

    if (cmpBase && cmpBaseWrap) {
      cmpBase.replaceChildren(...set.map((s, i) => Object.assign(document.createElement("option"), { value: s.id, textContent: s.label, selected: i === base })));
    }

    const table = document.createElement("table");
    table.className = "cmp";
    const cap = document.createElement("caption");
    cap.className = "visually-hidden";
    cap.textContent = `Saved scenarios side by side, with the difference from ${c.columns[c.base]}`;
    table.append(cap);
    const thead = table.createTHead();
    const hr = thead.insertRow();
    const corner = document.createElement("th");
    corner.scope = "col";
    corner.className = "corner";
    corner.append(Object.assign(document.createElement("span"), { className: "visually-hidden", textContent: "Item" }));
    hr.append(corner);
    c.columns.forEach((label, i) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "sc";
      th.append(Object.assign(document.createElement("span"), { className: "sc-name", textContent: label }));
      if (i === c.base && c.diffColumns.length) th.append(Object.assign(document.createElement("span"), { className: "sub", textContent: "the base" }));
      hr.append(th);
    });
    for (const j of c.diffColumns) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "dc";
      th.append(Object.assign(document.createElement("span"), { className: "sc-name", textContent: diffHeader(c, j) }));
      th.append(Object.assign(document.createElement("span"), { className: "sub", textContent: `${c.columns[j]} − ${c.columns[c.base]}` }));
      hr.append(th);
    }
    const width = 1 + c.columns.length + c.diffColumns.length;
    let anyPp = false;
    // Sentences ("Summary") read better as a short list under the table than squeezed into columns.
    const words = c.sections.flatMap((s) => s.rows.filter((r) => r.long));
    for (const s of c.sections.map((x) => ({ ...x, rows: x.rows.filter((r) => !r.long) })).filter((x) => x.rows.length || x.note)) {
      const tb = table.createTBody();
      tb.className = `sec-${s.id}`;
      const sr = tb.insertRow();
      sr.className = "sec";
      const sh = document.createElement("th");
      sh.scope = "rowgroup";
      sh.colSpan = width;
      sh.textContent = s.title;
      sr.append(sh);
      for (const r of s.rows) {
        const tr = tb.insertRow();
        if (r.strong) tr.classList.add("strong");
        if (r.long) tr.classList.add("long");
        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = r.label;
        tr.append(th);
        for (const cell of r.cells) {
          const td = document.createElement("td");
          if (cell.best) {
            td.className = "best";
            td.append(Object.assign(document.createElement("span"), { className: "hl hl-green", textContent: cell.text }));
            td.append(Object.assign(document.createElement("span"), { className: "visually-hidden", textContent: r.better === "lower" ? " (lowest: better)" : " (highest: better)" }));
          } else td.textContent = cell.text;
          // Words and dates may wrap; amounts stay whole.
          const fig = parseFigure(cell.text);
          if (cell.text.length > 14 && (!fig || fig.kind === "date")) td.classList.add("txt");
          tr.append(td);
        }
        for (const d of r.diffs) {
          const td = document.createElement("td");
          td.className = "diff";
          if (!d) td.append(Object.assign(document.createElement("span"), { className: "none", textContent: "" }));
          else {
            if (d.kind === "pct" && d.text !== "Same") anyPp = true;
            td.append(Object.assign(document.createElement("span"), { className: d.n === 0 ? "same" : "d", textContent: d.text }));
            if (d.pct) td.append(" ", Object.assign(document.createElement("span"), { className: "p", textContent: d.pct }));
          }
          tr.append(td);
        }
      }
      if (s.note) {
        const nr = tb.insertRow();
        nr.className = "sec-note";
        const td = nr.insertCell();
        td.colSpan = width;
        td.textContent = s.note;
      }
    }
    const scroll = document.createElement("div");
    scroll.className = "cmp-scroll";
    scroll.tabIndex = 0;
    scroll.setAttribute("role", "region");
    scroll.setAttribute("aria-label", "Comparison table; scroll sideways for more columns");
    scroll.append(table);
    const extra: HTMLElement[] = words.map((r) => {
      const box = document.createElement("div");
      box.className = "cmp-words";
      box.append(Object.assign(document.createElement("p"), { className: "cmp-words-title", textContent: r.label }));
      const ul = document.createElement("ul");
      r.cells.forEach((cell, i) => {
        const li = document.createElement("li");
        li.append(Object.assign(document.createElement("strong"), { textContent: `${c.columns[i]}: ` }), document.createTextNode(cell.text));
        ul.append(li);
      });
      box.append(ul);
      return box;
    });
    cmpTable.replaceChildren(scroll, ...extra);

    if (cmpLegend) {
      const marked = c.sections.flatMap((s) => s.rows.filter((r) => r.cells.some((x) => x.best)));
      const parts: string[] = [];
      if (marked.length) {
        const what = [...new Set(marked.map((r) => `the ${r.better === "lower" ? "lower" : "higher"} ${r.label.charAt(0).toLowerCase()}${r.label.slice(1)}`))].join("; ");
        parts.push(`Green highlight: ${what}.`);
      }
      parts.push(`Each difference is a scenario minus “${c.columns[c.base]}”${anyPp ? "; pp means percentage points" : ""}.`);
      cmpLegend.textContent = parts.join(" ");
    }
  }

  cmpBase?.addEventListener("change", () => {
    persist(setBase(store, cmpBase.value));
    renderCompare();
    const s = store.items.find((x) => x.id === cmpBase.value);
    say(scnStatus, `Differences are now against “${s?.label ?? ""}”.`);
  });

  const compareTitle = () => `${pageTitle(host)}: ${comparison?.columns.join(" vs ") ?? ""}`;
  cmpCopy?.addEventListener("click", async () => {
    if (!comparison) return;
    const ok = await copyRows(compareTitle(), comparisonRows(comparison));
    say(scnStatus, ok ? "Copied the table. Paste it into an email or a spreadsheet." : "Copying is blocked in this browser. Use Download CSV instead.");
  });
  cmpCsv?.addEventListener("click", () => {
    if (!comparison) return;
    const name = csvFileName(slug(host), new Date(), "compare");
    const rows = [[compareTitle()], ["Worked out on", todayText()], [], ...comparisonRows(comparison, { forCsv: true })];
    download(name, toCsv(rows));
    say(scnStatus, `Downloaded ${name}.`);
  });

  /* ----- Render ----- */
  function render() {
    const n = store.items.length;
    panel!.hidden = n === 0 && !pendingUndo;
    if (undoBtn) undoBtn.hidden = !pendingUndo;
    if (scnTitle) scnTitle.textContent = n ? `Saved scenarios (${n})` : "Saved scenarios";
    cards.replaceChildren(...store.items.map((s, i) => cardFor(s, i)));
    cards.hidden = n === 0;
    renderCompare();
    refresh();
  }

  /** Cheap updates after every recalculation: which card matches the inputs now, and the link to the panel. */
  function refresh() {
    const state = host.fieldState();
    cards.querySelectorAll<HTMLElement>("[data-id]").forEach((li) => {
      const s = store.items.find((x) => x.id === li.dataset.id);
      const now = !!s && sameParams(s.params, state);
      li.classList.toggle("is-now", now);
      const tag = li.querySelector<HTMLElement>("[data-card-now]");
      if (tag) tag.hidden = !now;
    });
    if (scnLink) {
      const n = store.items.length;
      scnLink.hidden = n === 0;
      const t = scnLink.querySelector("[data-scn-link-text]");
      if (t) t.textContent = compareSet(store).length >= 2 ? `See ${plural(n, "saved scenario")} side by side` : `See ${n === 1 ? "your saved scenario" : `${plural(n, "saved scenario")}`}`;
    }
  }

  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    store = readStore(e.newValue);
    pendingUndo = null;
    render();
  });

  render();
  return { refresh };
}
