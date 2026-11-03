import { test } from "node:test";
import assert from "node:assert/strict";
import { analyse, DEFAULT_SETTINGS } from "./analysis.ts";
import { orgChecks } from "./checks.ts";
import { detectOrgColumns, findOrgHeaderRow, readPeople, type Person } from "./fields.ts";
import { buildOrg } from "./hierarchy.ts";
import { layoutChart } from "./layout.ts";
import { sampleOrgTable } from "./sample.ts";
import { contain, grid, summaryRows, teamSlides } from "./slides.ts";
import { chartSvg, deptColours, DEPT_COLOURS, esc, fit, NO_DEPT_COLOUR } from "./svg.ts";

function sample() {
  const t = sampleOrgTable();
  const rows = [t.headers, ...t.rows];
  const h = findOrgHeaderRow(rows);
  const map = detectOrgColumns(t.headers, t.rows);
  const people = readPeople({ headers: t.headers, rows: rows.slice(h + 1), firstRow: h + 2 }, map);
  return { map, org: buildOrg(people) };
}

test("the sample is about 60 people with the columns recognised", () => {
  const { map, org } = sample();
  assert.deepEqual(Object.keys(map).sort(), ["dept", "id", "location", "managerId", "name", "title"]);
  assert.equal(org.people.length, 62);
  const a = analyse(org, DEFAULT_SETTINGS);
  assert.equal(a.levels, 4);
  assert.equal(a.managers, 14);
  assert.equal(a.span.wide, 1, "the west sales team has 12 reports");
  assert.equal(a.oneReport.length, 2);
  assert.deepEqual(a.spof.map((s) => org.people[s.i].name), ["Kavya Kadamba"]);
});

test("the sample's deliberate mistakes show in the data checks", () => {
  const { map, org } = sample();
  const by = Object.fromEntries(orgChecks(org, map).map((c) => [c.id, c]));
  assert.equal(by.notFound.count, 1);
  assert.equal(by.notFound.rows[0].name, "Kiran Rajgira");
  assert.equal(by.duplicates.count, 2);
  assert.equal(by.loops.status, "ok");
  assert.equal(by.tops.status, "ok");
});

test("the SVG is well formed, escapes text and marks collapsed teams", () => {
  const people: Person[] = [
    { row: 2, id: "1", name: "Asha <Rao> & Co", title: "Head of \"people\"", dept: "HR", location: "Pune", managerId: "", managerName: "" },
    { row: 3, id: "2", name: "Ravi", title: "", dept: "", location: "", managerId: "1", managerName: "" },
    { row: 4, id: "3", name: "Meera", title: "", dept: "", location: "", managerId: "2", managerName: "" }
  ];
  const org = buildOrg(people);
  const collapsed = new Set([1]);
  const svg = chartSvg(org, layoutChart(org.children, org.roots, collapsed), { title: "Org chart", collapsed });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="\d+" height="\d+"/);
  assert.ok(svg.includes("Asha &lt;Rao&gt; &amp; Co"));
  assert.ok(svg.includes("Head of &quot;people&quot;"));
  assert.ok(!svg.includes("Meera"), "a collapsed team is not drawn");
  assert.ok(svg.includes(">+1<"), "the collapsed manager shows how many are hidden");
  assert.equal((svg.match(/<g>/g) ?? []).length, 2);
  assert.equal((svg.match(/<g>/g) ?? []).length, (svg.match(/<\/g>/g) ?? []).length);
});

test("text fitting and escaping", () => {
  assert.equal(fit("Short", 200, 12), "Short");
  const long = fit("Regional sales manager, west and central India", 192, 12);
  assert.ok(long.endsWith("…") && long.length < 35);
  assert.equal(esc(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("department colours: biggest department first, blanks grey", () => {
  const { org } = sample();
  const colours = deptColours(org);
  assert.equal(colours.get("sales"), DEPT_COLOURS[0]);
  assert.equal(colours.get("engineering"), DEPT_COLOURS[1]);
  assert.ok(!colours.has(""));
  assert.equal(NO_DEPT_COLOUR, "#c9cee0");
});

test("team slides: one per manager, top-down, big teams split", () => {
  const { org } = sample();
  const { slides, left } = teamSlides(org, org.roots, 12);
  assert.equal(left, 0);
  assert.equal(slides.length, 14, "14 managers, none with more than 12 reports");
  assert.equal(org.people[slides[0].manager].name, "Neela Kesar");
  const split = teamSlides(org, org.roots, 5);
  const west = split.slides.filter((s) => org.people[s.manager].name === "Leela Ajwain");
  assert.deepEqual(west.map((s) => [s.part, s.parts, s.reports.length]), [[1, 3, 5], [2, 3, 5], [3, 3, 2]]);
  const capped = teamSlides(org, org.roots, 12, 3);
  assert.equal(capped.slides.length, 3);
  assert.equal(capped.left, 11);
});

test("grid boxes stay inside the area and rows are centred", () => {
  const area = { x: 0.5, y: 2, w: 12, h: 5 };
  const boxes = grid(6, area, 4, 0.25);
  assert.equal(boxes.length, 6);
  assert.ok(boxes.every((b) => b.x >= area.x - 1e-9 && b.x + b.w <= area.x + area.w + 1e-9 && b.y + b.h <= area.y + area.h + 1e-9));
  const firstRowMid = (boxes[0].x + boxes[3].x + boxes[3].w) / 2;
  const secondRowMid = (boxes[4].x + boxes[5].x + boxes[5].w) / 2;
  assert.ok(Math.abs(firstRowMid - secondRowMid) < 1e-9);
  assert.deepEqual(grid(0, area), []);
});

test("pictures are scaled to fit without stretching", () => {
  const r = contain(3000, 1000, { x: 0, y: 0, w: 12, h: 6 });
  assert.equal(r.w, 12);
  assert.equal(r.h, 4);
  assert.equal(r.y, 1);
});

test("the summary slide has the figures in words", () => {
  const { org } = sample();
  const rows = summaryRows(org, analyse(org, DEFAULT_SETTINGS), DEFAULT_SETTINGS);
  const by = Object.fromEntries(rows);
  assert.equal(by.People, "62");
  assert.equal(by["Managers with more than 10 direct reports"], "1");
  assert.match(by["Widest span"], /12 direct reports \(Leela Ajwain\)/);
});
