import { test } from "node:test";
import assert from "node:assert/strict";
import { fold, toIcs } from "./ics.ts";

test("all-day events, monthly repeats, reminders and escaping", () => {
  const ics = toIcs("HR, 2026-27", [
    { uid: "tds", date: "2026-05-07", title: "Deposit TDS; last month", monthlyUntil: "2027-03-07" },
    { uid: "bonus", date: "2026-11-30", title: "Pay statutory bonus", remindDays: 0 }
  ]);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.includes("X-WR-CALNAME:HR\\, 2026-27"));
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20260507\r\nDTEND;VALUE=DATE:20260508"));
  assert.ok(ics.includes("RRULE:FREQ=MONTHLY;UNTIL=20270307"));
  assert.ok(ics.includes("SUMMARY:Deposit TDS\; last month"));
  assert.equal(ics.match(/BEGIN:VALARM/g)?.length, 1);
  assert.ok(ics.includes("TRIGGER:-P5D"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
});

test("long lines fold at 75 octets", () => {
  const f = fold("DESCRIPTION:" + "₹".repeat(40));
  for (const l of f.split("\r\n")) assert.ok(new TextEncoder().encode(l).length <= 75);
  assert.equal(f.replace(/\r\n /g, ""), "DESCRIPTION:" + "₹".repeat(40));
});
