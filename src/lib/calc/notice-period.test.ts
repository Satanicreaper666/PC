import { test } from "node:test";
import assert from "node:assert/strict";
import { computeNotice } from "./notice-period.ts";

const R = "2026-11-02"; // a Monday

test("page example: resigned Mon 2 Nov 2026, 30 days → Wed 2 Dec 2026", () => {
  const r = computeNotice({ resignationDate: R, n: 30, unit: "days", convention: "next_day" });
  assert.equal(r.status, "ok");
  assert.equal(r.starts, "2026-11-03");
  assert.equal(r.lwd, "2026-12-02");
  assert.equal(r.servedDays, 30);
});

test("counting the resignation day as day one → Tue 1 Dec 2026", () => {
  const r = computeNotice({ resignationDate: R, n: 30, unit: "days", convention: "includes" });
  assert.equal(r.starts, R);
  assert.equal(r.lwd, "2026-12-01");
  assert.equal(r.servedDays, 30);
});

test("90 days → Sun 31 Jan 2027 (or Sat 30 Jan when the resignation day counts)", () => {
  assert.equal(computeNotice({ resignationDate: R, n: 90, unit: "days", convention: "next_day" }).lwd, "2027-01-31");
  assert.equal(computeNotice({ resignationDate: R, n: 90, unit: "days", convention: "includes" }).lwd, "2027-01-30");
});

test("months: 1 month from 31 Jan 2027 is clamped to 28 Feb 2027", () => {
  const r = computeNotice({ resignationDate: "2027-01-31", n: 1, unit: "months", convention: "next_day" });
  assert.equal(r.lwd, "2027-02-28");
  assert.equal(r.clamped, true);
  assert.equal(computeNotice({ resignationDate: "2027-01-31", n: 1, unit: "months", convention: "includes" }).lwd, "2027-02-27");
});

test("months: 2 months from 2 Nov 2026 → 2 Jan 2027; 3 months from 30 Nov 2026 → 28 Feb 2027", () => {
  assert.equal(computeNotice({ resignationDate: R, n: 2, unit: "months", convention: "next_day" }).lwd, "2027-01-02");
  const r = computeNotice({ resignationDate: "2026-11-30", n: 3, unit: "months", convention: "next_day" });
  assert.equal(r.lwd, "2027-02-28");
  assert.equal(r.clamped, true);
});

test("leap year: 1 month from 31 Jan 2028 → 29 Feb 2028", () => {
  assert.equal(computeNotice({ resignationDate: "2028-01-31", n: 1, unit: "months", convention: "next_day" }).lwd, "2028-02-29");
});

test("buy-out and waiver bring the last day forward", () => {
  const r = computeNotice({ resignationDate: R, n: 60, unit: "days", convention: "next_day", buyoutDays: 15, waivedDays: 5 });
  assert.equal(r.fullLwd, "2027-01-01");
  assert.equal(r.lwd, "2026-12-12");
  assert.equal(r.shortenedBy, 20);
  assert.equal(r.servedDays, 40);
});

test("the last day is never before the resignation date", () => {
  const r = computeNotice({ resignationDate: R, n: 30, unit: "days", convention: "next_day", buyoutDays: 45 });
  assert.equal(r.lwd, R);
  assert.equal(r.shortenedBy, 30);
  assert.equal(r.servedDays, 0);
});

test("bad input gives a message", () => {
  assert.equal(computeNotice({ resignationDate: "", n: 30, unit: "days", convention: "next_day" }).status, "invalid");
  assert.equal(computeNotice({ resignationDate: R, n: 0, unit: "days", convention: "next_day" }).status, "invalid");
  assert.equal(computeNotice({ resignationDate: R, n: 36, unit: "months", convention: "next_day" }).status, "invalid");
});

test("buy-out amount: days actually bought out × monthly pay ÷ 30 (or 26)", () => {
  const r = computeNotice({ resignationDate: R, n: 60, unit: "days", convention: "next_day", buyoutDays: 15, waivedDays: 5, monthlyPay: 90000 });
  assert.equal(r.boughtOutDays, 15);
  assert.equal(r.buyoutAmount, 45000);
  const r26 = computeNotice({ resignationDate: R, n: 60, unit: "days", convention: "next_day", buyoutDays: 13, monthlyPay: 52000, dayDivisor: 26 });
  assert.equal(r26.buyoutAmount, 26000);
  // Only 30 days can come off a 30-day notice; buy-out counts first.
  const capped = computeNotice({ resignationDate: R, n: 30, unit: "days", convention: "next_day", buyoutDays: 45, monthlyPay: 30000 });
  assert.equal(capped.boughtOutDays, 30);
  assert.equal(capped.buyoutAmount, 30000);
  assert.equal(computeNotice({ resignationDate: R, n: 30, unit: "days", convention: "next_day", buyoutDays: 10 }).buyoutAmount, 0);
});
