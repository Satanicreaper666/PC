/**
 * The PowerPoint export, planned without PowerPoint: which slides there are,
 * what goes on each and where. The page turns the plan into a .pptx with
 * pptxgenjs. Sizes are in inches on a 16:9 slide (13.33 × 7.5 in).
 */
import type { Analysis, Settings } from "./analysis.ts";
import { displayName, preorder, type Org } from "./hierarchy.ts";
import { metaLine } from "./svg.ts";

export const SLIDE = { w: 13.333, h: 7.5 };
export type Rect = { x: number; y: number; w: number; h: number };
export type TeamSlide = { manager: number; reports: number[]; part: number; parts: number };

/** Direct reports per team slide: 4 columns × 3 rows. */
export const PER_SLIDE = 12;
/** Team slides in one file; a bigger organisation can be exported a team at a time. */
export const MAX_TEAM_SLIDES = 150;

/** One slide (or more, for big teams) per manager, top-down, for everyone under `tops`. */
export function teamSlides(org: Org, tops: number[], perSlide = PER_SLIDE, max = MAX_TEAM_SLIDES): { slides: TeamSlide[]; left: number } {
  const all: TeamSlide[] = [];
  for (const m of preorder(org.children, tops)) {
    const kids = org.children[m];
    if (!kids.length) continue;
    const parts = Math.ceil(kids.length / perSlide);
    for (let p = 0; p < parts; p++) all.push({ manager: m, reports: kids.slice(p * perSlide, (p + 1) * perSlide), part: p + 1, parts });
  }
  return { slides: all.slice(0, max), left: Math.max(0, all.length - max) };
}

/** Boxes for `n` people in up to `cols` columns, centred in the area. */
export function grid(n: number, area: Rect, cols = 4, gap = 0.25, maxH = 1.2): Rect[] {
  if (n <= 0) return [];
  const c = Math.min(cols, n);
  const rows = Math.ceil(n / c);
  const w = (area.w - gap * (cols - 1)) / cols;
  const h = Math.min(maxH, (area.h - gap * (rows - 1)) / rows);
  const out: Rect[] = [];
  for (let k = 0; k < n; k++) {
    const r = Math.floor(k / c);
    const inRow = Math.min(c, n - r * c);
    const rowW = inRow * w + (inRow - 1) * gap;
    const x0 = area.x + (area.w - rowW) / 2;
    out.push({ x: x0 + (k % c) * (w + gap), y: area.y + r * (h + gap), w, h });
  }
  return out;
}

/** Scale a picture to fit inside an area without stretching it, centred. */
export function contain(w: number, h: number, area: Rect): Rect {
  const s = Math.min(area.w / w, area.h / h);
  const cw = w * s;
  const ch = h * s;
  return { x: area.x + (area.w - cw) / 2, y: area.y + (area.h - ch) / 2, w: cw, h: ch };
}

export type Card = { name: string; title: string; meta: string; note: string };
export function card(org: Org, i: number): Card {
  const p = org.people[i];
  const kids = org.children[i].length;
  return {
    name: displayName(p),
    title: p.title,
    meta: metaLine(p.dept, p.location),
    note: kids ? `Manages ${kids} ${kids === 1 ? "person" : "people"} directly, ${org.below[i]} in all` : ""
  };
}

const n1 = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** The "Structure in numbers" slide: label and value pairs. */
export function summaryRows(org: Org, a: Analysis, s: Settings): [string, string][] {
  const widest = a.span.widest;
  return [
    ["People", String(a.people)],
    ["Levels, from the top to the deepest person", String(a.levels)],
    ["Managers (anyone with at least one direct report)", String(a.managers)],
    ["Individual contributors", String(a.ics)],
    ["Individual contributors per manager", a.icsPerManager === null ? "–" : n1(a.icsPerManager)],
    ["Median span of control", a.span.median === null ? "–" : `${n1(a.span.median)} direct reports`],
    ["Widest span", widest ? `${widest.reports} direct reports (${displayName(org.people[widest.i])})` : "–"],
    [`Managers with fewer than ${s.narrowBelow} direct reports`, String(a.span.narrow)],
    [`Managers with more than ${s.wideAbove} direct reports`, String(a.span.wide)],
    ["Managers with only one direct report", String(a.oneReport.length)],
    ["Single points of failure (see the definition on the tool page)", String(a.spof.length)]
  ];
}
