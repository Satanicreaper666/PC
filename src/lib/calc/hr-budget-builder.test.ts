import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBudget, replacementsFor, type BudgetInput } from "./hr-budget-builder.ts";

/** The worked example on the page (and the calculator's starting values). */
const example: BudgetInput = {
  headcount: 150,
  revenue: 250000000,
  payroll: 120000000,
  hrPeople: 2,
  hrCostPerPerson: 900000,
  newRoles: 30,
  attritionPct: 20,
  costPerHire: 40000,
  learningPerEmployee: 3500,
  techPerEmployeeMonth: 70,
  engagementPerEmployee: 3000,
  wellbeingPerEmployee: 1500,
  compliance: 200000,
  other: 100000,
  contingencyPct: 5
};

test("worked example: ₹61,17,300 for 150 people", () => {
  const r = buildBudget(example);
  assert.equal(r.ok, true);
  assert.equal(r.replacements, 30);
  assert.equal(r.hires, 60);
  const by = Object.fromEntries(r.lines.map((l) => [l.id, l.amount]));
  assert.deepEqual(by, { team: 1800000, hiring: 2400000, learning: 525000, tech: 126000, engagement: 450000, wellbeing: 225000, compliance: 200000, other: 100000 });
  assert.equal(r.subtotal, 5826000);
  assert.equal(r.contingency, 291300);
  assert.equal(r.total, 6117300);
  assert.equal(Math.round(r.perEmployee), 40782);
  assert.equal(r.pctRevenue?.toFixed(1), "2.4");
  assert.equal(r.pctPayroll?.toFixed(1), "5.1");
});

test("replacements round to whole people", () => {
  assert.equal(replacementsFor(150, 20), 30);
  assert.equal(replacementsFor(37, 18), 7);
  assert.equal(replacementsFor(10, 4), 0);
  assert.equal(replacementsFor(-5, 20), 0);
});

test("revenue and payroll are optional", () => {
  const r = buildBudget({ ...example, revenue: undefined, payroll: 0 });
  assert.equal(r.pctRevenue, null);
  assert.equal(r.pctPayroll, null);
});

test("no headcount or no costs gives a message", () => {
  assert.equal(buildBudget({ ...example, headcount: 0 }).ok, false);
  const zero = buildBudget({
    ...example,
    hrPeople: 0,
    costPerHire: 0,
    learningPerEmployee: 0,
    techPerEmployeeMonth: 0,
    engagementPerEmployee: 0,
    wellbeingPerEmployee: 0,
    compliance: 0,
    other: 0
  });
  assert.equal(zero.ok, false);
  assert.match(zero.message ?? "", /at least one cost/);
});

test("out-of-range percentages are rejected; negative costs count as zero", () => {
  assert.equal(buildBudget({ ...example, attritionPct: 120 }).ok, false);
  assert.equal(buildBudget({ ...example, contingencyPct: -1 }).ok, false);
  const r = buildBudget({ ...example, other: -100000 });
  assert.equal(r.lines.find((l) => l.id === "other")?.amount, 0);
});
