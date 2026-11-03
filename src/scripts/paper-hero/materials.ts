/**
 * Paper for the hero diorama: the exact colours from docs/ART-DIRECTION.md
 * ("Materials"), matte (Lambert: no specular at all), flat-shaded, with a faint grain.
 */
import { CanvasTexture, MeshLambertMaterial, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

export const INK = {
  /** --neel-600: main figures, dark paper */
  indigo: 0x3b44a6,
  /** --neel-800: shadows of dark paper, hair-thin detail */
  deep: 0x252b68,
  /** --neel-100: background paper, ground */
  pale: 0xdde1f7,
  /** --neel-300: second figure, furniture */
  mid: 0x949ee2,
  /** --haldi-400: the one thing that matters */
  haldi: 0xefab22,
  /** --haldi-200: turmeric's lit edge, a second warm object */
  haldiLight: 0xfcd98a,
  /** --paper: documents, highlights */
  white: 0xffffff
} as const;

/** Seeded so the poster and the live scene have the same grain. */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A small tile of paper grain: soft speckle plus a few fibres, near white. */
export function grainTexture(size = 128): Texture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const t = new CanvasTexture(c);
  if (!ctx) return t;
  const rnd = prng(7);
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < size * size; i++) {
    // Mostly white, a few slightly darker flecks.
    const v = 255 - Math.round(rnd() * rnd() * 16);
    d[i * 4] = v;
    d[i * 4 + 1] = v;
    d[i * 4 + 2] = v;
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // Fibres: short, faint, mostly one direction like laid paper.
  ctx.lineCap = "round";
  for (let i = 0; i < 26; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const a = (rnd() - 0.5) * 0.9;
    const len = 4 + rnd() * 10;
    ctx.strokeStyle = rnd() < 0.5 ? "rgba(0,0,0,0.035)" : "rgba(255,255,255,0.5)";
    ctx.lineWidth = 0.6 + rnd() * 0.6;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(x + dx + Math.cos(a) * len, y + dy + Math.sin(a) * len);
        ctx.stroke();
      }
    }
  }
  t.needsUpdate = true;
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.colorSpace = SRGBColorSpace;
  return t;
}

export class PaperBox {
  private cache = new Map<number, MeshLambertMaterial>();
  readonly grain: Texture;

  constructor(grainScale: number) {
    this.grain = grainTexture();
    // Extrusion UVs are in figure units: one tile of grain covers `grainScale` units.
    this.grain.repeat.set(1 / grainScale, 1 / grainScale);
  }

  get(color: number): MeshLambertMaterial {
    let m = this.cache.get(color);
    if (!m) {
      m = new MeshLambertMaterial({ color, map: this.grain, flatShading: true });
      this.cache.set(color, m);
    }
    return m;
  }

  dispose() {
    for (const m of this.cache.values()) m.dispose();
    this.grain.dispose();
  }
}
