import { test } from "node:test";
import assert from "node:assert/strict";
import type { Person } from "./fields.ts";
import { buildOrg } from "./hierarchy.ts";
import { LAYOUT, layoutChart, linePath, type Layout } from "./layout.ts";

const P = (id: string, managerId = ""): Person => ({ row: 2, id, name: id, title: "", dept: "", location: "", managerId, managerName: "" });
const { w: W, h: H, gapX, gapY, indent, stackGap, pad } = LAYOUT;
const at = (l: Layout, i: number) => l.boxes.find((b) => b.i === i)!;
const overlaps = (l: Layout) =>
  l.boxes.some((a, k) => l.boxes.some((b, j) => j > k && a.x < b.x + W && b.x < a.x + W && a.y < b.y + H && b.y < a.y + H));

test("a team of individual contributors stacks in a column under its manager", () => {
  const org = buildOrg([P("m"), P("a", "m"), P("b", "m"), P("c", "m")]);
  const l = layoutChart(org.children, org.roots, new Set());
  assert.deepEqual(at(l, 0), { i: 0, x: pad, y: pad });
  assert.equal(at(l, 1).x, pad + indent);
  assert.equal(at(l, 1).y, pad + H + gapY / 2);
  assert.equal(at(l, 3).y, pad + H + gapY / 2 + 2 * (H + stackGap));
  assert.equal(l.width, pad * 2 + indent + W);
  assert.equal(l.height, pad * 2 + H + gapY / 2 + 3 * H + 2 * stackGap);
  // a spine and one tick per report
  assert.equal(l.lines.length, 4);
  assert.ok(!overlaps(l));
});

test("a big flat team splits into columns", () => {
  const people = [P("m"), ...Array.from({ length: 20 }, (_, k) => P(`r${k}`, "m"))];
  const org = buildOrg(people);
  const l = layoutChart(org.children, org.roots, new Set());
  const xs = new Set(l.boxes.filter((b) => b.i > 0).map((b) => b.x));
  assert.equal(xs.size, 3, "20 reports with at most 8 a column → 3 columns");
  assert.ok(!overlaps(l));
  assert.equal(l.width, pad * 2 + 3 * (indent + W) + 2 * gapX);
});

test("managers of managers sit centred over their teams, side by side", () => {
  const org = buildOrg([P("ceo"), P("a", "ceo"), P("b", "ceo"), P("a1", "a"), P("b1", "b"), P("b2", "b")]);
  const l = layoutChart(org.children, org.roots, new Set());
  const a = at(l, 1);
  const b = at(l, 2);
  assert.equal(a.y, pad + H + gapY);
  assert.equal(b.x, a.x + indent + W + gapX, "the second team starts after the first team's width");
  const ceo = at(l, 0);
  assert.equal(ceo.x + W / 2, (a.x + W / 2 + b.x + W / 2) / 2, "the CEO is centred over the two managers");
  assert.ok(!overlaps(l));
});

test("collapsed teams are left out and the manager becomes a single box", () => {
  const org = buildOrg([P("ceo"), P("a", "ceo"), P("a1", "a"), P("a2", "a"), P("b", "ceo")]);
  const full = layoutChart(org.children, org.roots, new Set());
  const folded = layoutChart(org.children, org.roots, new Set([1]));
  assert.equal(full.boxes.length, 5);
  assert.equal(folded.boxes.length, 3);
  assert.ok(folded.height < full.height);
  const top = layoutChart(org.children, org.roots, new Set([0]));
  assert.equal(top.boxes.length, 1);
  assert.equal(top.lines.length, 0);
});

test("separate trees sit side by side; a focus shows one team only", () => {
  const org = buildOrg([P("a"), P("a1", "a"), P("b"), P("b1", "b"), P("b2", "b1")]);
  const l = layoutChart(org.children, org.roots, new Set());
  assert.equal(org.roots.length, 2);
  assert.ok(at(l, 2).x >= at(l, 1).x + W + LAYOUT.rootGap);
  const focus = layoutChart(org.children, [3], new Set());
  assert.deepEqual(focus.boxes.map((b) => b.i).sort(), [3, 4]);
});

test("no boxes overlap on a deeper mixed tree", () => {
  const people = [P("0")];
  let id = 1;
  for (let a = 0; a < 4; a++) {
    const head = String(id++);
    people.push(P(head, "0"));
    for (let b = 0; b < 3; b++) {
      const lead = String(id++);
      people.push(P(lead, head));
      for (let c = 0; c < (a + b) % 4; c++) people.push(P(String(id++), lead));
    }
  }
  const org = buildOrg(people);
  const l = layoutChart(org.children, org.roots, new Set());
  assert.equal(l.boxes.length, people.length);
  assert.ok(!overlaps(l));
  assert.ok(l.boxes.every((b) => b.x >= pad && b.y >= pad && b.x + W <= l.width - pad + 0.01 && b.y + H <= l.height - pad + 0.01));
});

test("line paths are valid SVG path data", () => {
  assert.equal(linePath([[0, 0, 10, 0], [5.25, 1, 5.25, 9.99]]), "M0 0 L10 0 M5.3 1 L5.3 10");
});
