import { test } from "node:test";
import assert from "node:assert/strict";
import { planHeadcount, spreadWhole, timingWeights, type HeadcountInput } from "./headcount-planning-model.ts";

/** The worked example on the page (and the calculator's starting values). */
const example: HeadcountInput = {
  opening: 200,
  newRoles: 40,
  attritionPct: 18,
  avgCtc: 1200000,
  extraCostPct: 0,
  leadDays: 45,
  noticeDays: 30,
  revenue: 500000000,
  timing: "even",
  startMonth: 3
};

test("spreadWhole keeps whole numbers that add up", () => {
  assert.deepEqual(spreadWhole(40, timingWeights("even")), [3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 4, 3]);
  assert.equal(spreadWhole(7, timingWeights("early")).reduce((a, b) => a + b, 0), 7);
  assert.deepEqual(spreadWhole(0, timingWeights("even")), Array(12).fill(0));
  const early = spreadWhole(78, timingWeights("early"));
  assert.equal(early[0], 12);
  assert.equal(early[11], 1);
});

test("worked example: 200 people, 40 new roles, 18% attrition", () => {
  const r = planHeadcount(example);
  assert.equal(r.ok, true);
  assert.equal(r.months[0].label, "Apr");
  assert.equal(r.months[11].label, "Mar");
  assert.equal(r.closing, 240);
  assert.equal(r.growth, 40);
  assert.equal(r.leavers, 39);
  assert.equal(r.joiners, 79);
  assert.deepEqual(
    r.months.map((m) => m.leavers),
    [3, 3, 3, 3, 3, 4, 3, 3, 4, 3, 4, 3]
  );
  assert.deepEqual(
    r.months.map((m) => m.joiners),
    [6, 7, 6, 6, 7, 7, 6, 7, 7, 6, 8, 6]
  );
  assert.equal(r.peakJoiners, 8);
  assert.equal(r.averageHeadcount, 220);
  assert.equal(Math.round(r.annualCost), 264000000);
  assert.equal(Math.round(r.revenuePerEmployee ?? 0), 2272727);
  assert.equal(r.leadMonths, 2);
  assert.equal(r.rolesToOpenBeforeStart, 7);
  assert.equal(r.emptyDays, 15);
  assert.equal(r.emptySeats.toFixed(1), "1.6");
});

test("every month balances: opening − leavers + joiners = closing", () => {
  for (const timing of ["even", "early", "late"] as const) {
    const r = planHeadcount({ ...example, timing, newRoles: 23, attritionPct: 27 });
    for (const m of r.months) assert.equal(m.opening - m.leavers + m.joiners, m.closing);
    assert.equal(r.closing, 223);
  }
});

test("a small team still shows its leavers (the original rounded them away)", () => {
  const r = planHeadcount({ ...example, opening: 30, newRoles: 0, attritionPct: 18 });
  assert.equal(r.leavers, 5); // 30 × 18% = 5.4 a year
  assert.equal(r.closing, 30);
  assert.ok(r.months.some((m) => m.leavers > 0));
});

test("no attrition and no growth: a flat plan", () => {
  const r = planHeadcount({ ...example, newRoles: 0, attritionPct: 0 });
  assert.equal(r.joiners, 0);
  assert.equal(r.leavers, 0);
  assert.equal(r.emptySeats, 0);
  assert.equal(Math.round(r.annualCost), 240000000);
});

test("costs outside CTC raise the payroll projection", () => {
  const r = planHeadcount({ ...example, extraCostPct: 10 });
  assert.equal(Math.round(r.annualCost), 290400000);
});

test("notice longer than lead time means no empty seats", () => {
  const r = planHeadcount({ ...example, leadDays: 30, noticeDays: 60 });
  assert.equal(r.emptyDays, 0);
  assert.equal(r.emptySeats, 0);
  assert.equal(r.leadMonths, 1);
});

test("invalid input gives a message", () => {
  assert.equal(planHeadcount({ ...example, opening: 0 }).ok, false);
  assert.equal(planHeadcount({ ...example, newRoles: -3 }).ok, false);
  assert.equal(planHeadcount({ ...example, attritionPct: 101 }).ok, false);
  assert.equal(planHeadcount({ ...example, revenue: 0 }).revenuePerEmployee, null);
});
