/** Number, money and date wording for the people-analytics tool (Indian English, Indian digit grouping). */
import { ymd, monthNumber, monthYear, type DayNum } from "./dates.ts";

const whole = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const oneDp = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 1,24,000 */
export const int = (n: number) => whole.format(Math.round(n));
/** 3.4 */
export const dec1 = (n: number) => oneDp.format(n);
/** 5 or 5.5: one decimal place, dropped when it is zero. */
export const num1 = (n: number) => (Number.isInteger(Math.round(n * 10) / 10) ? whole.format(Math.round(n)) : oneDp.format(n));
/** 13.8% (or "–" when there is no rate) */
export const pct = (n: number | null | undefined, digits = 1) => (n == null || !Number.isFinite(n) ? "–" : `${n.toFixed(digits)}%`);
/** 3.4 years */
export const years = (n: number) => `${dec1(n)} years`;

const trimmed = (v: number, digits: number) => String(Number(v.toFixed(digits)));

/** ₹45,000 · ₹14.2 lakh · ₹1.25 crore */
export function money(n: number): string {
  if (!Number.isFinite(n)) return "–";
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e7) return `${sign}₹${trimmed(a / 1e7, 2)} crore`;
  if (a >= 1e5) return `${sign}₹${trimmed(a / 1e5, 1)} lakh`;
  return `${sign}₹${whole.format(Math.round(a))}`;
}

/** Axis ticks: ₹10 lakh, ₹1 crore, ₹50,000. */
export function moneyTick(n: number): string {
  if (n === 0) return "₹0";
  if (n >= 1e7) return `₹${trimmed(n / 1e7, 2)} cr`;
  if (n >= 1e5) return `₹${trimmed(n / 1e5, 1)} lakh`;
  return `₹${whole.format(n)}`;
}

/** Mar 2026 */
export const monthLabel = (mi: number) => `${MONTHS[monthNumber(mi) - 1]} ${monthYear(mi)}`;
/** 31 Oct 2026 */
export function dateLabel(n: DayNum): string {
  const { y, m, d } = ymd(n);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
/** FY 2025–26 */
export const fyLabel = (startYear: number) => `FY ${startYear}–${String((startYear + 1) % 100).padStart(2, "0")}`;

/** "1 person", "3 people" */
export const people = (n: number) => `${int(n)} ${n === 1 ? "person" : "people"}`;
export const plural = (n: number, one: string, many: string) => `${int(n)} ${n === 1 ? one : many}`;
