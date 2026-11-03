/**
 * The hero diorama: a pale-indigo card on the page, a woven paper road
 * across it, and the six stations of working life standing along the road.
 * One light from the top left (docs/ART-DIRECTION.md, "Light and shadow").
 */
import {
  Box3,
  CatmullRomCurve3,
  DirectionalLight,
  Euler,
  Group,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  Vector3,
  type Object3D
} from "three";
import { INK, PaperBox } from "./materials";
import { extrude, layer, ribbon, type RibbonPoint } from "./paper";
import { handCut, rect } from "./shapes";
import { STATIONS } from "./stations";

const D2R = Math.PI / 180;

/** Art-directed constants. Units are figure units (1 = limb thickness). */
export const LOOK = {
  /** Container aspect ratio (560 × 460). */
  aspect: 560 / 460,
  /** Padding inside the container, as a fraction of each side. */
  pad: 0.08,
  fov: 24,
  /** Camera direction: turned this far to the left of straight-on, looking down this far. */
  yaw: -8,
  pitch: 40,
  /** Light direction relative to the camera: from the left and above. */
  lightAz: -32,
  lightEl: 48,
  sun: Math.PI * 0.42,
  sky: Math.PI * 0.72,
  card: { x0: -31, x1: 31, z0: -21.5, z1: 21.5, r: 4.5, thick: 1.0 },
  weave: { width: 2.1, thread: 0.95, lane: 1.6, period: 15, swap: 6.5, thick: 0.22 },
  /** Stations left to right: hire, onboard, grow, pay, exit, lead. Front row, back row, alternating. */
  stations: [
    { x: -21.5, z: 15.5, turn: 4, lean: -1.5 },
    { x: -12.5, z: -12.5, turn: -2, lean: -0.8 },
    { x: -3.5, z: 15.5, turn: 3, lean: -1.2 },
    { x: 6.5, z: -12.5, turn: -3, lean: -2 },
    { x: 13.5, z: 15.5, turn: 2, lean: -0.6 },
    { x: 22, z: -12.5, turn: -2, lean: -1.6 }
  ],
  /** The road's centre line: just in front of the back row, clear above the front row's heads. */
  road: [
    [-30.8, -5],
    [-20, -6.4],
    [-11, -6.4],
    [-2, -9.4],
    [12, -7.8],
    [22, -7.6],
    [30.8, -6]
  ] as [number, number][]
};

export interface Animated {
  obj: Object3D;
  /** Seconds after start. */
  delay: number;
  restY: number;
  restZ: number;
  restRotX: number;
  /** For a hinged door: resting swing in radians. */
  swing?: number;
}

export interface Diorama {
  scene: Scene;
  camera: PerspectiveCamera;
  /** Turned by the pointer. */
  turntable: Group;
  animated: Animated[];
  light: DirectionalLight;
  /** Re-frame the camera for another container aspect ratio. */
  fit(aspect: number): void;
  dispose(): void;
}

/**
 * The woven road: an indigo strip and a mid-indigo strip that swap sides every
 * few steps, and a turmeric thread down the middle that goes over one strip and
 * under the other at each crossing, like weft through warp. (A pale-indigo strip
 * disappeared into the pale-indigo card; mid indigo matches the logo's weave.)
 */
function road(box: PaperBox): Group {
  const g = new Group();
  const way = LOOK.road.map(([x, z]) => new Vector3(x, 0, z));
  const curve = new CatmullRomCurve3(way, false, "centripetal");
  const length = curve.getLength();
  const n = Math.max(2, Math.round(length / 0.2));
  const centre = curve.getSpacedPoints(n);
  const ss = centre.map((_, i) => (i / n) * length);
  const { width, thread, lane, period, swap, thick } = LOOK.weave;
  const lift = thick * 1.2;
  // Crossings evenly spaced, strips running straight in between and at both ends.
  const count = Math.max(1, Math.floor((length - swap) / period));
  const first = (length - (count - 1) * period) / 2;
  const crossings = Array.from({ length: count }, (_, i) => first + i * period);
  const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  // Side of the indigo strip at s: +1 or -1, easing through each swap.
  const side = (s: number) => {
    let v = 1;
    for (const c of crossings) v *= 1 - 2 * smooth((s - (c - swap / 2)) / swap);
    return v;
  };
  // 1 while a swap's strips overlap the thread, easing to 0 just outside it.
  const overlap = (s: number, c: number) => {
    const d = Math.abs(s - c) - swap / 2;
    return d <= 0 ? 1 : Math.max(0, 1 - d / 1.2);
  };
  const strands = [
    { color: INK.indigo, w: width, off: (s: number) => lane * side(s) },
    { color: INK.mid, w: width, off: (s: number) => -lane * side(s) },
    { color: INK.haldi, w: thread, off: () => 0 }
  ];
  // Stacking at each crossing, bottom to top: alternate which strip is on top;
  // the thread is always in between.
  const level = (k: number, ci: number) => {
    if (k === 2) return 1;
    const indigoTop = ci % 2 === 0;
    return (k === 0) === indigoTop ? 2 : 0;
  };
  const height = (k: number, s: number) => {
    let h = 0;
    crossings.forEach((c, ci) => {
      const w = overlap(s, c);
      if (w > 0) h = Math.max(h, level(k, ci) * lift * (0.5 - 0.5 * Math.cos(Math.PI * w)));
    });
    return h;
  };
  // Left normal of the centre line at each sample.
  const normals = centre.map((_, i) => {
    const a = centre[Math.max(0, i - 1)];
    const b = centre[Math.min(centre.length - 1, i + 1)];
    const tx = b.x - a.x;
    const tz = b.z - a.z;
    const len = Math.hypot(tx, tz) || 1;
    return [tz / len, -tx / len] as const;
  });
  strands.forEach((st, k) => {
    const path: RibbonPoint[] = centre.map((p, m) => {
      const o = st.off(ss[m]);
      // Hand-cut strips are never quite even.
      const w = st.w * (1 + 0.05 * Math.sin(ss[m] * 0.37 + k * 2.1) + 0.03 * Math.sin(ss[m] * 1.13 + k));
      return { x: p.x + normals[m][0] * o, z: p.z + normals[m][1] * o, y: height(k, ss[m]) + k * 0.003, w };
    });
    const mesh = new Mesh(ribbon(path, st.w, thick, 1), box.get(st.color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
  });
  return g;
}

function ground(box: PaperBox): Group {
  const { x0, x1, z0, z1, r, thick } = LOOK.card;
  const g = new Group();
  // Shape y runs towards the back (world -z) once laid flat.
  const geo = extrude([handCut(rect(x0, -z1, x1 - x0, z1 - z0, r), 0.22, 3)], thick, 16);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -thick / 2, 0);
  const card = new Mesh(geo, box.get(INK.pale));
  card.receiveShadow = true;
  card.castShadow = true;
  g.add(card);
  // A second sheet under the card, a little larger and offset: a hand-cut mount.
  const under = extrude([handCut(rect(x0 - 0.2, -z1 - 1.3, x1 - x0 + 1.4, z1 - z0 + 1.5, r + 0.6), 0.25, 7)], 0.7, 16);
  under.rotateX(-Math.PI / 2);
  under.translate(0, -thick - 0.35, 0);
  const mount = new Mesh(under, box.get(INK.mid));
  mount.receiveShadow = true;
  mount.castShadow = true;
  g.add(mount);
  // The page under the card: shows only the card's shadow.
  const page = new Mesh(new PlaneGeometry(400, 400), new ShadowMaterial({ color: 0x11143a, opacity: 0.2 }));
  page.rotation.x = -Math.PI / 2;
  page.position.y = -thick - 0.71;
  page.receiveShadow = true;
  g.add(page);
  return g;
}

export function buildDiorama(opts: { shadowSize: number; turn: { x: number; y: number } }): Diorama {
  const box = new PaperBox(26);
  const scene = new Scene();
  const turntable = new Group();
  scene.add(turntable);
  turntable.add(ground(box));
  turntable.add(road(box));

  const animated: Animated[] = [];
  const camYaw = LOOK.yaw * D2R;
  STATIONS.forEach((make, i) => {
    const spec = make();
    const at = LOOK.stations[i];
    const st = new Group();
    st.position.set(at.x, 0, at.z);
    // Face the camera, with a small hand-placed turn and a slight lean back, like a propped standee.
    st.rotation.set(at.lean * D2R, camYaw + at.turn * D2R, 0, "YXZ");
    spec.layers.forEach((l, j) => {
      const g = layer(l.pieces, box);
      let obj: Object3D = g;
      if (l.hinge) {
        const pivot = new Group();
        pivot.position.set(l.hinge.x, 0, l.z);
        g.position.x = -l.hinge.x;
        pivot.add(g);
        pivot.rotation.y = l.hinge.deg * D2R;
        obj = pivot;
      } else {
        g.position.z = l.z;
      }
      st.add(obj);
      animated.push({
        obj,
        delay: i * 0.09 + j * 0.05,
        restY: 0,
        restZ: obj.position.z,
        restRotX: 0,
        swing: l.hinge ? l.hinge.deg * D2R : undefined
      });
    });
    turntable.add(st);
  });

  // Light: one sun from the top left of the view, plus a soft sky fill.
  const sky = new HemisphereLight(0xffffff, 0xf4f5fd, LOOK.sky);
  scene.add(sky);
  const light = new DirectionalLight(0xffffff, LOOK.sun);
  const az = camYaw + LOOK.lightAz * D2R;
  const el = LOOK.lightEl * D2R;
  const dir = new Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  light.position.copy(dir).multiplyScalar(120);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(opts.shadowSize, opts.shadowSize);
  const sc = light.shadow.camera;
  sc.left = -62;
  sc.right = 62;
  sc.top = 48;
  sc.bottom = -48;
  sc.near = 40;
  sc.far = 200;
  sc.updateProjectionMatrix();
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.02;
  // Same blur in world units at any map size, so the poster and the live scene match.
  light.shadow.radius = 5 * (opts.shadowSize / 2048);
  scene.add(light, light.target);

  const camera = new PerspectiveCamera(LOOK.fov, LOOK.aspect, 10, 1000);
  fitCamera(camera, turntable, opts.turn);
  const fit = (aspect: number) => {
    const rest = turntable.rotation.clone();
    turntable.rotation.set(0, 0, 0);
    camera.aspect = aspect;
    fitCamera(camera, turntable, opts.turn);
    turntable.rotation.copy(rest);
  };

  return {
    scene,
    camera,
    turntable,
    animated,
    light,
    fit,
    dispose() {
      scene.traverse((o) => {
        if (!(o instanceof Mesh)) return;
        o.geometry.dispose();
        if (o.material instanceof ShadowMaterial) o.material.dispose();
      });
      box.dispose();
    }
  };
}

/** Aim the camera so the whole diorama sits inside the padding, centred, even when turned by the pointer. */
function fitCamera(camera: PerspectiveCamera, root: Object3D, turn: { x: number; y: number }) {
  root.updateMatrixWorld(true);
  const local: Vector3[] = [];
  const b = new Box3();
  for (const child of root.children) {
    b.makeEmpty();
    child.traverse((o) => {
      if (o instanceof Mesh && !(o.material instanceof ShadowMaterial)) b.expandByObject(o);
    });
    if (b.isEmpty()) continue;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) local.push(new Vector3(x, y, z));
  }
  // Room for the card's shadow on the page, down and to the right.
  const { x1, z1, thick } = LOOK.card;
  local.push(new Vector3(x1 + 1.5, -thick, z1 + 1));
  // Every pose the pointer can reach.
  const pts: Vector3[] = [];
  const e = new Euler();
  for (const [rx, ry] of [[0, 0], [turn.x, turn.y], [-turn.x, turn.y], [turn.x, -turn.y], [-turn.x, -turn.y]]) {
    e.set(rx, ry, 0);
    for (const p of local) pts.push(p.clone().applyEuler(e));
  }

  const yaw = LOOK.yaw * D2R;
  const pitch = LOOK.pitch * D2R;
  const back = new Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
  const target = new Vector3();
  for (const p of pts) target.add(p);
  target.divideScalar(pts.length);
  let dist = 220;
  const lim = 1 - 2 * LOOK.pad;
  const v = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  for (let it = 0; it < 12; it++) {
    camera.position.copy(target).addScaledVector(back, dist);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      v.copy(p).project(camera);
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
    const halfH = Math.tan((camera.fov * D2R) / 2) * dist;
    const halfW = halfH * camera.aspect;
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    target.addScaledVector(right, ((minX + maxX) / 2) * halfW).addScaledVector(up, ((minY + maxY) / 2) * halfH);
    dist *= Math.max((maxX - minX) / 2 / lim, (maxY - minY) / 2 / lim);
  }
  camera.position.copy(target).addScaledVector(back, dist);
  camera.lookAt(target);
  camera.near = dist * 0.5;
  camera.far = dist * 2;
  camera.updateProjectionMatrix();
}
