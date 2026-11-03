/**
 * The six stations of working life, each a small paper standee with stick
 * people and one turmeric object (docs/ART-DIRECTION.md, "Scenes").
 * Coordinates are in figure units, in the standee's own plane: x across,
 * y up, z towards the viewer. Layers are listed back to front.
 */
import { figure, type Skeleton } from "./figure";
import { INK } from "./materials";
import type { Piece } from "./paper";
import { disc, poly, rect, rotateShapes, rupee, sheet, strip, type Pt } from "./shapes";

export interface StationLayer {
  /** Distance in front of the station's base line. */
  z: number;
  pieces: Piece[];
  /** Swing the layer round a vertical hinge at x (a door). */
  hinge?: { x: number; deg: number };
}

export interface StationSpec {
  id: "hire" | "onboard" | "grow" | "pay" | "exit" | "lead";
  layers: StationLayer[];
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** A badge pinned on the chest, a little in front of the figure. */
function chest(sk: Skeleton, t = 0.62): Pt {
  return lerp(sk.hip, sk.neck, t);
}

function hire(): StationSpec {
  // The interviewer stands behind the table and hands the offer across.
  const boss = figure({ x: 4.2, lean: -4, armL: [-78, -96], armR: [12, 4] }, "outlined");
  const you = figure({ x: -6.8, lean: 3, armR: [68, 84], armL: [-16, -8], legL: [-12, -6], legR: [10, 6] }, "indigo");
  const h = lerp(boss.sk.handL, you.sk.handR, 0.5);
  const [body, fold] = sheet(h[0] - 1.35, h[1] - 1.9, 2.7, 3.5, 0.9);
  return {
    id: "hire",
    layers: [
      { z: -1.7, pieces: boss.pieces },
      {
        z: -0.6,
        pieces: [
          {
            color: INK.mid,
            shapes: [rect(-5.4, 6.0, 10.8, 1.05, 0.45), strip([-4.1, 0.45], [-4.1, 6.4], 0.95), strip([4.1, 0.45], [4.1, 6.4], 0.95)]
          }
        ]
      },
      { z: 0.4, pieces: you.pieces },
      {
        z: 1.0,
        pieces: [
          { color: INK.haldi, shapes: rotateShapes([body], -8, h[0], h[1]) },
          { color: INK.haldiLight, shapes: rotateShapes([fold], -8, h[0], h[1]), z: 0.1 }
        ]
      }
    ]
  };
}

function onboard(): StationSpec {
  const you = figure({ x: -1.4, lean: 4, legL: [-20, -30], legR: [24, 8], armL: [24, 34], armR: [-24, -14] }, "indigo");
  const c = chest(you.sk);
  const W = 3.1;
  const H = 15.6;
  return {
    id: "onboard",
    layers: [
      // The lit room behind the doorway.
      { z: -1.9, pieces: [{ color: INK.white, shapes: [rect(-W - 0.2, 0, 2 * W + 0.4, H + 0.2, 0)] }] },
      {
        z: -1.2,
        pieces: [
          {
            color: INK.mid,
            shapes: [
              poly([
                [-W - 1.5, 0],
                [-W, 0],
                [-W, H],
                [W, H],
                [W, 0],
                [W + 1.5, 0],
                [W + 1.5, H + 1.6],
                [-W - 1.5, H + 1.6]
              ])
            ]
          }
        ]
      },
      // The door, swung open towards us on its right-hand hinge.
      {
        z: -1.2,
        hinge: { x: W, deg: 74 },
        pieces: [
          { color: INK.mid, shapes: [rect(-W + 0.1, 0.05, 2 * W - 0.2, H - 0.15, 0.3)] },
          { color: INK.deep, shapes: [disc(-W + 1.0, 7.4, 0.42)], z: 0.25 }
        ]
      },
      { z: 0.9, pieces: you.pieces },
      {
        z: 1.45,
        pieces: [
          { color: INK.haldi, shapes: rotateShapes([rect(c[0] - 1.05, c[1] - 1.35, 2.1, 2.5, 0.35)], -6, c[0], c[1]) },
          { color: INK.haldiLight, shapes: rotateShapes([rect(c[0] - 0.55, c[1] + 0.65, 1.1, 0.32, 0.16)], -6, c[0], c[1]), z: 0.1 }
        ]
      }
    ]
  };
}

function grow(): StationSpec {
  // Four shallow steps rising to the right, cut as one profile from thick card.
  const R = 1.6;
  const T = 3.2;
  const x0 = -6.4;
  const profile: Pt[] = [[x0, 0], [x0 + 4 * T, 0]];
  for (let k = 4; k >= 1; k--) profile.push([x0 + k * T, k * R], [x0 + (k - 1) * T, k * R]);
  const steps = poly(profile);
  // Back foot on the second step, front foot on the third, reaching for the flag.
  const you = figure({ x: x0 + T + 2.3, ground: 2 * R, lean: 10, legL: [-6, -12], legR: [62, 12], armR: [98, 104], armL: [-34, -22] }, "indigo");
  const px = x0 + 4 * T - 1.1;
  const top = 4 * R;
  return {
    id: "grow",
    layers: [
      { z: -2.6, pieces: [{ color: INK.mid, shapes: [steps], depth: 4.6 }] },
      {
        z: -3.9,
        pieces: [
          { color: INK.deep, shapes: [strip([px, top], [px, top + 7.6], 0.45)] },
          {
            color: INK.haldi,
            shapes: [
              poly([
                [px + 0.1, top + 7.6],
                [px + 4.4, top + 7.6],
                [px + 3.3, top + 6.15],
                [px + 4.4, top + 4.7],
                [px + 0.1, top + 4.7]
              ])
            ],
            z: 0.15
          }
        ]
      },
      // Standing on the treads, not in front of the block.
      { z: -2.3, pieces: you.pieces }
    ]
  };
}

function pay(): StationSpec {
  const you = figure({ x: -4.2, lean: -2, armL: [-142, -162], armR: [52, 72] }, "indigo");
  const cx = 2.6;
  const r = 4.7;
  const hand = you.sk.handL;
  const [body, fold] = sheet(hand[0] - 1.5, hand[1] - 1.2, 3.0, 3.8, 0.85);
  const lines = [0.9, 1.6, 2.3].map((dy, i) => strip([hand[0] - 0.9, hand[1] + 2.6 - dy], [hand[0] + (i === 2 ? 0.1 : 0.7), hand[1] + 2.6 - dy], 0.32));
  return {
    id: "pay",
    layers: [
      {
        z: -0.9,
        pieces: [
          { color: INK.haldi, shapes: [disc(cx, r, r)], depth: 0.9, segments: 28 },
          { color: INK.haldiLight, shapes: rupee(cx + 0.1, r, 5.0, 0.78), z: 0.55, segments: 6 }
        ]
      },
      { z: 0.9, pieces: you.pieces },
      {
        z: 1.45,
        pieces: [
          { color: INK.white, shapes: rotateShapes([body], 8, hand[0], hand[1]) },
          { color: INK.pale, shapes: rotateShapes([fold], 8, hand[0], hand[1]), z: 0.1 },
          { color: INK.mid, shapes: rotateShapes(lines, 8, hand[0], hand[1]), z: 0.1, segments: 4 }
        ]
      }
    ]
  };
}

function exit(): StationSpec {
  const you = figure({ x: -1.6, lean: 5, legL: [-22, -34], legR: [24, 10], armL: [-148, -168], armR: [18, 74] }, "indigo");
  const h = you.sk.handR;
  const bx = h[0] - 1.2;
  const by = h[1] - 2.9;
  const [letter, fold] = sheet(bx + 1.0, by + 1.9, 2.5, 3.3, 0.8);
  return {
    id: "exit",
    layers: [
      { z: 0, pieces: you.pieces },
      {
        z: 0.45,
        pieces: [
          { color: INK.haldi, shapes: rotateShapes([letter], -12, bx + 2, by + 3) },
          { color: INK.haldiLight, shapes: rotateShapes([fold], -12, bx + 2, by + 3), z: 0.1 }
        ]
      },
      {
        z: 0.9,
        pieces: [
          { color: INK.mid, shapes: [rect(bx, by, 4.6, 3.6, 0.3)] },
          { color: INK.deep, shapes: [strip([bx + 0.5, by + 2.75], [bx + 4.1, by + 2.75], 0.3)], z: 0.1, segments: 4 }
        ]
      }
    ]
  };
}

function lead(): StationSpec {
  const you = figure({ x: -7.4, lean: 3, armR: [112, 106], armL: [-18, -10] }, "indigo");
  const node = (x: number, y: number, w: number, h: number) => rect(x - w / 2, y - h / 2, w, h, 0.35);
  const top: Pt = [0.6, 12.4];
  const kids = [-2.6, 0.6, 3.8];
  const ky = 8.9;
  const bar = 10.75;
  return {
    id: "lead",
    layers: [
      {
        z: -1.5,
        pieces: [
          { color: INK.mid, shapes: [strip([-3.4, 0.4], [-2.6, 7.4], 0.8), strip([4.6, 0.4], [3.8, 7.4], 0.8), rect(-4.8, 6.3, 10.8, 8.6, 0.6)] },
          { color: INK.white, shapes: [rect(-4.25, 6.85, 9.7, 7.5, 0.3)], z: 0.2 }
        ]
      },
      {
        z: -1.0,
        pieces: [
          {
            color: INK.deep,
            shapes: [strip([top[0], top[1]], [top[0], bar], 0.32), strip([kids[0], bar], [kids[2], bar], 0.32), ...kids.map((x) => strip([x, bar], [x, ky], 0.32))],
            segments: 4
          },
          { color: INK.indigo, shapes: kids.map((x) => node(x, ky, 1.9, 1.5)), z: 0.12 },
          { color: INK.haldi, shapes: [node(top[0], top[1], 2.4, 1.8)], z: 0.12 }
        ]
      },
      { z: 0.1, pieces: you.pieces }
    ]
  };
}

export const STATIONS: (() => StationSpec)[] = [hire, onboard, grow, pay, exit, lead];
