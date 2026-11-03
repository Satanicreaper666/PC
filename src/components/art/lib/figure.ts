/**
 * The stick person: one primitive for every figure on the site, so the people
 * in every picture are one family (docs/ART-DIRECTION.md, "Stick people").
 *
 * Built on a unit grid where 1u is the limb thickness:
 *   head    a 2.4u disc
 *   torso   a 1.3u strip, 5u long
 *   arm     two 2.6u segments, 1u thick
 *   leg     two 3u segments, 1u thick
 * Everything is a round-capped stroke of one paper, so a figure reads as cut
 * from a single strip. No face, hands or feet: the pose carries the moment.
 *
 * Angles are degrees, in the picture's frame (gravity is down), for a figure
 * facing right; `face: -1` mirrors it.
 *   lean      torso from vertical, + bends forward
 *   nod       head from the torso line, + looks down and forward
 *   shoulder  upper arm from hanging straight down, + swings forward (90 ahead, 180 up)
 *   elbow     bend, 0..150; the forearm folds forward and up
 *   hip       thigh from straight down, + swings forward (90 = seated)
 *   knee      bend, 0..140; the shin folds back
 * Joint ranges follow the AAOS/Norkin & White limits (via the anidoodle anatomy
 * notes); a pose outside them throws at build time, so no figure ships with a
 * rubber joint.
 */
import { P, n, xy } from "./paper.ts";

export type Pt = { x: number; y: number };
/** [shoulder, elbow] or [hip, knee]. */
export type Joint = readonly [number, number];
export interface Pose {
  lean?: number;
  nod?: number;
  /** Near arm, far arm. */
  arms: readonly [Joint, Joint];
  /** Near leg, far leg. */
  legs: readonly [Joint, Joint];
}
export type Paper = "ink" | "mid" | "white";

export interface FigureOptions {
  /** Hip (where the legs meet the torso). */
  x: number;
  y?: number;
  /** If set, `y` is solved so the lowest foot or knee rests on this line. */
  ground?: number;
  /** Limb thickness in user units. */
  u: number;
  pose: Pose;
  /** 1 faces right, -1 faces left. */
  face?: 1 | -1;
  /** Indigo, mid indigo, or white with an indigo outline. */
  paper?: Paper;
  /**
   * Send a hand or foot to a point (near limb first; leave a slot undefined to
   * keep its angles). Solved as a two-bone chain, then checked against the
   * joint limits like any other pose. Feet targets switch off `ground`.
   */
  reach?: { hands?: [Pt?, Pt?]; feet?: [Pt?, Pt?] };
  /** Shadow layer for the figure: "p1", "p2", "p3" or "" when the caller groups it. */
  layer?: string;
  /** Add the round caps itself, for use inside an SVG that doesn't set them on its root. */
  standalone?: boolean;
}

export interface Figure {
  svg: string;
  hip: Pt;
  shoulder: Pt;
  head: Pt;
  /** Top of the head. */
  top: number;
  elbows: [Pt, Pt];
  hands: [Pt, Pt];
  knees: [Pt, Pt];
  feet: [Pt, Pt];
  u: number;
}

const TORSO = 5;
const UPPER_ARM = 2.6;
const FOREARM = 2.6;
const THIGH = 3;
const SHIN = 3;
const HEAD = 2.4;
const TORSO_W = 1.3;
/** Shoulders sit a little below the top of the torso, so the strip reads as a neck. */
const SHOULDER_DROP = 0.5;
/** Head and neck overlap a hair: the figure is one piece of paper. */
const NECK_GAP = -0.1;
/** White figures: the indigo edge, each side. */
const OUTLINE = 0.32;

function check(pose: Pose, label: string) {
  const bad = (why: string) => {
    throw new Error(`Figure pose ${label}: ${why}`);
  };
  pose.arms.forEach(([s, e], i) => {
    if (e < 0 || e > 150) bad(`elbow ${i} bent ${e}°, outside 0–150`);
    // Relative to the torso: leaning forward swings the torso's axis back, so add the lean.
    const rel = s + (pose.lean ?? 0);
    if (rel < -75 || rel > 195) bad(`shoulder ${i} at ${rel}° from the torso, outside -75–195`);
  });
  pose.legs.forEach(([h, k], i) => {
    if (k < 0 || k > 140) bad(`knee ${i} bent ${k}°, outside 0–140`);
    const rel = h + (pose.lean ?? 0);
    if (rel < -35 || rel > 125) bad(`hip ${i} at ${rel}° from the torso, outside -35–125`);
    if (rel > 95 && k < 20) bad(`hip ${i} flexed ${rel}° with a straight knee (hamstrings stop at 95°)`);
  });
  if (Math.abs(pose.nod ?? 0) > 50) bad(`neck nod ${pose.nod}° is an owl neck`);
}

/** A stick person. Returns its SVG and where its joints landed, so props can be put in its hands. */
export function figure(o: FigureOptions): Figure {
  const { u } = o;
  const f = o.face ?? 1;
  const rad = Math.PI / 180;
  // A direction measured from straight down, swinging forward.
  const dir = (a: number) => ({ x: f * Math.sin(a * rad), y: Math.cos(a * rad) });
  const at = (p: Pt, a: number, len: number): Pt => {
    const d = dir(a);
    return { x: p.x + d.x * len * u, y: p.y + d.y * len * u };
  };
  const build = (pose: Pose, hip: Pt) => {
    const lean = pose.lean ?? 0;
    const neck = at(hip, 180 - lean, TORSO);
    const shoulder = at(hip, 180 - lean, TORSO - SHOULDER_DROP);
    const head = at(neck, 180 - lean - (pose.nod ?? 0), TORSO_W / 2 + NECK_GAP + HEAD / 2);
    const elbows = pose.arms.map(([s]) => at(shoulder, s, UPPER_ARM)) as [Pt, Pt];
    const hands = pose.arms.map(([s, e], i) => at(elbows[i], s + e, FOREARM)) as [Pt, Pt];
    const knees = pose.legs.map(([h]) => at(hip, h, THIGH)) as [Pt, Pt];
    const feet = pose.legs.map(([h, k], i) => at(knees[i], h - k, SHIN)) as [Pt, Pt];
    return { hip, neck, shoulder, head, elbows, hands, knees, feet };
  };

  // 1. Stand the figure on the ground (legs only decide this), 2. reach, 3. check.
  const hip = { x: o.x, y: o.y ?? 0 };
  if (o.ground !== undefined && !o.reach?.feet) {
    const t = build(o.pose, { x: 0, y: 0 });
    hip.y = o.ground - (Math.max(...t.feet.map((p) => p.y), ...t.knees.map((p) => p.y)) + u / 2);
  }
  const pose = o.reach ? solve(o, f, hip) : o.pose;
  check(pose, JSON.stringify(pose));
  const j = build(pose, hip);

  const P2 = (p: Pt) => xy(p.x, p.y);
  const limbs =
    [0, 1].map((i) => `M${P2(j.hip)}L${P2(j.knees[i])}L${P2(j.feet[i])}`).join("") +
    [0, 1].map((i) => `M${P2(j.shoulder)}L${P2(j.elbows[i])}L${P2(j.hands[i])}`).join("");
  const torso = `M${P2(j.hip)}L${P2(j.neck)}`;
  const head = `M${P2(j.head)}h0`;
  const paths = (w: number, color: string) =>
    `<g stroke="${color}"><path stroke-width="${n(u + w)}" d="${limbs}"/><path stroke-width="${n(u * TORSO_W + w)}" d="${torso}"/><path stroke-width="${n(u * HEAD + w)}" d="${head}"/></g>`;

  const paper = o.paper ?? "ink";
  const body =
    paper === "white" ? paths(2 * OUTLINE * u, P.ink) + paths(0, P.white) : paths(0, paper === "mid" ? P.mid : P.ink);
  const caps = o.standalone ? ` stroke-linecap="round" stroke-linejoin="round"` : "";
  const layer = o.layer ? ` class="${o.layer}"` : "";
  return {
    svg: `<g${layer} fill="none"${caps}>${body}</g>`,
    hip: j.hip,
    shoulder: j.shoulder,
    head: j.head,
    top: j.head.y - (HEAD / 2) * u,
    elbows: j.elbows,
    hands: j.hands,
    knees: j.knees,
    feet: j.feet,
    u
  };
}

/**
 * Two-bone IK for `reach`: the elbow folds the forearm forward, the knee folds
 * the shin back, as the joints do. Out-of-reach targets get the straight limb
 * pointed at them.
 */
function solve(o: FigureOptions, f: 1 | -1, hip: Pt): Pose {
  const { u, pose } = o;
  const rad = Math.PI / 180;
  const lean = pose.lean ?? 0;
  const shoulder = {
    x: hip.x + f * Math.sin(lean * rad) * (TORSO - SHOULDER_DROP) * u,
    y: hip.y - Math.cos(lean * rad) * (TORSO - SHOULDER_DROP) * u
  };
  const chain = (root: Pt, t: Pt, a: number, b: number, sign: 1 | -1): Joint => {
    const dx = (t.x - root.x) / u;
    const dy = (t.y - root.y) / u;
    const d = Math.min(a + b - 1e-6, Math.max(Math.abs(a - b) + 1e-6, Math.hypot(dx, dy)));
    const theta = Math.atan2(f * dx, dy) / rad;
    const alpha = Math.acos((a * a + d * d - b * b) / (2 * a * d)) / rad;
    const gamma = Math.acos((a * a + b * b - d * d) / (2 * a * b)) / rad;
    const r1 = (x: number) => Math.round(x * 10) / 10;
    return [r1(theta - sign * alpha), r1(180 - gamma)];
  };
  const arms = pose.arms.map((j, i) => {
    const t = o.reach?.hands?.[i];
    return t ? chain(shoulder, t, UPPER_ARM, FOREARM, 1) : j;
  }) as unknown as [Joint, Joint];
  const legs = pose.legs.map((j, i) => {
    const t = o.reach?.feet?.[i];
    return t ? chain(hip, t, THIGH, SHIN, -1) : j;
  }) as unknown as [Joint, Joint];
  return { ...pose, arms, legs };
}

/**
 * The pose library. Scenes start from one of these and adjust; every number is
 * a joint angle as described above. Near limb first.
 */
export const POSES = {
  stand: { arms: [[14, 10], [-12, 8]], legs: [[7, 4], [-6, 0]] },
  walk: { lean: 4, arms: [[-26, 16], [30, 30]], legs: [[22, 8], [-14, 18]] },
  sit: { lean: -4, arms: [[30, 60], [24, 70]], legs: [[88, 86], [82, 80]] },
  /** Both hands held out in front, as if holding a sheet to read. */
  read: { lean: 3, nod: 22, arms: [[48, 82], [40, 92]], legs: [[4, 0], [-4, 0]] },
  /** One arm straight up in a wave. */
  wave: { arms: [[128, 38], [-10, 10]], legs: [[7, 4], [-6, 0]] },
  /** One arm out to a target. */
  point: { lean: -2, arms: [[112, 4], [-8, 14]], legs: [[6, 0], [-6, 0]] }
} satisfies Record<string, Pose>;
