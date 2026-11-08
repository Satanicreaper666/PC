import { test } from "node:test";
import assert from "node:assert/strict";
import { detect, levelOf, readTalent, review, type Cell } from "./review.ts";

const head: Cell[] = ["Emp Code", "Employee Name", "Department", "Designation", "Reporting Manager", "Gender", "Date of Joining", "Final Rating", "Potential", "Critical role", "Flight risk"];

function rows(): Cell[][] {
  const out: Cell[][] = [head];
  // Manager A: 6 people, all rated 4–5 (generous). Manager B: 6 people, mixed.
  for (let i = 0; i < 6; i++) out.push([`A${i}`, `Anil ${i}`, "Sales", "Executive", "Manager A", i < 3 ? "F" : "M", "2020-01-01", i % 2 ? "5" : "4", "High", "", i === 0 ? "High" : ""]);
  const perf = ["1", "2", "3", "3", "4", "3"];
  for (let i = 0; i < 6; i++) out.push([`B${i}`, `Bina ${i}`, "Finance", "Analyst", "Manager B", i < 3 ? "Female" : "Male", "2023-06-01", perf[i], i === 4 ? "High" : "Moderate", i === 0 ? "Yes" : "", ""]);
  out.push(["C0", "Chetan", "Ops", "Lead", "Manager C", "M", "", "", "High", "", ""]);
  return out;
}

test("columns and levels", () => {
  const c = detect(head);
  assert.equal(c.performance, 7);
  assert.equal(c.potential, 8);
  assert.equal(c.critical, 9);
  assert.equal(c.risk, 10);
  assert.equal(levelOf("5", 5), 3);
  assert.equal(levelOf("3", 5), 2);
  assert.equal(levelOf("2", 5), 1);
  assert.equal(levelOf("High", 3), 3);
  assert.equal(levelOf("Exceeds expectations", 5), 3);
  assert.equal(levelOf("", 5), null);
});

test("placement, missing ratings and box shares", () => {
  const { people } = readTalent(rows());
  const r = review(people);
  assert.equal(r.placed, 12);
  assert.equal(r.missing.length, 1);
  const total = r.boxes.reduce((a, b) => a + b.people.length, 0);
  assert.equal(total, 12);
  const futureLeaders = r.boxes.find((b) => b.performance === 3 && b.potential === 3)!;
  assert.equal(futureLeaders.people.length, 7);
});

test("calibration flags a generous manager with five or more people", () => {
  const r = review(readTalent(rows()).people);
  const a = r.managers.find((m) => m.manager === "Manager A")!;
  assert.equal(a.flag, "high");
  assert.equal(a.highShare, 1);
  const b = r.managers.find((m) => m.manager === "Manager B")!;
  assert.equal(b.flag, "low");
});

test("fairness compares women's share of the top boxes with their share overall", () => {
  const r = review(readTalent(rows()).people);
  assert.equal(r.womenOverall, 0.5);
  const top = r.fairness.find((f) => f.group.startsWith("High potential"))!;
  assert.equal(top.total, 7);
  assert.ok(Math.abs(top.share - 3 / 7) < 1e-9);
});

test("succession list, flight risk and critical roles without a successor", () => {
  const r = review(readTalent(rows()).people);
  assert.ok(r.succession.length >= 7);
  assert.equal(r.atRiskTalent.length, 1);
  assert.equal(r.atRiskTalent[0].id, "A0");
  // Finance's critical role (B0) has Bina 4 (performance high, potential high) as a possible successor.
  assert.deepEqual(r.criticalWithoutSuccessor, []);
});
