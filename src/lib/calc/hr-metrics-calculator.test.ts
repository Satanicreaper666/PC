import { test } from "node:test";
import assert from "node:assert/strict";
import { METRICS, GROUPS, computeAll, parseList, median, nps, rate, periodRate, signed, type Get } from "./hr-metrics-calculator.ts";

/** A getter over the page's starting values (the worked examples). */
function defaults(over: Record<string, string> = {}): Get {
  const values: Record<string, string> = {};
  for (const m of METRICS) for (const i of m.inputs) values[i.id] = i.value;
  Object.assign(values, over);
  return {
    raw: (id) => values[id] ?? "",
    n: (id) => {
      const s = (values[id] ?? "").replace(/[₹,\s]/g, "");
      return s === "" ? 0 : Number(s);
    }
  };
}

test("twenty metrics plus the shared inputs, with unique input ids", () => {
  assert.equal(METRICS.filter((m) => m.group !== "shared").length, 20);
  const ids = METRICS.flatMap((m) => m.inputs.map((i) => i.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const m of METRICS) assert.ok(GROUPS.some((g) => g.id === m.group), m.id);
  for (const m of METRICS) for (const u of m.uses ?? []) assert.ok(ids.includes(u), `${m.id} uses ${u}`);
});

test("worked examples on the page", () => {
  const r = computeAll(defaults());
  const d = (id: string) => r[id].display;
  assert.equal(d("attrition"), "18.0%");
  assert.equal(d("voluntary"), "14.0%");
  assert.equal(d("regrettable"), "25.0%");
  assert.equal(d("firstYear"), "15.0%");
  assert.equal(d("timeToFill"), "40 days");
  assert.equal(r.timeToFill.note, "Median 37.5 days across 6 roles");
  assert.equal(d("costPerHire"), "₹56,500");
  assert.equal(d("offerAcceptance"), "83.3%");
  assert.equal(d("qualityOfHire"), "89.5%");
  assert.equal(d("enps"), "+12");
  assert.equal(d("managerNps"), "+29");
  assert.equal(d("absenteeism"), "2.2%");
  assert.equal(d("revenuePerEmployee"), "₹25,00,000");
  assert.equal(d("profitPerEmployee"), "₹3,00,000");
  assert.equal(d("trainingRoi"), "50%");
  assert.equal(r.trainingRoi.note, "Benefit–cost ratio 1.5 : 1");
  assert.equal(d("compaRatio"), "0.96");
  assert.equal(d("genderGap"), "12.0%");
  assert.equal(r.genderGap.note, "Women's average pay is lower");
  assert.equal(d("benefitTakeUp"), "65.0%");
  assert.equal(d("poshOnTime"), "100.0%");
  assert.equal(d("filingsOnTime"), "95.8%");
  assert.equal(d("hrRatio"), "1 : 80");
  assert.equal(r.hrRatio.note, "1.25 HR staff per 100 employees");
});

test("a quarter's attrition is also shown as a yearly figure", () => {
  const out = periodRate(9, 200, 3);
  assert.equal(out.display, "4.5%");
  assert.equal(out.note, "In 3 months; about 18.0% a year");
  assert.equal(computeAll(defaults({ months: "3", leavers: "9" })).attrition.note, "In 3 months; about 18.0% a year");
});

test("missing denominators show a dash and a prompt, never Infinity", () => {
  const r = computeAll(defaults({ avgHc: "", offers: "0", hires: "", programmeCost: "0", midpoint: "", hrFte: "0", fillDays: "" }));
  for (const id of ["attrition", "voluntary", "absenteeism", "revenuePerEmployee", "offerAcceptance", "costPerHire", "trainingRoi", "compaRatio", "hrRatio", "timeToFill"]) {
    assert.equal(r[id].value, null, id);
    assert.equal(r[id].display, "—", id);
    assert.ok(r[id].note, id);
  }
});

test("impossible combinations are flagged", () => {
  const r = computeAll(defaults({ accepted: "50", resigned: "40" }));
  assert.equal(r.offerAcceptance.warn, true);
  assert.equal(r.voluntary.warn, true);
});

test("helpers", () => {
  assert.deepEqual(parseList("30, 35\n40;45  x 28"), [30, 35, 40, 45, 28]);
  assert.deepEqual(parseList(""), []);
  assert.equal(median([5, 1, 3]), 3);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(nps(0, 0, 0), null);
  assert.equal(nps(50, 0, 50), 0);
  assert.equal(nps(10, 0, 0), 100);
  assert.equal(rate(1, 0), null);
  assert.equal(signed(-12.4), "−12");
  assert.equal(signed(0.2), "0");
  assert.equal(computeAll(defaults({ menAvg: "8,00,000", womenAvg: "8,40,000" })).genderGap.note, "Women's average pay is higher");
});
