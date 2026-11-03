/**
 * Company details, saved once on this device: every letter and form fills the
 * empty company fields from them. The optional letterhead logo is kept as a
 * data URL under its own key, so the details stay small and quick to read.
 *
 * Storage: "pc-company" (the details) and "pc-letterhead" (the logo).
 */
import type { DocxLogo } from "./docx-export.ts";
import { readJson, removeKey, writeJson } from "./store.ts";

export const COMPANY_KEY = "pc-company";
export const LETTERHEAD_KEY = "pc-letterhead";

/** Each saved detail, and the template field ids it fills (the first id is the detail's own name). */
export const PROFILE_FIELDS = [
  { key: "company", label: "Company name", short: "company name", ids: ["company"] },
  { key: "company_address", label: "Company address", short: "address", ids: ["company_address"] },
  { key: "signatory_name", label: "Signed by", short: "signatory", ids: ["signatory_name"] },
  { key: "signatory_role", label: "Signatory's designation", short: "signatory's designation", ids: ["signatory_role"] },
  { key: "hr_contact", label: "HR contact", short: "HR contact", ids: ["hr_contact", "privacy_contact", "return_to"] }
] as const;

export type ProfileKey = (typeof PROFILE_FIELDS)[number]["key"];
export type Profile = Partial<Record<ProfileKey, string>>;

export function profileKeyFor(fieldId: string): ProfileKey | undefined {
  return PROFILE_FIELDS.find((f) => (f.ids as readonly string[]).includes(fieldId))?.key;
}

export function profileShort(key: ProfileKey): string {
  return PROFILE_FIELDS.find((f) => f.key === key)?.short ?? key;
}

/** Only known keys with text in them, so a damaged or old entry can't put junk into a letter. */
export function cleanProfile(raw: unknown): Profile {
  const out: Profile = {};
  if (!raw || typeof raw !== "object") return out;
  for (const f of PROFILE_FIELDS) {
    const v = (raw as Record<string, unknown>)[f.key];
    if (typeof v === "string" && v.trim()) out[f.key] = v.trim();
  }
  return out;
}

export function loadProfile(): Profile | null {
  const p = cleanProfile(readJson(COMPANY_KEY));
  return Object.keys(p).length ? p : null;
}

export function saveProfile(p: Profile): boolean {
  const clean = cleanProfile(p);
  if (!Object.keys(clean).length) {
    removeKey(COMPANY_KEY);
    return true;
  }
  return writeJson(COMPANY_KEY, { ...clean, savedAt: new Date().toISOString() });
}

export function forgetProfile(): void {
  removeKey(COMPANY_KEY);
  removeKey(LETTERHEAD_KEY);
}

/** "company name, signatory and HR contact" */
export function listWords(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/* ---------- Letterhead logo ---------- */

export type LogoType = "image/png" | "image/jpeg" | "image/svg+xml";
export type Letterhead = { src: string; type: LogoType; width: number; height: number; name: string };

export const LOGO_MAX_BYTES = 200 * 1024;
const BY_EXT: Record<string, LogoType> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml" };
const TYPES: LogoType[] = ["image/png", "image/jpeg", "image/svg+xml"];

/** The file's type from its MIME type, or from its extension when the system gives none (common for SVG). */
export function logoType(file: { name: string; type: string }): LogoType | null {
  if ((TYPES as string[]).includes(file.type)) return file.type as LogoType;
  if (file.type && file.type !== "application/octet-stream") return null;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXT[ext] ?? null;
}

/** What's wrong with a file as a logo, in words the reader can act on, or null when it's fine. */
export function logoProblem(file: { name: string; type: string; size: number }): string | null {
  if (!logoType(file)) return "Choose a PNG, JPG or SVG file for the logo.";
  if (file.size > LOGO_MAX_BYTES) return `That file is ${Math.ceil(file.size / 1024)} KB. Choose a logo of 200 KB or less, or make this one smaller first.`;
  if (file.size === 0) return "That file is empty. Choose another logo.";
  return null;
}

/**
 * The logo's size on the page: at most 56 px tall and 220 px wide, keeping its shape.
 * Vector logos grow to fill that box; a small PNG or JPG is never blown up and blurred.
 */
export function logoBox(width: number, height: number, vector = false, maxW = 220, maxH = 56): { width: number; height: number } {
  const w = width > 0 ? width : 300;
  const h = height > 0 ? height : 150;
  const fit = Math.min(maxW / w, maxH / h);
  const scale = vector ? fit : Math.min(fit, 1);
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/** An SVG's own size, from width and height or else its viewBox. */
export function svgSize(svg: string): { width: number; height: number } | null {
  const tag = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!tag) return null;
  const num = (name: string) => {
    const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']\\s*([\\d.]+)\\s*(px)?\\s*["']`, "i"));
    return m ? Number(m[1]) : NaN;
  };
  const w = num("width");
  const h = num("height");
  if (w > 0 && h > 0) return { width: w, height: h };
  const vb = tag.match(/\sviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i);
  if (vb && Number(vb[1]) > 0 && Number(vb[2]) > 0) return { width: Number(vb[1]), height: Number(vb[2]) };
  return null;
}

/** Give an SVG an explicit pixel size, so browsers draw it at that size on a canvas. */
export function sizedSvg(svg: string, width: number, height: number): string {
  return svg.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => {
    const rest = attrs.replace(/\s(width|height)\s*=\s*(["'])[^"']*\2/gi, "");
    return `<svg${rest} width="${width}" height="${height}">`;
  });
}

export function dataUrlBytes(src: string): Uint8Array {
  const comma = src.indexOf(",");
  const meta = src.slice(0, comma);
  const body = src.slice(comma + 1);
  if (/;base64/i.test(meta)) {
    const bin = atob(body);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new TextEncoder().encode(decodeURIComponent(body));
}

function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function textToDataUrl(text: string, type: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:${type};base64,${btoa(bin)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The image could not be read."));
    img.src = src;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("The file could not be read."));
    r.readAsDataURL(file);
  });
}

/** Read a chosen file into a letterhead, checking its type, size and that it really is an image. */
export async function readLogo(file: File): Promise<Letterhead> {
  const problem = logoProblem(file);
  if (problem) throw new Error(problem);
  const type = logoType(file)!;
  let src = await readAsDataUrl(file);
  // Some systems label SVGs as octet-stream; store them under the right type.
  src = src.replace(/^data:[^;,]*/, `data:${type}`);
  let width = 0;
  let height = 0;
  if (type === "image/svg+xml") {
    const text = bytesToText(dataUrlBytes(src));
    if (!/<svg\b/i.test(text)) throw new Error("That SVG file doesn't contain a drawing. Choose another logo.");
    const size = svgSize(text);
    width = size?.width ?? 0;
    height = size?.height ?? 0;
  }
  try {
    const img = await loadImage(src);
    if (!width || !height) {
      width = img.naturalWidth;
      height = img.naturalHeight;
    }
  } catch {
    throw new Error("That file isn't an image this browser can open. Choose a PNG, JPG or SVG logo.");
  }
  return { src, type, width: width || 300, height: height || 150, name: file.name.slice(0, 120) };
}

export function loadLetterhead(): Letterhead | null {
  const l = readJson<Letterhead>(LETTERHEAD_KEY);
  if (!l || typeof l.src !== "string" || !/^data:image\/(png|jpeg|svg\+xml)[;,]/.test(l.src)) return null;
  if (!(TYPES as string[]).includes(l.type)) return null;
  return { src: l.src, type: l.type, width: Number(l.width) || 300, height: Number(l.height) || 150, name: String(l.name ?? "logo") };
}

export function saveLetterhead(l: Letterhead): boolean {
  return writeJson(LETTERHEAD_KEY, l);
}

export function removeLetterhead(): void {
  removeKey(LETTERHEAD_KEY);
}

async function svgToPng(l: Letterhead, width: number, height: number, scale = 3): Promise<Uint8Array | null> {
  try {
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const text = sizedSvg(bytesToText(dataUrlBytes(l.src)), w, h);
    const img = await loadImage(textToDataUrl(text, "image/svg+xml"));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export function letterheadBox(l: Letterhead): { width: number; height: number } {
  return logoBox(l.width, l.height, l.type === "image/svg+xml");
}

/** The logo as the Word export wants it. SVGs get a PNG copy for Word versions that can't show SVG. */
export async function logoForDocx(l: Letterhead, company?: string): Promise<DocxLogo | null> {
  const box = letterheadBox(l);
  const alt = company ? `${company} logo` : "Company logo";
  const data = dataUrlBytes(l.src);
  if (l.type === "image/svg+xml") {
    const fallback = await svgToPng(l, box.width, box.height);
    return fallback ? { type: "svg", data, fallback, ...box, alt } : null;
  }
  return { type: l.type === "image/png" ? "png" : "jpg", data, ...box, alt };
}
