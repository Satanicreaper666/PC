/**
 * Headcount planning model: a 12-month plan that adds new roles AND replaces
 * leavers, so the year ends at opening headcount + new roles.
 *
 * Each month m (1–12):
 *   Planned headcount H(m) = opening + new roles added so far (spread evenly, early or late)
 *   Expected leavers       = H(m − 1) × annual attrition % ÷ 12
 *   Joiners needed         = leavers (replacements) + new roles that month
 *   Payroll cost           = average headcount in the month × average CTC × (1 + extra cost %) ÷ 12
 *
 * Whole people: monthly figures are rounded from running totals so the
 * months always add up to the yearly total.
 *
 * Assumptions, stated on the page: every leaver is replaced; new joiners cost
 * the same as the current average; attrition is steady through the year.
 */

export type Timing = "even" | "early" | "late";

export type HeadcountInput = {
  opening: number;
  newRoles: number;
  attritionPct: number;
  avgCtc: number;
  /** Employer costs not already in CTC, as a % of CTC (often 0). */
  extraCostPct: number;
  /** Days from opening a role to the person joining. */
  leadDays: number;
  /** Typical notice period of leavers, days. */
  noticeDays: number;
  /** Revenue for the plan year, ₹ (optional). */
  revenue?: number;
  timing: Timing;
  /** 0 = January … 11 = December; the Indian financial year starts in April (3). */
  startMonth: number;
};

export type MonthRow = {
  label: string;
  opening: number;
  leavers: number;
  replacements: number;
  growth: number;
  joiners: number;
  closing: number;
  cost: number;
};

export type HeadcountResult = {
  ok: boolean;
  message?: string;
  months: MonthRow[];
  closing: number;
  leavers: number;
  growth: number;
  joiners: number;
  averageHeadcount: number;
  annualCost: number;
  revenuePerEmployee: number | null;
  /** Months between opening a role and the person joining (rounded up). */
  leadMonths: number;
  /** New roles that must be opened before the plan year starts to be filled on time. */
  rolesToOpenBeforeStart: number;
  /** Days a replacement seat stays empty on average: lead time − notice period, not below 0. */
  emptyDays: number;
  /** Average number of seats empty at any time while replacements are hired. */
  emptySeats: number;
  peakJoiners: number;
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_PER_MONTH = 365 / 12;

/** Weights for spreading new roles across 12 months. */
export function timingWeights(t: Timing): number[] {
  if (t === "early") return Array.from({ length: 12 }, (_, i) => 12 - i);
  if (t === "late") return Array.from({ length: 12 }, (_, i) => i + 1);
  return Array(12).fill(1);
}

/**
 * Split a total into 12 whole numbers by weight, rounding running totals
 * so the parts always add up to the total.
 */
export function spreadWhole(total: number, weights: number[]): number[] {
  const wsum = weights.reduce((a, b) => a + b, 0);
  let cum = 0;
  let prevRounded = 0;
  return weights.map((w) => {
    cum += (total * w) / wsum;
    const r = Math.round(cum + 1e-9);
    const part = r - prevRounded;
    prevRounded = r;
    return part;
  });
}

export function planHeadcount(i: HeadcountInput): HeadcountResult {
  const fail = (message: string): HeadcountResult => ({
    ok: false,
    message,
    months: [],
    closing: 0,
    leavers: 0,
    growth: 0,
    joiners: 0,
    averageHeadcount: 0,
    annualCost: 0,
    revenuePerEmployee: null,
    leadMonths: 0,
    rolesToOpenBeforeStart: 0,
    emptyDays: 0,
    emptySeats: 0,
    peakJoiners: 0
  });
  const opening = Math.floor(i.opening);
  const newRoles = Math.round(i.newRoles);
  if (!(opening >= 1)) return fail("Enter your current headcount (at least 1).");
  if (!(newRoles >= 0)) return fail("Enter the new roles to add (0 or more).");
  if (!(i.attritionPct >= 0 && i.attritionPct <= 100)) return fail("Attrition should be between 0% and 100%.");
  if (!(i.avgCtc >= 0)) return fail("Average CTC can't be negative.");
  if (!(i.extraCostPct >= 0 && i.extraCostPct <= 200)) return fail("Extra cost should be between 0% and 200% of CTC.");

  const growthByMonth = spreadWhole(newRoles, timingWeights(i.timing));
  const planned: number[] = [opening];
  growthByMonth.forEach((g, m) => planned.push(planned[m] + g));

  // Expected leavers on the planned path, then whole people from running totals.
  const monthlyRate = i.attritionPct / 100 / 12;
  const expected = growthByMonth.map((_, m) => planned[m] * monthlyRate);
  const totalExpected = expected.reduce((a, b) => a + b, 0);
  const leaversByMonth = totalExpected > 0 ? spreadWhole(totalExpected, expected) : Array<number>(12).fill(0);

  const loaded = (Math.max(0, i.avgCtc) * (1 + i.extraCostPct / 100)) / 12;
  const months: MonthRow[] = growthByMonth.map((growth, m) => {
    const leavers = leaversByMonth[m];
    return {
      label: MONTHS[(((i.startMonth % 12) + 12 + m) % 12)],
      opening: planned[m],
      leavers,
      replacements: leavers,
      growth,
      joiners: leavers + growth,
      closing: planned[m + 1],
      cost: ((planned[m] + planned[m + 1]) / 2) * loaded
    };
  });

  const averageHeadcount = months.reduce((a, r) => a + (r.opening + r.closing) / 2, 0) / 12;
  const leadMonths = Math.ceil(Math.max(0, i.leadDays) / DAYS_PER_MONTH - 1e-9);
  const rolesToOpenBeforeStart = months.slice(0, leadMonths).reduce((a, r) => a + r.growth, 0);
  const emptyDays = Math.max(0, Math.max(0, i.leadDays) - Math.max(0, i.noticeDays));
  const leavers = months.reduce((a, r) => a + r.leavers, 0);
  return {
    ok: true,
    months,
    closing: planned[12],
    leavers,
    growth: newRoles,
    joiners: months.reduce((a, r) => a + r.joiners, 0),
    averageHeadcount,
    annualCost: months.reduce((a, r) => a + r.cost, 0),
    revenuePerEmployee: i.revenue && i.revenue > 0 ? i.revenue / averageHeadcount : null,
    leadMonths,
    rolesToOpenBeforeStart,
    emptyDays,
    emptySeats: (totalExpected / 12) * (emptyDays / DAYS_PER_MONTH),
    peakJoiners: Math.max(...months.map((r) => r.joiners))
  };
}
