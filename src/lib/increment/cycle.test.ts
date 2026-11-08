import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_MATRIX, detectColumns, parseMoney, parseRating, readPeople, revisionLetterRows, runCycle, type Cell, type CycleSettings } from "./cycle.ts";

const settings: CycleSettings = {
  budgetPct: 8,
  matrix: DEFAULT_MATRIX,
  effectiveDate: "2027-04-01",
  cutoffDate: "2027-01-01",
  prorate: true,
  fit: false,
  promotionPct: 10,
  promotionBudgetPct: 1
};

const table: Cell[][] = [
  ["Emp Code", "Employee Name", "Department", "Designation", "Grade", "Reporting Manager", "Annual CTC", "Final Rating", "Band Midpoint", "Band Max", "Date of Joining", "Promotion"],
  ["E1", "Asha", "Sales", "Executive", "G3", "Kabir", "8,00,000", "4", "10,00,000", "12,00,000", "01/04/2020", ""],
  ["E2", "Ravi", "Sales", "Executive", "G3", "Kabir", "12,00,000", "Meets expectations", "10,00,000", "12,00,000", "2021-06-01", "No"],
  ["E3", "Meena", "Finance", "Analyst", "G2", "Pooja", "6 lakh", "5", "", "", "2026-10-01", "Yes"],
  ["E4", "Yusuf", "Finance", "Analyst", "G2", "Pooja", "6,00,000", "", "", "", "2019-01-01", ""],
  ["E5", "Diya", "Finance", "Analyst", "G2", "Pooja", "7,00,000", "2", "", "", "2027-02-01", ""]
];

test("columns are found from common HRMS headers", () => {
  const c = detectColumns(table[0]);
  assert.equal(c.id, 0);
  assert.equal(c.salary, 6);
  assert.equal(c.rating, 7);
  assert.equal(c.midpoint, 8);
  assert.equal(c.max, 9);
  assert.equal(c.doj, 10);
  assert.equal(c.promote, 11);
});

test("ratings: numbers on either scale and words", () => {
  assert.equal(parseRating("5"), 0);
  assert.equal(parseRating("1"), 4);
  assert.equal(parseRating("1", "one-best"), 0);
  assert.equal(parseRating("Exceeds expectations"), 1);
  assert.equal(parseRating("Needs improvement"), 3);
  assert.equal(parseRating(""), -1);
  assert.equal(parseMoney("6 lakh"), 600000);
  assert.equal(parseMoney("₹12,00,000"), 1200000);
});

test("per person: compa-ratio zone, proration, promotion, exclusions", () => {
  const { people } = readPeople(table);
  const r = runCycle(people, settings);
  const [asha, ravi, meena, yusuf, diya] = r.outcomes;
  // Asha: rating 4 → Exceeds; compa 0.8 → low zone → 11%.
  assert.equal(asha.zone, 0);
  assert.equal(asha.meritPct, 11);
  assert.equal(asha.newSalary, 888000);
  // Ravi: Meets, compa 1.2 → high zone → 5%; new salary above band max.
  assert.equal(ravi.meritPct, 5);
  assert.equal(ravi.aboveMax, true);
  // Meena: Outstanding, joined 1 Oct 2026 → 6 months of 12; grade median as midpoint; promoted.
  assert.equal(meena.proration, 0.5);
  assert.equal(meena.midFromGrade, true);
  assert.equal(meena.promotionPct, 10);
  // Yusuf: no rating → excluded. Diya: joined after the cut-off → excluded.
  assert.equal(yusuf.status, "excluded");
  assert.equal(diya.status, "excluded");
  assert.equal(r.eligible, 3);
  assert.equal(r.payroll, 2600000);
  assert.equal(r.promotions, 1);
  assert.equal(r.aboveMax, 1);
});

test("fit to budget: merit spends exactly the budget", () => {
  const { people } = readPeople(table);
  const r = runCycle(people, { ...settings, fit: true });
  assert.ok(Math.abs(r.meritCost - r.meritBudget) < 1e-6);
  assert.ok(Math.abs(r.fitFactor - r.meritBudget / r.meritCostUnscaled) < 1e-12);
});

test("totals by department and manager add up", () => {
  const { people } = readPeople(table);
  const r = runCycle(people, settings);
  const sum = (xs: { meritCost: number; promotionCost: number }[]) => xs.reduce((a, g) => a + g.meritCost + g.promotionCost, 0);
  assert.ok(Math.abs(sum(r.byDept) - (r.meritCost + r.promotionCost)) < 1e-6);
  assert.ok(Math.abs(sum(r.byManager) - (r.meritCost + r.promotionCost)) < 1e-6);
});

test("salary revision letter rows use the letter's own field labels", () => {
  const { people } = readPeople(table);
  const rows = revisionLetterRows(runCycle(people, settings), "2027-04-01");
  assert.equal(rows[0][0], "Employee's full name");
  assert.equal(rows.length, 4);
  assert.equal(rows[1][4], "01/04/2027");
  assert.equal(rows[1][6], "8,88,000");
});
