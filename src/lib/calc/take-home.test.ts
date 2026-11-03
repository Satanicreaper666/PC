import { test } from "node:test";
import assert from "node:assert/strict";
import { codeWages, computeTakeHome } from "./take-home.ts";
import type { TakeHomeInput } from "./take-home.ts";

const example: TakeHomeInput = {
  ctc: 900000,
  basicPct: 50,
  hraPct: 40,
  otherExcluded: 0,
  pfBasis: "restricted",
  gratuityInCtc: true,
  employerPfInTest: false,
  state: "KA",
  gender: "other",
  date: "2026-11-02"
};

const ctcCheck = (r: ReturnType<typeof computeTakeHome>) => r.gross + r.employerPf + r.employerEsi + r.gratuityProvision;

test("page example: ₹9 lakh CTC in Karnataka → ₹66,185 in hand before income tax", () => {
  const r = computeTakeHome(example);
  assert.equal(r.status, "ok");
  assert.equal(r.gross, 69385);
  assert.equal(r.employerPf, 3000);
  assert.equal(r.employeePf, 3000);
  assert.equal(Math.round(r.gratuityProvision), 2615);
  assert.equal(r.esiCovered, false);
  assert.equal(r.pt, 200);
  assert.equal(r.ptFebruary, 300);
  assert.equal(Math.round(r.inHand), 66185);
  assert.ok(Math.abs(ctcCheck(r) - 75000) <= 1);
  assert.equal(r.wagesTest.addBack, 0);
});

test("PF on full wages instead of the ₹25,000 ceiling", () => {
  const r = computeTakeHome({ ...example, pfBasis: "actual" });
  assert.ok(r.employerPf > 3000);
  assert.equal(r.employeePf, r.employerPf);
  assert.ok(Math.abs(ctcCheck(r) - 75000) <= 1);
});

test("low pay: ESI applies on wages within ₹21,000 and the structure still adds up to CTC", () => {
  const r = computeTakeHome({ ...example, ctc: 240000 });
  assert.equal(r.esiCovered, true);
  assert.ok(r.wagesTest.wages <= 21000);
  assert.equal(r.employeeEsi, Math.ceil((r.wagesTest.wages * 75) / 10000 - 1e-9));
  assert.equal(r.pt, 0);
  assert.ok(Math.abs(ctcCheck(r) - 20000) <= 1);
  assert.equal(Math.round(r.inHand), r.gross - r.employeePf - r.employeeEsi);
});

test("50% rule: excluded allowances over half of pay are added back to wages", () => {
  const t = codeWages(30000, 50000);
  assert.equal(t.total, 80000);
  assert.equal(t.limit, 40000);
  assert.equal(t.addBack, 10000);
  assert.equal(t.wages, 40000);
  const ok = codeWages(50000, 30000);
  assert.equal(ok.addBack, 0);
});

test("a structure with large excluded allowances triggers the add-back", () => {
  const r = computeTakeHome({ ...example, basicPct: 30, hraPct: 50, otherExcluded: 25000 });
  assert.equal(r.status, "ok");
  assert.ok(r.wagesTest.addBack > 0);
  assert.ok(r.wagesTest.excludedShare > 0.5);
  assert.ok(Math.abs(r.wagesTest.wages - r.wagesTest.total / 2) < 0.01);
});

test("counting employer PF in the 50% test can only raise wages", () => {
  const a = computeTakeHome({ ...example, basicPct: 30, hraPct: 50, otherExcluded: 25000 });
  const b = computeTakeHome({ ...example, basicPct: 30, hraPct: 50, otherExcluded: 25000, employerPfInTest: true });
  assert.ok(b.wagesTest.addBack >= a.wagesTest.addBack);
});

test("states: Maharashtra woman under ₹25,000 pays no PT; Delhi has none; Chennai is half-yearly", () => {
  assert.equal(computeTakeHome({ ...example, ctc: 300000, state: "MH", gender: "woman" }).pt, 0);
  assert.equal(computeTakeHome({ ...example, state: "DL" }).pt, 0);
  const tn = computeTakeHome({ ...example, state: "TN" });
  assert.equal(tn.ptHalfYear, 1250);
  assert.ok(Math.abs(tn.pt - 1250 / 6) < 0.001);
});

test("gratuity outside CTC raises gross pay", () => {
  const a = computeTakeHome(example);
  const b = computeTakeHome({ ...example, gratuityInCtc: false });
  assert.equal(b.gratuityProvision, 0);
  assert.ok(b.gross > a.gross);
});

test("before 17 Sep 2026 the PF ceiling was ₹15,000", () => {
  const r = computeTakeHome({ ...example, date: "2026-08-01" });
  assert.equal(r.pfCeiling, 15000);
  assert.equal(r.employerPf, 1800);
});

test("impossible structures and blanks give a message", () => {
  assert.equal(computeTakeHome({ ...example, ctc: 0 }).status, "invalid");
  assert.equal(computeTakeHome({ ...example, basicPct: 0 }).status, "invalid");
  assert.equal(computeTakeHome({ ...example, basicPct: 90, hraPct: 50 }).status, "invalid");
});
