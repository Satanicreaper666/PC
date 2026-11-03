import { test } from "node:test";
import assert from "node:assert/strict";
import { BOXES, boxFor, placePeople, axisSpread, parseLevel, parsePeople, toCsv, esc, EXAMPLE_PEOPLE, type Person } from "./nine-box-talent-mapper.ts";

const withIds = (ps: Omit<Person, "id">[]): Person[] => ps.map((p, i) => ({ ...p, id: `p${i}` }));

test("nine distinct boxes covering every combination", () => {
  assert.equal(BOXES.length, 9);
  const keys = new Set(BOXES.map((b) => `${b.performance}-${b.potential}`));
  assert.equal(keys.size, 9);
  assert.equal(boxFor(3, 3).title, "Future leader");
  assert.equal(boxFor(1, 1).title, "Under-performer");
  assert.equal(boxFor(3, 1).title, "Trusted professional");
  assert.equal(boxFor(1, 3).title, "Rough diamond");
});

test("example team: placement and shares", () => {
  const placed = placePeople(withIds(EXAMPLE_PEOPLE));
  const by = (t: string) => placed.find((b) => b.title === t)!;
  assert.equal(by("Core player").people.length, 3);
  assert.deepEqual(
    by("Core player").people.map((p) => p.name),
    ["Arjun Nair", "Rohan Gupta", "Sneha Pillai"]
  );
  assert.equal(by("High performer").people.length, 2);
  assert.equal(by("Core player").share, 3 / 12);
  assert.equal(placed.reduce((a, b) => a + b.people.length, 0), 12);
});

test("axis spread counts each level", () => {
  const s = axisSpread(withIds(EXAMPLE_PEOPLE), "performance");
  assert.deepEqual(
    s.map((x) => x.count),
    [3, 5, 4]
  );
  assert.equal(axisSpread([], "potential")[0].share, 0);
});

test("levels from words and numbers", () => {
  assert.equal(parseLevel("High"), 3);
  assert.equal(parseLevel(" m "), 2);
  assert.equal(parseLevel("medium"), 2);
  assert.equal(parseLevel("2"), 2);
  assert.equal(parseLevel("4"), null);
  assert.equal(parseLevel("4", 5), 3);
  assert.equal(parseLevel("3", 5), 2);
  assert.equal(parseLevel("2", 5), 1);
  assert.equal(parseLevel("2.5", 5), null);
  assert.equal(parseLevel(""), null);
  assert.equal(parseLevel("excellent"), null);
});

test("paste from a spreadsheet: header skipped, tabs and commas, errors reported", () => {
  const text = ["Name\tPerformance\tPotential", "Aditi Rao\tHigh\tHigh", "Rohan Gupta, moderate, 2", "", "Bad Row, 7, high", "Only name"].join("\n");
  const r = parsePeople(text);
  assert.equal(r.people.length, 2);
  assert.deepEqual(r.people[1], { name: "Rohan Gupta", performance: 2, potential: 2 });
  assert.equal(r.errors.length, 2);
  assert.equal(r.errors[0].line, 5);
  assert.match(r.errors[0].message, /Performance "7"/);
  assert.match(r.errors[1].message, /three columns/);
});

test("quoted names with commas survive", () => {
  const r = parsePeople('"Rao, Aditi",high,moderate');
  assert.equal(r.people[0].name, "Rao, Aditi");
});

test("1–5 ratings map to three levels", () => {
  const r = parsePeople("A,5,1\nB,3,4", 5);
  assert.deepEqual(
    r.people.map((p) => [p.performance, p.potential]),
    [
      [3, 1],
      [2, 3]
    ]
  );
});

test("CSV export round-trips and guards against formulas", () => {
  const people = withIds([{ name: "=HYPERLINK(1)", performance: 1, potential: 1 }, { name: "Rao, Aditi", performance: 3, potential: 3 }]);
  const csv = toCsv(people);
  assert.ok(csv.startsWith("Name,Performance,Potential,Box\n"));
  assert.ok(csv.includes('"Rao, Aditi",High,High,Future leader'));
  assert.ok(csv.includes("'=HYPERLINK(1),Low,Low,Under-performer"));
  assert.equal(esc("-5"), "'-5");
  const back = parsePeople(csv);
  assert.equal(back.people.length, 2);
});
