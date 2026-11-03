import { test } from "node:test";
import assert from "node:assert/strict";
import { designBands, rangeFromMidpoint, checkPay, overlapForConstantSpread, niceTicks } from "./salary-band-designer.ts";

const example = { grades: 6, firstMidpoint: 400000, progressionPct: 25, spreadLowPct: 40, spreadHighPct: 60 };
const r0 = (n: number) => Math.round(n);

test("range from midpoint uses spread = (max − min) ÷ min", () => {
  const { min, max } = rangeFromMidpoint(400000, 40);
  assert.equal(r0(min), 333333);
  assert.equal(r0(max), 466667);
  assert.ok(Math.abs((max - min) / min - 0.4) < 1e-12);
  assert.ok(Math.abs((min + max) / 2 - 400000) < 1e-6);
});

test("worked example: six grades, 25% progression, spread 40% to 60%", () => {
  const r = designBands(example);
  assert.equal(r.ok, true);
  assert.equal(r.grades.length, 6);
  const [g1, g2, g3] = r.grades;
  assert.deepEqual([r0(g1.min), r0(g1.mid), r0(g1.max)], [333333, 400000, 466667]);
  assert.deepEqual([r0(g2.min), r0(g2.mid), r0(g2.max)], [409836, 500000, 590164]);
  assert.deepEqual([r0(g3.min), r0(g3.mid), r0(g3.max)], [504032, 625000, 745968]);
  assert.equal(g2.spreadPct, 44);
  assert.equal(r.grades[5].spreadPct, 60);
  assert.equal(r0(r.grades[5].mid), 1220703);
  assert.equal(r0(r.highest), 1502404);
  assert.equal(g1.overlapPct?.toFixed(1), "42.6");
  assert.equal(g2.overlapPct?.toFixed(1), "47.8");
  assert.equal(r.grades[5].overlapPct, null);
});

test("check a salary: ₹6,00,000 in grade 3", () => {
  const g3 = designBands(example).grades[2];
  const c = checkPay(g3, 600000);
  assert.equal(c.compaRatio.toFixed(2), "0.96");
  assert.equal(c.penetrationPct.toFixed(1), "39.7");
  assert.equal(c.position, "middle");
});

test("pay below the minimum and above the maximum", () => {
  const g = { min: 300000, mid: 360000, max: 420000 };
  const below = checkPay(g, 280000);
  assert.equal(below.position, "below");
  assert.equal(below.distance, 20000);
  assert.ok(below.penetrationPct < 0);
  const above = checkPay(g, 450000);
  assert.equal(above.position, "above");
  assert.equal(above.distance, 30000);
  assert.equal(checkPay(g, 300000).position, "lower");
  assert.equal(checkPay(g, 420000).position, "upper");
});

test("constant spread: overlap = 1 − progression ÷ spread", () => {
  assert.equal(overlapForConstantSpread(25, 50), 50);
  const r = designBands({ grades: 3, firstMidpoint: 500000, progressionPct: 25, spreadLowPct: 50, spreadHighPct: 50 });
  assert.equal(r.grades[0].overlapPct?.toFixed(6), "50.000000");
});

test("progression larger than spread leaves a gap between grades", () => {
  const r = designBands({ grades: 2, firstMidpoint: 500000, progressionPct: 50, spreadLowPct: 30, spreadHighPct: 30 });
  assert.ok((r.grades[0].overlapPct ?? 0) < 0);
  assert.ok(r.grades[0].gapToNext > 0);
});

test("invalid input gives a message, not numbers", () => {
  assert.equal(designBands({ ...example, grades: 1 }).ok, false);
  assert.equal(designBands({ ...example, grades: 13 }).ok, false);
  assert.equal(designBands({ ...example, firstMidpoint: 0 }).ok, false);
  assert.equal(designBands({ ...example, spreadLowPct: 0 }).ok, false);
  assert.equal(designBands({ ...example, progressionPct: -5 }).ok, false);
  assert.match(designBands({ ...example, firstMidpoint: 0 }).message ?? "", /midpoint/);
});

test("nice ticks cover the data", () => {
  const t = niceTicks(333333, 1502404, 5);
  assert.ok(t[0] <= 333333);
  assert.ok(t[t.length - 1] >= 1502404);
  assert.deepEqual(t, [200000, 400000, 600000, 800000, 1000000, 1200000, 1400000, 1600000]);
  const t2 = niceTicks(0, 14.1, 5);
  assert.ok(t2[t2.length - 1] >= 14.1);
});
