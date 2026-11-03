import { AS_AT, ptState, statNum } from "../../data/statutory.ts";
import { epfRules, epfCeilingOn, pctOf, roundHalfUp } from "./epf.ts";
import { ceilRupee, esiRules } from "./esi.ts";
import { gratuityRules } from "./gratuity.ts";
import { ptForHalfYear, ptForMonth } from "./professional-tax.ts";
import type { Gender } from "./professional-tax.ts";

/**
 * CTC → monthly in-hand pay before income tax.
 *
 * Monthly CTC = gross + employer PF + employer ESI (if covered) + gratuity provision (if in CTC).
 * Gross      = basic + DA + HRA + other excluded allowances + special allowance (the balance).
 * In-hand    = gross − employee PF − employee ESI − professional tax.   (No TDS.)
 *
 * "Wages" under the Codes = basic + DA + special allowance (and any other pay not on the
 * exclusion list). If excluded items (HRA, conveyance and the like) exceed half of total
 * pay, the excess is added back (Code on Wages s.2(y); Code on Social Security s.2(88)).
 * PF, ESI and the gratuity provision are worked out on those wages. Because the special
 * allowance is the balancing figure and itself depends on employer costs, the structure
 * is solved by iteration.
 */

/* ---------- The 50% rule (estimate only: how total pay is measured is not settled) ---------- */
export type CodeWagesResult = {
  /** Pay the Codes count as wages before the test: basic + DA + other pay not excluded. */
  included: number;
  /** Items (a)–(i): HRA, conveyance, overtime, commission and the like (plus employer PF if counted). */
  excluded: number;
  /** included + excluded */
  total: number;
  /** Half of total pay. */
  limit: number;
  /** Excess of excluded items over the limit, added back to wages. */
  addBack: number;
  /** Wages after the test. */
  wages: number;
  excludedShare: number;
};

export function codeWages(included: number, excluded: number, half: number = statNum("wages.halfRule") / 100): CodeWagesResult {
  const total = Math.max(0, included) + Math.max(0, excluded);
  const limit = half * total;
  const addBack = Math.max(0, excluded - limit);
  return { included, excluded, total, limit, addBack, wages: included + addBack, excludedShare: total > 0 ? excluded / total : 0 };
}

/* ---------- Take-home ---------- */
export type TakeHomeInput = {
  /** Annual cost to company (₹). */
  ctc: number;
  /** Basic pay + DA as a percentage of CTC. */
  basicPct: number;
  /** HRA as a percentage of basic. */
  hraPct: number;
  /** Other allowances the Codes exclude from wages (conveyance and the like), monthly. */
  otherExcluded: number;
  pfBasis: "restricted" | "actual";
  gratuityInCtc: boolean;
  /** Count the employer's PF contribution as an excluded item in the 50% test (unsettled). */
  employerPfInTest: boolean;
  /** Professional-tax state code (see PT_STATES), or "OTHER". */
  state: string;
  gender: Gender;
  /** Date the structure applies (ISO); picks the PF ceiling and the PT month. Defaults to the as-at date. */
  date?: string;
};

export type TakeHomeResult = {
  status: "ok" | "invalid";
  message?: string;
  monthlyCtc: number;
  basic: number;
  hra: number;
  otherExcluded: number;
  special: number;
  gross: number;
  wagesTest: CodeWagesResult;
  pfCeiling: number;
  pfBase: number;
  employerPf: number;
  employeePf: number;
  esiCeiling: number;
  esiCovered: boolean;
  employerEsi: number;
  employeeEsi: number;
  gratuityProvision: number;
  pt: number;
  ptFebruary: number | null;
  ptHalfYear: number | null;
  ptStatus: "levied" | "none" | "not-covered" | "unknown";
  inHand: number;
  /** Employer PF costs usually kept outside CTC. */
  edli: number;
  admin: number;
};

type Ctx = {
  M: number;
  B: number;
  H: number;
  O: number;
  ceiling: number;
  pfRate: number;
  esiEmployerRate: number;
  gratuityFactor: number;
};

function evaluate(S: number, esiOn: boolean, i: TakeHomeInput, c: Ctx) {
  const included = c.B + S;
  let erPF = 0;
  let test = codeWages(included, c.H + c.O);
  for (let k = 0; k < 30; k++) {
    test = codeWages(included, c.H + c.O + (i.employerPfInTest ? erPF : 0));
    const base = i.pfBasis === "actual" ? test.wages : Math.min(test.wages, c.ceiling);
    const next = roundHalfUp(pctOf(base, c.pfRate));
    const done = next === erPF;
    erPF = next;
    if (done) break;
  }
  const W = test.wages;
  const pfBase = i.pfBasis === "actual" ? W : Math.min(W, c.ceiling);
  const erESI = esiOn ? ceilRupee(pctOf(W, c.esiEmployerRate)) : 0;
  const grat = i.gratuityInCtc ? W * c.gratuityFactor : 0;
  return { test, W, pfBase, erPF, erESI, grat };
}

function solve(esiOn: boolean, i: TakeHomeInput, c: Ctx) {
  const room = c.M - c.B - c.H - c.O;
  let S = room;
  let ev = evaluate(S, esiOn, i, c);
  for (let k = 0; k < 200; k++) {
    const next = room - ev.erPF - ev.erESI - ev.grat;
    const done = Math.abs(next - S) < 0.001;
    S = next;
    ev = evaluate(S, esiOn, i, c);
    if (done) break;
  }
  return { S, ...ev };
}

export function computeTakeHome(i: TakeHomeInput): TakeHomeResult {
  const date = i.date ?? AS_AT;
  const pf = epfRules();
  const esi = esiRules();
  const g = gratuityRules();
  const M = Math.max(0, i.ctc) / 12;
  const B = (M * i.basicPct) / 100;
  const H = (B * i.hraPct) / 100;
  const O = Math.max(0, i.otherExcluded);
  const c: Ctx = { M, B, H, O, ceiling: epfCeilingOn(date, pf), pfRate: pf.employerRate, esiEmployerRate: esi.employerRate, gratuityFactor: g.daysPerYear / g.divisor / 12 };

  const base: TakeHomeResult = {
    status: "invalid",
    monthlyCtc: M,
    basic: B,
    hra: H,
    otherExcluded: O,
    special: 0,
    gross: 0,
    wagesTest: codeWages(B, H + O),
    pfCeiling: c.ceiling,
    pfBase: 0,
    employerPf: 0,
    employeePf: 0,
    esiCeiling: esi.ceiling,
    esiCovered: false,
    employerEsi: 0,
    employeeEsi: 0,
    gratuityProvision: 0,
    pt: 0,
    ptFebruary: null,
    ptHalfYear: null,
    ptStatus: "unknown",
    inHand: 0,
    edli: 0,
    admin: 0
  };
  if (!(i.ctc > 0)) return { ...base, message: "Enter the annual CTC to see the monthly in-hand pay." };
  if (!(i.basicPct > 0 && i.basicPct <= 100)) return { ...base, message: "Basic pay should be between 1% and 100% of CTC." };
  if (!(i.hraPct >= 0 && i.hraPct <= 100)) return { ...base, message: "HRA should be between 0% and 100% of basic pay." };

  // Solve without ESI first. ESI applies only if wages are within its limit.
  let r = solve(false, i, c);
  let esiCovered = false;
  if (r.W <= esi.ceiling) {
    r = solve(true, i, c);
    esiCovered = true;
  }
  if (r.S < -0.5) {
    return {
      ...base,
      message: "Basic pay, HRA and other allowances add up to more than the CTC can fund after employer contributions. Lower the percentages or the allowances."
    };
  }

  const special = Math.max(0, r.S);
  const gross = roundHalfUp(B + H + O + special);
  const employeePf = roundHalfUp(pctOf(r.pfBase, pf.employeeRate));
  const employeeEsi = esiCovered ? ceilRupee(pctOf(r.W, esi.employeeRate)) : 0;

  // Professional tax for the month the structure applies to.
  const st = ptState(i.state);
  const monthISO = `${date.slice(0, 7)}-01`;
  const y = Number(date.slice(0, 4));
  const febISO = `${Number(date.slice(5, 7)) >= 4 ? y + 1 : y}-02-01`;
  let pt = 0;
  let ptFebruary: number | null = null;
  let ptHalfYear: number | null = null;
  let ptStatus: TakeHomeResult["ptStatus"] = "unknown";
  if (st) {
    ptStatus = st.status;
    if (st.status === "levied" && st.basis === "monthly") {
      pt = ptForMonth(st.code, gross, monthISO, i.gender)?.amount ?? 0;
      const feb = ptForMonth(st.code, gross, febISO, i.gender)?.amount ?? pt;
      ptFebruary = feb !== pt ? feb : null;
    } else if (st.status === "levied" && st.basis === "half-yearly") {
      const half = Number(date.slice(5, 7)) >= 4 && Number(date.slice(5, 7)) <= 9 ? `${y}-04-01` : `${Number(date.slice(5, 7)) >= 10 ? y : y - 1}-10-01`;
      ptHalfYear = ptForHalfYear(st.code, gross * 6, half)?.amount ?? 0;
      pt = ptHalfYear / 6;
    }
  }

  const inHand = gross - employeePf - employeeEsi - pt;
  return {
    status: "ok",
    monthlyCtc: M,
    basic: B,
    hra: H,
    otherExcluded: O,
    special,
    gross,
    wagesTest: r.test,
    pfCeiling: c.ceiling,
    pfBase: r.pfBase,
    employerPf: r.erPF,
    employeePf,
    esiCeiling: esi.ceiling,
    esiCovered,
    employerEsi: r.erESI,
    employeeEsi,
    gratuityProvision: r.grat,
    pt,
    ptFebruary,
    ptHalfYear,
    ptStatus,
    inHand,
    edli: roundHalfUp(pctOf(Math.min(r.W, c.ceiling), pf.edliRate)),
    admin: roundHalfUp(pctOf(r.pfBase, pf.adminRate))
  };
}
