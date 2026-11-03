/**
 * Attrition cost: what it costs to replace one person who leaves, from
 * costs you can estimate. Every assumption is an input.
 *
 *   Day's value   = annual CTC ÷ working days in a year
 *   Vacancy       = day's value × days the seat is empty × share of work not covered
 *   Hiring        = annual CTC × agency fee % + other hiring costs
 *   Time          = hours spent on hiring and handover × hourly cost of that time
 *   Onboarding    = induction, training and set-up costs
 *   Ramp-up       = monthly CTC × months to full productivity × (1 − average productivity while ramping up)
 *   Cost per leaver = vacancy + hiring + time + onboarding + ramp-up
 *   Yearly cost     = cost per leaver × leavers a year
 */

export type AttritionCostInput = {
  annualCtc: number;
  /** Working days in a year, e.g. about 250 for a five-day week. */
  workingDays: number;
  /** Working days between the leaver's last day and the new joiner's first day. */
  vacancyDays: number;
  /** % of the role's daily output lost while the seat is empty (not covered by others). */
  vacancyLossPct: number;
  /** Agency or search fee, % of annual CTC (0 if you hire directly). */
  agencyFeePct: number;
  /** Job ads, assessments, background checks and other direct hiring costs, ₹. */
  otherHiringCost: number;
  /** Hours managers, interviewers and HR spend on hiring and handover. */
  hours: number;
  /** Average hourly cost of those people, ₹. */
  hourlyCost: number;
  /** Induction, training, equipment and set-up, ₹. */
  onboardingCost: number;
  /** Months until the new joiner is fully productive. */
  rampMonths: number;
  /** Average productivity during ramp-up, % of a fully productive person. */
  rampProductivityPct: number;
  /** Optional: people who leave such roles in a year. */
  leaversPerYear?: number;
};

export type CostPart = { id: "vacancy" | "hiring" | "time" | "onboarding" | "ramp"; label: string; amount: number };

export type AttritionCostResult = {
  ok: boolean;
  message?: string;
  dailyValue: number;
  parts: CostPart[];
  total: number;
  /** total ÷ annual CTC */
  multipleOfCtc: number;
  /** total ÷ monthly CTC */
  monthsOfCtc: number;
  yearly: number | null;
};

export function attritionCost(i: AttritionCostInput): AttritionCostResult {
  const empty: AttritionCostResult = { ok: false, dailyValue: 0, parts: [], total: 0, multipleOfCtc: 0, monthsOfCtc: 0, yearly: null };
  if (!(i.annualCtc > 0)) return { ...empty, message: "Enter the annual CTC of the role." };
  if (!(i.workingDays >= 1 && i.workingDays <= 366)) return { ...empty, message: "Working days in a year should be between 1 and 366." };
  for (const [v, name] of [
    [i.vacancyLossPct, "Work not covered"],
    [i.agencyFeePct, "Agency fee"],
    [i.rampProductivityPct, "Productivity during ramp-up"]
  ] as const) {
    if (!(v >= 0 && v <= 100)) return { ...empty, message: `${name} should be between 0% and 100%.` };
  }
  const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
  const dailyValue = i.annualCtc / i.workingDays;
  const monthly = i.annualCtc / 12;
  const parts: CostPart[] = [
    { id: "vacancy", label: "Empty seat", amount: dailyValue * pos(i.vacancyDays) * (i.vacancyLossPct / 100) },
    { id: "hiring", label: "Hiring fees and costs", amount: (i.annualCtc * i.agencyFeePct) / 100 + pos(i.otherHiringCost) },
    { id: "time", label: "Interview and handover time", amount: pos(i.hours) * pos(i.hourlyCost) },
    { id: "onboarding", label: "Onboarding and training", amount: pos(i.onboardingCost) },
    { id: "ramp", label: "Ramp-up to full output", amount: monthly * pos(i.rampMonths) * (1 - i.rampProductivityPct / 100) }
  ];
  const total = parts.reduce((a, p) => a + p.amount, 0);
  const leavers = i.leaversPerYear && i.leaversPerYear > 0 ? i.leaversPerYear : 0;
  return {
    ok: true,
    dailyValue,
    parts,
    total,
    multipleOfCtc: total / i.annualCtc,
    monthsOfCtc: total / monthly,
    yearly: leavers > 0 ? total * leavers : null
  };
}
