/**
 * PeopleCraft Learn: the course plan. One source of truth for blocks, module
 * numbers and URLs, so the hub, the course map and every agent agree.
 * Module files: src/content/learn/<NN>-<slug>.mdx; guides: guide-<slug>.mdx.
 * Built from research/07 (crosswalk) and research/08 (12-month plan), 4 Nov 2026.
 */
export type LearnBlockId = "foundations" | "core" | "relations" | "strategy" | "frontier" | "credentials";

export const LEARN_BLOCKS: Record<
  LearnBlockId,
  { letter: string; title: string; weeks: string; blurb: string }
> = {
  foundations: {
    letter: "A",
    title: "Foundations",
    weeks: "Weeks 1–10",
    blurb: "How a business makes money, why people behave as they do, and how to argue from evidence."
  },
  core: {
    letter: "B",
    title: "The HR functions",
    weeks: "Weeks 11–25",
    blurb: "The employee lifecycle, done well: plan, hire, develop, manage performance, reward and keep people."
  },
  relations: {
    letter: "C",
    title: "Employee relations and law",
    weeks: "Weeks 26–33",
    blurb: "Voice, conflict, unions and discipline, then the law in India, the UK and the US."
  },
  strategy: {
    letter: "D",
    title: "Strategic HR",
    weeks: "Weeks 34–41",
    blurb: "Linking people to strategy, shaping culture and change, and leading with integrity."
  },
  frontier: {
    letter: "E",
    title: "The frontier",
    weeks: "Weeks 42–48",
    blurb: "Wellbeing and inclusion, AI and HR technology, and HR across borders and for society."
  },
  credentials: {
    letter: "F",
    title: "Credentials",
    weeks: "Weeks 49–52",
    blurb: "Turning what you know into SHRM and CIPD results, and a capstone you can show."
  }
};

export type LearnModuleRef = { n: number; slug: string; title: string; block: LearnBlockId };

/** Canonical module list. File = `${String(n).padStart(2, "0")}-${slug}.mdx`, URL = `/learn/${slug}/`. */
export const LEARN_MODULES: LearnModuleRef[] = [
  { n: 1, slug: "business-acumen-for-hr", title: "Business acumen for HR", block: "foundations" },
  { n: 2, slug: "people-at-work", title: "People at work: motivation, jobs and teams", block: "foundations" },
  { n: 3, slug: "evidence-based-hr", title: "Evidence-based HR: data, metrics and research", block: "foundations" },
  { n: 4, slug: "workforce-planning-and-org-design", title: "Workforce planning and organisation design", block: "core" },
  { n: 5, slug: "talent-acquisition", title: "Talent acquisition and the science of selection", block: "core" },
  { n: 6, slug: "learning-and-development", title: "Learning and development", block: "core" },
  { n: 7, slug: "performance-management", title: "Performance management", block: "core" },
  { n: 8, slug: "reward-and-total-rewards", title: "Reward and total rewards", block: "core" },
  { n: 9, slug: "talent-and-engagement", title: "Talent, succession, engagement and retention", block: "core" },
  { n: 10, slug: "employee-relations", title: "Employee relations and industrial relations", block: "relations" },
  { n: 11, slug: "indian-labour-law", title: "Indian labour law: the Codes in practice", block: "relations" },
  { n: 12, slug: "uk-and-us-employment-law", title: "UK and US employment law for CIPD and SHRM", block: "relations" },
  { n: 13, slug: "strategic-hrm", title: "Strategic HRM and the HR operating model", block: "strategy" },
  { n: 14, slug: "culture-change-and-od", title: "Culture, change and organisation development", block: "strategy" },
  { n: 15, slug: "leadership-ethics-and-influence", title: "Leadership, ethics and influence", block: "strategy" },
  { n: 16, slug: "wellbeing-and-inclusion", title: "Wellbeing, inclusion and employee experience", block: "frontier" },
  { n: 17, slug: "hr-technology-and-ai", title: "HR technology, AI and the future of work", block: "frontier" },
  { n: 18, slug: "global-hr-and-esg", title: "Global HR, CSR and ESG", block: "frontier" },
  { n: 19, slug: "shrm-exam-prep", title: "Preparing for SHRM-CP and SHRM-SCP", block: "credentials" },
  { n: 20, slug: "cipd-assignments-and-capstone", title: "Writing CIPD assignments, and your capstone", block: "credentials" }
];

/** Guides sit beside the modules: file guide-<slug>.mdx, URL /learn/<slug>/. */
export const LEARN_GUIDES = [
  { slug: "how-this-course-works", title: "How this course works" },
  { slug: "credentials", title: "XLRI, CIPD or SHRM: which credential, from India" },
  { slug: "the-map", title: "One map of what XLRI, CIPD and SHRM teach" }
] as const;

/** The three schools the course draws on, with how each one teaches and tests. */
export const SCHOOLS = {
  xlri: { name: "XLRI", long: "XLRI – Xavier School of Management, PGDM (HRM)", tests: "Cases, projects and exams" },
  cipd: { name: "CIPD", long: "Chartered Institute of Personnel and Development, Level 5 and Level 7", tests: "Written workplace assignments" },
  shrm: { name: "SHRM", long: "Society for Human Resource Management, SHRM-CP and SHRM-SCP", tests: "An exam of knowledge and judgement questions" }
} as const;
