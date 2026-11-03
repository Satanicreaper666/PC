import { stat, statNum } from "../../data/statutory.ts";
import { computeGratuity, gratuityRules, roundRupee } from "./gratuity.ts";
import type { EmploymentType, GratuityReason, GratuityResult } from "./gratuity.ts";
import { computeLeaveEncashment } from "./leave-encashment.ts";
import type { LeaveDivisor } from "./leave-encashment.ts";
import { addDays, addMonthsClamped, countWorkingDays, daysInMonth, nthWorkingDayAfter, parseISO, parts, toISO, dayNumber } from "./working-days.ts";
import type { WeeklyOff } from "./working-days.ts";

/**
 * Full and final (F&F) settlement: what is owed on exit, and by when.
 *
 * Amounts: salary for the final month's payable days + leave encashment
 * + gratuity (if payable) + amounts the user enters (notice pay in lieu, other dues)
 * − recoveries the user enters (notice shortfall as the contract works it out, loans, other).
 *
 * Due dates:
 * - wages: the 2nd working day after the last working day for resignation, removal,
 *   dismissal, retrenchment or closure (Code on Wages s.17(2)); otherwise the normal pay date.
 * - leave encashment for OSH "workers": 2 working days after discharge, dismissal or
 *   quitting; 2 calendar months after superannuation or death (OSH Code s.32(1)(vi)).
 * - gratuity: within 30 days of becoming payable (Code on Social Security s.56(3)).
 * Not modelled: notice buy-out arithmetic (contractual), bonus timelines, tax.
 */
export type SeparationType = "resignation" | "removal" | "dismissal" | "retrenchment" | "closure" | "superannuation" | "death" | "contract_expiry";
export type PayBasis = "calendar" | "30" | "26";

export const SEPARATION_LABELS: Record<SeparationType, string> = {
  resignation: "Resignation",
  removal: "Removal or termination",
  dismissal: "Dismissal for misconduct",
  retrenchment: "Retrenchment",
  closure: "Closure of the establishment",
  superannuation: "Retirement (superannuation)",
  death: "Death",
  contract_expiry: "Fixed-term contract ended"
};

export type FnfInput = {
  separation: SeparationType;
  employment: EmploymentType;
  /** An OSH Code "worker" (not managerial, administrative, or a supervisor above ₹18,000). */
  worker: boolean;
  doj: string;
  lwd: string;
  /** Monthly gross salary, for pay for the final month. */
  monthlyGross: number;
  /** Payable days in the final month; blank means work it out from the dates. */
  paidDays?: number | null;
  payBasis: PayBasis;
  /** Last drawn monthly wages as the Codes define them, for gratuity and leave. */
  wages: number;
  leaveDays: number;
  leaveDivisor: LeaveDivisor;
  noticePayInLieu: number;
  otherDues: number;
  noticeRecovery: number;
  loans: number;
  otherRecoveries: number;
  weeklyOff: WeeklyOff;
  holidays: string[];
};

export type DueDate = { date?: string; text: string; rule: string };

export type FnfResult = {
  status: "ok" | "invalid";
  message?: string;
  salary: { amount: number; days: number; divisor: number; defaulted: boolean };
  leave: { amount: number; dailyRate: number };
  gratuity: GratuityResult;
  gratuityAmount: number;
  dues: number;
  recoveries: number;
  net: number;
  due: { wages: DueDate; leave: DueDate; gratuity: DueDate };
};

const S17_TYPES: SeparationType[] = ["resignation", "removal", "dismissal", "retrenchment", "closure"];

export function gratuityReasonFor(s: SeparationType): GratuityReason {
  switch (s) {
    case "resignation":
      return "resignation";
    case "superannuation":
      return "retirement";
    case "death":
      return "death";
    case "contract_expiry":
      return "contract_expiry";
    default:
      return "termination";
  }
}

/** Payable days in the final month when the user leaves the field blank. */
export function defaultPaidDays(doj: string, lwd: string, basis: PayBasis, weeklyOff: WeeklyOff): number {
  const l = parseISO(lwd)!;
  const p = parts(l);
  const monthStart = dayNumber(p.y, p.m, 1);
  const from = Math.max(monthStart, parseISO(doj) ?? monthStart);
  if (basis === "26") {
    const c = countWorkingDays(toISO(from), lwd, weeklyOff, []);
    return Math.min(26, c.workingDays);
  }
  const days = l - from + 1;
  return basis === "30" ? Math.min(30, days) : days;
}

export function computeFnf(i: FnfInput): FnfResult {
  const g0 = computeGratuity({ doj: i.doj, lwd: i.lwd, wages: Math.max(i.wages, 1), type: i.employment, reason: gratuityReasonFor(i.separation) });
  const blank: FnfResult = {
    status: "invalid",
    salary: { amount: 0, days: 0, divisor: 0, defaulted: false },
    leave: { amount: 0, dailyRate: 0 },
    gratuity: g0,
    gratuityAmount: 0,
    dues: 0,
    recoveries: 0,
    net: 0,
    due: { wages: { text: "", rule: "" }, leave: { text: "", rule: "" }, gratuity: { text: "", rule: "" } }
  };
  const doj = parseISO(i.doj);
  const lwd = parseISO(i.lwd);
  if (doj === null || lwd === null) return { ...blank, message: "Enter the date of joining and the last working day." };
  if (lwd < doj) return { ...blank, message: "The last working day is before the date of joining. Check the dates." };
  if (!(i.monthlyGross > 0) && !(i.wages > 0)) return { ...blank, message: "Enter the monthly gross salary and wages to see the settlement." };

  // Final month's salary.
  const p = parts(lwd);
  const divisor = i.payBasis === "calendar" ? daysInMonth(p.y, p.m) : Number(i.payBasis);
  const defaulted = i.paidDays === null || i.paidDays === undefined || !(i.paidDays >= 0);
  const days = defaulted ? defaultPaidDays(i.doj, i.lwd, i.payBasis, i.weeklyOff) : Math.min(i.paidDays!, divisor);
  const salary = (Math.max(0, i.monthlyGross) / divisor) * days;

  // Leave encashment.
  const leave = computeLeaveEncashment({
    wages: i.wages,
    days: i.leaveDays,
    divisor: i.leaveDivisor,
    situation: i.separation === "superannuation" ? "retirement" : i.separation === "death" ? "death" : "leaving",
    worker: i.worker
  });

  // Gratuity.
  const gratuity = i.wages > 0 ? computeGratuity({ doj: i.doj, lwd: i.lwd, wages: i.wages, type: i.employment, reason: gratuityReasonFor(i.separation) }) : g0;
  const gratuityAmount = i.wages > 0 && gratuity.status === "ok" ? roundRupee(gratuity.amount) : 0;

  const salaryR = roundRupee(salary);
  const leaveR = roundRupee(leave.amount);
  const dues = salaryR + leaveR + gratuityAmount + Math.max(0, i.noticePayInLieu) + Math.max(0, i.otherDues);
  const recoveries = Math.max(0, i.noticeRecovery) + Math.max(0, i.loans) + Math.max(0, i.otherRecoveries);

  // Due dates.
  const wageDays = statNum("wages.separationPayDays");
  const wagesDue: DueDate = S17_TYPES.includes(i.separation)
    ? { date: nthWorkingDayAfter(i.lwd, wageDays, i.weeklyOff, i.holidays), text: `Within ${wageDays} working days of the last working day`, rule: "Code on Wages, 2019 s.17(2)" }
    : {
        text: `The two-working-day rule does not name this kind of exit; pay on the normal pay date (${stat("wages.monthlyPayDay").display} for monthly-paid staff) or sooner if policy says so`,
        rule: "Code on Wages, 2019 s.17(1)"
      };

  const exitDays = statNum("leave.exitPaymentWorkingDays");
  const exitMonths = statNum("leave.retirementPaymentMonths");
  let leaveDue: DueDate;
  if (!i.worker) {
    leaveDue = { text: "As the leave policy says; safest to pay with the final wages", rule: "Leave policy or state Shops and Establishments Act" };
  } else if (i.separation === "superannuation" || i.separation === "death") {
    leaveDue = { date: addMonthsClamped(i.lwd, exitMonths).date, text: `Within ${exitMonths} months`, rule: "OSH Code, 2020 s.32(1)(vi)" };
  } else {
    leaveDue = { date: nthWorkingDayAfter(i.lwd, exitDays, i.weeklyOff, i.holidays), text: `Within ${exitDays} working days`, rule: "OSH Code, 2020 s.32(1)(vi)" };
  }

  const gr = gratuityRules();
  const gratuityDue: DueDate =
    gratuityAmount > 0
      ? { date: addDays(i.lwd, gr.paymentDays), text: `Within ${gr.paymentDays} days of becoming payable`, rule: "Code on Social Security, 2020 s.56(3)" }
      : { text: "Not payable", rule: "Code on Social Security, 2020 s.53" };

  return {
    status: "ok",
    salary: { amount: salaryR, days, divisor, defaulted },
    leave: { amount: leaveR, dailyRate: leave.dailyRate },
    gratuity,
    gratuityAmount,
    dues,
    recoveries,
    net: dues - recoveries,
    due: { wages: wagesDue, leave: leaveDue, gratuity: gratuityDue }
  };
}
