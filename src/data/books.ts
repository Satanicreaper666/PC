import type { Audience, Stage } from "./taxonomy";
import type { WeaveStructure } from "../lib/weave";

/**
 * The four handbooks. Chapters live in src/content/handbooks/<id>/NN-slug.mdx.
 * Old single-page URLs redirect to these (see public/.htaccess).
 */
export const BOOKS = {
  "labour-law": {
    title: "Indian Labour Law Handbook",
    short: "Labour law",
    subtitle: "The four Labour Codes, explained chapter by chapter for people who run HR.",
    description:
      "Wages, working hours, leave, social security, fixed-term work, termination, POSH, state rules, checklists and penalties under India's Labour Codes.",
    audiences: ["hr", "founders", "employees"] as Audience[],
    stage: "pay" as Stage,
    oldUrl: "/labor-law-handbook.html",
    icon: "scale",
    cloth: { structure: "plain", warp: "#3B44A6", weft: "#6B76D2", gap: "#11143A", accent: "#EFAB22", accentCols: [3], accentRows: [] as number[] },
    /** What the new law renamed or replaced, shown as corrections on the book's page. */
    changes: [
      { old: "29 central labour laws", now: "4 Labour Codes" },
      { old: "Payment of Gratuity Act", now: "Code on Social Security" },
      { old: "Industrial Disputes Act", now: "Industrial Relations Code" }
    ]
  },
  tds: {
    title: "TDS on Salary for HR",
    short: "TDS",
    subtitle: "What payroll and HR must get right on salary tax, from CTC design to Form 130, the old Form 16.",
    description:
      "Salary TDS under the Income-tax Act, 2025: regimes, CTC structuring, perquisites, declarations, joiners and leavers, Form 130 (the old Form 16), dates and penalties.",
    audiences: ["hr", "founders", "employees"] as Audience[],
    stage: "pay" as Stage,
    oldUrl: "/tds-handbook.html",
    icon: "rupee",
    cloth: { structure: "twill", warp: "#EFAB22", weft: "#B5740B", gap: "#2A1B05", accent: "#949EE2", accentCols: [2], accentRows: [] as number[] },
    changes: [
      { old: "Income-tax Act, 1961", now: "Income-tax Act, 2025" },
      { old: "Form 16", now: "Form 130" },
      { old: "Form 24Q", now: "Form 138" },
      { old: "Form 12BB", now: "Form 124" }
    ]
  },
  recruitment: {
    title: "Recruitment Mastery",
    short: "Recruitment",
    subtitle: "Hire well in India, from questioning the role to the first 90 days.",
    description:
      "Headcount justification, job descriptions, sourcing, screening, structured interviews, offers and negotiation, employer branding on a small budget, onboarding and hiring metrics.",
    audiences: ["hr", "founders"] as Audience[],
    stage: "recruit" as Stage,
    oldUrl: "/recruitment-mastery.html",
    icon: "search",
    cloth: { structure: "basket", warp: "#3B44A6", weft: "#F7C24D", gap: "#11143A", accent: "#F7C24D", accentCols: [] as number[], accentRows: [] as number[] },
    changes: [] as { old: string; now: string }[]
  },
  "hr-professional": {
    title: "The Complete HR Professional",
    short: "HR professional",
    subtitle: "The skills, judgement and career path of modern HR, adapted for Indian workplaces.",
    description:
      "A competency model drawing on SHRM, CIPD and AIHR frameworks: ethics, business acumen, analytics, AI, influence, business partnering, employee experience, performance, crises and the path to CHRO.",
    audiences: ["hr", "students"] as Audience[],
    stage: "lead" as Stage,
    oldUrl: "/hr-professional.html",
    icon: "graduation",
    cloth: { structure: "herringbone", warp: "#949EE2", weft: "#2F3786", gap: "#1B1F4C", accent: "#EFAB22", accentCols: [] as number[], accentRows: [5] },
    changes: [] as { old: string; now: string }[]
  }
} as const;

export type BookId = keyof typeof BOOKS;
/** Each book is woven in one of the four basic structures (docs/ART-DIRECTION.md, "Covers"). */
export type Cloth = { structure: WeaveStructure; warp: string; weft: string; gap: string; accent: string; accentCols: number[]; accentRows: number[] };
export const BOOK_IDS = Object.keys(BOOKS) as BookId[];
