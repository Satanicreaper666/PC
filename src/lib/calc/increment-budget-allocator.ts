/**
 * Increment budget allocator: a merit matrix (rating × position in band)
 * checked against the increment budget.
 *
 *   Budget          = payroll × budget %
 *   Cost of matrix  = Σ cells: people in the cell × average salary × cell %
 *   Weighted average increase = cost ÷ payroll
 *   Fit factor      = budget % ÷ weighted average increase
 *
 * Simplifications, stated on the page:
 *  - everyone is costed at the average salary (payroll ÷ headcount);
 *  - the split by position in band is the same for every rating.
 * For exact costs, apply the matrix to each person's salary in a spreadsheet.
 */

export const RATINGS = ["Outstanding", "Exceeds expectations", "Meets expectations", "Below expectations", "Unsatisfactory"] as const;
export const ZONES = ["Below 0.90", "0.90 to 1.10", "Above 1.10"] as const;
export const ZONE_HELP = ["Compa-ratio below 0.90: low in the band", "Compa-ratio 0.90 to 1.10: around the midpoint", "Compa-ratio above 1.10: high in the band"] as const;

export type MeritInput = {
  /** Annual payroll (CTC) of the people in this review, ₹. */
  payroll: number;
  /** Increment budget as a % of that payroll. */
  budgetPct: number;
  /** People in each rating, best first (same order as RATINGS). */
  headcount: number[];
  /** % of people in each position-in-band zone (same order as ZONES); should add up to 100. */
  zoneMix: number[];
  /** Increase % for each rating (rows) and zone (columns). */
  matrix: number[][];
};

export type MeritRow = { rating: string; people: number; avgPct: number; cost: number };

export type MeritResult = {
  ok: boolean;
  message?: string;
  people: number;
  avgSalary: number;
  budget: number;
  cost: number;
  /** Cost − budget; positive means over budget. */
  difference: number;
  weightedPct: number;
  /** cost ÷ budget × 100 */
  usedPct: number;
  /** Multiply every cell by this to spend the budget exactly. */
  fitFactor: number;
  /** The matrix scaled by the fit factor, rounded to one decimal place. */
  fitted: number[][];
  rows: MeritRow[];
};

const ZERO: Omit<MeritResult, "ok" | "message"> = {
  people: 0,
  avgSalary: 0,
  budget: 0,
  cost: 0,
  difference: 0,
  weightedPct: 0,
  usedPct: 0,
  fitFactor: 1,
  fitted: [],
  rows: []
};

export function allocateIncrements(i: MeritInput): MeritResult {
  const fail = (message: string): MeritResult => ({ ok: false, message, ...ZERO });
  const headcount = i.headcount.map((h) => (Number.isFinite(h) ? Math.max(0, h) : 0));
  const mix = i.zoneMix.map((z) => (Number.isFinite(z) ? Math.max(0, z) : 0));
  const people = headcount.reduce((a, b) => a + b, 0);
  const mixTotal = mix.reduce((a, b) => a + b, 0);
  if (!(i.payroll > 0)) return fail("Enter the annual payroll of the people in this review.");
  if (!(i.budgetPct >= 0 && i.budgetPct <= 100)) return fail("Enter the increment budget as a percentage of payroll.");
  if (people <= 0) return fail("Enter how many people have each rating.");
  if (Math.abs(mixTotal - 100) > 0.5) return fail(`The three band positions add up to ${round1(mixTotal)}%. Make them add up to 100%.`);
  for (const row of i.matrix) for (const v of row) if (!(v >= 0 && v <= 100)) return fail("Each increase in the matrix should be between 0% and 100%.");

  const avgSalary = i.payroll / people;
  const budget = (i.payroll * i.budgetPct) / 100;
  const rows: MeritRow[] = RATINGS.map((rating, r) => {
    const avgPct = ZONES.reduce((a, _, z) => a + ((mix[z] / mixTotal) * (i.matrix[r]?.[z] ?? 0)), 0);
    return { rating, people: headcount[r] ?? 0, avgPct, cost: (headcount[r] ?? 0) * avgSalary * (avgPct / 100) };
  });
  const cost = rows.reduce((a, r) => a + r.cost, 0);
  const weightedPct = (cost / i.payroll) * 100;
  const fitFactor = weightedPct > 0 ? i.budgetPct / weightedPct : 1;
  return {
    ok: true,
    people,
    avgSalary,
    budget,
    cost,
    difference: cost - budget,
    weightedPct,
    usedPct: budget > 0 ? (cost / budget) * 100 : cost > 0 ? Infinity : 0,
    fitFactor,
    fitted: i.matrix.map((row) => row.map((v) => round1(v * fitFactor))),
    rows
  };
}

/** Weighted average increase of any matrix with the same people mix, in %. */
export function weightedIncrease(matrix: number[][], headcount: number[], zoneMix: number[]) {
  const people = headcount.reduce((a, b) => a + b, 0);
  const mixTotal = zoneMix.reduce((a, b) => a + b, 0);
  if (people <= 0 || mixTotal <= 0) return 0;
  let s = 0;
  matrix.forEach((row, r) => row.forEach((v, z) => (s += (headcount[r] ?? 0) * ((zoneMix[z] ?? 0) / mixTotal) * v)));
  return s / people;
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
