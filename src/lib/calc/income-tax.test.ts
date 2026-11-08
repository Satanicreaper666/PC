import { test } from "node:test";
import assert from "node:assert/strict";
import { computeIncomeTax, slabTax, NEW_SLABS } from "./income-tax.ts";

test("handbook example: ₹18 lakh salary, new regime, is ₹1,50,800 with cess", () => {
  const r = computeIncomeTax({ salary: 1800000, regime: "new" });
  assert.equal(r.standardDeduction, 75000);
  assert.equal(r.taxableIncome, 1725000);
  assert.equal(r.slabTax, 145000);
  assert.equal(r.cess, 5800);
  assert.equal(r.total, 150800);
});

test("new regime: nil tax up to ₹12 lakh of taxable income (rebate)", () => {
  const r = computeIncomeTax({ salary: 1275000, regime: "new" });
  assert.equal(r.taxableIncome, 1200000);
  assert.equal(r.slabTax, 60000);
  assert.equal(r.rebate, 60000);
  assert.equal(r.total, 0);
});

test("new regime marginal relief: ₹12,10,000 taxable pays ₹10,000 plus cess", () => {
  const r = computeIncomeTax({ salary: 1285000, regime: "new" });
  assert.equal(r.taxableIncome, 1210000);
  assert.equal(r.slabTax, 61500);
  assert.equal(r.marginalRelief, 51500);
  assert.equal(r.total, 10400);
});

test("non-residents get no rebate", () => {
  const r = computeIncomeTax({ salary: 1000000, regime: "new", resident: false });
  assert.equal(r.rebate, 0);
  assert.ok(r.total > 0);
});

test("old regime: deductions, ₹50,000 standard deduction and the ₹5 lakh rebate", () => {
  const low = computeIncomeTax({ salary: 700000, regime: "old", deductions: 150000 });
  assert.equal(low.taxableIncome, 500000);
  assert.equal(low.slabTax, 12500);
  assert.equal(low.total, 0);
  const r = computeIncomeTax({ salary: 1800000, regime: "old", deductions: 337000 });
  // 18,00,000 − 50,000 − 3,37,000 = 14,13,000: 12,500 + 1,00,000 + 30% of 4,13,000.
  assert.equal(r.taxableIncome, 1413000);
  assert.equal(r.slabTax, 236400);
  assert.equal(r.total, Math.round(236400 * 1.04));
});

test("old regime nil band rises with age", () => {
  assert.equal(computeIncomeTax({ salary: 350000, regime: "old", age: "60to79" }).total, 0);
  assert.equal(computeIncomeTax({ salary: 1050000, regime: "old", age: "80plus" }).slabTax, 100000);
});

test("surcharge with marginal relief just above ₹50 lakh", () => {
  const at = computeIncomeTax({ salary: 5075000, regime: "new" });
  assert.equal(at.taxableIncome, 5000000);
  assert.equal(at.surcharge, 0);
  const above = computeIncomeTax({ salary: 5085000, regime: "new" });
  // Tax + surcharge may exceed the tax at ₹50 lakh by no more than the ₹10,000 of extra income.
  assert.ok(above.taxAfterRebate + above.surcharge <= at.taxAfterRebate + 10000 + 1e-6);
  const well = computeIncomeTax({ salary: 7075000, regime: "new" });
  assert.equal(well.surchargeRate, 10);
  assert.equal(well.surcharge, well.taxAfterRebate * 0.1);
});

test("slab parts add up", () => {
  const s = slabTax(1725000, NEW_SLABS);
  assert.equal(s.parts.reduce((a, p) => a + p.tax, 0), s.total);
});
