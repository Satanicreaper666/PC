/**
 * 2D cut-paper shapes for the hero diorama. Units are the stick-figure grid
 * from docs/ART-DIRECTION.md ("Stick people"): 1 unit = limb thickness.
 * Every shape is drawn in a standee's own plane: x to the right, y up, feet on y = 0.
 */
import { Path, Shape, Vector2 } from "three";

export type Pt = readonly [number, number];

const TAU = Math.PI * 2;

/** A rounded stroke from a to b, `w` thick: one strip of paper with round ends. */
export function strip(a: Pt, b: Pt, w: number): Shape {
  const r = w / 2;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const s = new Shape();
  s.absarc(b[0], b[1], r, ang - Math.PI / 2, ang + Math.PI / 2, false);
  s.absarc(a[0], a[1], r, ang + Math.PI / 2, ang + Math.PI * 1.5, false);
  s.closePath();
  return s;
}

/** A polyline stroke as overlapping strips (round joins come for free). */
export function polyStrip(points: readonly Pt[], w: number): Shape[] {
  const out: Shape[] = [];
  for (let i = 1; i < points.length; i++) out.push(strip(points[i - 1], points[i], w));
  return out;
}

export function disc(cx: number, cy: number, r: number): Shape {
  const s = new Shape();
  s.absarc(cx, cy, r, 0, TAU, false);
  return s;
}

function roundRectPath<T extends Path>(p: T, x: number, y: number, w: number, h: number, r: number, reverse = false): T {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (!reverse) {
    p.moveTo(x + r, y);
    p.lineTo(x + w - r, y);
    p.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    p.lineTo(x + w, y + h - r);
    p.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    p.lineTo(x + r, y + h);
    p.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    p.lineTo(x, y + r);
    p.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  } else {
    p.moveTo(x + r, y);
    p.absarc(x + r, y + r, r, Math.PI * 1.5, Math.PI, true);
    p.lineTo(x, y + h - r);
    p.absarc(x + r, y + h - r, r, Math.PI, Math.PI / 2, true);
    p.lineTo(x + w - r, y + h);
    p.absarc(x + w - r, y + h - r, r, Math.PI / 2, 0, true);
    p.lineTo(x + w, y + r);
    p.absarc(x + w - r, y + r, r, 0, -Math.PI / 2, true);
  }
  p.closePath();
  return p;
}

/** Rectangle with rounded corners; x, y is the bottom-left corner. */
export function rect(x: number, y: number, w: number, h: number, r = 0): Shape {
  return roundRectPath(new Shape(), x, y, w, h, r);
}

/** Rectangle frame: outer rounded rectangle with a rectangular hole. */
export function frame(x: number, y: number, w: number, h: number, r: number, hole: [number, number, number, number], holeR = 0): Shape {
  const s = rect(x, y, w, h, r);
  s.holes.push(roundRectPath(new Path(), hole[0], hole[1], hole[2], hole[3], holeR, true));
  return s;
}

export function poly(points: readonly Pt[]): Shape {
  return new Shape(points.map(([x, y]) => new Vector2(x, y)));
}

/** A sheet of paper with its top-right corner folded over: [sheet, fold]. */
export function sheet(x: number, y: number, w: number, h: number, fold = Math.min(w, h) * 0.28): [Shape, Shape] {
  const body = poly([
    [x, y],
    [x + w, y],
    [x + w, y + h - fold],
    [x + w - fold, y + h],
    [x, y + h]
  ]);
  const flap = poly([
    [x + w - fold, y + h],
    [x + w - fold, y + h - fold],
    [x + w, y + h - fold]
  ]);
  return [body, flap];
}

/**
 * A hand-cut version of a shape: each outline point moves a little along its
 * normal, by a smooth, repeatable wobble (`amp` units at most).
 */
export function handCut(shape: Shape, amp: number, seed = 1, divisions = 24): Shape {
  const pts = shape.extractPoints(divisions).shape;
  const n = pts.length;
  let along = 0;
  const out: Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    if (i > 0) along += pts[i].distanceTo(pts[i - 1]);
    const tx = b.x - a.x;
    const ty = b.y - a.y;
    const len = Math.hypot(tx, ty) || 1;
    const w = amp * (0.6 * Math.sin(along * 0.21 + seed) + 0.4 * Math.sin(along * 0.57 + seed * 2.3));
    out.push(new Vector2(pts[i].x + (ty / len) * w, pts[i].y - (tx / len) * w));
  }
  return new Shape(out);
}

/** Turn every shape in a list around (cx, cy) by `deg` degrees. */
export function rotateShapes(shapes: Shape[], deg: number, cx = 0, cy = 0): Shape[] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return shapes.map((shape) => {
    const turn = (v: Vector2) => new Vector2(cx + (v.x - cx) * c - (v.y - cy) * s, cy + (v.x - cx) * s + (v.y - cy) * c);
    const out = new Shape(shape.extractPoints(10).shape.map(turn));
    for (const h of shape.holes) out.holes.push(new Path(h.getPoints(10).map(turn)));
    return out;
  });
}

/**
 * The rupee sign as strokes, inside a box `size` tall centred on (cx, cy).
 * Built from strips so it needs no font.
 */
export function rupee(cx: number, cy: number, size: number, w: number): Shape[] {
  const k = size;
  const X = (u: number) => cx + (u - 0.36) * k;
  const Y = (v: number) => cy + (v - 0.5) * k;
  const top = 1;
  const bar2 = 0.76;
  const bowlEnd = 0.5;
  const out: Shape[] = [strip([X(0), Y(top)], [X(0.72), Y(top)], w), strip([X(0), Y(bar2)], [X(0.72), Y(bar2)], w)];
  // Bowl: from the top bar, round to the right, back to the left at mid height.
  const bowl: Pt[] = [];
  const rx = 0.22;
  const ry = (top - bowlEnd) / 2;
  const bx = 0.26;
  const by = (top + bowlEnd) / 2;
  for (let i = 0; i <= 8; i++) {
    const t = Math.PI / 2 - (i / 8) * Math.PI;
    bowl.push([X(bx + rx * Math.cos(t)), Y(by + ry * Math.sin(t))]);
  }
  bowl.push([X(0.02), Y(bowlEnd)]);
  out.push(...polyStrip(bowl, w));
  // Leg: from the end of the bowl down to the right.
  out.push(strip([X(0.06), Y(bowlEnd)], [X(0.6), Y(0.02)], w));
  return out;
}
