/**
 * Calendar dates for the people-analytics tool.
 *
 * Every date is a whole number of days since 1 January 1970 (a "day number"),
 * worked out in UTC, so a joining date never shifts by a day because of the
 * reader's time zone. Months are a running count: January 2026 is 2026 * 12 + 0.
 */
export type DayNum = number;
/** How to read an ambiguous date like 03/04/2025: day first (India) or month first (US). */
export type DateOrder = "dmy" | "mdy";

const MS_DAY = 86_400_000;

export const dayNum = (y: number, m: number, d: number): DayNum => Math.round(Date.UTC(y, m - 1, d) / MS_DAY);

export function ymd(n: DayNum): { y: number; m: number; d: number } {
  const dt = new Date(n * MS_DAY);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

const pad = (n: number) => String(n).padStart(2, "0");
export function isoDate(n: DayNum): string {
  const { y, m, d } = ymd(n);
  return `${y}-${pad(m)}-${pad(d)}`;
}

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export function monthOf(n: DayNum): number {
  const { y, m } = ymd(n);
  return y * 12 + (m - 1);
}
export const monthYear = (mi: number) => Math.floor(mi / 12);
export const monthNumber = (mi: number) => (mi % 12) + 1;
export const monthStart = (mi: number): DayNum => dayNum(monthYear(mi), monthNumber(mi), 1);
export const monthEnd = (mi: number): DayNum => monthStart(mi + 1) - 1;

/** Today in the reader's own calendar (not UTC), as a day number. */
export function today(now = new Date()): DayNum {
  return dayNum(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Indian financial year that contains a day: FY 2026-27 starts on 1 April 2026 → 2026. */
export function fyStartYear(n: DayNum): number {
  const { y, m } = ymd(n);
  return m >= 4 ? y : y - 1;
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6,
  jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12
};

function valid(y: number, m: number, d: number): DayNum | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return dayNum(y, m, d);
}

/** Two-digit years: 00–40 are 2000s, 41–99 are 1900s (fine for joining, exit and birth dates). */
const fullYear = (yy: number) => (yy >= 100 ? yy : yy <= 40 ? 2000 + yy : 1900 + yy);

/** Excel stores dates as serial numbers; serial 25569 is 1 January 1970. */
export function excelSerial(serial: number): DayNum | null {
  if (!Number.isFinite(serial) || serial < 10_000 || serial > 80_000) return null;
  return Math.floor(serial) - 25_569;
}

function fromNumber(n: number): DayNum | null {
  // 20260131 typed as a number
  if (Number.isInteger(n) && n >= 19_000_101 && n <= 21_001_231) return valid(Math.floor(n / 10_000), Math.floor(n / 100) % 100, n % 100);
  return excelSerial(n);
}

const TIME_TAIL = /[T\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?\s*(?:am|pm)?\s*(?:z|[+-]\d{2}:?\d{2})?$/i;

/**
 * Read a date from a spreadsheet cell. Accepts Excel dates and serial numbers,
 * 2026-01-31, 31/01/2026, 31-01-26, 31-Jan-2026, 31 January 2026 and Jan 31, 2026.
 * `order` decides ambiguous numeric dates such as 03/04/2025.
 */
export function parseDate(v: unknown, order: DateOrder = "dmy"): DayNum | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    // Spreadsheet dates have no time zone; nudge to midday so a value stored as
    // 18:30 UTC on the previous day (Indian midnight) lands on the right date.
    const t = new Date(v.getTime() + 12 * 3_600_000);
    return valid(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
  }
  if (typeof v === "number") return fromNumber(v);
  const s = String(v).trim().replace(TIME_TAIL, "").trim();
  if (!s) return null;
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/))) return valid(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/))) {
    const a = +m[1];
    const b = +m[2];
    const y = fullYear(+m[3]);
    return order === "mdy" ? valid(y, a, b) : valid(y, b, a);
  }
  if ((m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?[-/.\s]+([a-z]{3,9})\.?[-/.,\s]+(\d{2}|\d{4})$/i))) {
    const mo = MONTH_NAMES[m[2].toLowerCase()];
    return mo ? valid(fullYear(+m[3]), mo, +m[1]) : null;
  }
  if ((m = s.match(/^([a-z]{3,9})\.?[-/.\s]+(\d{1,2})(?:st|nd|rd|th)?,?[-/.\s]+(\d{4})$/i))) {
    const mo = MONTH_NAMES[m[1].toLowerCase()];
    return mo ? valid(+m[3], mo, +m[2]) : null;
  }
  if (/^\d{5}(?:\.\d+)?$/.test(s) || /^\d{8}$/.test(s)) return fromNumber(Number(s));
  return null;
}

/**
 * Guess whether numeric dates are day-first or month-first from the values in
 * a column. A value like 25/03/2024 can only be day-first; 03/25/2024 only
 * month-first. With no evidence either way we assume day-first, as Indian files are.
 */
export function detectDateOrder(values: unknown[]): { order: DateOrder; ambiguous: boolean } {
  let dmy = 0;
  let mdy = 0;
  let ambiguous = false;
  for (const v of values) {
    if (typeof v !== "string") continue;
    const m = v.trim().replace(TIME_TAIL, "").match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
    if (!m) continue;
    const a = +m[1];
    const b = +m[2];
    if (a > 12 && b <= 12) dmy++;
    else if (b > 12 && a <= 12) mdy++;
    else if (a <= 12 && b <= 12 && a !== b) ambiguous = true;
  }
  return { order: mdy > 0 && dmy === 0 ? "mdy" : "dmy", ambiguous: ambiguous || (dmy > 0 && mdy > 0) };
}
