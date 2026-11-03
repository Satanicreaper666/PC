/**
 * Every row of the uploaded list, read for the chosen letter: the text each
 * field gets, what's wrong with it, and whether the letter is ready.
 */
import { cellText, type Cell } from "../analytics/fields.ts";
import type { MergeTemplate } from "./library.ts";
import { rawValue, type MergeMap } from "./mapping.ts";
import { readValue, type DateOrder, type Level } from "./values.ts";

export type RowProblem = { field: string; label: string; level: Level; message: string };
/** fix = a required detail is missing or a date or amount can't be read; check = used, but look at it; ready = nothing found. */
export type RowStatus = "ready" | "check" | "fix";
export type RowResult = {
  /** Position among the data rows (0-based). */
  index: number;
  /** Row number in the spreadsheet, so people can find it. */
  row: number;
  /** Whose letter it is, for lists and file names. */
  who: string;
  values: Record<string, string>;
  problems: RowProblem[];
  status: RowStatus;
};

/** Fields that hold the name of the person the letter is about. */
export const PERSON_FIELDS = ["candidate_name", "employee_name", "e_name", "your_name", "full_name"];

export function checkRows(t: MergeTemplate, rows: Cell[][], firstRow: number, map: MergeMap, order: DateOrder): RowResult[] {
  const out: RowResult[] = [];
  const personField = t.fields.find((f) => PERSON_FIELDS.includes(f.id));
  rows.forEach((r, k) => {
    if (!r.some((c) => cellText(c) !== "")) return;
    const values: Record<string, string> = {};
    const problems: RowProblem[] = [];
    for (const f of t.fields) {
      const read = readValue(f, rawValue(f, r, map), order);
      values[f.id] = read.text;
      if (read.problem) problems.push({ field: f.id, label: f.label, ...read.problem });
      // Forms are meant to be finished by hand, so empty boxes there are expected.
      else if (!read.text && f.required && t.kind === "letter") problems.push({ field: f.id, label: f.label, level: "error", message: "is empty" });
    }
    const status: RowStatus = problems.some((p) => p.level === "error") ? "fix" : problems.some((p) => p.level === "warning") ? "check" : "ready";
    const who = (personField && values[personField.id]) || `Row ${firstRow + k}`;
    out.push({ index: out.length, row: firstRow + k, who, values, problems, status });
  });
  return out;
}

export function summarise(results: RowResult[]): { total: number; ready: number; check: number; fix: number } {
  return {
    total: results.length,
    ready: results.filter((r) => r.status === "ready").length,
    check: results.filter((r) => r.status === "check").length,
    fix: results.filter((r) => r.status === "fix").length
  };
}

/** One line per problem: "Start date: “31/02/2026” can't be read as a date". */
export const problemText = (p: RowProblem) => (p.message === "is empty" ? `${p.label} is empty` : `${p.label}: ${p.message}`);

/** Required fields with no column and no value typed for every letter: every letter will miss them. */
export function unmappedRequired(t: MergeTemplate, map: MergeMap): string[] {
  if (t.kind !== "letter") return [];
  return t.fields.filter((f) => f.required && !map[f.id] && !f.default).map((f) => f.label);
}
