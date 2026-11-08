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

import { breakEvenDeductions, hraExemption, taxUnder } from "./income-tax.ts";

test("HRA exemption: the handbook's Bengaluru examples", () => {
  assert.equal(hraExemption({ salary: 480000, hra: 240000, rent: 360000, city50: true }).exempt, 240000);
  assert.equal(hraExemption({ salary: 480000, hra: 240000, rent: 360000, city50: false }).exempt, 192000);
  // Priya: basic 9 lakh, HRA 3.6 lakh, rent 3 lakh → 2.1 lakh.
  assert.equal(hraExemption({ salary: 900000, hra: 360000, rent: 300000, city50: true }).exempt, 210000);
});

test("Priya's old regime: ₹3.87 lakh of exemptions and deductions isn't enough to beat the new regime", () => {
  const i = { salary: 1800000, basic: 900000, hra: 360000, rent: 300000, city50: true, investments: 150000, health: 25000, professionalTax: 2400 };
  const old = taxUnder("old", i);
  assert.equal(old.deductionsUsed.total, 387400);
  const nw = taxUnder("new", i);
  assert.equal(nw.tax.total, 150800);
  assert.ok(old.tax.total > nw.tax.total);
  const be = breakEvenDeductions(i)!;
  assert.ok(be > 387400);
  // At the break-even the old regime costs no more than the new.
  const atBe = taxUnder("old", { salary: 1800000, otherDeductions: be }).tax.total;
  assert.ok(Math.abs(atBe - nw.tax.total) <= 60);
});

test("employer NPS above 14% of basic (new) or 10% (old) is taxed", () => {
  const i = { salary: 1500000, basic: 600000, employerNps: 90000 };
  assert.equal(taxUnder("new", i).npsExcess, 6000);
  assert.equal(taxUnder("old", i).npsExcess, 30000);
});

test("caps on investments and home-loan interest", () => {
  const r = taxUnder("old", { salary: 2000000, investments: 300000, homeLoanInterest: 350000 });
  assert.equal(r.deductionsUsed.investments, 150000);
  assert.equal(r.deductionsUsed.homeLoan, 200000);
});
