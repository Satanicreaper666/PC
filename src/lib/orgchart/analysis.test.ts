import { test } from "node:test";
import assert from "node:assert/strict";
import { analyse, cleanSettings, DEFAULT_SETTINGS, NOT_RECORDED, spanFlag } from "./analysis.ts";
import type { Person } from "./fields.ts";
import { buildOrg } from "./hierarchy.ts";

let row = 1;
const P = (id: string, managerId: string, dept = "", location = ""): Person => ({ row: ++row, id, name: `Person ${id}`, title: "", dept, location, managerId, managerName: "" });

// CEO (Leadership) → Head of support with 6 support staff (only manager in Support),
//                  → CFO → Finance manager → 2 accountants,
//                  → Head of sales with 12 sales staff in two cities.
function company() {
  const people = [P("ceo", "", "Leadership", "Bengaluru"), P("hs", "ceo", "Support", "Kochi")];
  for (let k = 0; k < 6; k++) people.push(P(`s${k}`, "hs", "Support", "Kochi"));
  people.push(P("cfo", "ceo", "Finance", "Mumbai"), P("fm", "cfo", "Finance", "Mumbai"), P("a1", "fm", "Finance", "Mumbai"), P("a2", "fm", "Finance", "Pune"));
  people.push(P("hsales", "ceo", "Sales", "Mumbai"));
  for (let k = 0; k < 12; k++) people.push(P(`x${k}`, "hsales", "Sales", k < 4 ? "Delhi" : "Mumbai"));
  people.push(P("temp", "", "", ""));
  return buildOrg(people);
}

test("people, levels, managers and individual contributors", () => {
  const a = analyse(company(), DEFAULT_SETTINGS);
  assert.equal(a.people, 26);
  assert.equal(a.levels, 4);
  assert.deepEqual(a.perLevel, [2, 3, 19, 2]);
  assert.equal(a.tops, 2);
  assert.equal(a.managers, 5, "ceo, head of support, cfo, finance manager, head of sales");
  assert.equal(a.ics, 21);
  assert.equal(a.icsPerManager, 21 / 5);
});

test("span of control with the default thresholds", () => {
  const a = analyse(company(), DEFAULT_SETTINGS);
  assert.deepEqual(a.span.rows.map((r) => r.reports), [12, 6, 3, 2, 1]);
  assert.equal(a.span.median, 3);
  assert.equal(a.span.mean, 24 / 5);
  assert.equal(a.span.widest?.reports, 12);
  assert.deepEqual(a.span.rows.map((r) => r.flag), ["wide", null, null, "narrow", "narrow"]);
  assert.equal(a.span.wide, 1);
  assert.equal(a.span.narrow, 2);
});

test("the thresholds are the user's: changing them changes the flags", () => {
  const a = analyse(company(), { narrowBelow: 2, wideAbove: 5, spofMin: 5 });
  assert.deepEqual(a.span.rows.map((r) => r.flag), ["wide", "wide", null, null, "narrow"]);
  assert.equal(spanFlag(3, DEFAULT_SETTINGS), null);
  assert.equal(spanFlag(2, DEFAULT_SETTINGS), "narrow");
  assert.equal(spanFlag(10, DEFAULT_SETTINGS), null, "10 is not above 10");
  assert.equal(spanFlag(11, DEFAULT_SETTINGS), "wide");
});

test("settings are cleaned into whole numbers in range", () => {
  assert.deepEqual(cleanSettings({ narrowBelow: 4.4, wideAbove: 2, spofMin: 0 }), { narrowBelow: 4, wideAbove: 4, spofMin: 1 });
  assert.deepEqual(cleanSettings({}), DEFAULT_SETTINGS);
  assert.deepEqual(cleanSettings({ narrowBelow: Number.NaN }), DEFAULT_SETTINGS);
});

test("managers with only one direct report", () => {
  const org = company();
  const a = analyse(org, DEFAULT_SETTINGS);
  assert.equal(a.oneReport.length, 1);
  assert.equal(org.people[a.oneReport[0].i].id, "cfo");
  assert.equal(org.people[a.oneReport[0].report].id, "fm");
});

test("single point of failure: the only manager in a department, with enough of it under them", () => {
  const org = company();
  const a = analyse(org, DEFAULT_SETTINGS);
  // Support: one manager, 6 people under them → flagged. Sales: one manager, 12 → flagged.
  // Finance has two managers. Leadership: the CEO has no one else from Leadership under them.
  assert.deepEqual(a.spof.map((s) => [org.people[s.i].id, s.inLine, s.deptPeople]), [["hsales", 12, 13], ["hs", 6, 7]]);
  const strict = analyse(org, { ...DEFAULT_SETTINGS, spofMin: 7 });
  assert.deepEqual(strict.spof.map((s) => org.people[s.i].id), ["hsales"]);
});

test("department and location breakdowns", () => {
  const a = analyse(company(), DEFAULT_SETTINGS);
  const dept = Object.fromEntries(a.departments.map((g) => [g.name, g]));
  assert.equal(dept.Sales.people, 13);
  assert.equal(dept.Sales.managers, 1);
  assert.equal(dept.Sales.ics, 12);
  assert.equal(Math.round(dept.Sales.share * 10) / 10, 50);
  assert.equal(a.departments[a.departments.length - 1].name, NOT_RECORDED, "blanks last");
  const loc = Object.fromEntries(a.locations.map((g) => [g.name, g]));
  assert.equal(loc.Delhi.people, 4);
  assert.equal(loc.Delhi.managerElsewhere, 4, "their manager is in Mumbai");
  assert.equal(loc.Pune.managerElsewhere, 1);
  assert.equal(loc.Mumbai.managerElsewhere, 2, "the CFO and the head of sales report to the CEO in Bengaluru");
  assert.equal(a.departments.reduce((s, g) => s + g.people, 0), 26);
});

test("an empty file gives empty figures, not errors", () => {
  const a = analyse(buildOrg([]), DEFAULT_SETTINGS);
  assert.equal(a.people, 0);
  assert.equal(a.levels, 0);
  assert.equal(a.span.median, null);
  assert.equal(a.icsPerManager, null);
});
