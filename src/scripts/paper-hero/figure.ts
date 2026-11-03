/**
 * Stick people, to the proportions in docs/ART-DIRECTION.md ("Stick people"):
 * 1u limbs, a 2.4u head, a 1.3u torso about 5u long, arms of two 2.6u segments,
 * legs of two 3u segments, round ends, no face, hands or feet.
 */
import type { Shape } from "three";
import { INK } from "./materials";
import type { Piece } from "./paper";
import { disc, strip, type Pt } from "./shapes";

const D2R = Math.PI / 180;
const down = (deg: number): Pt => [Math.sin(deg * D2R), -Math.cos(deg * D2R)];
const up = (deg: number): Pt => [Math.sin(deg * D2R), Math.cos(deg * D2R)];
const go = (p: Pt, d: Pt, k: number): Pt => [p[0] + d[0] * k, p[1] + d[1] * k];

/** Angles in degrees. Limbs: 0 hangs straight down, 90 points right, -90 points left, 180 straight up. */
export interface Pose {
  /** Torso lean from upright; positive leans right. */
  lean?: number;
  /** Extra head tilt. */
  nod?: number;
  armL?: [number, number];
  armR?: [number, number];
  legL?: [number, number];
  legR?: [number, number];
  /** Where the hip sits, in the standee's plane. Default: centred on x = 0, lowest foot on y = `ground`. */
  x?: number;
  ground?: number;
}

export interface Skeleton {
  hip: Pt;
  neck: Pt;
  shoulder: Pt;
  head: Pt;
  kneeL: Pt;
  footL: Pt;
  kneeR: Pt;
  footR: Pt;
  elbowL: Pt;
  handL: Pt;
  elbowR: Pt;
  handR: Pt;
}

export const LIMB = 1;
const TORSO_W = 1.3;
const HEAD_R = 1.2;
const THIGH = 3;
const SHIN = 3;
const UPPER = 2.6;
const FORE = 2.6;
const TORSO = 4.7;

export function skeleton(p: Pose): Skeleton {
  const lean = p.lean ?? 0;
  const hip: Pt = [0, 0];
  const [tl, sl] = p.legL ?? [-9, -5];
  const [tr, sr] = p.legR ?? [9, 5];
  const kneeL = go(hip, down(tl), THIGH);
  const footL = go(kneeL, down(sl), SHIN);
  const kneeR = go(hip, down(tr), THIGH);
  const footR = go(kneeR, down(sr), SHIN);
  const neck = go(hip, up(lean), TORSO);
  const shoulder = go(hip, up(lean), TORSO - 0.5);
  const head = go(neck, up(lean + (p.nod ?? 0)), TORSO_W / 2 + 0.35 + HEAD_R);
  const [ul, fl] = p.armL ?? [-14, -8];
  const [ur, fr] = p.armR ?? [14, 8];
  const elbowL = go(shoulder, down(ul), UPPER);
  const handL = go(elbowL, down(fl), FORE);
  const elbowR = go(shoulder, down(ur), UPPER);
  const handR = go(elbowR, down(fr), FORE);
  const sk: Skeleton = { hip, neck, shoulder, head, kneeL, footL, kneeR, footR, elbowL, handL, elbowR, handR };
  const dx = p.x ?? 0;
  const dy = (p.ground ?? 0) - (Math.min(footL[1], footR[1]) - LIMB / 2);
  for (const k of Object.keys(sk) as (keyof Skeleton)[]) sk[k] = [sk[k][0] + dx, sk[k][1] + dy];
  return sk;
}

function body(s: Skeleton, grow = 0): Shape[] {
  return [
    strip(s.hip, s.kneeL, LIMB + grow),
    strip(s.kneeL, s.footL, LIMB + grow),
    strip(s.hip, s.kneeR, LIMB + grow),
    strip(s.kneeR, s.footR, LIMB + grow),
    strip(s.hip, s.neck, TORSO_W + grow),
    disc(s.head[0], s.head[1], HEAD_R + grow / 2)
  ];
}

function arms(s: Skeleton, grow = 0): Shape[] {
  return [strip(s.shoulder, s.elbowL, LIMB + grow), strip(s.elbowL, s.handL, LIMB + grow), strip(s.shoulder, s.elbowR, LIMB + grow), strip(s.elbowR, s.handR, LIMB + grow)];
}

export type FigureInk = "indigo" | "mid" | "outlined";

/**
 * A figure as paper pieces. Arms are a separate strip glued just in front of
 * the body, so where an arm crosses the torso its cut edge shows.
 * "outlined" is white paper on a slightly larger indigo cut-out.
 */
export function figure(pose: Pose, ink: FigureInk = "indigo"): { pieces: Piece[]; sk: Skeleton } {
  const sk = skeleton(pose);
  if (ink === "outlined") {
    const o = 0.62;
    return {
      sk,
      pieces: [
        { color: INK.indigo, shapes: [...body(sk, o), ...arms(sk, o)], z: -0.16 },
        { color: INK.white, shapes: body(sk), z: 0 },
        { color: INK.white, shapes: arms(sk), z: 0.12 }
      ]
    };
  }
  const color = ink === "mid" ? INK.mid : INK.indigo;
  return {
    sk,
    pieces: [
      { color, shapes: body(sk), z: 0 },
      { color, shapes: arms(sk), z: 0.12 }
    ]
  };
}
