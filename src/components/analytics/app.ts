/**
 * People analytics: the page behaviour. Three steps (load → check columns →
 * dashboard), one filter row that scopes every figure, KPI tiles, six charts
 * with table twins, data checks, CSV export, print, and an opt-in copy in
 * localStorage. All figures come from src/lib/analytics (tested separately).
 *
 * Text from the file (headers, names, departments) is only ever inserted with
 * textContent, never as HTML.
 */
import { monthEnd, monthOf, parseDate, today as todayNum } from "../../lib/analytics/dates.ts";
import { summaryCsv, summaryFileName, templateCsv } from "../../lib/analytics/export.ts";
import {
  cellText, classifyGender, detectColumns, FIELDS, findHeaderRow, GENDER_LABEL, parseMoney, type Cell, type ColumnMap, type FieldKey, type Gender
} from "../../lib/analytics/fields.ts";
import { dateLabel, dec1, int, money, moneyTick, monthLabel, num1, pct, people as peopleText, plural } from "../../lib/analytics/format.ts";
import {
  computeDashboard, customPeriod, dataRange, filterValues, MAX_MONTHS, MIN_PAY_GROUP, NO_FILTERS, periodPresets, type Dashboard, type Filters, type Period
} from "../../lib/analytics/metrics.ts";
import { affected, checkSummary, runChecks, type Check, type CheckStatus } from "../../lib/analytics/quality.ts";
import { buildEmployees, statusValues, type Employee, type RawTable, type ReadOptions, type StatusChoice } from "../../lib/analytics/records.ts";
import { sampleTable } from "../../lib/analytics/sample.ts";
import { ColumnChart, HBarChart, LineChart, RangeChart, type Tip } from "./charts.ts";
import { bestSheet, LoadError, readEmployeeFile, type Sheet } from "./load.ts";

const C1 = "var(--c1)";
const C2 = "var(--c2)";
const C3 = "var(--c3)";
const NOT_STATED = "var(--line-strong)";
/** One hue, light to dark (validated as an ordinal ramp against the white surface). */
const ORDINAL = ["var(--neel-300)", "var(--neel-400)", "var(--neel-500)", "var(--neel-600)", "var(--neel-800)", "var(--neel-950)"];
const STORE_KEY = "peoplecraft-analytics-v1";

type Step = "load" | "map" | "dash";
type SavedSession = { v: 1; savedAt: number; fileName: string; sheetName: string; rows: Cell[][]; map: ColumnMap; opts: ReadOptions };

/* ---------- Small DOM helpers ---------- */

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: { class?: string; text?: string; attrs?: Record<string, string> } = {}, ...kids: (Node | string)[]) {
  const e = document.createElement(tag);
  if (props.class) e.className = props.class;
  if (props.text !== undefined) e.textContent = props.text;
  for (const [k, v] of Object.entries(props.attrs ?? {})) e.setAttribute(k, v);
  e.append(...kids);
  return e;
}
type IconName = "alert" | "x-circle" | "info" | "check-circle" | "chevron-down";
/** Icons come from <template data-icon> elements the component renders with the site's Icon set. */
function icon(name: IconName, size = 16): Node {
  const t = document.querySelector<HTMLTemplateElement>(`template[data-icon="${name}"]`);
  const svg = t?.content.firstElementChild?.cloneNode(true) as SVGSVGElement | undefined;
  if (!svg) return document.createTextNode("");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  return svg;
}
function table(caption: string, head: string[], rows: (string | number)[][], numeric: number[] = []): HTMLTableElement {
  const t = el("table");
  t.append(el("caption", { text: caption }));
  const thead = el("thead");
  const hr = el("tr");
  head.forEach((h, i) => hr.append(el("th", { text: h, class: numeric.includes(i) ? "num" : "", attrs: { scope: "col" } })));
  thead.append(hr);
  const tbody = el("tbody");
  for (const r of rows) {
    const tr = el("tr");
    r.forEach((v, i) => {
      const cell = i === 0 ? el("th", { text: String(v), attrs: { scope: "row" } }) : el("td", { text: String(v) });
      if (numeric.includes(i)) cell.className = "num";
      tr.append(cell);
    });
    tbody.append(tr);
  }
  t.append(thead, tbody);
  return t;
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = el("a", { attrs: { href: url, download: name } });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const colLetter = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : colLetter(Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));
const avgText = num1;
/** Rows under the header row (title rows above it don't count). */
const dataRows = (rows: Cell[][]) => Math.max(0, rows.length - findHeaderRow(rows) - 1);

/* ---------- The app ---------- */

export function mountPeopleAnalytics(root: HTMLElement) {
  const q = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const steps: Record<Step, HTMLElement> = { load: q("[data-step=load]"), map: q("[data-step=map]"), dash: q("[data-step=dash]") };
  const live = q("[data-announce]");
  const fileInput = q<HTMLInputElement>("[data-file]");
  const drop = q("[data-drop]");
  const loadError = q("[data-load-error]");
  const busy = q("[data-busy]");

  const state = {
    source: null as { kind: "file" | "sample"; name: string } | null,
    sheets: [] as Sheet[],
    sheetIndex: 0,
    table: null as RawTable | null,
    map: {} as ColumnMap,
    opts: { dateOrder: "dmy", salaryPeriod: "annual", statusMap: {} } as ReadOptions,
    dateAmbiguous: false,
    people: [] as Employee[],
    checks: [] as Check[],
    filters: { ...NO_FILTERS } as Filters,
    periodId: "l12",
    customFrom: 0,
    customTo: 0,
    payBy: "dept" as "dept" | "grade",
    today: todayNum(),
    last: null as Dashboard | null
  };

  const announce = (msg: string) => {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = msg));
  };
  function showStep(step: Step, focus = true) {
    (Object.keys(steps) as Step[]).forEach((s) => (steps[s].hidden = s !== step));
    if (focus) {
      const h = steps[step].querySelector<HTMLElement>(".pa-h");
      h?.focus({ preventScroll: true });
      steps[step].scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  /* ===== Step 1: load ===== */

  const showLoadError = (msg: string) => {
    loadError.textContent = msg;
    loadError.hidden = !msg;
  };
  async function handleFile(file: File | undefined) {
    if (!file) return;
    showLoadError("");
    busy.hidden = false;
    try {
      const loaded = await readEmployeeFile(file);
      state.source = { kind: "file", name: loaded.fileName };
      state.sheets = loaded.sheets;
      prepareSheet(bestSheet(loaded.sheets));
      if (!state.table || !state.table.rows.length) throw new LoadError("The file has a header row but no rows of people under it.");
      renderMapping();
      showStep("map");
      announce(`Read ${file.name}: ${plural(state.table.rows.length, "row", "rows")}. Check the columns.`);
    } catch (e) {
      if (!(e instanceof LoadError)) console.error(e);
      showLoadError(e instanceof LoadError ? e.message : "This file couldn't be read. Check that it is a CSV or Excel file with a header row and one row per person, then try again.");
    } finally {
      busy.hidden = true;
    }
  }

  q("[data-pick]").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    void handleFile(fileInput.files?.[0]);
    fileInput.value = "";
  });
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("is-over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("is-over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("is-over");
    void handleFile(e.dataTransfer?.files?.[0]);
  });
  q("[data-sample]").addEventListener("click", () => {
    const s = sampleTable(state.today);
    state.source = { kind: "sample", name: "Sample data" };
    state.sheets = [{ name: "", rows: [s.headers, ...s.rows] }];
    prepareSheet(0);
    buildDataset();
    showDashboard();
    announce("Sample data loaded. The dashboard shows a made-up company of about 120 people.");
  });
  q("[data-template]").addEventListener("click", () => download("people-analytics-template.csv", "﻿" + templateCsv()));

  function prepareSheet(i: number) {
    state.sheetIndex = i;
    const rows = state.sheets[i]?.rows ?? [];
    const h = findHeaderRow(rows);
    const body = rows.slice(h + 1);
    const width = Math.max(rows[h]?.length ?? 0, ...body.slice(0, 50).map((r) => r.length));
    const headers = Array.from({ length: width }, (_, j) => cellText(rows[h]?.[j] ?? null) || `Column ${colLetter(j)}`);
    state.table = { headers, rows: body, firstRow: h + 2 };
    const det = detectColumns(headers, body);
    state.map = det.map;
    state.opts = { dateOrder: det.dateOrder, salaryPeriod: det.salaryPeriod, statusMap: {} };
    state.dateAmbiguous = det.dateAmbiguous;
  }

  /* ----- Saved session (opt-in) ----- */

  function readSaved(): SavedSession | null {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as SavedSession;
      if (s?.v !== 1 || !Array.isArray(s.rows) || typeof s.map !== "object" || !s.opts) throw new Error("bad");
      return s;
    } catch {
      localStorage.removeItem(STORE_KEY);
      return null;
    }
  }
  function renderSaved() {
    const s = readSaved();
    const box = q("[data-saved]");
    box.hidden = !s;
    if (!s) return;
    const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(s.savedAt));
    q("[data-saved-text]").textContent = `${s.fileName} (${plural(dataRows(s.rows), "row", "rows")}), kept since ${when}.`;
  }
  q("[data-saved-open]").addEventListener("click", () => {
    const s = readSaved();
    if (!s) return renderSaved();
    state.source = { kind: "file", name: s.fileName };
    state.sheets = [{ name: s.sheetName, rows: s.rows }];
    prepareSheet(0);
    state.map = s.map;
    state.opts = s.opts;
    buildDataset();
    showDashboard();
    keepBox.checked = true;
    announce(`Opened ${s.fileName} from this browser.`);
  });
  q("[data-saved-delete]").addEventListener("click", () => {
    localStorage.removeItem(STORE_KEY);
    renderSaved();
    keepBox.checked = false;
    announce("Deleted the data kept in this browser.");
  });
  const keepBox = q<HTMLInputElement>("[data-keep]");
  const keepNote = q(".pa-keep-note");
  function saveSession(): boolean {
    if (state.source?.kind !== "file") return false;
    const sheet = state.sheets[state.sheetIndex];
    const s: SavedSession = { v: 1, savedAt: Date.now(), fileName: state.source.name, sheetName: sheet.name, rows: sheet.rows, map: state.map, opts: state.opts };
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
      return true;
    } catch {
      return false;
    }
  }
  keepBox.addEventListener("change", () => {
    if (keepBox.checked) {
      if (saveSession()) {
        keepNote.textContent = "(on this device only, until you untick this)";
        announce("Kept in this browser. Untick the box to delete it.");
      } else {
        keepBox.checked = false;
        keepNote.textContent = "This file is too large to keep in the browser, so it will be gone when you close the page.";
        announce(keepNote.textContent);
      }
    } else {
      localStorage.removeItem(STORE_KEY);
      announce("Deleted the data kept in this browser.");
    }
  });

  /* ===== Step 2: check the columns ===== */

  const mapRows = q("[data-map-rows]");
  const mapError = q("[data-map-error]");
  const dateOrderSel = q<HTMLSelectElement>("[data-dateorder]");
  const salaryUnitSel = q<HTMLSelectElement>("[data-salaryunit]");
  const sheetSel = q<HTMLSelectElement>("[data-sheet]");

  function columnValues(key: FieldKey, limit = 400): Cell[] {
    const i = state.map[key];
    if (i === undefined || !state.table) return [];
    return state.table.rows.slice(0, limit).map((r) => r[i] ?? null);
  }
  function examples(key: FieldKey): { text: string; bad: boolean } {
    const i = state.map[key];
    if (i === undefined) return { text: key === "doj" ? "Choose the column with joining dates." : "Not used.", bad: key === "doj" };
    const all = columnValues(key);
    const filled = all.filter((v) => cellText(v) !== "");
    if (!filled.length) return { text: "This column is empty.", bad: key === "doj" };
    const distinct = [...new Map(filled.map((v) => [cellText(v), v])).values()].slice(0, 3);
    const def = FIELDS.find((f) => f.key === key)!;
    let bad = false;
    let suffix = "";
    const shown = distinct.map((v) => {
      const raw = cellText(v);
      if (def.kind === "date") {
        const d = parseDate(v, state.opts.dateOrder);
        return d === null ? `${raw} (not a date)` : `${raw} (${dateLabel(d)})`;
      }
      if (def.kind === "money") {
        const m = parseMoney(v);
        return m === null ? `${raw} (not a number)` : `${raw} (${money(m)})`;
      }
      if (key === "gender") return `${raw} (${GENDER_LABEL[classifyGender(v).gender]})`;
      return raw;
    });
    if (def.kind === "date") {
      const ok = filled.filter((v) => parseDate(v, state.opts.dateOrder) !== null).length / filled.length;
      if (ok < 1) suffix = ` ${Math.round(ok * 100)}% read as dates.`;
      bad = ok < 0.5;
    }
    return { text: shown.join(" · ") + suffix, bad };
  }

  function renderMapping() {
    const t = state.table!;
    const matched = FIELDS.filter((f) => state.map[f.key] !== undefined).length;
    const sheet = state.sheets[state.sheetIndex];
    q("[data-map-summary]").textContent =
      `${state.source?.name ?? "Your file"}${sheet?.name ? `, sheet “${sheet.name}”` : ""}: ${plural(t.rows.length, "row", "rows")} under a header row with ${plural(t.headers.length, "column", "columns")}. ` +
      `${matched} of ${FIELDS.length} fields were matched by their headings. Check each one and change any that are wrong.`;

    q("[data-sheet-wrap]").hidden = state.sheets.length < 2;
    sheetSel.replaceChildren(...state.sheets.map((s, i) => el("option", { text: `${s.name || `Sheet ${i + 1}`} (${plural(dataRows(s.rows), "row", "rows")})`, attrs: { value: String(i) } })));
    sheetSel.value = String(state.sheetIndex);

    mapRows.replaceChildren(
      ...FIELDS.map((f) => {
        const id = `pa-map-${f.key}`;
        const label = el("label", { text: f.label, attrs: { for: id } });
        if (f.required) label.append(el("span", { class: "pa-req", text: "Required" }));
        const select = el("select", { class: "control", attrs: { id, "data-field": f.key, "aria-describedby": `${id}-use ${id}-ex` } }) as HTMLSelectElement;
        select.append(el("option", { text: "Not in my file", attrs: { value: "" } }), ...t.headers.map((h, j) => el("option", { text: `${colLetter(j)}: ${h}`, attrs: { value: String(j) } })));
        select.value = state.map[f.key] === undefined ? "" : String(state.map[f.key]);
        const ex = examples(f.key);
        const exEl = el("p", { class: `pa-map-ex${ex.bad ? " is-bad" : ""}`, text: ex.text, attrs: { id: `${id}-ex` } });
        return el("div", { class: "pa-map-row" }, el("div", { class: "pa-map-field" }, label, el("span", { class: "pa-map-use", text: f.use, attrs: { id: `${id}-use` } })), select, exEl);
      })
    );
    dateOrderSel.value = state.opts.dateOrder;
    q("[data-dateorder-help]").textContent = state.dateAmbiguous
      ? "Your file has dates like 03/04/2025 that could be read either way. Check the examples above show the right month."
      : "Dates written as 2025-04-03 or 3-Apr-2025 are read correctly either way.";
    q("[data-salaryunit-wrap]").hidden = state.map.salary === undefined;
    salaryUnitSel.value = state.opts.salaryPeriod;
    renderStatusChoices();
    mapError.hidden = true;
  }

  function renderStatusChoices() {
    const wrap = q("[data-status-wrap]");
    const values = state.table ? statusValues(state.table, state.map) : [];
    wrap.hidden = !values.length;
    const rowsEl = q("[data-status-rows]");
    rowsEl.replaceChildren(
      ...values.slice(0, 15).map((v, i) => {
        const key = v.value.toLowerCase();
        const id = `pa-status-${i}`;
        const sel = el("select", { class: "control", attrs: { id } }) as HTMLSelectElement;
        sel.append(
          el("option", { text: "Still working", attrs: { value: "active" } }),
          el("option", { text: "Has left", attrs: { value: "left" } }),
          el("option", { text: "Go by the last working day", attrs: { value: "auto" } })
        );
        sel.value = state.opts.statusMap[key] ?? v.reads ?? "auto";
        sel.addEventListener("change", () => (state.opts.statusMap[key] = sel.value as StatusChoice));
        return el("div", { class: "pa-status-row" }, el("label", { text: v.value, attrs: { for: id } }), el("span", { class: "pa-status-count", text: plural(v.count, "row", "rows") }), sel);
      })
    );
    if (values.length > 15) rowsEl.append(el("p", { class: "field-help", text: `${values.length - 15} other values are read automatically.` }));
  }

  mapRows.addEventListener("change", (e) => {
    const sel = e.target as HTMLSelectElement;
    const key = sel.dataset.field as FieldKey | undefined;
    if (!key) return;
    if (sel.value === "") delete state.map[key];
    else state.map[key] = Number(sel.value);
    const ex = examples(key);
    const exEl = q(`#pa-map-${key}-ex`);
    exEl.textContent = ex.text;
    exEl.classList.toggle("is-bad", ex.bad);
    if (key === "status") renderStatusChoices();
    if (key === "salary") q("[data-salaryunit-wrap]").hidden = state.map.salary === undefined;
  });
  dateOrderSel.addEventListener("change", () => {
    state.opts.dateOrder = dateOrderSel.value === "mdy" ? "mdy" : "dmy";
    for (const f of FIELDS.filter((x) => x.kind === "date")) {
      const ex = examples(f.key);
      const exEl = q(`#pa-map-${f.key}-ex`);
      exEl.textContent = ex.text;
      exEl.classList.toggle("is-bad", ex.bad);
    }
  });
  salaryUnitSel.addEventListener("change", () => (state.opts.salaryPeriod = salaryUnitSel.value === "monthly" ? "monthly" : "annual"));
  sheetSel.addEventListener("change", () => {
    prepareSheet(Number(sheetSel.value));
    renderMapping();
  });

  function mappingProblem(): string {
    if (state.map.doj === undefined) return "Choose the column with each person's date of joining. The dashboard needs it to work out headcount.";
    const used = new Map<number, string[]>();
    for (const f of FIELDS) {
      const c = state.map[f.key];
      if (c !== undefined) used.set(c, [...(used.get(c) ?? []), f.label]);
    }
    for (const [c, labels] of used) if (labels.length > 1) return `“${state.table!.headers[c]}” is chosen for both ${labels.join(" and ")}. Choose a different column for one of them.`;
    const doj = columnValues("doj", 5000).filter((v) => cellText(v) !== "");
    const ok = doj.filter((v) => parseDate(v, state.opts.dateOrder) !== null).length;
    if (!doj.length || ok / doj.length < 0.5) return `Fewer than half the values in “${state.table!.headers[state.map.doj]}” can be read as dates. Check that it is the joining date column, and check the date format.`;
    return "";
  }
  q("[data-show]").addEventListener("click", () => {
    const problem = mappingProblem();
    mapError.textContent = problem;
    mapError.hidden = !problem;
    if (problem) return;
    buildDataset();
    showDashboard();
    if (keepBox.checked) saveSession();
  });
  q("[data-restart]").addEventListener("click", () => {
    renderSaved();
    showStep("load");
  });

  /* ===== Step 3: dashboard ===== */

  const periodSel = q<HTMLSelectElement>("[data-period]");
  const fromSel = q<HTMLSelectElement>("[data-from]");
  const toSel = q<HTMLSelectElement>("[data-to]");
  const deptSel = q<HTMLSelectElement>("[data-dept]");
  const locSel = q<HTMLSelectElement>("[data-location]");
  const genderSel = q<HTMLSelectElement>("[data-gender]");
  let presets: Period[] = [];

  function buildDataset() {
    state.people = buildEmployees(state.table!, state.map, state.opts);
    state.checks = runChecks(state.people, state.map, state.today);
  }

  function setOptions(sel: HTMLSelectElement, items: [string, string][], keep: string) {
    sel.replaceChildren(...items.map(([v, t]) => el("option", { text: t, attrs: { value: v } })));
    sel.value = items.some(([v]) => v === keep) ? keep : items[0][0];
    return sel.value;
  }

  function setupFilters() {
    const range = dataRange(state.people, state.today);
    presets = periodPresets(state.today, range.earliest);
    const cur = monthOf(state.today);
    const first = range.earliest === null ? cur - 24 : Math.max(monthOf(range.earliest), cur - 120);
    const months: [string, string][] = [];
    for (let m = cur; m >= first; m--) months.push([String(m), monthLabel(m)]);
    setOptions(fromSel, months, String(state.customFrom));
    setOptions(toSel, months, String(state.customTo));
    let periodId = state.periodId;
    // An old file: start on the 12 months up to its latest date instead of an empty "last 12 months".
    const hint = q("[data-hint]");
    hint.hidden = true;
    if (range.latest !== null && range.latest < presets[0].start) {
      periodId = "custom";
      state.customTo = monthOf(range.latest);
      state.customFrom = Math.max(first, state.customTo - 11);
      fromSel.value = String(state.customFrom);
      toSel.value = String(state.customTo);
      hint.textContent = `The latest date in your file is ${dateLabel(range.latest)}, so the period is set to the 12 months up to then. Change it above.`;
      hint.hidden = false;
    }
    state.periodId = setOptions(periodSel, [...presets.map((p): [string, string] => [p.id, p.label]), ["custom", "Custom range"]], periodId);
    q("[data-custom]").hidden = state.periodId !== "custom";
    if (state.periodId === "custom" && !state.customTo) {
      state.customTo = cur;
      state.customFrom = cur - 11;
      fromSel.value = String(state.customFrom);
      toSel.value = String(state.customTo);
    }

    const fieldWrap = (sel: HTMLSelectElement) => sel.closest<HTMLElement>(".field")!;
    fieldWrap(deptSel).hidden = state.map.dept === undefined;
    fieldWrap(locSel).hidden = state.map.location === undefined;
    fieldWrap(genderSel).hidden = state.map.gender === undefined;
    state.filters.dept = state.map.dept === undefined ? "" : setOptions(deptSel, [["", "All departments"], ...filterValues(state.people, "dept").map((v): [string, string] => [v, v])], state.filters.dept);
    state.filters.location = state.map.location === undefined ? "" : setOptions(locSel, [["", "All locations"], ...filterValues(state.people, "location").map((v): [string, string] => [v, v])], state.filters.location);
    const genders = (["women", "men", "other", "unknown"] as Gender[]).filter((g) => state.people.some((e) => e.gender === g));
    state.filters.gender =
      state.map.gender === undefined ? "" : (setOptions(genderSel, [["", "Everyone"], ...genders.map((g): [string, string] => [g, GENDER_LABEL[g]])], state.filters.gender) as Gender | "");
  }

  function currentPeriod(): Period {
    if (state.periodId === "custom") return customPeriod(state.customFrom, state.customTo, state.today);
    return presets.find((p) => p.id === state.periodId) ?? presets[0];
  }

  q("[data-filters]").addEventListener("change", (e) => {
    const t = e.target as HTMLSelectElement;
    if (t === periodSel) {
      state.periodId = periodSel.value;
      q("[data-custom]").hidden = state.periodId !== "custom";
      if (state.periodId === "custom") {
        const p = presets[0];
        state.customFrom = monthOf(p.start);
        state.customTo = monthOf(p.end);
        fromSel.value = String(state.customFrom);
        toSel.value = String(state.customTo);
      }
      q("[data-hint]").hidden = true;
    }
    if (t === fromSel || t === toSel) {
      state.customFrom = Number(fromSel.value);
      state.customTo = Number(toSel.value);
      if (Math.abs(state.customTo - state.customFrom) + 1 > MAX_MONTHS) announce(`Ranges are limited to ${MAX_MONTHS} months; showing the last ${MAX_MONTHS}.`);
    }
    state.filters = { dept: deptSel.value, location: locSel.value, gender: genderSel.value as Gender | "" };
    update();
  });
  q("[data-filters]").addEventListener("submit", (e) => e.preventDefault());

  function showDashboard() {
    state.today = todayNum();
    const sample = state.source?.kind === "sample";
    q("[data-source]").textContent = sample
      ? "Sample data: a made-up company. Load your own file to see your figures."
      : `${state.source?.name ?? "Your file"}: ${peopleText(state.people.length)} in the file, read on ${dateLabel(state.today)}.`;
    q("[data-sample-note]").hidden = !sample;
    q("[data-keep-wrap]").hidden = sample;
    if (sample) keepBox.checked = false;
    q<HTMLButtonElement>("[data-payby-value=grade]").disabled = state.map.grade === undefined;
    if (state.map.grade === undefined) state.payBy = "dept";
    setupFilters();
    renderQuality();
    showStep("dash");
    update();
  }

  q("[data-remap]").addEventListener("click", () => {
    renderMapping();
    showStep("map");
  });
  q("[data-new]").addEventListener("click", () => {
    renderSaved();
    showLoadError("");
    showStep("load");
  });
  q("[data-print-btn]").addEventListener("click", () => window.print());
  q("[data-export]").addEventListener("click", () => {
    if (!state.last) return;
    const csv = summaryCsv(state.last, state.checks, {
      source: state.source?.kind === "sample" ? "Sample data (made up)" : (state.source?.name ?? ""),
      generatedOn: state.today,
      filters: state.filters,
      payUnit: state.opts.salaryPeriod
    });
    download(summaryFileName(state.today), "﻿" + csv);
    announce("Summary downloaded as a CSV file.");
  });
  root.querySelectorAll<HTMLButtonElement>("[data-payby-value]").forEach((b) =>
    b.addEventListener("click", () => {
      state.payBy = b.dataset.paybyValue === "grade" ? "grade" : "dept";
      root.querySelectorAll<HTMLButtonElement>("[data-payby-value]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      update();
    })
  );

  /* ----- Cards ----- */

  type CardKey = "headcount" | "flow" | "dept" | "tenure" | "span" | "pay";
  const card = (k: CardKey) => {
    const c = q(`[data-card=${k}]`);
    return {
      root: c,
      plot: c.querySelector<HTMLElement>("[data-plot]")!,
      table: c.querySelector<HTMLElement>("[data-table]")!,
      legend: c.querySelector<HTMLElement>("[data-legend]")!,
      sub: c.querySelector<HTMLElement>("[data-sub]")!,
      empty: c.querySelector<HTMLElement>("[data-empty]")!,
      toggle: c.querySelector<HTMLButtonElement>("[data-table-toggle]")!
    };
  };
  const cards = Object.fromEntries((["headcount", "flow", "dept", "tenure", "span", "pay"] as CardKey[]).map((k) => [k, card(k)])) as Record<CardKey, ReturnType<typeof card>>;
  for (const c of Object.values(cards)) {
    c.toggle.addEventListener("click", () => {
      const on = c.toggle.getAttribute("aria-pressed") !== "true";
      c.toggle.setAttribute("aria-pressed", String(on));
      c.toggle.querySelector("[data-label]")!.textContent = on ? "Show chart" : "Show table";
      c.toggle.querySelector<HTMLElement>(".pa-ic-table")!.hidden = on;
      c.toggle.querySelector<HTMLElement>(".pa-ic-chart")!.hidden = !on;
      c.table.hidden = !on;
      c.plot.hidden = on;
      c.legend.hidden = on || !c.legend.childElementCount;
    });
  }
  /** Show the chart (or its table), or an empty-state message instead. */
  function cardState(c: ReturnType<typeof card>, empty: string) {
    const tableMode = c.toggle.getAttribute("aria-pressed") === "true";
    c.empty.textContent = empty;
    c.empty.hidden = !empty;
    c.root.querySelector<HTMLElement>(".pa-card-tools")!.hidden = !!empty;
    c.root.querySelector<HTMLElement>(".pa-cap")!.hidden = !!empty;
    c.plot.hidden = !!empty || tableMode;
    c.table.hidden = !!empty || !tableMode;
    if (empty) {
      c.legend.hidden = true;
      c.sub.textContent = "";
    }
  }
  function legend(c: ReturnType<typeof card>, items: { label: string; value?: string; color: string; shape: "rect" | "line" | "band" | "median" }[]) {
    const ul = el("ul");
    for (const it of items) {
      const k = el("span", { class: `pa-lk pa-lk-${it.shape}`, attrs: { "aria-hidden": "true" } });
      k.style.setProperty("--k", it.color);
      const li = el("li", {}, k, it.label);
      if (it.value) li.append(" ", el("b", { text: it.value }));
      ul.append(li);
    }
    c.legend.replaceChildren(...ul.childNodes);
    c.legend.hidden = !items.length || c.toggle.getAttribute("aria-pressed") === "true";
  }

  const charts = {
    headcount: null as LineChart | null,
    flow: null as ColumnChart | null,
    dept: null as HBarChart | null,
    tenure: null as ColumnChart | null,
    span: null as ColumnChart | null,
    pay: null as RangeChart | null
  };

  /* ----- Render ----- */

  function update() {
    try {
      const d = computeDashboard(state.people, currentPeriod(), state.filters, {
        hasManager: state.map.manager !== undefined,
        hasSalary: state.map.salary !== undefined,
        payBy: state.payBy
      });
      state.last = d;
      renderScope(d);
      renderKpis(d);
      renderHeadcount(d);
      renderFlow(d);
      renderDept(d);
      renderTenure(d);
      renderSpan(d);
      renderPay(d);
    } catch (e) {
      console.error(e);
      q("[data-scope]").textContent = "The dashboard couldn't be drawn from this file. Check the columns and try again.";
    }
  }

  function renderScope(d: Dashboard) {
    const f = state.filters;
    const parts = [
      `${dateLabel(d.period.start)} to ${dateLabel(d.period.end)}`,
      state.map.dept === undefined ? "" : f.dept || "All departments",
      state.map.location === undefined ? "" : f.location || "All locations",
      state.map.gender === undefined ? "" : f.gender ? GENDER_LABEL[f.gender] : "Everyone"
    ].filter(Boolean);
    q("[data-scope]").textContent = `Showing ${parts.join(" · ")}.${d.people.length ? "" : " No one in the file matches these filters."}`;
    const issues = state.checks.filter((c) => c.status === "fix" || c.status === "review").length;
    const alertEl = q("[data-quality-alert]");
    alertEl.hidden = !issues;
    if (issues) {
      const a = el("a", { text: "See the data checks", attrs: { href: "#pa-quality" } });
      alertEl.replaceChildren(icon("alert", 18), el("span", { text: `${plural(issues, "data check needs", "data checks need")} a look; they can change these figures. ` }, a));
    }
  }

  function kpi(key: string, value: string, unit?: string) {
    const v = q(`[data-kpi=${key}]`);
    v.replaceChildren(value);
    if (unit) v.append(el("span", { class: "pa-unit", text: unit }));
  }
  const kpiSub = (key: string) => q(`[data-kpi-sub=${key}]`);

  function renderKpis(d: Dashboard) {
    const hasDoe = state.map.doe !== undefined;
    const diff = d.closing - d.opening;
    kpi("headcount", int(d.closing));
    kpiSub("headcount").textContent = `On ${dateLabel(d.period.end)}. ${int(d.opening)} at the start, ${diff === 0 ? "no change" : `${diff > 0 ? "up" : "down"} ${int(Math.abs(diff))}`}.`;
    kpi("joiners", int(d.joiners));
    kpiSub("joiners").textContent = d.months >= 1.5 ? `About ${dec1(d.joiners / d.months)} a month.` : "In this period.";
    if (!hasDoe) {
      kpi("leavers", "–");
      kpiSub("leavers").textContent = "Add a last working day column to count leavers.";
      kpi("rate", "–");
      kpiSub("rate").replaceChildren("Needs a last working day column.");
    } else {
      kpi("leavers", int(d.leavers));
      kpiSub("leavers").textContent = d.leavers ? `${plural(d.earlyLeavers, "person", "people")} left within a year of joining.` : "No one left in this period.";
      kpi("rate", d.rate === null ? "–" : pct(d.rate));
      const f = kpiSub("rate");
      if (d.rate === null) f.replaceChildren("No one was on the rolls in this period.");
      else {
        const lines: (Node | string)[] = [
          el("span", { class: "pa-eq", text: `${plural(d.leavers, "leaver", "leavers")} ÷ ${avgText(d.average)} average headcount × 100` }),
          el("span", { text: `Average headcount = (${int(d.opening)} at the start + ${int(d.closing)} at the end) ÷ 2` })
        ];
        if (Math.abs(d.months - 12) > 0.05 && d.annualised !== null)
          lines.push(el("span", { text: `Covers ${dec1(d.months)} months; at the same pace that is ${pct(d.annualised)} a year (annualised).` }));
        f.replaceChildren(...lines);
      }
    }
    if (d.tenure.mean === null) {
      kpi("tenure", "–");
      kpiSub("tenure").textContent = "No one on the rolls at the end of the period.";
    } else {
      kpi("tenure", dec1(d.tenure.mean), "years");
      kpiSub("tenure").textContent = `Median ${dec1(d.tenure.median ?? 0)} years, for people on the rolls on ${dateLabel(d.period.end)}.`;
    }
    const g = d.gender;
    const total = g.women + g.men + g.other + g.unknown;
    const sub = kpiSub("gender");
    if (state.map.gender === undefined) {
      kpi("gender", "–");
      sub.textContent = "Add a gender column to see this.";
    } else if (!total) {
      kpi("gender", "–");
      sub.textContent = "No one on the rolls at the end of the period.";
    } else {
      kpi("gender", pct((g.women / total) * 100, 0), "women");
      const parts: { k: Gender; color: string }[] = [
        { k: "women", color: C1 },
        { k: "men", color: C2 },
        { k: "other", color: C3 },
        { k: "unknown", color: NOT_STATED }
      ];
      const shown = parts.filter((p) => g[p.k] > 0);
      const bar = el("div", {
        class: "pa-gbar",
        attrs: { role: "img", "aria-label": shown.map((p) => `${GENDER_LABEL[p.k]} ${g[p.k]} (${pct((g[p.k] / total) * 100, 0)})`).join(", ") }
      });
      for (const p of shown) {
        const s = el("span");
        s.style.setProperty("--k", p.color);
        s.style.flexGrow = String(g[p.k]);
        bar.append(s);
      }
      const list = el("ul", { class: "pa-glegend" });
      for (const p of shown) {
        const sw = el("span", { class: "pa-sw", attrs: { "aria-hidden": "true" } });
        sw.style.setProperty("--k", p.color);
        list.append(el("li", {}, sw, `${GENDER_LABEL[p.k]} `, el("b", { text: int(g[p.k]) })));
      }
      sub.replaceChildren(bar, list);
    }
  }

  const monthTitle = (d: Dashboard, i: number) => {
    const m = d.monthly[i];
    const partial = m.end < monthEnd(m.month);
    return partial ? `${monthLabel(m.month)} (to ${dateLabel(m.end)})` : monthLabel(m.month);
  };

  function renderHeadcount(d: Dashboard) {
    const c = cards.headcount;
    cardState(c, d.people.length ? "" : "No one in the file matches these filters.");
    if (!d.people.length) return;
    c.sub.textContent = `${monthLabel(d.monthly[0].month)} to ${monthLabel(d.monthly[d.monthly.length - 1].month)}`;
    charts.headcount ??= new LineChart(c.plot, "Headcount by month, line chart");
    charts.headcount.data = {
      months: d.monthly.map((m) => m.month),
      values: d.monthly.map((m) => m.closing),
      color: C1,
      tip: (i): Tip => {
        const m = d.monthly[i];
        return {
          title: monthTitle(d, i),
          rows: [{ value: int(m.closing), label: "on the rolls at the end", color: C1, shape: "line" }],
          note: `${plural(m.joiners, "joiner", "joiners")}, ${plural(m.leavers, "leaver", "leavers")}`
        };
      }
    };
    charts.headcount.draw();
    c.table.replaceChildren(
      table(
        "Headcount by month",
        ["Month", "At the start", "Joiners", "Leavers", "At the end"],
        d.monthly.map((m, i) => [monthTitle(d, i), int(m.opening), int(m.joiners), int(m.leavers), int(m.closing)]),
        [1, 2, 3, 4]
      )
    );
  }

  function renderFlow(d: Dashboard) {
    const c = cards.flow;
    const hasDoe = state.map.doe !== undefined;
    cardState(c, d.people.length ? "" : "No one in the file matches these filters.");
    if (!d.people.length) return;
    c.sub.textContent = hasDoe ? `${plural(d.joiners, "joiner", "joiners")} and ${plural(d.leavers, "leaver", "leavers")}` : "Add a last working day column to see leavers.";
    const series = [{ name: "Joiners", values: d.monthly.map((m) => m.joiners), color: C1 }];
    if (hasDoe) series.push({ name: "Leavers", values: d.monthly.map((m) => m.leavers), color: C2 });
    legend(c, [
      { label: "Joiners", value: int(d.joiners), color: C1, shape: "rect" },
      ...(hasDoe ? [{ label: "Leavers", value: int(d.leavers), color: C2, shape: "rect" as const }] : [])
    ]);
    charts.flow ??= new ColumnChart(c.plot, "Joiners and leavers by month, column chart");
    charts.flow.data = {
      labels: d.monthly.map((m) => monthLabel(m.month)),
      months: d.monthly.map((m) => m.month),
      series,
      tip: (i): Tip => {
        const m = d.monthly[i];
        const net = m.joiners - m.leavers;
        return {
          title: monthTitle(d, i),
          rows: [
            { value: int(m.joiners), label: m.joiners === 1 ? "joiner" : "joiners", color: C1, shape: "rect" },
            ...(hasDoe ? [{ value: int(m.leavers), label: m.leavers === 1 ? "leaver" : "leavers", color: C2, shape: "rect" as const }] : [])
          ],
          note: hasDoe ? `Net change ${net > 0 ? "+" : net < 0 ? "−" : ""}${int(Math.abs(net))}` : undefined
        };
      }
    };
    charts.flow.draw();
    c.table.replaceChildren(
      table(
        "Joiners and leavers by month",
        ["Month", "Joiners", ...(hasDoe ? ["Leavers", "Net change"] : [])],
        d.monthly.map((m, i) => [monthTitle(d, i), int(m.joiners), ...(hasDoe ? [int(m.leavers), `${m.joiners - m.leavers > 0 ? "+" : ""}${m.joiners - m.leavers}`] : [])]),
        hasDoe ? [1, 2, 3] : [1]
      )
    );
  }

  function renderDept(d: Dashboard) {
    const c = cards.dept;
    const empty =
      state.map.dept === undefined
        ? "Add a department column to compare attrition across departments."
        : state.map.doe === undefined
          ? "Add a last working day column to see attrition."
          : !d.byDept.length
            ? "No one in the file matches these filters."
            : "";
    cardState(c, empty);
    if (empty) return;
    c.sub.textContent = `${plural(d.byDept.length, "department", "departments")} · everyone ${pct(d.rate)}`;
    charts.dept ??= new HBarChart(c.plot, "Attrition rate by department, bar chart");
    charts.dept.data = {
      color: C1,
      ref: d.rate === null ? undefined : { value: d.rate, label: `Everyone ${pct(d.rate)}` },
      rows: d.byDept.map((r) => ({
        label: r.name,
        value: r.rate ?? 0,
        display: pct(r.rate),
        sub: `${int(r.leavers)} left`,
        tip: {
          title: r.name,
          rows: [
            { value: pct(r.rate), label: "attrition", color: C1, shape: "rect" },
            { value: int(r.leavers), label: r.leavers === 1 ? "leaver" : "leavers" },
            { value: avgText(r.average), label: "average headcount" }
          ],
          note: r.average < 10 ? "Small team: one leaver moves the rate a lot." : undefined
        }
      }))
    };
    charts.dept.draw();
    c.table.replaceChildren(
      table(
        "Attrition by department",
        ["Department", "At the start", "At the end", "Average", "Leavers", "Attrition rate"],
        d.byDept.map((r) => [r.name, int(r.opening), int(r.closing), avgText(r.average), int(r.leavers), pct(r.rate)]),
        [1, 2, 3, 4, 5]
      )
    );
  }

  function renderTenure(d: Dashboard) {
    const c = cards.tenure;
    cardState(c, d.current.length ? "" : "No one is on the rolls at the end of this period.");
    if (!d.current.length) return;
    c.sub.textContent = `Years of service · median ${dec1(d.tenure.median ?? 0)} years`;
    const total = d.current.length;
    charts.tenure ??= new ColumnChart(c.plot, "Tenure of people on the rolls, column chart");
    charts.tenure.data = {
      labels: d.tenure.bins.map((b) => b.short),
      series: [{ name: "People", values: d.tenure.bins.map((b) => b.count), color: C1 }],
      barColors: ORDINAL,
      labelMax: true,
      tip: (i): Tip => {
        const b = d.tenure.bins[i];
        return { title: b.label, rows: [{ value: int(b.count), label: `${b.count === 1 ? "person" : "people"} (${pct((b.count / total) * 100, 0)})`, color: ORDINAL[i], shape: "rect" }] };
      }
    };
    charts.tenure.draw();
    c.table.replaceChildren(
      table("Tenure of people on the rolls", ["Years of service", "People", "Share"], d.tenure.bins.map((b) => [b.label, int(b.count), pct((b.count / total) * 100, 0)]), [1, 2])
    );
  }

  function renderSpan(d: Dashboard) {
    const c = cards.span;
    const s = d.span;
    const empty =
      state.map.manager === undefined
        ? "Add a reporting manager column to see span of control."
        : !s || !s.managers.length
          ? "No reporting lines were found among people on the rolls at the end of this period."
          : "";
    cardState(c, empty);
    if (empty || !s) return;
    c.sub.textContent = `${plural(s.managers.length, "manager", "managers")} · median ${num1(s.median ?? 0)} direct reports${s.widest ? ` · widest ${s.widest.reports}` : ""}`;
    charts.span ??= new ColumnChart(c.plot, "Managers by number of direct reports, column chart");
    charts.span.data = {
      labels: s.bins.map((b) => b.short),
      series: [{ name: "Managers", values: s.bins.map((b) => b.count), color: C1 }],
      barColors: ORDINAL,
      labelMax: true,
      tip: (i): Tip => {
        const b = s.bins[i];
        const names = b.names ?? [];
        return {
          title: b.label,
          rows: [{ value: int(b.count), label: b.count === 1 ? "manager" : "managers", color: ORDINAL[i], shape: "rect" }],
          note: names.length ? `${names.slice(0, 3).join(", ")}${names.length > 3 ? ` and ${names.length - 3} more` : ""}` : undefined
        };
      }
    };
    charts.span.draw();
    const who = (names: string[]) => (names.length ? `${names.slice(0, 12).join(", ")}${names.length > 12 ? ` and ${names.length - 12} more` : ""}` : "–");
    c.table.replaceChildren(
      table("Managers by number of direct reports", ["Direct reports", "Managers", "Who"], s.bins.map((b) => [b.label, int(b.count), who(b.names ?? [])]), [1])
    );
  }

  function renderPay(d: Dashboard) {
    const c = cards.pay;
    const p = d.pay;
    const empty = state.map.salary === undefined ? "Add a salary or CTC column to see pay spread." : !p || !p.groups.length ? "No salaries for people on the rolls at the end of this period." : "";
    cardState(c, empty);
    if (empty || !p) return;
    const unit = state.opts.salaryPeriod === "monthly" ? "a month" : "a year";
    const by = p.by === "grade" ? "grade" : "department";
    c.sub.textContent = `Median by ${by}, ₹ ${unit}`;
    legend(c, [
      { label: "Lowest to highest", color: C1, shape: "line" },
      { label: "Middle half of people", color: C1, shape: "band" },
      { label: "Median", color: C1, shape: "median" }
    ]);
    charts.pay ??= new RangeChart(c.plot, "Pay spread by group, range chart");
    charts.pay.data = {
      color: C1,
      tick: moneyTick,
      hidden: `Fewer than ${MIN_PAY_GROUP} people: not shown`,
      rows: p.groups.map((g) => ({
        label: g.name,
        sub: peopleText(g.n),
        stats: g.stats,
        display: g.stats ? money(g.stats.median) : "",
        tip: g.stats
          ? {
              title: g.name,
              rows: [
                { value: money(g.stats.median), label: "median" },
                { value: `${money(g.stats.p25)} to ${money(g.stats.p75)}`, label: "middle half" },
                { value: `${money(g.stats.min)} to ${money(g.stats.max)}`, label: "lowest to highest" },
                { value: money(g.stats.mean), label: "average" }
              ],
              note: `${peopleText(g.n)}, ₹ ${unit}`
            }
          : { title: g.name, rows: [{ value: int(g.n), label: g.n === 1 ? "person" : "people" }], note: `Pay is not shown for groups of fewer than ${MIN_PAY_GROUP}.` }
      }))
    };
    charts.pay.draw();
    const m = (v: number) => money(v);
    c.table.replaceChildren(
      table(
        `Pay spread by ${by} (₹ ${unit})`,
        [by === "grade" ? "Grade" : "Department", "People", "Lowest", "25th percentile", "Median", "75th percentile", "Highest", "Average"],
        p.groups.map((g) =>
          g.stats ? [g.name, int(g.n), m(g.stats.min), m(g.stats.p25), m(g.stats.median), m(g.stats.p75), m(g.stats.max), m(g.stats.mean)] : [g.name, int(g.n), "Not shown", "", "", "", "", ""]
        ),
        [1, 2, 3, 4, 5, 6, 7]
      )
    );
  }

  /* ----- Data checks ----- */

  const STATUS: Record<CheckStatus, { label: string; icon: IconName }> = {
    fix: { label: "Fix", icon: "x-circle" },
    review: { label: "Review", icon: "alert" },
    note: { label: "Note", icon: "info" },
    ok: { label: "Passed", icon: "check-circle" }
  };
  function renderQuality() {
    q("[data-quality-summary]").textContent = `${checkSummary(state.checks).text} Checks cover the whole file, whatever the filters.`;
    const summaryLine = (status: CheckStatus, title: string, count: string) => {
      const st = STATUS[status];
      return el(
        "summary",
        {},
        el("span", { class: `pa-st pa-st-${status}` }, icon(st.icon, 15), st.label),
        el("span", { class: "pa-check-title", text: title }),
        el("span", { class: "pa-check-count", text: count }),
        el("span", { class: "pa-check-chev", attrs: { "aria-hidden": "true" } }, icon("chevron-down", 18))
      );
    };
    const items = state.checks
      .filter((c) => c.status !== "ok")
      .map((c) => {
        const body = el("div", { class: "pa-check-body" }, el("p", { text: c.effect }));
        if (c.rows.length) {
          const shown = c.rows.slice(0, 50);
          body.append(
            el(
              "div",
              { class: "pa-table" },
              table(`${c.title}: rows to check`, ["Row", "Employee ID", "Name", "Detail"], shown.map((r) => [String(r.row), r.id || "–", r.name || "–", r.detail]))
            )
          );
          if (c.rows.length > shown.length) body.append(el("p", { text: `And ${c.rows.length - shown.length} more rows.` }));
        }
        return el("details", { class: "pa-check" }, summaryLine(c.status, c.title, affected(c)), body);
      });
    const passed = state.checks.filter((c) => c.status === "ok");
    if (passed.length) {
      const list = el("ul", { class: "pa-passed" }, ...passed.map((c) => el("li", {}, el("b", { text: c.title }), `: ${c.effect.charAt(0).toLowerCase()}${c.effect.slice(1)}`)));
      items.push(el("details", { class: "pa-check" }, summaryLine("ok", `${plural(passed.length, "other check", "other checks")} found nothing`, ""), el("div", { class: "pa-check-body" }, list)));
    }
    q("[data-quality-list]").replaceChildren(...items);
  }

  /* ----- Start ----- */
  renderSaved();
}
