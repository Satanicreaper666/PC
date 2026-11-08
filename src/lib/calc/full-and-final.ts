import { ptState, stat, statNum } from "../../data/statutory.ts";
import { computeEpf } from "./epf.ts";
import { ceilRupee, esiRules } from "./esi.ts";
import { computeGratuity, gratuityRules, roundRupee, serviceLength, yearsForAmount } from "./gratuity.ts";
import { computeIncomeTax } from "./income-tax.ts";
import type { AgeBand, Regime, TaxResult } from "./income-tax.ts";
import { ptForMonth } from "./professional-tax.ts";
import type { Gender } from "./professional-tax.ts";
import type { EmploymentType, GratuityReason, GratuityResult } from "./gratuity.ts";
import { computeLeaveEncashment } from "./leave-encashment.ts";
import type { LeaveDivisor } from "./leave-encashment.ts";
import { addDays, addMonthsClamped, countWorkingDays, daysInMonth, nthWorkingDayAfter, parseISO, parts, toISO, dayNumber } from "./working-days.ts";
import type { WeeklyOff } from "./working-days.ts";

/**
 * Full and final (F&F) settlement: what is owed on exit, and by when.
 *
 * Amounts: salary for the final month's payable days + leave encashment
 * + gratuity (if payable) + retrenchment or closure compensation for a 'worker'
 * + amounts the user enters (notice pay in lieu, severance, other dues)
 * − deductions from the final pay (employee PF, ESI, professional tax, TDS estimate)
 * − recoveries the user enters (notice shortfall as the contract works it out, loans, other).
 *
 * Retrenchment or closure compensation (Industrial Relations Code s.70(b), s.75): 15 days'
 * average pay for every completed year of continuous service and any part over six months,
 * for a worker with at least a year's service. Closure for unavoidable reasons caps it at
 * three months' average pay. The employer also pays 15 days' last drawn wages into the
 * worker re-skilling fund (s.83); that is shown, not added to the settlement.
 *
 * TDS (estimate): the year's tax on salary already paid this tax year plus the taxable
 * part of the settlement, less TDS already deducted (Income-tax Act, 2025 s.392). Exempt
 * parts use the reported limits in statutory.ts: gratuity, leave encashment on leaving,
 * and a worker's retrenchment compensation (least of the amount, the 15-days formula and
 * the notified limit). Severance for anyone else is taxable salary.
 *
 * Due dates:
 * - wages: the 2nd working day after the last working day for resignation, removal,
 *   dismissal, retrenchment or closure (Code on Wages s.17(2)); otherwise the normal pay date.
 * - leave encashment for OSH "workers": 2 working days after discharge, dismissal or
 *   quitting; 2 calendar months after superannuation or death (OSH Code s.32(1)(vi)).
 * - gratuity: within 30 days of becoming payable (Code on Social Security s.56(3)).
 * Not modelled: notice buy-out arithmetic (contractual), bonus timelines, relief for
 * arrears or compensation, schemes approved by the Central Government, half-yearly
 * professional tax, PF or ESI on anything but the final month's pay.
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
  /** Severance or ex gratia paid beyond what the law requires. */
  severance?: number;
  /** Closure because of unavoidable circumstances beyond the employer's control (caps compensation). */
  closureUnavoidable?: boolean;
  /** Employee PF on the final month's wages: on wages up to the ceiling, on actual wages, or none. */
  pf?: "restricted" | "actual" | "none";
  /** The employee is covered by ESI in this contribution period. */
  esi?: boolean;
  /** Professional-tax state code (PT_STATES), or "" for none. */
  ptState?: string;
  gender?: Gender;
  /** Income tax estimate; leave out for none. */
  tax?: FnfTaxInput | null;
};

export type FnfTaxInput = {
  regime: Regime;
  age?: AgeBand;
  /** Taxable salary paid this tax year before the final month; null = monthly gross × earlier months. */
  salaryBefore?: number | null;
  /** TDS deducted this tax year before the settlement; null = spread evenly on a 12-month projection. */
  tdsBefore?: number | null;
  /** Old regime only: HRA exemption, PT paid earlier, PF and other deductions for the year. */
  deductions?: number;
  /** Other income the employee declared for the year. */
  otherIncome?: number;
};

export type FnfTax = {
  months: number;
  salaryBefore: number;
  salaryBeforeDefaulted: boolean;
  tdsBefore: number;
  tdsBeforeDefaulted: boolean;
  /** Taxable part of each settlement item. */
  taxable: { salary: number; lieu: number; other: number; leave: number; gratuity: number; compensation: number; severance: number };
  exempt: { leave: number; gratuity: number; compensation: number };
  settlementTaxable: number;
  year: TaxResult;
  /** TDS to deduct now. */
  tds: number;
  /** Deducted earlier than the year's tax: claimed back in the return, not refunded by the employer. */
  excess: number;
};

export type DueDate = { date?: string; text: string; rule: string };

export type FnfResult = {
  status: "ok" | "invalid";
  message?: string;
  salary: { amount: number; days: number; divisor: number; defaulted: boolean };
  leave: { amount: number; dailyRate: number };
  gratuity: GratuityResult;
  gratuityAmount: number;
  compensation: {
    applies: boolean;
    /** Why there is none, when it doesn't apply to this exit. */
    reason?: "not-retrenchment" | "not-worker" | "under-a-year" | "no-wages";
    years: number;
    dailyRate: number;
    /** 15 days' average pay × years, before any closure cap. */
    formula: number;
    amount: number;
    capped: boolean;
  };
  severance: number;
  /** Employer's payment to the worker re-skilling fund; not part of the settlement. */
  reskilling: number;
  statutory: { pf: number; pfBase: number; esi: number; pt: number; ptNote?: string };
  tax: FnfTax | null;
  dues: number;
  /** PF, ESI, PT and TDS taken from the settlement. */
  deductions: number;
  recoveries: number;
  net: number;
  due: { wages: DueDate; leave: DueDate; gratuity: DueDate; compensation?: DueDate };
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
    compensation: { applies: false, years: 0, dailyRate: 0, formula: 0, amount: 0, capped: false },
    severance: 0,
    reskilling: 0,
    statutory: { pf: 0, pfBase: 0, esi: 0, pt: 0 },
    tax: null,
    dues: 0,
    deductions: 0,
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

  // Retrenchment or closure compensation, for a worker with a year's service.
  const service = serviceLength(i.doj, i.lwd);
  const compYears = yearsForAmount(service, statNum("gratuity.partYearMonths"));
  const dailyRate = Math.max(0, i.wages) / i.leaveDivisor;
  const compDays = statNum("notice.retrenchmentCompensationDays");
  const isRetrench = i.separation === "retrenchment" || i.separation === "closure";
  const compReason = !isRetrench ? "not-retrenchment" : !i.worker ? "not-worker" : service.years < 1 ? "under-a-year" : !(i.wages > 0) ? "no-wages" : undefined;
  const formula = compReason ? 0 : roundRupee(dailyRate * compDays * compYears);
  const cap = i.separation === "closure" && i.closureUnavoidable ? roundRupee(Math.max(0, i.wages) * statNum("notice.closureCompensationCapMonths")) : Infinity;
  const compensation = {
    applies: !compReason,
    reason: compReason as FnfResult["compensation"]["reason"],
    years: compReason ? 0 : compYears,
    dailyRate,
    formula,
    amount: Math.min(formula, cap),
    capped: formula > cap
  };
  const reskilling = i.separation === "retrenchment" && !compReason ? roundRupee(dailyRate * statNum("notice.reskillingFundDays")) : 0;
  const severance = Math.max(0, i.severance ?? 0);
  const lieu = Math.max(0, i.noticePayInLieu);
  const other = Math.max(0, i.otherDues);

  const dues = salaryR + leaveR + gratuityAmount + compensation.amount + severance + lieu + other;
  const recoveries = Math.max(0, i.noticeRecovery) + Math.max(0, i.loans) + Math.max(0, i.otherRecoveries);

  // Deductions from the final month's pay: PF, ESI and professional tax.
  const monthWages = (Math.max(0, i.wages) / divisor) * days;
  const pfMode = i.pf ?? "none";
  const pfR = pfMode === "none" ? null : computeEpf({ pfWages: monthWages, date: i.lwd, epsMember: true, basis: pfMode });
  const esiRate = esiRules().employeeRate;
  const esi = i.esi ? ceilRupee((monthWages * Math.round(esiRate * 100)) / 10000) : 0;
  let pt = 0;
  let ptNote: string | undefined;
  if (i.ptState) {
    const st = ptState(i.ptState);
    const monthISO = `${toISO(lwd).slice(0, 7)}-01`;
    if (st?.status === "levied" && st.basis === "monthly") pt = ptForMonth(i.ptState, salaryR, monthISO, i.gender ?? "other")?.amount ?? 0;
    else if (st?.status === "levied") ptNote = `${st.name} charges professional tax on half-yearly salary: deduct the half-year's tax if it hasn't been deducted yet.`;
    else if (st?.status === "none") ptNote = `${st.name} has no professional tax on salaries.`;
    else ptNote = "Professional tax for this state is not worked out here; check its schedule.";
  }

  // Income tax (estimate). Payments after death go to the legal heirs and are not their salary.
  let tax: FnfTax | null = null;
  if (i.tax && i.separation !== "death") {
    const t = i.tax;
    const fyStartYear = p.m >= 4 ? p.y : p.y - 1;
    const fyStart = dayNumber(fyStartYear, 4, 1);
    const dojP = parts(doj);
    const firstMonth = Math.max(fyStart, dayNumber(dojP.y, dojP.m, 1));
    const fp = parts(firstMonth);
    // Whole months of the tax year before the final month (the joining month counts as one).
    const months = Math.max(0, (p.y - fp.y) * 12 + (p.m - fp.m));
    const salaryBeforeDefaulted = t.salaryBefore === null || t.salaryBefore === undefined || !(t.salaryBefore >= 0);
    const salaryBefore = salaryBeforeDefaulted ? Math.max(0, i.monthlyGross) * months : t.salaryBefore!;

    // Exempt parts.
    const leaveCap = Math.min(
      10 * Math.max(0, i.wages),
      statNum("tax.leaveEncashmentExemption"),
      (Math.min(Math.max(0, i.leaveDays), 30 * service.years) * Math.max(0, i.wages)) / 30
    );
    const leaveExempt = roundRupee(Math.min(leaveR, Math.max(0, leaveCap)));
    const gratuityExempt = Math.min(gratuityAmount, statNum("gratuity.taxExemptionLimit"));
    const compTotal = compensation.amount + (compensation.applies ? severance : 0);
    const compExempt = compensation.applies ? Math.min(compTotal, compensation.formula, statNum("tax.retrenchmentExemption")) : 0;
    // Severance counts with the compensation for a retrenched worker; anyone else's is taxable salary.
    const compTaxable = compensation.applies ? compTotal - compExempt : 0;
    const taxable = {
      salary: salaryR,
      lieu,
      other,
      leave: leaveR - leaveExempt,
      gratuity: gratuityAmount - gratuityExempt,
      compensation: compTaxable,
      severance: compensation.applies ? 0 : severance
    };
    const settlementTaxable = Object.values(taxable).reduce((a, b) => a + b, 0);
    const deductions = t.regime === "old" ? Math.max(0, t.deductions ?? 0) + pt : 0;
    const year = computeIncomeTax({ salary: salaryBefore + settlementTaxable, regime: t.regime, age: t.age, deductions, otherIncome: t.otherIncome });

    const tdsBeforeDefaulted = t.tdsBefore === null || t.tdsBefore === undefined || !(t.tdsBefore >= 0);
    let tdsBefore = t.tdsBefore ?? 0;
    if (tdsBeforeDefaulted) {
      // Payroll spreads the tax on a full year's projected salary evenly over the months.
      const projected = computeIncomeTax({ salary: Math.max(0, i.monthlyGross) * 12, regime: t.regime, age: t.age, deductions: t.regime === "old" ? Math.max(0, t.deductions ?? 0) : 0, otherIncome: t.otherIncome });
      tdsBefore = roundRupee((projected.total / 12) * months);
    }
    tax = {
      months,
      salaryBefore,
      salaryBeforeDefaulted,
      tdsBefore,
      tdsBeforeDefaulted,
      taxable,
      exempt: { leave: leaveExempt, gratuity: gratuityExempt, compensation: compExempt },
      settlementTaxable,
      year,
      tds: Math.max(0, year.total - tdsBefore),
      excess: Math.max(0, tdsBefore - year.total)
    };
  }
  const statutory = { pf: pfR?.employee ?? 0, pfBase: pfR?.base ?? 0, esi, pt, ptNote };
  const deductions = statutory.pf + statutory.esi + statutory.pt + (tax?.tds ?? 0);

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

  const compensationDue: DueDate | undefined = compensation.amount > 0
    ? { date: i.lwd, text: "At the time of retrenchment, with the notice pay", rule: i.separation === "closure" ? "Industrial Relations Code, 2020 s.75 with s.70(b)" : "Industrial Relations Code, 2020 s.70(b)" }
    : undefined;

  return {
    status: "ok",
    salary: { amount: salaryR, days, divisor, defaulted },
    leave: { amount: leaveR, dailyRate: leave.dailyRate },
    gratuity,
    gratuityAmount,
    compensation,
    severance,
    reskilling,
    statutory,
    tax,
    dues,
    deductions,
    recoveries,
    net: dues - deductions - recoveries,
    due: { wages: wagesDue, leave: leaveDue, gratuity: gratuityDue, compensation: compensationDue }
  };
}
