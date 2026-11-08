/**
 * Every figure on the people-analytics dashboard, worked out from clean
 * employee records. Pure functions: no DOM, no storage, no network.
 *
 * Conventions (also explained on the page):
 * - Headcount on a day = people who joined on or before that day and whose
 *   last working day is after it (so a leaver is not in the next day's count).
 * - Joiners / leavers in a period = joining date / last working day inside it.
 * - Closing headcount = opening headcount + joiners − leavers, month by month.
 * - Attrition rate = leavers ÷ ((opening + closing) ÷ 2) × 100, the method in
 *   SEBI's guidance for the Business Responsibility and Sustainability Report.
 */
import { dayNum, fyStartYear, monthEnd, monthOf, monthStart, type DayNum } from "./dates.ts";
import type { Gender } from "./fields.ts";
import { fyLabel, monthLabel } from "./format.ts";
import { groupOf, NOT_RECORDED, type Employee } from "./records.ts";

export type Filters = { dept: string; location: string; gender: Gender | "" };
export const NO_FILTERS: Filters = { dept: "", location: "", gender: "" };

export type Period = { id: string; label: string; start: DayNum; end: DayNum };

/** Longest custom range the monthly charts can show legibly. */
export const MAX_MONTHS = 36;
/** Pay figures are not shown for smaller groups, so no one's salary can be read off a chart. */
export const MIN_PAY_GROUP = 5;
const YEAR_DAYS = 365.25;

/* ---------- Who counts ---------- */

/**
 * A record can be placed in time when it has a joining date, does not leave
 * before it joins, and is not marked as left without a last working day.
 */
export function isCounted(e: Employee): boolean {
  if (e.doj === null) return false;
  if (e.doe !== null && e.doe < e.doj) return false;
  if (e.doe === null && e.statusSays === "left") return false;
  return true;
}

/** On the rolls at the end of `day`. */
export const onRolls = (e: Employee, day: DayNum) => e.doj !== null && e.doj <= day && (e.doe === null || e.doe > day);

export function matches(e: Employee, f: Filters): boolean {
  if (f.dept && groupOf(e.dept) !== f.dept) return false;
  if (f.location && groupOf(e.location) !== f.location) return false;
  if (f.gender && e.gender !== f.gender) return false;
  return true;
}

/* ---------- Rates ---------- */

/** Leavers ÷ average of opening and closing headcount × 100. null when there was no one to leave. */
export function attritionRate(leavers: number, opening: number, closing: number): number | null {
  const average = (opening + closing) / 2;
  return average > 0 ? (leavers / average) * 100 : null;
}

/** Months in a period; a part-month counts as the share of its days covered. */
export function monthsIn(start: DayNum, end: DayNum): number {
  let months = 0;
  for (let mi = monthOf(start); mi <= monthOf(end); mi++) {
    const s = Math.max(start, monthStart(mi));
    const e = Math.min(end, monthEnd(mi));
    months += (e - s + 1) / (monthEnd(mi) - monthStart(mi) + 1);
  }
  return months;
}

/** Scale a period's rate to 12 months, assuming leavers keep coming at the same pace. */
export const annualise = (rate: number | null, months: number) => (rate === null || months <= 0 ? null : (rate * 12) / months);

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Percentile with linear interpolation (Excel's PERCENTILE.INC). `sorted` must be ascending. */
export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return Number.NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/* ---------- Periods ---------- */

/** Period choices: last 12 complete months, this financial year so far, earlier financial years, last 24 months. */
export function periodPresets(todayN: DayNum, earliest: DayNum | null): Period[] {
  const cur = monthOf(todayN);
  const fy = fyStartYear(todayN);
  const list: Period[] = [
    { id: "l12", label: "Last 12 months", start: monthStart(cur - 12), end: monthEnd(cur - 1) },
    { id: "fytd", label: `This financial year so far (${fyLabel(fy)})`, start: dayNum(fy, 4, 1), end: todayN }
  ];
  const oldest = earliest === null ? fy - 1 : Math.min(fy - 1, Math.max(fyStartYear(earliest), fy - 5));
  for (let y = fy - 1; y >= oldest; y--) list.push({ id: `fy${y}`, label: fyLabel(y), start: dayNum(y, 4, 1), end: dayNum(y + 1, 3, 31) });
  list.push({ id: "l24", label: "Last 24 months", start: monthStart(cur - 24), end: monthEnd(cur - 1) });
  return list;
}

/** A custom range of whole months (the current month runs to today). At most MAX_MONTHS long. */
export function customPeriod(fromMonth: number, toMonth: number, todayN: DayNum): Period {
  let from = Math.min(fromMonth, toMonth);
  let to = Math.min(Math.max(fromMonth, toMonth), monthOf(todayN));
  from = Math.min(from, to);
  if (to - from + 1 > MAX_MONTHS) from = to - MAX_MONTHS + 1;
  return { id: "custom", label: from === to ? monthLabel(from) : `${monthLabel(from)} to ${monthLabel(to)}`, start: monthStart(from), end: Math.min(monthEnd(to), todayN) };
}

/** Earliest joining date and latest date that has already happened, for period choices and hints. */
export function dataRange(all: Employee[], todayN: DayNum): { earliest: DayNum | null; latest: DayNum | null } {
  let earliest: DayNum | null = null;
  let latest: DayNum | null = null;
  for (const e of all) {
    if (!isCounted(e) || e.doj === null) continue;
    if (earliest === null || e.doj < earliest) earliest = e.doj;
    for (const d of [e.doj, e.doe]) if (d !== null && d <= todayN && (latest === null || d > latest)) latest = d;
  }
  return { earliest, latest };
}

/** Values for the department and location filters, A to Z with "Not recorded" last. */
export function filterValues(all: Employee[], key: "dept" | "location"): string[] {
  const set = new Set(all.filter(isCounted).map((e) => groupOf(e[key])));
  return [...set].sort((a, b) => (a === NOT_RECORDED ? 1 : b === NOT_RECORDED ? -1 : a.localeCompare(b, "en-IN")));
}

/* ---------- The dashboard ---------- */

export type MonthRow = { month: number; start: DayNum; end: DayNum; opening: number; joiners: number; leavers: number; closing: number };
export type DeptRow = { name: string; opening: number; closing: number; average: number; leavers: number; rate: number | null };
export type Bin = { label: string; short: string; count: number; names?: string[] };
export type Manager = { key: string; name: string; dept: string; reports: number; onRolls: boolean };
export type PayStats = { min: number; p25: number; median: number; p75: number; max: number; mean: number };
export type PayGroup = { name: string; n: number; stats: PayStats | null };

export type Dashboard = {
  period: Period;
  months: number;
  /** People in scope (filters applied) who can be placed in time. */
  people: Employee[];
  /** In scope and on the rolls at the end of the period. */
  current: Employee[];
  opening: number;
  closing: number;
  joiners: number;
  leavers: number;
  average: number;
  rate: number | null;
  annualised: number | null;
  /** Leavers in the period who left within a year of joining. */
  earlyLeavers: number;
  monthly: MonthRow[];
  byDept: DeptRow[];
  tenure: { mean: number | null; median: number | null; bins: Bin[] };
  gender: Record<Gender, number>;
  span: { managers: Manager[]; bins: Bin[]; mean: number | null; median: number | null; widest: Manager | null; unresolved: number } | null;
  pay: { by: "dept" | "grade"; groups: PayGroup[] } | null;
};

export type DashboardOptions = { hasManager: boolean; hasSalary: boolean; payBy: "dept" | "grade" };

const TENURE_BINS: { label: string; short: string; min: number; max: number }[] = [
  { label: "Under 1 year", short: "Under 1", min: 0, max: 1 },
  { label: "1 to 2 years", short: "1–2", min: 1, max: 2 },
  { label: "2 to 3 years", short: "2–3", min: 2, max: 3 },
  { label: "3 to 5 years", short: "3–5", min: 3, max: 5 },
  { label: "5 to 10 years", short: "5–10", min: 5, max: 10 },
  { label: "10 years or more", short: "10+", min: 10, max: Infinity }
];

const SPAN_BINS: { label: string; short: string; min: number; max: number }[] = [
  { label: "1 direct report", short: "1", min: 1, max: 1 },
  { label: "2 direct reports", short: "2", min: 2, max: 2 },
  { label: "3 to 4 direct reports", short: "3–4", min: 3, max: 4 },
  { label: "5 to 7 direct reports", short: "5–7", min: 5, max: 7 },
  { label: "8 to 10 direct reports", short: "8–10", min: 8, max: 10 },
  { label: "11 or more direct reports", short: "11+", min: 11, max: Infinity }
];

/** Years of service on a day. */
export const tenureOn = (e: Employee, day: DayNum) => (e.doj === null ? 0 : Math.max(0, day - e.doj) / YEAR_DAYS);

export function computeDashboard(all: Employee[], period: Period, f: Filters, opt: DashboardOptions): Dashboard {
  const { start, end } = period;
  const people = all.filter((e) => isCounted(e) && matches(e, f));
  const current = people.filter((e) => onRolls(e, end));
  const opening = people.filter((e) => onRolls(e, start - 1)).length;
  const joinerList = people.filter((e) => e.doj! >= start && e.doj! <= end);
  const leaverList = people.filter((e) => e.doe !== null && e.doe >= start && e.doe <= end);
  const closing = current.length;
  const average = (opening + closing) / 2;
  const rate = attritionRate(leaverList.length, opening, closing);
  const months = monthsIn(start, end);

  /* Month by month: closing = opening + joiners − leavers. */
  const joinBy = new Map<number, number>();
  const leaveBy = new Map<number, number>();
  for (const e of joinerList) joinBy.set(monthOf(e.doj!), (joinBy.get(monthOf(e.doj!)) ?? 0) + 1);
  for (const e of leaverList) leaveBy.set(monthOf(e.doe!), (leaveBy.get(monthOf(e.doe!)) ?? 0) + 1);
  const monthly: MonthRow[] = [];
  let open = opening;
  for (let mi = monthOf(start); mi <= monthOf(end); mi++) {
    const j = joinBy.get(mi) ?? 0;
    const l = leaveBy.get(mi) ?? 0;
    monthly.push({ month: mi, start: Math.max(start, monthStart(mi)), end: Math.min(end, monthEnd(mi)), opening: open, joiners: j, leavers: l, closing: open + j - l });
    open += j - l;
  }

  /* Attrition by department. */
  const depts = new Map<string, DeptRow>();
  const dept = (name: string) => {
    let d = depts.get(name);
    if (!d) depts.set(name, (d = { name, opening: 0, closing: 0, average: 0, leavers: 0, rate: null }));
    return d;
  };
  for (const e of people) {
    const name = groupOf(e.dept);
    if (onRolls(e, start - 1)) dept(name).opening++;
    if (onRolls(e, end)) dept(name).closing++;
  }
  for (const e of leaverList) dept(groupOf(e.dept)).leavers++;
  const byDept = [...depts.values()]
    .map((d) => ({ ...d, average: (d.opening + d.closing) / 2, rate: attritionRate(d.leavers, d.opening, d.closing) }))
    .filter((d) => d.average > 0 || d.leavers > 0)
    .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.average - a.average || a.name.localeCompare(b.name));

  /* Tenure of people on the rolls at the end. */
  const tenures = current.map((e) => tenureOn(e, end));
  const tenureBins = TENURE_BINS.map((b) => ({ label: b.label, short: b.short, count: tenures.filter((t) => t >= b.min && t < b.max).length }));

  const gender: Record<Gender, number> = { women: 0, men: 0, other: 0, unknown: 0 };
  for (const e of current) gender[e.gender]++;

  return {
    period,
    months,
    people,
    current,
    opening,
    closing,
    joiners: joinerList.length,
    leavers: leaverList.length,
    average,
    rate,
    annualised: annualise(rate, months),
    earlyLeavers: leaverList.filter((e) => e.doe! - e.doj! < 365).length,
    monthly,
    byDept,
    tenure: { mean: mean(tenures), median: median(tenures), bins: tenureBins },
    gender,
    span: opt.hasManager ? spanOfControl(all, current, end) : null,
    pay: opt.hasSalary ? payGroups(current, opt.payBy) : null
  };
}

/* ---------- Span of control ---------- */

/**
 * Direct reports per manager among people on the rolls on `day`. The manager
 * column may hold an employee ID, "Name (ID)", "ID - Name" or a name.
 */
export function spanOfControl(all: Employee[], current: Employee[], day: DayNum): NonNullable<Dashboard["span"]> {
  const byId = new Map<string, Employee>();
  const byName = new Map<string, Employee[]>();
  for (const e of all) {
    if (e.id) {
      const k = e.id.toLowerCase();
      const prev = byId.get(k);
      // A reused ID: prefer the record that is on the rolls.
      if (!prev || (isCounted(e) && onRolls(e, day))) byId.set(k, e);
    }
    if (e.name) {
      const k = e.name.toLowerCase().replace(/\s+/g, " ");
      byName.set(k, [...(byName.get(k) ?? []), e]);
    }
  }
  const resolve = (v: string): Employee | null => {
    const k = v.trim().toLowerCase().replace(/\s+/g, " ");
    if (!k) return null;
    const direct = byId.get(k);
    if (direct) return direct;
    const inBrackets = k.match(/\(([^)]+)\)/)?.[1]?.trim();
    if (inBrackets && byId.has(inBrackets)) return byId.get(inBrackets)!;
    const leading = k.match(/^([^\s]+)\s*[-–:|]\s*\S/)?.[1];
    if (leading && byId.has(leading)) return byId.get(leading)!;
    const named = byName.get(k.replace(/\s*\([^)]*\)\s*/g, " ").trim());
    return named && named.length === 1 ? named[0] : null;
  };

  const managers = new Map<string, Manager>();
  let unresolved = 0;
  for (const p of current) {
    if (!p.manager) continue;
    const m = resolve(p.manager);
    if (m === p) continue; // listed as their own manager (common for the CEO)
    if (!m) unresolved++;
    const key = m ? `row:${m.row}` : `text:${p.manager.toLowerCase()}`;
    let entry = managers.get(key);
    if (!entry) {
      entry = { key, name: m ? m.name || m.id : p.manager, dept: m ? groupOf(m.dept) : NOT_RECORDED, reports: 0, onRolls: !!m && isCounted(m) && onRolls(m, day) };
      managers.set(key, entry);
    }
    entry.reports++;
  }
  const list = [...managers.values()].sort((a, b) => b.reports - a.reports || a.name.localeCompare(b.name));
  const counts = list.map((m) => m.reports);
  const bins = SPAN_BINS.map((b) => {
    const inBin = list.filter((m) => m.reports >= b.min && m.reports <= b.max);
    return { label: b.label, short: b.short, count: inBin.length, names: inBin.map((m) => m.name) };
  });
  const total = counts.reduce((a, b) => a + b, 0);
  return { managers: list, bins, mean: list.length ? total / list.length : null, median: median(counts), widest: list[0] ?? null, unresolved };
}

/* ---------- Pay spread ---------- */

export function payGroups(current: Employee[], by: "dept" | "grade"): NonNullable<Dashboard["pay"]> {
  const groups = new Map<string, number[]>();
  for (const e of current) {
    if (e.salary === null) continue;
    const k = groupOf(by === "grade" ? e.grade : e.dept);
    groups.set(k, [...(groups.get(k) ?? []), e.salary]);
  }
  const list: PayGroup[] = [...groups.entries()].map(([name, values]) => {
    const s = [...values].sort((a, b) => a - b);
    const stats =
      s.length >= MIN_PAY_GROUP
        ? { min: s[0], p25: percentile(s, 0.25), median: percentile(s, 0.5), p75: percentile(s, 0.75), max: s[s.length - 1], mean: mean(s)! }
        : null;
    return { name, n: s.length, stats };
  });
  list.sort((a, b) => (a.stats && b.stats ? b.stats.median - a.stats.median : a.stats ? -1 : b.stats ? 1 : a.name.localeCompare(b.name)));
  return { by, groups: list };
}
