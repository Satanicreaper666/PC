/**
 * Data checks: what in the file could make the figures wrong, how the
 * dashboard treated it, and which rows to fix. File-wide (filters don't apply).
 */
import type { DayNum } from "./dates.ts";
import type { ColumnMap } from "./fields.ts";
import { dateLabel } from "./format.ts";
import { isCounted, onRolls } from "./metrics.ts";
import type { Employee } from "./records.ts";

/** fix = figures leave these rows out; review = counted, but check; note = handled as expected; ok = nothing found. */
export type CheckStatus = "fix" | "review" | "note" | "ok";
export type CheckRow = { row: number; id: string; name: string; detail: string };
export type Check = { id: string; title: string; status: CheckStatus; count: number; effect: string; rows: CheckRow[] };

const ORDER: Record<CheckStatus, number> = { fix: 0, review: 1, note: 2, ok: 3 };
const YEAR = 365.25;

export function runChecks(all: Employee[], map: ColumnMap, todayN: DayNum): Check[] {
  const checks: Check[] = [];
  const has = (k: keyof ColumnMap) => map[k] !== undefined;
  const row = (e: Employee, detail: string): CheckRow => ({ row: e.row, id: e.id, name: e.name, detail });
  /** `count` is the number of distinct spreadsheet rows affected (a row can have two blank cells). */
  const add = (id: string, title: string, problem: CheckStatus, effect: string, okText: string, rows: CheckRow[]) =>
    checks.push({ id, title, status: rows.length ? problem : "ok", count: new Set(rows.map((r) => r.row)).size, effect: rows.length ? effect : okText, rows });

  add(
    "joining",
    "Joining date missing or not a date",
    "fix",
    "These rows are left out of every figure. Add a date like 31/01/2026 and load the file again.",
    "Every row has a readable joining date.",
    all.filter((e) => e.doj === null).map((e) => row(e, e.raw.doj ? `“${e.raw.doj}”` : "Blank"))
  );

  if (has("doe")) {
    add(
      "exit-unreadable",
      "Last working day not a date",
      "fix",
      "These people are counted as still working unless their status says they have left.",
      "Every last working day can be read.",
      all.filter((e) => e.raw.doe && e.doe === null).map((e) => row(e, `“${e.raw.doe}”`))
    );
    add(
      "exit-before-join",
      "Leaves before joining",
      "fix",
      "The last working day is before the joining date, so these rows are left out. One of the two dates is probably mistyped.",
      "No one leaves before they join.",
      all.filter((e) => e.doj !== null && e.doe !== null && e.doe < e.doj).map((e) => row(e, `Joined ${dateLabel(e.doj!)}, left ${dateLabel(e.doe!)}`))
    );
  }

  if (has("status")) {
    add(
      "left-no-date",
      "Marked as left, but no last working day",
      "review",
      "These people can't be placed in time, so they are left out of every figure. Add their last working day to count them as leavers.",
      "Everyone marked as left has a last working day.",
      all.filter((e) => e.doj !== null && e.doe === null && e.statusSays === "left").map((e) => row(e, `Status “${e.status}”`))
    );
    add(
      "status-conflict",
      "Status says working, but the last working day has passed",
      "review",
      "Counted as leavers from their last working day. Update the status, or clear the date if they are still working.",
      "Status and last working day agree.",
      all.filter((e) => isCounted(e) && e.statusSays === "active" && e.doe !== null && e.doe <= todayN).map((e) => row(e, `Status “${e.status}”, left ${dateLabel(e.doe!)}`))
    );
  }

  if (has("id")) {
    const seen = new Map<string, Employee[]>();
    for (const e of all) if (e.id) seen.set(e.id.toLowerCase(), [...(seen.get(e.id.toLowerCase()) ?? []), e]);
    const dupes = [...seen.values()].filter((list) => list.length > 1).flat();
    add(
      "duplicates",
      "The same employee ID more than once",
      "review",
      "Each row is counted as a separate stint. That is right for someone who left and rejoined; if a row was copied twice, delete one.",
      "Every employee ID is unique.",
      dupes.map((e) => row(e, e.doj === null ? "No joining date" : `Joined ${dateLabel(e.doj)}${e.doe === null ? "" : `, left ${dateLabel(e.doe)}`}`))
    );
  }

  add(
    "future-join",
    "Joining date in the future",
    "note",
    "Not counted until they join. Usually people who have accepted an offer.",
    "No joining dates in the future.",
    all.filter((e) => e.doj !== null && e.doj > todayN).map((e) => row(e, `Joins ${dateLabel(e.doj!)}`))
  );

  if (has("doe")) {
    add(
      "serving-notice",
      "Last working day in the future",
      "note",
      "Counted as working until their last working day. Usually people serving notice.",
      "No last working days in the future.",
      all.filter((e) => isCounted(e) && e.doe !== null && e.doe > todayN).map((e) => row(e, `Leaves ${dateLabel(e.doe!)}`))
    );
  }

  if (has("manager")) {
    const ids = new Set(all.filter((e) => e.id).map((e) => e.id.toLowerCase()));
    const names = new Set(all.filter((e) => e.name).map((e) => e.name.toLowerCase().replace(/\s+/g, " ")));
    const onRollsIds = new Set(all.filter((e) => e.id && isCounted(e) && onRolls(e, todayN)).map((e) => e.id.toLowerCase()));
    const rows: CheckRow[] = [];
    for (const e of all) {
      if (!e.manager || !isCounted(e) || !onRolls(e, todayN)) continue;
      const k = e.manager.toLowerCase().replace(/\s+/g, " ");
      const inBrackets = k.match(/\(([^)]+)\)/)?.[1]?.trim() ?? "";
      const leading = k.match(/^([^\s]+)\s*[-–:|]\s*\S/)?.[1] ?? "";
      const id = [k, inBrackets, leading].find((x) => x && ids.has(x));
      if (id && !onRollsIds.has(id)) rows.push(row(e, `Manager ${e.manager} has left`));
      else if (!id && !names.has(k.replace(/\s*\([^)]*\)\s*/g, " ").trim())) rows.push(row(e, `Manager “${e.manager}” not found`));
    }
    add(
      "manager",
      "Manager not in the file or has left",
      "review",
      "Span of control still counts them under the manager named. Update the reporting line if it has changed.",
      "Every manager is in the file and still working.",
      rows
    );
  }

  const blanks: CheckRow[] = [];
  const blankFields: [keyof ColumnMap, string, (e: Employee) => string][] = [
    ["id", "Employee ID", (e) => e.id],
    ["dept", "Department", (e) => e.dept],
    ["location", "Location", (e) => e.location],
    ["gender", "Gender", (e) => e.raw.gender],
    ["grade", "Grade", (e) => e.grade]
  ];
  for (const [key, label, value] of blankFields) {
    if (!has(key)) continue;
    for (const e of all) if (!value(e)) blanks.push(row(e, `${label} blank`));
  }
  add("blanks", "Blank values", "review", "Shown as “Not recorded” in charts and filters.", "No blanks in the columns you mapped.", blanks);

  if (has("gender")) {
    add(
      "gender-values",
      "Gender values not recognised",
      "review",
      "Counted as “Not stated”. Use values like Female, Male or Transgender.",
      "Every gender value was recognised.",
      all.filter((e) => e.raw.gender && !e.genderRecognised).map((e) => row(e, `“${e.raw.gender}”`))
    );
  }

  if (has("salary")) {
    add(
      "salary",
      "Salary missing, zero or not a number",
      "review",
      "Left out of the pay figures only.",
      "Every salary is a number.",
      all.filter((e) => isCounted(e) && e.salary === null).map((e) => row(e, e.raw.salary ? `“${e.raw.salary}”` : "Blank"))
    );
  }

  if (has("dob")) {
    const rows: CheckRow[] = [];
    for (const e of all) {
      if (!e.raw.dob) continue;
      if (e.dob === null) rows.push(row(e, `“${e.raw.dob}” is not a date`));
      else if (e.dob > todayN) rows.push(row(e, `Born ${dateLabel(e.dob)}, in the future`));
      else if (e.doj !== null && (e.doj - e.dob) / YEAR < 18) rows.push(row(e, `Under 18 on joining (born ${dateLabel(e.dob)})`));
      else if (e.doj !== null && (e.doj - e.dob) / YEAR > 75) rows.push(row(e, `Over 75 on joining (born ${dateLabel(e.dob)})`));
    }
    add("dob", "Date of birth looks wrong", "review", "Not used in any figure; check the dates in your records.", "Dates of birth look plausible.", rows);
  }

  return checks.sort((a, b) => ORDER[a.status] - ORDER[b.status]);
}

/** "3 checks need a look" style summary. */
export function checkSummary(checks: Check[]): { fix: number; review: number; note: number; ok: number; text: string } {
  const n = (s: CheckStatus) => checks.filter((c) => c.status === s).length;
  const fix = n("fix");
  const review = n("review");
  const text =
    fix + review === 0
      ? `All ${checks.length} checks passed.`
      : `${fix ? `${fix} to fix` : ""}${fix && review ? ", " : ""}${review ? `${review} to review` : ""}; ${n("ok")} of ${checks.length} passed.`;
  return { fix, review, note: n("note"), ok: n("ok"), text };
}

export const affected = (c: Check) => (c.count ? `${c.count} ${c.count === 1 ? "row" : "rows"}` : "None");
