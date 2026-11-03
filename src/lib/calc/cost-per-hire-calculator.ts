/**
 * Cost per hire: everything you spent on hiring in a period, divided by the
 * people who joined in that period.
 *
 *   Cost per hire = (external costs + internal costs) ÷ hires
 *
 * External costs are paid to outside parties (job boards, agencies, checks).
 * Internal costs are your own people and tools (recruiters' time, ATS, interviewers).
 * Count costs and hires for the same period, usually a financial year.
 */

export type CostGroup = "external" | "internal";

export type CostItem = {
  id: string;
  label: string;
  group: CostGroup;
  amount: number;
};

export type CostPerHireInput = {
  items: CostItem[];
  /** People who joined in the same period. */
  hires: number;
  /** Optional: total annual CTC of those hires, for the recruiting cost ratio. */
  hiresAnnualCtc?: number;
};

export type CostShare = CostItem & { share: number; perHire: number };

export type CostPerHireResult = {
  ok: boolean;
  message?: string;
  external: number;
  internal: number;
  total: number;
  costPerHire: number;
  externalPerHire: number;
  internalPerHire: number;
  /** Total hiring cost as a percentage of the hires' annual CTC; null when CTC not given. */
  costRatio: number | null;
  /** Items with an amount above zero, largest first. */
  items: CostShare[];
};

/** The cost lines the calculator asks for, in the order shown. */
export const COST_FIELDS: { id: string; label: string; group: CostGroup; help: string }[] = [
  { id: "ads", label: "Job boards and advertising", group: "external", help: "Portal subscriptions, paid job posts, social media ads." },
  { id: "agency", label: "Agency and search fees", group: "external", help: "Fees paid to recruitment agencies and search firms." },
  { id: "referral", label: "Referral bonuses", group: "external", help: "Bonuses paid to employees for successful referrals." },
  { id: "checks", label: "Assessments and background checks", group: "external", help: "Tests, background and reference checks, medicals." },
  { id: "travel", label: "Candidate travel and relocation", group: "external", help: "Travel for interviews, relocation and joining bonuses." },
  { id: "brand", label: "Employer branding and events", group: "external", help: "Careers site, campus drives, hiring events." },
  { id: "team", label: "Recruiting team cost", group: "internal", help: "CTC of recruiters, for the share of their time spent on hiring." },
  { id: "tools", label: "Recruiting software", group: "internal", help: "Applicant tracking system, assessment tools, sourcing tools." },
  { id: "interviews", label: "Interviewers' time", group: "internal", help: "Hours spent interviewing × hourly cost. Example: 200 hours × ₹800 = ₹1,60,000." }
];

export function computeCostPerHire(input: CostPerHireInput): CostPerHireResult {
  const items = input.items.map((i) => ({ ...i, amount: Number.isFinite(i.amount) ? Math.max(0, i.amount) : 0 }));
  const external = sum(items.filter((i) => i.group === "external").map((i) => i.amount));
  const internal = sum(items.filter((i) => i.group === "internal").map((i) => i.amount));
  const total = external + internal;
  const hires = Number.isFinite(input.hires) ? Math.floor(input.hires) : 0;
  const empty: CostPerHireResult = {
    ok: false,
    external,
    internal,
    total,
    costPerHire: 0,
    externalPerHire: 0,
    internalPerHire: 0,
    costRatio: null,
    items: []
  };
  if (hires < 1) return { ...empty, message: "Enter the number of people who joined in the period (at least 1)." };
  if (total <= 0) return { ...empty, message: "Enter at least one hiring cost for the period." };
  const ctc = input.hiresAnnualCtc && input.hiresAnnualCtc > 0 ? input.hiresAnnualCtc : 0;
  return {
    ok: true,
    external,
    internal,
    total,
    costPerHire: total / hires,
    externalPerHire: external / hires,
    internalPerHire: internal / hires,
    costRatio: ctc > 0 ? (total / ctc) * 100 : null,
    items: items
      .filter((i) => i.amount > 0)
      .map((i) => ({ ...i, share: i.amount / total, perHire: i.amount / hires }))
      .sort((a, b) => b.amount - a.amount)
  };
}

function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}
