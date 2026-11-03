/**
 * HR budget builder: an annual HR budget from your own unit costs.
 *
 *   Hires              = new roles + replacements (headcount × attrition %)
 *   Hiring             = hires × cost per hire
 *   HR team            = HR people × average cost per HR person
 *   Per-employee lines = headcount × cost per employee (technology is per month × 12)
 *   Contingency        = subtotal × contingency %
 *   Total              = subtotal + contingency
 *
 * There are no built-in benchmarks: every unit cost is an input.
 */

export type BudgetInput = {
  headcount: number;
  /** Annual revenue, ₹ (optional; for "% of revenue"). */
  revenue?: number;
  /** Annual payroll cost (total CTC), ₹ (optional; for "% of payroll"). */
  payroll?: number;
  hrPeople: number;
  hrCostPerPerson: number;
  newRoles: number;
  attritionPct: number;
  costPerHire: number;
  /** ₹ per employee per year. */
  learningPerEmployee: number;
  /** ₹ per employee per month (HRMS, payroll, attendance software). */
  techPerEmployeeMonth: number;
  /** ₹ per employee per year. */
  engagementPerEmployee: number;
  /** ₹ per employee per year. */
  wellbeingPerEmployee: number;
  /** ₹ a year: audits, legal retainers, registrations and renewals. */
  compliance: number;
  /** ₹ a year: anything else (surveys, consultants, employer branding). */
  other: number;
  contingencyPct: number;
};

export type BudgetLine = { id: string; label: string; amount: number; detail: string };

export type BudgetResult = {
  ok: boolean;
  message?: string;
  replacements: number;
  hires: number;
  lines: BudgetLine[];
  subtotal: number;
  contingency: number;
  total: number;
  perEmployee: number;
  pctRevenue: number | null;
  pctPayroll: number | null;
};

/** Whole people: replacements are rounded to the nearest person. */
export function replacementsFor(headcount: number, attritionPct: number) {
  return Math.round((Math.max(0, headcount) * Math.max(0, attritionPct)) / 100);
}

export function buildBudget(i: BudgetInput): BudgetResult {
  const empty: BudgetResult = { ok: false, replacements: 0, hires: 0, lines: [], subtotal: 0, contingency: 0, total: 0, perEmployee: 0, pctRevenue: null, pctPayroll: null };
  const hc = Math.floor(i.headcount);
  if (!(hc >= 1)) return { ...empty, message: "Enter your total headcount (at least 1)." };
  if (!(i.attritionPct >= 0 && i.attritionPct <= 100)) return { ...empty, message: "Attrition should be between 0% and 100%." };
  if (!(i.contingencyPct >= 0 && i.contingencyPct <= 100)) return { ...empty, message: "Contingency should be between 0% and 100%." };
  const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

  const replacements = replacementsFor(hc, i.attritionPct);
  const newRoles = Math.max(0, Math.round(pos(i.newRoles)));
  const hires = newRoles + replacements;
  const lines: BudgetLine[] = [
    { id: "team", label: "HR team", amount: pos(i.hrPeople) * pos(i.hrCostPerPerson), detail: `${fmtNum(pos(i.hrPeople))} people × cost per person` },
    { id: "hiring", label: "Hiring", amount: hires * pos(i.costPerHire), detail: `${hires} hires (${newRoles} new roles + ${replacements} replacements) × cost per hire` },
    { id: "learning", label: "Learning and development", amount: hc * pos(i.learningPerEmployee), detail: `${hc} employees × amount per employee` },
    { id: "tech", label: "HR technology", amount: hc * pos(i.techPerEmployeeMonth) * 12, detail: `${hc} employees × monthly amount × 12` },
    { id: "engagement", label: "Engagement and recognition", amount: hc * pos(i.engagementPerEmployee), detail: `${hc} employees × amount per employee` },
    { id: "wellbeing", label: "Wellbeing programmes", amount: hc * pos(i.wellbeingPerEmployee), detail: `${hc} employees × amount per employee` },
    { id: "compliance", label: "Compliance and legal", amount: pos(i.compliance), detail: "Fixed amount for the year" },
    { id: "other", label: "Other HR costs", amount: pos(i.other), detail: "Fixed amount for the year" }
  ];
  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const contingency = (subtotal * i.contingencyPct) / 100;
  const total = subtotal + contingency;
  if (total <= 0) return { ...empty, replacements, hires, lines, message: "Enter at least one cost to build the budget." };
  return {
    ok: true,
    replacements,
    hires,
    lines,
    subtotal,
    contingency,
    total,
    perEmployee: total / hc,
    pctRevenue: i.revenue && i.revenue > 0 ? (total / i.revenue) * 100 : null,
    pctPayroll: i.payroll && i.payroll > 0 ? (total / i.payroll) * 100 : null
  };
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(n);
}
