import { test } from "node:test";
import assert from "node:assert/strict";
import { ceilRupee, computeEsi, esiRules } from "./esi.ts";

const covered = { pwd: false, establishmentCovered: true };

test("limits and rates come from statutory.ts", () => {
  assert.deepEqual(esiRules(), { ceiling: 21000, ceilingPwd: 25000, employeeRate: 0.75, employerRate: 3.25, lowWage: 176 });
});

test("₹20,000 → 150 + 650", () => {
  const r = computeEsi({ wages: 20000, ...covered });
  assert.equal(r.covered, true);
  assert.equal(r.employee, 150);
  assert.equal(r.employer, 650);
  assert.equal(r.total, 800);
});

test("₹18,500 → 139 + 602 (rounded up to the next rupee)", () => {
  const r = computeEsi({ wages: 18500, ...covered });
  assert.equal(r.employee, 139);
  assert.equal(r.employer, 602);
});

test("₹21,000 is still covered → 158 + 683", () => {
  const r = computeEsi({ wages: 21000, ...covered });
  assert.equal(r.covered, true);
  assert.equal(r.employee, 158);
  assert.equal(r.employer, 683);
});

test("₹21,500 at the start of a period is not covered", () => {
  const r = computeEsi({ wages: 21500, ...covered });
  assert.equal(r.covered, false);
  assert.equal(r.reason, "above-ceiling");
  assert.equal(r.total, 0);
});

test("a person with a disability at ₹24,000 is covered", () => {
  const r = computeEsi({ wages: 24000, pwd: true, establishmentCovered: true });
  assert.equal(r.covered, true);
  assert.equal(r.ceiling, 25000);
  assert.equal(r.employee, 180);
  assert.equal(r.employer, 780);
});

test("an establishment that is not covered pays nothing", () => {
  const r = computeEsi({ wages: 15000, pwd: false, establishmentCovered: false });
  assert.equal(r.covered, false);
  assert.equal(r.reason, "establishment");
});

test("average daily wage of ₹176 or less: no employee share, employer still pays", () => {
  const r = computeEsi({ wages: 4500, ...covered, avgDailyWage: 173 });
  assert.equal(r.lowWageExempt, true);
  assert.equal(r.employee, 0);
  assert.equal(r.employer, 147);
  assert.equal(computeEsi({ wages: 4600, ...covered, avgDailyWage: 177 }).employee, 35);
});

test("ceilRupee ignores floating-point noise", () => {
  assert.equal(ceilRupee(150.0000000001), 150);
  assert.equal(ceilRupee(138.75), 139);
});
