/**
 * Geometry for cut paper: thin extrusions of 2D shapes (so the cut edges catch
 * the light), merged per colour to keep draw calls low.
 */
import { BufferAttribute, BufferGeometry, ExtrudeGeometry, Group, Mesh, type Shape } from "three";
import type { PaperBox } from "./materials";

/** Card thickness for figures and props: about 2.7% of a 14.6-unit figure. */
export const CARD = 0.4;

export interface Piece {
  color: number;
  shapes: Shape[];
  /** Offset towards the viewer within the layer. */
  z?: number;
  depth?: number;
  segments?: number;
}

export function extrude(shapes: Shape[], depth = CARD, segments = 10): BufferGeometry {
  const g = new ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments: segments });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Concatenate non-indexed geometries that share position, normal and uv. */
export function merge(geos: BufferGeometry[]): BufferGeometry {
  const out = new BufferGeometry();
  for (const name of ["position", "normal", "uv"]) {
    const first = geos[0].getAttribute(name);
    const total = geos.reduce((n, g) => n + g.getAttribute(name).array.length, 0);
    const arr = new Float32Array(total);
    let off = 0;
    for (const g of geos) {
      const a = g.getAttribute(name).array as Float32Array;
      arr.set(a, off);
      off += a.length;
    }
    out.setAttribute(name, new BufferAttribute(arr, first.itemSize));
  }
  for (const g of geos) g.dispose();
  return out;
}

/** Build one paper layer: one mesh per colour, every piece casts and takes shadows. */
export function layer(pieces: Piece[], box: PaperBox): Group {
  const byColor = new Map<number, BufferGeometry[]>();
  for (const p of pieces) {
    if (!p.shapes.length) continue;
    const g = extrude(p.shapes, p.depth ?? CARD, p.segments ?? 10);
    if (p.z) g.translate(0, 0, p.z);
    const list = byColor.get(p.color) ?? [];
    list.push(g);
    byColor.set(p.color, list);
  }
  const group = new Group();
  for (const [color, geos] of byColor) {
    const mesh = new Mesh(geos.length === 1 ? geos[0] : merge(geos), box.get(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}

export interface RibbonPoint {
  x: number;
  z: number;
  /** Height of the underside above the ground. */
  y: number;
  /** Width here, if not the strip's own. */
  w?: number;
}

/**
 * A flat paper strip lying on the ground along a path: a closed solid
 * (top, bottom, both cut edges, both ends) so it casts a proper shadow.
 */
export function ribbon(path: RibbonPoint[], width: number, thick: number, uvScale = 1): BufferGeometry {
  const n = path.length;
  const L: [number, number, number][] = [];
  const R: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(n - 1, i + 1)];
    let tx = b.x - a.x;
    let tz = b.z - a.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    // Left normal in the ground plane.
    const nx = tz;
    const nz = -tx;
    const p = path[i];
    const half = (p.w ?? width) * 0.5;
    L.push([p.x + nx * half, p.y, p.z + nz * half]);
    R.push([p.x - nx * half, p.y, p.z - nz * half]);
  }
  const pos: number[] = [];
  const uv: number[] = [];
  const tri = (a: number[], b: number[], c: number[], ua: number[], ub: number[], uc: number[]) => {
    pos.push(...a, ...b, ...c);
    uv.push(...ua, ...ub, ...uc);
  };
  const quad = (a: number[], b: number[], c: number[], d: number[], ua: number[], ub: number[], uc: number[], ud: number[]) => {
    tri(a, b, c, ua, ub, uc);
    tri(a, c, d, ua, uc, ud);
  };
  const top = (v: number[]) => [v[0], v[1] + thick, v[2]];
  const uvTop = (v: number[]) => [v[0] / uvScale, v[2] / uvScale];
  let along = 0;
  for (let i = 0; i < n - 1; i++) {
    const l0 = L[i];
    const l1 = L[i + 1];
    const r0 = R[i];
    const r1 = R[i + 1];
    const seg = Math.hypot(path[i + 1].x - path[i].x, path[i + 1].z - path[i].z);
    const s0 = along / uvScale;
    const s1 = (along + seg) / uvScale;
    along += seg;
    // Top (faces up): counter-clockwise seen from above.
    quad(top(l0), top(r0), top(r1), top(l1), uvTop(l0), uvTop(r0), uvTop(r1), uvTop(l1));
    // Bottom (faces down).
    quad(l0, l1, r1, r0, uvTop(l0), uvTop(l1), uvTop(r1), uvTop(r0));
    // Left edge (faces out to the left).
    quad(l0, top(l0), top(l1), l1, [s0, 0], [s0, thick], [s1, thick], [s1, 0]);
    // Right edge.
    quad(r0, r1, top(r1), top(r0), [s0, 0], [s1, 0], [s1, thick], [s0, thick]);
  }
  // Cut ends.
  quad(L[0], R[0], top(R[0]), top(L[0]), [0, 0], [width, 0], [width, thick], [0, thick]);
  quad(R[n - 1], L[n - 1], top(L[n - 1]), top(R[n - 1]), [0, 0], [width, 0], [width, thick], [0, thick]);
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2));
  g.computeVertexNormals();
  return g;
}
