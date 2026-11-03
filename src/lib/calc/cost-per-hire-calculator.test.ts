import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCostPerHire, COST_FIELDS, type CostItem } from "./cost-per-hire-calculator.ts";

/** The worked example on the page (and the calculator's starting values). */
const example: Record<string, number> = {
  ads: 120000,
  agency: 500000,
  referral: 60000,
  checks: 45000,
  travel: 0,
  brand: 50000,
  team: 700000,
  tools: 60000,
  interviews: 160000
};
const items = (amounts: Record<string, number>): CostItem[] => COST_FIELDS.map((f) => ({ id: f.id, label: f.label, group: f.group, amount: amounts[f.id] ?? 0 }));

test("worked example: ₹16,95,000 over 30 hires is ₹56,500 a hire", () => {
  const r = computeCostPerHire({ items: items(example), hires: 30, hiresAnnualCtc: 18000000 });
  assert.equal(r.ok, true);
  assert.equal(r.external, 775000);
  assert.equal(r.internal, 920000);
  assert.equal(r.total, 1695000);
  assert.equal(r.costPerHire, 56500);
  assert.equal(Math.round(r.externalPerHire), 25833);
  assert.equal(Math.round(r.internalPerHire), 30667);
  assert.equal(r.costRatio?.toFixed(1), "9.4");
});

test("items are sorted largest first and zero lines are dropped", () => {
  const r = computeCostPerHire({ items: items(example), hires: 30 });
  assert.equal(r.items[0].id, "team");
  assert.equal(r.items[1].id, "agency");
  assert.ok(r.items.every((i) => i.amount > 0));
  assert.equal(r.items.find((i) => i.id === "travel"), undefined);
  const shares = r.items.reduce((a, i) => a + i.share, 0);
  assert.ok(Math.abs(shares - 1) < 1e-9);
});

test("no CTC means no cost ratio", () => {
  const r = computeCostPerHire({ items: items(example), hires: 30 });
  assert.equal(r.costRatio, null);
});

test("zero hires asks for hires instead of dividing by zero", () => {
  const r = computeCostPerHire({ items: items(example), hires: 0 });
  assert.equal(r.ok, false);
  assert.match(r.message ?? "", /number of people/);
  assert.equal(r.costPerHire, 0);
});

test("fractional hires are floored and negative costs ignored", () => {
  const r = computeCostPerHire({ items: items({ ads: 100000, agency: -50000 }), hires: 2.9 });
  assert.equal(r.total, 100000);
  assert.equal(r.costPerHire, 50000);
});

test("no costs gives a message", () => {
  const r = computeCostPerHire({ items: items({}), hires: 10 });
  assert.equal(r.ok, false);
  assert.match(r.message ?? "", /at least one hiring cost/);
});
