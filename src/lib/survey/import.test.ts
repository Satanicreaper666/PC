import { test } from "node:test";
import assert from "node:assert/strict";
import { cuts, matchColumns, parseAnswer, readResponses, summarise, trend, type Cell, type SurveyQuestion } from "./import.ts";

const scale = { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] };
const qs: SurveyQuestion[] = [
  { id: "clarity_1", text: "My priorities for this quarter are clear to me.", dim: "Clarity", rev: false },
  { id: "voice_2", text: "I hesitate to speak up about problems at work.", dim: "Voice", rev: true }
];

test("columns found by wording, by a Google Forms grid header, or by id", () => {
  const m = matchColumns(
    ["Timestamp", "How much do you agree? [My priorities for this quarter are clear to me.]", "voice_2", "Department", "How likely are you to recommend us (0 to 10)?"],
    qs
  );
  assert.equal(m.questions.clarity_1, 1);
  assert.equal(m.questions.voice_2, 2);
  assert.equal(m.group, 3);
  assert.equal(m.enps, 4);
  assert.deepEqual(m.missing, []);
});

test("answers as numbers, '4 - Agree' or labels; longest label wins", () => {
  assert.equal(parseAnswer(4, scale), 4);
  assert.equal(parseAnswer("4 - Agree", scale), 4);
  assert.equal(parseAnswer("Strongly agree", scale), 5);
  assert.equal(parseAnswer("agree", scale), 4);
  assert.equal(parseAnswer("Neither agree nor disagree", scale), 3);
  assert.ok(Number.isNaN(parseAnswer("7", scale)));
  assert.ok(Number.isNaN(parseAnswer("maybe", scale)));
});

test("reverse-worded statements are flipped; favourable is the top two points", () => {
  const table: Cell[][] = [
    ["My priorities for this quarter are clear to me.", "I hesitate to speak up about problems at work."],
    ["5", "1"],
    ["4", "2"],
    ["2", "4"],
    ["Agree", "Disagree"]
  ];
  const r = readResponses(table, qs, scale);
  assert.equal(r.rows.length, 4);
  const s = summarise(r.rows, qs, scale);
  assert.equal(s.items[0].avg, (5 + 4 + 2 + 4) / 4);
  // voice_2 flipped: 1→5, 2→4, 4→2, 2→4.
  assert.equal(s.items[1].avg, (5 + 4 + 2 + 4) / 4);
  assert.equal(s.items[0].favourable, 0.75);
  assert.equal(s.items[0].unfavourable, 0.25);
});

test("rows with fewer than half the statements answered are skipped", () => {
  const r = readResponses([["clarity_1", "voice_2"], ["", ""], ["3", ""], ["", "x"]], qs, scale);
  assert.equal(r.rows.length, 1);
  assert.equal(r.skipped, 1);
});

test("eNPS: % scoring 9–10 minus % scoring 0–6", () => {
  const table: Cell[][] = [["clarity_1", "voice_2", "Recommend 0-10"], ...[10, 9, 8, 6, 3].map((e) => ["4", "2", String(e)])];
  const s = summarise(readResponses(table, qs, scale).rows, qs, scale);
  assert.equal(s.enps?.score, 0);
  assert.equal(s.enps?.n, 5);
});

const rowsOf = (groups: [string, number][]) =>
  groups.flatMap(([g, n]) => Array.from({ length: n }, () => ({ answers: { clarity_1: 4, voice_2: 2 }, group: g || undefined })));

test("cuts: groups of five or more; small groups pooled", () => {
  const c = cuts(rowsOf([["Sales", 8], ["Ops", 6], ["HR", 3], ["Legal", 2]]), qs, scale);
  assert.deepEqual(c.groups.map((g) => [g.name, g.summary.n]), [["Sales", 8], ["Ops", 6], ["Other groups", 5]]);
});

test("cuts: a pool under five would be revealed by subtraction, so the smallest group joins it", () => {
  const c = cuts(rowsOf([["Sales", 8], ["Ops", 6], ["HR", 3]]), qs, scale);
  assert.deepEqual(c.groups.map((g) => [g.name, g.summary.n]), [["Sales", 8], ["Other groups", 9]]);
});

test("cuts: nothing when only one group would be left", () => {
  assert.deepEqual(cuts(rowsOf([["Sales", 8], ["HR", 3]]), qs, scale).groups, []);
  assert.deepEqual(cuts(rowsOf([["Sales", 8]]), qs, scale).groups, []);
});

test("trend: change per area against an earlier round", () => {
  const now = summarise(rowsOf([["", 5]]), qs, scale);
  const before = summarise([{ answers: { clarity_1: 3, voice_2: 3 } }], qs, scale);
  const t = trend(now, before);
  assert.equal(t[0].change, 1);
  assert.equal(t[1].change, 1);
});
