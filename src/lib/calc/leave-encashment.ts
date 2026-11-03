import { statNum } from "../../data/statutory.ts";

/**
 * Leave encashment: unused leave days × a day's wages.
 *
 *   day's wages = monthly wages ÷ 26 (working days) or ÷ 30 (calendar days)
 *
 * The OSH Code does not fix the divisor; it comes from the leave policy,
 * standing orders or practice, so the user chooses it. Payment timing for
 * OSH "workers" follows s.32(1)(vi): two working days after discharge,
 * dismissal or quitting; two months after superannuation or death.
 * Income tax is not computed.
 */
export type LeaveDivisor = 26 | 30;
export type LeaveSituation = "leaving" | "retirement" | "death" | "year_end";

export type LeaveInput = {
  /** Monthly wages as the Codes define them. */
  wages: number;
  /** Leave days to encash (half days allowed). */
  days: number;
  divisor: LeaveDivisor;
  situation: LeaveSituation;
  /** A "worker" under the OSH Code (not managerial, administrative, or a supervisor above ₹18,000). */
  worker: boolean;
};

export type LeaveResult = {
  dailyRate: number;
  amount: number;
  /** When to pay, in a sentence. */
  due: string;
  /** When to pay, in a few words. */
  dueShort: string;
};

export type LeaveAccrual = { eligible: boolean; earned: number; perDays: number; needed: number };

export function leaveRules() {
  return {
    eligibilityDays: statNum("leave.eligibilityDays"),
    accrualDays: statNum("leave.accrualDays"),
    accrualDaysAdolescent: statNum("leave.accrualDaysAdolescent"),
    carryForwardMax: statNum("leave.carryForwardMax"),
    exitWorkingDays: statNum("leave.exitPaymentWorkingDays"),
    retirementMonths: statNum("leave.retirementPaymentMonths")
  };
}

export function dueText(situation: LeaveSituation, worker: boolean, r = leaveRules()): string {
  if (!worker) return "As the leave policy or the state Shops and Establishments Act says; usually with the full and final settlement.";
  switch (situation) {
    case "leaving":
      return `Within ${r.exitWorkingDays} working days of leaving (OSH Code s.32).`;
    case "retirement":
    case "death":
      return `Within ${r.retirementMonths} months of ${situation === "death" ? "the death, to the nominee or heirs" : "superannuation"} (OSH Code s.32).`;
    case "year_end":
      return "At the end of the calendar year, when the worker asks for it (OSH Code s.32).";
  }
}

export function dueShort(situation: LeaveSituation, worker: boolean, r = leaveRules()): string {
  if (!worker) return "As the policy says";
  if (situation === "leaving") return `Within ${r.exitWorkingDays} working days`;
  if (situation === "year_end") return "When asked, at year end";
  return `Within ${r.retirementMonths} months`;
}

export function computeLeaveEncashment(i: LeaveInput, r = leaveRules()): LeaveResult {
  const dailyRate = Math.max(0, i.wages) / i.divisor;
  const amount = dailyRate * Math.max(0, i.days);
  return { dailyRate, amount, due: dueText(i.situation, i.worker, r), dueShort: dueShort(i.situation, i.worker, r) };
}

/** Annual leave earned in a calendar year under the OSH Code: 1 day for every 20 days worked, once 180 days are worked. */
export function leaveAccrual(daysWorked: number, adolescent = false, r = leaveRules()): LeaveAccrual {
  const perDays = adolescent ? r.accrualDaysAdolescent : r.accrualDays;
  const worked = Math.max(0, Math.floor(daysWorked));
  return { eligible: worked >= r.eligibilityDays, earned: Math.floor(worked / perDays), perDays, needed: r.eligibilityDays };
}
