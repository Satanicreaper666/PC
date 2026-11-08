/**
 * iCalendar (.ics) files for calendar apps (Google Calendar, Outlook, Apple Calendar).
 * All-day events, optionally repeating monthly, with a reminder a few days before.
 * RFC 5545: CRLF line ends, lines folded at 75 octets, text escaped.
 */
export type IcsEvent = {
  /** Stable id, unique within the file, so re-importing updates instead of duplicating. */
  uid: string;
  /** yyyy-mm-dd */
  date: string;
  title: string;
  description?: string;
  /** Repeat monthly on the same day until this date (yyyy-mm-dd), inclusive. */
  monthlyUntil?: string;
  /** Days before to remind; default 5. 0 = no reminder. */
  remindDays?: number;
};

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = (d: string) => d.replace(/-/g, "");

function nextDay(d: string): string {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10);
}

/** Fold a content line at 75 octets (UTF-8), continuing with a space. */
export function fold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function toIcs(name: string, events: IcsEvent[], stamp = "20261108T000000Z"): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PeopleCraft//HR calendar//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(name)}`];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@peoplecraft`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(e.date)}`,
      `DTEND;VALUE=DATE:${ymd(nextDay(e.date))}`,
      `SUMMARY:${esc(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
      ...(e.monthlyUntil ? [`RRULE:FREQ=MONTHLY;UNTIL=${ymd(e.monthlyUntil)}`] : []),
      "TRANSP:TRANSPARENT"
    );
    const r = e.remindDays ?? 5;
    if (r > 0) lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(e.title)}`, `TRIGGER:-P${r}D`, "END:VALARM");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
