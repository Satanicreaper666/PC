/**
 * Single source of truth for statutory numbers used by calculators and
 * handbook chapters. When a law or rule changes, update it here once.
 * Every entry carries its source and the date it was last checked.
 *
 * In chapters, show a value with <Fact id="esi.wageCeiling" /> so the text
 * and the calculators never disagree.
 *
 * Position as at 2 November 2026: the four Labour Codes are in force from
 * 21 November 2025 and their Central Rules from 8 May 2026. State rules are
 * still being notified, so state-sphere details can differ.
 *
 * verified: true  = confirmed against the statutory text, an official page, or
 *                   a reputable source quoting the instrument (research pass of
 *                   2 Nov 2026, /home/claude/work/research/hr-facts-india.md).
 * verified: false = not confirmed, conflicting or unsettled. Do not present as fact.
 * confidence      = how strong the sources are (see the research notes' scale).
 *
 * This file must stay plain, erasable TypeScript (no enums): calculator tests
 * import it directly with `node --test`.
 */
export type Confidence = "high" | "medium-high" | "medium" | "low";
export type StatSource = { title: string; url: string };

export type StatFact = {
  value: number | string;
  display: string;
  label: string;
  law: string;
  source: StatSource;
  /** Further sources that confirm or explain the value. */
  also?: StatSource[];
  checked: string;
  /** false until confirmed against the official source by the research pass */
  verified: boolean;
  confidence?: Confidence;
  /** First day the value applies (ISO date), when it changed recently. */
  from?: string;
  /** Last day the value applied (ISO date), for superseded values kept for date-aware maths. */
  until?: string;
  note?: string;
};

/** The date every value below describes. Show it on every calculator page. */
export const AS_AT = "2026-11-02";
export const AS_AT_DISPLAY = "2 November 2026";

const CHECKED = "2026-11-02";

/* ---------- Sources ---------- */
const S = {
  wagesCode: { title: "The Code on Wages, 2019 (India Code)", url: "https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf" },
  ssCode: { title: "The Code on Social Security, 2020 (India Code)", url: "https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf" },
  irCode: { title: "The Industrial Relations Code, 2020 (India Code)", url: "https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf" },
  oshCode: {
    title: "The Occupational Safety, Health and Working Conditions Code, 2020 (India Code)",
    url: "https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf"
  },
  pibCodes: { title: "Government makes the four Labour Codes effective (PIB, 21 Nov 2025)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2192463" },
  faq2025: {
    title: "Labour Ministry FAQs on the Labour Codes, 30 Dec 2025 (SCC Online)",
    url: "https://www.scconline.com/blog/post/2026/01/03/labour-ministry-issued-faqs-on-the-labour-codes/"
  },
  faq2026: {
    title: "Ministry FAQs on the four Labour Codes, incl. additional FAQs of 16 Mar 2026 (SCC Online)",
    url: "https://www.scconline.com/blog/post/2026/04/26/ministry-faqs-four-labour-codes-india-2026/"
  },
  pibEpfCeiling: { title: "Cabinet approves EPFO wage ceiling of ₹25,000 a month (PIB, 16 Sep 2026)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310811" },
  epfoCeilingFaq: { title: "EPFO wage ceiling FAQs, S.O. 5109(E), Oct 2026 (copy)", url: "https://www.staffnews.in/wp-content/uploads/2026/10/EPFO_Wage_Ceiling_FAQs.pdf" },
  kpmgCeiling: { title: "KPMG GMS Flash Alert 2026-249: EPF wage ceiling (S.O. 5109(E))", url: "https://kpmg.com/xx/en/our-insights/gms-flash-alert/2026/flash-alert-2026-249.html" },
  epfRates: {
    title: "EPF, EPS and EDLI contribution rates notified, 1 Jul 2026 (SCC Online)",
    url: "https://www.scconline.com/blog/post/2026/07/06/epf-eps-edli-contribution-rates-notified/"
  },
  kpmgSchemes: {
    title: "KPMG Flash News: new social security schemes, 2026",
    url: "https://assets.kpmg.com/content/dam/kpmgsites/in/pdf/2026/07/KPMG-Flash-News-New-Social-Security-Schemes-2026.pdf"
  },
  ssRules: { title: "Social Security (Central) Rules, 2026 (PRS copy)", url: "https://prsindia.org/files/bills_acts/bills_parliament/2026/Social_Security_(Central)_Rules_2026.pdf" },
  lksEsi: {
    title: "Status of ESI compliance under the Code on Social Security (Lakshmikumaran & Sridharan, 9 Jun 2026)",
    url: "https://www.lkslaw.com/insights/articles/status-of-esi-compliance-under-the-code-on-social-security-2020-an-analytical-review"
  },
  mercansEsi: { title: "ESI contribution: ceiling, rates and the transition (Mercans)", url: "https://mercans.com/glossary/employees-state-insurance-esi-contribution/" },
  kpmgRules: {
    title: "KPMG Flash News: final Rules under the four Labour Codes (May 2026)",
    url: "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-Notification-of-final-Rules-on-Four-Labour-Codes.pdf"
  },
  acuityOsh: {
    title: "FAQs on the OSH Code and OSH (Central) Rules, 2026 (Acuity Law)",
    url: "https://acuitylaw.co.in/md/faqs/faqs-on-the-occupational-safety-health-and-working-conditions-code-2020-and-the-occupational-safety-health-and-working-conditions-central-rules-2026/"
  },
  taxclueLeave: { title: "Section 32, OSH Code: annual leave with wages (TaxClue)", url: "https://www.taxclue.in/blog/section-32-osh-code-2020-annual-leave-with-wages/" },
  taxmannRest: {
    title: "Govt notifies maximum continuous working hours under the OSH Code (Taxmann)",
    url: "https://www.taxmann.com/post/blog/govt-notifies-maximum-continuous-working-hours-under-oshwc-code/"
  },
  itdGratuity: {
    title: "Income Tax Department FAQ: ₹20 lakh gratuity exemption limit",
    url: "https://www.incometaxindia.gov.in/w/what-is-the-effective-date-of-enhancement-of-limit-of-gratuity-from-rs-10-lakh-to-20-lakh-for-purpose-of-tax-exemption-computation-under-section-10-10-ii-"
  },
  itdS19: { title: "Income-tax Act, 2025, section 19 (Income Tax Department)", url: "https://www.incometaxindia.gov.in/w/section-19-206" },
  lksFte: { title: "Top 10 FAQs on fixed-term employment (Lakshmikumaran & Sridharan)", url: "https://www.lkslaw.com/insights/articles/top-10-faqs-on-fixed-term-employment-fte" },
  epfoFaq: { title: "EPFO FAQs: contributions, pension share and EDLI (epfindia.gov.in)", url: "https://www.epfindia.gov.in/site_en/FAQ.php" },
  epfoRates: { title: "EPFO: present rates of contribution and administration charges (epfindia.gov.in)", url: "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/ContributionRate.pdf" },
  epfoEmployerBooklet: {
    title: "EPFO information booklet for employers of newly covered establishments (epfindia.gov.in)",
    url: "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/Employer_Information_Booklet.pdf"
  },
  epsHandbook: { title: "EPFO handbook on the Employees' Pension Scheme, 1995 (epfindia.gov.in)", url: "https://www.epfindia.gov.in/site_docs/PDFs/EPFO_Rules-Regulations_PDFs/Handbook_EPS1995.pdf" },
  esicContribution: { title: "ESIC: rates of contribution (esic.gov.in)", url: "https://esic.gov.in/contribution" },
  esicFaq: { title: "ESIC: frequently asked questions on the ESI scheme (esic.gov.in)", url: "https://esic.gov.in/attachments/files/faq.pdf" },
  sccBonus: {
    title: "Centre notifies bonus eligibility and calculation ceilings under the Code on Wages (SCC Online, 26 Aug 2026)",
    url: "https://www.scconline.com/blog/post/2026/08/26/bonus-rules-under-code-on-wages-eligibility-calculation/"
  },
  khaitanBonus: {
    title: "ERGO: bonus payout under the Code on Wages (Khaitan & Co, 4 Sep 2026)",
    url: "https://www.khaitanco.com/sites/default/files/2026-09/Ergo_Bonus%20Payout_04%20September%202026.pdf"
  }
} satisfies Record<string, StatSource>;

export const STAT_SOURCES = S;

const fact = (f: Omit<StatFact, "checked">): StatFact => ({ checked: CHECKED, ...f });

export const STAT: Record<string, StatFact> = {
  /* ---------- Wages (Code on Wages, 2019) ---------- */
  "wages.halfRule": fact({
    value: 50,
    display: "50%",
    label: "If excluded allowances (HRA, conveyance, overtime, commission and the like) exceed half of total pay, the excess counts as wages",
    law: "Code on Wages, 2019 s.2(y), first proviso; Code on Social Security, 2020 s.2(88)",
    source: S.wagesCode,
    also: [S.ssCode, S.faq2025],
    verified: true,
    confidence: "high",
    from: "2025-11-21",
    note: "Whether the employer's PF contribution is counted in total pay for this test is not settled."
  }),
  "wages.inKindCap": fact({
    value: 15,
    display: "15%",
    label: "Pay in kind counts as wages only up to this share of total wages",
    law: "Code on Wages, 2019 s.2(y), Explanation",
    source: S.wagesCode,
    verified: true,
    confidence: "high"
  }),
  "wages.separationPayDays": fact({
    value: 2,
    display: "2 working days",
    label: "Time to pay wages due after resignation, removal, dismissal, retrenchment or closure",
    law: "Code on Wages, 2019 s.17(2)",
    source: S.wagesCode,
    verified: true,
    confidence: "high",
    from: "2025-11-21",
    note: "The Code says \"within two working days of … his resignation\". It is commonly read as the date the resignation takes effect (the last working day); there is no official clarification yet."
  }),
  "wages.monthlyPayDay": fact({
    value: 7,
    display: "before the 7th of the next month",
    label: "Latest day to pay monthly-rated wages",
    law: "Code on Wages, 2019 s.17(1)(iv)",
    source: S.wagesCode,
    verified: true,
    confidence: "high"
  }),

  /* ---------- Statutory bonus (Code on Wages, 2019, Chapter IV) ---------- */
  "bonus.wageCeiling": fact({
    value: 21000,
    display: "₹21,000 a month",
    label: "Monthly wages up to which an employee who worked at least 30 days in the year is entitled to statutory bonus",
    law: "Code on Wages, 2019 s.26(1); notification S.O. 4711(E) of 25 Aug 2026, with effect from 21 Nov 2025 (central sphere)",
    source: S.sccBonus,
    also: [S.wagesCode, S.khaitanBonus],
    verified: true,
    confidence: "medium-high",
    from: "2025-11-21",
    note: "Notified by the Centre for establishments in its sphere; states notify their own. The Gazette text was not found, only law-firm and SCC Online reports."
  }),
  "bonus.calcCeiling": fact({
    value: 7000,
    display: "₹7,000 a month",
    label: "Monthly wages on which bonus is worked out for employees who earn more (or the minimum wage, if higher)",
    law: "Code on Wages, 2019 s.26; notification of 25 Aug 2026 (central sphere)",
    source: S.sccBonus,
    also: [S.wagesCode, S.khaitanBonus],
    verified: true,
    confidence: "medium-high",
    from: "2025-11-21"
  }),
  "bonus.minRate": fact({
    value: 8.33,
    display: "8.33%",
    label: "Minimum statutory bonus, as a share of wages earned in the year (or ₹100, if higher)",
    law: "Code on Wages, 2019 s.26(1)",
    source: S.wagesCode,
    verified: true,
    confidence: "high"
  }),
  "bonus.maxRate": fact({
    value: 20,
    display: "20%",
    label: "Maximum statutory bonus, as a share of wages earned in the year",
    law: "Code on Wages, 2019 s.26(2)",
    source: S.wagesCode,
    verified: true,
    confidence: "high"
  }),

  /* ---------- Gratuity (Code on Social Security, 2020, Chapter V) ---------- */
  "gratuity.daysPerYear": fact({
    value: 15,
    display: "15 days",
    label: "Days of wages per completed year of service",
    law: "Code on Social Security, 2020 s.53(2)",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "gratuity.divisor": fact({
    value: 26,
    display: "26",
    label: "Monthly wages are divided by 26 to get a day's wages",
    law: "Code on Social Security, 2020 s.53, Explanation (monthly-rated employees)",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "gratuity.minYears": fact({
    value: 5,
    display: "5 years",
    label: "Continuous service needed before gratuity is payable (most cases)",
    law: "Code on Social Security, 2020 s.53(1)",
    source: S.ssCode,
    verified: true,
    confidence: "high",
    note: "Not needed where employment ends by death or disablement, or when a fixed term expires."
  }),
  "gratuity.fixedTermMinYears": fact({
    value: 1,
    display: "1 year",
    label: "Service under the contract a fixed-term employee needs for gratuity",
    law: "Industrial Relations Code, 2020 s.2(o)(c); Code on Social Security, 2020 s.53; Social Security (Central) Rules, 2026 r.33(1)",
    source: S.irCode,
    also: [S.pibCodes, S.faq2025, S.lksFte],
    verified: true,
    confidence: "high",
    from: "2025-11-21",
    note: "Paid pro rata. A contract shorter than a year that ends on expiry does not qualify."
  }),
  "gratuity.journalistMinYears": fact({
    value: 3,
    display: "3 years",
    label: "Continuous service a working journalist needs for gratuity",
    law: "Code on Social Security, 2020 s.53(1), first proviso",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "gratuity.partYearMonths": fact({
    value: 6,
    display: "more than 6 months",
    label: "A final part-year longer than this counts as a full year for the amount",
    law: "Code on Social Security, 2020 s.53(2)",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "gratuity.continuousServiceDays": fact({
    value: 240,
    display: "240 days",
    label: "Days actually worked in 12 months that count as a year of continuous service (190 below ground in mines or where the week is under six days)",
    law: "Code on Social Security, 2020 s.54",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "gratuity.ceiling": fact({
    value: 2000000,
    display: "₹20 lakh",
    label: "Maximum gratuity payable",
    law: "Code on Social Security, 2020 s.53(3); amount notified by the Central Government",
    source: S.faq2025,
    also: [S.ssCode],
    verified: true,
    confidence: "medium-high",
    note: "Labour Ministry FAQs (30 Dec 2025) say the notified maximum is currently ₹20 lakh, the figure first notified in March 2018. A claimed private-sector rise to ₹25 lakh is not supported by any official source."
  }),
  "gratuity.paymentDays": fact({
    value: 30,
    display: "30 days",
    label: "Time to pay gratuity after it becomes payable",
    law: "Code on Social Security, 2020 s.56(3)",
    source: S.ssCode,
    verified: true,
    confidence: "high",
    note: "Late payment carries simple interest (s.56(4))."
  }),
  "gratuity.taxExemptionLimit": fact({
    value: 2000000,
    display: "₹20 lakh",
    label: "Income-tax exemption limit on gratuity for private-sector employees (reported)",
    law: "Income-tax Act, 2025 s.19, Table entries 5 and 6",
    source: S.itdS19,
    also: [S.itdGratuity],
    verified: false,
    confidence: "medium",
    note: "₹20 lakh under the 1961 Act. Entry 5 of the 2025 Act still refers to the repealed 1972 Act and no fresh notification was found. Confirm with a tax adviser; the toolkit does not compute tax."
  }),

  /* ---------- EPF (Code on Social Security; EPF, EPS and EDLI Schemes, 2026) ---------- */
  "epf.employeeRate": fact({
    value: 12,
    display: "12%",
    label: "Employee's PF contribution on PF wages",
    law: "Code on Social Security, 2020 s.16(1)(a); rate notification of 1 Jul 2026 (S.O. 3582(E))",
    source: S.epfRates,
    also: [S.ssCode, S.epfoCeilingFaq],
    verified: true,
    confidence: "high",
    from: "2025-11-21"
  }),
  "epf.employerRate": fact({
    value: 12,
    display: "12%",
    label: "Employer's PF contribution on PF wages, including the pension share",
    law: "Code on Social Security, 2020 s.16(1)(a); rate notification of 1 Jul 2026 (S.O. 3582(E))",
    source: S.epfRates,
    also: [S.ssCode, S.epfoCeilingFaq],
    verified: true,
    confidence: "high",
    from: "2025-11-21"
  }),
  "epf.reducedRate": fact({
    value: 10,
    display: "10%",
    label: "Contribution rate for notified categories: establishments under IBC resolution or repayment plans, and jute, beedi, brick, coir (other than spinning) and guar-gum units",
    law: "Code on Social Security, 2020 s.16(1)(a); S.O. 3582(E), 1 Jul 2026",
    source: S.epfRates,
    also: [S.ssCode],
    verified: true,
    confidence: "medium-high"
  }),
  "epf.epsRate": fact({
    value: 8.33,
    display: "8.33%",
    label: "Part of the employer's 12% that goes to the pension scheme (EPS), on wages up to the ceiling",
    law: "Code on Social Security, 2020 s.16(1)(b); Employees' Pension Scheme, 2026",
    source: S.epfRates,
    also: [S.kpmgSchemes, S.epfoCeilingFaq, S.epfoFaq, S.epsHandbook],
    verified: true,
    confidence: "high"
  }),
  "epf.edliRate": fact({
    value: 0.5,
    display: "0.5%",
    label: "Employer's EDLI (insurance) contribution on wages up to the ceiling",
    law: "Employees' Deposit-Linked Insurance Scheme, 2026; rate notification of 1 Jul 2026",
    source: S.epfRates,
    also: [S.epfoCeilingFaq, S.epfoFaq, S.epfoRates],
    verified: true,
    confidence: "high",
    from: "2026-06-29"
  }),
  "epf.adminRate": fact({
    value: 0.5,
    display: "0.5%",
    label: "Employer's EPF administrative charge on PF wages",
    law: "Employees' Provident Funds Scheme, 2026",
    source: S.epfoCeilingFaq,
    also: [S.epfoFaq, S.epfoRates],
    verified: true,
    confidence: "medium-high",
    note: "Shown on the PF wage base in EPFO's worked examples."
  }),
  "epf.adminMinimum": fact({
    value: 500,
    display: "₹500 a month",
    label: "Minimum EPF administrative charge per establishment (₹75 if it has no contributing member)",
    law: "Employees' Provident Funds Scheme, 2026",
    source: S.epfoCeilingFaq,
    also: [S.epfoRates],
    verified: true,
    confidence: "medium"
  }),
  "epf.wageCeiling": fact({
    value: 25000,
    display: "₹25,000 a month",
    label: "PF wage ceiling: contributions are mandatory on wages up to this amount",
    law: "Code on Social Security, 2020 s.2(89); S.O. 5109(E), 17 Sep 2026",
    source: S.pibEpfCeiling,
    also: [S.epfoCeilingFaq, S.kpmgCeiling],
    verified: true,
    confidence: "high",
    from: "2026-09-17",
    note: "September 2026 is split: 1–16 Sep on ₹15,000 and 17–30 Sep on ₹25,000, in one return."
  }),
  "epf.wageCeilingBefore": fact({
    value: 15000,
    display: "₹15,000 a month",
    label: "PF wage ceiling before 17 September 2026",
    law: "S.O. 2702(E), 29 May 2026 (re-notifying the 2014 ceiling under the Code)",
    source: S.epfoCeilingFaq,
    also: [S.kpmgSchemes, S.epfoFaq],
    verified: true,
    confidence: "medium-high",
    until: "2026-09-16"
  }),
  "epf.govtEpsShare": fact({
    value: 1.16,
    display: "1.16%",
    label: "Central Government's pension (EPS) contribution, on wages up to ₹15,000; not an employer cost",
    law: "Employees' Pension Scheme, 2026",
    source: S.epfoCeilingFaq,
    also: [S.epsHandbook],
    verified: true,
    confidence: "medium-high"
  }),
  "epf.coverageEmployees": fact({
    value: 20,
    display: "20 employees",
    label: "Headcount from which PF applies to an establishment",
    law: "Code on Social Security, 2020, First Schedule",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "epf.dueDays": fact({
    value: 15,
    display: "within 15 days of the month's end",
    label: "Time to file the PF return (ECR) and pay contributions",
    law: "Employees' Provident Funds Scheme, 2026",
    source: S.kpmgSchemes,
    also: [S.epfoCeilingFaq, S.epfoEmployerBooklet],
    verified: true,
    confidence: "medium-high"
  }),

  /* ---------- ESI (Code on Social Security, Chapter IV; old ESI rules saved to 20 Nov 2026) ---------- */
  "esi.wageCeiling": fact({
    value: 21000,
    display: "₹21,000 a month",
    label: "ESI covers employees whose wages are at or below this amount",
    law: "ESI wage limit continued under the Code on Social Security, 2020 pending new rules",
    source: S.faq2026,
    also: [S.lksEsi, S.mercansEsi, S.esicFaq],
    verified: true,
    confidence: "medium-high",
    note: "Ministry FAQs (16 Mar 2026): the pre-existing ₹21,000 threshold continues pending revised rules."
  }),
  "esi.wageCeilingPwd": fact({
    value: 25000,
    display: "₹25,000 a month",
    label: "ESI wage limit for employees with a disability",
    law: "ESI wage limit continued under the Code on Social Security, 2020 pending new rules",
    source: S.lksEsi,
    also: [S.mercansEsi, S.esicFaq],
    verified: true,
    confidence: "medium-high"
  }),
  "esi.employeeRate": fact({
    value: 0.75,
    display: "0.75%",
    label: "Employee's ESI contribution, rounded up to the next rupee",
    law: "Social Security (Central) Rules, 2026 r.19(1)",
    source: S.ssRules,
    also: [S.esicContribution],
    verified: true,
    confidence: "high"
  }),
  "esi.employerRate": fact({
    value: 3.25,
    display: "3.25%",
    label: "Employer's ESI contribution, rounded up to the next rupee",
    law: "Social Security (Central) Rules, 2026 r.19(1)",
    source: S.ssRules,
    also: [S.esicContribution],
    verified: true,
    confidence: "high"
  }),
  "esi.lowWageExemption": fact({
    value: 176,
    display: "₹176 a day",
    label: "Employees with an average daily wage at or below this pay no employee share; the employer still pays",
    law: "ESI rules saved until 20 Nov 2026 (Code on Social Security, 2020 s.164(2)(b))",
    source: S.mercansEsi,
    also: [S.esicFaq],
    verified: true,
    confidence: "medium",
    note: "Secondary sources only; esic.gov.in could not be read. Confirm with ESIC."
  }),
  "esi.coverageEmployees": fact({
    value: 10,
    display: "10 employees",
    label: "Headcount from which ESI applies; voluntary below it (and mandatory for even one worker in hazardous processes)",
    law: "Code on Social Security, 2020, Chapter IV",
    source: S.pibCodes,
    also: [S.ssCode],
    verified: true,
    confidence: "high"
  }),
  "esi.contributionPeriods": fact({
    value: "Apr–Sep, Oct–Mar",
    display: "1 April–30 September and 1 October–31 March",
    label: "ESI contribution periods; an employee covered at the start stays covered until the period ends",
    law: "ESI regulations saved until 20 Nov 2026 (Code on Social Security, 2020 s.164(2)(b))",
    source: S.mercansEsi,
    also: [S.esicFaq],
    verified: true,
    confidence: "medium"
  }),
  "esi.transitionEnds": fact({
    value: "2026-11-20",
    display: "20 November 2026",
    label: "Last day the old ESI rules, regulations and schemes are saved under the Code",
    law: "Code on Social Security, 2020 s.164(2)(b)",
    source: S.ssCode,
    also: [S.lksEsi],
    verified: true,
    confidence: "high",
    note: "Replacement ESI regulations, and any new ceiling, had not been notified by late October 2026."
  }),

  /* ---------- Professional tax (state levies; see PT_STATES for slabs) ---------- */
  "pt.karnataka": fact({
    value: 200,
    display: "₹200 a month (₹300 in February)",
    label: "Karnataka professional tax on salary of ₹25,000 a month or more",
    law: "Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976, as amended by Act 33 of 2025",
    source: { title: "Karnataka Tax on Professions (Amendment) Act, 2025 (Act 33 of 2025)", url: "https://taxguru.in/wp-content/uploads/2025/04/Karnataka-PT-Amendment-Act-2025_compressed-1-4.pdf" },
    verified: true,
    confidence: "high",
    from: "2025-04-01"
  }),
  "pt.maharashtra": fact({
    value: 200,
    display: "₹200 a month (₹300 in February)",
    label: "Maharashtra professional tax on salary above ₹10,000 a month (above ₹25,000 for women)",
    law: "Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975, Schedule entry 1",
    source: { title: "Maharashtra profession tax rate schedule (reproduction)", url: "https://cavirtual.webtel.in/detail/15388.aspx" },
    verified: true,
    confidence: "medium-high"
  }),

  /* ---------- Maternity (Code on Social Security, Chapter VI) ---------- */
  "maternity.weeks": fact({
    value: 26,
    display: "26 weeks",
    label: "Maximum paid maternity benefit, of which no more than 8 weeks before the expected delivery",
    law: "Code on Social Security, 2020 s.60(3)",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "maternity.weeksBeforeDelivery": fact({
    value: 8,
    display: "8 weeks",
    label: "Maximum maternity benefit taken before the expected delivery",
    law: "Code on Social Security, 2020 s.60(3)",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "maternity.weeksTwoChildren": fact({
    value: 12,
    display: "12 weeks",
    label: "Maternity benefit for a woman with two or more surviving children",
    law: "Code on Social Security, 2020 s.60(3), proviso",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),
  "maternity.weeksAdoption": fact({
    value: 12,
    display: "12 weeks",
    label: "Maternity benefit for an adopting or commissioning mother, from the day the child is handed over",
    law: "Code on Social Security, 2020 s.60(4)",
    source: S.ssCode,
    verified: true,
    confidence: "high",
    note: "The Supreme Court struck down the 'child below three months' condition on 17 Mar 2026."
  }),
  "maternity.minDaysWorked": fact({
    value: 80,
    display: "80 days",
    label: "Days a woman must have worked in the 12 months before the expected delivery to qualify",
    law: "Code on Social Security, 2020 s.60(2)",
    source: S.ssCode,
    verified: true,
    confidence: "high"
  }),

  /* ---------- Working hours and overtime (OSH Code, 2020; OSH (Central) Rules, 2026) ---------- */
  "osh.dailyHours": fact({
    value: 8,
    display: "8 hours",
    label: "Maximum normal working hours in a day for a worker",
    law: "OSH Code, 2020 s.25(1)(a)",
    source: S.oshCode,
    also: [S.pibCodes],
    verified: true,
    confidence: "high"
  }),
  "osh.weeklyHours": fact({
    value: 48,
    display: "48 hours",
    label: "Maximum normal working hours in a week for a worker",
    law: "OSH Code, 2020 s.25; OSH (Central) Rules, 2026 r.64(1)",
    source: S.pibCodes,
    also: [S.oshCode, S.acuityOsh],
    verified: true,
    confidence: "medium-high"
  }),
  "osh.daysPerWeek": fact({
    value: 6,
    display: "6 days",
    label: "Maximum working days in a week",
    law: "OSH Code, 2020 s.26",
    source: S.oshCode,
    also: [S.acuityOsh],
    verified: true,
    confidence: "high"
  }),
  "osh.overtimeMultiple": fact({
    value: 2,
    display: "twice the ordinary rate",
    label: "Overtime pay rate, with the worker's consent",
    law: "OSH Code, 2020 s.27; Code on Wages, 2019 s.14",
    source: S.oshCode,
    also: [S.wagesCode, S.pibCodes],
    verified: true,
    confidence: "high"
  }),
  "osh.overtimeQuarterCap": fact({
    value: 144,
    display: "144 hours a quarter",
    label: "Maximum overtime in a quarter under the Central Rules",
    law: "OSH (Central) Rules, 2026",
    source: S.kpmgRules,
    also: [S.acuityOsh],
    verified: true,
    confidence: "medium-high",
    note: "One law-firm page gives 125 hours, which is Maharashtra's older state figure. State rules may differ."
  }),
  "osh.maxContinuousHours": fact({
    value: 5,
    display: "5 hours",
    label: "Maximum continuous work before a break of at least 30 minutes",
    law: "OSH Code, 2020 s.25(1)(b); S.O. 2517(E), 13 May 2026",
    source: S.taxmannRest,
    verified: true,
    confidence: "medium"
  }),
  "osh.supervisorWageLimit": fact({
    value: 18000,
    display: "₹18,000 a month",
    label: "Supervisors earning more than this are not 'workers' (nor are managerial or administrative staff)",
    law: "OSH Code, 2020 (definition of 'worker'); Industrial Relations Code, 2020 s.2(zr)",
    source: S.oshCode,
    also: [S.irCode],
    verified: true,
    confidence: "high"
  }),
  "osh.establishmentWorkers": fact({
    value: 10,
    display: "10 workers",
    label: "Workers from which a place is an 'establishment' under the OSH Code",
    law: "OSH Code, 2020 s.2(1)(v)",
    source: S.oshCode,
    also: [S.acuityOsh],
    verified: true,
    confidence: "high"
  }),

  /* ---------- Annual leave with wages (OSH Code s.32) ---------- */
  "leave.eligibilityDays": fact({
    value: 180,
    display: "180 days",
    label: "Days a worker must work in a calendar year to earn annual leave with wages",
    law: "OSH Code, 2020 s.32(1)(i)",
    source: S.oshCode,
    also: [S.pibCodes, S.taxclueLeave],
    verified: true,
    confidence: "high"
  }),
  "leave.accrualDays": fact({
    value: 20,
    display: "1 day for every 20 days worked",
    label: "Rate at which an adult worker earns annual leave",
    law: "OSH Code, 2020 s.32(1)(i)",
    source: S.oshCode,
    also: [S.taxclueLeave],
    verified: true,
    confidence: "high"
  }),
  "leave.accrualDaysAdolescent": fact({
    value: 15,
    display: "1 day for every 15 days worked",
    label: "Leave rate for adolescents and for workers below ground in mines",
    law: "OSH Code, 2020 s.32(1)(ii)",
    source: S.oshCode,
    also: [S.taxclueLeave],
    verified: true,
    confidence: "high"
  }),
  "leave.carryForwardMax": fact({
    value: 30,
    display: "30 days",
    label: "Maximum annual leave a worker can carry forward (leave applied for and refused is not capped)",
    law: "OSH Code, 2020 s.32(1)(vii)",
    source: S.oshCode,
    also: [S.taxclueLeave, S.faq2026],
    verified: true,
    confidence: "high"
  }),
  "leave.exitPaymentWorkingDays": fact({
    value: 2,
    display: "2 working days",
    label: "Time to pay a worker for unused leave after discharge, dismissal or quitting",
    law: "OSH Code, 2020 s.32(1)(vi)",
    source: S.oshCode,
    also: [S.taxclueLeave, S.acuityOsh],
    verified: true,
    confidence: "high"
  }),
  "leave.retirementPaymentMonths": fact({
    value: 2,
    display: "2 months",
    label: "Time to pay for unused leave after superannuation or death",
    law: "OSH Code, 2020 s.32(1)(vi)",
    source: S.oshCode,
    also: [S.taxclueLeave, S.acuityOsh],
    verified: true,
    confidence: "high"
  }),

  /* ---------- Notice, retrenchment (Industrial Relations Code, 2020) ---------- */
  "notice.retrenchmentNoticeMonths": fact({
    value: 1,
    display: "1 month",
    label: "Written notice (or wages in lieu) to retrench a worker with a year's continuous service",
    law: "Industrial Relations Code, 2020 s.70",
    source: S.irCode,
    verified: true,
    confidence: "high"
  }),
  "notice.retrenchmentCompensationDays": fact({
    value: 15,
    display: "15 days' average pay",
    label: "Retrenchment compensation for each completed year of service (part-years over six months count)",
    law: "Industrial Relations Code, 2020 s.70",
    source: S.irCode,
    verified: true,
    confidence: "high"
  }),
  "notice.reskillingFundDays": fact({
    value: 15,
    display: "15 days' last drawn wages",
    label: "Employer's payment to the worker re-skilling fund for each retrenched worker",
    law: "Industrial Relations Code, 2020 s.83",
    source: S.irCode,
    also: [S.pibCodes, S.kpmgRules],
    verified: true,
    confidence: "high"
  }),
  "notice.layoffPermissionWorkers": fact({
    value: 300,
    display: "300 workers",
    label: "Industrial establishments with this many workers need government permission to lay off, retrench or close",
    law: "Industrial Relations Code, 2020 Chapter X",
    source: S.irCode,
    also: [S.pibCodes, S.faq2025],
    verified: true,
    confidence: "high"
  })
};

export const stat = (id: string): StatFact => {
  const f = STAT[id];
  if (!f) throw new Error(`Unknown statutory fact: ${id}`);
  return f;
};
export const statNum = (id: string): number => Number(stat(id).value);

/** The figure at the start of a display string: "₹25,000 a month" → "₹25,000", "26 weeks" → "26 weeks". */
const SHORT = /^(₹[\d,]+(?:\.\d+)?(?: (?:lakh|crore))?|\d+(?:\.\d+)?%|\d+ (?:working )?(?:days?|weeks?|months?|years?|hours?))/;

/**
 * Text for a statutory value, for pages. Throws for a value that is not verified,
 * so an unconfirmed number can never reach a page by accident.
 *   part "display" (default): "₹25,000 a month"; part "short": "₹25,000".
 */
export function factText(id: string, part: "display" | "short" = "display"): string {
  const f = stat(id);
  if (!f.verified) throw new Error(`Statutory fact "${id}" is not verified; it cannot be shown on a page.`);
  if (part === "short") return f.display.match(SHORT)?.[1] ?? f.display;
  return f.display;
}

/**
 * Short alias for MDX component props, which can't hold <Fact>:
 *   import { fx } from "../../../data/statutory";
 *   <KeyNumbers items={[{ value: fx("esi.wageCeiling", "short"), … }]} />
 */
export const fx = factText;

/** Tokens a writer can use in front matter, glossary entries and Markdown templates. */
export const FACT_TOKEN = /\{\{\s*fact:([a-z]+\.[A-Za-z]+)(?:\|(short|display))?\s*\}\}/g;

/** Replace {{fact:epf.wageCeiling}} and {{fact:epf.wageCeiling|short}} with today's figure. */
export function resolveFacts(text: string): string {
  return text.replace(FACT_TOKEN, (_m, id: string, part?: "short" | "display") => factText(id, part ?? "display"));
}

/** Official publishers: India Code, the Gazette, PIB, PRS and government (.gov.in / .nic.in) sites. */
export const OFFICIAL_SOURCE = /(^|\.)(indiacode\.nic\.in|egazette\.gov\.in|pib\.gov\.in|prsindia\.org|[a-z0-9-]+\.gov\.in|[a-z0-9-]+\.nic\.in)$/;
export const isOfficial = (s: StatSource): boolean => {
  try {
    return OFFICIAL_SOURCE.test(new URL(s.url).hostname);
  } catch {
    return false;
  }
};
/** True when at least one source for the fact is an official publisher. */
export const hasOfficialSource = (f: { source: StatSource; also?: StatSource[] }): boolean => [f.source, ...(f.also ?? [])].some(isOfficial);

/* =====================================================================
 * Professional tax: state slabs
 * A slab applies when salary > min (or >= min when minInclusive).
 * The last slab whose condition holds wins.
 * ===================================================================== */
export type PtSlab = { min: number; minInclusive?: boolean; amount: number; february?: number };
export type PtSchedule = {
  /** First month (ISO date, 1st of month) this schedule applies to. */
  from?: string;
  /** Last month (ISO date) this schedule applies to. */
  until?: string;
  slabs: PtSlab[];
  /** Separate slabs for women (Maharashtra). */
  women?: PtSlab[];
};
export type PtStatus = "levied" | "none" | "not-covered";
export type PtState = {
  code: string;
  name: string;
  status: PtStatus;
  basis?: "monthly" | "half-yearly";
  /** Where only one local body's rates are covered. */
  area?: string;
  schedules?: PtSchedule[];
  law: string;
  source: StatSource;
  also?: StatSource[];
  checked: string;
  verified: boolean;
  confidence: Confidence;
  note?: string;
};

const ptSource = {
  kaAct2025: { title: "Karnataka Tax on Professions (Amendment) Act, 2025 (Act 33 of 2025)", url: "https://taxguru.in/wp-content/uploads/2025/04/Karnataka-PT-Amendment-Act-2025_compressed-1-4.pdf" },
  kaKhaitan: { title: "Karnataka professional tax amendment 2023: ₹25,000 threshold (Khaitan & Co)", url: "https://www.khaitanco.com/thought-leaderships/Karnataka-Professional-Tax-Amendment-2023-Major-Changes-Brought-in-Effect" },
  mhSchedule: { title: "Maharashtra profession tax rate schedule (reproduction)", url: "https://cavirtual.webtel.in/detail/15388.aspx" },
  mhKhaitan: { title: "Maharashtra professional tax amendment 2023: women up to ₹25,000 exempt (Khaitan & Co)", url: "https://khaitanco.com/thought-leaderships/Maharashtra-Professional-Tax-Amendment-2023-Key-Takeaways" },
  gcc: { title: "Revision of Greater Chennai Corporation professional tax, circular of 20 Jan 2025 (copy)", url: "https://akriviahcm.com/resources/wp-content/uploads/2025/02/Revision-of-Chennai-Corporation-Professional-Tax-1.pdf" },
  zoho: { title: "Professional tax: state-wise slabs (Zoho Payroll, 1 Sep 2025)", url: "https://zdblogs.zohocorp.com/payroll/academy/in/taxes-and-compliance/professional-tax-rules.html" },
  wbOld: { title: "West Bengal P-tax schedule w.e.f. 1 Apr 2014 (Commercial Taxes Directorate)", url: "https://comtax.wb.gov.in/Ptax-Schedule-New_(w.e.f._1-4-2014).pdf" },
  wbNew: { title: "West Bengal amends the professional tax schedule, Notification 1607-F.T. (TeamLease RegTech)", url: "https://teamleaseregtech.com/updates/article/60103/west-bengal-finance-department-amendment-of-professional-tax-schedule/" },
  wbNew2: { title: "West Bengal overhauls professional tax (SGCMS)", url: "https://www.sgcms.com/regulatory-updates/west-bengal-overhauls-professional-tax-new-schedule-notified/" },
  gj: { title: "Rate of profession tax (Gujarat Commercial Tax Department)", url: "https://commercialtax.gujarat.gov.in/vatwebsite/download/schedule/Rate_of_Profession_Tax.pdf" },
  odisha: { title: "Odisha repeals professional tax from 1 April 2026 (SCC Online)", url: "https://www.scconline.com/blog/post/2026/04/23/odisha-repeals-levy-of-professional-tax-effective-from-1-april-2026/" },
  noPt: { title: "Professional tax slab rates 2026-27 (HROne)", url: "https://hrone.cloud/blog/professional-tax-slab-rates-2026-27/" },
  kerala: { title: "Kerala: change in rates of professional tax (AscentHR)", url: "https://ascent-hr.com/notification/change-in-rates-of-professional-tax/" },
  goaBill: {
    title: "Goa Tax on Profession, Trade, Callings and Employment Bill, 2009",
    url: "https://goabudget.gov.in/assets/bills/2007/Nineth_session/86_draft_BNAI_29_2009_THE_GOA_TAX_ON_PROFESSION_TRADE_CALLINGS_AND_EMPLOYMENT_BILL__2009.pdf"
  }
} satisfies Record<string, StatSource>;

const noPt = (code: string, name: string): PtState => ({
  code,
  name,
  status: "none",
  law: "No professional tax on salaried employees (as reported)",
  source: ptSource.noPt,
  checked: CHECKED,
  verified: true,
  confidence: "medium"
});

export const PT_STATES: PtState[] = [
  {
    code: "KA",
    name: "Karnataka",
    status: "levied",
    basis: "monthly",
    schedules: [{ from: "2025-04-01", slabs: [{ min: 0, minInclusive: true, amount: 0 }, { min: 25000, minInclusive: true, amount: 200, february: 300 }] }],
    law: "Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976 (₹25,000 threshold from 1 Apr 2023; February ₹300 from 1 Apr 2025, Act 33 of 2025)",
    source: ptSource.kaAct2025,
    also: [ptSource.kaKhaitan],
    checked: CHECKED,
    verified: true,
    confidence: "high"
  },
  {
    code: "MH",
    name: "Maharashtra",
    status: "levied",
    basis: "monthly",
    schedules: [
      {
        slabs: [{ min: 0, minInclusive: true, amount: 0 }, { min: 7500, amount: 175 }, { min: 10000, amount: 200, february: 300 }],
        women: [{ min: 0, minInclusive: true, amount: 0 }, { min: 25000, amount: 200, february: 300 }]
      }
    ],
    law: "Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975, Schedule entry 1 (rates from 1 Jul 2014; women up to ₹25,000 exempt from 1 Apr 2023)",
    source: ptSource.mhSchedule,
    also: [ptSource.mhKhaitan],
    checked: CHECKED,
    verified: true,
    confidence: "medium-high"
  },
  {
    code: "TN",
    name: "Tamil Nadu (Greater Chennai Corporation)",
    area: "Greater Chennai Corporation",
    status: "levied",
    basis: "half-yearly",
    schedules: [
      {
        from: "2024-10-01",
        slabs: [
          { min: 0, minInclusive: true, amount: 0 },
          { min: 21000, amount: 180 },
          { min: 30000, amount: 425 },
          { min: 45000, amount: 930 },
          { min: 60000, amount: 1025 },
          { min: 75000, amount: 1250 }
        ]
      }
    ],
    law: "Tamil Nadu Urban Local Bodies Act, 1998; Greater Chennai Corporation rates for each half-year from 1 Oct 2024",
    source: ptSource.gcc,
    checked: CHECKED,
    verified: true,
    confidence: "medium",
    note: "Rates are set by each local body. Only Greater Chennai Corporation rates are covered."
  },
  {
    code: "TS",
    name: "Telangana",
    status: "levied",
    basis: "monthly",
    schedules: [{ slabs: [{ min: 0, minInclusive: true, amount: 0 }, { min: 15000, amount: 150 }, { min: 20000, amount: 200 }] }],
    law: "Telangana Tax on Professions, Trades, Callings and Employments Act, 1987, Schedule",
    source: ptSource.zoho,
    checked: CHECKED,
    verified: true,
    confidence: "medium",
    note: "Checked against payroll references; the official schedule was not read."
  },
  {
    code: "AP",
    name: "Andhra Pradesh",
    status: "levied",
    basis: "monthly",
    schedules: [{ slabs: [{ min: 0, minInclusive: true, amount: 0 }, { min: 15000, amount: 150 }, { min: 20000, amount: 200 }] }],
    law: "Andhra Pradesh Tax on Professions, Trades, Callings and Employments Act, 1987, Schedule",
    source: ptSource.zoho,
    checked: CHECKED,
    verified: true,
    confidence: "medium",
    note: "Checked against payroll references; the official schedule was not read."
  },
  {
    code: "WB",
    name: "West Bengal",
    status: "levied",
    basis: "monthly",
    schedules: [
      {
        until: "2026-09-30",
        slabs: [
          { min: 0, minInclusive: true, amount: 0 },
          { min: 10000, amount: 110 },
          { min: 15000, amount: 130 },
          { min: 25000, amount: 150 },
          { min: 40000, amount: 200 }
        ]
      },
      {
        from: "2026-10-01",
        slabs: [
          { min: 0, minInclusive: true, amount: 0 },
          { min: 20000, amount: 100 },
          { min: 30000, amount: 140 },
          { min: 50000, amount: 170 },
          { min: 100000, amount: 208 }
        ]
      }
    ],
    law: "West Bengal State Tax on Professions, Trades, Callings and Employments Act, 1979; new Schedule by Notification 1607-F.T. of 16 Sep 2026, from 1 Oct 2026",
    source: ptSource.wbNew,
    also: [ptSource.wbNew2, ptSource.wbOld],
    checked: CHECKED,
    verified: true,
    confidence: "medium-high"
  },
  {
    code: "GJ",
    name: "Gujarat",
    status: "levied",
    basis: "monthly",
    schedules: [{ from: "2022-04-01", slabs: [{ min: 0, minInclusive: true, amount: 0 }, { min: 12000, amount: 200 }] }],
    law: "Gujarat State Tax on Professions, Traders, Callings and Employments Act, 1976, Schedule entry 1 (from 1 Apr 2022)",
    source: ptSource.gj,
    checked: CHECKED,
    verified: true,
    confidence: "high"
  },
  noPt("DL", "Delhi"),
  noPt("HR", "Haryana"),
  noPt("RJ", "Rajasthan"),
  noPt("UP", "Uttar Pradesh"),
  noPt("UK", "Uttarakhand"),
  noPt("HP", "Himachal Pradesh"),
  noPt("JK", "Jammu and Kashmir"),
  {
    code: "OD",
    name: "Odisha",
    status: "none",
    law: "Odisha State Tax on Professions, Trades, Callings and Employment (Repeal) Ordinance, 2026: no professional tax from 1 Apr 2026",
    source: ptSource.odisha,
    checked: CHECKED,
    verified: true,
    confidence: "medium-high",
    note: "Repealed with effect from 1 April 2026; earlier dues remain recoverable."
  },
  {
    code: "KL",
    name: "Kerala",
    status: "not-covered",
    basis: "half-yearly",
    law: "Kerala Panchayat Raj Act, 1994 and Kerala Municipality Act, 1994 (each local body sets half-yearly rates)",
    source: ptSource.kerala,
    checked: CHECKED,
    verified: false,
    confidence: "low",
    note: "Rates vary by panchayat and municipality and could not be confirmed statewide."
  },
  {
    code: "GA",
    name: "Goa",
    status: "not-covered",
    law: "Goa Tax on Profession, Trade, Callings and Employment Act (status unclear)",
    source: ptSource.goaBill,
    checked: CHECKED,
    verified: false,
    confidence: "low",
    note: "Sources disagree on whether Goa currently levies professional tax on salaries. Check with the Goa Commercial Tax Department."
  }
];

export const ptState = (code: string): PtState | undefined => PT_STATES.find((s) => s.code === code);
