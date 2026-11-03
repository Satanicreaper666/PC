import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addMonthsClamped,
  calendarDiff,
  countWorkingDays,
  isWeeklyOff,
  nationalHolidays,
  nthWorkingDayAfter,
  parseHolidays,
  parseISO,
  weekdayName
} from "./working-days.ts";

test("weekday maths", () => {
  assert.equal(weekdayName("2026-11-02"), "Monday");
  assert.equal(weekdayName("2026-12-04"), "Friday");
  assert.equal(weekdayName("2027-01-31"), "Sunday");
  assert.equal(parseISO("2026-02-30"), null);
});

test("2nd and 4th Saturdays", () => {
  const sat = (iso: string) => isWeeklyOff(parseISO(iso)!, "sun_2_4_sat");
  assert.equal(sat("2026-11-07"), false); // 1st Saturday
  assert.equal(sat("2026-11-14"), true); // 2nd
  assert.equal(sat("2026-11-21"), false); // 3rd
  assert.equal(sat("2026-11-28"), true); // 4th
  assert.equal(isWeeklyOff(parseISO("2026-11-07")!, "sat_sun"), true);
  assert.equal(isWeeklyOff(parseISO("2026-11-07")!, "sun"), false);
});

test("page example: November 2026 with Sundays and 2nd/4th Saturdays off → 23 working days", () => {
  const r = countWorkingDays("2026-11-01", "2026-11-30", "sun_2_4_sat");
  assert.equal(r.calendarDays, 30);
  assert.equal(r.weeklyOffs, 7);
  assert.equal(r.workingDays, 23);
});

test("the three patterns over the same month", () => {
  assert.equal(countWorkingDays("2026-11-01", "2026-11-30", "sun").workingDays, 25);
  assert.equal(countWorkingDays("2026-11-01", "2026-11-30", "sat_sun").workingDays, 21);
});

test("a holiday on a weekly off is not counted twice", () => {
  const r = countWorkingDays("2026-11-01", "2026-11-30", "sun_2_4_sat", ["2026-11-08", "2026-11-09"]);
  assert.equal(r.holidays, 1);
  assert.equal(r.holidaysOnWeeklyOffs, 1);
  assert.equal(r.workingDays, 22);
});

test("a range across months is split by month; start and end are both counted", () => {
  const r = countWorkingDays("2026-12-28", "2027-01-03", "sat_sun", nationalHolidays(2026, 2027));
  assert.equal(r.calendarDays, 7);
  assert.equal(r.months.length, 2);
  assert.deepEqual(
    r.months.map((m) => [m.label, m.workingDays]),
    [
      ["Dec 2026", 4],
      ["Jan 2027", 1]
    ]
  );
  assert.equal(countWorkingDays("2026-11-02", "2026-11-02", "sun").workingDays, 1);
  assert.throws(() => countWorkingDays("2026-11-30", "2026-11-01", "sun"));
});

test("national holidays", () => {
  assert.deepEqual(nationalHolidays(2027, 2027), ["2027-01-26", "2027-08-15", "2027-10-02"]);
  const r = countWorkingDays("2027-01-25", "2027-01-27", "sun", nationalHolidays(2027, 2027));
  assert.equal(r.holidays, 1);
  assert.equal(r.workingDays, 2);
});

test("nth working day after: Fri 4 Dec 2026, Mon–Fri week → Tue 8 Dec 2026", () => {
  assert.equal(nthWorkingDayAfter("2026-12-04", 2, "sat_sun"), "2026-12-08");
  assert.equal(nthWorkingDayAfter("2026-12-04", 2, "sat_sun", ["2026-12-07"]), "2026-12-09");
  assert.equal(nthWorkingDayAfter("2026-12-04", 2, "sun"), "2026-12-07");
});

test("holiday parsing accepts common Indian formats", () => {
  const r = parseHolidays("2026-11-08\n8 Nov 2026 Diwali, 25/12/2026; 1 Sept 2026\n15.08.2027, 31/02/2026, holiday");
  assert.deepEqual(r.dates, ["2026-09-01", "2026-11-08", "2026-12-25", "2027-08-15"]);
  assert.deepEqual(r.invalid, ["31/02/2026", "holiday"]);
  assert.deepEqual(parseHolidays("").dates, []);
});

test("calendar difference and month clamping", () => {
  assert.deepEqual(calendarDiff("2019-04-01", "2026-11-01"), { years: 7, months: 7, days: 0 });
  assert.deepEqual(calendarDiff("2026-01-31", "2026-03-01"), { years: 0, months: 1, days: 1 });
  assert.deepEqual(addMonthsClamped("2026-08-31", 1), { date: "2026-09-30", clamped: true });
  assert.deepEqual(addMonthsClamped("2026-11-15", -12), { date: "2025-11-15", clamped: false });
});
