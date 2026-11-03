/**
 * My desk: what the server code (src/pages/desk.astro) and the browser code
 * (src/scripts/desk.ts, desk-page.ts) agree on. No DOM here, so pages can import it.
 *
 * Every key and cache starts with "pc-" or "pc_", so the privacy page's
 * "Clear everything" (keys matching /^(pc[_-]|peoplecraft)/i, caches named "pc-…")
 * removes all of it.
 */
export const DESK_KEYS = {
  /** Pinned chapters, tools, JDs and glossary terms, newest first. */
  pins: "pc-desk-pins",
  /** The last 12 library pages opened, newest first. */
  recent: "pc-desk-recent",
  /** Chapters read: { "/handbooks/tds/salary-tds/": time read }. */
  read: "pc-desk-read",
  /** When a checklist was last ticked: { "pc_cl_onboarding-checklist": time }. */
  edits: "pc-desk-edits"
} as const;

/**
 * Kept by the tools themselves:
 *   pc-drafts-<template>  every draft of a letter, form, policy or JD (src/scripts/drafts.ts)
 *   pc_tpl_<template>     a single draft saved before named drafts existed (moved on next open)
 *   pc_cl_<checklist>     checklist ticks; pc-cl-plan-<checklist> its owners and due dates
 */
export const DRAFTS_PREFIX = "pc-drafts-";
export const LEGACY_DRAFT_PREFIX = "pc_tpl_";
export const CHECKLIST_PREFIX = "pc_cl_";
export const CHECKLIST_PLAN_PREFIX = "pc-cl-plan-";
/** A team survey's responses, once a second person is added (src/scripts/survey-tool.ts). */
export const SURVEY_PREFIX = "pc-sv-";

/**
 * Offline copies made by public/sw.js; keep these names in step with that file.
 * Pages are kept in "pc-pages-<build id>", the files they need in "pc-files-<build id>",
 * and the list of pinned paths the worker must never drop at KEEP_URL in KEEP_CACHE.
 */
export const PAGES_CACHE_PREFIX = "pc-pages-";
export const KEEP_CACHE = "pc-keep";
export const KEEP_URL = "/__pc-keep.json";

/** A page on the desk. `href` is a root path such as "/toolkit/offer-letter/" or "/glossary/#ctc". */
export type DeskItem = {
  href: string;
  title: string;
  /** "Letter", "Labour law handbook", "Job description", "Glossary" */
  kind: string;
  /** A spot icon name (src/components/art/SpotIcon.astro): "letter", "labour-law", "jd", "glossary" */
  art: string;
  description?: string;
  meta?: string;
  code?: string;
  /** When it was pinned or opened (ms since 1970). */
  at: number;
};

/** A fill-in template (letter, form, policy or JD) the desk can report drafts for. */
export type DraftMeta = {
  /** The template id: "offer-letter", "jd-data-scientist". */
  tpl: string;
  title: string;
  href: string;
  kind: string;
  /** Required field ids. */
  req: string[];
  /** Field id → hash of its pre-filled value, so a draft that only holds the defaults isn't "in progress". */
  def: Record<string, string>;
  /** Number of fields. */
  n: number;
  /** The field holding the person's name, which names an unnamed draft. */
  nameField?: string;
};
/** A checklist or a survey: something kept by its id. */
export type ToolMeta = { id: string; title: string; href: string };
export type BookMeta = { id: string; title: string; href: string; chapters: { n: number; title: string; href: string }[] };

/** FNV-1a, 32 bits, as 8 hex digits. Compares a saved value with a field's default without shipping the default. */
export function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
