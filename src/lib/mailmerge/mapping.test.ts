import { test } from "node:test";
import assert from "node:assert/strict";
import { dayNum } from "../analytics/dates.ts";
import { buildLibrary, jsonForScript, MERGE_FORMS, usedFields, type MergeTemplate, type ToolEntry } from "./library.ts";
import { autoMap, fileStem, findMergeHeaderRow, headerScore, rawValue, templateCsv } from "./mapping.ts";
import { checkRows, problemText, summarise, unmappedRequired } from "./rows.ts";
import { longDate, readValue, rupees } from "./values.ts";

const F = (id: string, label: string, type = "text", required = false, extra: Record<string, unknown> = {}) => ({ id, label, type, required, ...extra });

const entries: ToolEntry[] = [
  {
    id: "offer-letter",
    body: "{{company}}\n\nDear {{candidate_name}}, you start on {{start_date}} as {{role}}. CTC {{ctc_annual}}. {{today}}",
    data: {
      title: "Offer letter",
      description: "An offer.",
      kind: "letter",
      stage: "recruit",
      fields: [
        F("company", "Company name", "text", true),
        F("candidate_name", "Candidate's full name", "text", true),
        F("role", "Role", "text", true),
        F("start_date", "Start date", "date", true),
        F("ctc_annual", "Total annual CTC", "money", true),
        F("unused", "Not in the body")
      ]
    }
  },
  {
    id: "resignation-letter",
    body: "From {{your_name}} to {{manager_name}}",
    data: { title: "Resignation letter", description: "", kind: "letter", stage: "exit", fields: [F("your_name", "Your full name", "text", true), F("manager_name", "Manager's name", "text", true)] }
  },
  { id: "annual-performance-appraisal", body: "{{employee_name}} {{review_date}}", data: { title: "Annual performance appraisal", description: "", kind: "form", stage: "grow", fields: [F("employee_name", "Employee's name", "text", true), F("review_date", "Date of review meeting", "date", true)] } },
  { id: "posh-complaint-form", body: "{{x}}", data: { title: "POSH complaint form", description: "", kind: "form", stage: "pay", fields: [F("x", "X")] } },
  { id: "leave-policy", body: "{{x}}", data: { title: "Leave policy", description: "", kind: "policy", stage: "pay", fields: [F("x", "X")] } }
];
const lib = buildLibrary(entries);
const offer = lib.find((t) => t.id === "offer-letter")!;

test("the library has letters and the bulk-friendly forms only, employer letters first", () => {
  assert.deepEqual(
    lib.map((t) => [t.id, t.group]),
    [["offer-letter", "employer"], ["annual-performance-appraisal", "form"], ["resignation-letter", "employee"]]
  );
  assert.ok(MERGE_FORMS.includes("annual-performance-appraisal"));
  assert.deepEqual(offer.fields.map((f) => f.id), ["company", "candidate_name", "role", "start_date", "ctc_annual"], "fields the body doesn't use are dropped");
  assert.ok(offer.html.includes(`data-f="start_date" data-type="date"`));
  assert.deepEqual(usedFields("{{a}} {{ b }} {{a}} {{today}}"), ["a", "b", "today"]);
  assert.ok(!jsonForScript({ h: "</script><p>" }).includes("</script>"));
});

test("values are formatted the Indian way", () => {
  const d = F("d", "D", "date") as never;
  assert.equal(readValue(d, "02/11/2026", "dmy").text, "2 November 2026");
  assert.equal(readValue(d, "2026-11-02", "mdy").text, "2 November 2026");
  assert.equal(readValue(d, 46328, "dmy").text, "2 November 2026", "an Excel date number");
  assert.equal(readValue(d, "11/02/2026", "mdy").text, "2 November 2026");
  assert.equal(readValue(d, "31/02/2026", "dmy").problem?.level, "error");
  assert.equal(longDate(dayNum(2027, 1, 9)), "9 January 2027");
  const m = F("m", "M", "money") as never;
  assert.equal(readValue(m, "1200000", "dmy").text, "₹12,00,000");
  assert.equal(readValue(m, "12 LPA", "dmy").text, "₹12,00,000");
  assert.equal(readValue(m, "₹45,000/-", "dmy").text, "₹45,000");
  assert.equal(readValue(m, 99999.6, "dmy").text, "₹1,00,000");
  assert.equal(readValue(m, "about 5 lakh", "dmy").problem?.level, "error");
  assert.equal(rupees(15000000), "₹1,50,00,000");
});

test("other field types", () => {
  const sel = F("s", "S", "select", true, { options: ["has been paid", "is being processed, and you will receive a statement"] }) as never;
  assert.equal(readValue(sel, "HAS BEEN PAID", "dmy").text, "has been paid");
  assert.equal(readValue(sel, "being processed", "dmy").text, "is being processed, and you will receive a statement");
  const odd = readValue(sel, "Pending", "dmy");
  assert.equal(odd.text, "Pending");
  assert.equal(odd.problem?.level, "warning");
  assert.equal(readValue(F("e", "E", "email") as never, "asha@", "dmy").problem?.level, "warning");
  assert.equal(readValue(F("n", "N", "number") as never, "12", "dmy").problem, undefined);
  assert.equal(readValue(F("t", "T", "textarea") as never, "  Line 1\r\nLine 2  ", "dmy").text, "Line 1\nLine 2");
  assert.equal(readValue(F("t", "T") as never, null, "dmy").text, "");
});

test("columns are matched by label, id and usual names; each column once", () => {
  const headers = ["Sr No", "Candidate Name", "Designation", "DOJ", "start_date", "Annual CTC (₹)", "Company name"];
  const rows = [["1", "Asha", "Engineer", "01/12/2026", "05/12/2026", "9,00,000", "Sample Co"]];
  const { map, matched } = autoMap(offer, headers, rows);
  assert.deepEqual(map, { company: { col: 6 }, candidate_name: { col: 1 }, role: { col: 2 }, start_date: { col: 4 }, ctc_annual: { col: 5 } });
  assert.equal(matched, 5);
  assert.equal(headerScore("Candidate's Full Name", offer.fields[1]), 100);
  assert.equal(headerScore("Sr No", offer.fields[1]), 0);
});

test("a look-alike column with the wrong kind of values isn't matched", () => {
  const { map } = autoMap(offer, ["Joining date", "Start date"], [["Immediate", "01/12/2026"], ["Next month", "15/12/2026"]]);
  assert.deepEqual(map.start_date, { col: 1 });
});

test("dates in a month-first file are noticed; one clear date settles the rest", () => {
  const { dateOrder } = autoMap(offer, ["Start date"], [["12/25/2026"], ["01/30/2027"]]);
  assert.equal(dateOrder, "mdy");
  const settled = autoMap(offer, ["Start date"], [["10/11/2026"], ["24/11/2026"]]);
  assert.deepEqual([settled.dateOrder, settled.dateAmbiguous], ["dmy", false]);
  const unclear = autoMap(offer, ["Start date"], [["10/11/2026"], ["03/04/2026"]]);
  assert.deepEqual([unclear.dateOrder, unclear.dateAmbiguous], ["dmy", true]);
});

test("finds the header row under a title, and writes the CSV template", () => {
  const rows = [["Offers for November"], [], ["Candidate's full name", "Role", "Start date"], ["Asha", "Engineer", "01/12/2026"]];
  assert.equal(findMergeHeaderRow(rows, offer), 2);
  assert.equal(templateCsv(offer), "Company name,Candidate's full name,Role,Start date,Total annual CTC\r\n");
  assert.equal(fileStem(offer, "2026-11-02"), "offer-letter-mail-merge-2026-11-02");
});

test("row checks: missing details, bad dates, values typed once, defaults", () => {
  const t: MergeTemplate = {
    ...offer,
    fields: [...offer.fields, { id: "closing", label: "Closing line", type: "text", required: false, default: "With best wishes." }]
  };
  const rows = [
    ["Asha Pudina", "Engineer", "01/12/2026", "9,00,000"],
    ["", "", "", ""],
    ["Rohit Javitri", "", "31/02/2026", "8 lakh"]
  ];
  const map = { company: { fixed: "Sample Company Pvt Ltd" }, candidate_name: { col: 0 }, role: { col: 1 }, start_date: { col: 2 }, ctc_annual: { col: 3 } };
  const res = checkRows(t, rows, 2, map, "dmy");
  assert.equal(res.length, 2, "the blank row is skipped");
  assert.equal(res[0].status, "ready");
  assert.equal(res[0].who, "Asha Pudina");
  assert.deepEqual(res[0].values, { company: "Sample Company Pvt Ltd", candidate_name: "Asha Pudina", role: "Engineer", start_date: "1 December 2026", ctc_annual: "₹9,00,000", closing: "With best wishes." });
  assert.equal(res[1].row, 4, "spreadsheet row numbers");
  assert.equal(res[1].status, "fix");
  assert.deepEqual(res[1].problems.map(problemText), ["Role is empty", "Start date: “31/02/2026” can't be read as a date"]);
  assert.deepEqual(summarise(res), { total: 2, ready: 1, check: 0, fix: 1 });
  assert.equal(rawValue(t.fields[5], rows[0], map), "With best wishes.");
  assert.deepEqual(unmappedRequired(t, { candidate_name: { col: 0 } }), ["Company name", "Role", "Start date", "Total annual CTC"]);
});

test("forms don't need every box filled", () => {
  const form = lib.find((t) => t.kind === "form")!;
  const res = checkRows(form, [["Asha", ""]], 2, { employee_name: { col: 0 }, review_date: { col: 1 } }, "dmy");
  assert.equal(res[0].status, "ready");
  assert.deepEqual(unmappedRequired(form, {}), []);
});
