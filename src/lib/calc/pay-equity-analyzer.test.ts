import { test } from "node:test";
import assert from "node:assert/strict";
import { analyse, parseRows, parsePay, normaliseGender, quartiles, gapPct, toCsv, EXAMPLE_ROWS, type PayRow } from "./pay-equity-analyzer.ts";

test("example data: unadjusted gaps", () => {
  const a = analyse(EXAMPLE_ROWS);
  assert.deepEqual(a.counts, { women: 16, men: 27, other: 1, total: 44 });
  assert.equal(a.overall.meanWomen, 909812.5);
  assert.equal(Math.round(a.overall.meanMen ?? 0), 1287593);
  assert.equal(a.overall.gapMean?.toFixed(1), "29.3");
  assert.equal(a.overall.medianWomen, 585000);
  assert.equal(a.overall.medianMen, 1100000);
  assert.equal(a.overall.gapMedian?.toFixed(1), "46.8");
});

test("example data: like-for-like gap within roles", () => {
  const a = analyse(EXAMPLE_ROWS);
  assert.equal(a.likeForLike.gap?.toFixed(1), "6.7");
  assert.equal(a.likeForLike.roles, 5);
  assert.equal(a.likeForLike.inSmallGroups, 32);
  assert.equal(a.likeForLikeLarge.roles, 1);
  assert.equal(a.likeForLikeLarge.gap?.toFixed(1), "0.4");
  const se = a.roles.find((r) => r.role === "Software engineer")!;
  assert.equal(se.women, 4);
  assert.equal(se.men, 8);
  assert.equal(se.other, 1);
  assert.equal(se.gap?.toFixed(1), "9.2");
  assert.equal(se.small, true);
  assert.equal(a.roles.find((r) => r.role === "Customer support associate")?.small, false);
});

test("example data: women's share by pay quarter", () => {
  const q = analyse(EXAMPLE_ROWS).quartiles;
  assert.deepEqual(
    q.map((x) => [x.women, x.men]),
    [
      [6, 5],
      [5, 6],
      [2, 8],
      [3, 8]
    ]
  );
  assert.equal(q[2].shareWomen, 20);
});

test("like-for-like ignores roles with only one gender", () => {
  const rows: PayRow[] = [
    { role: "Analyst", gender: "woman", pay: 900000 },
    { role: "Analyst", gender: "man", pay: 1000000 },
    { role: "Director", gender: "man", pay: 5000000 },
    { role: "Nurse", gender: "woman", pay: 500000 }
  ];
  const a = analyse(rows);
  assert.equal(a.likeForLike.roles, 1);
  assert.equal(a.likeForLike.gap, 10);
  assert.equal(a.likeForLike.womenNotCompared, 1);
  assert.ok((a.overall.gapMean ?? 0) > 50);
});

test("negative gap when women are paid more; null when a group is missing", () => {
  assert.equal(gapPct(1000, 1100), -10);
  const onlyWomen = analyse([{ role: "A", gender: "woman", pay: 100 }]);
  assert.equal(onlyWomen.overall.gapMean, null);
  assert.equal(onlyWomen.likeForLike.gap, null);
  assert.equal(analyse([]).overall.gapMedian, null);
});

test("roles group case-insensitively", () => {
  const a = analyse([
    { role: "Sales Executive", gender: "woman", pay: 100 },
    { role: "sales executive", gender: "man", pay: 200 }
  ]);
  assert.equal(a.roles.length, 1);
  assert.equal(a.roles[0].role, "Sales Executive");
});

test("pay amounts in common Indian formats", () => {
  assert.equal(parsePay("12,50,000"), 1250000);
  assert.equal(parsePay("₹ 12,50,000"), 1250000);
  assert.equal(parsePay("Rs. 1250000"), 1250000);
  assert.equal(parsePay("12.5 L"), 1250000);
  assert.equal(parsePay("12.5 lakh"), 1250000);
  assert.equal(parsePay("1.2 Cr"), 12000000);
  assert.equal(parsePay("850k"), 850000);
  assert.equal(parsePay("0"), null);
  assert.equal(parsePay("-5"), null);
  assert.equal(parsePay("twelve"), null);
  assert.equal(parsePay(""), null);
});

test("gender labels", () => {
  assert.equal(normaliseGender("F"), "woman");
  assert.equal(normaliseGender(" Female "), "woman");
  assert.equal(normaliseGender("M"), "man");
  assert.equal(normaliseGender("male"), "man");
  assert.equal(normaliseGender("Non-binary"), "other");
  assert.equal(normaliseGender(""), "other");
});

test("paste from a spreadsheet: header skipped, errors reported with line numbers", () => {
  const text = ["Role\tGender\tAnnual CTC", "Analyst\tF\t9,00,000", "Analyst\tM\t10 L", "Analyst, M", "Manager\tF\tlots"].join("\n");
  const r = parseRows(text);
  assert.equal(r.rows.length, 2);
  assert.deepEqual(r.rows[1], { role: "Analyst", gender: "man", pay: 1000000 });
  assert.equal(r.errors.length, 2);
  assert.equal(r.errors[0].line, 4);
  assert.match(r.errors[1].message, /Pay "lots"/);
});

test("comma-separated rows with quoted roles", () => {
  const r = parseRows('"Manager, Sales",F,1500000\nAnalyst,M,"9,00,000"');
  assert.equal(r.rows[0].role, "Manager, Sales");
  assert.equal(r.rows[1].pay, 900000);
});

test("quartiles need at least four people", () => {
  assert.deepEqual(quartiles([{ role: "A", gender: "woman", pay: 1 }]), []);
});

test("CSV export guards against formulas", () => {
  const csv = toCsv([{ role: "=cmd", gender: "woman", pay: 100 }]);
  assert.equal(csv, "Role,Gender,Annual pay\n'=cmd,Woman,100");
});

import { costToClose } from "./pay-equity-analyzer.ts";

test("cost to close: women below the men's median in their role, raised to it", () => {
  const rows = [
    { role: "Engineer", gender: "man" as const, pay: 1000000 },
    { role: "Engineer", gender: "man" as const, pay: 1200000 },
    { role: "Engineer", gender: "man" as const, pay: 1400000 },
    { role: "Engineer", gender: "woman" as const, pay: 1000000 },
    { role: "Engineer", gender: "woman" as const, pay: 1300000 },
    { role: "Analyst", gender: "woman" as const, pay: 500000 }
  ];
  const c = costToClose(rows);
  assert.equal(c.roles.length, 1);
  assert.equal(c.roles[0].target, 1200000);
  assert.equal(c.roles[0].below, 1);
  assert.equal(c.cost, 200000);
  assert.equal(c.women, 1);
  assert.equal(c.roles[0].small, true);
  assert.ok(Math.abs(c.share - 200000 / 6400000) < 1e-12);
});
