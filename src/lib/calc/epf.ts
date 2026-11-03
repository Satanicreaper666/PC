import { stat, statNum } from "../../data/statutory.ts";

/**
 * Monthly EPF, EPS, EDLI and admin amounts under the Code on Social Security
 * and the EPF, EPS and EDLI Schemes, 2026.
 *
 *   employee     = 12% of the PF base
 *   employer     = 12% of the PF base, of which EPS = 8.33% of wages up to the ceiling (members only)
 *   employer EPF = employer − EPS
 *   EDLI         = 0.5% of wages up to the ceiling (employer)
 *   admin        = 0.5% of the PF base (employer)
 *
 * The PF base is wages up to the ceiling ("restricted", the usual choice) or full
 * PF wages ("actual"; contributions above the ceiling are voluntary).
 * The ceiling is ₹25,000 from 17 Sep 2026 and ₹15,000 before.
 * Not modelled: the 10% rate categories, EPS eligibility rules, international workers, interest.
 */
export type EpfBasis = "restricted" | "actual";

export type EpfInput = {
  /** Monthly PF wages as the Code defines wages. */
  pfWages: number;
  /** Any date in the wage month (ISO); picks the wage ceiling. */
  date: string;
  /** Is the employee a member of the pension scheme (EPS)? Ask; do not infer. */
  epsMember: boolean;
  basis: EpfBasis;
  /** Already a PF member? New joiners above the ceiling need not join. */
  existingMember?: boolean;
};

export type EpfRules = {
  employeeRate: number;
  employerRate: number;
  epsRate: number;
  edliRate: number;
  adminRate: number;
  ceiling: number;
  ceilingBefore: number;
  ceilingFrom: string;
};

export type EpfResult = {
  ceiling: number;
  /** Wages contributions are worked out on. */
  base: number;
  employee: number;
  employerTotal: number;
  eps: number;
  employerEpf: number;
  edli: number;
  admin: number;
  /** Employer's total monthly cost: 12% + EDLI + admin. */
  employerCost: number;
  /** Credited to the PF account: employee share + employer EPF share. */
  toPfAccount: number;
  /** Employee + employer contributions (24% of the base). */
  totalContribution: number;
  /** PF wages above the ceiling on which contributions are voluntary. */
  aboveCeiling: number;
  /** A new joiner above the ceiling: membership is not mandatory. */
  excluded: boolean;
  /** The month of the ceiling change (September 2026) is split in two. */
  splitMonth: boolean;
};

export function epfRules(): EpfRules {
  return {
    employeeRate: statNum("epf.employeeRate"),
    employerRate: statNum("epf.employerRate"),
    epsRate: statNum("epf.epsRate"),
    edliRate: statNum("epf.edliRate"),
    adminRate: statNum("epf.adminRate"),
    ceiling: statNum("epf.wageCeiling"),
    ceilingBefore: statNum("epf.wageCeilingBefore"),
    ceilingFrom: stat("epf.wageCeiling").from ?? "1970-01-01"
  };
}

/** Round half up to the nearest rupee (x.5 goes up), tolerant of floating-point noise. */
export const roundHalfUp = (x: number): number => Math.floor(x + 0.5 + 1e-9);

/** rate% of an amount, worked in basis points so 8.33% of ₹25,000 is exactly ₹2,082.50. */
export const pctOf = (amount: number, ratePercent: number): number => (amount * Math.round(ratePercent * 100)) / 10000;

export function epfCeilingOn(date: string, r: EpfRules = epfRules()): number {
  return date >= r.ceilingFrom ? r.ceiling : r.ceilingBefore;
}

export function computeEpf(i: EpfInput, r: EpfRules = epfRules()): EpfResult {
  const P = Math.max(0, i.pfWages);
  const C = epfCeilingOn(i.date, r);
  const capped = Math.min(P, C);
  const base = i.basis === "actual" ? P : capped;
  const employee = roundHalfUp(pctOf(base, r.employeeRate));
  const employerTotal = roundHalfUp(pctOf(base, r.employerRate));
  const eps = i.epsMember ? roundHalfUp(pctOf(capped, r.epsRate)) : 0;
  const employerEpf = employerTotal - eps;
  const edli = roundHalfUp(pctOf(capped, r.edliRate));
  const admin = roundHalfUp(pctOf(base, r.adminRate));
  return {
    ceiling: C,
    base,
    employee,
    employerTotal,
    eps,
    employerEpf,
    edli,
    admin,
    employerCost: employerTotal + edli + admin,
    toPfAccount: employee + employerEpf,
    totalContribution: employee + employerTotal,
    aboveCeiling: Math.max(0, P - C),
    excluded: i.existingMember === false && P > C,
    splitMonth: i.date.slice(0, 7) === r.ceilingFrom.slice(0, 7)
  };
}
