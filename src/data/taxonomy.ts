/**
 * The library follows the employee lifecycle used by the original
 * PeopleCraft toolkit, plus who is reading (audiences) and what kind of
 * thing a page is (formats). Change a label here and every page follows.
 */
export const STAGES = ["recruit", "onboard", "grow", "pay", "exit", "lead"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_INFO: Record<Stage, { label: string; short: string; blurb: string; icon: string }> = {
  recruit: {
    label: "Recruit and hire",
    short: "Recruit",
    blurb: "Justify the role, write the JD, interview fairly and make the offer.",
    icon: "search"
  },
  onboard: {
    label: "Onboard",
    short: "Onboard",
    blurb: "Joining forms, documents and the first 90 days.",
    icon: "sprout"
  },
  grow: {
    label: "Perform and grow",
    short: "Grow",
    blurb: "Appraisals, improvement plans, engagement and talent reviews.",
    icon: "chart"
  },
  pay: {
    label: "Pay and comply",
    short: "Comply",
    blurb: "Salary, PF, ESI, professional tax, TDS, leave, POSH and the Labour Codes.",
    icon: "rupee"
  },
  exit: {
    label: "Separate and offboard",
    short: "Exit",
    blurb: "Resignation, notice, full and final settlement and exit interviews.",
    icon: "log-out"
  },
  lead: {
    label: "Lead and plan",
    short: "Lead",
    blurb: "Headcount, budgets, pay equity, culture and the CHRO path.",
    icon: "sliders"
  }
};

export const AUDIENCES = ["hr", "founders", "employees", "students"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_INFO: Record<Audience, { label: string; short: string; path: string; blurb: string; icon: string }> = {
  hr: {
    label: "HR professionals",
    short: "HR professionals",
    path: "/start/hr/",
    blurb: "Compliance answers, ready forms and calculators for everyday HR work.",
    icon: "people"
  },
  founders: {
    label: "Founders and small businesses",
    short: "founders",
    path: "/start/founders/",
    blurb: "Fair, compliant basics for a team without an HR department.",
    icon: "building"
  },
  employees: {
    label: "Employees",
    short: "employees",
    path: "/start/employees/",
    blurb: "Understand your pay slip, leave, rights and how to leave a job well.",
    icon: "user"
  },
  students: {
    label: "Students and job seekers",
    short: "students",
    path: "/start/students/",
    blurb: "Read an offer, understand CTC and start your first job well.",
    icon: "graduation"
  }
};

/** Kinds of toolkit item. Each has its own interactive page type. */
export const TOOL_KINDS = ["app", "calculator", "letter", "form", "policy", "checklist", "survey", "plan"] as const;
export type ToolKind = (typeof TOOL_KINDS)[number];

export const TOOL_KIND_INFO: Record<ToolKind, { label: string; plural: string; icon: string; verb: string }> = {
  app: { label: "Interactive tool", plural: "Interactive tools", icon: "sparkle", verb: "Open" },
  calculator: { label: "Calculator", plural: "Calculators", icon: "calculator", verb: "Calculate" },
  letter: { label: "Letter", plural: "Letters", icon: "mail", verb: "Fill in" },
  form: { label: "Form", plural: "Forms", icon: "file-text", verb: "Fill in" },
  policy: { label: "Policy", plural: "Policies", icon: "book", verb: "Adapt" },
  checklist: { label: "Checklist", plural: "Checklists", icon: "checklist", verb: "Tick off" },
  survey: { label: "Survey or assessment", plural: "Surveys and assessments", icon: "chart", verb: "Score" },
  plan: { label: "Plan or guide", plural: "Plans and guides", icon: "route", verb: "Follow" }
};

/** "HR professionals, founders and employees" */
export function audienceList(list: readonly Audience[]): string {
  const names = list.map((a) => AUDIENCE_INFO[a].short);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
