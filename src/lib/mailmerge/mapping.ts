/**
 * Which column of the uploaded file fills which field of the letter.
 * A field can also take one value typed once for every letter (company name,
 * signatory), or be left out. Headers are matched on the field's label (the
 * CSV template uses labels), its id, and the names HR files usually use.
 */
import { detectDateOrder, parseDate, type DateOrder } from "../analytics/dates.ts";
import { cellText, parseMoney, type Cell } from "../analytics/fields.ts";
import type { MergeField, MergeTemplate } from "./library.ts";

export type Source = { col: number } | { fixed: string };
/** Field id → where its value comes from. Missing = not in the file (the field's default, if it has one, is used). */
export type MergeMap = Record<string, Source>;

/** "Candidate's full name (as on PAN)" → "candidate full name as on pan" */
export const normHeader = (h: string) =>
  h
    .toLowerCase()
    .replace(/['’`]s\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Other headers people use for fields that recur across the site's letters. */
const ALIASES: { ids: string[]; headers: string[] }[] = [
  { ids: ["candidate_name", "employee_name", "e_name", "your_name", "full_name"], headers: ["name", "employee name", "emp name", "full name", "candidate name", "candidate", "employee", "name of employee", "associate name", "staff name"] },
  { ids: ["e_id", "employee_id", "employee_code", "e_code"], headers: ["employee id", "emp id", "employee code", "emp code", "ecode", "employee no", "emp no", "employee number", "staff id"] },
  { ids: ["designation", "role", "e_designation", "your_role"], headers: ["designation", "job title", "title", "role", "position"] },
  { ids: ["department", "e_department"], headers: ["department", "dept", "function", "team"] },
  { ids: ["location"], headers: ["location", "work location", "base location", "office", "city", "place of work", "branch"] },
  { ids: ["start_date", "joining_date", "doj", "e_doj"], headers: ["date of joining", "doj", "joining date", "start date", "date joined", "hire date"] },
  { ids: ["lwd", "last_day", "e_lwd"], headers: ["last working day", "lwd", "last working date", "date of leaving", "exit date", "relieving date"] },
  { ids: ["company"], headers: ["company", "company name", "organisation", "organization", "employer", "legal entity", "entity"] },
  { ids: ["signatory_name"], headers: ["signatory", "signatory name", "signed by", "authorised signatory", "authorized signatory"] },
  { ids: ["signatory_role"], headers: ["signatory designation", "signatory role", "signatory title"] },
  { ids: ["candidate_address", "employee_address", "current_address"], headers: ["address", "postal address", "current address", "correspondence address", "candidate address", "employee address"] },
  { ids: ["manager_name", "manager", "reporting_to", "e_manager"], headers: ["manager", "manager name", "reporting manager", "reports to", "reporting to", "line manager"] },
  { ids: ["ctc_annual"], headers: ["ctc", "annual ctc", "ctc per annum", "total ctc", "ctc annual"] },
  { ids: ["gross_monthly"], headers: ["gross", "monthly gross", "gross salary", "gross monthly", "gross pay"] },
  { ids: ["basic", "basic_da"], headers: ["basic", "basic pay", "basic salary", "basic da"] },
  { ids: ["hra"], headers: ["hra", "house rent allowance"] },
  { ids: ["dob"], headers: ["date of birth", "dob", "birth date"] },
  { ids: ["personal_email"], headers: ["personal email", "email", "email id", "email address"] },
  { ids: ["notice", "notice_period"], headers: ["notice period", "notice"] },
  { ids: ["probation"], headers: ["probation", "probation period"] },
  { ids: ["effective_date"], headers: ["effective date", "effective from", "with effect from", "wef"] },
  { ids: ["ref_no"], headers: ["ref no", "reference", "reference number", "letter number", "letter no"] }
];

/** How well a header fits a field: 100 = its label, 98 = its id, 90 = a usual name for it, 55–80 = contains one. */
export function headerScore(header: string, f: MergeField): number {
  const h = normHeader(header);
  if (!h) return 0;
  const label = normHeader(f.label);
  const id = f.id.replace(/_/g, " ");
  if (h === label) return 100;
  if (h === id || h.replace(/ /g, "") === id.replace(/ /g, "")) return 98;
  let best = 0;
  for (const a of ALIASES) {
    if (!a.ids.includes(f.id)) continue;
    for (const s of a.headers) {
      const sn = normHeader(s);
      if (h === sn) best = Math.max(best, 90);
      else if (sn.length >= 4 && ` ${h} `.includes(` ${sn} `)) best = Math.max(best, 55 + sn.length / 10);
    }
  }
  if (label.length >= 4 && ` ${h} `.includes(` ${label} `)) best = Math.max(best, 70 + Math.min(10, label.length / 5));
  return best;
}

/** A date column must mostly hold dates, a money column amounts. */
function valuesFit(f: MergeField, values: Cell[]): boolean {
  const filled = values.filter((v) => cellText(v) !== "");
  if (!filled.length) return true;
  const share = (test: (v: Cell) => boolean) => filled.filter(test).length / filled.length;
  if (f.type === "date") return share((v) => parseDate(v, "dmy") !== null || parseDate(v, "mdy") !== null) >= 0.5;
  if (f.type === "money") return share((v) => parseMoney(v) !== null) >= 0.5;
  return true;
}

export type AutoMap = { map: MergeMap; dateOrder: DateOrder; dateAmbiguous: boolean; matched: number };

export function autoMap(t: MergeTemplate, headers: string[], rows: Cell[][]): AutoMap {
  const sample = rows.slice(0, 300);
  const col = (i: number) => sample.map((r) => r[i] ?? null);
  const candidates: { field: number; col: number; score: number }[] = [];
  t.fields.forEach((f, fi) =>
    headers.forEach((h, ci) => {
      const s = headerScore(h, f);
      if (s >= 55 && valuesFit(f, col(ci))) candidates.push({ field: fi, col: ci, score: s });
    })
  );
  candidates.sort((a, b) => b.score - a.score || a.field - b.field || a.col - b.col);
  const map: MergeMap = {};
  const usedCols = new Set<number>();
  for (const c of candidates) {
    const id = t.fields[c.field].id;
    if (map[id] || usedCols.has(c.col)) continue;
    map[id] = { col: c.col };
    usedCols.add(c.col);
  }
  const { order, ambiguous } = dateOrderFor(t, map, rows);
  return { map, dateOrder: order, dateAmbiguous: ambiguous, matched: Object.keys(map).length };
}

/** Day-first or month-first, from the columns that fill date fields. */
export function dateOrderFor(t: MergeTemplate, map: MergeMap, rows: Cell[][]): { order: DateOrder; ambiguous: boolean } {
  const cells: Cell[] = [];
  for (const f of t.fields) {
    const s = map[f.id];
    if (f.type === "date" && s && "col" in s) for (const r of rows.slice(0, 500)) cells.push(r[s.col] ?? null);
  }
  const d = detectDateOrder(cells);
  // A value like 25/03/2026 settles it for the whole file; only warn when nothing does, or values disagree.
  let dayFirst = 0;
  let monthFirst = 0;
  for (const c of cells) {
    const m = typeof c === "string" ? c.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.]\d{2,4}/) : null;
    if (!m) continue;
    if (+m[1] > 12 && +m[2] <= 12) dayFirst++;
    else if (+m[2] > 12 && +m[1] <= 12) monthFirst++;
  }
  return { order: d.order, ambiguous: (d.ambiguous && !dayFirst && !monthFirst) || (dayFirst > 0 && monthFirst > 0) };
}

/** The value a field takes in one row: its column, the value typed for every letter, or the field's default. */
export function rawValue(f: MergeField, row: Cell[], map: MergeMap): Cell {
  const s = map[f.id];
  if (!s) return f.default ?? null;
  return "col" in s ? (row[s.col] ?? null) : s.fixed;
}

/** The row in the first 15 that looks most like a header row for this letter (exports often start with a title). */
export function findMergeHeaderRow(rows: Cell[][], t: MergeTemplate): number {
  let best = 0;
  let bestScore = 0;
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const cells = (rows[i] ?? []).map(cellText).filter(Boolean);
    const score = cells.filter((c) => t.fields.some((f) => headerScore(c, f) >= 90)).length;
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return best;
}

/** CSV with the letter's field labels as headers, in the order the letter's own page lists them. */
export function templateCsv(t: MergeTemplate): string {
  const cell = (s: string) => (/[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return t.fields.map((f) => cell(f.label)).join(",") + "\r\n";
}

/** "offer-letter-mail-merge-2026-11-02" */
export const fileStem = (t: MergeTemplate, isoDay: string) => `${t.id}-mail-merge-${isoDay}`;
