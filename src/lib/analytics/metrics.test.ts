import { test } from "node:test";
import assert from "node:assert/strict";
import { dayNum, isoDate, monthEnd } from "./dates.ts";
import {
  annualise, attritionRate, computeDashboard, customPeriod, dataRange, filterValues, isCounted, monthsIn, NO_FILTERS, onRolls,
  payGroups, percentile, periodPresets, tenureOn, type Period
} from "./metrics.ts";
import type { Employee } from "./records.ts";

const d = (s: string) => {
  const [y, m, dd] = s.split("-").map(Number);
  return dayNum(y, m, dd);
};
let rowNo = 2;
function emp(o: Partial<Omit<Employee, "doj" | "doe">> & { doj?: string | null; doe?: string | null }): Employee {
  return {
    row: rowNo++, id: "", name: "", dept: "Sales", designation: "", grade: "", location: "Pune", manager: "", gender: "men", genderRecognised: true,
    dob: null, salary: null, status: "", statusSays: null, raw: { doj: "", doe: "", dob: "", salary: "", gender: "" },
    ...o,
    doj: o.doj ? d(o.doj) : null,
    doe: o.doe ? d(o.doe) : null
  };
}

// FY 2025-26 runs from 1 Apr 2025 to 31 Mar 2026.
const FY: Period = { id: "fy2025", label: "FY 2025–26", start: d("2025-04-01"), end: d("2026-03-31") };
const people = [
  emp({ id: "A", name: "Ravi", doj: "2020-01-10", gender: "women", manager: "asha rao", salary: 600_000 }),
  emp({ id: "B", doj: "2021-06-01", doe: "2025-06-30" }), // leaves in the period
  emp({ id: "C", doj: "2025-05-15", dept: "Engineering", manager: "Asha Rao (M1)", salary: 900_000 }), // joins
  emp({ id: "D", doj: "2025-08-01", doe: "2025-08-31", dept: "Engineering", gender: "women" }), // joins and leaves in August
  emp({ id: "E", doj: "2024-01-01", doe: "2025-03-31" }), // left the day before the period
  emp({ id: "F", doj: "2025-04-01", dept: "Engineering", gender: "women", manager: "M1 - Asha Rao" }), // joins on day one
  emp({ id: "G", doj: "2023-03-01", doe: "2026-03-31" }), // leaves on the last day
  emp({ id: "H", doj: "2026-04-01" }), // joins after the period
  emp({ id: "I", doj: null }), // no joining date
  emp({ id: "J", doj: "2022-01-01", doe: "2021-12-01" }), // leaves before joining
  emp({ id: "K", doj: "2022-01-01", statusSays: "left" }), // left, date unknown
  emp({ id: "M1", name: "Asha Rao", doj: "2019-01-01", manager: "M1", salary: 2_000_000 })
];
const opts = { hasManager: true, hasSalary: true, payBy: "dept" as const };

test("who can be counted", () => {
  const ids = people.filter(isCounted).map((e) => e.id);
  assert.deepEqual(ids, ["A", "B", "C", "D", "E", "F", "G", "H", "M1"]);
  const g = people.find((e) => e.id === "G")!;
  assert.equal(onRolls(g, d("2026-03-30")), true);
  assert.equal(onRolls(g, d("2026-03-31")), false, "not counted at the end of their last working day");
});

test("opening, joiners, leavers, closing and attrition for a financial year", () => {
  const r = computeDashboard(people, FY, NO_FILTERS, opts);
  assert.equal(r.opening, 4); // A, B, G, M1
  assert.equal(r.joiners, 3); // C, D, F
  assert.equal(r.leavers, 3); // B, D, G
  assert.equal(r.closing, 4); // A, C, F, M1
  assert.equal(r.closing, r.opening + r.joiners - r.leavers);
  assert.equal(r.average, 4);
  assert.equal(r.rate, 75);
  assert.equal(r.months, 12);
  assert.equal(r.annualised, 75);
  assert.equal(r.earlyLeavers, 1); // D left after a month
});

test("each month's closing headcount matches a direct count", () => {
  const r = computeDashboard(people, FY, NO_FILTERS, opts);
  assert.equal(r.monthly.length, 12);
  for (const m of r.monthly) {
    const direct = people.filter((e) => isCounted(e) && onRolls(e, m.end)).length;
    assert.equal(m.closing, direct, isoDate(m.end));
  }
  const aug = r.monthly[4];
  assert.equal(aug.joiners, 1);
  assert.equal(aug.leavers, 1);
  assert.equal(aug.opening, aug.closing, "joined and left in the same month");
});

test("filters scope every figure", () => {
  const r = computeDashboard(people, FY, { ...NO_FILTERS, dept: "Sales" }, opts);
  assert.equal(r.opening, 4); // A, B, G, M1
  assert.equal(r.closing, 2); // A, M1
  assert.equal(r.leavers, 2); // B, G
  assert.equal(r.rate!.toFixed(1), "66.7");
  const women = computeDashboard(people, FY, { ...NO_FILTERS, gender: "women" }, opts);
  assert.deepEqual([women.opening, women.closing, women.leavers], [1, 2, 1]); // A; A, F; D
});

test("attrition by department, tenure and gender at the end of the period", () => {
  const r = computeDashboard(people, FY, NO_FILTERS, opts);
  const eng = r.byDept.find((x) => x.name === "Engineering")!;
  assert.deepEqual([eng.opening, eng.closing, eng.leavers], [0, 2, 1]);
  assert.equal(eng.rate, 100);
  const sales = r.byDept.find((x) => x.name === "Sales")!;
  assert.deepEqual([sales.opening, sales.closing, sales.leavers], [4, 2, 2]);
  assert.equal(Math.round(sales.rate! * 10) / 10, 66.7);
  assert.deepEqual(r.gender, { women: 2, men: 2, other: 0, unknown: 0 });
  const t = [d("2020-01-10"), d("2025-05-15"), d("2025-04-01"), d("2019-01-01")].map((j) => (FY.end - j) / 365.25);
  assert.ok(Math.abs(r.tenure.mean! - t.reduce((a, b) => a + b) / 4) < 1e-9);
  assert.deepEqual(r.tenure.bins.map((b) => b.count), [2, 0, 0, 0, 2, 0]);
});

test("span of control resolves IDs, names and 'Name (ID)'", () => {
  const r = computeDashboard(people, FY, NO_FILTERS, opts);
  assert.equal(r.span!.managers.length, 1);
  assert.equal(r.span!.managers[0].name, "Asha Rao");
  assert.equal(r.span!.managers[0].reports, 3); // A by name, C in brackets, F as "ID - Name"; M1 is their own manager
  assert.equal(r.span!.mean, 3);
  assert.equal(r.span!.bins.find((b) => b.short === "3–4")!.count, 1);
});

test("pay groups hide small groups and use inclusive percentiles", () => {
  const r = computeDashboard(people, FY, NO_FILTERS, opts);
  assert.ok(r.pay!.groups.every((g) => g.stats === null), "groups under 3 people show no figures");
  const lakh = [3, 4, 5, 6, 10].map((x) => emp({ doj: "2020-01-01", dept: "Ops", salary: x * 100_000 }));
  const g = payGroups(lakh, "dept").groups[0];
  assert.deepEqual(g.stats, { min: 300_000, p25: 400_000, median: 500_000, p75: 600_000, max: 1_000_000, mean: 560_000 });
  assert.equal(percentile([1, 2, 3, 4], 0.5), 2.5);
});

test("worked examples on the page", () => {
  // 16 leavers, 112 at the start, 120 at the end → 13.8%
  assert.equal(attritionRate(16, 112, 120)!.toFixed(1), "13.8");
  // 9 leavers over 7 months with an average headcount of 115 → 7.8%, or 13.4% a year
  const rate = attritionRate(9, 112, 118)!;
  assert.equal(rate.toFixed(1), "7.8");
  assert.equal(annualise(rate, 7)!.toFixed(1), "13.4");
  assert.equal(attritionRate(3, 0, 0), null);
});

test("tenure example on the page", () => {
  const e = emp({ doj: "2023-04-01" });
  assert.equal(tenureOn(e, d("2026-09-30")).toFixed(1), "3.5");
});

test("period choices on 2 Nov 2026", () => {
  const today = d("2026-11-02");
  const p = periodPresets(today, d("2019-06-01"));
  const byId = Object.fromEntries(p.map((x) => [x.id, x]));
  assert.deepEqual([isoDate(byId.l12.start), isoDate(byId.l12.end)], ["2025-11-01", "2026-10-31"]);
  assert.deepEqual([isoDate(byId.fytd.start), isoDate(byId.fytd.end)], ["2026-04-01", "2026-11-02"]);
  assert.equal(byId.fytd.label, "This financial year so far (FY 2026–27)");
  assert.deepEqual([isoDate(byId.fy2025.start), isoDate(byId.fy2025.end)], ["2025-04-01", "2026-03-31"]);
  assert.equal(byId.fy2025.label, "FY 2025–26");
  assert.ok(byId.fy2021 && !byId.fy2020, "goes back five financial years at most");
  assert.deepEqual([isoDate(byId.l24.start), isoDate(byId.l24.end)], ["2024-11-01", "2026-10-31"]);
  assert.equal(monthsIn(byId.l12.start, byId.l12.end), 12);
  assert.equal(monthsIn(byId.fytd.start, byId.fytd.end).toFixed(3), (7 + 2 / 30).toFixed(3));
});

test("custom ranges are ordered, end today at the latest and cap at 36 months", () => {
  const today = d("2026-11-02");
  const nov26 = 2026 * 12 + 10;
  const p = customPeriod(nov26, nov26 - 5, today);
  assert.deepEqual([isoDate(p.start), isoDate(p.end)], ["2026-06-01", "2026-11-02"]);
  const long = customPeriod(nov26 - 60, nov26 - 1, today);
  assert.equal(isoDate(long.start), "2023-11-01");
  assert.equal(long.end, monthEnd(nov26 - 1));
  const future = customPeriod(nov26 + 2, nov26 + 4, today);
  assert.equal(isoDate(future.end), "2026-11-02");
});

test("data range and filter values", () => {
  const r = dataRange(people, d("2026-11-02"));
  assert.equal(isoDate(r.earliest!), "2019-01-01");
  assert.equal(isoDate(r.latest!), "2026-04-01");
  assert.deepEqual(filterValues([...people, emp({ doj: "2020-01-01", dept: "" })], "dept"), ["Engineering", "Sales", "Not recorded"]);
});
