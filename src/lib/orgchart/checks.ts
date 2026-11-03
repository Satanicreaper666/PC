/**
 * Data checks for the org chart: what in the file changed how the chart is
 * drawn, what the tool did about it, and which rows to fix.
 */
import type { OcColumnMap, Person } from "./fields.ts";
import { displayName, type Org } from "./hierarchy.ts";

/** fix = the chart had to guess; review = drawn as given, but check; note = handled as expected; ok = nothing found. */
export type CheckStatus = "fix" | "review" | "note" | "ok";
export type CheckRow = { row: number; id: string; name: string; detail: string };
export type Check = { id: string; title: string; status: CheckStatus; count: number; effect: string; rows: CheckRow[] };

const ORDER: Record<CheckStatus, number> = { fix: 0, review: 1, note: 2, ok: 3 };

const rowsList = (rows: number[]) => (rows.length === 1 ? `row ${rows[0]}` : `rows ${rows.slice(0, -1).join(", ")} and ${rows[rows.length - 1]}`);

export function orgChecks(org: Org, map: OcColumnMap): Check[] {
  const P = org.people;
  const checks: Check[] = [];
  const line = (i: number, detail: string): CheckRow => ({ row: P[i].row, id: P[i].id, name: P[i].name, detail });
  const add = (id: string, title: string, status: CheckStatus, effect: string, okText: string, rows: CheckRow[]) =>
    checks.push({ id, title, status: rows.length ? status : "ok", count: new Set(rows.map((r) => r.row)).size, effect: rows.length ? effect : okText, rows });
  const managerText = (p: Person) => p.managerId || p.managerName;

  add(
    "loops",
    "Reporting loops",
    "fix",
    "These people report to each other in a circle (for example, A reports to B and B reports to A), so no one in the loop has a manager above it. The chart breaks each loop at the person who comes first in the file and shows them at the top. Correct the manager for one person in each loop.",
    "No chain of managers leads back to the same person.",
    org.loops.flatMap((loop) => loop.map((i) => line(i, `Reports to ${managerText(P[i])}${org.topReason[i] === "loop" ? " (shown at the top)" : ""}`)))
  );

  const dupRows: CheckRow[] = [];
  for (const list of org.duplicates)
    list.forEach((i, k) => {
      const others = list.filter((j) => j !== i).map((j) => P[j].row);
      dupRows.push(line(i, `ID ${P[i].id} is also on ${rowsList(others)}${k === 0 ? "; reports to this ID go to this row" : ""}`));
    });
  add(
    "duplicates",
    "Employee ID used more than once",
    "fix",
    "Anyone whose manager has one of these IDs is placed under the first row with that ID. Give each person their own ID, or remove the extra row if it is the same person twice.",
    map.id === undefined ? "No Employee ID column was chosen, so IDs weren't checked." : "Every employee ID is used once.",
    dupRows
  );

  const notFound = [...org.unresolved.entries()].filter(([i]) => org.topReason[i] === "notFound");
  add(
    "notFound",
    "Manager not found",
    "fix",
    "No one in the file matches the manager these people report to, so the chart shows them at the top level, apart from everyone else. Add the manager to the file or correct the manager column.",
    "Every manager named in the file was found.",
    notFound.map(([i, u]) => line(i, `Reports to “${u.text}”, who isn't in the file`))
  );

  const ambiguous = [...org.unresolved.entries()].filter(([i]) => org.topReason[i] === "ambiguous");
  add(
    "ambiguous",
    "Manager's name matches more than one person",
    "review",
    "The tool can't tell which person is meant, so these people are shown at the top level. Use the manager's employee ID instead of the name.",
    "Every manager's name matched one person.",
    ambiguous.map(([i, u]) => line(i, `“${u.text}” matches ${rowsList(u.matches.map((j) => P[j].row))}`))
  );

  const none = org.roots.filter((i) => org.topReason[i] === "none");
  add(
    "tops",
    "More than one person with no manager",
    "review",
    "The chart shows each of them at the top with their team, side by side. If one of them reports to another, fill in their manager.",
    none.length === 1 ? `One person has no manager: ${displayName(P[none[0]])}, at the top of the chart.` : "No one has an empty manager cell.",
    none.length > 1 ? none.map((i) => line(i, `${org.below[i]} ${org.below[i] === 1 ? "person" : "people"} below them`)) : []
  );

  const self = org.roots.filter((i) => org.topReason[i] === "self");
  add(
    "self",
    "Listed as their own manager",
    "note",
    "Many HR systems record the head of the organisation as their own manager. The chart treats them as having no manager.",
    "No one is listed as their own manager.",
    self.map((i) => line(i, `Manager is ${managerText(P[i])}, their own ${P[i].managerId ? "ID" : "name"}`))
  );

  add(
    "noName",
    "Name missing",
    "review",
    "These boxes show the employee ID or the row number instead of a name. Add the names to the file.",
    "Every row has a name.",
    P.flatMap((p, i) => (p.name ? [] : [line(i, `Shown as “${displayName(p)}”`)]))
  );

  if (map.id !== undefined && map.managerId !== undefined) {
    add(
      "noId",
      "Employee ID missing",
      "review",
      "No one can be placed under these people, because the manager column refers to managers by ID. Add their IDs.",
      "Every row has an employee ID.",
      P.flatMap((p, i) => (p.id ? [] : [line(i, "The Employee ID cell is empty")]))
    );
  }

  return checks.sort((a, b) => ORDER[a.status] - ORDER[b.status]);
}

/** "2 checks need fixing and 1 needs a look. 4 found nothing." */
export function checkSummary(checks: Check[]): { text: string; fix: number; review: number } {
  const fix = checks.filter((c) => c.status === "fix").length;
  const review = checks.filter((c) => c.status === "review").length;
  const ok = checks.filter((c) => c.status === "ok").length;
  const parts: string[] = [];
  if (fix) parts.push(`${fix} ${fix === 1 ? "check needs" : "checks need"} fixing`);
  if (review) parts.push(`${review} ${review === 1 ? "needs" : "need"} a look`);
  const head = parts.length ? `${parts.join(" and ")}.` : "Nothing to fix.";
  return { text: `${head} ${ok} ${ok === 1 ? "check" : "checks"} found nothing.`, fix, review };
}

/** "3 rows" or "1 row" for the summary line of a check. */
export const affected = (c: Check) => (c.status === "ok" ? "" : `${c.count} ${c.count === 1 ? "row" : "rows"}`);
