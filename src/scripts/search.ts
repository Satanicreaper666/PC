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

export async function searchLibrary(q: string, limit = 10): Promise<PagefindResult[] | null> {
  const pf = await loadPagefind();
  if (!pf) return null;
  const res = await pf.search(q);
  if (!res) return [];
  return Promise.all(res.results.slice(0, limit).map((r) => r.data()));
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
