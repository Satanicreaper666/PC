/**
 * Woven patterns, drawn as SVG rectangles. The four structures are the basic
 * weaves of a handloom; each handbook is woven in one of them, so a book is
 * recognisable by its cloth as well as its title.
 *
 * Coordinates: weft threads run across (rows), warp threads run down (cols).
 * At every crossing one thread lies on top. `warpOver(r, c)` decides which.
 */
export type WeaveStructure = "plain" | "twill" | "basket" | "herringbone";

export function warpOver(structure: WeaveStructure, r: number, c: number): boolean {
  switch (structure) {
    case "plain":
      return (r + c) % 2 === 0;
    case "twill":
      return (((c + r) % 4) + 4) % 4 < 2;
    case "basket":
      return (Math.floor(r / 2) + Math.floor(c / 2)) % 2 === 0;
    case "herringbone": {
      const dir = Math.floor(c / 4) % 2 === 0 ? 1 : -1;
      return (((c + dir * r) % 4) + 4) % 4 < 2;
    }
  }
}

export interface WeaveColours {
  /** Down threads. */
  warp: string;
  /** Across threads. */
  weft: string;
  /** The background that shows between threads. */
  gap: string;
  /** One highlighted thread, like the turmeric warp in the logo. */
  accent?: string;
}

export interface WeaveOptions extends WeaveColours {
  structure?: WeaveStructure;
  cols: number;
  rows: number;
  /** Distance between thread centres. */
  cell?: number;
  /** Thread width. */
  thread?: number;
  /** Warp columns drawn in the accent colour. */
  accentCols?: readonly number[];
  /** Weft rows drawn in the accent colour. */
  accentRows?: readonly number[];
  /** How far threads run past the last crossing, so the cloth looks cut, not finished. */
  bleed?: number;
}

export interface WeaveRect {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

export interface Weave {
  width: number;
  height: number;
  rects: WeaveRect[];
  gapWidth: number;
  gap: string;
}

export function weave(o: WeaveOptions): Weave {
  const structure = o.structure ?? "plain";
  const cell = o.cell ?? 20;
  const t = o.thread ?? Math.round(cell * 0.58);
  const bleed = o.bleed ?? cell * 0.6;
  const off = (cell - t) / 2;
  const width = o.cols * cell + bleed * 2;
  const height = o.rows * cell + bleed * 2;
  const accentCols = new Set(o.accentCols ?? []);
  const accentRows = new Set(o.accentRows ?? []);
  const warpFill = (c: number) => (o.accent && accentCols.has(c) ? o.accent : o.warp);
  const weftFill = (r: number) => (o.accent && accentRows.has(r) ? o.accent : o.weft);

  const rects: WeaveRect[] = [];
  // 1. Weft threads, full width.
  for (let r = 0; r < o.rows; r++) rects.push({ x: 0, y: bleed + r * cell + off, w: width, h: t, fill: weftFill(r) });
  // 2. Warp threads, full height, on top of every weft.
  for (let c = 0; c < o.cols; c++) rects.push({ x: bleed + c * cell + off, y: 0, w: t, h: height, fill: warpFill(c) });
  // 3. Where the weft lies on top, lay a short weft segment back over the warp.
  for (let r = 0; r < o.rows; r++)
    for (let c = 0; c < o.cols; c++)
      if (!warpOver(structure, r, c)) rects.push({ x: bleed + c * cell + off - off * 0.9, y: bleed + r * cell + off, w: t + off * 1.8, h: t, fill: weftFill(r) });

  return { width, height, rects, gapWidth: Math.max(1.2, off), gap: o.gap };
}
