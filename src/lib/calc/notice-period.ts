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
 * contract says so. Not modelled: buy-out amounts and leave set-off.
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
};

export function computeNotice(i: NoticeInput): NoticeResult {
  const r = parseISO(i.resignationDate);
  const blank = { starts: "", fullLwd: "", lwd: "", shortenedBy: 0, servedDays: 0, clamped: false };
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
  return {
    status: "ok",
    starts,
    fullLwd,
    lwd: toISO(lwdDay),
    shortenedBy: fullDay - lwdDay,
    servedDays: Math.max(0, lwdDay - startDay + 1),
    clamped
  };
}
