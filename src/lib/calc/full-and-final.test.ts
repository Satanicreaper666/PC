import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFnf, defaultPaidDays, gratuityReasonFor } from "./full-and-final.ts";
import type { FnfInput } from "./full-and-final.ts";

/** The worked example on the page. */
const example: FnfInput = {
  separation: "resignation",
  employment: "permanent",
  worker: true,
  doj: "2019-04-01",
  lwd: "2026-12-04",
  monthlyGross: 93000,
  paidDays: null,
  payBasis: "calendar",
  wages: 60000,
  leaveDays: 18,
  leaveDivisor: 26,
  noticePayInLieu: 0,
  otherDues: 0,
  noticeRecovery: 0,
  loans: 10000,
  otherRecoveries: 0,
  weeklyOff: "sat_sun",
  holidays: []
};

test("page example: salary, leave and gratuity, less a loan", () => {
  const r = computeFnf(example);
  assert.equal(r.status, "ok");
  assert.equal(r.salary.days, 4);
  assert.equal(r.salary.divisor, 31);
  assert.equal(r.salary.amount, 12000);
  assert.equal(r.leave.amount, 41538);
  assert.equal(r.gratuityAmount, 276923);
  assert.equal(r.dues, 330461);
  assert.equal(r.recoveries, 10000);
  assert.equal(r.net, 320461);
});

test("due dates: wages and leave by Tue 8 Dec 2026; gratuity by 3 Jan 2027", () => {
  const r = computeFnf(example);
  assert.equal(r.due.wages.date, "2026-12-08");
  assert.equal(r.due.wages.rule, "Code on Wages, 2019 s.17(2)");
  assert.equal(r.due.leave.date, "2026-12-08");
  assert.equal(r.due.gratuity.date, "2027-01-03");
});

test("a holiday pushes the two-working-day date", () => {
  const r = computeFnf({ ...example, holidays: ["2026-12-07"] });
  assert.equal(r.due.wages.date, "2026-12-09");
});

test("superannuation and death: no two-day wage rule; leave within 2 months for workers", () => {
  const r = computeFnf({ ...example, separation: "superannuation" });
  assert.equal(r.due.wages.date, undefined);
  assert.match(r.due.wages.text, /normal pay date/);
  assert.equal(r.due.leave.date, "2027-02-04");
  const d = computeFnf({ ...example, separation: "death" });
  assert.equal(d.due.leave.date, "2027-02-04");
  assert.equal(d.gratuity.eligible, true);
});

test("not an OSH worker: leave encashment follows policy", () => {
  const r = computeFnf({ ...example, worker: false });
  assert.equal(r.due.leave.date, undefined);
  assert.match(r.due.leave.text, /leave policy/);
});

test("under five years: no gratuity, so no gratuity due date", () => {
  const r = computeFnf({ ...example, doj: "2023-01-01" });
  assert.equal(r.gratuityAmount, 0);
  assert.equal(r.due.gratuity.text, "Not payable");
});

test("recoveries larger than dues give a negative net", () => {
  const r = computeFnf({ ...example, doj: "2025-01-01", leaveDays: 0, noticeRecovery: 50000, loans: 0 });
  assert.equal(r.net, 12000 - 50000);
});

test("payable days: typed days are used and capped at the divisor", () => {
  assert.equal(computeFnf({ ...example, paidDays: 3 }).salary.amount, 9000);
  assert.equal(computeFnf({ ...example, paidDays: 40, payBasis: "30" }).salary.days, 30);
});

test("default payable days by basis", () => {
  assert.equal(defaultPaidDays("2019-04-01", "2026-12-04", "calendar", "sat_sun"), 4);
  assert.equal(defaultPaidDays("2019-04-01", "2026-12-31", "30", "sat_sun"), 30);
  assert.equal(defaultPaidDays("2019-04-01", "2026-12-04", "26", "sat_sun"), 4);
  assert.equal(defaultPaidDays("2026-12-02", "2026-12-04", "calendar", "sat_sun"), 3);
});

test("separation types map to gratuity reasons", () => {
  assert.equal(gratuityReasonFor("retrenchment"), "termination");
  assert.equal(gratuityReasonFor("superannuation"), "retirement");
  assert.equal(gratuityReasonFor("contract_expiry"), "contract_expiry");
});

test("bad dates give a message", () => {
  assert.equal(computeFnf({ ...example, lwd: "2018-01-01" }).status, "invalid");
  assert.equal(computeFnf({ ...example, doj: "" }).status, "invalid");
});

/* ---------- Retrenchment, deductions and TDS ---------- */

const retrench: FnfInput = {
  ...example,
  separation: "retrenchment",
  loans: 0,
  noticePayInLieu: 60000,
  doj: "2019-04-01",
  lwd: "2026-12-04"
};

test("retrenchment: 15 days' average pay per completed year and part over six months", () => {
  const r = computeFnf(retrench);
  // 7 years 8 months 4 days → 8 years; 60,000 ÷ 26 × 15 × 8.
  assert.equal(r.compensation.applies, true);
  assert.equal(r.compensation.years, 8);
  assert.equal(r.compensation.amount, Math.round((60000 / 26) * 15 * 8));
  // Re-skilling fund: 15 days' last drawn wages, paid by the employer to the fund, not in the settlement.
  assert.equal(r.reskilling, Math.round((60000 / 26) * 15));
  assert.equal(r.dues, r.salary.amount + r.leave.amount + r.gratuityAmount + r.compensation.amount + 60000);
  assert.equal(r.due.compensation?.date, "2026-12-04");
});

test("no retrenchment compensation for a non-worker or under a year's service", () => {
  assert.equal(computeFnf({ ...retrench, worker: false }).compensation.reason, "not-worker");
  assert.equal(computeFnf({ ...retrench, doj: "2026-03-01" }).compensation.reason, "under-a-year");
  assert.equal(computeFnf({ ...retrench, separation: "resignation" }).compensation.amount, 0);
});

test("closure for unavoidable reasons caps compensation at three months' average pay", () => {
  const r = computeFnf({ ...retrench, separation: "closure", closureUnavoidable: true });
  assert.equal(r.compensation.capped, true);
  assert.equal(r.compensation.amount, 180000);
  assert.equal(r.reskilling, 0);
});

test("TDS: a worker's compensation and severance share the retrenchment exemption", () => {
  const r = computeFnf({ ...retrench, severance: 500000, tax: { regime: "new", salaryBefore: 744000, tdsBefore: 40000 } });
  const t = r.tax!;
  const comp = r.compensation.amount;
  // Exempt: least of (comp + severance), the 15-days formula, ₹5 lakh.
  assert.equal(t.exempt.compensation, Math.min(comp + 500000, r.compensation.formula, 500000));
  assert.equal(t.taxable.compensation, comp + 500000 - t.exempt.compensation);
  assert.equal(t.taxable.severance, 0);
  // Gratuity within ₹20 lakh is exempt.
  assert.equal(t.taxable.gratuity, 0);
  assert.equal(t.tds, Math.max(0, t.year.total - 40000));
  assert.equal(r.net, r.dues - r.deductions - r.recoveries);
  assert.ok(r.deductions >= t.tds);
});

test("TDS: severance for a manager (not a worker) is fully taxable", () => {
  const r = computeFnf({ ...retrench, worker: false, severance: 300000, tax: { regime: "new", salaryBefore: 744000, tdsBefore: 0 } });
  assert.equal(r.tax!.taxable.severance, 300000);
  assert.equal(r.tax!.exempt.compensation, 0);
});

test("TDS defaults: salary and TDS before the final month come from the monthly gross", () => {
  const low = computeFnf({ ...example, tax: { regime: "new" } }).tax!;
  // April to November 2026: 8 months. ₹11.16 lakh a year is within the ₹12 lakh rebate: no TDS.
  assert.equal(low.months, 8);
  assert.equal(low.salaryBefore, 93000 * 8);
  assert.equal(low.salaryBeforeDefaulted, true);
  assert.equal(low.tdsBefore, 0);
  const r = computeFnf({ ...example, monthlyGross: 150000, tax: { regime: "new" } });
  const t = r.tax!;
  // ₹18 lakh projected: ₹1,50,800 a year, spread evenly, 8 months deducted.
  assert.equal(t.tdsBeforeDefaulted, true);
  assert.equal(t.tdsBefore, Math.round((150800 / 12) * 8));
  // Leave encashment on leaving: the exempt limit values leave at a day's salary of ÷ 30, so
  // 18 days paid at ÷ 26 (₹41,538) is ₹36,000 exempt and ₹5,538 taxable.
  assert.equal(t.exempt.leave, 36000);
  assert.equal(t.taxable.leave, 5538);
});

test("no TDS when payments go to legal heirs after a death", () => {
  assert.equal(computeFnf({ ...example, separation: "death", tax: { regime: "new" } }).tax, null);
});

test("PF, ESI and professional tax come off the final month's pay", () => {
  const r = computeFnf({ ...example, pf: "restricted", esi: false, ptState: "KA" });
  // 4 days of 31: PF wages 60,000 × 4/31 = 7,742 (under the ceiling) → 12% = 929.
  assert.equal(r.statutory.pf, Math.floor((60000 * 4) / 31 * 0.12 + 0.5));
  // Karnataka: final salary 12,000 is below the ₹25,000 slab → nil.
  assert.equal(r.statutory.pt, 0);
  const full = computeFnf({ ...example, lwd: "2026-12-31", pf: "restricted", ptState: "KA" });
  assert.equal(full.statutory.pt, 200);
  assert.equal(full.statutory.pf, 3000);
  assert.equal(full.net, full.dues - full.deductions - full.recoveries);
});
