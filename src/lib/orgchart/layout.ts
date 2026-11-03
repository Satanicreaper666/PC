/**
 * Where each box goes. Pure geometry: the on-screen chart, the SVG and PNG
 * exports all use it, so they always match.
 *
 * Two arrangements keep big charts readable:
 * - a manager whose visible reports are all individual contributors (or
 *   collapsed teams) gets them in a compact column under them, split into
 *   several columns when the team is large;
 * - any other manager gets their reports side by side, centred under them.
 */
import { preorder } from "./hierarchy.ts";

export type LayoutOptions = {
  /** Box width and height. */
  w: number;
  h: number;
  /** Space between teams side by side, and between a manager and their reports. */
  gapX: number;
  gapY: number;
  /** How far a column of reports sits to the right of its manager. */
  indent: number;
  /** Space between boxes in a column. */
  stackGap: number;
  /** Most boxes in one column before it splits. */
  stackMax: number;
  /** Space between separate trees, and around the whole chart. */
  rootGap: number;
  pad: number;
};
export const LAYOUT: LayoutOptions = { w: 220, h: 76, gapX: 28, gapY: 48, indent: 26, stackGap: 12, stackMax: 8, rootGap: 72, pad: 24 };

export type Placed = { i: number; x: number; y: number };
/** Connector lines as polylines: [x1, y1, x2, y2, …]. */
export type Layout = { boxes: Placed[]; lines: number[][]; width: number; height: number };

type Size = { w: number; h: number; mode: "leaf" | "stack" | "row"; px: number; cols: number; perCol: number; offset: number };

export function layoutChart(children: number[][], tops: number[], collapsed: ReadonlySet<number>, o: LayoutOptions = LAYOUT): Layout {
  const kids = (i: number) => (collapsed.has(i) ? [] : children[i]);
  const visible = preorder(
    children.map((_, i) => kids(i)),
    tops
  );
  const size = new Map<number, Size>();
  const W = o.w;
  const H = o.h;

  // Sizes bottom-up (reverse pre-order visits every report before its manager).
  for (let k = visible.length - 1; k >= 0; k--) {
    const i = visible[k];
    const ks = kids(i);
    if (!ks.length) {
      size.set(i, { w: W, h: H, mode: "leaf", px: 0, cols: 0, perCol: 0, offset: 0 });
      continue;
    }
    const sizes = ks.map((c) => size.get(c)!);
    if (sizes.every((s) => s.mode === "leaf")) {
      const cols = Math.ceil(ks.length / o.stackMax);
      const perCol = Math.ceil(ks.length / cols);
      const colW = o.indent + W;
      const top = cols === 1 ? o.gapY / 2 : o.gapY;
      size.set(i, { w: cols * colW + (cols - 1) * o.gapX, h: H + top + perCol * H + (perCol - 1) * o.stackGap, mode: "stack", px: 0, cols, perCol, offset: 0 });
      continue;
    }
    const total = sizes.reduce((a, s) => a + s.w, 0) + o.gapX * (ks.length - 1);
    const offset = Math.max(0, (W - total) / 2);
    let x = offset;
    const anchors = sizes.map((s) => {
      const a = x + s.px + W / 2;
      x += s.w + o.gapX;
      return a;
    });
    const w = Math.max(W, total);
    const px = Math.min(w - W, Math.max(0, (anchors[0] + anchors[anchors.length - 1]) / 2 - W / 2));
    size.set(i, { w, h: H + o.gapY + Math.max(...sizes.map((s) => s.h)), mode: "row", px, cols: 0, perCol: 0, offset });
  }

  const boxes: Placed[] = [];
  const lines: number[][] = [];
  const place = (top: number, x0: number, y0: number) => {
    const stack: [number, number, number][] = [[top, x0, y0]];
    while (stack.length) {
      const [i, x, y] = stack.pop()!;
      const s = size.get(i)!;
      boxes.push({ i, x: x + s.px, y });
      const ks = kids(i);
      if (s.mode === "stack") {
        const colW = o.indent + W;
        const firstY = y + H + (s.cols === 1 ? o.gapY / 2 : o.gapY);
        const barY = y + H + o.gapY / 2;
        const spineX = (c: number) => x + c * (colW + o.gapX) + o.indent / 2;
        for (let c = 0; c < s.cols; c++) {
          const inCol = ks.slice(c * s.perCol, (c + 1) * s.perCol);
          if (!inCol.length) continue;
          const lastMid = firstY + (inCol.length - 1) * (H + o.stackGap) + H / 2;
          lines.push([spineX(c), c === 0 ? y + H : barY, spineX(c), lastMid]);
          inCol.forEach((child, r) => {
            const cy = firstY + r * (H + o.stackGap);
            lines.push([spineX(c), cy + H / 2, spineX(c) + o.indent / 2, cy + H / 2]);
            stack.push([child, spineX(c) + o.indent / 2, cy]);
          });
        }
        if (s.cols > 1) lines.push([spineX(0), barY, spineX(Math.ceil(ks.length / s.perCol) - 1), barY]);
      } else if (s.mode === "row") {
        const pcx = x + s.px + W / 2;
        const barY = y + H + o.gapY / 2;
        const childY = y + H + o.gapY;
        let cx = x + s.offset;
        const centres: number[] = [];
        for (const child of ks) {
          const cs = size.get(child)!;
          centres.push(cx + cs.px + W / 2);
          stack.push([child, cx, childY]);
          cx += cs.w + o.gapX;
        }
        lines.push([pcx, y + H, pcx, barY]);
        const lo = Math.min(pcx, ...centres);
        const hi = Math.max(pcx, ...centres);
        if (hi > lo) lines.push([lo, barY, hi, barY]);
        for (const c of centres) lines.push([c, barY, c, childY]);
      }
    }
  };

  let x = o.pad;
  let height = 0;
  tops.forEach((t, k) => {
    const s = size.get(t);
    if (!s) return;
    if (k) x += o.rootGap;
    place(t, x, o.pad);
    x += s.w;
    height = Math.max(height, s.h);
  });
  return { boxes, lines, width: Math.round(x + o.pad), height: Math.round(height + 2 * o.pad) };
}

/** SVG path data for the connector lines. */
export const linePath = (lines: number[][]) =>
  lines.map((l) => l.reduce((d, v, k) => d + (k % 2 ? ` ${round(v)}` : `${k ? " L" : "M"}${round(v)}`), "")).join(" ");
const round = (v: number) => String(Math.round(v * 10) / 10);
