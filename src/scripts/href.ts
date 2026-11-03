/**
 * Build a link to a page of this site from a root path like "/search/?q=pf".
 * On the real site that is the path itself. In the offline preview build
 * (scripts/make-preview.mjs sets <html data-root="../../">) links must be
 * relative and point at index.html files, so they work from any folder.
 */
export function siteHref(path: string): string {
  const root = document.documentElement.dataset.root;
  if (root === undefined || !path.startsWith("/")) return path;
  const cut = path.search(/[?#]/);
  const base = cut === -1 ? path : path.slice(0, cut);
  const rest = cut === -1 ? "" : path.slice(cut);
  const clean = base.replace(/^\/+/, "");
  const file = clean === "" || clean.endsWith("/") ? `${clean}index.html` : /\.[a-z0-9]+$/i.test(clean) ? clean : `${clean}/index.html`;
  return `${root}${file}${rest}`;
}
