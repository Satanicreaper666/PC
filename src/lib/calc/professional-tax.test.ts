import { test } from "node:test";
import assert from "node:assert/strict";
import { fyMonths, ptForHalfYear, ptForMonth, ptYear, slabLabel, PT_PICKER } from "./professional-tax.ts";
import { ptState } from "../../data/statutory.ts";

test("financial-year months run April to March", () => {
  const m = fyMonths(2026);
  assert.equal(m[0], "2026-04-01");
  assert.equal(m[10], "2027-02-01");
  assert.equal(m[11], "2027-03-01");
});

test("Karnataka ₹30,000: ₹200 a month, ₹300 in February, ₹2,500 a year", () => {
  const y = ptYear("KA", 30000, 2026);
  assert.equal(ptForMonth("KA", 30000, "2026-11-01")?.amount, 200);
  assert.equal(ptForMonth("KA", 30000, "2027-02-01")?.amount, 300);
  assert.equal(y.total, 2500);
});

test("Karnataka threshold: below ₹25,000 is nil, ₹25,000 is taxed", () => {
  assert.equal(ptForMonth("KA", 24999, "2026-11-01")?.amount, 0);
  assert.equal(ptForMonth("KA", 25000, "2026-11-01")?.amount, 200);
});

test("Maharashtra: man at ₹9,000 → ₹175 a month, ₹2,100 a year (no February change)", () => {
  assert.equal(ptForMonth("MH", 9000, "2026-11-01", "other")?.amount, 175);
  assert.equal(ptYear("MH", 9000, 2026, "other").total, 2100);
});

test("Maharashtra: woman at ₹20,000 → nil; above ₹25,000 → ₹2,500 a year", () => {
  assert.equal(ptYear("MH", 20000, 2026, "woman").total, 0);
  assert.equal(ptYear("MH", 25000, 2026, "woman").total, 0);
  assert.equal(ptYear("MH", 25001, 2026, "woman").total, 2500);
  assert.equal(ptYear("MH", 10001, 2026, "other").total, 2500);
});

test("West Bengal ₹35,000: ₹150 a month Apr–Sep 2026, ₹140 a month Oct 2026–Mar 2027, ₹1,740 in total", () => {
  const y = ptYear("WB", 35000, 2026);
  assert.equal(y.total, 1740);
  assert.deepEqual(
    y.runs.map((r) => [r.from, r.to, r.amount]),
    [
      ["2026-04-01", "2026-09-01", 150],
      ["2026-10-01", "2027-03-01", 140]
    ]
  );
});

test("West Bengal new slabs: nil up to ₹20,000, ₹208 above ₹1 lakh", () => {
  assert.equal(ptForMonth("WB", 20000, "2026-10-01")?.amount, 0);
  assert.equal(ptForMonth("WB", 20001, "2026-10-01")?.amount, 100);
  assert.equal(ptForMonth("WB", 150000, "2026-10-01")?.amount, 208);
  assert.equal(ptYear("WB", 150000, 2027).total, 2496);
});

test("Telangana and Andhra Pradesh slabs", () => {
  assert.equal(ptForMonth("TS", 15000, "2026-11-01")?.amount, 0);
  assert.equal(ptForMonth("TS", 18000, "2026-11-01")?.amount, 150);
  assert.equal(ptForMonth("AP", 20001, "2026-11-01")?.amount, 200);
});

test("Gujarat: nil up to ₹12,000, ₹200 above", () => {
  assert.equal(ptForMonth("GJ", 12000, "2026-11-01")?.amount, 0);
  assert.equal(ptYear("GJ", 12001, 2026).total, 2400);
});

test("Greater Chennai Corporation: half-year salary ₹2,40,000 → ₹1,250", () => {
  assert.equal(ptForHalfYear("TN", 240000, "2026-10-01")?.amount, 1250);
  assert.equal(ptForHalfYear("TN", 21000, "2026-10-01")?.amount, 0);
  assert.equal(ptForHalfYear("TN", 30000, "2026-10-01")?.amount, 180);
  const y = ptYear("TN", 40000, 2026);
  assert.equal(y.halfYearSalary, 240000);
  assert.equal(y.total, 2500);
});

test("no-PT states, Odisha from April 2026, and states not covered", () => {
  assert.equal(ptYear("DL", 50000, 2026).status, "none");
  assert.equal(ptYear("OD", 50000, 2026).status, "none");
  assert.equal(ptYear("KL", 50000, 2026).status, "not-covered");
  assert.equal(ptYear("GA", 50000, 2026).status, "not-covered");
  assert.equal(ptYear("ZZ", 50000, 2026).status, "unknown");
  assert.equal(ptForMonth("KL", 50000, "2026-11-01"), null);
});

test("slab labels read naturally", () => {
  const mh = ptState("MH")!.schedules![0].slabs;
  assert.equal(slabLabel(mh, 0), "Up to ₹7,500");
  assert.equal(slabLabel(mh, 1), "Above ₹7,500 up to ₹10,000");
  assert.equal(slabLabel(mh, 2), "Above ₹10,000");
  const ka = ptState("KA")!.schedules![0].slabs;
  assert.equal(slabLabel(ka, 0), "Below ₹25,000");
  assert.equal(slabLabel(ka, 1), "₹25,000 and above");
});

test("picker lists covered states first and ends with another state", () => {
  assert.equal(PT_PICKER[0].value, "KA");
  assert.equal(PT_PICKER[PT_PICKER.length - 1].value, "OTHER");
  assert.ok(PT_PICKER.some((o) => o.value === "OD" && o.label.includes("no professional tax")));
});
