import { test } from "node:test";
import assert from "node:assert/strict";
import { dayNum } from "./dates.ts";
import type { ColumnMap } from "./fields.ts";
import { buildEmployees, statusValues, type RawTable } from "./records.ts";
import { checkSummary, runChecks } from "./quality.ts";

const headers = ["ID", "Name", "DOJ", "LWD", "Status", "Department", "Gender", "Manager", "CTC", "DOB"];
const map: ColumnMap = { id: 0, name: 1, doj: 2, doe: 3, status: 4, dept: 5, gender: 6, manager: 7, salary: 8, dob: 9 };
const table: RawTable = {
  headers,
  firstRow: 2,
  rows: [
    ["E1", "Asha", "01/04/2020", "", "Active", "Sales", "F", "", "9,00,000", "12/05/1990"],
    ["E2", "Ravi", "", "", "Active", "Sales", "M", "E1", "6,00,000", ""], // no joining date
    ["E3", "Kiran", "31/13/2021", "", "Active", "Sales", "M", "E1", "6,00,000", ""], // unreadable joining date
    ["E4", "Meena", "01/04/2022", "01/03/2022", "Resigned", "Sales", "F", "E1", "5,00,000", ""], // leaves before joining
    ["E5", "John", "01/04/2021", "", "Resigned", "Ops", "M", "E1", "5,00,000", ""], // left without a date
    ["E6", "Sara", "01/04/2021", "15/01/2026", "Active", "Ops", "F", "E1", "NA", ""], // status conflict, bad salary
    ["E1", "Asha", "01/02/2026", "", "Active", "Sales", "Femal", "E9", "9,50,000", "12/05/2030"], // rehire on the same ID, odd gender, unknown manager, DOB in the future
    ["E7", "Noor", "15/12/2026", "", "Yet to join", "", "F", "E1", "7,00,000", ""], // joins later, blank department
    ["E8", "Dev", "01/01/2023", "30/11/2026", "Notice period", "Ops", "M", "E1", "8,00,000", "01/01/2010"] // serving notice, under 18 on joining
  ]
};
const opts = { dateOrder: "dmy" as const, salaryPeriod: "annual" as const, statusMap: {} };
const today = dayNum(2026, 11, 2);

test("every kind of problem is found, with spreadsheet row numbers", () => {
  const people = buildEmployees(table, map, opts);
  const checks = runChecks(people, map, today);
  const by = Object.fromEntries(checks.map((c) => [c.id, c]));
  assert.deepEqual(by.joining.rows.map((r) => r.row), [3, 4]);
  assert.equal(by.joining.status, "fix");
  assert.equal(by["exit-before-join"].count, 1);
  assert.equal(by["left-no-date"].rows[0].id, "E5");
  assert.equal(by["status-conflict"].rows[0].id, "E6");
  assert.equal(by.duplicates.count, 2);
  assert.equal(by.duplicates.status, "review");
  assert.equal(by["future-join"].status, "note");
  assert.equal(by["serving-notice"].rows[0].id, "E8");
  assert.deepEqual(by.manager.rows.map((r) => [r.row, r.detail]), [[8, "Manager “E9” not found"]]);
  assert.equal(by.blanks.count, 1);
  assert.equal(by["gender-values"].rows[0].detail, "“Femal”");
  assert.equal(by.salary.rows[0].id, "E6");
  assert.deepEqual(by.dob.rows.map((r) => r.row), [8, 10]);
  assert.equal(checks[0].status, "fix", "most serious first");
});

test("a clean file passes every check", () => {
  const clean: RawTable = { headers, firstRow: 2, rows: [["E1", "Asha", "01/04/2020", "", "Active", "Sales", "F", "", "9,00,000", "12/05/1990"], ["E2", "Ravi", "01/04/2021", "", "Active", "Sales", "M", "E1", "6,00,000", "01/02/1995"]] };
  const checks = runChecks(buildEmployees(clean, map, opts), map, today);
  assert.ok(checks.every((c) => c.status === "ok"));
  assert.equal(checkSummary(checks).text, `All ${checks.length} checks passed.`);
});

test("status choices override the automatic reading", () => {
  const values = statusValues(table, map);
  assert.deepEqual(values.map((v) => [v.value, v.count, v.reads]), [
    ["Active", 5, "active"], ["Resigned", 2, "left"], ["Yet to join", 1, "active"], ["Notice period", 1, "active"]
  ]);
  const people = buildEmployees(table, map, { ...opts, statusMap: { resigned: "auto" } });
  assert.equal(people.find((e) => e.id === "E5")!.statusSays, null);
});
