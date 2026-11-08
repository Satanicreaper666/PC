import { test } from "node:test";
import assert from "node:assert/strict";
import { computeBonus } from "./statutory-bonus.ts";

test("bonus on the ₹7,000 calculation ceiling at 8.33% for a full year", () => {
  const r = computeBonus({ wages: 15000, months: 12, ratePct: 8.33, yearEnd: "2026-03-31" });
  assert.equal(r.eligible, true);
  assert.equal(r.monthlyBase, 7000);
  assert.equal(r.bonus, Math.round(84000 * 0.0833));
  assert.equal(r.dueBy, "2026-11-30");
});

test("the minimum wage replaces ₹7,000 when it is higher; wages below it are used as they are", () => {
  assert.equal(computeBonus({ wages: 15000, minimumWage: 12000, months: 12, ratePct: 20 }).bonus, Math.round(144000 * 0.2));
  assert.equal(computeBonus({ wages: 6000, months: 6, ratePct: 8.33 }).base, 36000);
});

test("above the wage ceiling, under 30 days, or disqualified: no bonus", () => {
  assert.equal(computeBonus({ wages: 25000, months: 12, ratePct: 8.33 }).eligible, false);
  assert.equal(computeBonus({ wages: 15000, months: 1, daysWorked: 20, ratePct: 8.33 }).eligible, false);
  assert.equal(computeBonus({ wages: 15000, months: 12, ratePct: 8.33, disqualified: true }).bonus, 0);
});

test("rate outside 8.33% to 20% is rejected; at least ₹100", () => {
  assert.equal(computeBonus({ wages: 15000, months: 12, ratePct: 25 }).status, "invalid");
  assert.equal(computeBonus({ wages: 1000, months: 1, daysWorked: 30, ratePct: 8.33 }).bonus, 100);
});
