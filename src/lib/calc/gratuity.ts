import { statNum } from "../../data/statutory.ts";
import { addDays, calendarDiff, parseISO } from "./working-days.ts";

/**
 * Gratuity under the Code on Social Security, 2020 (Chapter V).
 *
 *   Gratuity = last drawn monthly wages × 15 ÷ 26 × years counted, capped at the notified ceiling.
 *
 * - Eligibility uses completed years: 5 for most employees (s.53(1)); 1 year under
 *   the contract for fixed-term employees (IR Code s.2(o)(c)); none on death or disablement.
 * - Years counted for the amount add one year when the final part-year is more
 *   than six months (s.53(2)); that rounding never makes someone eligible.
 * - Not modelled (by design): 4 years 240 days, seasonal and piece-rated work,
 *   working journalists, fixed-term exits before expiry, forfeiture, interest and tax.
 */
export type EmploymentType = "permanent" | "fixed_term";
export type GratuityReason = "resignation" | "retirement" | "termination" | "death" | "disablement" | "contract_expiry";

export type GratuityInput = {
  /** Date of joining, ISO. */
  doj: string;
  /** Last working day, ISO, counted as a day of service. */
  lwd: string;
  /** Last drawn monthly wages as the Codes define them (basic + DA + other pay counted as wages). */
  wages: number;
  type: EmploymentType;
  reason: GratuityReason;
};

export type GratuityRules = {
  daysPerYear: number;
  divisor: number;
  minYears: number;
  fixedTermMinYears: number;
  partYearMonths: number;
  ceiling: number;
  paymentDays: number;
  continuousServiceDays: number;
  continuousServiceDaysShortWeek: number;
};

export type ServiceLength = { years: number; months: number; days: number };

export type GratuityResult = {
  /** "invalid": bad input; "not-covered": a case this calculator does not model. */
  status: "ok" | "invalid" | "not-covered";
  message?: string;
  service: ServiceLength;
  eligible: boolean;
  minYears: number;
  countedYears: number;
  perYear: number;
  uncapped: number;
  amount: number;
  capped: boolean;
  /** Last day to pay (30 days after the last working day), when payable. */
  payBy?: string;
  reasonText: string;
  /**
   * Set when a permanent employee is not eligible but is within a year of the line,
   * with at least NEAR_MISS_MONTHS of the final year served: courts have read
   * "continuous service" generously, so a flat "no" would mislead.
   */
  nearMiss?: string;
};

/** From this many months into the final year, show the near-miss caution. */
export const NEAR_MISS_MONTHS = 6;

export function gratuityRules(): GratuityRules {
  return {
    daysPerYear: statNum("gratuity.daysPerYear"),
    divisor: statNum("gratuity.divisor"),
    minYears: statNum("gratuity.minYears"),
    fixedTermMinYears: statNum("gratuity.fixedTermMinYears"),
    partYearMonths: statNum("gratuity.partYearMonths"),
    ceiling: statNum("gratuity.ceiling"),
    paymentDays: statNum("gratuity.paymentDays"),
    continuousServiceDays: statNum("gratuity.continuousServiceDays"),
    // s.54: 190 days below ground in a mine or where the establishment works less than six days a week.
    continuousServiceDaysShortWeek: 190
  };
}
/** Kept for older imports. */
export const defaultRules = gratuityRules;

/** Round half up to the nearest rupee (x.5 goes up), tolerant of floating-point noise. */
export const roundRupee = (x: number): number => Math.floor(x + 0.5 + 1e-9);

/** Years counted for the amount: completed years, plus one if the remainder is more than six months. */
export function yearsForAmount(s: ServiceLength, partYearMonths = 6): number {
  const extra = s.months > partYearMonths || (s.months === partYearMonths && s.days > 0) ? 1 : 0;
  return s.years + extra;
}

export function serviceLength(doj: string, lwd: string): ServiceLength {
  return calendarDiff(doj, addDays(lwd, 1));
}

const empty = (minYears: number): Omit<GratuityResult, "status" | "reasonText"> => ({
  service: { years: 0, months: 0, days: 0 },
  eligible: false,
  minYears,
  countedYears: 0,
  perYear: 0,
  uncapped: 0,
  amount: 0,
  capped: false
});

export function computeGratuity(i: GratuityInput, rules: GratuityRules = gratuityRules()): GratuityResult {
  const minYears = i.type === "fixed_term" ? rules.fixedTermMinYears : rules.minYears;
  const doj = parseISO(i.doj);
  const lwd = parseISO(i.lwd);
  if (doj === null || lwd === null) {
    return { ...empty(minYears), status: "invalid", message: "Enter the date of joining and the last working day.", reasonText: "" };
  }
  if (lwd < doj) {
    return { ...empty(minYears), status: "invalid", message: "The last working day is before the date of joining. Check the dates.", reasonText: "" };
  }
  if (!(i.wages > 0)) {
    return { ...empty(minYears), status: "invalid", message: "Enter the last drawn monthly wages to see the amount.", reasonText: "" };
  }
  const service = serviceLength(i.doj, i.lwd);
  if (i.type === "permanent" && i.reason === "contract_expiry") {
    return {
      ...empty(minYears),
      service,
      status: "not-covered",
      message: "Contract expiry applies to fixed-term employees. Choose fixed-term as the type of employment, or pick another reason.",
      reasonText: ""
    };
  }
  if (i.type === "fixed_term" && (i.reason === "resignation" || i.reason === "termination" || i.reason === "retirement")) {
    return {
      ...empty(minYears),
      service,
      status: "not-covered",
      message:
        "For fixed-term staff this calculator covers a contract that ends on expiry, or ends by death or disablement. How gratuity works when a fixed-term contract ends early is not settled; check with HR or an adviser.",
      reasonText: ""
    };
  }

  const deathOrDisablement = i.reason === "death" || i.reason === "disablement";
  const eligible = deathOrDisablement || service.years >= minYears;
  const countedYears = yearsForAmount(service, rules.partYearMonths);
  const perYear = (i.wages * rules.daysPerYear) / rules.divisor;
  const uncapped = perYear * countedYears;
  const amount = eligible ? Math.min(uncapped, rules.ceiling) : 0;
  const capped = eligible && uncapped > rules.ceiling;
  const served = `${service.years} year${service.years === 1 ? "" : "s"} and ${service.months} month${service.months === 1 ? "" : "s"}`;

  let reasonText: string;
  if (!eligible) {
    reasonText = `Not yet payable: ${served} of service; ${minYears} completed year${minYears === 1 ? "" : "s"} needed${i.type === "fixed_term" ? " under a fixed-term contract" : ""}.`;
  } else if (deathOrDisablement) {
    reasonText = `The ${minYears}-year condition does not apply on ${i.reason === "death" ? "death" : "disablement"}. ${i.reason === "death" ? "Paid to the nominee or legal heirs." : ""}`.trim();
  } else {
    reasonText = `Payable: ${served} of service meets the ${minYears}-year condition.`;
  }

  const nearMiss =
    !eligible && i.type === "permanent" && service.years === minYears - 1 && service.months >= NEAR_MISS_MONTHS
      ? `Close to the ${minYears}-year line. Under the old Payment of Gratuity Act, several High Courts counted ${minYears - 1} years plus at least ${rules.continuousServiceDays} days actually worked in the final year (${rules.continuousServiceDaysShortWeek} where the week is under six days) as ${minYears} years of continuous service. Whether that reading carries over to the Code on Social Security isn't settled. Ask HR or an adviser before giving up the claim.`
      : undefined;

  return {
    status: "ok",
    service,
    eligible,
    minYears,
    countedYears,
    perYear,
    uncapped,
    amount,
    capped,
    payBy: eligible && amount > 0 ? addDays(i.lwd, rules.paymentDays) : undefined,
    reasonText,
    ...(nearMiss ? { nearMiss } : {})
  };
}
