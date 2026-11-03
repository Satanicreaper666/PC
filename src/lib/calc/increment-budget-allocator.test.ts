import { test } from "node:test";
import assert from "node:assert/strict";
import { allocateIncrements, weightedIncrease, RATINGS, ZONES } from "./increment-budget-allocator.ts";

/** The worked example on the page (and the calculator's starting values). */
const example = {
  payroll: 50000000,
  budgetPct: 7,
  headcount: [10, 30, 45, 12, 3],
  zoneMix: [25, 50, 25],
  matrix: [
    [14, 12, 9],
    [11, 9, 7],
    [8, 7, 5],
    [3, 2, 0],
    [0, 0, 0]
  ]
};

test("shape constants", () => {
  assert.equal(RATINGS.length, 5);
  assert.equal(ZONES.length, 3);
});

test("worked example: matrix costs ₹35,61,250 against a ₹35,00,000 budget", () => {
  const r = allocateIncrements(example);
  assert.equal(r.ok, true);
  assert.equal(r.people, 100);
  assert.equal(r.avgSalary, 500000);
  assert.equal(Math.round(r.budget), 3500000);
  assert.equal(Math.round(r.cost), 3561250);
  assert.equal(Math.round(r.difference), 61250);
  assert.equal(r.weightedPct.toFixed(4), "7.1225");
  assert.equal(r.usedPct.toFixed(2), "101.75");
  assert.equal(r.fitFactor.toFixed(4), "0.9828");
  assert.deepEqual(
    r.rows.map((x) => x.avgPct),
    [11.75, 9, 6.75, 1.75, 0]
  );
  assert.deepEqual(
    r.rows.map((x) => Math.round(x.cost)),
    [587500, 1350000, 1518750, 105000, 0]
  );
});

test("fitted matrix spends the budget to within rounding", () => {
  const r = allocateIncrements(example);
  assert.deepEqual(r.fitted[0], [13.8, 11.8, 8.8]);
  assert.deepEqual(r.fitted[3], [2.9, 2, 0]);
  const w = weightedIncrease(r.fitted, example.headcount, example.zoneMix);
  assert.ok(Math.abs(w - 7) < 0.05, `fitted weighted increase ${w}`);
});

test("under budget shows a negative difference and a fit factor above 1", () => {
  const r = allocateIncrements({ ...example, budgetPct: 8 });
  assert.ok(r.difference < 0);
  assert.ok(r.fitFactor > 1);
});

test("band positions must add up to 100%", () => {
  const r = allocateIncrements({ ...example, zoneMix: [30, 50, 30] });
  assert.equal(r.ok, false);
  assert.match(r.message ?? "", /add up to 110%/);
});

test("missing payroll or people gives a message", () => {
  assert.equal(allocateIncrements({ ...example, payroll: 0 }).ok, false);
  assert.equal(allocateIncrements({ ...example, headcount: [0, 0, 0, 0, 0] }).ok, false);
  assert.equal(allocateIncrements({ ...example, matrix: [[120, 0, 0], ...example.matrix.slice(1)] }).ok, false);
});

test("a zero budget with a zero matrix is fine; a zero budget with increases is over", () => {
  const zeros = example.matrix.map((row) => row.map(() => 0));
  const a = allocateIncrements({ ...example, budgetPct: 0, matrix: zeros });
  assert.equal(a.ok, true);
  assert.equal(a.cost, 0);
  assert.equal(a.usedPct, 0);
  const b = allocateIncrements({ ...example, budgetPct: 0 });
  assert.equal(b.usedPct, Infinity);
  assert.equal(b.fitFactor, 0);
});
