import { addDays, addMonthsClamped, parseISO, toISO } from "./working-days.ts";

/**
 * Last working day from a resignation date and a contractual notice period.
 *
 *   days:   LWD = resignation + n        (notice starts the next day)
 *           LWD = resignation + (n − 1)  (notice includes the resignation day)
 *   months: X = resignation + n calendar months, clamped to the month's last day
 *           LWD = X (starts next day) or X − 1 day (includes the resignation day)
 *   final:  LWD − days bought out − days waived, never before the resignation date
 *
 * No statute fixes resignation notice for private employees: the contract or
 * standing orders do. Weekends and holidays do not extend notice unless the
 * contract says so.
 *
 * Buy-out amount (when a monthly pay is given): days actually bought out × monthly
 * pay ÷ 30 (or 26). Which pay counts and the divisor come from the contract; this
 * uses what the reader enters. Not modelled: leave set-off.
 */
export type NoticeUnit = "days" | "months";
export type NoticeConvention = "next_day" | "includes";

export type NoticeInput = {
  resignationDate: string;
  n: number;
  unit: NoticeUnit;
  convention: NoticeConvention;
  buyoutDays?: number;
  waivedDays?: number;
  /** Monthly pay the contract uses to price notice, for the buy-out amount. */
  monthlyPay?: number;
  /** A day's pay is monthly pay ÷ this (30 or 26). */
  dayDivisor?: number;
};

export type NoticeResult = {
  status: "ok" | "invalid";
  message?: string;
  /** First day of the notice period. */
  starts: string;
  /** Last working day before any buy-out or waiver. */
  fullLwd: string;
  /** Last working day after buy-out and waiver. */
  lwd: string;
  /** Days shortened by buy-out or waiver (after the floor at the resignation date). */
  shortenedBy: number;
  /** Notice days served, counting from the start of notice to the last working day. */
  servedDays: number;
  /** The month arithmetic hit a shorter month (for example 31 Jan + 1 month → 28 Feb). */
  clamped: boolean;
  /** Days actually bought out (buy-out comes off before waiver when the floor applies). */
  boughtOutDays: number;
  /** Rupees for the days bought out; 0 without a monthly pay. */
  buyoutAmount: number;
  dailyPay: number;
};

export function computeNotice(i: NoticeInput): NoticeResult {
  const r = parseISO(i.resignationDate);
  const blank = { starts: "", fullLwd: "", lwd: "", shortenedBy: 0, servedDays: 0, clamped: false, boughtOutDays: 0, buyoutAmount: 0, dailyPay: 0 };
  if (r === null) return { ...blank, status: "invalid", message: "Enter the date the resignation was given." };
  const n = Math.floor(i.n);
  if (!(n > 0)) return { ...blank, status: "invalid", message: "Enter the notice period from the contract, in days or months." };
  if (i.unit === "days" && n > 730) return { ...blank, status: "invalid", message: "That notice period is longer than two years. Check the number." };
  if (i.unit === "months" && n > 24) return { ...blank, status: "invalid", message: "That notice period is longer than two years. Check the number." };

  const starts = i.convention === "includes" ? i.resignationDate : addDays(i.resignationDate, 1);
  let fullLwd: string;
  let clamped = false;
  if (i.unit === "days") {
    fullLwd = addDays(i.resignationDate, i.convention === "includes" ? n - 1 : n);
  } else {
    const x = addMonthsClamped(i.resignationDate, n);
    clamped = x.clamped;
    fullLwd = i.convention === "includes" ? addDays(x.date, -1) : x.date;
  }
  const cut = Math.max(0, Math.floor(i.buyoutDays ?? 0)) + Math.max(0, Math.floor(i.waivedDays ?? 0));
  const fullDay = parseISO(fullLwd)!;
  const lwdDay = Math.max(r, fullDay - cut);
  const startDay = parseISO(starts)!;
  const shortenedBy = fullDay - lwdDay;
  const boughtOutDays = Math.min(Math.max(0, Math.floor(i.buyoutDays ?? 0)), shortenedBy);
  const dailyPay = (i.monthlyPay ?? 0) > 0 ? i.monthlyPay! / (i.dayDivisor && i.dayDivisor > 0 ? i.dayDivisor : 30) : 0;
  return {
    status: "ok",
    starts,
    fullLwd,
    lwd: toISO(lwdDay),
    shortenedBy,
    servedDays: Math.max(0, lwdDay - startDay + 1),
    clamped,
    boughtOutDays,
    buyoutAmount: Math.round(dailyPay * boughtOutDays),
    dailyPay
  };
}
