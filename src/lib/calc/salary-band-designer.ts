/**
 * Salary band (grade) structure designer.
 *
 * Definitions used throughout (standard compensation practice):
 *   Range spread        = (maximum − minimum) ÷ minimum
 *   Midpoint            = (minimum + maximum) ÷ 2
 *   so  minimum         = midpoint ÷ (1 + spread ÷ 2)
 *       maximum         = minimum × (1 + spread)
 *   Midpoint progression = (next grade's midpoint − this midpoint) ÷ this midpoint
 *   Overlap with next   = (this maximum − next minimum) ÷ (this maximum − this minimum)
 *   Compa-ratio         = pay ÷ midpoint
 *   Range penetration   = (pay − minimum) ÷ (maximum − minimum)
 *
 * Spread can widen from the lowest grade to the highest (it is interpolated
 * in a straight line), because senior roles usually have wider ranges.
 */

export type BandInput = {
  /** Number of grades, 2–12. */
  grades: number;
  /** Midpoint of the lowest grade, ₹ a year. */
  firstMidpoint: number;
  /** Midpoint progression between neighbouring grades, % (e.g. 25). */
  progressionPct: number;
  /** Range spread of the lowest grade, % (e.g. 40). */
  spreadLowPct: number;
  /** Range spread of the highest grade, % (e.g. 60). */
  spreadHighPct: number;
};

export type Grade = {
  grade: number;
  min: number;
  mid: number;
  max: number;
  /** Range spread, % */
  spreadPct: number;
  /** Overlap with the next grade up, %; negative means a gap. null for the top grade. */
  overlapPct: number | null;
  /** ₹ gap between this maximum and the next minimum when the ranges do not overlap; else 0. */
  gapToNext: number;
};

export type BandResult = {
  ok: boolean;
  message?: string;
  grades: Grade[];
  lowest: number;
  highest: number;
};

export const LIMITS = { minGrades: 2, maxGrades: 12, maxSpreadPct: 200, maxProgressionPct: 100 };

export function designBands(i: BandInput): BandResult {
  const n = Math.floor(i.grades);
  const fail = (message: string): BandResult => ({ ok: false, message, grades: [], lowest: 0, highest: 0 });
  if (!(n >= LIMITS.minGrades && n <= LIMITS.maxGrades)) return fail(`Choose between ${LIMITS.minGrades} and ${LIMITS.maxGrades} grades.`);
  if (!(i.firstMidpoint > 0)) return fail("Enter the midpoint of the lowest grade.");
  if (!(i.progressionPct >= 0 && i.progressionPct <= LIMITS.maxProgressionPct)) return fail(`Midpoint progression should be between 0% and ${LIMITS.maxProgressionPct}%.`);
  for (const s of [i.spreadLowPct, i.spreadHighPct]) {
    if (!(s > 0 && s <= LIMITS.maxSpreadPct)) return fail(`Range spread should be more than 0% and at most ${LIMITS.maxSpreadPct}%.`);
  }

  const raw = Array.from({ length: n }, (_, k) => {
    const spreadPct = n === 1 ? i.spreadLowPct : i.spreadLowPct + ((i.spreadHighPct - i.spreadLowPct) * k) / (n - 1);
    const mid = i.firstMidpoint * Math.pow(1 + i.progressionPct / 100, k);
    const { min, max } = rangeFromMidpoint(mid, spreadPct);
    return { grade: k + 1, min, mid, max, spreadPct };
  });

  const grades: Grade[] = raw.map((g, k) => {
    const next = raw[k + 1];
    if (!next) return { ...g, overlapPct: null, gapToNext: 0 };
    const overlapPct = ((g.max - next.min) / (g.max - g.min)) * 100;
    return { ...g, overlapPct, gapToNext: next.min > g.max ? next.min - g.max : 0 };
  });

  return { ok: true, grades, lowest: grades[0].min, highest: grades[grades.length - 1].max };
}

/** Minimum and maximum for a midpoint and a range spread (max − min) ÷ min. */
export function rangeFromMidpoint(mid: number, spreadPct: number) {
  const s = spreadPct / 100;
  const min = mid / (1 + s / 2);
  return { min, max: min * (1 + s) };
}

export type PayCheck = {
  compaRatio: number;
  /** % of the way from minimum to maximum; below 0 or above 100 when outside the range. */
  penetrationPct: number;
  position: "below" | "lower" | "middle" | "upper" | "above";
  /** ₹ needed to reach the minimum (when below) or ₹ above the maximum (when above). */
  distance: number;
  text: string;
};

/** Where one person's pay sits in a grade. */
export function checkPay(g: Pick<Grade, "min" | "mid" | "max">, pay: number): PayCheck {
  const compaRatio = pay / g.mid;
  const penetrationPct = ((pay - g.min) / (g.max - g.min)) * 100;
  if (pay < g.min) return { compaRatio, penetrationPct, position: "below", distance: g.min - pay, text: "Below the minimum of the range" };
  if (pay > g.max) return { compaRatio, penetrationPct, position: "above", distance: pay - g.max, text: "Above the maximum of the range" };
  const position = penetrationPct < 100 / 3 ? "lower" : penetrationPct <= 200 / 3 ? "middle" : "upper";
  const text = { lower: "In the lower third of the range", middle: "In the middle third of the range", upper: "In the upper third of the range" }[position];
  return { compaRatio, penetrationPct, position, distance: 0, text };
}

/**
 * With the same spread S in two neighbouring grades and progression P,
 * overlap = 1 − P ÷ S. Shown on the page as a design rule of thumb.
 */
export function overlapForConstantSpread(progressionPct: number, spreadPct: number) {
  return (1 - progressionPct / spreadPct) * 100;
}

/**
 * "Nice" axis ticks for a range, in steps of 1, 2, 2.5 or 5 × 10^k.
 * The first tick is at or below `lo` and the last at or above `hi`.
 */
export function niceTicks(lo: number, hi: number, target = 5): number[] {
  if (!(hi > lo)) return [lo];
  const raw = (hi - lo) / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => (hi - lo) / s <= target + 1) ?? 10 * mag;
  const start = Math.floor(lo / step) * step;
  const ticks: number[] = [];
  for (let k = 0; k < 50; k++) {
    const v = start + k * step;
    ticks.push(Math.round(v * 1e6) / 1e6);
    if (v >= hi) break;
  }
  return ticks;
}
