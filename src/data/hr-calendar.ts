/**
 * The statutory dates in the annual HR calendar (src/content/toolkit/annual-hr-calendar.mdx),
 * as events for the .ics download at /toolkit/annual-hr-calendar.ics. Keep the two in step.
 * Tax year 2026-27 (April 2026 to March 2027), plus the after-year dates.
 */
import type { IcsEvent } from "../lib/ics/ics.ts";

const PAGE = "https://peoplecraft.vercel.app/toolkit/annual-hr-calendar/";
const see = (s: string) => `${s}\n\nPeopleCraft annual HR calendar: ${PAGE}`;

export const HR_CALENDAR_2026_27: IcsEvent[] = [
  { uid: "wages-monthly-2026-27", date: "2026-05-07", monthlyUntil: "2027-04-07", remindDays: 3, title: "Pay last month's wages (by the 7th)", description: see("Monthly-rated wages are due before the end of the 7th day of the next month (Code on Wages, 2019, section 17).") },
  { uid: "tds-monthly-2026-27", date: "2026-05-07", monthlyUntil: "2027-03-07", remindDays: 3, title: "Deposit last month's TDS (by the 7th)", description: see("TDS deducted in a month is deposited by the 7th of the next month (Income-tax Rules, 2026, rule 218). March's TDS is due by 30 April.") },
  { uid: "tds-march-2027", date: "2027-04-30", title: "Deposit March 2027 TDS", description: see("TDS deducted in March is due by 30 April.") },
  { uid: "pf-esi-monthly-2026-27", date: "2026-05-15", monthlyUntil: "2027-04-15", remindDays: 3, title: "Pay and file PF (ECR) and ESI (by the 15th)", description: see("PF and ESI contributions for last month are due by the 15th.") },
  { uid: "form16-2025-26", date: "2026-06-15", title: "Give employees Form 16 for 2025-26", description: see("Salary TDS certificates for tax year 2025-26 (old form name).") },
  { uid: "q1-2026-27", date: "2026-07-31", title: "File Q1 TDS statement (Form 138)", description: see("Quarterly salary TDS statement for April to June 2026 (Income-tax Rules, 2026, rule 219).") },
  { uid: "esi-period-oct-2026", date: "2026-10-01", remindDays: 7, title: "New ESI contribution period starts", description: see("Check who is now covered by ESI, or no longer covered, from 1 October.") },
  { uid: "q2-2026-27", date: "2026-10-31", title: "File Q2 TDS statement (Form 138)", description: see("Quarterly salary TDS statement for July to September 2026.") },
  { uid: "bonus-2025-26", date: "2026-11-30", remindDays: 14, title: "Pay statutory bonus for 2025-26", description: see("Within eight months of the end of the accounting year: by 30 November for a year ending 31 March.") },
  { uid: "leave-year-end-2026", date: "2026-12-31", remindDays: 14, title: "Leave year ends: carry forward and pay out", description: see("For a calendar leave year: carry forward up to the limit (30 days for OSH Code workers; 45 in Karnataka and Maharashtra) and pay out the rest. Publish the 2027 holiday list.") },
  { uid: "posh-report-2026", date: "2027-01-31", remindDays: 14, title: "Send the POSH committee's 2026 annual report", description: see("To the employer and the District Officer. The Act sets no national date; 31 January is a common deadline. Check with your District Officer.") },
  { uid: "q3-2026-27", date: "2027-01-31", title: "File Q3 TDS statement (Form 138)", description: see("Quarterly salary TDS statement for October to December 2026.") },
  { uid: "pt-feb-2027", date: "2027-02-01", remindDays: 3, title: "February professional tax: higher in Karnataka and Maharashtra", description: see("The top slab is ₹300 in February instead of ₹200.") },
  { uid: "tds-full-year-2027", date: "2027-03-01", remindDays: 7, title: "March payroll: deduct the full year's TDS", description: see("Make sure each employee's tax for 2026-27 is fully deducted by the March payroll. Collect proofs from old-regime employees.") },
  { uid: "esi-period-apr-2027", date: "2027-04-01", remindDays: 7, title: "New ESI contribution period and tax year start", description: see("Check ESI coverage, and confirm each employee's tax regime for 2027-28.") },
  { uid: "q4-2026-27", date: "2027-05-31", title: "File Q4 TDS statement (Form 138)", description: see("Quarterly salary TDS statement for January to March 2027.") },
  { uid: "form130-2026-27", date: "2027-06-15", remindDays: 10, title: "Give employees Form 130 for 2026-27", description: see("Salary TDS certificates for tax year 2026-27, the first year under the new form numbers.") }
];
