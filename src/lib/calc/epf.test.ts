import { test } from "node:test";
import assert from "node:assert/strict";
import { computeEpf, epfCeilingOn, epfRules, roundHalfUp, pctOf } from "./epf.ts";

const after = { date: "2026-11-01", epsMember: true, basis: "restricted" as const };
const pick = (r: ReturnType<typeof computeEpf>) => [r.employee, r.eps, r.employerEpf, r.edli, r.admin];

test("rates and ceilings come from statutory.ts", () => {
  const r = epfRules();
  assert.equal(r.employeeRate, 12);
  assert.equal(r.epsRate, 8.33);
  assert.equal(r.ceiling, 25000);
  assert.equal(r.ceilingBefore, 15000);
  assert.equal(r.ceilingFrom, "2026-09-17");
});

test("ceiling changes on 17 Sep 2026", () => {
  assert.equal(epfCeilingOn("2026-09-16"), 15000);
  assert.equal(epfCeilingOn("2026-09-17"), 25000);
  assert.equal(epfCeilingOn("2027-04-01"), 25000);
});

test("₹20,000 matches EPFO's FAQ example: 2,400 / 1,666 / 734 / 100 / 100", () => {
  assert.deepEqual(pick(computeEpf({ pfWages: 20000, ...after })), [2400, 1666, 734, 100, 100]);
});

test("₹25,000: 3,000 / 2,083 / 917 / 125 / 125 (8.33% of 25,000 = 2,082.50 rounds up)", () => {
  const r = computeEpf({ pfWages: 25000, ...after });
  assert.deepEqual(pick(r), [3000, 2083, 917, 125, 125]);
  assert.equal(r.toPfAccount, 3917);
  assert.equal(r.employerCost, 3250);
});

test("₹40,000 restricted is the same as ₹25,000", () => {
  assert.deepEqual(pick(computeEpf({ pfWages: 40000, ...after })), [3000, 2083, 917, 125, 125]);
});

test("₹40,000 on actual wages: 4,800 / 2,083 / 2,717 / 125 / 200", () => {
  const r = computeEpf({ pfWages: 40000, ...after, basis: "actual" });
  assert.deepEqual(pick(r), [4800, 2083, 2717, 125, 200]);
  assert.equal(r.aboveCeiling, 15000);
});

test("₹12,000: 1,440 / 1,000 / 440 / 60 / 60", () => {
  assert.deepEqual(pick(computeEpf({ pfWages: 12000, ...after })), [1440, 1000, 440, 60, 60]);
});

test("not an EPS member: the whole employer 12% goes to EPF", () => {
  const r = computeEpf({ pfWages: 20000, ...after, epsMember: false });
  assert.equal(r.eps, 0);
  assert.equal(r.employerEpf, 2400);
});

test("before 17 Sep 2026 the ₹15,000 ceiling applies", () => {
  const r = computeEpf({ pfWages: 20000, date: "2026-08-01", epsMember: true, basis: "restricted" });
  assert.deepEqual(pick(r), [1800, 1250, 550, 75, 75]);
});

test("a new joiner above the ceiling is an excluded employee", () => {
  assert.equal(computeEpf({ pfWages: 30000, ...after, existingMember: false }).excluded, true);
  assert.equal(computeEpf({ pfWages: 30000, ...after, existingMember: true }).excluded, false);
  assert.equal(computeEpf({ pfWages: 20000, ...after, existingMember: false }).excluded, false);
});

test("September 2026 is flagged as a split month", () => {
  assert.equal(computeEpf({ pfWages: 20000, date: "2026-09-17", epsMember: true, basis: "restricted" }).splitMonth, true);
  assert.equal(computeEpf({ pfWages: 20000, ...after }).splitMonth, false);
});

test("rounding is half up, not banker's", () => {
  assert.equal(roundHalfUp(2082.5), 2083);
  assert.equal(roundHalfUp(1666.4), 1666);
  assert.equal(pctOf(25000, 8.33), 2082.5);
  assert.equal(computeEpf({ pfWages: 0, ...after }).employee, 0);
});
