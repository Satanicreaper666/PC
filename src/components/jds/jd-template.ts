/**
 * JD library helpers: the fill-in fields and the Markdown body that the shared
 * template engine (src/scripts/template-engine.ts) turns into a live, exportable
 * document. Pure functions only, so pages and components can share them.
 */
import type { Jd } from "../../lib/library";

export const BLANK_JD_ID = "blank-job-description";
export const isBlankJd = (j: Jd | string) => (typeof j === "string" ? j : j.id) === BLANK_JD_ID;

type Level = Jd["data"]["level"];
export const LEVEL_ORDER: Level[] = ["Entry", "Mid", "Senior", "Manager", "Director", "Executive"];
export const LEVEL_INFO: Record<Level, { label: string; rank: number }> = {
  Entry: { label: "Entry level", rank: 1 },
  Mid: { label: "Mid level", rank: 2 },
  Senior: { label: "Senior", rank: 3 },
  Manager: { label: "Manager", rank: 4 },
  Director: { label: "Director", rank: 5 },
  Executive: { label: "Executive", rank: 6 }
};

/** How many JDs sit at each level, for the level ladders. */
export function levelCounts(jds: Jd[]): Record<Level, number> {
  return Object.fromEntries(LEVEL_ORDER.map((l) => [l, jds.filter((j) => j.data.level === l).length])) as Record<Level, number>;
}

/** "5–8 years" → [5, 8]; null when the text isn't a range of years. */
export function yearRange(experience: string): [number, number] | null {
  const m = experience.match(/(\d+)\s*(?:–|-|to)\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** The six parts of a good JD, in the order to write them, read from the blank template's guide. */
export function jdParts(body: string | undefined): string[] {
  const found = [...(body ?? "").matchAll(/^\d+\.\s+\*\*(.+?)\.?\*\*/gm)].map((m) => m[1]);
  return found.length === 6
    ? found
    : ["Why the role exists", "What they'll do", "What they need", "Good to have", "Pay, place and terms", "How to apply"];
}

/** Competency levels, lowest first, with what each means for an interviewer. */
export const COMPETENCY_LEVELS = [
  { name: "Working knowledge", meaning: "Does it with guidance and knows when to ask." },
  { name: "Proficient", meaning: "Does it well without supervision." },
  { name: "Expert", meaning: "Handles complex cases and teaches others." }
] as const;
export const competencyRank = (level: string) => COMPETENCY_LEVELS.findIndex((l) => l.name === level) + 1;

/** Sources for the fair-hiring points every JD page makes in "Before you post it". */
export const FAIR_HIRING_SOURCES = [
  {
    title: "The Code on Wages, 2019 (section 3: no discrimination on the ground of gender in recruitment)",
    url: "https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf",
    publisher: "India Code"
  },
  {
    title: "The Transgender Persons (Protection of Rights) Act, 2019 (sections 3 and 9)",
    url: "https://prsindia.org/files/bills_acts/bills_parliament/2019/The%20Transgender%20Persons%20(Protection%20of%20Rights)%20Act,%202019.pdf",
    publisher: "PRS Legislative Research"
  },
  {
    title: "Disability and workplace diversity: an Indian employment law perspective (Rights of Persons with Disabilities Act, 2016)",
    url: "https://www.azbpartners.com/bank/disability-and-workplace-diversity-an-indian-employment-law-perspective-diversity-and-equality-law-june-2019",
    publisher: "AZB & Partners"
  },
  {
    title: "The Digital Personal Data Protection Act, 2023",
    url: "https://www.indiacode.nic.in/bitstream/123456789/22037/2/a2023-22.pdf",
    publisher: "India Code"
  },
  {
    title: "India's Digital Personal Data Protection Act: phased rollout and key compliance milestones",
    url: "https://www.azbpartners.com/bank/indias-digital-personal-data-protection-act-phased-rollout-and-key-compliance-milestones/",
    publisher: "AZB & Partners"
  }
];

type Source = { title: string; url: string; publisher?: string };
/** The JD's own sources first, then the page-wide ones, without duplicate URLs. */
export function mergeSources(own: Source[], extra: Source[]): Source[] {
  const seen = new Set<string>();
  return [...own, ...extra].filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}

/** Same field shape the shared TemplateTool reads from toolkit entries. */
export type TemplateField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "date" | "number" | "email" | "tel" | "select" | "money";
  required: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  default?: string;
  group?: string;
};

export function jdFields(j: Jd): TemplateField[] {
  const d = j.data;
  const blank = isBlankJd(j);
  const company = "Your company";
  const role = "The role";
  const work = "What the job involves";
  const apply = "Pay and how to apply";
  const examples = (list: string[], n: number) => `One per line. For example:\n${list.slice(0, n).join("\n")}`;
  return [
    { id: "company", label: "Company name", type: "text", required: true, placeholder: "Asha Textiles Pvt Ltd", group: company },
    {
      id: "about_company",
      label: "About the company",
      type: "textarea",
      required: false,
      placeholder: "Two lines on what you do, for example: We make billing software used by 4,000 clinics across South India.",
      group: company
    },
    {
      id: "job_title",
      label: "Job title",
      type: "text",
      required: true,
      default: blank ? undefined : d.title,
      placeholder: blank ? "Payroll executive" : undefined,
      help: "Use the title people search for, not an internal grade.",
      group: role
    },
    { id: "location", label: "Location", type: "text", required: true, placeholder: "Bengaluru (Whitefield office)", group: role },
    { id: "work_mode", label: "Work mode", type: "select", required: true, options: ["On-site", "Hybrid", "Remote"], group: role },
    { id: "reporting_to", label: "Reports to", type: "text", required: false, placeholder: "Head of operations", group: role },
    {
      id: "employment_type",
      label: "Employment type",
      type: "text",
      required: false,
      placeholder: "Permanent, or fixed-term for 12 months",
      group: role
    },
    ...(blank
      ? ([
          {
            id: "about_role",
            label: "Why the role exists",
            type: "textarea",
            required: true,
            placeholder: "What this person will achieve in their first six months, in two or three sentences.",
            group: work
          },
          {
            id: "duties",
            label: "What they'll do",
            type: "textarea",
            required: true,
            placeholder: examples(d.responsibilities, 3),
            help: "Five to seven lines, each a real deliverable that starts with a verb.",
            group: work
          },
          {
            id: "must_have",
            label: "What they need",
            type: "textarea",
            required: true,
            placeholder: examples(d.mustHave, 2),
            help: "Three to five things needed in the first months. Name skills and results, not age or years for their own sake.",
            group: work
          },
          { id: "good_to_have", label: "Good to have", type: "textarea", required: false, placeholder: examples(d.goodToHave, 2), group: work },
          { id: "experience", label: "Typical experience", type: "text", required: false, placeholder: "2–4 years, or equivalent experience", group: work }
        ] satisfies TemplateField[])
      : []),
    {
      id: "pay_range",
      label: "Pay range",
      type: "text",
      required: false,
      placeholder: "₹8 to 11 lakh a year (CTC)",
      help: "Set it from your own pay data. A range in the post saves time on both sides.",
      group: apply
    },
    { id: "apply_by", label: "Apply by", type: "date", required: false, group: apply },
    {
      id: "how_to_apply",
      label: "How to apply",
      type: "textarea",
      required: true,
      placeholder: "Email your CV and three lines on why this role interests you to careers@example.com. We reply to every applicant within 10 working days.",
      group: apply
    }
  ];
}

/** Escape Markdown so role text from the content files renders literally. */
const md = (s: string) => s.replace(/([\\`*_<>[\]#|])/g, "\\$1");

/**
 * The job advert as Markdown with {{field}} placeholders. Optional details sit
 * in their own paragraph or list item so the engine hides them when empty.
 * Keep "What you'll need" as the third ### heading: the JD page ticks the list
 * after it (see .tool-area in src/pages/jd-library/[slug].astro).
 */
export function jdBody(j: Jd): string {
  const d = j.data;
  const blank = isBlankJd(j);
  const out: string[] = ["## {{job_title}}", "", "**{{company}}**", "", "{{about_company}}", "", "### About the role", ""];
  out.push(blank ? "{{about_role}}" : md(d.summary), "", "### What you'll do", "");
  if (blank) out.push("{{duties}}");
  else out.push(...d.responsibilities.map((r) => `- ${md(r)}`));
  out.push("", "### What you'll need", "");
  if (blank) out.push("{{must_have}}");
  else out.push(...d.mustHave.map((r) => `- ${md(r)}`));
  out.push("");
  if (blank) out.push("**Good to have**", "{{good_to_have}}", "");
  else if (d.goodToHave.length) out.push("### Good to have", "", ...d.goodToHave.map((r) => `- ${md(r)}`), "");
  out.push("### Pay and terms", "");
  out.push("- **Pay:** {{pay_range}}");
  out.push("- **Location:** {{location}} ({{work_mode}})");
  out.push("- **Reports to:** {{reporting_to}}");
  out.push("- **Employment type:** {{employment_type}}");
  out.push(
    blank
      ? "- **Typical experience:** {{experience}}"
      : `- **Typical experience:** ${md(d.experience)}, though what you have done matters more than the number of years`
  );
  out.push("", "### How to apply", "", "{{how_to_apply}}", "", "Apply by {{apply_by}}.", "");
  out.push(
    "We welcome applicants of every gender, age, background and ability. If you need any adjustment to apply or to take part in an interview, tell us and we'll arrange it."
  );
  return out.join("\n");
}
