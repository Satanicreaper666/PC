import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSummary, orgChecks } from "./checks.ts";
import type { Person } from "./fields.ts";
import { buildOrg, displayName, isWithin, managersAbove, preorder } from "./hierarchy.ts";

let row = 1;
const P = (id: string, name: string, managerId = "", extra: Partial<Person> = {}): Person => ({
  row: ++row, id, name, title: "", dept: "", location: "", managerId, managerName: "", ...extra
});

test("builds a simple tree with levels and team sizes", () => {
  const org = buildOrg([P("1", "Asha"), P("2", "Ravi", "1"), P("3", "Meera", "1"), P("4", "Dev", "2"), P("5", "Ira", "4")]);
  assert.deepEqual(org.roots, [0]);
  assert.deepEqual(org.children[0], [1, 2]);
  assert.deepEqual(org.level, [1, 2, 2, 3, 4]);
  assert.deepEqual(org.below, [4, 2, 0, 1, 0]);
  assert.deepEqual(preorder(org.children, org.roots), [0, 1, 3, 4, 2]);
  assert.deepEqual(managersAbove(org, 4), [3, 1, 0]);
  assert.ok(isWithin(org, 4, 1));
  assert.ok(!isWithin(org, 2, 1));
});

test("IDs match without regard to case or spaces, and inside 'Name (ID)'", () => {
  const org = buildOrg([P("e01", "Asha"), P("E02", "Ravi", " E01 "), P("E03", "Meera", "Asha (e01)"), P("E04", "Dev", "E02 - Ravi")]);
  assert.deepEqual(org.parent, [null, 0, 0, 1]);
});

test("manager names: unique matches, namesakes and the person themself", () => {
  const people = [
    P("", "Asha Rao"),
    P("", "Ravi", "", { managerName: "asha rao" }),
    P("", "Dev"),
    P("", "Dev", "", { managerName: "Asha Rao" }),
    P("", "Ira", "", { managerName: "Dev" }),
    P("", "Kiran", "", { managerName: "Nobody" })
  ];
  const org = buildOrg(people);
  assert.equal(org.parent[1], 0);
  assert.equal(org.parent[4], null, "two people are called Dev");
  assert.equal(org.topReason[4], "ambiguous");
  assert.deepEqual(org.unresolved.get(4)?.matches, [2, 3]);
  assert.equal(org.topReason[5], "notFound");
});

test("a namesake can still be resolved when the other one is the person themself", () => {
  const org = buildOrg([P("", "Dev"), P("", "Dev", "", { managerName: "Dev" })]);
  assert.equal(org.parent[1], 0);
});

test("a manager ID column that holds names still works", () => {
  const org = buildOrg([P("E1", "Asha Rao"), P("E2", "Ravi", "Asha Rao")]);
  assert.equal(org.parent[1], 0);
});

test("multiple roots, orphans and self-managers are all at the top, with reasons", () => {
  const org = buildOrg([P("1", "Asha"), P("2", "Ravi", "2"), P("3", "Meera", "99"), P("4", "Dev"), P("5", "Ira", "1")]);
  assert.deepEqual(org.roots, [0, 1, 2, 3]);
  assert.deepEqual(org.topReason.slice(0, 4), ["none", "self", "notFound", "none"]);
  const checks = orgChecks(org, { id: 0, name: 1, managerId: 2 });
  const by = Object.fromEntries(checks.map((c) => [c.id, c]));
  assert.equal(by.tops.status, "review");
  assert.equal(by.tops.count, 2);
  assert.equal(by.self.status, "note");
  assert.equal(by.notFound.status, "fix");
  assert.match(by.notFound.rows[0].detail, /“99”/);
  assert.equal(checks[0].status, "fix", "most serious first");
});

test("reporting loops are found and broken at the first person in the file", () => {
  // 1 → 2 → 3 → 1 is a loop; 4 hangs off it; 5 → 6 → 5 is another.
  const org = buildOrg([P("1", "A", "3"), P("2", "B", "1"), P("3", "C", "2"), P("4", "D", "3"), P("5", "E", "6"), P("6", "F", "5")]);
  assert.equal(org.loops.length, 2);
  assert.deepEqual([...org.loops[0]].sort(), [0, 1, 2]);
  assert.deepEqual([...org.loops[1]].sort(), [4, 5]);
  assert.deepEqual(org.roots, [0, 4]);
  assert.equal(org.topReason[0], "loop");
  assert.equal(org.topReason[4], "loop");
  // After the break: A at the top, then B, C and D down the chain.
  assert.deepEqual(org.level, [1, 2, 3, 4, 1, 2]);
  assert.equal(org.below[0], 3);
  const loops = orgChecks(org, { id: 0, name: 1, managerId: 2 }).find((c) => c.id === "loops")!;
  assert.equal(loops.status, "fix");
  assert.equal(loops.count, 5);
  assert.ok(loops.rows.some((r) => /shown at the top/.test(r.detail)));
});

test("someone in a loop with themselves only is a self-manager, not a loop", () => {
  const org = buildOrg([P("1", "A", "1")]);
  assert.equal(org.loops.length, 0);
  assert.equal(org.topReason[0], "self");
});

test("duplicate IDs: reports go to the first row, and every row is listed", () => {
  const org = buildOrg([P("1", "Asha"), P("2", "Ravi", "1"), P("2", "Ravi again", "1"), P("3", "Meera", "2")]);
  assert.deepEqual(org.duplicates, [[1, 2]]);
  assert.equal(org.parent[3], 1);
  const dup = orgChecks(org, { id: 0, name: 1, managerId: 2 }).find((c) => c.id === "duplicates")!;
  assert.equal(dup.status, "fix");
  assert.equal(dup.count, 2);
  assert.match(dup.rows[0].detail, /reports to this ID go to this row/);
});

test("missing names and IDs are reported; a clean file passes", () => {
  const org = buildOrg([P("1", "Asha"), P("", "", "1"), P("3", "Meera", "1")]);
  assert.equal(displayName(org.people[1]), `Row ${org.people[1].row}`);
  const checks = orgChecks(org, { id: 0, name: 1, managerId: 2 });
  assert.equal(checks.find((c) => c.id === "noName")!.count, 1);
  assert.equal(checks.find((c) => c.id === "noId")!.count, 1);
  const clean = orgChecks(buildOrg([P("1", "Asha"), P("2", "Ravi", "1")]), { id: 0, name: 1, managerId: 2 });
  assert.ok(clean.every((c) => c.status === "ok"));
  assert.match(checkSummary(clean).text, /^Nothing to fix\./);
  assert.match(clean.find((c) => c.id === "tops")!.effect, /Asha, at the top/);
});

test("checkSummary counts fixes and reviews", () => {
  const org = buildOrg([P("1", "A", "2"), P("2", "B", "1"), P("3", "C"), P("4", "D")]);
  const s = checkSummary(orgChecks(org, { id: 0, name: 1, managerId: 2 }));
  assert.equal(s.fix, 1);
  assert.equal(s.review, 1);
  assert.match(s.text, /1 check needs fixing and 1 needs a look\./);
});

test("handles a long chain without running out of stack", () => {
  const people = Array.from({ length: 20_000 }, (_, k) => P(String(k), `P${k}`, k ? String(k - 1) : ""));
  const org = buildOrg(people);
  assert.equal(org.level[19_999], 20_000);
  assert.equal(org.below[0], 19_999);
});
