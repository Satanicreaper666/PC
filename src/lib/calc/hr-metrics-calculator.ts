/**
 * Twenty everyday HR metrics, each computable from a few inputs, with its
 * formula. Defined as data so the page renders the inputs and the formula
 * text from the same definition the tests check.
 *
 * Definitions vary between organisations. The page states the one used here;
 * keep your definition the same from period to period so trends mean something.
 */

export type GroupId = "shared" | "retention" | "hiring" | "engagement" | "productivity" | "pay" | "capacity";

export const GROUPS: { id: GroupId; title: string; blurb: string }[] = [
  { id: "shared", title: "Your organisation", blurb: "Used by several metrics below." },
  { id: "retention", title: "Attrition and retention", blurb: "Who leaves, how fast, and whether you wanted to keep them." },
  { id: "hiring", title: "Hiring", blurb: "Speed, cost and results of recruitment." },
  { id: "engagement", title: "Engagement and attendance", blurb: "Survey scores and unplanned absence." },
  { id: "productivity", title: "Productivity and return", blurb: "Output per person and the return on training." },
  { id: "pay", title: "Pay", blurb: "Where pay sits against its range, and the gap between men and women." },
  { id: "capacity", title: "Benefits, compliance and HR capacity", blurb: "Take-up, timeliness and the size of the HR team." }
];

export type MetricInput = {
  id: string;
  label: string;
  /** Default shown in the form, as typed (commas allowed). */
  value: string;
  prefix?: string;
  suffix?: string;
  help?: string;
  /** "list": comma-separated numbers in a text area. */
  kind?: "number" | "list";
};

export type MetricOut = { value: number | null; display: string; note?: string; warn?: boolean };
export type Get = { n: (id: string) => number; raw: (id: string) => string };

export type Metric = {
  id: string;
  group: GroupId;
  label: string;
  formula: string;
  inputs: MetricInput[];
  /** Shared inputs this metric also uses (ids from the "shared" group). */
  uses?: string[];
  compute: (g: Get) => MetricOut;
};

/* ---------- formatting (pure, no DOM) ---------- */
const nf = (frac: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: frac, minimumFractionDigits: frac });
export const pct = (n: number, frac = 1) => `${nf(frac).format(n)}%`;
export const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
export const signed = (n: number) => {
  const r = Math.round(n);
  return r > 0 ? `+${r}` : r < 0 ? `−${Math.abs(r)}` : "0";
};
export const plain = (n: number, frac = 1) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: frac }).format(n);

const NONE = (note: string): MetricOut => ({ value: null, display: "—", note });

/** Numbers from a comma, space or line separated list; ignores anything that isn't a number. */
export function parseList(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.replace(/[^\d.]/g, ""))
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n >= 0);
}

export function median(xs: number[]) {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Net promoter score from counts of promoters (9–10), passives (7–8) and detractors (0–6). */
export function nps(promoters: number, passives: number, detractors: number) {
  const total = promoters + passives + detractors;
  if (!(total > 0)) return null;
  return ((promoters - detractors) / total) * 100;
}

/** a ÷ b × 100, or null when b is not positive. */
export function rate(a: number, b: number) {
  return b > 0 && a >= 0 ? (a / b) * 100 : null;
}

const ratePct = (a: number, b: number, need: string, over?: string): MetricOut => {
  const r = rate(a, b);
  if (r === null) return NONE(need);
  if (a > b && over) return { value: r, display: pct(r), note: over, warn: true };
  return { value: r, display: pct(r) };
};

export const METRICS: Metric[] = [
  /* ---------- shared ---------- */
  {
    id: "shared",
    group: "shared",
    label: "Average headcount and period",
    formula: "Average headcount = headcount at the end of each month, added up, ÷ number of months",
    inputs: [
      { id: "avgHc", label: "Average headcount", value: "200", help: "Or (headcount at the start + at the end) ÷ 2." },
      { id: "months", label: "Months covered", value: "12", suffix: "months", help: "Rates are also shown as a yearly figure." }
    ],
    compute: () => ({ value: null, display: "" })
  },
  /* ---------- retention ---------- */
  {
    id: "attrition",
    group: "retention",
    label: "Attrition rate",
    formula: "Leavers ÷ average headcount × 100",
    uses: ["avgHc", "months"],
    inputs: [{ id: "leavers", label: "People who left in the period", value: "36", help: "Everyone who left: resignations, terminations, retirements, end of contract." }],
    compute: ({ n }) => periodRate(n("leavers"), n("avgHc"), n("months"))
  },
  {
    id: "voluntary",
    group: "retention",
    label: "Voluntary attrition rate",
    formula: "Resignations ÷ average headcount × 100",
    uses: ["avgHc", "months"],
    inputs: [{ id: "resigned", label: "People who resigned", value: "28" }],
    compute: ({ n }) => {
      const out = periodRate(n("resigned"), n("avgHc"), n("months"));
      if (out.value !== null && n("resigned") > n("leavers")) return { ...out, note: "More resignations than leavers: check both numbers.", warn: true };
      return out;
    }
  },
  {
    id: "regrettable",
    group: "retention",
    label: "Regrettable leavers",
    formula: "Leavers you wanted to keep ÷ all leavers × 100",
    inputs: [{ id: "regrettable", label: "Leavers you wanted to keep", value: "9", help: "Uses “People who left” from the attrition rate." }],
    compute: ({ n }) => ratePct(n("regrettable"), n("leavers"), "Enter people who left (attrition rate) first.", "More than all leavers: check the numbers.")
  },
  {
    id: "firstYear",
    group: "retention",
    label: "First-year attrition",
    formula: "Joiners who left within 12 months ÷ joiners in the group × 100",
    inputs: [
      { id: "cohort", label: "People who joined in the group", value: "40", help: "For example, everyone who joined in the last financial year." },
      { id: "cohortLeft", label: "Of them, left within 12 months", value: "6" }
    ],
    compute: ({ n }) => ratePct(n("cohortLeft"), n("cohort"), "Enter the number of joiners.", "More leavers than joiners: check the numbers.")
  },
  /* ---------- hiring ---------- */
  {
    id: "timeToFill",
    group: "hiring",
    label: "Time to fill",
    formula: "Days from job opened to offer accepted, averaged across roles",
    inputs: [{ id: "fillDays", label: "Days to fill each role", value: "30, 35, 40, 45, 28, 62", kind: "list", help: "One number per role, separated by commas." }],
    compute: ({ raw }) => {
      const xs = parseList(raw("fillDays"));
      if (!xs.length) return NONE("Enter the days for at least one role.");
      const avg = xs.reduce((a, b) => a + b, 0) / xs.length;
      return { value: avg, display: `${plain(avg)} days`, note: `Median ${plain(median(xs))} days across ${xs.length} ${xs.length === 1 ? "role" : "roles"}` };
    }
  },
  {
    id: "costPerHire",
    group: "hiring",
    label: "Cost per hire",
    formula: "Total hiring costs ÷ hires in the same period",
    inputs: [
      { id: "hiringCost", label: "Total hiring costs", value: "16,95,000", prefix: "₹", help: "External and internal costs. The cost per hire calculator itemises them." },
      { id: "hires", label: "Hires", value: "30" }
    ],
    compute: ({ n }) => (n("hires") > 0 && n("hiringCost") >= 0 ? { value: n("hiringCost") / n("hires"), display: inr(n("hiringCost") / n("hires")) } : NONE("Enter the number of hires."))
  },
  {
    id: "offerAcceptance",
    group: "hiring",
    label: "Offer acceptance rate",
    formula: "Offers accepted ÷ offers made × 100",
    inputs: [
      { id: "offers", label: "Offers made", value: "48" },
      { id: "accepted", label: "Offers accepted", value: "40" }
    ],
    compute: ({ n }) => ratePct(n("accepted"), n("offers"), "Enter the number of offers made.", "More acceptances than offers: check the numbers.")
  },
  {
    id: "qualityOfHire",
    group: "hiring",
    label: "Quality of hire",
    formula: "New hires rated ‘meets expectations’ or above at their first review ÷ new hires reviewed × 100",
    inputs: [
      { id: "reviewed", label: "New hires reviewed", value: "38" },
      { id: "meeting", label: "Rated ‘meets’ or above", value: "34" }
    ],
    compute: ({ n }) => ratePct(n("meeting"), n("reviewed"), "Enter the number of new hires reviewed.", "More than the hires reviewed: check the numbers.")
  },
  /* ---------- engagement ---------- */
  {
    id: "enps",
    group: "engagement",
    label: "Employee net promoter score (eNPS)",
    formula: "% promoters (scored 9–10) − % detractors (scored 0–6)",
    inputs: [
      { id: "promoters", label: "Promoters (9–10)", value: "60" },
      { id: "passives", label: "Passives (7–8)", value: "70" },
      { id: "detractors", label: "Detractors (0–6)", value: "40" }
    ],
    compute: ({ n }) => npsOut(n("promoters"), n("passives"), n("detractors"))
  },
  {
    id: "managerNps",
    group: "engagement",
    label: "Manager net promoter score",
    formula: "Same as eNPS, for “How likely are you to recommend your manager to a friend?”",
    inputs: [
      { id: "mPromoters", label: "Promoters (9–10)", value: "80" },
      { id: "mPassives", label: "Passives (7–8)", value: "60" },
      { id: "mDetractors", label: "Detractors (0–6)", value: "30" }
    ],
    compute: ({ n }) => npsOut(n("mPromoters"), n("mPassives"), n("mDetractors"))
  },
  {
    id: "absenteeism",
    group: "engagement",
    label: "Absenteeism rate",
    formula: "Unplanned absence days ÷ (average headcount × working days) × 100",
    uses: ["avgHc"],
    inputs: [
      { id: "absentDays", label: "Unplanned absence days", value: "1,100", help: "Unapproved or same-day absence. Leave on the planned leave calendar is not absence." },
      { id: "workDays", label: "Working days per person in the period", value: "250", suffix: "days" }
    ],
    compute: ({ n }) => ratePct(n("absentDays"), n("avgHc") * n("workDays"), "Enter average headcount and working days.")
  },
  /* ---------- productivity ---------- */
  {
    id: "revenuePerEmployee",
    group: "productivity",
    label: "Revenue per employee",
    formula: "Revenue ÷ average headcount",
    uses: ["avgHc"],
    inputs: [{ id: "revenue", label: "Revenue for the period", value: "50", prefix: "₹", suffix: "crore" }],
    compute: ({ n }) => perHead(n("revenue") * 1e7, n("avgHc"))
  },
  {
    id: "profitPerEmployee",
    group: "productivity",
    label: "Profit per employee",
    formula: "Net profit ÷ average headcount",
    uses: ["avgHc"],
    inputs: [{ id: "profit", label: "Net profit for the period", value: "6", prefix: "₹", suffix: "crore" }],
    compute: ({ n }) => perHead(n("profit") * 1e7, n("avgHc"))
  },
  {
    id: "trainingRoi",
    group: "productivity",
    label: "Training return on investment (ROI)",
    formula: "(Money value of the benefits − programme cost) ÷ programme cost × 100",
    inputs: [
      { id: "benefit", label: "Money value of the benefits", value: "12,00,000", prefix: "₹", help: "Only benefits you can trace to the programme, such as fewer errors or faster output." },
      { id: "programmeCost", label: "Full programme cost", value: "8,00,000", prefix: "₹", help: "Fees, materials, venue and the pay of people while they attend." }
    ],
    compute: ({ n }) => {
      const c = n("programmeCost");
      if (!(c > 0)) return NONE("Enter the programme cost.");
      const roi = ((n("benefit") - c) / c) * 100;
      return { value: roi, display: pct(roi, 0), note: `Benefit–cost ratio ${plain(n("benefit") / c, 2)} : 1` };
    }
  },
  /* ---------- pay ---------- */
  {
    id: "compaRatio",
    group: "pay",
    label: "Compa-ratio",
    formula: "Pay ÷ midpoint of the pay range",
    inputs: [
      { id: "pay", label: "Annual pay", value: "6,00,000", prefix: "₹" },
      { id: "midpoint", label: "Midpoint of the range", value: "6,25,000", prefix: "₹" }
    ],
    compute: ({ n }) => {
      if (!(n("midpoint") > 0) || !(n("pay") > 0)) return NONE("Enter pay and the range midpoint.");
      const cr = n("pay") / n("midpoint");
      return { value: cr, display: plain(cr, 2), note: cr < 1 ? "Below the midpoint" : cr > 1 ? "Above the midpoint" : "At the midpoint" };
    }
  },
  {
    id: "genderGap",
    group: "pay",
    label: "Gender pay gap (mean, unadjusted)",
    formula: "(Men's average pay − women's average pay) ÷ men's average pay × 100",
    inputs: [
      { id: "menAvg", label: "Men's average pay", value: "9,20,000", prefix: "₹" },
      { id: "womenAvg", label: "Women's average pay", value: "8,10,000", prefix: "₹" }
    ],
    compute: ({ n }) => {
      const m = n("menAvg");
      const w = n("womenAvg");
      if (!(m > 0) || !(w > 0)) return NONE("Enter both averages.");
      const gap = ((m - w) / m) * 100;
      return {
        value: gap,
        display: pct(Math.abs(gap)),
        note: gap > 0 ? "Women's average pay is lower" : gap < 0 ? "Women's average pay is higher" : "No difference in averages"
      };
    }
  },
  /* ---------- capacity ---------- */
  {
    id: "benefitTakeUp",
    group: "capacity",
    label: "Benefit take-up rate",
    formula: "Employees using the benefit ÷ employees eligible × 100",
    inputs: [
      { id: "eligible", label: "Employees eligible", value: "200" },
      { id: "using", label: "Employees using it", value: "130" }
    ],
    compute: ({ n }) => ratePct(n("using"), n("eligible"), "Enter the number eligible.", "More users than eligible: check the numbers.")
  },
  {
    id: "poshOnTime",
    group: "capacity",
    label: "POSH inquiries completed on time",
    formula: "Inquiries completed within the legal time limit ÷ inquiries completed × 100",
    inputs: [
      { id: "inquiries", label: "Inquiries completed", value: "3" },
      { id: "inquiriesOnTime", label: "Completed within the time limit", value: "3" }
    ],
    compute: ({ n }) => ratePct(n("inquiriesOnTime"), n("inquiries"), "Enter inquiries completed (0 if none).", "More than the inquiries completed: check the numbers.")
  },
  {
    id: "filingsOnTime",
    group: "capacity",
    label: "Statutory filings on time",
    formula: "Returns and payments made by the due date ÷ returns and payments due × 100",
    inputs: [
      { id: "filingsDue", label: "Returns and payments due", value: "48", help: "PF, ESI, professional tax, TDS, labour welfare fund and others." },
      { id: "filingsOnTime", label: "Made by the due date", value: "46" }
    ],
    compute: ({ n }) => ratePct(n("filingsOnTime"), n("filingsDue"), "Enter the number due.", "More than the number due: check the numbers.")
  },
  {
    id: "hrRatio",
    group: "capacity",
    label: "HR-to-employee ratio",
    formula: "Average headcount ÷ HR team (full-time equivalent)",
    uses: ["avgHc"],
    inputs: [{ id: "hrFte", label: "HR team, full-time equivalent", value: "2.5", help: "Count part-time or shared roles as fractions, e.g. 0.5." }],
    compute: ({ n }) => {
      const hr = n("hrFte");
      const hc = n("avgHc");
      if (!(hr > 0) || !(hc > 0)) return NONE("Enter average headcount and HR team size.");
      return { value: hc / hr, display: `1 : ${plain(hc / hr, 0)}`, note: `${plain((hr / hc) * 100, 2)} HR staff per 100 employees` };
    }
  }
];

/** A rate over the period, plus a yearly figure when the period is not 12 months. */
export function periodRate(count: number, avgHc: number, months: number): MetricOut {
  const r = rate(count, avgHc);
  if (r === null) return NONE("Enter average headcount.");
  if (!(months > 0) || months === 12) return { value: r, display: pct(r), note: months === 12 ? "For the year" : undefined };
  const yearly = (r * 12) / months;
  return { value: r, display: pct(r), note: `In ${plain(months, 1)} ${months === 1 ? "month" : "months"}; about ${pct(yearly)} a year` };
}

function npsOut(p: number, pa: number, d: number): MetricOut {
  const s = nps(p, pa, d);
  if (s === null) return NONE("Enter the survey counts.");
  return { value: s, display: signed(s), note: `${plain(p + pa + d, 0)} responses; scores run from −100 to +100` };
}

function perHead(amount: number, hc: number): MetricOut {
  if (!(hc > 0)) return NONE("Enter average headcount.");
  if (!(amount > 0)) return NONE("Enter the amount.");
  return { value: amount / hc, display: inr(amount / hc) };
}

/** All metric results keyed by id, from a value getter. */
export function computeAll(g: Get): Record<string, MetricOut> {
  return Object.fromEntries(METRICS.filter((m) => m.group !== "shared").map((m) => [m.id, m.compute(g)]));
}
