import { statNum } from "../../data/statutory.ts";

/**
 * Statutory bonus under the Code on Wages, 2019 (Chapter IV).
 *
 *   eligible   = wages ≤ the bonus wage ceiling (₹21,000 a month, central sphere)
 *                and worked at least 30 days in the accounting year, and not disqualified
 *   bonus base = for each month worked, the lower of wages and the calculation ceiling
 *                (₹7,000 a month, or the minimum wage if that is higher)
 *   bonus      = base × rate (8.33% to 20%), and at least ₹100
 *   due        = within eight months of the end of the accounting year
 *
 * Not modelled: the allocable surplus that decides a rate above 8.33%, set-on and
 * set-off, the first five years' exemption for new establishments, and state notifications
 * that differ from the central sphere.
 */
export type BonusInput = {
  /** Monthly wages as the Code defines them (basic + DA and other pay not excluded). */
  wages: number;
  /** Monthly minimum wage that applies to the employee, if higher than the calculation ceiling. */
  minimumWage?: number;
  /** Months worked in the accounting year (fractions allowed). */
  months: number;
  /** Days worked in the year, for the 30-day test; defaults from months. */
  daysWorked?: number;
  ratePct: number;
  /** Dismissed for fraud, violence on the premises, theft or sabotage, or convicted of sexual harassment. */
  disqualified?: boolean;
  /** Last day of the accounting year (yyyy-mm-dd), for the due date. */
  yearEnd?: string;
};

export type BonusResult = {
  status: "ok" | "invalid";
  message?: string;
  eligible: boolean;
  reason?: string;
  wageCeiling: number;
  calcCeiling: number;
  monthlyBase: number;
  base: number;
  rate: number;
  bonus: number;
  minRate: number;
  maxRate: number;
  dueBy?: string;
};

export function bonusRules() {
  return {
    wageCeiling: statNum("bonus.wageCeiling"),
    calcCeiling: statNum("bonus.calcCeiling"),
    minRate: statNum("bonus.minRate"),
    maxRate: statNum("bonus.maxRate")
  };
}

function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, last));
  return t.toISOString().slice(0, 10);
}

export function computeBonus(i: BonusInput): BonusResult {
  const r = bonusRules();
  const calcCeiling = Math.max(r.calcCeiling, i.minimumWage ?? 0);
  const blank = { eligible: false, wageCeiling: r.wageCeiling, calcCeiling, monthlyBase: 0, base: 0, rate: i.ratePct, bonus: 0, minRate: r.minRate, maxRate: r.maxRate };
  if (!(i.wages > 0)) return { ...blank, status: "invalid", message: "Enter the monthly wages." };
  if (!(i.months > 0 && i.months <= 12)) return { ...blank, status: "invalid", message: "Enter the months worked in the accounting year, from 1 to 12." };
  if (!(i.ratePct >= r.minRate - 1e-9 && i.ratePct <= r.maxRate + 1e-9))
    return { ...blank, status: "invalid", message: `The bonus rate must be between ${r.minRate}% and ${r.maxRate}%.` };
  const dueBy = i.yearEnd ? addMonths(i.yearEnd, 8) : undefined;
  const days = i.daysWorked ?? i.months * 26;
  if (i.wages > r.wageCeiling) return { ...blank, status: "ok", dueBy, reason: "Wages are above the bonus wage ceiling, so statutory bonus doesn't apply." };
  if (days < 30) return { ...blank, status: "ok", dueBy, reason: "Fewer than 30 working days in the year, so no statutory bonus is due." };
  if (i.disqualified) return { ...blank, status: "ok", dueBy, reason: "Dismissed for one of the reasons the Code names, so the employee is disqualified from bonus for the year." };
  const monthlyBase = Math.min(i.wages, calcCeiling);
  const base = monthlyBase * i.months;
  const bonus = Math.max(100, Math.round((base * i.ratePct) / 100));
  return { status: "ok", eligible: true, wageCeiling: r.wageCeiling, calcCeiling, monthlyBase, base, rate: i.ratePct, bonus, minRate: r.minRate, maxRate: r.maxRate, dueBy };
}
