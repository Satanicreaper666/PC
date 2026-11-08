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
