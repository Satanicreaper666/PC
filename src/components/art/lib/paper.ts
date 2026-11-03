/**
 * The paper drawer: the seven papers of docs/ART-DIRECTION.md and a few helpers
 * that keep the SVG we ship small. Every icon and scene is built from these.
 *
 * Depth is never drawn here. A layer is a <g> with class p1 (glued flat),
 * p2 (lifted) or p3 (floating, the subject); SpotIcon and Scene map those
 * classes to the --paper-1/2/3 drop shadows in src/styles/global.css. CSS
 * drop-shadow lengths on SVG elements are user units, so a shadow keeps its
 * proportion at every size. At most four shadowed groups per picture.
 */

/** The only colours. */
export const P = {
  /** Indigo, --neel-600: main figures, dark paper. */
  ink: "#3B44A6",
  /** Deep indigo, --neel-800: shadow side of dark paper, hair-thin detail. */
  deep: "#252B68",
  /** Pale indigo, --neel-100: background paper, ground. */
  pale: "#DDE1F7",
  /** Mid indigo, --neel-300: second figure, furniture. */
  mid: "#949EE2",
  /** Turmeric, --haldi-400: the one thing that matters. */
  haldi: "#EFAB22",
  /** Light turmeric, --haldi-200: turmeric's lit edge, a second warm object. */
  lite: "#FCD98A",
  /** White paper: documents, highlights. */
  white: "#fff"
} as const;

/** A number, rounded to 0.1 and written as briefly as SVG allows (".5", "-1.2", "3"). */
export function n(v: number): string {
  const r = Math.round(v * 10) / 10;
  if (r === 0) return "0";
  return String(r).replace(/^(-?)0\./, "$1.");
}

/** "x y" pair for path data. */
export const xy = (x: number, y: number) => `${n(x)} ${n(y)}`;

/** A layer: p1 glued flat, p2 lifted, p3 floating. Pass "" for no shadow. */
export const g = (cls: string, body: string, attrs = "") => `<g${cls ? ` class="${cls}"` : ""}${attrs ? " " + attrs : ""}>${body}</g>`;

/** A filled shape from path data. */
export const fill = (color: string, d: string, extra = "") => `<path fill="${color}" d="${d}"${extra ? " " + extra : ""}/>`;

/** Round-capped strokes, as if cut from a strip of paper. */
export const strip = (color: string, w: number, d: string, extra = "") =>
  `<path fill="none" stroke="${color}" stroke-width="${n(w)}" stroke-linecap="round" stroke-linejoin="round" d="${d}"${extra ? " " + extra : ""}/>`;

export const circle = (color: string, cx: number, cy: number, r: number, extra = "") =>
  `<circle fill="${color}" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"${extra ? " " + extra : ""}/>`;

export const rect = (color: string, x: number, y: number, w: number, h: number, rx = 0, extra = "") =>
  `<rect fill="${color}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${rx ? ` rx="${n(rx)}"` : ""}${extra ? " " + extra : ""}/>`;

/** Rotate about a point: a hand-placed piece is never quite square to the page. */
export const rot = (a: number, cx: number, cy: number) => `transform="rotate(${n(a)} ${n(cx)} ${n(cy)})"`;

/** A closed polygon path through points: scissor cuts are straight. */
export const poly = (...pts: number[]) => {
  let d = "";
  for (let i = 0; i < pts.length; i += 2) d += (i ? "L" : "M") + xy(pts[i], pts[i + 1]);
  return d + "Z";
};

/**
 * The rupee sign as one strip path, in a box of height h whose top-left is (x, y).
 * Two bars, the bowl, and the leg that kicks down and right.
 */
export function rupee(x: number, y: number, h: number): string {
  const s = h / 10;
  const X = (v: number) => n(x + v * s);
  const Y = (v: number) => n(y + v * s);
  return `M${X(0)} ${Y(0)}H${X(6.4)}M${X(0)} ${Y(2.6)}H${X(6.4)}M${X(1.3)} ${Y(0)}C${X(5.4)} ${Y(0)} ${X(5.6)} ${Y(5.2)} ${X(0.6)} ${Y(5.2)}L${X(5.6)} ${Y(10)}`;
}

/** A turmeric piece with its lit edge: the same shape in light turmeric, nudged up and left, underneath. */
export const lit = (d: string, by = 0.8) => fill(P.lite, d, `transform="translate(${n(-by)} ${n(-by)})"`) + fill(P.haldi, d);
export const litCircle = (cx: number, cy: number, r: number, by = 0.7) => circle(P.lite, cx - by, cy - by, r) + circle(P.haldi, cx, cy, r);

/** A sheet with its top-right corner folded over (the fold shows the paper's shaded back). */
export const sheet = (x: number, y: number, w: number, h: number, f = 5.5, color: string = P.white) =>
  fill(color, `M${n(x)} ${n(y)}H${n(x + w - f)}L${n(x + w)} ${n(y + f)}V${n(y + h)}H${n(x)}Z`) +
  fill(P.pale, `M${n(x + w - f)} ${n(y)}V${n(y + f)}H${n(x + w)}Z`);

/**
 * A piece set down by hand, never quite square. The turn goes inside the
 * shadowed layer, so the shadow still falls exactly down and to the right.
 */
export const tilt = (a: number, cx: number, cy: number, body: string) => `<g ${rot(a, cx, cy)}>${body}</g>`;
