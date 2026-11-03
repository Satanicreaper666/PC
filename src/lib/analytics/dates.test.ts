import { test } from "node:test";
import assert from "node:assert/strict";
import { dayNum, detectDateOrder, excelSerial, fyStartYear, isoDate, monthEnd, monthOf, monthStart, parseDate } from "./dates.ts";

const iso = (v: unknown, order: "dmy" | "mdy" = "dmy") => {
  const n = parseDate(v, order);
  return n === null ? null : isoDate(n);
};

test("ISO and Indian day-first dates", () => {
  assert.equal(iso("2026-01-31"), "2026-01-31");
  assert.equal(iso("2026/1/5"), "2026-01-05");
  assert.equal(iso("31/01/2026"), "2026-01-31");
  assert.equal(iso("05-04-2024"), "2024-04-05");
  assert.equal(iso("05.04.24"), "2024-04-05");
  assert.equal(iso("2024-03-15T00:00:00.000Z"), "2024-03-15");
  assert.equal(iso("15/03/2024 10:30"), "2024-03-15");
});

test("month-first when the file is American", () => {
  assert.equal(iso("04/05/2024", "mdy"), "2024-04-05");
  assert.equal(iso("12/31/2025", "mdy"), "2025-12-31");
  assert.equal(iso("12/31/2025", "dmy"), null);
});

test("month names", () => {
  assert.equal(iso("14-Mar-2022"), "2022-03-14");
  assert.equal(iso("14 March 2022"), "2022-03-14");
  assert.equal(iso("1st Sept, 2023"), "2023-09-01");
  assert.equal(iso("Mar 14, 2022"), "2022-03-14");
  assert.equal(iso("14-Mar-22"), "2022-03-14");
  assert.equal(iso("14-Mar-88"), "1988-03-14");
});

test("Excel serial numbers, Date objects and yyyymmdd", () => {
  assert.equal(iso(45658), "2025-01-01");
  assert.equal(iso("45658"), "2025-01-01");
  assert.equal(iso(20260131), "2026-01-31");
  // A date stored as Indian midnight (18:30 UTC the day before) stays on the right day.
  assert.equal(iso(new Date("2024-03-14T18:30:00.000Z")), "2024-03-15");
  assert.equal(iso(new Date(Date.UTC(2024, 2, 15))), "2024-03-15");
  assert.equal(excelSerial(25569), 0);
});

test("impossible and empty values", () => {
  assert.equal(parseDate("31/02/2026"), null);
  assert.equal(parseDate("32/01/2026"), null);
  assert.equal(parseDate("2026-13-01"), null);
  assert.equal(parseDate(""), null);
  assert.equal(parseDate(null), null);
  assert.equal(parseDate("Not applicable"), null);
  assert.equal(parseDate(12), null);
  assert.equal(parseDate("29/02/2024"), dayNum(2024, 2, 29));
  assert.equal(parseDate("29/02/2023"), null);
});

test("detects day-first or month-first from the values", () => {
  assert.deepEqual(detectDateOrder(["25/03/2024", "03/04/2024"]), { order: "dmy", ambiguous: true });
  assert.equal(detectDateOrder(["03/25/2024", "04/03/2024"]).order, "mdy");
  assert.equal(detectDateOrder(["03/04/2024"]).order, "dmy");
  assert.equal(detectDateOrder(["2024-03-04"]).ambiguous, false);
});

test("months and financial years", () => {
  const mar = monthOf(dayNum(2026, 3, 15));
  assert.equal(isoDate(monthStart(mar)), "2026-03-01");
  assert.equal(isoDate(monthEnd(mar)), "2026-03-31");
  assert.equal(isoDate(monthEnd(monthOf(dayNum(2024, 2, 1)))), "2024-02-29");
  assert.equal(fyStartYear(dayNum(2026, 3, 31)), 2025);
  assert.equal(fyStartYear(dayNum(2026, 4, 1)), 2026);
});
