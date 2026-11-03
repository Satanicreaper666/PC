import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { AUDIENCES, STAGES, TOOL_KINDS } from "./data/taxonomy";
import { resolveFacts } from "./data/statutory";

/**
 * Text that may hold statutory tokens such as {{fact:epf.wageCeiling}} or
 * {{fact:esi.wageCeiling|short}}. They become today's figure from
 * src/data/statutory.ts at build time, so a rate changes in one place.
 */
const txt = z.string().transform(resolveFacts);
/** 120–170 characters after tokens are resolved; used for search results and link previews. */
const desc = z.string().transform(resolveFacts).pipe(z.string().max(200));

const BOOK_IDS = ["labour-law", "tds", "recruitment", "hr-professional"] as const;

const stage = z.enum(STAGES);
const audiences = z.array(z.enum(AUDIENCES)).min(1);
const source = z.object({
  title: z.string(),
  url: z.string(),
  publisher: z.string().optional()
});
/**
 * Links to other library pages, written as
 * "handbooks/labour-law/03-leave-and-working-hours", "toolkit/gratuity-calculator" or "glossary/ctc".
 */
/**
 * A qualified reviewer's sign-off, e.g. reviewedBy: "Priya Rao, Advocate", reviewed: 2027-01-15.
 * Leave both out until a real review has happened; the page then says "Expert review pending".
 */
const review = {
  reviewedBy: z.string().min(3).optional(),
  reviewed: z.coerce.date().optional()
};
const bothOrNeither = (d: { reviewedBy?: string; reviewed?: Date }) => (d.reviewedBy === undefined) === (d.reviewed === undefined);
const reviewMsg = { message: "Set reviewedBy and reviewed together, or neither." };
const related = z.array(z.string()).default([]);
const faq = z.array(z.object({ q: txt, a: txt })).default([]);

/** Handbook chapters: src/content/handbooks/<book>/<NN>-<slug>.mdx */
const handbooks = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/handbooks" }),
  schema: z.object({
    title: z.string(),
    /** 120–170 characters; used for search results and link previews. */
    description: desc,
    book: z.enum(BOOK_IDS),
    chapter: z.number().int().min(1),
    stage: stage.optional(),
    audiences,
    /** Date every fact on the page was last checked against its sources. */
    checked: z.coerce.date(),
    ...review,
    /** 2–5 short sentences for the "In short" box. */
    summary: z.array(txt).min(2).max(5),
    sources: z.array(source).default([]),
    related,
    faq,
    keywords: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  }).refine(bothOrNeither, reviewMsg)
});

const field = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  label: z.string(),
  type: z.enum(["text", "textarea", "date", "number", "email", "tel", "select", "money"]).default("text"),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  help: txt.optional(),
  options: z.array(z.string()).optional(),
  default: txt.optional(),
  group: z.string().optional()
});

const question = z.object({
  id: z.string(),
  text: z.string(),
  dimension: z.string().optional(),
  /** Reverse-scored items (agreeing is a bad sign). */
  reverse: z.boolean().default(false)
});

/** Every toolkit item: calculators, letters, forms, policies, checklists, surveys, plans. */
const toolkit = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/toolkit" }),
  schema: z.object({
    title: z.string(),
    description: desc,
    kind: z.enum(TOOL_KINDS),
    stage,
    audiences,
    order: z.number().default(50),
    /** Original PeopleCraft form code, e.g. "PC-F-03", kept for HR teams who already use it. */
    code: z.string().optional(),
    checked: z.coerce.date(),
    ...review,
    /** One sentence: when to use it. */
    useWhen: txt,
    tips: z.array(txt).default([]),
    /** Calculator component id in src/components/calculators/<id>.astro (kind: calculator). */
    calculator: z.string().optional(),
    /** Calculators and apps: what goes in and what comes out, drawn in the page header. */
    glance: z
      .object({ inputs: z.array(txt).min(1).max(6), output: txt, formula: txt.optional() })
      .optional(),
    /** Fill-in fields for letters, forms, policies and plans; used as {{id}} in the body. */
    fields: z.array(field).default([]),
    /** Survey / assessment items (kind: survey). */
    questions: z.array(question).default([]),
    scale: z
      .object({ min: z.number().int(), max: z.number().int(), labels: z.array(z.string()) })
      .optional(),
    /** Result bands on the average score, lowest first. */
    bands: z.array(z.object({ min: z.number(), max: z.number(), label: z.string(), advice: txt })).default([]),
    sources: z.array(source).default([]),
    related,
    faq,
    keywords: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  }).refine(bothOrNeither, reviewMsg)
});

/** Job descriptions: src/content/jds/<slug>.md, one role each (URL: /jd-library/<slug>/). */
export const JD_LEVELS = ["Entry", "Mid", "Senior", "Manager", "Director", "Executive"] as const;
const jds = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/jds" }),
  schema: z.object({
    title: z.string(),
    /** 120–170 characters, for search results and link previews. */
    description: desc,
    industry: z.string(),
    function: z.string(),
    level: z.enum(JD_LEVELS),
    /** e.g. "5–8 years" */
    experience: z.string(),
    stage: stage.default("recruit"),
    checked: z.coerce.date(),
    ...review,
    /** Two or three plain sentences: why the role exists and what success looks like. */
    summary: txt,
    responsibilities: z.array(txt).min(4),
    competencies: z
      .array(
        z.object({
          name: z.string(),
          type: z.enum(["Technical", "Behavioural"]),
          level: z.enum(["Working knowledge", "Proficient", "Expert"])
        })
      )
      .default([]),
    mustHave: z.array(txt).min(2),
    goodToHave: z.array(txt).default([]),
    /** Interview questions, each with what a strong answer shows. */
    interview: z.array(z.object({ q: txt, look: txt.optional() })).default([]),
    /** Signs of a strong candidate, and warning signs, for the interview panel. */
    greenFlags: z.array(txt).default([]),
    redFlags: z.array(txt).default([]),
    sources: z.array(source).default([]),
    related,
    keywords: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  }).refine(bothOrNeither, reviewMsg)
});

const glossary = defineCollection({
  loader: file("src/content/glossary.json"),
  schema: z.object({
    id: z.string(),
    term: z.string(),
    expansion: z.string().optional(),
    short: txt,
    detail: txt.optional(),
    stage: stage.optional(),
    aliases: z.array(z.string()).default([]),
    related,
    seeAlso: z.array(z.string()).default([])
  })
});

export const collections = { handbooks, toolkit, glossary, jds };
