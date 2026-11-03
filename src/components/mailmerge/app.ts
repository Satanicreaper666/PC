/**
 * Mail merge: the page behaviour. Choose a letter, load a list, match the
 * columns, check the rows, preview each letter, then download them all as one
 * Word file (one letter per page), print them all or copy one.
 *
 * Text from the file is only ever inserted with textContent, or escaped by
 * the merge (src/lib/mailmerge/merge.ts); the letter HTML itself is the
 * site's own, built with the page.
 */
import { isoDate, today as todayNum } from "../../lib/analytics/dates.ts";
import { cellText, type Cell } from "../../lib/analytics/fields.ts";
import type { MergeField, MergeTemplate } from "../../lib/mailmerge/library.ts";
import { autoMap, dateOrderFor, fileStem, findMergeHeaderRow, templateCsv, type MergeMap } from "../../lib/mailmerge/mapping.ts";
import { mergeHtml, mergeNodes, plainText, toHtml, type MergeOptions } from "../../lib/mailmerge/merge.ts";
import { checkRows, problemText, summarise, unmappedRequired, type RowResult, type RowStatus } from "../../lib/mailmerge/rows.ts";
import { sampleMergeTable, SAMPLE_ROWS } from "../../lib/mailmerge/sample.ts";
import { longDate, readValue, type DateOrder } from "../../lib/mailmerge/values.ts";
import { bestSheet, LoadError, readEmployeeFile, type Sheet } from "../analytics/load.ts";

/** Letters in one run. More than this makes a slow, very large Word file. */
const MAX_ROWS = 1000;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: { class?: string; text?: string; attrs?: Record<string, string> } = {}, ...kids: (Node | string)[]) {
  const e = document.createElement(tag);
  if (props.class) e.className = props.class;
  if (props.text !== undefined) e.textContent = props.text;
  for (const [k, v] of Object.entries(props.attrs ?? {})) e.setAttribute(k, v);
  e.append(...kids);
  return e;
}
const colLetter = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : colLetter(Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)));
const count = (n: number) => n.toLocaleString("en-IN");
const plural = (n: number, one: string, many: string) => `${count(n)} ${n === 1 ? one : many}`;
const short = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);
const STATUS: Record<RowStatus, { label: string; cls: string }> = {
  ready: { label: "Ready", cls: "mm-pill-ready" },
  check: { label: "Check", cls: "mm-pill-check" },
  fix: { label: "Needs fixing", cls: "mm-pill-fix" }
};
const pill = (status: RowStatus, text = STATUS[status].label) => el("span", { class: `mm-pill ${STATUS[status].cls}`, text });

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = el("a", { attrs: { href: url, download: name } });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function mountMailMerge(root: HTMLElement) {
  const q = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const library = JSON.parse(q("[data-mm-library]").textContent ?? "[]") as MergeTemplate[];
  const live = q("[data-announce]");
  const tplSel = q<HTMLSelectElement>("[data-template]");
  const fileInput = q<HTMLInputElement>("[data-file]");
  const drop = q("[data-drop]");
  const loadError = q("[data-load-error]");
  const busy = q("[data-busy]");
  const mapRows = q("[data-map-rows]");
  const sheetSel = q<HTMLSelectElement>("[data-sheet]");
  const dateSel = q<HTMLSelectElement>("[data-dateorder]");
  const rowSel = q<HTMLSelectElement>("[data-row]");
  const preview = q("[data-preview]");
  const includeBox = q<HTMLInputElement>("[data-include]");
  const docxBtn = q<HTMLButtonElement>("[data-docx]");
  const printBtn = q<HTMLButtonElement>("[data-print]");

  const state = {
    t: library.find((x) => x.id === tplSel.value) ?? library[0],
    source: null as null | { kind: "file" | "sample"; name: string },
    sheets: [] as Sheet[],
    sheetIndex: 0,
    headers: [] as string[],
    rows: [] as Cell[][],
    firstRow: 2,
    truncated: 0,
    map: {} as MergeMap,
    order: "dmy" as DateOrder,
    orderTouched: false,
    ambiguous: false,
    results: [] as RowResult[],
    current: 0,
    today: todayNum()
  };

  const announce = (msg: string) => {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = msg));
  };
  const isLetter = () => state.t.kind === "letter";
  const field = (id: string) => state.t.fields.find((f) => f.id === id)!;
  const outOpts = (): MergeOptions => ({ today: longDate(state.today), keepEmpty: !isLetter(), blank: "line" });
  const outRows = () => state.results.filter((r) => r.status !== "fix" || includeBox.checked);
  const noun = (n: number) => (isLetter() ? (n === 1 ? "letter" : "letters") : n === 1 ? "form" : "forms");

  function focusStep(step: "map" | "out") {
    const s = q(`[data-step=${step}]`);
    s.querySelector<HTMLElement>(".mm-h")?.focus({ preventScroll: true });
    s.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  const showSteps = (on: boolean) => root.querySelectorAll<HTMLElement>("[data-step]").forEach((s) => (s.hidden = !on));

  /* ===== Step 1: the letter ===== */

  function renderTemplateInfo() {
    const t = state.t;
    const req = t.fields.filter((f) => f.required).length;
    q("[data-template-about]").textContent =
      `${plural(t.fields.length, "detail", "details")} to fill in${isLetter() ? `, ${count(req)} of them required` : ", most of them by hand after printing"}. ` +
      `The text is the same as on the ${t.title.toLowerCase()} page.`;
    q<HTMLAnchorElement>("[data-template-link]").href = `/toolkit/${t.id}/`;
    q("[data-template-link-text]").textContent = `Fill in one ${isLetter() ? "letter" : "form"} on its own page`;
  }
  tplSel.addEventListener("change", () => {
    const before = state.map;
    state.t = library.find((x) => x.id === tplSel.value) ?? state.t;
    renderTemplateInfo();
    if (state.source?.kind === "sample") loadSample(false);
    else if (state.sheets.length) {
      prepare(before);
      renderAll();
    }
    announce(`${state.t.title} chosen.${state.sheets.length ? " The columns were matched again; check them below." : ""}`);
  });
  q("[data-csv]").addEventListener("click", () => {
    downloadBlob(`${state.t.id}-template.csv`, new Blob(["﻿" + templateCsv(state.t)], { type: "text/csv;charset=utf-8" }));
    announce(`CSV template for the ${state.t.title.toLowerCase()} downloaded. Add one row per ${noun(1)}, then load it here.`);
  });

  /* ===== Step 2: the list ===== */

  const showLoadError = (msg: string) => {
    loadError.textContent = msg;
    loadError.hidden = !msg;
  };
  const filled = (r: Cell[]) => r.some((c) => cellText(c) !== "");

  /** Header row, data rows (at most MAX_ROWS filled ones) and the automatic column matches. */
  function prepare(previous: MergeMap = {}) {
    const all = state.sheets[state.sheetIndex]?.rows ?? [];
    const h = findMergeHeaderRow(all, state.t);
    const body = all.slice(h + 1);
    let seen = 0;
    let end = body.length;
    for (let k = 0; k < body.length; k++) {
      if (!filled(body[k])) continue;
      if (++seen > MAX_ROWS) {
        end = k;
        break;
      }
    }
    state.truncated = Math.max(0, body.filter(filled).length - MAX_ROWS);
    state.rows = body.slice(0, end);
    const width = Math.max(all[h]?.length ?? 0, ...state.rows.slice(0, 50).map((r) => r.length));
    state.headers = Array.from({ length: width }, (_, j) => cellText(all[h]?.[j] ?? null) || `Column ${colLetter(j)}`);
    state.firstRow = h + 2;
    const a = autoMap(state.t, state.headers, state.rows);
    // Keep values typed for every letter when the new letter has the same detail.
    for (const [id, s] of Object.entries(previous)) if ("fixed" in s && !a.map[id] && state.t.fields.some((f) => f.id === id)) a.map[id] = s;
    state.map = a.map;
    if (!state.orderTouched) state.order = a.dateOrder;
    state.ambiguous = a.dateAmbiguous;
    state.current = 0;
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    showLoadError("");
    busy.hidden = false;
    try {
      const loaded = await readEmployeeFile(file);
      state.source = { kind: "file", name: loaded.fileName };
      state.sheets = loaded.sheets;
      state.sheetIndex = bestSheet(loaded.sheets);
      prepare(state.map);
      if (!state.rows.some(filled)) throw new LoadError("The file has a header row but no rows under it. Add one row per letter and try again.");
      renderAll();
      showSteps(true);
      focusStep("map");
      const matched = Object.values(state.map).filter((s) => "col" in s).length;
      announce(`Read ${file.name}: ${plural(state.results.length, "row", "rows")}. ${matched} of ${state.t.fields.length} details matched to columns. Check them.`);
    } catch (e) {
      if (!(e instanceof LoadError)) console.error(e);
      showLoadError(e instanceof LoadError ? e.message : "This file couldn't be read. Check that it is a CSV or Excel file with a header row and one row per letter, then try again.");
    } finally {
      busy.hidden = true;
    }
  }
  function loadSample(focus = true) {
    const s = sampleMergeTable(state.t, state.today);
    state.source = { kind: "sample", name: "Sample data" };
    state.sheets = [{ name: "", rows: [s.headers, ...s.rows] }];
    state.sheetIndex = 0;
    showLoadError("");
    prepare({});
    renderAll();
    showSteps(true);
    if (focus) {
      focusStep("out");
      announce(`Sample data loaded: ${SAMPLE_ROWS} made-up people, two of them with a deliberate mistake.`);
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
  q("[data-sample]").addEventListener("click", () => loadSample());
  q("[data-restart]").addEventListener("click", () => {
    drop.scrollIntoView({ block: "center" });
    q<HTMLButtonElement>("[data-pick]").focus({ preventScroll: true });
  });

  /* ===== Step 3: columns ===== */

  function renderAll() {
    q("[data-sheet-wrap]").hidden = state.sheets.length < 2;
    sheetSel.replaceChildren(
      ...state.sheets.map((s, i) => el("option", { text: `${s.name || `Sheet ${i + 1}`} (${plural(Math.max(0, s.rows.filter(filled).length - 1), "row", "rows")})`, attrs: { value: String(i) } }))
    );
    sheetSel.value = String(state.sheetIndex);
    dateSel.value = state.order;
    q("[data-dateorder-wrap]").hidden = !state.t.fields.some((f) => f.type === "date");
    renderMapping();
    update();
  }

  function renderMapping() {
    const t = state.t;
    const matched = t.fields.filter((f) => state.map[f.id] && "col" in state.map[f.id]).length;
    const sheet = state.sheets[state.sheetIndex];
    q("[data-map-summary]").textContent =
      `${state.source?.name ?? "Your file"}${sheet?.name ? `, sheet “${sheet.name}”` : ""}: ${plural(state.rows.filter(filled).length, "row", "rows")}. ` +
      `${matched} of the ${t.fields.length} details in the ${t.title.toLowerCase()} were matched to a column by its heading. ` +
      `Check them, choose a column for any that are missing, or type a value that is the same in every ${noun(1)}, such as the company name.`;
    q("[data-dateorder-help]").textContent = state.ambiguous
      ? "Your file has dates like 03/04/2026 that could be read either way. Check the dates shown on the right."
      : "Dates written as 2026-04-03 or 3-Apr-2026 are read correctly either way.";

    const groups: { name: string; fields: MergeField[] }[] = [];
    for (const f of t.fields) {
      const name = f.group ?? "Details";
      let g = groups.find((x) => x.name === name);
      if (!g) groups.push((g = { name, fields: [] }));
      g.fields.push(f);
    }
    const block = (g: { name: string; fields: MergeField[] }) => [el("div", { class: "mm-map-group", text: g.name }), ...g.fields.map(mapRow)];
    const out: Node[] = [];
    groups.forEach((g, i) => {
      if (t.kind === "form" && i === 1) {
        const rest = groups.slice(1);
        const n = rest.reduce((a, x) => a + x.fields.length, 0);
        const anyMapped = rest.some((x) => x.fields.some((f) => state.map[f.id]));
        const more = el("details", { class: "mm-map-more" }, el("summary", { text: `${plural(n, "more detail", "more details")}, usually filled in by hand` }), ...rest.flatMap(block));
        more.open = anyMapped;
        out.push(more);
      }
      if (t.kind === "form" && i > 0) return;
      out.push(...block(g));
    });
    mapRows.replaceChildren(...out);
    renderMapWarning();
  }

  function mapRow(f: MergeField): HTMLElement {
    const id = `mm-f-${f.id}`;
    const label = el("label", { text: f.label, attrs: { for: id } });
    if (f.required && isLetter()) label.append(el("span", { class: "mm-req", text: "Required" }));
    const fieldCol = el("div", { class: "mm-map-field" }, label);
    if (f.help) fieldCol.append(el("span", { class: "field-help", text: f.help }));
    const sel = el("select", { class: "control", attrs: { id, "data-field": f.id, "aria-describedby": `${id}-ex` } });
    sel.append(
      el("option", { text: f.default ? `Not in my file: use “${short(f.default, 36)}”` : "Not in my file", attrs: { value: "" } }),
      el("option", { text: `Same for every ${noun(1)}: type it`, attrs: { value: "fixed" } }),
      ...state.headers.map((h, j) => el("option", { text: `Column ${colLetter(j)}: ${short(h, 60)}`, attrs: { value: String(j) } }))
    );
    const s = state.map[f.id];
    sel.value = !s ? "" : "col" in s ? String(s.col) : "fixed";
    const src = el("div", { class: "mm-map-src" }, sel);
    if (s && "fixed" in s) src.append(fixedInput(f, s.fixed));
    const ex = el("p", { class: "mm-ex", attrs: { id: `${id}-ex` } });
    paintExample(f, ex);
    return el("div", { class: "mm-map-row" }, fieldCol, src, ex);
  }

  function fixedInput(f: MergeField, value: string): HTMLElement {
    const id = `mm-fx-${f.id}`;
    let input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (f.type === "select") {
      input = el("select", { class: "control", attrs: { id } });
      input.append(el("option", { text: "Choose…", attrs: { value: "" } }), ...(f.options ?? []).map((o) => el("option", { text: o, attrs: { value: o } })));
    } else if (f.type === "textarea") input = el("textarea", { class: "control", attrs: { id, rows: "2" } });
    else {
      input = el("input", { class: "control", attrs: { id, type: f.type === "date" ? "date" : f.type === "email" ? "email" : "text", autocomplete: "off" } });
      if (f.type === "money" || f.type === "number") input.setAttribute("inputmode", "decimal");
    }
    input.value = value;
    input.dataset.fixed = f.id;
    return el("div", { class: "mm-fixed" }, el("label", { class: "field-help", text: `${f.label}, the same in every ${noun(1)}`, attrs: { for: id } }), input);
  }

  function paintExample(f: MergeField, ex: HTMLElement) {
    const s = state.map[f.id];
    const needed = f.required && isLetter();
    ex.className = "mm-ex";
    const say = (text: string, tone?: "is-bad" | "is-quiet") => {
      ex.textContent = text;
      if (tone) ex.classList.add(tone);
    };
    if (!s) {
      if (f.default) return say(`Every ${noun(1)}: “${short(f.default, 80)}”`);
      if (needed) return say(`Every ${noun(1)} will be missing this. Choose a column, or type a value.`, "is-bad");
      return say(isLetter() ? "Left out: a line that needs it is dropped." : "Left blank, to fill in by hand.", "is-quiet");
    }
    if ("fixed" in s) {
      const r = readValue(f, s.fixed, state.order);
      if (!r.text) return needed ? say("Type the value above.", "is-bad") : say("Left out of every letter.", "is-quiet");
      if (r.problem) return say(`${r.problem.message}.`, r.problem.level === "error" ? "is-bad" : undefined);
      return say(`Every ${noun(1)}: ${short(r.text.replace(/\n/g, " / "), 80)}`);
    }
    const values = state.rows.filter(filled).map((r) => r[s.col] ?? null);
    const present = values.filter((v) => cellText(v) !== "");
    if (!present.length) return say("This column is empty.", needed ? "is-bad" : "is-quiet");
    const reads = present.map((v) => ({ raw: cellText(v), r: readValue(f, v, state.order) }));
    const distinct = [...new Map(reads.map((x) => [x.raw, x])).values()].slice(0, 3);
    const shown = distinct.map((x) =>
      x.r.problem?.level === "error" ? `${short(x.raw, 30)} (can't be read)` : f.type === "date" || f.type === "money" ? `${short(x.raw, 24)} → ${x.r.text}` : short(x.r.text.replace(/\n/g, " / "), 40)
    );
    const bad = reads.filter((x) => x.r.problem?.level === "error").length;
    const blank = values.length - present.length;
    const notes = [bad ? `${plural(bad, "value", "values")} can't be read` : "", blank && needed ? `${plural(blank, "row is", "rows are")} empty` : ""].filter(Boolean);
    say(shown.join(" · ") + (notes.length ? `. ${notes.join("; ")}.` : ""), bad || (blank && needed) ? "is-bad" : undefined);
  }

  function renderMapWarning() {
    const missing = unmappedRequired(state.t, state.map);
    const warn = q("[data-map-warn]");
    warn.hidden = !missing.length;
    warn.textContent = missing.length ? `No column or value yet for: ${missing.join(", ")}. Until you choose one, every letter needs fixing.` : "";
  }

  let timer = 0;
  const scheduleUpdate = () => {
    clearTimeout(timer);
    timer = window.setTimeout(update, 250);
  };
  mapRows.addEventListener("change", (e) => {
    const sel = e.target as HTMLElement;
    if (!(sel instanceof HTMLSelectElement) || !sel.dataset.field) return;
    const f = field(sel.dataset.field);
    const src = sel.closest(".mm-map-src")!;
    src.querySelector(".mm-fixed")?.remove();
    if (sel.value === "") delete state.map[f.id];
    else if (sel.value === "fixed") {
      state.map[f.id] = { fixed: f.default ?? "" };
      const box = fixedInput(f, f.default ?? "");
      src.append(box);
      box.querySelector<HTMLElement>(".control")?.focus();
    } else state.map[f.id] = { col: Number(sel.value) };
    if (f.type === "date" && !state.orderTouched) {
      const d = dateOrderFor(state.t, state.map, state.rows);
      state.order = d.order;
      state.ambiguous = d.ambiguous;
      dateSel.value = d.order;
    }
    paintExample(f, q(`#mm-f-${f.id}-ex`));
    renderMapWarning();
    scheduleUpdate();
  });
  mapRows.addEventListener("input", (e) => {
    const input = e.target as HTMLInputElement;
    const id = input.dataset.fixed;
    if (!id) return;
    state.map[id] = { fixed: input.value };
    paintExample(field(id), q(`#mm-f-${id}-ex`));
    renderMapWarning();
    scheduleUpdate();
  });
  dateSel.addEventListener("change", () => {
    state.order = dateSel.value === "mdy" ? "mdy" : "dmy";
    state.orderTouched = true;
    for (const f of state.t.fields) if (f.type === "date") paintExample(f, q(`#mm-f-${f.id}-ex`));
    update();
  });
  sheetSel.addEventListener("change", () => {
    state.sheetIndex = Number(sheetSel.value);
    prepare(state.map);
    renderAll();
  });

  /* ===== Step 4: check, preview, output ===== */

  function update() {
    clearTimeout(timer);
    state.results = checkRows(state.t, state.rows, state.firstRow, state.map, state.order);
    if (state.current >= state.results.length) state.current = Math.max(0, state.results.length - 1);
    const s = summarise(state.results);
    q("[data-source]").textContent =
      state.source?.kind === "sample"
        ? `Sample data: ${SAMPLE_ROWS} made-up people at a made-up company. Load your own list to make real ${noun(2)}.`
        : `${state.source?.name ?? "Your file"}, read on ${longDate(state.today)}.${state.truncated ? ` Only the first ${count(MAX_ROWS)} rows are used; ${plural(state.truncated, "row was", "rows were")} left out. Split the list to make the rest.` : ""}`;
    const summary = q("[data-summary]");
    summary.replaceChildren(el("strong", { text: `${plural(s.total, "row", "rows")}:` }), pill("ready", `${count(s.ready)} ready`));
    if (s.check) summary.append(pill("check", `${count(s.check)} to check`));
    if (s.fix) summary.append(pill("fix", `${count(s.fix)} need fixing`));
    renderChecks();
    renderRowPicker();
    renderPreview();
    renderOutput();
  }

  function renderChecks() {
    const bad = state.results.filter((r) => r.status !== "ready").sort((a, b) => (a.status === b.status ? a.index - b.index : a.status === "fix" ? -1 : 1));
    q("[data-checks-wrap]").hidden = !bad.length;
    if (!bad.length) return q("[data-checks]").replaceChildren();
    const shown = bad.slice(0, 200);
    const tbody = el("tbody");
    for (const r of shown) {
      const go = el("button", { class: "mm-linkbtn", text: r.who, attrs: { type: "button", "data-go": String(r.index) } });
      const list = el("ul", {}, ...r.problems.map((p) => el("li", { text: problemText(p) })));
      tbody.append(el("tr", {}, el("th", { text: String(r.row), attrs: { scope: "row" } }), el("td", {}, go), el("td", {}, pill(r.status)), el("td", {}, list)));
    }
    const table = el(
      "table",
      {},
      el("caption", { text: "Most serious first. Choose a name to preview that letter." }),
      el("thead", {}, el("tr", {}, ...["Row", "Letter for", "Status", "What to look at"].map((h) => el("th", { text: h, attrs: { scope: "col" } })))),
      tbody
    );
    const wrap = q("[data-checks]");
    wrap.replaceChildren(table);
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-labelledby", "mm-checks-title");
    wrap.tabIndex = 0;
    if (bad.length > shown.length) wrap.append(el("p", { class: "field-help", text: `And ${plural(bad.length - shown.length, "more row", "more rows")}.` }));
  }
  q("[data-checks]").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-go]");
    if (!b) return;
    state.current = Number(b.dataset.go);
    rowSel.value = String(state.current);
    renderPreview();
    q("[data-preview]").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    rowSel.focus({ preventScroll: true });
  });

  function renderRowPicker() {
    rowSel.replaceChildren(
      ...state.results.map((r) =>
        el("option", { text: `Row ${r.row}: ${short(r.who, 50)}${r.status === "fix" ? " (needs fixing)" : r.status === "check" ? " (check)" : ""}`, attrs: { value: String(r.index) } })
      )
    );
    rowSel.value = String(state.current);
    rowSel.disabled = !state.results.length;
  }

  function renderPreview() {
    const r = state.results[state.current];
    q<HTMLButtonElement>("[data-prev]").disabled = state.current <= 0;
    q<HTMLButtonElement>("[data-next]").disabled = state.current >= state.results.length - 1;
    q<HTMLButtonElement>("[data-copy]").disabled = !r;
    const status = q("[data-row-status]");
    if (!r) {
      preview.replaceChildren(el("p", { text: "There are no rows to preview. Load a list with at least one filled row." }));
      status.replaceChildren();
      return;
    }
    preview.innerHTML = mergeHtml(state.t.html, r.values, { today: longDate(state.today), keepEmpty: !isLetter(), blank: "label" });
    const text = r.problems.length ? `${r.problems.map(problemText).join("; ")}.` : "Nothing to fix.";
    const left = r.status === "fix" && !includeBox.checked ? " Left out of the Word file and printout unless you include rows that need fixing." : "";
    status.replaceChildren(pill(r.status), `Row ${r.row}, ${r.who}. ${text}${left}`);
    q("[data-legend]").hidden = !preview.querySelector(".ph:not(.filled)");
  }
  rowSel.addEventListener("change", () => {
    state.current = Number(rowSel.value);
    renderPreview();
  });
  const step = (d: number) => {
    const next = Math.min(state.results.length - 1, Math.max(0, state.current + d));
    if (next === state.current) return;
    state.current = next;
    rowSel.value = String(next);
    renderPreview();
    const r = state.results[next];
    announce(`Row ${r.row}, ${r.who}: ${STATUS[r.status].label.toLowerCase()}.`);
  };
  q("[data-prev]").addEventListener("click", () => step(-1));
  q("[data-next]").addEventListener("click", () => step(1));

  function renderOutput() {
    const s = summarise(state.results);
    const n = outRows().length;
    q("[data-include-wrap]").hidden = !s.fix;
    docxBtn.disabled = printBtn.disabled = !n;
    const left = s.fix && !includeBox.checked ? ` ${plural(s.fix, "row that needs", "rows that need")} fixing ${s.fix === 1 ? "is" : "are"} left out.` : "";
    q("[data-output-note]").textContent = n
      ? `The Word file and printout will have ${plural(n, noun(1), noun(2))}, one to a page.${left}`
      : `No ${noun(2)} are ready yet. Fix the rows listed above and load the file again, or include rows that need fixing.`;
  }
  includeBox.addEventListener("change", () => {
    renderOutput();
    renderPreview();
  });

  const letterHtml = (r: RowResult) => mergeHtml(state.t.html, r.values, outOpts());

  docxBtn.addEventListener("click", async () => {
    const rows = outRows();
    if (!rows.length) return;
    const label = docxBtn.querySelector("[data-label]")!;
    const old = label.textContent;
    docxBtn.disabled = true;
    label.textContent = "Preparing…";
    try {
      const { toDocx } = await import("../../scripts/docx-export");
      const parts = rows.map((r) => {
        const d = document.createElement("div");
        d.innerHTML = letterHtml(r);
        return d;
      });
      const blob = await toDocx(parts, `${state.t.title}: ${plural(rows.length, noun(1), noun(2))}`);
      downloadBlob(`${fileStem(state.t, isoDate(state.today))}.docx`, blob);
      announce(`Word file downloaded with ${plural(rows.length, noun(1), noun(2))}, one to a page.`);
    } catch (e) {
      console.error(e);
      announce("The Word file couldn't be made. Try again, or print the letters instead.");
    } finally {
      label.textContent = old;
      renderOutput();
    }
  });

  printBtn.addEventListener("click", () => {
    const rows = outRows();
    if (!rows.length) return;
    document.querySelector(".mm-print-root")?.remove();
    const holder = el("div", { class: "mm-print-root" });
    for (const r of rows) {
      const a = el("article", { class: "mm-print-letter mm-letter" });
      a.innerHTML = letterHtml(r);
      holder.append(a);
    }
    document.body.append(holder);
    document.documentElement.classList.add("mm-printing");
    const done = () => {
      holder.remove();
      document.documentElement.classList.remove("mm-printing");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  });

  q("[data-copy]").addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const r = state.results[state.current];
    if (!r) return;
    const nodes = mergeNodes(state.t.html, r.values, outOpts());
    const text = plainText(nodes);
    const html = toHtml(nodes);
    const label = btn.querySelector("[data-label]")!;
    const flash = (msg: string) => {
      label.textContent = msg;
      setTimeout(() => (label.textContent = "Copy this letter"), 1800);
    };
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([text], { type: "text/plain" }), "text/html": new Blob([html], { type: "text/html" }) })]);
      } else await navigator.clipboard.writeText(text);
      flash("Copied");
      announce(`Copied the ${noun(1)} for ${r.who}.`);
    } catch {
      flash("Select the text to copy");
      announce("Copying isn't allowed in this browser. Select the letter text and copy it instead.");
    }
  });

  renderTemplateInfo();
}
