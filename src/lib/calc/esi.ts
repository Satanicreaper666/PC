import { statNum } from "../../data/statutory.ts";

/**
 * ESI applicability and monthly contributions.
 *
 *   covered  = establishment covered and wages ≤ ₹21,000 (₹25,000 for a person with a disability)
 *   employee = 0.75% of wages, rounded up to the next rupee (nil if the average daily wage is ₹176 or less)
 *   employer = 3.25% of wages, rounded up to the next rupee
 *
 * Coverage is tested at the start of a contribution period (Apr–Sep, Oct–Mar) or on joining.
 * Not modelled: the employer-share relief for employees with disabilities, and benefits.
 */
export type EsiInput = {
  /** Monthly wages counted for ESI (the Code's definition of wages). */
  wages: number;
  /** Person with a disability (higher wage limit). */
  pwd: boolean;
  /** Establishment covered: 10 or more employees, or covered voluntarily. */
  establishmentCovered: boolean;
  /** Optional average daily wage, for the low-wage exemption. */
  avgDailyWage?: number | null;
};

export type EsiRules = { ceiling: number; ceilingPwd: number; employeeRate: number; employerRate: number; lowWage: number };

export type EsiResult = {
  ceiling: number;
  covered: boolean;
  /** Why not covered, when it is not. */
  reason?: "establishment" | "above-ceiling";
  employee: number;
  employer: number;
  total: number;
  lowWageExempt: boolean;
};

export function esiRules(): EsiRules {
  return {
    ceiling: statNum("esi.wageCeiling"),
    ceilingPwd: statNum("esi.wageCeilingPwd"),
    employeeRate: statNum("esi.employeeRate"),
    employerRate: statNum("esi.employerRate"),
    lowWage: statNum("esi.lowWageExemption")
  };
}

/** Round up to the next rupee, ignoring floating-point noise (150.0000000001 stays 150). */
export const ceilRupee = (x: number): number => Math.ceil(x - 1e-9);

/** rate% of an amount, worked in basis points to avoid floating-point drift. */
const pctOf = (amount: number, ratePercent: number): number => (amount * Math.round(ratePercent * 100)) / 10000;

export function computeEsi(i: EsiInput, r: EsiRules = esiRules()): EsiResult {
  const ceiling = i.pwd ? r.ceilingPwd : r.ceiling;
  const G = Math.max(0, i.wages);
  if (!i.establishmentCovered) return { ceiling, covered: false, reason: "establishment", employee: 0, employer: 0, total: 0, lowWageExempt: false };
  if (G > ceiling) return { ceiling, covered: false, reason: "above-ceiling", employee: 0, employer: 0, total: 0, lowWageExempt: false };
  const lowWageExempt = i.avgDailyWage != null && i.avgDailyWage > 0 && i.avgDailyWage <= r.lowWage;
  const employee = lowWageExempt ? 0 : ceilRupee(pctOf(G, r.employeeRate));
  const employer = ceilRupee(pctOf(G, r.employerRate));
  return { ceiling, covered: true, employee, employer, total: employee + employer, lowWageExempt };
}
