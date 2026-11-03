import { test } from "node:test";
import assert from "node:assert/strict";
import { dayNum } from "./dates.ts";
import { detectColumns } from "./fields.ts";
import { computeDashboard, isCounted, NO_FILTERS, onRolls, periodPresets } from "./metrics.ts";
import { runChecks } from "./quality.ts";
import { buildEmployees } from "./records.ts";
import { SAMPLE_HEADERS, sampleTable } from "./sample.ts";

function load(today: number) {
  const t = sampleTable(today);
  const det = detectColumns(t.headers, t.rows);
  const people = buildEmployees({ headers: t.headers, rows: t.rows, firstRow: 2 }, det.map, { dateOrder: det.dateOrder, salaryPeriod: det.salaryPeriod, statusMap: {} });
  return { t, det, people };
}

test("the same day gives the same sample", () => {
  const a = sampleTable(dayNum(2026, 11, 2));
  const b = sampleTable(dayNum(2026, 11, 2));
  assert.deepEqual(a, b);
  assert.deepEqual(a.headers, SAMPLE_HEADERS);
});

test("every column is recognised", () => {
  const { det } = load(dayNum(2026, 11, 2));
  assert.equal(Object.keys(det.map).length, SAMPLE_HEADERS.length);
  assert.equal(det.salaryPeriod, "annual");
});

for (const [y, m, dd] of [[2026, 11, 2], [2027, 6, 15], [2028, 1, 31]]) {
  test(`about 120 people on the rolls with recent movement (${dd}/${m}/${y})`, () => {
    const today = dayNum(y, m, dd);
    const { people } = load(today);
    const now = people.filter((e) => isCounted(e) && onRolls(e, today)).length;
    assert.ok(now >= 110 && now <= 130, `${now} on the rolls`);
    const l12 = periodPresets(today, null)[0];
    const r = computeDashboard(people, l12, NO_FILTERS, { hasManager: true, hasSalary: true, payBy: "dept" });
    assert.ok(r.joiners >= 8 && r.leavers >= 8, `${r.joiners} joiners, ${r.leavers} leavers`);
    assert.ok(r.rate! > 8 && r.rate! < 35, `attrition ${r.rate}`);
    assert.ok(r.gender.women > 25 && r.gender.men > 50);
    assert.ok(r.span!.managers.length >= 15);
    assert.ok(r.pay!.groups.filter((g) => g.stats).length >= 6);
  });
}

test("the deliberate mistakes show up in the data checks", () => {
  const today = dayNum(2026, 11, 2);
  const { people, det } = load(today);
  const flagged = new Set(runChecks(people, det.map, today).filter((c) => c.status !== "ok").map((c) => c.id));
  for (const id of ["duplicates", "left-no-date", "blanks", "manager", "future-join", "serving-notice"]) assert.ok(flagged.has(id), id);
  assert.ok(!flagged.has("joining") && !flagged.has("exit-before-join") && !flagged.has("dob"), "no impossible dates");
});
