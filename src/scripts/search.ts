import { siteHref } from "./href";

/**
 * Offline search with Pagefind. The index is generated after `astro build`
 * into /pagefind/, and only downloaded the first time someone searches.
 */
type PagefindResult = {
  url: string;
  excerpt: string;
  meta: { title?: string; kind?: string };
  filters?: Record<string, string[]>;
};
type Pagefind = {
  options: (o: Record<string, unknown>) => Promise<void>;
  filters: () => Promise<Record<string, Record<string, number>>>;
  search: (q: string) => Promise<{ results: Array<{ data: () => Promise<PagefindResult> }> } | null>;
  debouncedSearch?: (q: string, o?: unknown, ms?: number) => Promise<{ results: Array<{ data: () => Promise<PagefindResult> }> } | null>;
};

let loading: Promise<Pagefind | null> | null = null;

export function loadPagefind(): Promise<Pagefind | null> {
  loading ??= (async () => {
    try {
      // Absolute URL: import() resolves relative paths against this module, not the page.
      const url = new URL(siteHref("/pagefind/pagefind.js"), document.baseURI).href;
      const mod = (await import(/* @vite-ignore */ url)) as Pagefind;
      // Root-relative result URLs ("/toolkit/x/") wherever the site is served; siteHref() adapts them for previews.
      await mod.options({ excerptLength: 22, baseUrl: "/" });
      // Pagefind only reports per-section counts once its filter index is loaded.
      await mod.filters();
      return mod;
    } catch {
      return null;
    }
  })();
  return loading;
}

/* ---------- Query help: how people in India actually search ---------- */

/** Words that describe the format someone wants, not the topic. Pagefind needs every word to match, so they hide good pages. */
const FILLER = /\b(?:format|formats|sample|samples|template|templates|pdf|download|docx?|word file|example|examples|free|online|in india|india)\b/gi;

/** Indian HR shorthand and spellings → the words the library uses. */
const SYNONYMS: [RegExp, string][] = [
  [/\blabor\b/gi, "labour"],
  [/\b(?:f\s*&\s*f|fnf|f\s+and\s+f|full\s*&\s*final)\b/gi, "full and final"],
  [/\b(?:pay\s?slips?|salary\s+slips?|wage\s+slips?)\b/gi, "payslip"],
  [/\bposh\b/gi, "sexual harassment"],
  [/\besic\b/gi, "esi"],
  [/\bepfo\b/gi, "epf"],
  [/\bpf\b/gi, "provident fund"],
  [/\bpt\b/gi, "professional tax"],
  [/\blop\b/gi, "loss of pay"],
  [/\bjd\b/gi, "job description"],
  [/\bresignation\s+mail\b/gi, "resignation letter"],
  [/\buan\b/gi, "uan provident fund"]
];

/** Common HR words, for "did you mean". Kept short on purpose: only words the library covers. */
const VOCAB = (
  "gratuity provident pension maternity paternity salary resignation relieving experience appointment termination notice encashment " +
  "professional attrition probation appraisal increment harassment bonus overtime minimum allowance deduction settlement offboarding " +
  "onboarding interview reference warning cause leave holiday payroll compliance contract employee employer statutory labour wages " +
  "ctc payslip internship certificate confirmation policy checklist calculator handbook glossary recruitment hiring sourcing screening " +
  "offer joining exit survey engagement retention budget headcount analytics equity performance improvement competency nominee " +
  "insurance esi epf tds form deductor perquisite regime exemption investment declaration contractor gig fixed term"
).split(" ");

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** "gratuty calculater" → "gratuity calculator"; null when nothing changes. */
export function fixTypos(q: string): string | null {
  let changed = false;
  const out = q
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      if (w.length < 4 || VOCAB.includes(w)) return w;
      let best = w;
      let bestD = w.length > 6 ? 3 : 2;
      for (const v of VOCAB) {
        const d = editDistance(w, v);
        if (d < bestD) {
          best = v;
          bestD = d;
        }
      }
      if (best !== w) changed = true;
      return best;
    })
    .join(" ");
  return changed ? out : null;
}

/**
 * The query as typed, then versions worth trying too: without filler words, in the
 * library's own words, and (marked as a guess) with a typo fixed.
 */
export function queryVariants(q: string): { q: string; guess: boolean }[] {
  const typed = q.trim();
  const clean = (s: string) => s.replace(FILLER, " ").replace(/\s+/g, " ").trim();
  let syn = typed;
  for (const [rx, to] of SYNONYMS) syn = syn.replace(rx, to);
  const out = [typed, clean(typed), clean(syn)].filter(Boolean).map((v) => ({ q: v, guess: false }));
  const typo = fixTypos(clean(syn) || typed);
  if (typo) out.push({ q: typo, guess: true });
  return out.filter((v, i) => out.findIndex((w) => w.q === v.q) === i);
}

type PfResult = { id: string; score: number; data: () => Promise<PagefindResult> };
type PfResponse = { results: PfResult[]; filters?: Record<string, Record<string, number>> };
type PfSearch = (q: string, o?: unknown) => Promise<PfResponse | null>;

/**
 * Search every variant and merge: a page found by the typed query keeps its score,
 * one found only through a variant ranks a little lower. `shownFor` is set when
 * the typed query found nothing and a corrected one did.
 */
export async function searchMerged(pf: { search: PfSearch }, q: string, opts?: unknown): Promise<PfResponse & { shownFor?: string }> {
  const variants = queryVariants(q);
  const responses = await Promise.all(variants.map((v) => pf.search(v.q, opts)));
  const best = new Map<string, PfResult>();
  let filters: PfResponse["filters"];
  let most = -1;
  responses.forEach((res, i) => {
    if (!res) return;
    if (res.results.length > most) {
      most = res.results.length;
      filters = res.filters;
    }
    const weight = variants[i].guess ? 0.9 : 1;
    for (const r of res.results) {
      const s = r.score * weight;
      const seen = best.get(r.id);
      if (!seen || seen.score < s) best.set(r.id, { ...r, score: s });
    }
  });
  const results = [...best.values()].sort((a, b) => b.score - a.score);
  const typedFound = (responses[0]?.results.length ?? 0) > 0;
  const firstHit = responses.findIndex((r) => (r?.results.length ?? 0) > 0);
  const shownFor = !typedFound && firstHit > 0 && variants[firstHit].q.toLowerCase() !== q.trim().toLowerCase() ? variants[firstHit].q : undefined;
  return { results, filters, ...(shownFor ? { shownFor } : {}) };
}

export async function searchLibrary(q: string, limit = 10): Promise<(PagefindResult[] & { shownFor?: string }) | null> {
  const pf = await loadPagefind();
  if (!pf) return null;
  const res = await searchMerged(pf as unknown as { search: PfSearch }, q);
  const out = (await Promise.all(res.results.slice(0, limit).map((r) => r.data()))) as PagefindResult[] & { shownFor?: string };
  if (res.shownFor) out.shownFor = res.shownFor;
  return out;
}

/** Rebuild a Pagefind excerpt safely: keep text and <mark>, drop everything else. */
export function renderExcerpt(html: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const doc = new DOMParser().parseFromString(`<p>${html}</p>`, "text/html");
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        frag.appendChild(document.createTextNode(child.textContent ?? ""));
      } else if (child instanceof HTMLElement && child.tagName === "MARK") {
        const m = document.createElement("mark");
        m.textContent = child.textContent ?? "";
        frag.appendChild(m);
      } else {
        walk(child);
      }
    });
  };
  walk(doc.body.firstChild ?? doc.body);
  return frag;
}

export function resultItem(r: PagefindResult): HTMLLIElement {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = siteHref(r.url);
  const kind = document.createElement("span");
  kind.className = "kind";
  kind.textContent = r.meta.kind ?? r.filters?.section?.[0] ?? "Page";
  const title = document.createElement("span");
  title.className = "title";
  title.textContent = r.meta.title ?? r.url;
  const ex = document.createElement("span");
  ex.className = "excerpt";
  ex.appendChild(renderExcerpt(r.excerpt));
  a.append(kind, title, ex);
  li.appendChild(a);
  return li;
}
