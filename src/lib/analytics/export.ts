/**
 * CSV output: the dashboard summary (totals only, no names or individual
 * salaries) and a blank template with the columns the tool understands.
 */
import { isoDate } from "./dates.ts";
import { GENDER_LABEL, type Gender } from "./fields.ts";
import { dateLabel, monthLabel } from "./format.ts";
import type { Dashboard } from "./metrics.ts";
import type { Check } from "./quality.ts";

export type CsvValue = string | number | null | undefined;

/**
 * One CSV cell. Text that a spreadsheet would treat as a formula (=, +, −, @)
 * gets a leading apostrophe, because department and location names come from
 * the uploaded file.
 */
export function csvCell(v: CsvValue): string {
  if (v == null) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(Math.round(v * 100) / 100) : "";
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const toCsv = (rows: CsvValue[][]) => rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

const round1 = (n: number | null) => (n === null || !Number.isFinite(n) ? null : Math.round(n * 10) / 10);

export type SummaryMeta = { source: string; generatedOn: number; filters: { dept: string; location: string; gender: Gender | "" }; payUnit: "annual" | "monthly" };

export function summaryRows(d: Dashboard, checks: Check[], meta: SummaryMeta): CsvValue[][] {
  const rows: CsvValue[][] = [];
  const blank = () => rows.push([]);
  rows.push(["PeopleCraft people analytics summary"]);
  rows.push(["Made on", dateLabel(meta.generatedOn)]);
  rows.push(["Source", meta.source]);
  rows.push(["Period", `${dateLabel(d.period.start)} to ${dateLabel(d.period.end)}`, d.period.label]);
  rows.push(["Department", meta.filters.dept || "All"]);
  rows.push(["Location", meta.filters.location || "All"]);
  rows.push(["Gender", meta.filters.gender ? GENDER_LABEL[meta.filters.gender] : "All"]);
  blank();

  rows.push(["Key figures", "Value", "How it is worked out"]);
  rows.push(["Headcount at the start", d.opening, `On the rolls at the end of ${dateLabel(d.period.start - 1)}`]);
  rows.push(["Joiners", d.joiners, "Joining date in the period"]);
  rows.push(["Leavers", d.leavers, "Last working day in the period"]);
  rows.push(["Headcount at the end", d.closing, `On the rolls at the end of ${dateLabel(d.period.end)}`]);
  rows.push(["Average headcount", d.average, "(start + end) ÷ 2"]);
  rows.push(["Attrition rate (%)", round1(d.rate), "Leavers ÷ average headcount × 100"]);
  if (Math.abs(d.months - 12) > 0.05) rows.push(["Annualised attrition rate (%)", round1(d.annualised), `Attrition rate × 12 ÷ ${round1(d.months)} months`]);
  rows.push(["Left within a year of joining", d.earlyLeavers, "Leavers in the period with under 12 months' service"]);
  rows.push(["Average tenure (years)", round1(d.tenure.mean), "People on the rolls at the end"]);
  rows.push(["Median tenure (years)", round1(d.tenure.median), "People on the rolls at the end"]);
  for (const g of ["women", "men", "other", "unknown"] as Gender[]) {
    if (!d.gender[g] && (g === "other" || g === "unknown")) continue;
    rows.push([`${GENDER_LABEL[g]} (people)`, d.gender[g], d.closing ? `${round1((d.gender[g] / d.closing) * 100)}% of headcount at the end` : ""]);
  }
  blank();

  rows.push(["Month", "Headcount at start", "Joiners", "Leavers", "Headcount at end"]);
  for (const m of d.monthly) rows.push([monthLabel(m.month), m.opening, m.joiners, m.leavers, m.closing]);
  blank();

  rows.push(["Department", "Headcount at start", "Headcount at end", "Average headcount", "Leavers", "Attrition rate (%)"]);
  for (const r of d.byDept) rows.push([r.name, r.opening, r.closing, r.average, r.leavers, round1(r.rate)]);
  blank();

  rows.push(["Years of service", "People"]);
  for (const b of d.tenure.bins) rows.push([b.label, b.count]);
  blank();

  if (d.span) {
    rows.push(["Direct reports", "Managers"]);
    for (const b of d.span.bins) rows.push([b.label, b.count]);
    rows.push(["Average direct reports", round1(d.span.mean)]);
    rows.push(["Median direct reports", round1(d.span.median)]);
    blank();
  }

  if (d.pay) {
    const unit = meta.payUnit === "monthly" ? "per month" : "per year";
    rows.push([`Pay by ${d.pay.by === "grade" ? "grade" : "department"} (₹ ${unit})`, "People", "Lowest", "25th percentile", "Median", "75th percentile", "Highest", "Average"]);
    for (const g of d.pay.groups) {
      if (!g.stats) rows.push([g.name, g.n, "Not shown: fewer than 3 people"]);
      else rows.push([g.name, g.n, g.stats.min, g.stats.p25, g.stats.median, g.stats.p75, g.stats.max, g.stats.mean]);
    }
    blank();
  }

  rows.push(["Data check", "Rows affected", "What the dashboard did"]);
  for (const c of checks) rows.push([c.title, c.count, c.effect]);
  return rows;
}

export function summaryCsv(d: Dashboard, checks: Check[], meta: SummaryMeta): string {
  return toCsv(summaryRows(d, checks, meta));
}

export const summaryFileName = (generatedOn: number) => `people-analytics-summary-${isoDate(generatedOn)}.csv`;

/**
 * Header row for people preparing a file from scratch. Date of birth is left
 * out on purpose: the dashboard doesn't need it, so the file shouldn't carry it.
 */
export const TEMPLATE_HEADERS = [
  "Employee ID", "Name", "Department", "Designation", "Grade", "Gender", "Date of joining", "Last working day",
  "Status", "Location", "Reporting manager ID", "Annual CTC"
];
export const templateCsv = () => toCsv([TEMPLATE_HEADERS]);
