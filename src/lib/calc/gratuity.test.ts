import { test } from "node:test";
import assert from "node:assert/strict";
import { computeGratuity, gratuityRules, roundRupee, yearsForAmount } from "./gratuity.ts";

const base = { wages: 60000, type: "permanent" as const, reason: "resignation" as const };

test("rules come from statutory.ts", () => {
  assert.deepEqual(gratuityRules(), { daysPerYear: 15, divisor: 26, minYears: 5, fixedTermMinYears: 1, partYearMonths: 6, ceiling: 2000000, paymentDays: 30 });
});

test("page example: 1 Apr 2019 to 31 Oct 2026 (7 y 7 m) at ₹60,000 → 8 years → ₹2,76,923", () => {
  const r = computeGratuity({ ...base, doj: "2019-04-01", lwd: "2026-10-31" });
  assert.equal(r.status, "ok");
  assert.deepEqual(r.service, { years: 7, months: 7, days: 0 });
  assert.equal(r.countedYears, 8);
  assert.equal(roundRupee(r.amount), 276923);
  assert.equal(r.payBy, "2026-11-30");
});

test("exactly 6 months over does not round up; 6 months and a day does", () => {
  const a = computeGratuity({ ...base, doj: "2019-04-01", lwd: "2026-09-30" });
  assert.deepEqual(a.service, { years: 7, months: 6, days: 0 });
  assert.equal(a.countedYears, 7);
  const b = computeGratuity({ ...base, doj: "2019-04-01", lwd: "2026-10-01" });
  assert.deepEqual(b.service, { years: 7, months: 6, days: 1 });
  assert.equal(b.countedYears, 8);
  assert.equal(yearsForAmount({ years: 2, months: 6, days: 0 }), 2);
});

test("4 years 9 months on resignation is not payable; on death it is, counting 5 years", () => {
  const resign = computeGratuity({ ...base, doj: "2022-01-01", lwd: "2026-09-30" });
  assert.equal(resign.eligible, false);
  assert.equal(resign.amount, 0);
  assert.equal(resign.payBy, undefined);
  const death = computeGratuity({ ...base, doj: "2022-01-01", lwd: "2026-09-30", reason: "death" });
  assert.equal(death.eligible, true);
  assert.equal(death.countedYears, 5);
  assert.equal(roundRupee(death.amount), 173077);
});

test("rounding never creates eligibility: 4 years 11 months is still not payable", () => {
  const r = computeGratuity({ ...base, doj: "2021-11-01", lwd: "2026-09-30" });
  assert.equal(r.service.years, 4);
  assert.equal(r.countedYears, 5);
  assert.equal(r.eligible, false);
});

test("fixed-term: 1 year 3 months at ₹40,000 → ₹23,077; 11 months → not payable", () => {
  const r = computeGratuity({ doj: "2025-07-01", lwd: "2026-09-30", wages: 40000, type: "fixed_term", reason: "contract_expiry" });
  assert.equal(r.eligible, true);
  assert.equal(r.countedYears, 1);
  assert.equal(roundRupee(r.amount), 23077);
  const short = computeGratuity({ doj: "2025-11-01", lwd: "2026-09-30", wages: 40000, type: "fixed_term", reason: "contract_expiry" });
  assert.equal(short.eligible, false);
});

test("ceiling: ₹3,00,000 for 20 years → ₹34,61,538 capped at ₹20,00,000", () => {
  const r = computeGratuity({ doj: "2006-11-01", lwd: "2026-10-31", wages: 300000, type: "permanent", reason: "retirement" });
  assert.equal(roundRupee(r.uncapped), 3461538);
  assert.equal(r.amount, 2000000);
  assert.equal(r.capped, true);
});

test("cases the calculator does not model are flagged, not computed", () => {
  const early = computeGratuity({ doj: "2024-01-01", lwd: "2026-06-30", wages: 40000, type: "fixed_term", reason: "resignation" });
  assert.equal(early.status, "not-covered");
  const odd = computeGratuity({ doj: "2015-01-01", lwd: "2026-06-30", wages: 40000, type: "permanent", reason: "contract_expiry" });
  assert.equal(odd.status, "not-covered");
});

test("bad input gives a message", () => {
  assert.equal(computeGratuity({ ...base, doj: "2026-10-31", lwd: "2019-04-01" }).status, "invalid");
  assert.equal(computeGratuity({ ...base, doj: "", lwd: "2026-10-31" }).status, "invalid");
  assert.equal(computeGratuity({ ...base, wages: 0, doj: "2019-04-01", lwd: "2026-10-31" }).status, "invalid");
});

test("month-end joiners: anniversaries clamp to the month's last day", () => {
  const leap = computeGratuity({ ...base, doj: "2020-02-29", lwd: "2025-02-27" });
  assert.deepEqual(leap.service, { years: 5, months: 0, days: 0 });
  assert.equal(computeGratuity({ ...base, doj: "2020-02-29", lwd: "2025-02-26" }).eligible, false);
  // Joined 31 Aug 2021: the 66-month anniversary is 28 Feb 2027.
  const a = computeGratuity({ ...base, doj: "2021-08-31", lwd: "2027-02-27" });
  assert.deepEqual(a.service, { years: 5, months: 6, days: 0 });
  assert.equal(a.countedYears, 5);
  const b = computeGratuity({ ...base, doj: "2021-08-31", lwd: "2027-02-28" });
  assert.deepEqual(b.service, { years: 5, months: 6, days: 1 });
  assert.equal(b.countedYears, 6);
});
