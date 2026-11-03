/**
 * Org chart builder: the page behaviour. Three steps (load → check columns →
 * chart), then the chart with search, focus, collapse, zoom and pan; a tree
 * view of the same reporting lines for keyboard and screen-reader users; the
 * structure figures; data checks; SVG, PNG and PowerPoint downloads; and an
 * opt-in copy in localStorage. Figures come from src/lib/orgchart (tested).
 *
 * Text from the file is only ever inserted with textContent, or escaped
 * before it goes into the chart's SVG markup.
 */
import { isoDate, today as todayNum } from "../../lib/analytics/dates.ts";
import { cellText, type Cell } from "../../lib/analytics/fields.ts";
import { dateLabel, dec1, int, num1, plural } from "../../lib/analytics/format.ts";
import { analyse, cleanSettings, DEFAULT_SETTINGS, NOT_RECORDED, type Analysis, type GroupRow, type Settings } from "../../lib/orgchart/analysis.ts";
import { affected, checkSummary, orgChecks, type Check, type CheckStatus } from "../../lib/orgchart/checks.ts";
import { detectOrgColumns, findOrgHeaderRow, mappingProblem, OC_FIELDS, readPeople, templateCsv, type OcColumnMap, type OcFieldKey } from "../../lib/orgchart/fields.ts";
import { buildOrg, displayName, isWithin, managersAbove, type Org } from "../../lib/orgchart/hierarchy.ts";
import { LAYOUT, layoutChart, linePath, type Layout } from "../../lib/orgchart/layout.ts";
import { sampleOrgTable } from "../../lib/orgchart/sample.ts";
import { chartSvg, colourOf, deptColours, esc, fit, metaLine } from "../../lib/orgchart/svg.ts";
import { bestSheet, LoadError, readEmployeeFile, type Sheet } from "../analytics/load.ts";

const STORE_KEY = "peoplecraft-orgchart-v1";
/** Above this many people, teams below the third level start collapsed. */
const COLLAPSE_ABOVE = 150;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
const W = LAYOUT.w;
const H = LAYOUT.h;

type Step = "load" | "map" | "chart";
type Saved = { v: 1; savedAt: number; fileName: string; sheetName: string; rows: Cell[][]; map: OcColumnMap; settings: Settings };

/* ---------- Small helpers ---------- */

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: { class?: string; text?: string; attrs?: Record<string, string> } = {}, ...kids: (Node | string)[]) {
  const e = document.createElement(tag);
  if (props.class) e.className = props.class;
  if (props.text !== undefined) e.textContent = props.text;
  for (const [k, v] of Object.entries(props.attrs ?? {})) e.setAttribute(k, v);
  e.append(...kids);
  return e;
}
type IconName = "alert" | "x-circle" | "info" | "check-circle" | "chevron-down";
function icon(name: IconName, size = 16): Node {
  const t = document.querySelector<HTMLTemplateElement>(`template[data-icon="${name}"]`);
  const svg = t?.content.firstElementChild?.cloneNode(true) as SVGSVGElement | undefined;
  if (!svg) return document.createTextNode("");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  return svg;
}
function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = el("a", { attrs: { href: url, download: name } });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const colLetter = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : colLetter(Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));
const r1 = (v: number) => Math.round(v * 10) / 10;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Filled rows under the header row (title lines above it don't count). */
const peopleRows = (rows: Cell[][]) => rows.slice(findOrgHeaderRow(rows) + 1).filter((r) => r.some((c) => cellText(c) !== "")).length;
const pct0 = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "–");

function table(caption: string, head: string[], rows: (string | Node)[][], numeric: number[] = []): HTMLElement {
  const t = el("table", {}, el("caption", { text: caption }));
  t.append(el("thead", {}, el("tr", {}, ...head.map((h, i) => el("th", { text: h, class: numeric.includes(i) ? "num" : "", attrs: { scope: "col" } })))));
  const body = el("tbody");
  for (const r of rows) {
    const tr = el("tr");
    r.forEach((v, i) => {
      const cell = i === 0 ? el("th", { attrs: { scope: "row" } }) : el("td");
      cell.append(v);
      if (numeric.includes(i)) cell.className = "num";
      tr.append(cell);
    });
    body.append(tr);
  }
  t.append(body);
  return el("div", { class: "oc-table", attrs: { tabindex: "0", role: "region", "aria-label": caption } }, t);
}

/* ---------- The app ---------- */

export function mountOrgChart(root: HTMLElement) {
  const q = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const steps: Record<Step, HTMLElement> = { load: q("[data-step=load]"), map: q("[data-step=map]"), chart: q("[data-step=chart]") };
  const live = q("[data-announce]");
  const fileInput = q<HTMLInputElement>("[data-file]");
  const drop = q("[data-drop]");
  const viewport = q("[data-viewport]");
  const canvas = q("[data-canvas]");
  const tree = q<HTMLUListElement>("[data-tree]");
  const search = q<HTMLInputElement>("[data-search]");
  const results = q<HTMLUListElement>("[data-results]");
  const personPanel = q("[data-person]");
  const keepBox = q<HTMLInputElement>("[data-keep]");
  const settingsForm = q<HTMLFormElement>("[data-settings]");

  const state = {
    source: null as null | { kind: "file" | "sample"; name: string },
    sheets: [] as Sheet[],
    sheetIndex: 0,
    headers: [] as string[],
    rows: [] as Cell[][],
    firstRow: 2,
    map: {} as OcColumnMap,
    settings: { ...DEFAULT_SETTINGS } as Settings,
    org: null as Org | null,
    analysis: null as Analysis | null,
    checks: [] as Check[],
    colours: new Map<string, string>(),
    collapsed: new Set<number>(),
    focus: null as number | null,
    selected: null as number | null,
    matches: new Set<number>(),
    zoom: 1,
    layout: null as Layout | null,
    spanAll: false,
    today: todayNum()
  };
  const org = () => state.org!;
  const A = () => state.analysis!;

  const announce = (msg: string) => {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = msg));
  };
  function showStep(step: Step, focus = true) {
    (Object.keys(steps) as Step[]).forEach((s) => (steps[s].hidden = s !== step));
    if (focus) {
      steps[step].querySelector<HTMLElement>(".oc-h")?.focus({ preventScroll: true });
      steps[step].scrollIntoView({ block: "start", behavior: reduced() ? "auto" : "smooth" });
    }
  }

  /* ===== Step 1: load ===== */

  const loadError = q("[data-load-error]");
  const busy = q("[data-busy]");
  const showLoadError = (msg: string) => {
    loadError.textContent = msg;
    loadError.hidden = !msg;
  };
  function prepareSheet(i: number) {
    state.sheetIndex = i;
    const all = state.sheets[i]?.rows ?? [];
    const h = findOrgHeaderRow(all);
    const body = all.slice(h + 1);
    const width = Math.max(all[h]?.length ?? 0, ...body.slice(0, 50).map((r) => r.length));
    state.headers = Array.from({ length: width }, (_, j) => cellText(all[h]?.[j] ?? null) || `Column ${colLetter(j)}`);
    state.rows = body;
    state.firstRow = h + 2;
    state.map = detectOrgColumns(state.headers, body);
  }
  const dataRows = () => state.rows.filter((r) => r.some((c) => cellText(c) !== "")).length;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    showLoadError("");
    busy.hidden = false;
    try {
      const loaded = await readEmployeeFile(file);
      state.source = { kind: "file", name: loaded.fileName };
      state.sheets = loaded.sheets;
      prepareSheet(bestSheet(loaded.sheets));
      if (!dataRows()) throw new LoadError("The file has a header row but no rows of people under it.");
      renderMapping();
      showStep("map");
      announce(`Read ${file.name}: ${plural(dataRows(), "row", "rows")}. Check the columns.`);
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
    const s = sampleOrgTable();
    state.source = { kind: "sample", name: "Sample data" };
    state.sheets = [{ name: "", rows: [s.headers, ...s.rows] }];
    prepareSheet(0);
    state.settings = { ...DEFAULT_SETTINGS };
    buildDataset();
    showChart();
    announce("Sample data loaded: a made-up company of 62 people.");
  });
  q("[data-template]").addEventListener("click", () => {
    download("org-chart-template.csv", new Blob(["﻿" + templateCsv()], { type: "text/csv;charset=utf-8" }));
    announce("Blank template downloaded.");
  });

  /* ----- Kept in this browser (opt-in) ----- */

  function readSaved(): Saved | null {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Saved;
      if (s?.v !== 1 || !Array.isArray(s.rows) || typeof s.map !== "object") throw new Error("bad");
      return s;
    } catch {
      try {
        localStorage.removeItem(STORE_KEY);
      } catch {
        /* storage unavailable */
      }
      return null;
    }
  }
  function renderSaved() {
    const s = readSaved();
    const box = q("[data-saved]");
    box.hidden = !s;
    if (!s) return;
    const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(s.savedAt));
    q("[data-saved-text]").textContent = `${s.fileName} (${plural(peopleRows(s.rows), "row", "rows")}), kept since ${when}.`;
  }
  function saveSession(): boolean {
    if (state.source?.kind !== "file") return false;
    const sheet = state.sheets[state.sheetIndex];
    const s: Saved = { v: 1, savedAt: Date.now(), fileName: state.source.name, sheetName: sheet.name, rows: sheet.rows, map: state.map, settings: state.settings };
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
      return true;
    } catch {
      return false;
    }
  }
  q("[data-saved-open]").addEventListener("click", () => {
    const s = readSaved();
    if (!s) return renderSaved();
    state.source = { kind: "file", name: s.fileName };
    state.sheets = [{ name: s.sheetName, rows: s.rows }];
    prepareSheet(0);
    state.map = s.map;
    state.settings = cleanSettings(s.settings ?? DEFAULT_SETTINGS);
    buildDataset();
    showChart();
    keepBox.checked = true;
    announce(`Opened ${s.fileName} from this browser.`);
  });
  q("[data-saved-delete]").addEventListener("click", () => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* storage unavailable */
    }
    keepBox.checked = false;
    renderSaved();
    announce("Deleted the list kept in this browser.");
  });
  keepBox.addEventListener("change", () => {
    const note = q("[data-keep-note]");
    if (keepBox.checked) {
      if (saveSession()) {
        note.textContent = "(on this device only, until you untick this)";
        announce("Kept in this browser. Untick the box to delete it.");
      } else {
        keepBox.checked = false;
        note.textContent = "This file is too large to keep in the browser, so it will be gone when you close the page.";
        announce(note.textContent);
      }
    } else {
      try {
        localStorage.removeItem(STORE_KEY);
      } catch {
        /* storage unavailable */
      }
      announce("Deleted the list kept in this browser.");
    }
  });

  /* ===== Step 2: columns ===== */

  const mapRows = q("[data-map-rows]");
  const mapError = q("[data-map-error]");
  const sheetSel = q<HTMLSelectElement>("[data-sheet]");

  function examples(key: OcFieldKey): string {
    const i = state.map[key];
    if (i === undefined) return key === "name" ? "Choose the column with people's names." : "Not used.";
    const values = state.rows.map((r) => cellText(r[i] ?? null)).filter(Boolean);
    if (!values.length) return "This column is empty.";
    return [...new Set(values)].slice(0, 3).join(" · ");
  }
  function renderMapping() {
    const matched = OC_FIELDS.filter((f) => state.map[f.key] !== undefined).length;
    const sheet = state.sheets[state.sheetIndex];
    q("[data-map-summary]").textContent =
      `${state.source?.name ?? "Your file"}${sheet?.name ? `, sheet “${sheet.name}”` : ""}: ${plural(dataRows(), "row", "rows")} under a header row with ${plural(state.headers.length, "column", "columns")}. ` +
      `${matched} of ${OC_FIELDS.length} fields were matched by their headings. Check each one and change any that are wrong. The chart needs names, and either the manager's employee ID or the manager's name.`;
    q("[data-sheet-wrap]").hidden = state.sheets.length < 2;
    sheetSel.replaceChildren(...state.sheets.map((s, i) => el("option", { text: `${s.name || `Sheet ${i + 1}`} (${plural(peopleRows(s.rows), "row", "rows")})`, attrs: { value: String(i) } })));
    sheetSel.value = String(state.sheetIndex);
    mapRows.replaceChildren(
      ...OC_FIELDS.map((f) => {
        const id = `oc-map-${f.key}`;
        const label = el("label", { text: f.label, attrs: { for: id } });
        if (f.required) label.append(el("span", { class: "oc-req", text: "Required" }));
        const select = el("select", { class: "control", attrs: { id, "data-field": f.key, "aria-describedby": `${id}-use ${id}-ex` } });
        select.append(el("option", { text: "Not in my file", attrs: { value: "" } }), ...state.headers.map((h, j) => el("option", { text: `${colLetter(j)}: ${h}`, attrs: { value: String(j) } })));
        select.value = state.map[f.key] === undefined ? "" : String(state.map[f.key]);
        const ex = el("p", { class: `oc-map-ex${state.map[f.key] === undefined ? " is-quiet" : ""}`, text: examples(f.key), attrs: { id: `${id}-ex` } });
        return el("div", { class: "oc-map-row" }, el("div", { class: "oc-map-field" }, label, el("span", { class: "oc-map-use", text: f.use, attrs: { id: `${id}-use` } })), select, ex);
      })
    );
    mapError.hidden = true;
  }
  mapRows.addEventListener("change", (e) => {
    const sel = e.target as HTMLSelectElement;
    const key = sel.dataset.field as OcFieldKey | undefined;
    if (!key) return;
    if (sel.value === "") delete state.map[key];
    else state.map[key] = Number(sel.value);
    const ex = q(`#oc-map-${key}-ex`);
    ex.textContent = examples(key);
    ex.classList.toggle("is-quiet", state.map[key] === undefined);
  });
  sheetSel.addEventListener("change", () => {
    prepareSheet(Number(sheetSel.value));
    renderMapping();
  });
  q("[data-show]").addEventListener("click", () => {
    const problem = mappingProblem(state.map, state.headers);
    mapError.textContent = problem;
    mapError.hidden = !problem;
    if (problem) return;
    buildDataset();
    showChart();
    if (keepBox.checked) saveSession();
  });
  q("[data-restart]").addEventListener("click", () => {
    renderSaved();
    showStep("load");
  });

  /* ===== Step 3: the chart ===== */

  function buildDataset() {
    const people = readPeople({ headers: state.headers, rows: state.rows, firstRow: state.firstRow }, state.map);
    state.org = buildOrg(people);
    state.checks = orgChecks(state.org, state.map);
    state.colours = deptColours(state.org);
    state.analysis = analyse(state.org, state.settings);
    state.focus = null;
    state.selected = null;
    state.matches.clear();
    state.spanAll = false;
    state.collapsed = new Set();
    if (people.length > COLLAPSE_ABOVE) state.org.children.forEach((k, i) => k.length && state.org!.level[i] >= 3 && state.collapsed.add(i));
  }

  function showChart() {
    state.today = todayNum();
    const sample = state.source?.kind === "sample";
    q("[data-source]").textContent = sample
      ? "Sample data: a made-up company. Load your own list to see your organisation."
      : `${state.source?.name ?? "Your file"}: ${plural(org().people.length, "person", "people")}, read on ${dateLabel(state.today)}.`;
    q("[data-sample-note]").hidden = !sample;
    q("[data-keep-wrap]").hidden = sample;
    if (sample) keepBox.checked = false;
    search.value = "";
    results.hidden = true;
    writeSettings();
    showStep("chart");
    renderAll();
    resetView();
  }

  function renderAll() {
    renderAlert();
    renderKpis();
    drawChart();
    renderLegend();
    renderFocusBar();
    renderPerson();
    buildTree();
    renderStructure();
    renderQuality();
  }

  function renderAlert() {
    const issues = state.checks.filter((c) => c.status === "fix" || c.status === "review").length;
    const alert = q("[data-quality-alert]");
    alert.hidden = !issues;
    if (issues) {
      const a = el("a", { text: "See the data checks", attrs: { href: "#oc-quality" } });
      alert.replaceChildren(icon("alert", 18), el("span", { text: `${plural(issues, "data check needs", "data checks need")} a look; they change how the chart is drawn. ` }, a));
    }
  }

  function renderKpis() {
    const a = A();
    const o = org();
    const s = state.settings;
    const depts = a.departments.filter((d) => d.name !== NOT_RECORDED).length;
    const locs = a.locations.filter((d) => d.name !== NOT_RECORDED).length;
    const top = o.roots[0];
    const widest = a.span.widest;
    const tiles: [string, string, string][] = [
      ["People", int(a.people), [depts ? plural(depts, "department", "departments") : "", locs ? plural(locs, "location", "locations") : ""].filter(Boolean).join(", ") || "In the file."],
      [
        "Levels",
        int(a.levels),
        a.tops > 1 ? `${plural(a.tops, "person is", "people are")} at the top of a separate chart. See the data checks.` : top === undefined ? "" : `From ${displayName(o.people[top])} to the deepest team.`
      ],
      ["Managers", int(a.managers), `${pct0(a.managers, a.people)} of people have at least one direct report.`],
      ["Individual contributors per manager", a.icsPerManager === null ? "–" : dec1(a.icsPerManager), `${int(a.ics)} individual contributors ÷ ${int(a.managers)} managers.`],
      ["Median span of control", a.span.median === null ? "–" : num1(a.span.median), widest ? `Direct reports per manager. Widest: ${displayName(o.people[widest.i])}, ${widest.reports}.` : "No reporting lines found."],
      ["Spans outside your range", int(a.span.narrow + a.span.wide), `${int(a.span.narrow)} with fewer than ${s.narrowBelow}, ${int(a.span.wide)} with more than ${s.wideAbove}. Change the range under the chart.`]
    ];
    q("[data-kpis]").replaceChildren(...tiles.map(([dt, v, sub]) => el("div", { class: "oc-kpi" }, el("dt", { text: dt }), el("dd", { class: "oc-kpi-v", text: v }), el("dd", { class: "oc-kpi-s", text: sub }))));
  }

  /* ----- Drawing ----- */

  const tops = () => (state.focus === null ? org().roots : [state.focus]);
  const wideSet = () => new Set(A().span.rows.filter((r) => r.flag === "wide").map((r) => r.i));

  function drawChart() {
    const o = org();
    const lay = layoutChart(o.children, tops(), state.collapsed);
    state.layout = lay;
    const z = state.zoom;
    const wide = wideSet();
    const out: string[] = [
      `<svg class="oc-svg" xmlns="http://www.w3.org/2000/svg" width="${Math.round(lay.width * z)}" height="${Math.round(lay.height * z)}" viewBox="0 0 ${lay.width} ${lay.height}" aria-hidden="true" focusable="false">`,
      `<path class="oc-links" d="${linePath(lay.lines)}"/>`
    ];
    for (const b of lay.boxes) {
      const i = b.i;
      const p = o.people[i];
      const name = displayName(p);
      const meta = metaLine(p.dept, p.location);
      const kids = o.children[i].length;
      const closed = state.collapsed.has(i);
      const cls = `oc-box${i === state.selected ? " is-selected" : ""}${state.matches.has(i) ? " is-match" : ""}`;
      out.push(
        `<g class="${cls}" data-i="${i}" transform="translate(${r1(b.x)} ${r1(b.y)})">`,
        `<title>${esc([name, p.title, meta].filter(Boolean).join(", "))}</title>`,
        `<rect class="oc-box-bg" width="${W}" height="${H}" rx="9"/>`,
        `<rect x="6" y="10" width="4" height="${H - 20}" rx="2" fill="${colourOf(state.colours, p.dept)}"/>`,
        `<text class="oc-box-name" x="18" y="24">${esc(fit(name, W - 28, 14, true))}</text>`
      );
      if (p.title) out.push(`<text class="oc-box-title" x="18" y="43">${esc(fit(p.title, W - 28, 12))}</text>`);
      if (meta) out.push(`<text class="oc-box-meta" x="18" y="61">${esc(fit(meta, W - 28 - (kids ? 50 : 0), 11))}</text>`);
      if (kids) {
        const label = closed ? `+${o.below[i]}` : "−";
        const pw = closed ? 14 + label.length * 7 : 26;
        const tip = closed ? `Show ${name}'s team (${plural(o.below[i], "person", "people")})` : `Hide ${name}'s team`;
        out.push(
          `<g class="oc-toggle${wide.has(i) ? " is-wide" : ""}" data-toggle="${i}"><title>${esc(tip)}</title>`,
          `<rect x="${W - pw - 8}" y="${H - 25}" width="${pw}" height="19" rx="9.5"/>`,
          `<text x="${r1(W - 8 - pw / 2)}" y="${H - 11.5}" text-anchor="middle">${label}</text></g>`
        );
      }
      out.push(`</g>`);
    }
    out.push(`</svg>`);
    canvas.innerHTML = out.join("");
    q("[data-zoom-level]").textContent = `${Math.round(z * 100)}%`;
    const shown = lay.boxes.length;
    viewport.setAttribute("aria-label", `Org chart, ${plural(shown, "person", "people")} shown${shown < o.people.length ? ` of ${int(o.people.length)}` : ""}`);
  }

  const boxOf = (i: number) => state.layout?.boxes.find((b) => b.i === i);
  const fitZoom = () => {
    const l = state.layout!;
    return Math.max(MIN_ZOOM, Math.min(1, (viewport.clientWidth - 24) / l.width, (viewport.clientHeight - 24) / l.height));
  };
  function setZoom(z: number, about?: { x: number; y: number }) {
    const old = state.zoom;
    const cx = about?.x ?? (viewport.scrollLeft + viewport.clientWidth / 2) / old;
    const cy = about?.y ?? (viewport.scrollTop + viewport.clientHeight / 2) / old;
    state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    drawChart();
    viewport.scrollLeft = cx * state.zoom - viewport.clientWidth / 2;
    viewport.scrollTop = cy * state.zoom - viewport.clientHeight / 2;
  }
  function centreOn(i: number, smooth = true) {
    const b = boxOf(i);
    if (!b) return;
    const z = state.zoom;
    viewport.scrollTo({ left: (b.x + W / 2) * z - viewport.clientWidth / 2, top: (b.y + H / 2) * z - viewport.clientHeight / 2, behavior: smooth && !reduced() ? "smooth" : "auto" });
  }
  /** Start readable: fit when it fits, otherwise no smaller than 60%, with the top of the chart in view. */
  function resetView() {
    state.zoom = 1;
    drawChart();
    state.zoom = Math.min(1, Math.max(0.6, fitZoom()));
    drawChart();
    const first = tops()[0];
    if (first !== undefined) centreOn(first, false);
    viewport.scrollTop = 0;
  }
  /** Redraw without the given person's box jumping on screen. */
  function redrawKeeping(i: number) {
    const before = boxOf(i);
    const sx = before ? before.x * state.zoom - viewport.scrollLeft : 0;
    const sy = before ? before.y * state.zoom - viewport.scrollTop : 0;
    drawChart();
    const after = boxOf(i);
    if (before && after) {
      viewport.scrollLeft = after.x * state.zoom - sx;
      viewport.scrollTop = after.y * state.zoom - sy;
    }
  }

  root.querySelectorAll<HTMLButtonElement>("[data-zoom]").forEach((b) =>
    b.addEventListener("click", () => {
      const k = b.dataset.zoom;
      setZoom(k === "in" ? state.zoom * 1.25 : k === "out" ? state.zoom / 1.25 : fitZoom());
      announce(`Zoom ${Math.round(state.zoom * 100)}%.`);
    })
  );
  q("[data-expand-all]").addEventListener("click", () => {
    state.collapsed.clear();
    drawChart();
    syncTree();
    announce("Every team is shown.");
  });
  q("[data-collapse-all]").addEventListener("click", () => {
    state.collapsed = new Set();
    org().children.forEach((k, i) => k.length && org().level[i] >= 2 && state.collapsed.add(i));
    if (state.focus !== null) state.collapsed.delete(state.focus);
    drawChart();
    syncTree();
    resetView();
    announce("Showing the top two levels. Open a team with the + on its manager's box, or in the list below.");
  });

  /* Pan: drag with a mouse or pen (touch scrolls natively); arrow keys when the chart is selected. */
  let drag: { x: number; y: number; sl: number; st: number; moved: boolean; id: number } | null = null;
  let suppressClick = false;
  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.pointerType === "touch") return;
    drag = { x: e.clientX, y: e.clientY, sl: viewport.scrollLeft, st: viewport.scrollTop, moved: false, id: e.pointerId };
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");
    }
    viewport.scrollLeft = drag.sl - dx;
    viewport.scrollTop = drag.st - dy;
  });
  const endDrag = () => {
    if (!drag) return;
    if (drag.moved) {
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
    }
    viewport.classList.remove("is-dragging");
    drag = null;
  };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("keydown", (e) => {
    if (e.target !== viewport || e.altKey || e.ctrlKey || e.metaKey) return;
    const stepPx = e.shiftKey ? 240 : 60;
    switch (e.key) {
      case "ArrowLeft":
        viewport.scrollLeft -= stepPx;
        break;
      case "ArrowRight":
        viewport.scrollLeft += stepPx;
        break;
      case "ArrowUp":
        viewport.scrollTop -= stepPx;
        break;
      case "ArrowDown":
        viewport.scrollTop += stepPx;
        break;
      case "+":
      case "=":
        setZoom(state.zoom * 1.25);
        break;
      case "-":
      case "_":
        setZoom(state.zoom / 1.25);
        break;
      case "0":
        setZoom(fitZoom());
        break;
      default:
        return;
    }
    e.preventDefault();
  });
  canvas.addEventListener("click", (e) => {
    if (suppressClick) return;
    const t = e.target as Element;
    const tog = t.closest("[data-toggle]");
    if (tog) return toggle(Number(tog.getAttribute("data-toggle")));
    const box = t.closest("[data-i]");
    if (box) select(Number(box.getAttribute("data-i")), { centre: false });
  });

  /* ----- Collapse, select, focus ----- */

  function toggle(i: number, from: "chart" | "tree" = "chart") {
    if (!org().children[i].length) return;
    const opening = state.collapsed.has(i);
    if (opening) state.collapsed.delete(i);
    else state.collapsed.add(i);
    if (boxOf(i)) redrawKeeping(i);
    syncTree();
    if (state.selected === i) renderPerson();
    if (from === "chart") announce(`${displayName(org().people[i])}'s team is ${opening ? "shown" : "hidden"}.`);
  }

  function reveal(i: number) {
    for (const m of managersAbove(org(), i)) state.collapsed.delete(m);
    if (state.focus !== null && !isWithin(org(), i, state.focus)) {
      state.focus = null;
      renderFocusBar();
    }
  }

  function select(i: number, opts: { centre?: boolean; treeFocus?: boolean } = {}) {
    state.selected = i;
    reveal(i);
    drawChart();
    if (opts.centre !== false) centreOn(i);
    syncTree();
    const li = treeItem(i);
    tree.querySelectorAll("[aria-selected=true]").forEach((x) => x.setAttribute("aria-selected", "false"));
    li?.setAttribute("aria-selected", "true");
    if (opts.treeFocus && li) setTreeFocus(li);
    renderPerson();
    const p = org().people[i];
    announce(`Selected ${displayName(p)}${p.title ? `, ${p.title}` : ""}.`);
  }

  function setFocus(i: number | null) {
    state.focus = i;
    if (i !== null) {
      state.collapsed.delete(i);
      if (state.selected !== null && !isWithin(org(), state.selected, i)) state.selected = i;
    }
    renderFocusBar();
    resetView();
    renderPerson();
    const o = org();
    announce(i === null ? "Showing everyone." : `Showing ${displayName(o.people[i])}'s team: ${plural(o.below[i] + 1, "person", "people")}.`);
  }

  function renderFocusBar() {
    const bar = q("[data-focusbar]");
    const i = state.focus;
    bar.hidden = i === null;
    if (i === null) return bar.replaceChildren();
    const o = org();
    const above = managersAbove(o, i).reverse();
    const parts: (Node | string)[] = [el("span", {}, "Showing ", el("strong", { text: `${displayName(o.people[i])}'s team` }), `: ${plural(o.below[i] + 1, "person", "people")}.`)];
    if (above.length) {
      const crumbs = el("span", { class: "oc-crumbs" }, "Above them:");
      above.forEach((m, k) => {
        crumbs.append(el("button", { class: "oc-linkbtn", text: displayName(o.people[m]), attrs: { type: "button", "data-focus": String(m) } }));
        if (k < above.length - 1) crumbs.append("›");
      });
      parts.push(crumbs);
    }
    parts.push(el("button", { class: "btn btn-secondary btn-sm", text: "Show everyone", attrs: { type: "button", "data-focus": "" } }));
    bar.replaceChildren(...parts);
  }
  q("[data-focusbar]").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-focus]");
    if (b) setFocus(b.dataset.focus === "" ? null : Number(b.dataset.focus));
  });

  function topReason(i: number): string {
    const o = org();
    const u = o.unresolved.get(i);
    switch (o.topReason[i]) {
      case "self":
        return "At the top: listed as their own manager.";
      case "notFound":
        return `At the top of a separate chart: their manager “${u?.text ?? ""}” isn't in the file.`;
      case "ambiguous":
        return `At the top of a separate chart: “${u?.text ?? ""}” matches more than one person.`;
      case "loop":
        return "At the top of a separate chart, to break a reporting loop. See the data checks.";
      default:
        return o.roots.length > 1 ? "No manager in the file, so at the top of a separate chart." : "At the top of the chart.";
    }
  }
  function flagsFor(i: number): { text: string; tone: "warn" | "bad" | "info" }[] {
    const o = org();
    const a = A();
    const s = state.settings;
    const out: { text: string; tone: "warn" | "bad" | "info" }[] = [];
    const span = a.span.rows.find((r) => r.i === i);
    if (span?.flag === "wide") out.push({ text: `More than ${s.wideAbove} direct reports`, tone: "warn" });
    if (span?.flag === "narrow") out.push({ text: `Fewer than ${s.narrowBelow} direct reports`, tone: "info" });
    if (a.spof.some((x) => x.i === i)) out.push({ text: "Single point of failure", tone: "warn" });
    const t = o.topReason[i];
    if (t === "notFound" || t === "ambiguous") out.push({ text: "Manager not found", tone: "bad" });
    if (o.loops.some((l) => l.includes(i))) out.push({ text: "In a reporting loop", tone: "bad" });
    return out;
  }
  const flagChip = (f: { text: string; tone: string }) => el("span", { class: `oc-flag oc-flag-${f.tone}`, text: f.text });

  function renderPerson() {
    const i = state.selected;
    personPanel.hidden = i === null;
    if (i === null) return personPanel.replaceChildren();
    const o = org();
    const p = o.people[i];
    const boss = o.parent[i];
    const kids = o.children[i].length;
    const rows: (Node | string)[] = [
      el("p", { class: "oc-person-name", text: displayName(p) }),
      el("p", { class: "oc-person-meta", text: [p.title, p.dept, p.location, p.id ? `ID ${p.id}` : ""].filter(Boolean).join(" · ") || "No other details in the file." })
    ];
    rows.push(
      boss === null
        ? el("p", { text: topReason(i) })
        : el("p", {}, "Reports to ", el("button", { class: "oc-linkbtn", text: displayName(o.people[boss]), attrs: { type: "button", "data-select": String(boss) } }), ".")
    );
    rows.push(
      el("p", { text: kids ? `${plural(kids, "direct report", "direct reports")}, ${plural(o.below[i], "person", "people")} in all. Level ${o.level[i]}.` : `Individual contributor. Level ${o.level[i]}.` })
    );
    const flags = flagsFor(i);
    if (flags.length) rows.push(el("p", { class: "oc-row-actions" }, ...flags.map(flagChip)));
    const actions = el("div", { class: "oc-row-actions" });
    if (kids) {
      actions.append(
        state.focus === i
          ? el("button", { class: "btn btn-secondary btn-sm", text: "Show everyone", attrs: { type: "button", "data-person-focus": "" } })
          : el("button", { class: "btn btn-secondary btn-sm", text: "Show only this team", attrs: { type: "button", "data-person-focus": String(i) } }),
        el("button", { class: "btn btn-ghost btn-sm", text: state.collapsed.has(i) ? "Show their team" : "Hide their team", attrs: { type: "button", "data-person-toggle": String(i) } })
      );
    }
    actions.append(el("button", { class: "btn btn-ghost btn-sm", text: "Find in the list", attrs: { type: "button", "data-person-tree": String(i) } }));
    rows.push(actions);
    personPanel.replaceChildren(...rows);
  }
  personPanel.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!b) return;
    if (b.dataset.select) select(Number(b.dataset.select));
    else if (b.dataset.personFocus !== undefined) setFocus(b.dataset.personFocus === "" ? null : Number(b.dataset.personFocus));
    else if (b.dataset.personToggle) {
      toggle(Number(b.dataset.personToggle));
      renderPerson();
      personPanel.querySelector<HTMLButtonElement>("[data-person-toggle]")?.focus();
    } else if (b.dataset.personTree) {
      const li = treeItem(Number(b.dataset.personTree));
      if (li) {
        setTreeFocus(li);
        li.scrollIntoView({ block: "nearest" });
      }
    }
  });

  function renderLegend() {
    const counts = new Map<string, { name: string; n: number }>();
    for (const p of org().people) {
      const k = p.dept.toLowerCase();
      const c = counts.get(k);
      if (c) c.n++;
      else counts.set(k, { name: p.dept || NOT_RECORDED, n: 1 });
    }
    const list = [...counts.entries()].sort((a, b) => b[1].n - a[1].n);
    const legend = q("[data-legend]");
    legend.hidden = state.map.dept === undefined;
    legend.replaceChildren(
      ...list.slice(0, 12).map(([k, c]) => {
        const sw = el("span", { class: "oc-sw", attrs: { "aria-hidden": "true" } });
        sw.style.setProperty("--k", colourOf(state.colours, k));
        return el("li", {}, sw, `${c.name} `, el("b", { text: int(c.n) }));
      })
    );
    if (list.length > 12) legend.append(el("li", { text: `and ${plural(list.length - 12, "more department", "more departments")}` }));
  }

  /* ----- Search ----- */

  const searchStatus = q("[data-search-status]");
  function hits(): number[] {
    const v = search.value.trim().toLowerCase();
    if (!v) return [];
    const o = org();
    const out: { i: number; rank: number }[] = [];
    o.people.forEach((p, i) => {
      const name = p.name.toLowerCase();
      const rank = name.startsWith(v) ? 0 : name.includes(v) ? 1 : p.id.toLowerCase() === v ? 0 : [p.title, p.id, p.dept, p.location].some((x) => x.toLowerCase().includes(v)) ? 2 : -1;
      if (rank >= 0) out.push({ i, rank });
    });
    return out.sort((a, b) => a.rank - b.rank || a.i - b.i).map((x) => x.i);
  }
  function runSearch() {
    const list = hits();
    state.matches = new Set(list);
    drawChart();
    if (!search.value.trim()) {
      results.hidden = true;
      searchStatus.textContent = "";
      return;
    }
    const o = org();
    results.replaceChildren(
      ...(list.length
        ? list.slice(0, 8).map((i) => {
            const p = o.people[i];
            return el(
              "li",
              {},
              el("button", { attrs: { type: "button", "data-hit": String(i) } }, el("span", { text: displayName(p) }), el("span", { class: "oc-r-sub", text: [p.title, p.dept, p.location].filter(Boolean).join(" · ") }))
            );
          })
        : [el("li", { class: "oc-r-none", text: "No one matches. Try part of a name or job title." })])
    );
    results.hidden = false;
    searchStatus.textContent = list.length ? `${plural(list.length, "match", "matches")}${list.length > 8 ? ", the first 8 listed" : ""}. Press the down arrow to choose one.` : "No one matches.";
  }
  let searchTimer = 0;
  search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(runSearch, 120);
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && !results.hidden) {
      results.querySelector<HTMLButtonElement>("button")?.focus();
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
      const first = hits()[0];
      if (first !== undefined) chooseHit(first);
    } else if (e.key === "Escape") {
      results.hidden = true;
    }
  });
  results.addEventListener("keydown", (e) => {
    const items = [...results.querySelectorAll<HTMLButtonElement>("button")];
    const k = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown" && k < items.length - 1) items[k + 1].focus();
    else if (e.key === "ArrowUp") (k > 0 ? items[k - 1] : search).focus();
    else if (e.key === "Escape") {
      results.hidden = true;
      search.focus();
    } else return;
    e.preventDefault();
  });
  results.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-hit]");
    if (b) chooseHit(Number(b.dataset.hit));
  });
  q(".oc-find").addEventListener("focusout", (e) => {
    const to = (e as FocusEvent).relatedTarget as Node | null;
    if (!to || !q(".oc-find").contains(to)) results.hidden = true;
  });
  function chooseHit(i: number) {
    results.hidden = true;
    select(i);
    viewport.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
  }

  /* ----- Tree view (WAI-ARIA tree pattern, roving tabindex) ----- */

  const treeItem = (i: number) => tree.querySelector<HTMLLIElement>(`li[data-i="${i}"]`);
  function buildTree() {
    const o = org();
    const make = (i: number, level: number, pos: number, size: number): HTMLLIElement => {
      const p = o.people[i];
      const kids = o.children[i];
      const li = el("li", {
        attrs: { role: "treeitem", "aria-level": String(level), "aria-setsize": String(size), "aria-posinset": String(pos), "aria-selected": String(i === state.selected), tabindex: "-1", "data-i": String(i) }
      });
      const row = el("span", { class: "oc-ti-row" }, el("span", { class: kids.length ? "oc-ti-chev" : "oc-ti-leaf", attrs: { "aria-hidden": "true" } }), el("span", { class: "oc-ti-name", text: displayName(p) }));
      if (p.title) row.append(el("span", { class: "oc-ti-title", text: p.title }));
      const meta = [metaLine(p.dept, p.location), kids.length ? `${plural(kids.length, "direct report", "direct reports")}${o.below[i] > kids.length ? `, ${int(o.below[i])} in all` : ""}` : ""].filter(Boolean).join(" · ");
      if (meta) row.append(el("span", { class: "oc-ti-meta", text: meta }));
      for (const f of flagsFor(i)) row.append(flagChip(f));
      li.append(row);
      if (kids.length) {
        li.setAttribute("aria-expanded", String(!state.collapsed.has(i)));
        const group = el("ul", { attrs: { role: "group" } });
        kids.forEach((c, k) => group.append(make(c, level + 1, k + 1, kids.length)));
        group.hidden = state.collapsed.has(i);
        li.append(group);
      }
      return li;
    };
    const roots = o.roots;
    tree.replaceChildren(...roots.map((r, k) => make(r, 1, k + 1, roots.length)));
    const start = (state.selected !== null && treeItem(state.selected)) || tree.querySelector<HTMLLIElement>("li");
    start?.setAttribute("tabindex", "0");
  }
  /** Bring the tree's open and closed teams in line with the chart. */
  function syncTree() {
    tree.querySelectorAll<HTMLLIElement>("li[aria-expanded]").forEach((li) => {
      const i = Number(li.dataset.i);
      const open = !state.collapsed.has(i);
      li.setAttribute("aria-expanded", String(open));
      const g = li.querySelector<HTMLElement>(":scope > ul");
      if (g) g.hidden = !open;
    });
    if (state.selected !== null) {
      const li = treeItem(state.selected);
      if (li && li.closest("ul[role=group][hidden]") === null) {
        tree.querySelectorAll("li[tabindex='0']").forEach((x) => x.setAttribute("tabindex", "-1"));
        li.setAttribute("tabindex", "0");
      }
    }
    // The roving tab stop must be visible.
    const stop = tree.querySelector<HTMLLIElement>("li[tabindex='0']");
    if (!stop || stop.closest("ul[role=group][hidden]")) {
      stop?.setAttribute("tabindex", "-1");
      tree.querySelector("li")?.setAttribute("tabindex", "0");
    }
  }
  const visibleItems = () => [...tree.querySelectorAll<HTMLLIElement>("li[role=treeitem]")].filter((li) => !li.closest("ul[role=group][hidden]"));
  function setTreeFocus(li: HTMLLIElement) {
    tree.querySelectorAll("li[tabindex='0']").forEach((x) => x.setAttribute("tabindex", "-1"));
    li.setAttribute("tabindex", "0");
    li.focus();
  }
  tree.addEventListener("keydown", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLLIElement>("li[role=treeitem]");
    if (!li || e.altKey || e.ctrlKey || e.metaKey) return;
    const i = Number(li.dataset.i);
    const items = visibleItems();
    const k = items.indexOf(li);
    const expandable = li.hasAttribute("aria-expanded");
    const open = li.getAttribute("aria-expanded") === "true";
    switch (e.key) {
      case "ArrowDown":
        if (k < items.length - 1) setTreeFocus(items[k + 1]);
        break;
      case "ArrowUp":
        if (k > 0) setTreeFocus(items[k - 1]);
        break;
      case "ArrowRight":
        if (expandable && !open) toggle(i, "tree");
        else if (expandable) setTreeFocus(li.querySelector<HTMLLIElement>(":scope > ul > li")!);
        break;
      case "ArrowLeft":
        if (expandable && open) toggle(i, "tree");
        else {
          const parent = li.parentElement?.closest<HTMLLIElement>("li[role=treeitem]");
          if (parent) setTreeFocus(parent);
        }
        break;
      case "Home":
        setTreeFocus(items[0]);
        break;
      case "End":
        setTreeFocus(items[items.length - 1]);
        break;
      case "Enter":
      case " ":
        select(i);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const ch = e.key.toLowerCase();
          const order = [...items.slice(k + 1), ...items.slice(0, k + 1)];
          const hit = order.find((x) => (x.querySelector(".oc-ti-name")?.textContent ?? "").toLowerCase().startsWith(ch));
          if (hit) setTreeFocus(hit);
          break;
        }
        return;
    }
    e.preventDefault();
  });
  tree.addEventListener("click", (e) => {
    const row = (e.target as HTMLElement).closest(".oc-ti-row");
    const li = row?.parentElement as HTMLLIElement | null;
    if (!row || !li) return;
    const i = Number(li.dataset.i);
    setTreeFocus(li);
    if ((e.target as HTMLElement).closest(".oc-ti-chev")) toggle(i, "tree");
    else select(i);
  });

  /* ----- Structure ----- */

  const nameButton = (i: number) => el("button", { class: "oc-linkbtn", text: displayName(org().people[i]), attrs: { type: "button", "data-select": String(i) } });
  const empty = (text: string) => el("p", { class: "oc-empty", text });

  function renderStructure() {
    const a = A();
    const o = org();
    const s = state.settings;
    q("[data-span-sub]").textContent = a.span.rows.length
      ? `${plural(a.span.rows.length, "manager", "managers")}. Median ${num1(a.span.median ?? 0)} direct reports, average ${dec1(a.span.mean ?? 0)}. ${int(a.span.narrow)} below your range and ${int(a.span.wide)} above it.`
      : "No one in the file has a direct report.";
    const shown = state.spanAll ? a.span.rows : a.span.rows.slice(0, 12);
    const spanWrap = q("[data-span]");
    if (!a.span.rows.length) spanWrap.replaceChildren(empty("Add a manager column to see who manages whom."));
    else {
      const rows = shown.map((r) => {
        const p = o.people[r.i];
        const flag = r.flag === "wide" ? flagChip({ text: `More than ${s.wideAbove}`, tone: "warn" }) : r.flag === "narrow" ? flagChip({ text: `Fewer than ${s.narrowBelow}`, tone: "info" }) : "–";
        return [nameButton(r.i), p.title || "–", p.dept || "–", int(r.reports), int(r.below), flag];
      });
      spanWrap.replaceChildren(table("Managers by number of direct reports, widest first", ["Manager", "Job title", "Department", "Direct reports", "People in all", "Your range"], rows, [3, 4]));
      if (a.span.rows.length > 12) {
        const more = el("button", {
          class: "btn btn-ghost btn-sm",
          text: state.spanAll ? "Show the widest 12 only" : `Show all ${int(a.span.rows.length)} managers`,
          attrs: { type: "button", "data-span-all": "", "aria-expanded": String(state.spanAll) }
        });
        spanWrap.append(more);
      }
    }
    q("[data-one]").replaceChildren(
      a.oneReport.length
        ? table("Managers with exactly one direct report", ["Manager", "Their one direct report", "Department"], a.oneReport.map((x) => [nameButton(x.i), nameButton(x.report), o.people[x.i].dept || "–"]))
        : empty(a.span.rows.length ? "No manager has only one direct report." : "No reporting lines found.")
    );
    q("[data-spof-def]").textContent =
      `Here this means the only person in a department who manages anyone, with at least ${s.spofMin} of the department's people in their reporting line. ` +
      "If they left, no one else in the department leads its people. It is a prompt for succession planning, not a judgement on the person.";
    q("[data-spof-list]").replaceChildren(
      state.map.dept === undefined
        ? empty("Add a department column to see this.")
        : a.spof.length
          ? table("Single points of failure", ["Manager", "Department", "Department's people in their line", "People in the department"], a.spof.map((x) => [nameButton(x.i), x.dept, int(x.inLine), int(x.deptPeople)]), [2, 3])
          : empty(`No department has a single manager with ${s.spofMin} or more of its people under them.`)
    );
    const groupRows = (list: GroupRow[]) => list.map((g) => [g.name, int(g.people), int(g.managers), int(g.ics), `${Math.round(g.share)}%`, int(g.managerElsewhere)]);
    q("[data-depts]").replaceChildren(
      state.map.dept === undefined
        ? empty("Add a department column to see the department breakdown.")
        : table("Departments, largest first", ["Department", "People", "Managers", "Individual contributors", "Share of everyone", "Manager in another department"], groupRows(a.departments), [1, 2, 3, 4, 5])
    );
    q("[data-locations]").replaceChildren(
      state.map.location === undefined
        ? empty("Add a location column to see the location breakdown.")
        : table("Locations, largest first", ["Location", "People", "Managers", "Individual contributors", "Share of everyone", "Manager in another location"], groupRows(a.locations), [1, 2, 3, 4, 5])
    );
  }
  steps.chart.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const sel = t.closest<HTMLButtonElement>(".oc-card [data-select], .oc-structure [data-select]");
    if (sel && !personPanel.contains(sel)) {
      select(Number(sel.dataset.select));
      viewport.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
      return;
    }
    if (t.closest("[data-span-all]")) {
      state.spanAll = !state.spanAll;
      renderStructure();
      q<HTMLButtonElement>("[data-span-all]").focus();
    }
  });

  /* ----- Settings: the user's own thresholds ----- */

  function writeSettings() {
    for (const [k, v] of Object.entries(state.settings)) {
      const input = settingsForm.elements.namedItem(k) as HTMLInputElement | null;
      if (input) input.value = String(v);
    }
  }
  let settingsTimer = 0;
  function readSettings() {
    const get = (k: keyof Settings) => (settingsForm.elements.namedItem(k) as HTMLInputElement).value;
    state.settings = cleanSettings({ narrowBelow: Number(get("narrowBelow")), wideAbove: Number(get("wideAbove")), spofMin: Number(get("spofMin")) });
    state.analysis = analyse(org(), state.settings);
    renderKpis();
    renderStructure();
    drawChart();
    buildTree();
    renderPerson();
    if (keepBox.checked) saveSession();
    announce(`Range set to ${state.settings.narrowBelow} to ${state.settings.wideAbove} direct reports. ${plural(A().span.narrow + A().span.wide, "manager is", "managers are")} outside it.`);
  }
  settingsForm.addEventListener("input", () => {
    clearTimeout(settingsTimer);
    settingsTimer = window.setTimeout(readSettings, 400);
  });
  settingsForm.addEventListener("change", () => {
    clearTimeout(settingsTimer);
    readSettings();
    writeSettings();
  });
  settingsForm.addEventListener("submit", (e) => e.preventDefault());
  q("[data-settings-reset]").addEventListener("click", () => {
    state.settings = { ...DEFAULT_SETTINGS };
    writeSettings();
    readSettings();
  });

  /* ----- Data checks ----- */

  const STATUS: Record<CheckStatus, { label: string; icon: IconName }> = {
    fix: { label: "Fix", icon: "x-circle" },
    review: { label: "Review", icon: "alert" },
    note: { label: "Note", icon: "info" },
    ok: { label: "Passed", icon: "check-circle" }
  };
  function renderQuality() {
    q("[data-quality-summary]").textContent = checkSummary(state.checks).text;
    const summary = (status: CheckStatus, title: string, count: string) =>
      el(
        "summary",
        {},
        el("span", { class: `oc-st oc-st-${status}` }, icon(STATUS[status].icon, 15), STATUS[status].label),
        el("span", { class: "oc-check-title", text: title }),
        el("span", { class: "oc-check-count", text: count }),
        el("span", { class: "oc-check-chev", attrs: { "aria-hidden": "true" } }, icon("chevron-down", 18))
      );
    const items: HTMLElement[] = state.checks
      .filter((c) => c.status !== "ok")
      .map((c) => {
        const body = el("div", { class: "oc-check-body" }, el("p", { text: c.effect }));
        const shown = c.rows.slice(0, 50);
        if (shown.length) body.append(table(`${c.title}: rows to check`, ["Row", "Employee ID", "Name", "Detail"], shown.map((r) => [String(r.row), r.id || "–", r.name || "–", r.detail])));
        if (c.rows.length > shown.length) body.append(el("p", { text: `And ${plural(c.rows.length - shown.length, "more row", "more rows")}.` }));
        return el("details", { class: "oc-check" }, summary(c.status, c.title, affected(c)), body);
      });
    const passed = state.checks.filter((c) => c.status === "ok");
    if (passed.length) {
      const list = el("ul", { class: "oc-passed" }, ...passed.map((c) => el("li", {}, el("b", { text: c.title }), `: ${c.effect.charAt(0).toLowerCase()}${c.effect.slice(1)}`)));
      items.push(el("details", { class: "oc-check" }, summary("ok", `${plural(passed.length, "other check", "other checks")} found nothing`, ""), el("div", { class: "oc-check-body" }, list)));
    }
    q("[data-quality-list]").replaceChildren(...items);
  }

  /* ----- Header actions ----- */

  q("[data-remap]").addEventListener("click", () => {
    renderMapping();
    showStep("map");
  });
  q("[data-new]").addEventListener("click", () => {
    renderSaved();
    showLoadError("");
    showStep("load");
  });

  /* ----- Downloads: SVG, PNG and PowerPoint, all made on this device ----- */

  const exportTitle = () => (state.focus === null ? "Org chart" : `${displayName(org().people[state.focus])}'s team`);
  const stem = () => `${state.focus === null ? "org-chart" : `team-${displayName(org().people[state.focus]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}-${isoDate(state.today)}`;
  function exportSvg(): { svg: string; w: number; h: number } {
    const o = org();
    const lay = layoutChart(o.children, tops(), state.collapsed);
    return { svg: chartSvg(o, lay, { title: exportTitle(), collapsed: state.collapsed }), w: lay.width, h: lay.height };
  }
  /** Draw the SVG on a canvas. Very large charts are scaled down to stay within browser limits. */
  async function toCanvas(svg: string, w: number, h: number, maxScale: number): Promise<{ canvas: HTMLCanvasElement; scale: number }> {
    const scale = Math.min(maxScale, 16000 / w, 16000 / h, Math.sqrt(100_000_000 / (w * h)));
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("The chart image couldn't be drawn."));
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * scale));
    c.height = Math.max(1, Math.round(h * scale));
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return { canvas: c, scale };
  }
  const exportNote = q("[data-export-note]");
  async function runExport(btn: HTMLButtonElement, kind: string) {
    const label = btn.querySelector("[data-label]")!;
    const old = label.textContent;
    btn.disabled = true;
    label.textContent = "Preparing…";
    try {
      const { svg, w, h } = exportSvg();
      if (kind === "svg") {
        download(`${stem()}.svg`, new Blob([svg], { type: "image/svg+xml" }));
        announce("SVG image downloaded.");
      } else if (kind === "png") {
        const { canvas: c, scale } = await toCanvas(svg, w, h, 2);
        const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
        download(`${stem()}.png`, blob);
        const small = scale < 1;
        announce(`PNG image downloaded${small ? ", scaled down because the chart is very large. Use SVG for full detail" : ""}.`);
        if (small) exportNote.textContent = "The chart is very large, so the PNG is scaled down. The SVG keeps full detail; or show one team at a time.";
      } else {
        const { canvas: c } = await toCanvas(svg, w, h, Math.min(2, 3200 / Math.max(w, h)));
        const { makePptx } = await import("./pptx");
        const o = org();
        const blob = await makePptx({
          org: o,
          analysis: A(),
          settings: state.settings,
          tops: tops(),
          image: { data: c.toDataURL("image/png").replace(/^data:/, ""), w: c.width, h: c.height },
          title: exportTitle(),
          source: state.source?.kind === "sample" ? "Sample data (made up)" : (state.source?.name ?? ""),
          date: dateLabel(state.today),
          hasDept: state.map.dept !== undefined
        });
        download(`${stem()}.pptx`, blob);
        announce("PowerPoint file downloaded.");
      }
    } catch (e) {
      console.error(e);
      announce("The file couldn't be made. Try again, or download the SVG instead.");
      exportNote.textContent = "The file couldn't be made. Try again, or download the SVG instead.";
    } finally {
      btn.disabled = false;
      label.textContent = old;
    }
  }
  root.querySelectorAll<HTMLButtonElement>("[data-export]").forEach((b) => b.addEventListener("click", () => void runExport(b, b.dataset.export ?? "svg")));

  /* ----- Start ----- */
  renderSaved();
}
