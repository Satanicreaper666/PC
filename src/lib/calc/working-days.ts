/**
 * Working days between two dates, with the weekly-off patterns Indian
 * offices use, plus holidays. Also the date helpers the notice-period and
 * full-and-final calculators share. Dates are ISO strings ("2026-11-02") and
 * all maths is done on whole UTC days, so time zones never shift a date.
 */

export type WeeklyOff = "sun" | "sun_2_4_sat" | "sat_sun";

export const WEEKLY_OFF_LABELS: Record<WeeklyOff, string> = {
  sun: "Sundays",
  sun_2_4_sat: "Sundays and 2nd and 4th Saturdays",
  sat_sun: "Saturdays and Sundays"
};

const DAY_MS = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ---------- Day numbers ---------- */
export function dayNumber(y: number, m: number, d: number): number {
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}
export function parts(day: number): { y: number; m: number; d: number } {
  const dt = new Date(day * DAY_MS);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}
/** "2026-11-02" → day number, or null when the text is not a real date. */
export function parseISO(s: string | null | undefined): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s ?? "").trim());
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  return dayNumber(y, mo, d);
}
export function toISO(day: number): string {
  const { y, m, d } = parts(day);
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(day: number): number {
  return (((day + 4) % 7) + 7) % 7; // 1 Jan 1970 was a Thursday
}
export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  if (d === null) throw new Error(`Bad date: ${iso}`);
  return toISO(d + n);
}
/** Add calendar months; a day that does not exist in the target month is clamped to its last day. */
export function addMonthsClamped(iso: string, n: number): { date: string; clamped: boolean } {
  const d = parseISO(iso);
  if (d === null) throw new Error(`Bad date: ${iso}`);
  const p = parts(d);
  const total = p.y * 12 + (p.m - 1) + n;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  const last = daysInMonth(y, m);
  return { date: toISO(dayNumber(y, m, Math.min(p.d, last))), clamped: p.d > last };
}
/**
 * Calendar difference from start (inclusive) to end (exclusive) in years, months and days.
 * Whole months are counted to the last monthly anniversary on or before the end; an
 * anniversary that falls on a missing day is the month's last day (31 Jan → 28 Feb,
 * and a 29 February joiner's anniversary is 28 February in other years).
 */
export function calendarDiff(startISO: string, endExclusiveISO: string): { years: number; months: number; days: number } {
  const s = parseISO(startISO);
  const e = parseISO(endExclusiveISO);
  if (s === null || e === null || e < s) return { years: 0, months: 0, days: 0 };
  const a = parts(s);
  const b = parts(e);
  let total = (b.y - a.y) * 12 + (b.m - a.m);
  let anchor = parseISO(addMonthsClamped(startISO, total).date)!;
  while (total > 0 && anchor > e) {
    total -= 1;
    anchor = parseISO(addMonthsClamped(startISO, total).date)!;
  }
  return { years: Math.floor(total / 12), months: total % 12, days: e - anchor };
}

/* ---------- Display ---------- */
export function longDate(iso: string): string {
  const d = parseISO(iso);
  if (d === null) return "";
  const p = parts(d);
  return `${WEEKDAYS[weekdayOf(d)].slice(0, 3)} ${p.d} ${MONTHS_LONG[p.m - 1]} ${p.y}`;
}
export function shortDate(iso: string): string {
  const d = parseISO(iso);
  if (d === null) return "";
  const p = parts(d);
  return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}
export function weekdayName(iso: string): string {
  const d = parseISO(iso);
  return d === null ? "" : WEEKDAYS[weekdayOf(d)];
}
export function monthLabel(y: number, m: number): string {
  return `${MONTHS[m - 1]} ${y}`;
}

/* ---------- Weekly offs and holidays ---------- */
export function isWeeklyOff(day: number, pattern: WeeklyOff): boolean {
  const wd = weekdayOf(day);
  if (wd === 0) return true;
  if (wd !== 6) return false;
  if (pattern === "sat_sun") return true;
  if (pattern === "sun_2_4_sat") {
    const dom = parts(day).d;
    return (dom >= 8 && dom <= 14) || (dom >= 22 && dom <= 28);
  }
  return false;
}

/** The three national holidays (26 January, 15 August, 2 October) for every year in a range. */
export function nationalHolidays(fromYear: number, toYear: number): string[] {
  const out: string[] = [];
  for (let y = fromYear; y <= toYear; y++) out.push(toISO(dayNumber(y, 1, 26)), toISO(dayNumber(y, 8, 15)), toISO(dayNumber(y, 10, 2)));
  return out;
}

const MONTH_INDEX: Record<string, number> = {};
MONTHS_LONG.forEach((name, i) => {
  MONTH_INDEX[name.toLowerCase()] = i + 1;
  MONTH_INDEX[name.slice(0, 3).toLowerCase()] = i + 1;
});
MONTH_INDEX.sept = 9;

/**
 * Reads holiday dates typed one per line or separated by commas.
 * Accepts 2026-11-08, 08/11/2026 (day first), 8-11-2026, 8 Nov 2026 and 8 November 2026,
 * with or without a name after the date ("8 Nov 2026 Diwali").
 */
export function parseHolidays(text: string): { dates: string[]; invalid: string[] } {
  const dates = new Set<string>();
  const invalid: string[] = [];
  const tokens = (text ?? "")
    .split(/[\n;,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  for (const t of tokens) {
    let day: number | null = null;
    let m: RegExpExecArray | null;
    if ((m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t))) day = safeDay(+m[1], +m[2], +m[3]);
    else if ((m = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(t))) day = safeDay(+m[3], +m[2], +m[1]);
    else if ((m = /(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})/.exec(t))) {
      const mo = MONTH_INDEX[m[2].toLowerCase()];
      day = mo ? safeDay(+m[3], mo, +m[1]) : null;
    }
    if (day === null) invalid.push(t);
    else dates.add(toISO(day));
  }
  return { dates: [...dates].sort(), invalid };
}
function safeDay(y: number, m: number, d: number): number | null {
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return dayNumber(y, m, d);
}

/* ---------- Counting ---------- */
export type MonthCount = { label: string; calendarDays: number; weeklyOffs: number; holidays: number; workingDays: number };
export type WorkingDaysResult = {
  calendarDays: number;
  weeklyOffs: number;
  /** Holidays that fall on days that would otherwise be working days. */
  holidays: number;
  /** Holidays in the range that already fall on a weekly off (not counted twice). */
  holidaysOnWeeklyOffs: number;
  workingDays: number;
  months: MonthCount[];
};

/** Counts days from start to end, both included. */
export function countWorkingDays(startISO: string, endISO: string, pattern: WeeklyOff, holidays: string[] = []): WorkingDaysResult {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  if (s === null || e === null) throw new Error("Bad date");
  if (e < s) throw new Error("End before start");
  const hol = new Set(holidays.map(parseISO).filter((d): d is number => d !== null));
  const res: WorkingDaysResult = { calendarDays: 0, weeklyOffs: 0, holidays: 0, holidaysOnWeeklyOffs: 0, workingDays: 0, months: [] };
  let cur: MonthCount | null = null;
  let curKey = "";
  for (let d = s; d <= e; d++) {
    const p = parts(d);
    const key = `${p.y}-${p.m}`;
    if (key !== curKey) {
      cur = { label: monthLabel(p.y, p.m), calendarDays: 0, weeklyOffs: 0, holidays: 0, workingDays: 0 };
      res.months.push(cur);
      curKey = key;
    }
    res.calendarDays++;
    cur!.calendarDays++;
    const off = isWeeklyOff(d, pattern);
    if (off) {
      res.weeklyOffs++;
      cur!.weeklyOffs++;
      if (hol.has(d)) res.holidaysOnWeeklyOffs++;
    } else if (hol.has(d)) {
      res.holidays++;
      cur!.holidays++;
    } else {
      res.workingDays++;
      cur!.workingDays++;
    }
  }
  return res;
}

/** The k-th working day strictly after a date (k = 2 gives "within two working days"). */
export function nthWorkingDayAfter(iso: string, k: number, pattern: WeeklyOff, holidays: string[] = []): string {
  const start = parseISO(iso);
  if (start === null) throw new Error(`Bad date: ${iso}`);
  const hol = new Set(holidays.map(parseISO).filter((d): d is number => d !== null));
  let found = 0;
  let d = start;
  for (let guard = 0; guard < 400; guard++) {
    d++;
    if (!isWeeklyOff(d, pattern) && !hol.has(d)) {
      found++;
      if (found >= k) return toISO(d);
    }
  }
  throw new Error("No working day found within 400 days");
}
