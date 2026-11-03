/**
 * The PowerPoint download, made in the browser with pptxgenjs (installed
 * from npm, bundled with the site). This module is imported only when
 * someone asks for the file, so the library never slows the page down.
 *
 * Slides: title, structure in numbers, the chart as shown, one slide per
 * team (big teams split), departments, and things worth a look.
 */
import PptxGenJS from "pptxgenjs";
import type { Analysis, Settings } from "../../lib/orgchart/analysis.ts";
import { displayName, preorder, type Org } from "../../lib/orgchart/hierarchy.ts";
import { card, contain, grid, SLIDE, summaryRows, teamSlides, type Card, type Rect } from "../../lib/orgchart/slides.ts";
import { colourOf, deptColours } from "../../lib/orgchart/svg.ts";

export type PptxInput = {
  org: Org;
  analysis: Analysis;
  settings: Settings;
  /** The people at the top of what is shown (everyone, or one team). */
  tops: number[];
  /** The chart as a PNG: "image/png;base64,…" and its size in pixels. */
  image: { data: string; w: number; h: number } | null;
  title: string;
  source: string;
  date: string;
  hasDept: boolean;
};

const INK = "151A3B";
const INK2 = "4A5070";
const INK3 = "5F6584";
const LINE = "C9CEE0";
const NEEL = "3B44A6";
const NEEL50 = "EEF0FB";
const CANVAS = "F5F6FA";
const FONT = "Calibri";
const hex = (c: string) => c.replace("#", "").toUpperCase();
const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-IN")} ${n === 1 ? one : many}`;

export async function makePptx(o: PptxInput): Promise<Blob> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "PeopleCraft org chart builder";
  pptx.title = o.title;
  const colours = deptColours(o.org);
  const P = o.org.people;
  const inScope = preorder(o.org.children, o.tops);
  const wholeOrg = o.tops.length === o.org.roots.length && o.tops.every((t, k) => t === o.org.roots[k]);

  const heading = (s: PptxGenJS.Slide, text: string, sub?: string) => {
    s.addText(text, { x: 0.5, y: 0.35, w: 12.33, h: 0.6, fontFace: FONT, fontSize: 24, bold: true, color: INK, margin: 0 });
    if (sub) s.addText(sub, { x: 0.5, y: 0.95, w: 12.33, h: 0.4, fontFace: FONT, fontSize: 12, color: INK2, margin: 0 });
  };
  const footer = (s: PptxGenJS.Slide) => s.addText(`${o.title} · ${o.date}`, { x: 0.5, y: 7.05, w: 12.33, h: 0.3, fontFace: FONT, fontSize: 9, color: INK3, margin: 0 });
  const box = (s: PptxGenJS.Slide, r: Rect, c: Card, colour: string, strong: boolean) => {
    s.addShape(pptx.ShapeType.roundRect, { x: r.x, y: r.y, w: r.w, h: r.h, fill: { color: strong ? NEEL50 : "FFFFFF" }, line: { color: strong ? NEEL : LINE, width: strong ? 1.5 : 0.75 }, rectRadius: 0.12 });
    s.addShape(pptx.ShapeType.rect, { x: r.x + 0.09, y: r.y + 0.14, w: 0.06, h: Math.max(0.1, r.h - 0.28), fill: { color: hex(colour) }, line: { color: hex(colour), width: 0 } });
    const runs: PptxGenJS.TextProps[] = [{ text: c.name, options: { bold: true, fontSize: 13, color: INK, breakLine: true } }];
    if (c.title) runs.push({ text: c.title, options: { fontSize: 10.5, color: INK2, breakLine: true } });
    if (c.meta) runs.push({ text: c.meta, options: { fontSize: 9.5, color: INK3, breakLine: true } });
    if (c.note) runs.push({ text: c.note, options: { fontSize: 9.5, color: NEEL } });
    s.addText(runs, { x: r.x + 0.24, y: r.y + 0.04, w: r.w - 0.32, h: r.h - 0.08, fontFace: FONT, valign: "middle", margin: 0, fit: "shrink" });
  };
  const line = (s: PptxGenJS.Slide, x: number, y: number, w: number, h: number) =>
    s.addShape(pptx.ShapeType.line, { x, y, w, h, line: { color: LINE, width: 1.25 } });

  /* 1. Title */
  let s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.05, w: 1.1, h: 0.08, fill: { color: NEEL }, line: { color: NEEL, width: 0 } });
  s.addText(o.title, { x: 0.8, y: 2.3, w: 11.7, h: 1, fontFace: FONT, fontSize: 40, bold: true, color: INK, margin: 0 });
  const depth = Math.max(...inScope.map((i) => o.org.level[i])) - Math.min(...inScope.map((i) => o.org.level[i])) + 1;
  s.addText(`${plural(inScope.length, "person", "people")} · ${plural(depth, "level", "levels")} · ${o.date}`, { x: 0.8, y: 3.4, w: 11.7, h: 0.5, fontFace: FONT, fontSize: 18, color: INK2, margin: 0 });
  if (o.source) s.addText(`From ${o.source}`, { x: 0.8, y: 3.95, w: 11.7, h: 0.4, fontFace: FONT, fontSize: 13, color: INK3, margin: 0 });
  s.addText("Made with the PeopleCraft org chart builder, on the computer that had the file. Treat it as confidential: it names people and their managers.", {
    x: 0.8,
    y: 6.6,
    w: 11.7,
    h: 0.5,
    fontFace: FONT,
    fontSize: 10,
    color: INK3,
    margin: 0
  });

  /* 2. Structure in numbers */
  s = pptx.addSlide();
  heading(s, "Structure in numbers", wholeOrg ? undefined : "For everyone in the file, not only this team.");
  const rows: PptxGenJS.TableRow[] = summaryRows(o.org, o.analysis, o.settings).map(([k, v], idx) => [
    { text: k, options: { color: INK2, fill: { color: idx % 2 ? "FFFFFF" : CANVAS } } },
    { text: v, options: { bold: true, color: INK, fill: { color: idx % 2 ? "FFFFFF" : CANVAS } } }
  ]);
  s.addTable(rows, { x: 0.5, y: 1.5, w: 12.33, colW: [7.3, 5.03], fontFace: FONT, fontSize: 13, rowH: 0.42, valign: "middle", border: { type: "solid", pt: 0.5, color: LINE } });
  s.addText(
    `The span of control range (${o.settings.narrowBelow} to ${o.settings.wideAbove} direct reports) was chosen in the tool. It is an assumption to discuss, not a standard: the right span depends on the work.`,
    { x: 0.5, y: 6.35, w: 12.33, h: 0.55, fontFace: FONT, fontSize: 11, color: INK3, margin: 0 }
  );
  footer(s);

  /* 3. The chart as shown */
  if (o.image) {
    s = pptx.addSlide();
    heading(s, wholeOrg ? "The chart" : o.title, "As shown in the tool. Download the SVG for a version you can zoom into without losing detail.");
    const r = contain(o.image.w, o.image.h, { x: 0.4, y: 1.5, w: SLIDE.w - 0.8, h: 5.45 });
    s.addImage({ data: o.image.data, x: r.x, y: r.y, w: r.w, h: r.h });
  }

  /* 4. One slide per team */
  const { slides, left } = teamSlides(o.org, o.tops);
  for (const t of slides) {
    s = pptx.addSlide();
    const m = card(o.org, t.manager);
    const kids = o.org.children[t.manager].length;
    heading(s, `${m.name}'s team${t.parts > 1 ? ` (part ${t.part} of ${t.parts})` : ""}`, `${plural(kids, "direct report", "direct reports")}, ${plural(o.org.below[t.manager], "person", "people")} in all`);
    const mb: Rect = { x: (SLIDE.w - 3.6) / 2, y: 1.5, w: 3.6, h: 1.05 };
    box(s, mb, { ...m, note: "" }, colourOf(colours, P[t.manager].dept), true);
    const boxes = grid(t.reports.length, { x: 0.5, y: 3.05, w: SLIDE.w - 1, h: 3.85 }, 4, 0.25, 1.05);
    const firstRow = boxes.filter((b) => Math.abs(b.y - boxes[0].y) < 1e-6);
    const barY = boxes[0].y - 0.2;
    const mid = SLIDE.w / 2;
    line(s, mid, mb.y + mb.h, 0, barY - (mb.y + mb.h));
    const xs = firstRow.map((b) => b.x + b.w / 2);
    const lo = Math.min(mid, ...xs);
    const hi = Math.max(mid, ...xs);
    if (hi - lo > 0.01) line(s, lo, barY, hi - lo, 0);
    for (const x of xs) line(s, x, barY, 0, 0.2);
    t.reports.forEach((rep, k) => box(s, boxes[k], card(o.org, rep), colourOf(colours, P[rep].dept), false));
    footer(s);
  }
  if (left) {
    s = pptx.addSlide();
    heading(s, `${plural(left, "more team slide", "more team slides")} not included`);
    s.addText("This file stops at 150 team slides. In the tool, select a manager and choose “Show only this team” to make a file for one part of the organisation.", {
      x: 0.5,
      y: 1.6,
      w: 12.33,
      h: 1,
      fontFace: FONT,
      fontSize: 16,
      color: INK2,
      margin: 0
    });
  }

  /* 5. Departments */
  if (o.hasDept) {
    s = pptx.addSlide();
    heading(s, "Departments", "Managers are people with at least one direct report; everyone else is an individual contributor.");
    const head = ["Department", "People", "Managers", "Individual contributors", "Share of everyone"].map((h) => ({ text: h, options: { bold: true, color: INK2, fill: { color: CANVAS } } }));
    const shown = o.analysis.departments.slice(0, 12);
    const body: PptxGenJS.TableRow[] = shown.map((g) => [
      { text: g.name, options: { color: INK } },
      { text: String(g.people), options: { color: INK, align: "right" } },
      { text: String(g.managers), options: { color: INK, align: "right" } },
      { text: String(g.ics), options: { color: INK, align: "right" } },
      { text: `${Math.round(g.share)}%`, options: { color: INK, align: "right" } }
    ]);
    s.addTable([head, ...body], { x: 0.5, y: 1.5, w: 12.33, colW: [4.73, 1.7, 1.7, 2.5, 1.7], fontFace: FONT, fontSize: 12, rowH: 0.38, valign: "middle", border: { type: "solid", pt: 0.5, color: LINE } });
    if (o.analysis.departments.length > shown.length)
      s.addText(`And ${plural(o.analysis.departments.length - shown.length, "more department", "more departments")}; the tool lists them all.`, { x: 0.5, y: 6.6, w: 12.33, h: 0.35, fontFace: FONT, fontSize: 11, color: INK3, margin: 0 });
    footer(s);
  }

  /* 6. Worth a look */
  s = pptx.addSlide();
  heading(s, "Worth a look", "Prompts for a conversation, based on the range chosen in the tool. Check the context before acting on any of them.");
  const a = o.analysis;
  const name = (i: number) => displayName(P[i]);
  const blocks: [string, string[], number][] = [
    [`More than ${o.settings.wideAbove} direct reports`, a.span.rows.filter((r) => r.flag === "wide").map((r) => `${name(r.i)} (${r.reports})`), a.span.wide],
    [`Fewer than ${o.settings.narrowBelow} direct reports`, a.span.rows.filter((r) => r.flag === "narrow").map((r) => `${name(r.i)} (${r.reports})`), a.span.narrow],
    ["Only one direct report", a.oneReport.map((x) => `${name(x.i)}: ${name(x.report)}`), a.oneReport.length],
    [o.hasDept ? "Single points of failure" : "Single points of failure (needs a department column)", a.spof.map((x) => `${name(x.i)}, ${x.dept} (${x.inLine} people)`), a.spof.length]
  ];
  blocks.forEach(([title, items, total], k) => {
    const runs: PptxGenJS.TextProps[] = [{ text: `${title}: ${total}`, options: { bold: true, fontSize: 14, color: INK, breakLine: true } }];
    const list = items.slice(0, 6);
    if (!list.length) runs.push({ text: "None.", options: { fontSize: 12, color: INK2 } });
    list.forEach((t, j) => runs.push({ text: t, options: { fontSize: 12, color: INK2, bullet: true, breakLine: j < list.length - 1 || items.length > 6 } }));
    if (items.length > 6) runs.push({ text: `and ${items.length - 6} more`, options: { fontSize: 11, color: INK3 } });
    s.addText(runs, { x: k % 2 ? 6.82 : 0.5, y: k < 2 ? 1.55 : 4.25, w: 6.0, h: 2.55, fontFace: FONT, valign: "top", margin: 0.05 });
  });
  footer(s);

  return (await pptx.write({ outputType: "blob" })) as Blob;
}
