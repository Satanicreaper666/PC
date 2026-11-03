import { test } from "node:test";
import assert from "node:assert/strict";
import { dayNum } from "./dates.ts";
import { csvCell, summaryCsv, templateCsv, toCsv } from "./export.ts";
import { detectColumns } from "./fields.ts";
import { computeDashboard, NO_FILTERS, periodPresets } from "./metrics.ts";
import { runChecks } from "./quality.ts";
import { buildEmployees } from "./records.ts";
import { sampleTable } from "./sample.ts";

test("cells are quoted and protected from formula injection", () => {
  assert.equal(csvCell("Sales"), "Sales");
  assert.equal(csvCell("Sales, North"), '"Sales, North"');
  assert.equal(csvCell('The "A" team'), '"The ""A"" team"');
  assert.equal(csvCell("=HYPERLINK(\"x\")"), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell("+91 team"), "'+91 team");
  assert.equal(csvCell("@ops"), "'@ops");
  assert.equal(csvCell(-5), "-5", "numbers are not text");
  assert.equal(csvCell(13.7931), "13.79");
  assert.equal(csvCell(null), "");
  assert.equal(toCsv([["a", 1], ["b", 2]]), "a,1\r\nb,2\r\n");
});

test("the summary has totals only", () => {
  const today = dayNum(2026, 11, 2);
  const t = sampleTable(today);
  const det = detectColumns(t.headers, t.rows);
  const people = buildEmployees({ headers: t.headers, rows: t.rows, firstRow: 2 }, det.map, { dateOrder: det.dateOrder, salaryPeriod: "annual", statusMap: {} });
  const d = computeDashboard(people, periodPresets(today, null)[0], NO_FILTERS, { hasManager: true, hasSalary: true, payBy: "dept" });
  const csv = summaryCsv(d, runChecks(people, det.map, today), { source: "Sample data", generatedOn: today, filters: NO_FILTERS, payUnit: "annual" });
  assert.match(csv, /^PeopleCraft people analytics summary/);
  assert.match(csv, /Period,1 Nov 2025 to 31 Oct 2026,Last 12 months/);
  assert.match(csv, /Attrition rate \(%\),\d+(\.\d)?,Leavers ÷ average headcount × 100/);
  assert.match(csv, /Customer support/);
  for (const e of people) {
    assert.ok(!csv.includes(e.name), `no names: ${e.name}`);
    assert.ok(!csv.includes(e.id), `no IDs: ${e.id}`);
  }
});

test("template has a header row only", () => {
  const lines = templateCsv().trim().split("\r\n");
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^Employee ID,Name,Department/);
});
