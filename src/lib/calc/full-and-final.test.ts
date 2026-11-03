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
