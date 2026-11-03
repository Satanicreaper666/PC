import { test } from "node:test";
import assert from "node:assert/strict";
import { computeLeaveEncashment, dueText, leaveAccrual } from "./leave-encashment.ts";
import { roundRupee } from "./gratuity.ts";

test("page example: ₹40,000 ÷ 26 × 18 days = ₹27,692", () => {
  const r = computeLeaveEncashment({ wages: 40000, days: 18, divisor: 26, situation: "leaving", worker: true });
  assert.equal(roundRupee(r.dailyRate), 1538);
  assert.equal(roundRupee(r.amount), 27692);
});

test("30-day divisor: ₹40,000 ÷ 30 × 18 days = ₹24,000", () => {
  assert.equal(roundRupee(computeLeaveEncashment({ wages: 40000, days: 18, divisor: 30, situation: "leaving", worker: true }).amount), 24000);
});

test("half days and zero", () => {
  assert.equal(roundRupee(computeLeaveEncashment({ wages: 26000, days: 2.5, divisor: 26, situation: "year_end", worker: true }).amount), 2500);
  assert.equal(computeLeaveEncashment({ wages: 26000, days: 0, divisor: 26, situation: "leaving", worker: true }).amount, 0);
  assert.equal(computeLeaveEncashment({ wages: -5, days: 10, divisor: 26, situation: "leaving", worker: true }).amount, 0);
});

test("payment timing follows OSH Code s.32 for workers", () => {
  assert.match(dueText("leaving", true), /2 working days/);
  assert.match(dueText("retirement", true), /2 months/);
  assert.match(dueText("death", true), /nominee or heirs/);
  assert.match(dueText("year_end", true), /end of the calendar year/);
  assert.match(dueText("leaving", false), /leave policy/);
});

test("leave earned: 1 day per 20 days once 180 days are worked", () => {
  assert.deepEqual(leaveAccrual(240), { eligible: true, earned: 12, perDays: 20, needed: 180 });
  assert.deepEqual(leaveAccrual(179), { eligible: false, earned: 8, perDays: 20, needed: 180 });
  assert.equal(leaveAccrual(240, true).earned, 16);
});
