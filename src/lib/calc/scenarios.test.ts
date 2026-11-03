import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addScenario,
  baseIndexIn,
  bestIndex,
  buildComparison,
  cleanLabel,
  compareSet,
  comparisonRows,
  csvField,
  csvFileName,
  diffFigures,
  diffHeader,
  emptyStore,
  figureNumber,
  findSame,
  nextLabel,
  parseFigure,
  readStore,
  removeScenario,
  renameScenario,
  restoreScenario,
  sameParams,
  SCENARIO_MAX,
  setBase,
  setCompare,
  toCsv,
  toTsv,
  uniqueKeys,
  writeStore
} from "./scenarios.ts";
import type { Scenario } from "./scenarios.ts";

/** Two take-home offers as the calculator saves them. */
const offerA: Scenario = {
  id: "a",
  label: "Offer A",
  savedAt: "2026-11-03T10:00:00.000Z",
  params: { ctc: "9,00,000", basic: "50", hra: "40", other: "", pf: "restricted", grat: "yes", state: "KA", gender: "other", pfin: "0" },
  outputs: [
    { key: "inhand", label: "Monthly in-hand pay", value: "₹66,185", better: "higher" },
    { key: "sub", label: "Summary", value: "a month before income tax, from a gross salary of ₹69,385" }
  ],
  lines: [
    { key: "Basic pay + DA", label: "Basic pay + DA", value: "₹37,500" },
    { key: "Gross salary", label: "Gross salary", value: "₹69,385", strong: true },
    { key: "Employee PF", label: "Employee PF", value: "− ₹3,000", note: "12% of ₹25,000" },
    { key: "Professional tax", label: "Professional tax", value: "− ₹200" },
    { key: "In-hand before income tax", label: "In-hand before income tax", value: "₹66,185", strong: true }
  ]
};
const offerB: Scenario = {
  ...offerA,
  id: "b",
  label: "Offer B",
  params: { ...offerA.params, ctc: "10,00,000", basic: "40", state: "DL" },
  outputs: [
    { key: "inhand", label: "Monthly in-hand pay", value: "₹72,500", better: "higher" },
    { key: "sub", label: "Summary", value: "a month before income tax, from a gross salary of ₹75,500" }
  ],
  lines: [
    { key: "Basic pay + DA", label: "Basic pay + DA", value: "₹33,333" },
    { key: "Gross salary", label: "Gross salary", value: "₹75,500", strong: true },
    { key: "Employee PF", label: "Employee PF", value: "− ₹3,000" },
    { key: "Employee ESI", label: "Employee ESI", value: "− ₹120" },
    { key: "Professional tax", label: "Professional tax", value: "Nil" },
    { key: "In-hand before income tax", label: "In-hand before income tax", value: "₹72,500", strong: true }
  ]
};

test("figures: rupees, signs, Indian grouping and units are read back from the screen text", () => {
  assert.deepEqual(parseFigure("₹66,185"), { kind: "inr", n: 66185, decimals: 0, shape: "₹#" });
  assert.equal(parseFigure("− ₹3,000")?.n, -3000);
  assert.equal(parseFigure("-₹600")?.n, -600);
  assert.equal(parseFigure("₹1,80,00,000")?.n, 18000000);
  assert.deepEqual(parseFigure("₹2,082.50"), { kind: "inr", n: 2082.5, decimals: 2, shape: "₹#" });
  assert.deepEqual(parseFigure("50%"), { kind: "pct", n: 50, decimals: 0, shape: "#%" });
  assert.equal(parseFigure("8.33% of CTC")?.kind, "pct");
  assert.deepEqual(parseFigure("18 days"), { kind: "num", n: 18, decimals: 0, shape: "# days" });
  assert.equal(parseFigure("₹200 a month")?.shape, "₹# a month");
  assert.equal(parseFigure("About 1.4")?.n, 1.4);
  assert.equal(parseFigure("Nil")?.kind, "zero");
});

test("figures: dates read as days; sentences, ranges and durations are text", () => {
  const a = parseFigure("Tue 8 December 2026");
  const b = parseFigure("Sun, 3 January 2027");
  assert.equal(a?.kind, "date");
  assert.equal(b!.n - a!.n, 26);
  assert.equal(parseFigure("7 years, 7 months, 0 days"), null);
  assert.equal(parseFigure("₹4.00 lakh to ₹9.77 lakh"), null);
  assert.equal(parseFigure("Pay wages by Tue 8 December 2026, within 2 working days"), null);
  assert.equal(parseFigure("Normal pay date"), null);
  assert.equal(parseFigure("2026-27"), null);
  assert.equal(parseFigure(""), null);
});

test("differences in ₹ and %, signed with a true minus", () => {
  assert.deepEqual(diffFigures("₹66,185", "₹72,500"), { n: 6315, text: "+₹6,315", pct: "+9.5%", kind: "inr" });
  assert.deepEqual(diffFigures("₹72,500", "₹66,185"), { n: -6315, text: "−₹6,315", pct: "−8.7%", kind: "inr" });
  // A bigger deduction is a negative difference, with no % (easy to misread on a negative figure).
  assert.equal(diffFigures("− ₹3,000", "− ₹3,600")?.text, "−₹600");
  assert.equal(diffFigures("− ₹3,000", "− ₹3,600")?.pct, null);
  assert.equal(diffFigures("₹3,000", "− ₹3,600")?.pct, null);
  // Nil counts as zero against a rupee amount; no % change from zero.
  assert.deepEqual(diffFigures("Nil", "− ₹200"), { n: -200, text: "−₹200", pct: null, kind: "inr" });
  assert.equal(diffFigures("₹40,000", "₹40,000")?.text, "Same");
  assert.equal(diffFigures("₹40,000", "₹40,000")?.pct, null);
  assert.equal(diffFigures("₹10,00,000", "₹10,00,100")?.pct, "+0.01%");
});

test("differences keep units: percentage points, days, dates; mismatched shapes give none", () => {
  assert.equal(diffFigures("50%", "40%")?.text, "−10 pp");
  assert.equal(diffFigures("50%", "40%")?.pct, null);
  assert.equal(diffFigures("18 days", "20.5 days")?.text, "+2.5 days");
  assert.equal(diffFigures("7.6 yrs", "8 yrs")?.text, "+0.4 yrs");
  assert.equal(diffFigures("Tue 8 December 2026", "Mon 14 December 2026")?.text, "+6 days");
  assert.equal(diffFigures("Tue 8 December 2026", "Mon 7 December 2026")?.text, "−1 day");
  assert.equal(diffFigures("Tue 8 December 2026", "Tue 8 December 2026")?.text, "Same day");
  assert.equal(diffFigures("₹200 a month", "₹1,250 a half-year"), null);
  assert.equal(diffFigures("₹200", "18 days"), null);
  assert.equal(diffFigures("Not covered", "₹741"), null);
});

test("best is marked only when one value is strictly best", () => {
  assert.equal(bestIndex(["₹66,185", "₹72,500"], "higher"), 1);
  assert.equal(bestIndex(["₹66,185", "₹72,500", "₹70,000"], "lower"), 0);
  assert.equal(bestIndex(["₹66,185", "₹66,185"], "higher"), -1);
  assert.equal(bestIndex(["₹66,185", "Not covered"], "higher"), -1);
  assert.equal(bestIndex(["₹66,185", ""], "higher"), -1);
  assert.equal(bestIndex(["₹66,185"], "higher"), -1);
  assert.equal(bestIndex(["Nil", "− ₹200"], "higher"), 0);
});

test("comparison: outputs, merged line items and differing inputs, against the base", () => {
  const c = buildComparison([offerA, offerB], 0, [
    { key: "ctc", label: "Annual CTC", values: ["₹9,00,000", "₹10,00,000"] },
    { key: "hra", label: "HRA, % of basic", values: ["40%", "40%"] },
    { key: "state", label: "State where you work", values: ["Karnataka", "Delhi"] }
  ]);
  assert.deepEqual(c.columns, ["Offer A", "Offer B"]);
  assert.deepEqual(c.diffColumns, [1]);
  assert.equal(diffHeader(c, 1), "Difference");
  const [result, lines, inputs] = c.sections;
  assert.equal(result.rows[0].label, "Monthly in-hand pay");
  assert.equal(result.rows[0].cells[1].best, true);
  assert.equal(result.rows[0].cells[0].best, false);
  assert.equal(result.rows[0].diffs[0]?.text, "+₹6,315");
  assert.equal(result.rows[1].long, true);
  assert.equal(result.rows[1].diffs[0], null);
  assert.equal(c.marked, true);
  // ESI appears only in Offer B; it keeps its place after Employee PF.
  assert.deepEqual(
    lines.rows.map((r) => r.label),
    ["Basic pay + DA", "Gross salary", "Employee PF", "Employee ESI", "Professional tax", "In-hand before income tax"]
  );
  const esi = lines.rows[3];
  assert.equal(esi.cells[0].text, "—");
  assert.equal(esi.diffs[0], null);
  assert.equal(lines.rows[4].diffs[0]?.text, "+₹200");
  // Lines carry no "better" unless the calculator says so.
  assert.equal(lines.rows.some((r) => r.cells.some((x) => x.best)), false);
  assert.deepEqual(
    inputs.rows.map((r) => r.label),
    ["Annual CTC", "State where you work"]
  );
  assert.equal(inputs.rows[0].diffs[0]?.text, "+₹1,00,000");
  assert.equal(inputs.note, "Inputs that are the same in every scenario are left out.");
});

test("comparison with three scenarios and a chosen base", () => {
  const offerC: Scenario = { ...offerA, id: "c", label: "Offer C", outputs: [{ key: "inhand", label: "Monthly in-hand pay", value: "₹70,000", better: "higher" }], lines: [] };
  const c = buildComparison([offerA, offerB, offerC], 1);
  assert.equal(c.base, 1);
  assert.deepEqual(c.diffColumns, [0, 2]);
  assert.equal(diffHeader(c, 0), "Offer A vs Offer B");
  assert.equal(c.sections[0].rows[0].diffs[0]?.text, "−₹6,315");
  assert.equal(c.sections[0].rows[0].diffs[1]?.text, "−₹2,500");
  assert.equal(c.sections[0].rows[0].cells[1].best, true);
});

test("comparison rows for CSV drop the leading plus so spreadsheets don't read a formula", () => {
  const c = buildComparison([offerA, offerB], 0);
  const rows = comparisonRows(c, { forCsv: true });
  assert.deepEqual(rows[0], ["", "Offer A", "Offer B", "Offer B − Offer A", "Offer B − Offer A (%)"]);
  assert.deepEqual(rows[1], ["Result"]);
  assert.deepEqual(rows[2], ["Monthly in-hand pay", "₹66,185", "₹72,500", "₹6,315", "9.5%"]);
  const screen = comparisonRows(c);
  assert.deepEqual(screen[2].slice(3), ["+₹6,315", "+9.5%"]);
});

test("CSV: quoting, formula guard, BOM and CRLF; TSV flattens tabs and newlines", () => {
  assert.equal(csvField("₹9,00,000"), '"₹9,00,000"');
  assert.equal(csvField('Say "yes"'), '"Say ""yes"""');
  assert.equal(csvField("=HYPERLINK(1)"), "'=HYPERLINK(1)");
  assert.equal(csvField("-3000"), "-3000");
  assert.equal(csvField("−₹600"), "−₹600");
  assert.equal(csvField("two\nlines"), '"two\nlines"');
  const csv = toCsv([
    ["Item", "Value"],
    ["Annual CTC", "₹9,00,000"]
  ]);
  assert.equal(csv, '﻿Item,Value\r\nAnnual CTC,"₹9,00,000"\r\n');
  assert.equal(toTsv([["a\tb", "c\nd"]]), "a b\tc d");
  assert.equal(csvFileName("Take-home salary calculator", new Date(2026, 10, 3)), "take-home-salary-calculator-2026-11-03.csv");
  assert.equal(csvFileName("gratuity-calculator", new Date(2026, 0, 9), "compare"), "gratuity-calculator-compare-2026-01-09.csv");
});

test("figureNumber gives a plain spreadsheet value", () => {
  assert.equal(figureNumber("− ₹3,000"), "-3000");
  assert.equal(figureNumber("₹2,082.50"), "2082.5");
  assert.equal(figureNumber("50%"), "50");
  assert.equal(figureNumber("Tue 8 December 2026"), "2026-12-08");
  assert.equal(figureNumber("Nil"), "0");
  assert.equal(figureNumber("7 years, 7 months, 0 days"), "");
});

test("default labels: Offer A, B…; Scenario 1, 2…; a deleted label is not reused at once", () => {
  assert.equal(nextLabel("Offer {A}", []), "Offer A");
  assert.equal(nextLabel("Offer {A}", ["Offer A"]), "Offer B");
  assert.equal(nextLabel("Offer {A}", ["Offer B"]), "Offer C");
  assert.equal(nextLabel("Scenario {1}", []), "Scenario 1");
  assert.equal(nextLabel("Scenario {1}", ["Scenario 1", "My plan"]), "Scenario 3");
  assert.equal(nextLabel("Scenario", ["x"]), "Scenario 2");
  assert.equal(nextLabel("Offer {A}", Array.from({ length: 26 }, (_, i) => `Offer ${String.fromCharCode(65 + i)}`)), "Offer AA");
});

test("store: add, find duplicates, rename, compare flags, base, delete and undo", () => {
  let s = addScenario(emptyStore(), offerA);
  s = addScenario(s, offerB);
  assert.equal(s.items.length, 2);
  assert.equal(findSame(s, { ...offerA.params })?.id, "a");
  assert.equal(findSame(s, { ...offerA.params, ctc: "9,50,000" }), undefined);
  assert.equal(sameParams({ a: "1", b: "" }, { a: "1" }), true);
  s = renameScenario(s, "a", "  Infosys   offer ");
  assert.equal(s.items[0].label, "Infosys offer");
  assert.equal(renameScenario(s, "a", "   ").items[0].label, "Infosys offer");
  s = setCompare(s, "a", false);
  assert.deepEqual(compareSet(s).map((x) => x.id), ["b"]);
  s = setCompare(s, "a", true);
  assert.equal("compare" in s.items[0], false);
  s = setBase(s, "b");
  assert.equal(baseIndexIn(compareSet(s), s.base), 1);
  assert.equal(setBase(s, "nope").base, "b");
  const r = removeScenario(s, "b");
  assert.equal(r.store.items.length, 1);
  assert.equal(r.store.base, undefined);
  assert.equal(r.index, 1);
  const back = restoreScenario(r.store, r.removed!, r.index);
  assert.deepEqual(back.items.map((x) => x.id), ["a", "b"]);
  assert.equal(baseIndexIn(compareSet(back), "gone"), 0);
});

test("store: survives a round trip and rejects junk without throwing", () => {
  const s = setBase(addScenario(addScenario(emptyStore(), offerA), offerB), "b");
  assert.deepEqual(readStore(writeStore(s)), s);
  assert.deepEqual(readStore(null), emptyStore());
  assert.deepEqual(readStore("{not json"), emptyStore());
  assert.deepEqual(readStore('{"items":"x"}'), emptyStore());
  const junk = readStore(JSON.stringify({ v: 1, items: [{ id: "x", params: { a: 1, b: "2" }, label: 5, outputs: [{ key: "k", value: "₹1", better: "sideways" }] }, { nope: true }] }));
  assert.equal(junk.items.length, 1);
  assert.deepEqual(junk.items[0].params, { b: "2" });
  assert.equal(junk.items[0].label, "Scenario");
  assert.equal(junk.items[0].outputs[0].better, undefined);
  const many = { v: 1, items: Array.from({ length: SCENARIO_MAX + 3 }, (_, i) => ({ ...offerA, id: `s${i}` })) };
  assert.equal(readStore(JSON.stringify(many)).items.length, SCENARIO_MAX);
});

test("labels are cleaned and capped; repeated keys stay separate rows", () => {
  assert.equal(cleanLabel("a\u0000b\n c"), "a b c");
  assert.equal(cleanLabel("x".repeat(80)).length, 60);
  assert.deepEqual(
    uniqueKeys([{ key: "Total" }, { key: "Total" }, { key: "Other" }]).map((x) => x.key),
    ["Total", "Total#2", "Other"]
  );
});
