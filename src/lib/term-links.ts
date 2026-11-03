/**
 * Links the first mention of each glossary term in a chapter's rendered HTML to its
 * definition, at build time (used by components/content/TermLinks.astro). The link
 * carries the one-line definition, which site.ts shows on hover or focus; without
 * JavaScript it is an ordinary link. Defined terms wear the blue highlighter
 * (docs/ART-DIRECTION.md, "Marks and stationery").
 *
 * Only running text is touched: paragraphs, list items and table cells. Headings,
 * links, code, figures (diagrams), SVG, buttons and existing marks are left alone.
 */
type Term = { id: string; term: string; short: string; aliases?: string[] };
type Matcher = { id: string; short: string; re: RegExp; len: number };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildMatchers(terms: Term[]): Matcher[] {
  const list: Matcher[] = [];
  for (const t of terms) {
    for (const name of [t.term, ...(t.aliases ?? [])]) {
      if (!name || name.length < 2) continue;
      // Acronyms and names with capitals inside (CTC, PF, ESI, Form 16) must match their case exactly.
      const caseSensitive = /[A-Z].*[A-Z]|^[A-Z0-9&]+$/.test(name) || /\d/.test(name);
      const re = new RegExp(`(?<![\\p{L}\\p{N}-])${escapeRe(name)}(?![\\p{L}\\p{N}-])`, caseSensitive ? "u" : "iu");
      list.push({ id: t.id, short: t.short, re, len: name.length });
    }
  }
  // Longer names first, so "full and final settlement" wins over "settlement".
  return list.sort((a, b) => b.len - a.len);
}

const TEXT_PARENTS = new Set(["p", "li", "td", "dd"]);
const SKIP = new Set(["a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "figure", "svg", "button", "kbd", "mark", "script", "style", "summary", "label", "select", "textarea", "template", "nav"]);

export function linkTerms(html: string, matchers: Matcher[], max = 12, perBlock = 2): string {
  const used = new Set<string>();
  let count = 0;
  // A paragraph with every other word highlighted is hard to read: at most `perBlock` terms per paragraph or item.
  let inBlock = 0;
  let textDepth = 0;
  let skipDepth = 0;
  // Regions marked data-no-terms (sticky notes, the chapter snapshot) are skipped whole.
  let quiet: { tag: string; depth: number } | null = null;
  const parts = html.split(/(<[^>]+>)/);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (part.startsWith("<")) {
      const m = /^<\/?\s*([a-zA-Z0-9-]+)/.exec(part);
      if (!m) continue;
      const tag = m[1].toLowerCase();
      const closing = part.startsWith("</");
      const selfClosing = part.endsWith("/>");
      if (quiet) {
        if (tag === quiet.tag && !selfClosing) quiet.depth += closing ? -1 : 1;
        if (quiet.depth === 0) quiet = null;
        continue;
      }
      if (!closing && !selfClosing && part.includes("data-no-terms")) {
        quiet = { tag, depth: 1 };
        continue;
      }
      if (SKIP.has(tag) && !selfClosing) skipDepth += closing ? -1 : 1;
      if (TEXT_PARENTS.has(tag) && !selfClosing) {
        textDepth += closing ? -1 : 1;
        if (!closing) inBlock = 0;
      }
      if (skipDepth < 0) skipDepth = 0;
      if (textDepth < 0) textDepth = 0;
      continue;
    }
    if (skipDepth > 0 || textDepth === 0 || count >= max || inBlock >= perBlock || !part.trim()) continue;
    // Find terms in this text run, earliest first.
    let out = "";
    let rest = part;
    while (rest && count < max && inBlock < perBlock) {
      let best: { index: number; text: string; t: Matcher } | null = null;
      for (const t of matchers) {
        if (used.has(t.id)) continue;
        const mm = t.re.exec(rest);
        if (mm && (!best || mm.index < best.index || (mm.index === best.index && mm[0].length > best.text.length))) best = { index: mm.index, text: mm[0], t };
      }
      if (!best) break;
      out += rest.slice(0, best.index);
      out += `<a href="/glossary/#${best.t.id}" class="term-link hl hl-blue" data-term="${best.t.id}" data-def="${escapeAttr(best.t.short)}">${best.text}</a>`;
      used.add(best.t.id);
      count++;
      inBlock++;
      rest = rest.slice(best.index + best.text.length);
    }
    parts[i] = out + rest;
  }
  return parts.join("");
}
