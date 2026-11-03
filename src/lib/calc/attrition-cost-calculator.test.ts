import { test } from "node:test";
import assert from "node:assert/strict";
import { attritionCost, type AttritionCostInput } from "./attrition-cost-calculator.ts";

/** The worked example on the page (and the calculator's starting values). */
const example: AttritionCostInput = {
  annualCtc: 1200000,
  workingDays: 250,
  vacancyDays: 30,
  vacancyLossPct: 50,
  agencyFeePct: 8.33,
  otherHiringCost: 15000,
  hours: 30,
  hourlyCost: 1000,
  onboardingCost: 50000,
  rampMonths: 3,
  rampProductivityPct: 60,
  leaversPerYear: 10
};

test("worked example: ₹3,86,960 to replace a ₹12 lakh role", () => {
  const r = attritionCost(example);
  assert.equal(r.ok, true);
  assert.equal(r.dailyValue, 4800);
  const by = Object.fromEntries(r.parts.map((p) => [p.id, Math.round(p.amount)]));
  assert.deepEqual(by, { vacancy: 72000, hiring: 114960, time: 30000, onboarding: 50000, ramp: 120000 });
  assert.equal(Math.round(r.total), 386960);
  assert.equal(r.multipleOfCtc.toFixed(2), "0.32");
  assert.equal(r.monthsOfCtc.toFixed(1), "3.9");
  assert.equal(Math.round(r.yearly ?? 0), 3869600);
});

test("leavers are optional", () => {
  assert.equal(attritionCost({ ...example, leaversPerYear: undefined }).yearly, null);
  assert.equal(attritionCost({ ...example, leaversPerYear: 0 }).yearly, null);
});

test("full productivity from day one and no empty seat leave only hiring costs", () => {
  const r = attritionCost({ ...example, vacancyDays: 0, rampProductivityPct: 100, hours: 0, onboardingCost: 0 });
  assert.equal(Math.round(r.total), 114960);
});

test("a six-day week changes the day's value", () => {
  const r = attritionCost({ ...example, workingDays: 300 });
  assert.equal(r.dailyValue, 4000);
  assert.equal(Math.round(r.parts[0].amount), 60000);
});

test("invalid inputs give a message", () => {
  assert.equal(attritionCost({ ...example, annualCtc: 0 }).ok, false);
  assert.equal(attritionCost({ ...example, workingDays: 0 }).ok, false);
  assert.match(attritionCost({ ...example, agencyFeePct: 120 }).message ?? "", /Agency fee/);
  assert.match(attritionCost({ ...example, rampProductivityPct: -10 }).message ?? "", /ramp-up/);
});

test("negative amounts count as zero", () => {
  const r = attritionCost({ ...example, otherHiringCost: -5000, onboardingCost: -1 });
  assert.equal(Math.round(r.parts[1].amount), 99960);
  assert.equal(r.parts[3].amount, 0);
});
