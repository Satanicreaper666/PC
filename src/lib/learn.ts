/**
 * Helpers for PeopleCraft Learn (src/content/learn). URLs drop the "NN-" or
 * "guide-" file prefix: 02-people-at-work.mdx -> /learn/people-at-work/.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { LEARN_BLOCKS, LEARN_GUIDES, LEARN_MODULES, type LearnBlockId, type LearnModuleRef } from "../data/learn";

export type LearnEntry = CollectionEntry<"learn">;

export const learnSlug = (e: LearnEntry) => e.id.replace(/^(\d{2}-|guide-)/, "");
export const learnUrl = (e: LearnEntry) => `/learn/${learnSlug(e)}/`;

/** Modules in number order, then guides. Drafts show only in `astro dev`. */
export async function allLearn(): Promise<LearnEntry[]> {
  const all = await getCollection("learn", (e) => import.meta.env.DEV || !e.data.draft);
  const rank = (e: LearnEntry) => (e.data.kind === "module" ? e.data.module ?? 99 : 100);
  return all.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
}
export const learnModules = async () => (await allLearn()).filter((e) => e.data.kind === "module");
export const learnGuides = async () => (await allLearn()).filter((e) => e.data.kind === "guide");

/* ---------- The course plan, merged with what has been written ---------- */

/** Blocks in course order (A to F). */
export const BLOCK_ORDER = Object.keys(LEARN_BLOCKS) as LearnBlockId[];

/** A module from the plan (src/data/learn.ts), with its page if it exists yet. */
export type PlanModule = LearnModuleRef & {
  href: string;
  /** The written module, when there is one. Planned modules without a page show as "Coming soon". */
  entry?: LearnEntry;
  ready: boolean;
  minutes?: number;
};
export type PlanBlock = (typeof LEARN_BLOCKS)[LearnBlockId] & { id: LearnBlockId; modules: PlanModule[] };

/** All six blocks with all twenty planned modules, each marked ready or not. */
export async function coursePlan(): Promise<PlanBlock[]> {
  const written = new Map((await learnModules()).map((e) => [learnSlug(e), e]));
  return BLOCK_ORDER.map((id) => ({
    id,
    ...LEARN_BLOCKS[id],
    modules: LEARN_MODULES.filter((m) => m.block === id)
      .sort((a, b) => a.n - b.n)
      .map((m) => {
        const entry = written.get(m.slug);
        return { ...m, href: `/learn/${m.slug}/`, entry, ready: !!entry, minutes: entry?.data.minutes };
      })
  }));
}

/** The guides from the plan, with their pages if they exist yet. */
export async function guidePlan() {
  const written = new Map((await learnGuides()).map((e) => [learnSlug(e), e]));
  return LEARN_GUIDES.map((g) => {
    const entry = written.get(g.slug);
    return { ...g, href: `/learn/${g.slug}/`, entry, ready: !!entry };
  });
}

/** "Module 4" plus its title, the way the course names a module everywhere. */
export const moduleLabel = (m: { n: number; title: string }) => `Module ${m.n}: ${m.title}`;

/* ---------- Models and practice, pooled from every written module ---------- */

export type LearnModel = LearnEntry["data"]["models"][number];
export type LearnQuizItem = LearnEntry["data"]["quiz"][number];

/** Where a model or question comes from. */
export type ModuleRef = { n: number; title: string; slug: string; href: string; block: LearnBlockId };

const refOf = (e: LearnEntry): ModuleRef => {
  const slug = learnSlug(e);
  const plan = LEARN_MODULES.find((m) => m.slug === slug);
  return {
    n: plan?.n ?? e.data.module ?? 0,
    title: plan?.title ?? e.data.title,
    slug,
    href: learnUrl(e),
    block: plan?.block ?? e.data.block ?? "foundations"
  };
};

/** Every model from every written module, in module order, with the module it comes from. */
export async function allModels(): Promise<{ model: LearnModel; from: ModuleRef }[]> {
  return (await learnModules()).flatMap((e) => e.data.models.map((model) => ({ model, from: refOf(e) })));
}

/** Every check-yourself question from every written module, in module order. */
export async function allQuizItems(): Promise<{ item: LearnQuizItem; from: ModuleRef }[]> {
  return (await learnModules()).flatMap((e) => e.data.quiz.map((item) => ({ item, from: refOf(e) })));
}

/** The deep link to a model's card on its module page. */
export const modelHref = (from: ModuleRef, model: LearnModel) => `${from.href}#model-${model.id}`;

/** "1 model", "8 models": counts are always computed, never typed. */
export const count = (n: number, one: string, many = `${one}s`) => `${new Intl.NumberFormat("en-IN").format(n)} ${n === 1 ? one : many}`;
