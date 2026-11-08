import { statNum } from "../../data/statutory.ts";

/**
 * Income tax on salary for a resident individual, tax year 2026-27 (Income-tax Act, 2025).
 * An estimate for payroll and settlements, not a return.
 *
 *   taxable income = salary − standard deduction − other deductions (old regime only)
 *   tax            = slab tax − s.156 rebate (with marginal relief under the new regime)
 *                    + surcharge (with marginal relief) + 4% cess
 *
 * Slabs: new regime s.202(1); old regime as carried over (Budget 2026-27 changed neither).
 * Scalar values (standard deduction, rebate, cess) come from src/data/statutory.ts.
 * Not modelled: non-residents (no rebate), special-rate income, relief for arrears.
 */
export type Regime = "new" | "old";
/** Age at any time in the tax year; changes the old regime's nil band only. */
export type AgeBand = "below60" | "60to79" | "80plus";
export type Slab = { upTo: number; rate: number };

/** Checked against the TDS handbook's sources, 2 November 2026. */
export const TAX_YEAR = "2026-27";

export const NEW_SLABS: Slab[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: Infinity, rate: 30 }
];

export const OLD_SLABS: Record<AgeBand, Slab[]> = {
  below60: [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 5 },
    { upTo: 1000000, rate: 20 },
    { upTo: Infinity, rate: 30 }
  ],
  "60to79": [
    { upTo: 300000, rate: 0 },
    { upTo: 500000, rate: 5 },
    { upTo: 1000000, rate: 20 },
    { upTo: Infinity, rate: 30 }
  ],
  "80plus": [
    { upTo: 500000, rate: 0 },
    { upTo: 1000000, rate: 20 },
    { upTo: Infinity, rate: 30 }
  ]
};

/** Surcharge thresholds (income above) and rates; the new regime stops at 25%. */
const SURCHARGE: { above: number; rate: number }[] = [
  { above: 5000000, rate: 10 },
  { above: 10000000, rate: 15 },
  { above: 20000000, rate: 25 },
  { above: 50000000, rate: 37 }
];

export type TaxRules = {
  stdNew: number;
  stdOld: number;
  rebateLimitNew: number;
  rebateMaxNew: number;
  rebateLimitOld: number;
  rebateMaxOld: number;
  cess: number;
};

export function taxRules(): TaxRules {
  return {
    stdNew: statNum("tax.stdDeductionNew"),
    stdOld: statNum("tax.stdDeductionOld"),
    rebateLimitNew: statNum("tax.rebateLimitNew"),
    rebateMaxNew: statNum("tax.rebateMaxNew"),
    rebateLimitOld: statNum("tax.rebateLimitOld"),
    rebateMaxOld: statNum("tax.rebateMaxOld"),
    cess: statNum("tax.cess")
  };
}

export const roundRupee = (x: number): number => Math.floor(x + 0.5 + 1e-9);

export function slabsFor(regime: Regime, age: AgeBand = "below60"): Slab[] {
  return regime === "new" ? NEW_SLABS : OLD_SLABS[age];
}

/** Tax at slab rates, with the tax from each slab. */
export function slabTax(income: number, slabs: Slab[]): { total: number; parts: { from: number; to: number; rate: number; tax: number }[] } {
  let prev = 0;
  let total = 0;
  const parts: { from: number; to: number; rate: number; tax: number }[] = [];
  for (const s of slabs) {
    if (income <= prev) break;
    const top = Math.min(income, s.upTo);
    const tax = ((top - prev) * s.rate) / 100;
    if (top > prev) parts.push({ from: prev, to: top, rate: s.rate, tax });
    total += tax;
    prev = s.upTo;
  }
  return { total, parts };
}

export type TaxInput = {
  /** Taxable salary for the year, before the standard deduction. */
  salary: number;
  regime: Regime;
  age?: AgeBand;
  /** Old regime only: HRA exemption, professional tax and other deductions claimed. */
  deductions?: number;
  /** Other taxable income the employee declared (interest and the like). */
  otherIncome?: number;
  /** Non-residents get no rebate. Default true. */
  resident?: boolean;
};

export type TaxResult = {
  regime: Regime;
  salary: number;
  standardDeduction: number;
  deductions: number;
  taxableIncome: number;
  slabTax: number;
  slabParts: { from: number; to: number; rate: number; tax: number }[];
  rebate: number;
  /** New regime income just above the rebate limit: tax limited to the income above it. */
  marginalRelief: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRate: number;
  cess: number;
  /** Tax for the year, rounded to the rupee. */
  total: number;
};

function taxBeforeCess(income: number, regime: Regime, age: AgeBand, resident: boolean, r: TaxRules) {
  const slabs = slabsFor(regime, age);
  const st = slabTax(income, slabs);
  let rebate = 0;
  let relief = 0;
  if (resident) {
    if (regime === "new") {
      if (income <= r.rebateLimitNew) rebate = Math.min(st.total, r.rebateMaxNew);
      else {
        const over = income - r.rebateLimitNew;
        if (st.total > over) relief = st.total - over;
      }
    } else if (income <= r.rebateLimitOld) rebate = Math.min(st.total, r.rebateMaxOld);
  }
  const after = Math.max(0, st.total - rebate - relief);
  return { st, rebate, relief, after };
}

function surchargeOf(income: number, tax: number, regime: Regime, age: AgeBand, resident: boolean, r: TaxRules): { amount: number; rate: number } {
  const bands = SURCHARGE.filter((b) => regime === "old" || b.rate <= 25);
  const band = [...bands].reverse().find((b) => income > b.above);
  if (!band) return { amount: 0, rate: 0 };
  const full = (tax * band.rate) / 100;
  // Marginal relief: tax + surcharge may not exceed the tax + surcharge at the threshold
  // plus the income above the threshold.
  const lower = [...bands].reverse().find((b) => b.above < band.above);
  const atT = taxBeforeCess(band.above, regime, age, resident, r).after;
  const capAtT = atT + (lower ? (atT * lower.rate) / 100 : 0);
  const limit = capAtT + (income - band.above) - tax;
  return { amount: Math.max(0, Math.min(full, limit)), rate: band.rate };
}

export function computeIncomeTax(i: TaxInput, r: TaxRules = taxRules()): TaxResult {
  const age = i.age ?? "below60";
  const resident = i.resident !== false;
  const salary = Math.max(0, i.salary);
  const std = Math.min(salary, i.regime === "new" ? r.stdNew : r.stdOld);
  const deductions = i.regime === "old" ? Math.max(0, i.deductions ?? 0) : 0;
  const taxableIncome = Math.max(0, salary - std - deductions + Math.max(0, i.otherIncome ?? 0));
  const b = taxBeforeCess(taxableIncome, i.regime, age, resident, r);
  const sc = surchargeOf(taxableIncome, b.after, i.regime, age, resident, r);
  const cess = ((b.after + sc.amount) * r.cess) / 100;
  return {
    regime: i.regime,
    salary,
    standardDeduction: std,
    deductions,
    taxableIncome,
    slabTax: b.st.total,
    slabParts: b.st.parts,
    rebate: b.rebate,
    marginalRelief: b.relief,
    taxAfterRebate: b.after,
    surcharge: sc.amount,
    surchargeRate: sc.rate,
    cess,
    total: roundRupee(b.after + sc.amount + cess)
  };
}

/* ---------- Old regime: HRA exemption and Form 124 deductions ---------- */

/** Cities where the HRA limit is 50% of salary from 1 April 2026 (Income-tax Rules, 2026, rule 279). */
export const HRA_50_CITIES = ["Mumbai", "Delhi", "Kolkata", "Chennai", "Bengaluru", "Hyderabad", "Pune", "Ahmedabad"];

/** Exempt HRA: the least of HRA received, rent − 10% of salary, and 50% (listed cities) or 40% of salary. Salary = basic + DA. All annual. */
export function hraExemption(i: { salary: number; hra: number; rent: number; city50: boolean }): { exempt: number; parts: [number, number, number] } {
  const a = Math.max(0, i.hra);
  const b = Math.max(0, i.rent - 0.1 * Math.max(0, i.salary));
  const c = (i.city50 ? 0.5 : 0.4) * Math.max(0, i.salary);
  return { exempt: Math.min(a, b, c), parts: [a, b, c] };
}

/** Caps the calculator applies to old-regime claims (as carried over to the 2025 Act). */
export const OLD_CAPS = { investments: 150000, homeLoanInterest: 200000 };

export type RegimeInput = {
  /** Gross taxable salary for the year: everything paid, before standard deduction; leave out employer PF and a gratuity provision. */
  salary: number;
  /** Basic + DA for the year, for the HRA and employer NPS limits. */
  basic?: number;
  /** Employer's NPS contribution for the year (already outside the salary figure). */
  employerNps?: number;
  otherIncome?: number;
  age?: AgeBand;
  resident?: boolean;
  /** Old regime claims, all annual. */
  hra?: number;
  rent?: number;
  city50?: boolean;
  investments?: number;
  health?: number;
  homeLoanInterest?: number;
  professionalTax?: number;
  otherDeductions?: number;
};

export type RegimeResult = {
  regime: Regime;
  tax: TaxResult;
  /** Employer NPS above the regime's limit, added to taxable salary. */
  npsExcess: number;
  deductionsUsed: { hra: number; investments: number; health: number; homeLoan: number; pt: number; other: number; total: number };
};

/** Employer NPS deduction limit: 14% of basic + DA in the new regime, 10% in the old (non-government employers). */
const NPS_LIMIT: Record<Regime, number> = { new: 0.14, old: 0.1 };

export function taxUnder(regime: Regime, i: RegimeInput, r: TaxRules = taxRules()): RegimeResult {
  const basic = Math.max(0, i.basic ?? 0);
  const nps = Math.max(0, i.employerNps ?? 0);
  const npsExcess = nps > 0 ? Math.max(0, Math.round(nps - NPS_LIMIT[regime] * basic)) : 0;
  const zero = { hra: 0, investments: 0, health: 0, homeLoan: 0, pt: 0, other: 0, total: 0 };
  let used = zero;
  if (regime === "old") {
    const hra = i.hra && i.rent ? hraExemption({ salary: basic, hra: i.hra, rent: i.rent, city50: !!i.city50 }).exempt : 0;
    const investments = Math.min(Math.max(0, i.investments ?? 0), OLD_CAPS.investments);
    const homeLoan = Math.min(Math.max(0, i.homeLoanInterest ?? 0), OLD_CAPS.homeLoanInterest);
    const health = Math.max(0, i.health ?? 0);
    const pt = Math.max(0, i.professionalTax ?? 0);
    const other = Math.max(0, i.otherDeductions ?? 0);
    used = { hra, investments, health, homeLoan, pt, other, total: hra + investments + health + homeLoan + pt + other };
  }
  const tax = computeIncomeTax(
    { salary: Math.max(0, i.salary) + npsExcess, regime, age: i.age, deductions: used.total, otherIncome: i.otherIncome, resident: i.resident },
    r
  );
  return { regime, tax, npsExcess, deductionsUsed: used };
}

/**
 * Old-regime deductions (beyond the standard deduction) at which both regimes cost the
 * same, for this salary. Below it the new regime is cheaper. Null if the old regime
 * can't win, or the new regime is already nil.
 */
export function breakEvenDeductions(i: RegimeInput, r: TaxRules = taxRules()): number | null {
  const target = taxUnder("new", i, r).tax.total;
  if (target === 0) return null;
  const at = (d: number) => computeIncomeTax({ salary: Math.max(0, i.salary), regime: "old", age: i.age, deductions: d, otherIncome: i.otherIncome, resident: i.resident }, r).total;
  let lo = 0;
  let hi = Math.max(0, i.salary) + Math.max(0, i.otherIncome ?? 0);
  if (at(lo) <= target) return 0;
  if (at(hi) > target) return null;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (at(mid) > target) lo = mid;
    else hi = mid;
  }
  return Math.ceil(hi / 100) * 100;
}
