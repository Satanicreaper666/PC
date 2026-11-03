import { getCollection, type CollectionEntry } from "astro:content";
import { isBlankJd } from "../components/jds/jd-template";
import { BOOKS, type BookId } from "../data/books";
import { TOOL_KIND_INFO } from "../data/taxonomy";
import { allLearn, learnSlug, learnUrl } from "./learn";

export type Chapter = CollectionEntry<"handbooks">;
export type Tool = CollectionEntry<"toolkit">;
export type Term = CollectionEntry<"glossary">;
export type Jd = CollectionEntry<"jds">;

const visible = <T extends { data: { draft?: boolean } }>(e: T) => import.meta.env.DEV || !e.data.draft;

/* ---------- URLs ---------- */
export const chapterSlug = (c: Chapter) => c.id.split("/").pop()!.replace(/^\d+-/, "");
export const chapterUrl = (c: Chapter) => `/handbooks/${c.data.book}/${chapterSlug(c)}/`;
export const bookUrl = (b: BookId) => `/handbooks/${b}/`;
export const toolUrl = (t: Tool) => `/toolkit/${t.id}/`;
export const termUrl = (t: Term | string) => `/glossary/#${typeof t === "string" ? t : t.id}`;
export const jdUrl = (j: Jd | string) => `/jd-library/${typeof j === "string" ? j : j.id}/`;

/* ---------- Collections (sorted, drafts hidden in production) ---------- */
let chaptersCache: Chapter[] | null = null;
export async function allChapters(): Promise<Chapter[]> {
  chaptersCache ??= (await getCollection("handbooks", visible)).sort((a, b) =>
    a.data.book === b.data.book ? a.data.chapter - b.data.chapter : a.data.book.localeCompare(b.data.book)
  );
  return chaptersCache;
}
export async function chaptersOf(book: BookId): Promise<Chapter[]> {
  return (await allChapters()).filter((c) => c.data.book === book);
}
let toolsCache: Tool[] | null = null;
export async function allTools(): Promise<Tool[]> {
  toolsCache ??= (await getCollection("toolkit", visible)).sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
  return toolsCache;
}
let jdsCache: Jd[] | null = null;
export async function allJds(): Promise<Jd[]> {
  jdsCache ??= (await getCollection("jds", visible)).sort((a, b) => a.data.title.localeCompare(b.data.title));
  return jdsCache;
}
/** The role JDs only: everything except the blank template. Use this for counts and lists of roles. */
export async function roleJds(): Promise<Jd[]> {
  return (await allJds()).filter((j) => !isBlankJd(j));
}
export async function allTerms(): Promise<Term[]> {
  return (await getCollection("glossary")).sort((a, b) => a.data.term.localeCompare(b.data.term, "en", { sensitivity: "base" }));
}

/* ---------- Reading time ---------- */
export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const words = body
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}[\]()#*_`>|-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/* ---------- Cross-links: "handbooks/labour-law/03-leave", "toolkit/gratuity-calculator", "glossary/ctc", "learn/02-people-at-work" ----------
   A ref to a page that doesn't exist yet (a module still being written, say) is skipped, never an error. */
/** `art` names a spot icon (src/components/art/SpotIcon.astro); `meta` says what the reader gets. */
export type Linked = { href: string; title: string; kind: string; description?: string; icon: string; art: string; meta?: string };

/** One line on what a tool gives the reader, from its own data: "14 details to fill, then Word or PDF". */
export function toolFacts(t: Tool): string {
  const d = t.data;
  const body = t.body ?? "";
  switch (d.kind) {
    case "letter":
    case "form":
    case "policy":
      return `${d.fields.length} details to fill, then Word or PDF`;
    case "checklist": {
      const steps = (body.match(/^\s*[-*] \[[ xX]\]/gm) ?? []).length || (body.match(/^\s*[-*] /gm) ?? []).length;
      return `${steps} steps, ticks saved as you go`;
    }
    case "survey":
      return `${d.questions.length} questions with an instant score`;
    case "plan": {
      const parts = (body.match(/^## /gm) ?? []).length;
      return parts ? `${parts} parts to adapt` : "Ready to adapt";
    }
    case "calculator":
      return d.glance ? `Gives ${d.glance.output.charAt(0).toLowerCase()}${d.glance.output.slice(1)}, as you type` : "Result as you type";
    case "app":
      return "Works with your CSV or Excel file";
  }
}

export async function resolveRefs(refs: string[]): Promise<Linked[]> {
  if (!refs.length) return [];
  // Learn modules are loaded only when a ref asks for one.
  const [chapters, tools, terms, jds, learn] = await Promise.all([
    allChapters(),
    allTools(),
    allTerms(),
    allJds(),
    refs.some((r) => r.startsWith("learn/")) ? allLearn().catch(() => []) : Promise.resolve([])
  ]);
  const out: Linked[] = [];
  for (const ref of refs) {
    const [kind, ...rest] = ref.split("/");
    const key = rest.join("/");
    if (kind === "learn") {
      // "learn/02-people-at-work" (the file id) or "learn/people-at-work" (the slug). Not written yet: skipped.
      const e = learn.find((x) => x.id === key) ?? learn.find((x) => learnSlug(x) === key);
      if (e) {
        const guide = e.data.kind === "guide";
        out.push({
          href: learnUrl(e),
          title: e.data.title,
          kind: guide ? "Learn guide" : "Learn module",
          description: e.data.description,
          icon: "graduation",
          art: "learn",
          meta: guide ? `${e.data.minutes} min read` : `Module ${e.data.module}, ${e.data.minutes} min`
        });
      }
    } else if (kind === "handbooks") {
      const c = chapters.find((x) => x.id === key || `${x.data.book}/${chapterSlug(x)}` === key);
      if (c) out.push({ href: chapterUrl(c), title: c.data.title, kind: `${BOOKS[c.data.book].short} handbook`, description: c.data.description, icon: BOOKS[c.data.book].icon, art: c.data.book, meta: `Chapter ${c.data.chapter}, ${readingMinutes(c.body)} min read` });
      else if (key in BOOKS) {
        const b = BOOKS[key as BookId];
        out.push({ href: bookUrl(key as BookId), title: b.title, kind: "Handbook", description: b.subtitle, icon: b.icon, art: key });
      }
    } else if (kind === "toolkit") {
      const t = tools.find((x) => x.id === key);
      if (t) out.push({ href: toolUrl(t), title: t.data.title, kind: TOOL_KIND_INFO[t.data.kind].label, description: t.data.description, icon: TOOL_KIND_INFO[t.data.kind].icon, art: t.data.kind, meta: toolFacts(t) });
    } else if (kind === "jds") {
      const j = jds.find((x) => x.id === key);
      if (j) out.push({ href: jdUrl(j), title: j.data.title, kind: "Job description", description: j.data.description, icon: "briefcase", art: "jd", meta: isBlankJd(j) ? "Template for any role" : `${j.data.level}, ${j.data.experience}` });
    } else if (kind === "glossary") {
      const g = terms.find((x) => x.id === key);
      if (g) out.push({ href: termUrl(g), title: g.data.term, kind: "Glossary", description: g.data.short, icon: "glossary", art: "glossary" });
    }
  }
  return out;
}

/* ---------- Structured data helpers ---------- */
export function breadcrumbLd(site: URL | undefined, trail: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: new URL(t.href, site).toString() }))
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") } }))
  };
}
