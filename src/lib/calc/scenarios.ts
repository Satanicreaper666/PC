/**
 * Saved scenarios, side-by-side comparison and CSV for every calculator.
 * Pure functions only (no DOM, no storage), so `node --test` can check them;
 * src/scripts/calc-kit.ts does the wiring.
 *
 * - A scenario is the calculator's inputs (every named field, the same values
 *   the URL carries) plus the results shown when it was saved.
 * - Figures are read back from the text on screen ("₹66,185", "− ₹3,000",
 *   "50%", "18 days", "Tue 8 December 2026"), so a difference always matches
 *   the numbers the reader sees.
 * - "Better" is marked only where a calculator says which way is better and
 *   one scenario is strictly best.
 */
import { csvCell, toCsv as writeCsv } from "../csv.ts";

export type Better = "higher" | "lower";

export type SavedOutput = { key: string; label: string; value: string; better?: Better };
export type SavedLine = { key: string; label: string; value: string; note?: string; better?: Better; strong?: boolean };

export type Scenario = {
  id: string;
  label: string;
  /** ISO timestamp. */
  savedAt: string;
  /** Every named field of the form, as the URL encodes it ("" for a blank field). */
  params: Record<string, string>;
  outputs: SavedOutput[];
  lines: SavedLine[];
  warnings?: string[];
  /** Included in the comparison (default true). */
  compare?: boolean;
};

export type ScenarioStore = { v: 1; items: Scenario[]; base?: string };

export const SCENARIO_MAX = 8;
export const LABEL_MAX = 60;

/* ---------- Store ---------- */

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const str = (x: unknown): string => (typeof x === "string" ? x : "");

export function emptyStore(): ScenarioStore {
  return { v: 1, items: [] };
}

/** Read what localStorage holds, dropping anything malformed. Never throws. */
export function readStore(raw: string | null | undefined): ScenarioStore {
  if (!raw) return emptyStore();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return emptyStore();
  }
  if (!isRecord(data) || !Array.isArray(data.items)) return emptyStore();
  const items: Scenario[] = [];
  for (const it of data.items) {
    if (!isRecord(it) || !str(it.id) || !isRecord(it.params)) continue;
    const params: Record<string, string> = {};
    for (const [k, v] of Object.entries(it.params)) if (typeof v === "string") params[k] = v;
    const outputs = (Array.isArray(it.outputs) ? it.outputs : [])
      .filter(isRecord)
      .map((o) => ({ key: str(o.key), label: str(o.label), value: str(o.value), ...(o.better === "higher" || o.better === "lower" ? { better: o.better as Better } : {}) }))
      .filter((o) => o.key);
    const lines = (Array.isArray(it.lines) ? it.lines : [])
      .filter(isRecord)
      .map((l) => ({
        key: str(l.key) || str(l.label),
        label: str(l.label),
        value: str(l.value),
        ...(str(l.note) ? { note: str(l.note) } : {}),
        ...(l.better === "higher" || l.better === "lower" ? { better: l.better as Better } : {}),
        ...(l.strong === true ? { strong: true } : {})
      }))
      .filter((l) => l.key);
    const warnings = Array.isArray(it.warnings) ? it.warnings.filter((w): w is string => typeof w === "string") : [];
    items.push({
      id: str(it.id),
      label: cleanLabel(str(it.label)) || "Scenario",
      savedAt: str(it.savedAt),
      params,
      outputs,
      lines,
      ...(warnings.length ? { warnings } : {}),
      ...(it.compare === false ? { compare: false } : {})
    });
  }
  const kept = items.slice(0, SCENARIO_MAX);
  const base = str(data.base);
  return { v: 1, items: kept, ...(base && kept.some((s) => s.id === base) ? { base } : {}) };
}

export function writeStore(s: ScenarioStore): string {
  return JSON.stringify(s);
}

/** Trim, collapse spaces, drop control characters, cap the length. */
export function cleanLabel(label: string): string {
  return label
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LABEL_MAX)
    .trim();
}

export function sameParams(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] ?? "") !== (b[k] ?? "")) return false;
  return true;
}

export function findSame(store: ScenarioStore, params: Record<string, string>): Scenario | undefined {
  return store.items.find((s) => sameParams(s.params, params));
}

/** Bijective base-26: 0 → A, 25 → Z, 26 → AA. */
function letters(i: number): string {
  let n = i + 1;
  let out = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/**
 * The next default label. The template holds "{A}" (Offer A, Offer B…) or "{1}"
 * (Scenario 1, Scenario 2…). Counting starts after the scenarios already saved,
 * so a deleted "Offer A" is not reused straight away.
 */
export function nextLabel(template: string, taken: string[]): string {
  const t = template.includes("{A}") || template.includes("{1}") ? template : `${template.trim()} {1}`;
  const used = new Set(taken.map((l) => l.trim().toLowerCase()));
  const make = (i: number) => t.replace("{A}", letters(i)).replace("{1}", String(i + 1));
  for (let i = taken.length; i < taken.length + 1000; i++) {
    const l = make(i);
    if (!used.has(l.toLowerCase())) return l;
  }
  return make(taken.length);
}

export function addScenario(store: ScenarioStore, s: Scenario): ScenarioStore {
  return { ...store, items: [...store.items, s].slice(0, SCENARIO_MAX) };
}

export function renameScenario(store: ScenarioStore, id: string, label: string): ScenarioStore {
  const l = cleanLabel(label);
  if (!l) return store;
  return { ...store, items: store.items.map((s) => (s.id === id ? { ...s, label: l } : s)) };
}

export function removeScenario(store: ScenarioStore, id: string): { store: ScenarioStore; removed?: Scenario; index: number } {
  const index = store.items.findIndex((s) => s.id === id);
  if (index < 0) return { store, index };
  const items = store.items.filter((s) => s.id !== id);
  const next: ScenarioStore = { v: 1, items };
  if (store.base && store.base !== id) next.base = store.base;
  return { store: next, removed: store.items[index], index };
}

/** Put a deleted scenario back where it was (undo). */
export function restoreScenario(store: ScenarioStore, s: Scenario, index: number): ScenarioStore {
  if (store.items.some((x) => x.id === s.id) || store.items.length >= SCENARIO_MAX) return store;
  const items = [...store.items];
  items.splice(Math.max(0, Math.min(index, items.length)), 0, s);
  return { ...store, items };
}

export function setCompare(store: ScenarioStore, id: string, on: boolean): ScenarioStore {
  return {
    ...store,
    items: store.items.map((s) => {
      if (s.id !== id) return s;
      const next: Scenario = { ...s };
      if (on) delete next.compare;
      else next.compare = false;
      return next;
    })
  };
}

export function setBase(store: ScenarioStore, id: string): ScenarioStore {
  return store.items.some((s) => s.id === id) ? { ...store, base: id } : store;
}

/** Scenarios ticked for the comparison, in saved order. */
export function compareSet(store: ScenarioStore): Scenario[] {
  return store.items.filter((s) => s.compare !== false);
}

/** Index of the base scenario within the comparison set (the first one unless the reader chose another). */
export function baseIndexIn(set: Scenario[], base?: string): number {
  const i = base ? set.findIndex((s) => s.id === base) : -1;
  return i >= 0 ? i : 0;
}

/* ---------- Figures: numbers read back from the text on screen ---------- */

export type FigureKind = "inr" | "pct" | "num" | "date" | "zero";
export type Figure = {
  kind: FigureKind;
  /** The number (for dates: days since 1 Jan 1970, UTC). */
  n: number;
  /** Decimal places shown. */
  decimals: number;
  /** The text with the number replaced by "#" (and without its sign); two figures compare only if their shapes match. */
  shape: string;
};

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const DATE_RE = /\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})\b/gi;
const NUM_RE = /\d[\d,]*(?:\.\d+)?/g;

const norm = (s: string) => s.replace(/[   ]/g, " ").replace(/\s+/g, " ").trim();

export function parseFigure(text: string): Figure | null {
  const t = norm(text);
  if (!t) return null;
  if (/^nil$/i.test(t)) return { kind: "zero", n: 0, decimals: 0, shape: "" };

  const dates = [...t.matchAll(DATE_RE)];
  if (dates.length === 1) {
    const [, d, mon, y] = dates[0];
    const m = MONTHS.findIndex((x) => x.startsWith(mon.toLowerCase().slice(0, 3)));
    const rest = t.replace(dates[0][0], "").replace(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*,?/gi, "").trim();
    // Only a bare date ("Tue 8 December 2026"); a date inside a sentence is text.
    if (m >= 0 && rest === "") return { kind: "date", n: Math.round(Date.UTC(Number(y), m, Number(d)) / 86400000), decimals: 0, shape: "date" };
    return null;
  }
  if (dates.length > 1) return null;

  const nums = [...t.matchAll(NUM_RE)];
  if (nums.length !== 1) return null;
  const m = nums[0];
  const idx = m.index ?? 0;
  const digits = m[0].replace(/,/g, "");
  let n = Number(digits);
  if (!Number.isFinite(n)) return null;
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  let prefix = t.slice(0, idx);
  const suffix = t.slice(idx + m[0].length);
  // A minus sign before the number, possibly with a ₹ and spaces between: "− ₹3,000", "-₹600", "−18".
  const sign = /[−-]\s*(₹\s*)?$/.exec(prefix);
  if (sign) {
    n = -n;
    prefix = prefix.slice(0, sign.index) + (sign[1] ? "₹" : "");
  }
  prefix = prefix.replace(/\+\s*(₹?)\s*$/, "$1").replace(/\s+$/, "");
  const inr = /₹$/.test(prefix);
  const pct = /^\s*%/.test(suffix);
  // Words before the number ("About 1.4") are allowed; anything else that is not a label is not a figure.
  if (prefix && !inr && !/^[A-Za-z][A-Za-z ]*$/.test(prefix)) return null;
  return { kind: inr ? "inr" : pct ? "pct" : "num", n, decimals, shape: `${prefix}#${suffix}` };
}

/** Two figures can be compared if they are the same kind of thing. */
export function comparable(a: Figure | null, b: Figure | null): boolean {
  if (!a || !b) return false;
  if (a.kind === "zero" || b.kind === "zero") return a.kind === "zero" ? b.kind !== "date" : a.kind !== "date";
  return a.shape === b.shape && a.kind === b.kind;
}

const fmt = (n: number, d: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const MINUS = "−";

export type FigureDiff = {
  /** b − a, in the figures' own unit (days for dates). */
  n: number;
  /** "+₹6,315", "−3 days", "+2.5 pp", "Same". */
  text: string;
  /** "+9.5%" (relative to a), or null when that makes no sense (dates, percentages, zero or negative figures, no change). */
  pct: string | null;
  kind: FigureKind;
};

/** The difference b − a, or null if the two values cannot be compared. */
export function diffFigures(aText: string, bText: string): FigureDiff | null {
  const a = parseFigure(aText);
  const b = parseFigure(bText);
  if (!a || !b || !comparable(a, b)) return null;
  const like = a.kind === "zero" ? b : a;
  if (like.kind === "zero") return { n: 0, text: "Same", pct: null, kind: "zero" };
  const d = Math.max(a.decimals, b.decimals);
  const raw = b.n - a.n;
  const n = Number(raw.toFixed(d));
  const sign = n > 0 ? "+" : n < 0 ? MINUS : "";
  const abs = Math.abs(n);
  if (n === 0) return { n: 0, text: like.kind === "date" ? "Same day" : "Same", pct: null, kind: like.kind };
  let text: string;
  if (like.kind === "date") text = `${sign}${fmt(abs, 0)} ${abs === 1 ? "day" : "days"}`;
  else if (like.kind === "pct") text = `${sign}${fmt(abs, d)} pp`;
  else {
    // Keep the unit after the number ("days", "a month"), not words before it ("About").
    const hash = like.shape.indexOf("#");
    const suffix = like.shape.slice(hash + 1);
    text = `${sign}${like.kind === "inr" ? "₹" : ""}${fmt(abs, d)}${suffix}`;
  }
  let pct: string | null = null;
  // A % change on a negative figure (a deduction shown as "− ₹3,000") is easy to misread, so it is left out.
  if (like.kind !== "date" && like.kind !== "pct" && a.n > 0 && b.n >= 0) {
    const p = (raw / Math.abs(a.n)) * 100;
    const pd = Math.abs(p) < 1 ? 2 : 1;
    pct = `${p > 0 ? "+" : p < 0 ? MINUS : ""}${fmt(Math.abs(p), pd)}%`;
  }
  return { n, text, pct, kind: like.kind };
}

/** Index of the strictly best figure, or −1 when any value is missing, values cannot be compared, or there is a tie. */
export function bestIndex(texts: string[], better: Better): number {
  if (texts.length < 2) return -1;
  const figs = texts.map(parseFigure);
  if (figs.some((f) => !f)) return -1;
  for (let i = 1; i < figs.length; i++) if (!comparable(figs[0], figs[i])) return -1;
  if (figs.some((f) => f!.kind === "date")) return -1;
  const ns = figs.map((f) => f!.n);
  const target = better === "higher" ? Math.max(...ns) : Math.min(...ns);
  const hits = ns.filter((n) => n === target).length;
  return hits === 1 ? ns.indexOf(target) : -1;
}

/** The plain number behind a figure, for a spreadsheet column: "-3000", "50", "2026-12-08", or "". */
export function figureNumber(text: string): string {
  const f = parseFigure(text);
  if (!f) return "";
  if (f.kind === "date") return new Date(f.n * 86400000).toISOString().slice(0, 10);
  return String(Number(f.n.toFixed(f.decimals)));
}

/* ---------- Comparison table ---------- */

export type CompareInput = { key: string; label: string; values: string[] };
export type CompareCell = { text: string; best: boolean };
export type CompareRow = {
  key: string;
  label: string;
  cells: CompareCell[];
  /** One per entry of Comparison.diffColumns. */
  diffs: (FigureDiff | null)[];
  better?: Better;
  strong?: boolean;
  /** Sentences: shown wrapped, never diffed. */
  long?: boolean;
};
export type CompareSection = { id: "result" | "lines" | "inputs"; title: string; rows: CompareRow[]; note?: string };
export type Comparison = {
  columns: string[];
  base: number;
  /** Scenario indexes that get a difference column (every scenario but the base). */
  diffColumns: number[];
  sections: CompareSection[];
  /** Some row carries a "better" mark. */
  marked: boolean;
};

const LONG = 42;
const DASH = "—";

/** Merge keyed rows from several scenarios, keeping each scenario's order. */
function mergeKeys<T extends { key: string }>(lists: T[][]): string[] {
  const out: string[] = [];
  for (const list of lists) {
    let at = -1;
    for (const item of list) {
      const i = out.indexOf(item.key);
      if (i >= 0) {
        at = i;
        continue;
      }
      out.splice(at + 1, 0, item.key);
      at += 1;
    }
  }
  return out;
}

/** Give repeated keys within one scenario a counter, so "Total" and "Total" stay two rows. */
export function uniqueKeys<T extends { key: string }>(items: T[]): T[] {
  const seen = new Map<string, number>();
  return items.map((it) => {
    const n = (seen.get(it.key) ?? 0) + 1;
    seen.set(it.key, n);
    return n === 1 ? it : { ...it, key: `${it.key}#${n}` };
  });
}

function row(key: string, label: string, values: string[], base: number, diffColumns: number[], extra: Partial<CompareRow> = {}): CompareRow {
  const long = extra.long ?? values.some((v) => v.length > LONG);
  const best = extra.better && !long ? bestIndex(values, extra.better) : -1;
  return {
    key,
    label,
    cells: values.map((text, i) => ({ text: text || DASH, best: i === best })),
    diffs: diffColumns.map((j) => (long || !values[base] || !values[j] ? null : diffFigures(values[base], values[j]))),
    ...extra,
    long
  };
}

export function buildComparison(set: Scenario[], base: number, inputs: CompareInput[] = []): Comparison {
  const b = Math.max(0, Math.min(base, set.length - 1));
  const diffColumns = set.map((_, i) => i).filter((i) => i !== b);
  const sections: CompareSection[] = [];

  const outLists = set.map((s) => uniqueKeys(s.outputs));
  const outKeys = mergeKeys(outLists);
  const resultRows = outKeys.map((k) => {
    const first = outLists.flat().find((o) => o.key === k)!;
    const values = outLists.map((l) => l.find((o) => o.key === k)?.value ?? "");
    return row(k, first.label, values, b, diffColumns, first.better ? { better: first.better } : {});
  });
  if (resultRows.length) sections.push({ id: "result", title: "Result", rows: resultRows });

  const lineLists = set.map((s) => uniqueKeys(s.lines));
  const lineKeys = mergeKeys(lineLists);
  const lineRows = lineKeys.map((k) => {
    const first = lineLists.flat().find((l) => l.key === k)!;
    const values = lineLists.map((l) => l.find((x) => x.key === k)?.value ?? "");
    return row(k, first.label, values, b, diffColumns, { ...(first.better ? { better: first.better } : {}), ...(first.strong ? { strong: true } : {}) });
  });
  if (lineRows.length) sections.push({ id: "lines", title: "Breakdown", rows: lineRows });

  const differing = inputs.filter((r) => new Set(r.values.map((v) => v.trim())).size > 1);
  if (inputs.length) {
    sections.push({
      id: "inputs",
      title: "Inputs that differ",
      rows: differing.map((r) => row(r.key, r.label, r.values, b, diffColumns)),
      ...(differing.length === 0 ? { note: "The inputs are the same in every scenario." } : differing.length < inputs.length ? { note: "Inputs that are the same in every scenario are left out." } : {})
    });
  }

  return {
    columns: set.map((s) => s.label),
    base: b,
    diffColumns,
    sections,
    marked: sections.some((s) => s.rows.some((r) => r.cells.some((c) => c.best)))
  };
}

/** Header text for a difference column. */
export function diffHeader(c: Comparison, j: number): string {
  return c.diffColumns.length === 1 ? "Difference" : `${c.columns[j]} vs ${c.columns[c.base]}`;
}

/** The comparison as rows of text (for CSV and copying). Differences get a ₹ column and a % column. */
export function comparisonRows(c: Comparison, opts: { forCsv?: boolean } = {}): string[][] {
  const plain = (t: string) => (opts.forCsv ? t.replace(/^\+/, "") : t);
  const head = ["", ...c.columns];
  for (const j of c.diffColumns) {
    const h = `${c.columns[j]} − ${c.columns[c.base]}`;
    head.push(h, `${h} (%)`);
  }
  const out: string[][] = [head];
  for (const s of c.sections) {
    out.push([s.title]);
    for (const r of s.rows) {
      const cells = [r.label, ...r.cells.map((x) => x.text)];
      r.diffs.forEach((d) => cells.push(d ? plain(d.text) : "", d?.pct ? plain(d.pct) : ""));
      out.push(cells);
    }
    if (s.note) out.push([s.note]);
  }
  return out;
}

/* ---------- CSV and tab-separated text ---------- */

/** CSV for scenarios: the site's one writer (src/lib/csv.ts), under the names the calculators use. */
export const csvField = (value: string): string => csvCell(value);
export const toCsv = (rows: string[][]): string => writeCsv(rows);

/** Tab-separated text: pastes into a spreadsheet as columns. */
export function toTsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => (c ?? "").replace(/[\t\r\n]+/g, " ")).join("\t")).join("\n");
}

/** A file-safe name: "take-home-salary-calculator-2026-11-03.csv". */
export function csvFileName(slug: string, date: Date, suffix = ""): string {
  const base = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "peoplecraft";
  const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return `${base}${suffix ? `-${suffix}` : ""}-${d}.csv`;
}
