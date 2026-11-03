import { PT_STATES, ptState } from "../../data/statutory.ts";
import type { PtSchedule, PtSlab, PtState } from "../../data/statutory.ts";

/**
 * Professional tax on salary, by state, from the slabs in src/data/statutory.ts.
 * Monthly states return a 12-month schedule for the financial year (Karnataka and
 * Maharashtra charge more in February; West Bengal changed slabs from October 2026).
 * Tamil Nadu covers Greater Chennai Corporation only, on half-yearly salary.
 * Kerala, Goa and other Tamil Nadu local bodies are deliberately not computed.
 */
export type Gender = "woman" | "other";

export type PtMonth = { month: string; amount: number; slab: number };
export type PtRun = { from: string; to: string; months: number; amount: number };
export type PtYearResult = {
  status: "levied" | "none" | "not-covered" | "unknown";
  state?: PtState;
  basis?: "monthly" | "half-yearly";
  /** Monthly states: one entry per month, April to March. Half-yearly: two entries (April and October). */
  months: PtMonth[];
  runs: PtRun[];
  total: number;
  /** Half-yearly salary used (monthly × 6), for half-yearly states. */
  halfYearSalary?: number;
};

const inrNum = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export function scheduleFor(state: PtState, monthISO: string): PtSchedule | undefined {
  return state.schedules?.find((s) => (!s.from || monthISO >= s.from) && (!s.until || monthISO <= s.until));
}

export function slabIndex(slabs: PtSlab[], salary: number): number {
  let idx = 0;
  slabs.forEach((s, i) => {
    if (s.minInclusive ? salary >= s.min : salary > s.min) idx = i;
  });
  return idx;
}

/** "Up to ₹7,500", "Above ₹7,500 up to ₹10,000", "₹25,000 and above". */
export function slabLabel(slabs: PtSlab[], i: number): string {
  const s = slabs[i];
  const next = slabs[i + 1];
  if (i === 0) return next ? (next.minInclusive ? `Below ₹${inrNum(next.min)}` : `Up to ₹${inrNum(next.min)}`) : "Any salary";
  const from = s.minInclusive ? `₹${inrNum(s.min)}` : `Above ₹${inrNum(s.min)}`;
  if (!next) return s.minInclusive ? `${from} and above` : from;
  return `${from} ${next.minInclusive ? "to below" : "up to"} ₹${inrNum(next.min)}`;
}

function slabsFor(schedule: PtSchedule, gender: Gender): PtSlab[] {
  return gender === "woman" && schedule.women ? schedule.women : schedule.slabs;
}

/** Monthly professional tax for one month ("2026-11-01"). */
export function ptForMonth(code: string, salary: number, monthISO: string, gender: Gender = "other"): { amount: number; slab: number; slabs: PtSlab[] } | null {
  const st = ptState(code);
  if (!st || st.status !== "levied" || st.basis !== "monthly") return null;
  const sch = scheduleFor(st, monthISO);
  if (!sch) return null;
  const slabs = slabsFor(sch, gender);
  const i = slabIndex(slabs, Math.max(0, salary));
  const isFeb = monthISO.slice(5, 7) === "02";
  const amount = isFeb && slabs[i].february !== undefined ? slabs[i].february! : slabs[i].amount;
  return { amount, slab: i, slabs };
}

/** Half-yearly professional tax (Greater Chennai Corporation) on the half-year's salary. */
export function ptForHalfYear(code: string, halfYearSalary: number, halfStartISO: string): { amount: number; slab: number; slabs: PtSlab[] } | null {
  const st = ptState(code);
  if (!st || st.status !== "levied" || st.basis !== "half-yearly") return null;
  const sch = scheduleFor(st, halfStartISO);
  if (!sch) return null;
  const i = slabIndex(sch.slabs, Math.max(0, halfYearSalary));
  return { amount: sch.slabs[i].amount, slab: i, slabs: sch.slabs };
}

/** "2026-27" → 2026 */
export const fyStart = (fy: string): number => Number(fy.slice(0, 4));
export const fyMonths = (startYear: number): string[] =>
  Array.from({ length: 12 }, (_, k) => {
    const m = ((3 + k) % 12) + 1;
    const y = k < 9 ? startYear : startYear + 1;
    return `${y}-${String(m).padStart(2, "0")}-01`;
  });

function runsOf(months: PtMonth[], monthsEach = 1): PtRun[] {
  const runs: PtRun[] = [];
  for (const m of months) {
    const last = runs[runs.length - 1];
    if (last && last.amount === m.amount) {
      last.to = m.month;
      last.months += monthsEach;
    } else runs.push({ from: m.month, to: m.month, months: monthsEach, amount: m.amount });
  }
  return runs;
}

/** Professional tax for a financial year on a steady monthly salary. */
export function ptYear(code: string, monthlySalary: number, fyStartYear: number, gender: Gender = "other"): PtYearResult {
  const st = ptState(code);
  if (!st) return { status: "unknown", months: [], runs: [], total: 0 };
  if (st.status === "none") return { status: "none", state: st, months: [], runs: [], total: 0 };
  if (st.status !== "levied") return { status: "not-covered", state: st, months: [], runs: [], total: 0 };
  if (st.basis === "half-yearly") {
    const H = Math.max(0, monthlySalary) * 6;
    const halves = [`${fyStartYear}-04-01`, `${fyStartYear}-10-01`];
    const months: PtMonth[] = halves.map((h) => {
      const r = ptForHalfYear(code, H, h);
      return { month: h, amount: r?.amount ?? 0, slab: r?.slab ?? 0 };
    });
    return { status: "levied", state: st, basis: "half-yearly", months, runs: runsOf(months, 6), total: months.reduce((a, m) => a + m.amount, 0), halfYearSalary: H };
  }
  const months: PtMonth[] = fyMonths(fyStartYear).map((m) => {
    const r = ptForMonth(code, monthlySalary, m, gender);
    return { month: m, amount: r?.amount ?? 0, slab: r?.slab ?? 0 };
  });
  return { status: "levied", state: st, basis: "monthly", months, runs: runsOf(months), total: months.reduce((a, m) => a + m.amount, 0) };
}

/** States for the picker, in a sensible order, with "Another state" last. */
export const PT_PICKER: { value: string; label: string }[] = [
  ...PT_STATES.filter((s) => s.status === "levied").map((s) => ({ value: s.code, label: s.name })),
  ...PT_STATES.filter((s) => s.status === "none").map((s) => ({ value: s.code, label: `${s.name} (no professional tax)` })),
  ...PT_STATES.filter((s) => s.status === "not-covered").map((s) => ({ value: s.code, label: `${s.name} (not covered here)` })),
  { value: "OTHER", label: "Another state or union territory" }
];
