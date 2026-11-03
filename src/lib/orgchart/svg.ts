/**
 * The chart as a standalone SVG file: plain shapes and text with system
 * fonts, so it opens anywhere (browsers, Word, PowerPoint, Inkscape) and can
 * be drawn on a canvas for the PNG export.
 */
import type { Org } from "./hierarchy.ts";
import { displayName } from "./hierarchy.ts";
import { LAYOUT, linePath, type Layout, type LayoutOptions } from "./layout.ts";

/** Department colours: the site's categorical slots, then two brand shades. Text always names the department too. */
export const DEPT_COLOURS = ["#4567d8", "#e3a21a", "#12a3b8", "#d8473b", "#8a5cd0", "#2e9a5e", "#3b44a6", "#b5740b"];
export const NO_DEPT_COLOUR = "#c9cee0";

/** One colour per department, biggest department first, so the same file always gets the same colours. */
export function deptColours(org: Org): Map<string, string> {
  const counts = new Map<string, { name: string; n: number; first: number }>();
  org.people.forEach((p, i) => {
    if (!p.dept) return;
    const k = p.dept.toLowerCase();
    const c = counts.get(k);
    if (c) c.n++;
    else counts.set(k, { name: p.dept, n: 1, first: i });
  });
  const sorted = [...counts.entries()].sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first);
  return new Map(sorted.map(([k], idx) => [k, DEPT_COLOURS[idx % DEPT_COLOURS.length]]));
}
export const colourOf = (colours: Map<string, string>, dept: string) => (dept ? (colours.get(dept.toLowerCase()) ?? NO_DEPT_COLOUR) : NO_DEPT_COLOUR);

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Shorten text to roughly fit a width, by character count (SVG has no text measuring outside a browser). */
export function fit(text: string, width: number, fontSize: number, bold = false): string {
  const max = Math.max(4, Math.floor(width / (fontSize * (bold ? 0.6 : 0.54))));
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** "Engineering · Pune" */
export const metaLine = (dept: string, location: string) => [dept, location].filter(Boolean).join(" · ");

export type SvgOptions = {
  title: string;
  /** People whose teams are collapsed: show "+N" with the number of people hidden. */
  collapsed?: ReadonlySet<number>;
  layout?: LayoutOptions;
};

export function chartSvg(org: Org, layout: Layout, opts: SvgOptions): string {
  const o = opts.layout ?? LAYOUT;
  const colours = deptColours(org);
  const W = o.w;
  const H = o.h;
  const font = `'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" font-family="${esc(font)}">`,
    `<title>${esc(opts.title)}</title>`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<path d="${linePath(layout.lines)}" fill="none" stroke="#a9afc6" stroke-width="1.5" stroke-linejoin="round"/>`
  );
  for (const b of layout.boxes) {
    const p = org.people[b.i];
    const name = displayName(p);
    const x = Math.round(b.x * 10) / 10;
    const y = Math.round(b.y * 10) / 10;
    const meta = metaLine(p.dept, p.location);
    const hidden = opts.collapsed?.has(b.i) && org.children[b.i].length ? org.below[b.i] : 0;
    out.push(
      `<g><title>${esc([name, p.title, meta].filter(Boolean).join(", "))}</title>`,
      `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="9" fill="#ffffff" stroke="#c9cee0"/>`,
      `<rect x="${x + 6}" y="${y + 10}" width="4" height="${H - 20}" rx="2" fill="${colourOf(colours, p.dept)}"/>`,
      `<text x="${x + 18}" y="${y + 24}" font-size="14" font-weight="600" fill="#151a3b">${esc(fit(name, W - 28, 14, true))}</text>`
    );
    if (p.title) out.push(`<text x="${x + 18}" y="${y + 43}" font-size="12" fill="#4a5070">${esc(fit(p.title, W - 28, 12))}</text>`);
    if (meta) out.push(`<text x="${x + 18}" y="${y + 61}" font-size="11" fill="#5f6584">${esc(fit(meta, W - 28 - (hidden ? 46 : 0), 11))}</text>`);
    if (hidden) {
      const label = `+${hidden}`;
      const pw = 14 + label.length * 7;
      out.push(
        `<rect x="${x + W - pw - 8}" y="${y + H - 24}" width="${pw}" height="18" rx="9" fill="#eef0fb" stroke="#bcc3ee"/>`,
        `<text x="${x + W - 8 - pw / 2}" y="${y + H - 11}" font-size="11" font-weight="600" fill="#2f3786" text-anchor="middle">${esc(label)}</text>`
      );
    }
    out.push(`</g>`);
  }
  out.push(`</svg>`);
  return out.join("\n");
}
