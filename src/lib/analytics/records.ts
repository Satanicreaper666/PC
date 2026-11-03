/**
 * Turn the rows of an uploaded file into one clean record per person,
 * using the column mapping the user confirmed. Nothing here touches the DOM.
 */
import { parseDate, type DateOrder, type DayNum } from "./dates.ts";
import { cellText, classifyGender, classifyStatus, parseMoney, type Cell, type ColumnMap, type FieldKey, type Gender } from "./fields.ts";

/** The file as read: header names, data rows, and the spreadsheet row number of the first data row. */
export type RawTable = { headers: string[]; rows: Cell[][]; firstRow: number };

/** How the user wants each status value treated. "auto" = go by the last working day. */
export type StatusChoice = "active" | "left" | "auto";

export type ReadOptions = {
  dateOrder: DateOrder;
  salaryPeriod: "annual" | "monthly";
  /** Keyed by the lower-cased status text. Missing keys fall back to the automatic reading. */
  statusMap: Record<string, StatusChoice>;
};

export type Employee = {
  /** Row number in the spreadsheet, so people can find it. */
  row: number;
  id: string;
  name: string;
  dept: string;
  designation: string;
  grade: string;
  location: string;
  manager: string;
  gender: Gender;
  genderRecognised: boolean;
  doj: DayNum | null;
  doe: DayNum | null;
  dob: DayNum | null;
  salary: number | null;
  status: string;
  /** What the status column says, after the user's choices. null = no opinion. */
  statusSays: "active" | "left" | null;
  /** Original text of fields we parse, for the data checks. */
  raw: { doj: string; doe: string; dob: string; salary: string; gender: string };
};

export const NOT_RECORDED = "Not recorded";

function get(row: Cell[], map: ColumnMap, key: FieldKey): Cell {
  const i = map[key];
  return i === undefined ? null : (row[i] ?? null);
}

export function buildEmployees(t: RawTable, map: ColumnMap, o: ReadOptions): Employee[] {
  const out: Employee[] = [];
  t.rows.forEach((row, idx) => {
    if (!row.some((c) => cellText(c) !== "")) return; // blank line
    const text = (k: FieldKey) => cellText(get(row, map, k));
    const status = text("status");
    const choice = o.statusMap[status.toLowerCase()];
    const statusSays = map.status === undefined || !status ? null : choice === "active" || choice === "left" ? choice : choice === "auto" ? null : classifyStatus(status);
    const g = map.gender === undefined ? { gender: "unknown" as Gender, recognised: true } : classifyGender(get(row, map, "gender"));
    const salary = map.salary === undefined ? null : parseMoney(get(row, map, "salary"));
    out.push({
      row: t.firstRow + idx,
      id: text("id"),
      name: text("name"),
      dept: text("dept"),
      designation: text("designation"),
      grade: text("grade"),
      location: text("location"),
      manager: text("manager"),
      gender: g.gender,
      genderRecognised: g.recognised,
      doj: parseDate(get(row, map, "doj"), o.dateOrder),
      doe: map.doe === undefined ? null : parseDate(get(row, map, "doe"), o.dateOrder),
      dob: map.dob === undefined ? null : parseDate(get(row, map, "dob"), o.dateOrder),
      salary: salary !== null && salary > 0 ? salary : null,
      status,
      statusSays,
      raw: { doj: text("doj"), doe: text("doe"), dob: text("dob"), salary: text("salary"), gender: text("gender") }
    });
  });
  return out;
}

/** Distinct status values with counts and the automatic reading, for the mapping step. */
export function statusValues(t: RawTable, map: ColumnMap): { value: string; count: number; reads: "active" | "left" | null }[] {
  if (map.status === undefined) return [];
  const counts = new Map<string, { value: string; count: number }>();
  for (const r of t.rows) {
    const v = cellText(r[map.status!] ?? null);
    if (!v) continue;
    const k = v.toLowerCase();
    const c = counts.get(k);
    if (c) c.count++;
    else counts.set(k, { value: v, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).map((c) => ({ ...c, reads: classifyStatus(c.value) }));
}

/** Text for a grouping field, with blanks shown as "Not recorded". */
export const groupOf = (v: string) => v || NOT_RECORDED;
