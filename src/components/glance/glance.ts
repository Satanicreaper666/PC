/**
 * The header glance: a picture of a tool built only from its own data.
 * Pure functions over an entry's Markdown body and frontmatter; nothing here
 * invents a section, a count or a label.
 *
 * How headings are found (docOutline):
 * 1. ATX headings ("## …", "### …"). The document's sections use the
 *    shallowest level that occurs at least twice; a single shallower heading
 *    is the document's title ("## Employee joining form") and is skipped.
 * 2. Letters written without headings may use bold lines as headings
 *    ("**Company property**"). Those count only after the salutation
 *    ("Dear …"), and never when they hold a placeholder or a "Subject:" line.
 * 3. A letter with neither is shown by the details it asks for, in the order
 *    the body uses them.
 */

export type GlanceField = { id: string; label: string; required?: boolean };
export type Band = { min: number; max: number; label: string };

type Heading = { level: number; raw: string; line: number };

const PLACEHOLDER = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;

/** Body lines, with fenced code blanked so a "#" inside code is never read as a heading. */
function bodyLines(body: string): string[] {
  let fenced = false;
  return body.split(/\r?\n/).map((l) => {
    if (/^\s*(```|~~~)/.test(l)) {
      fenced = !fenced;
      return "";
    }
    return fenced ? "" : l;
  });
}

/** Inline Markdown to plain text. Placeholders become their field labels. */
export function plain(md: string, labels?: Map<string, string>): string {
  return md
    .replace(PLACEHOLDER, (_m, id: string) => labels?.get(id) ?? "…")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)/g, "$1$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function headingsOf(lines: string[]): Heading[] {
  const out: Heading[] = [];
  lines.forEach((l, line) => {
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(l);
    if (m) out.push({ level: m[1].length, raw: m[2], line });
  });
  return out;
}

/** The headings at the level the sections use: the shallowest level that occurs at least `min` times. */
function sectionLevel(hs: Heading[], min: number): Heading[] {
  const levels = [...new Set(hs.map((h) => h.level))].sort((a, b) => a - b);
  for (const lv of levels) {
    const at = hs.filter((h) => h.level === lv);
    if (at.length >= min) return at;
  }
  return [];
}

/** "1. Pay" → { n: "1", text: "Pay" }; "Part A: the role" → { n: "A", text: "The role" }; "B. Ratings" → { n: "B", … }. */
export function splitNumber(h: string): { n?: string; text: string } {
  const m = /^(?:Part\s+([A-Z0-9]{1,3})\s*[:.–-]|(\d{1,2})\.|([A-Z])\.)\s+(.+)$/.exec(h);
  if (!m) return { text: h };
  return { n: m[1] ?? m[2] ?? m[3], text: capitalise(m[4]) };
}

/* ---------- Letters, forms and policies ---------- */

export type DocItem = { n?: string; text: string };
export type DocOutline = {
  /** "sections": the document's own headings. "details": no headings, so the details it asks for, in body order. */
  mode: "sections" | "details";
  items: DocItem[];
};

export function docOutline(body: string, fields: GlanceField[]): DocOutline {
  const labels = new Map(fields.map((f) => [f.id, f.label]));
  const lines = bodyLines(body);

  const sections = sectionLevel(headingsOf(lines), 2);
  if (sections.length) {
    return { mode: "sections", items: sections.map((h) => splitNumber(plain(h.raw, labels))) };
  }

  const salutation = lines.findIndex((l) => /^\s*Dear\b/.test(l));
  if (salutation >= 0) {
    const bold = lines
      .slice(salutation + 1)
      .map((l) => /^\s*\*\*([^*]+)\*\*\s*$/.exec(l)?.[1]?.trim())
      .filter((t): t is string => !!t && !t.includes("{{") && !/^(subject|to|re)\b/i.test(t));
    if (bold.length >= 2) return { mode: "sections", items: bold.map((t) => splitNumber(plain(t))) };
  }

  const seen = new Set<string>();
  const items: DocItem[] = [];
  for (const m of body.matchAll(PLACEHOLDER)) {
    const label = labels.get(m[1]);
    if (!label || seen.has(m[1])) continue;
    seen.add(m[1]);
    items.push({ text: label });
  }
  return { mode: "details", items };
}

/* ---------- Checklists ---------- */

export type StepSection = { title: string; count: number };

/** Task items ("- [ ] …") under each section heading. Items before the first heading count in the total only. */
export function checklistOutline(body: string): { sections: StepSection[]; total: number } {
  const lines = bodyLines(body);
  const heads = sectionLevel(headingsOf(lines), 1);
  const headAt = new Map(heads.map((h) => [h.line, h]));
  const task = /^\s*[-*+] \[[ xX]\]\s/;
  const anyBullet = /^\s*[-*+]\s/;
  const useTasks = lines.some((l) => task.test(l));
  const isItem = (l: string) => (useTasks ? task.test(l) : anyBullet.test(l));

  const sections: StepSection[] = [];
  let total = 0;
  let current: StepSection | null = null;
  lines.forEach((l, i) => {
    const h = headAt.get(i);
    if (h) {
      current = { title: plain(h.raw), count: 0 };
      sections.push(current);
      return;
    }
    if (isItem(l)) {
      total++;
      if (current) current.count++;
    }
  });
  return { sections: sections.filter((s) => s.count > 0), total };
}

/* ---------- Plans ---------- */

export type PlanPart = { lead: string; rest?: string };

/** Section headings in order. "Days 1 to 30: listen and learn" splits into a lead and the rest. */
export function planOutline(body: string): PlanPart[] {
  return sectionLevel(headingsOf(bodyLines(body)), 1).map((h) => {
    const text = plain(h.raw);
    const m = /^([^:]{2,40}):\s+(.+)$/.exec(text);
    return m ? { lead: m[1], rest: capitalise(m[2]) } : { lead: text };
  });
}

/* ---------- Surveys ---------- */

export type BandSpan = Band & { share: number };

/** Each band's share of the scale, so the bar is drawn to scale. Bands meet: a band runs to where the next starts. */
export function bandSpans(bands: Band[], min: number, max: number): BandSpan[] {
  const range = max - min || 1;
  const sorted = [...bands].sort((a, b) => a.min - b.min);
  return sorted.map((b, i) => {
    const from = Math.max(min, b.min);
    const to = i < sorted.length - 1 ? sorted[i + 1].min : Math.min(max, b.max);
    return { ...b, share: Math.max(0, (to - from) / range) };
  });
}

/** "2.49" → "2.49"; "2" → "2"; "1.949" → "1.95" (as a reader would say it). */
export const fmtScore = (n: number) => String(Number(n.toFixed(2)));
