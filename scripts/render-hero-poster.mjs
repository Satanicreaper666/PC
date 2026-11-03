// Render the home hero's poster from the live three.js scene.
//
// Usage (with the dev server running):
//   node scripts/render-hero-poster.mjs [base-url]
// Default base URL: http://127.0.0.1:4322 (the dev server). Any server that serves
// /styleguide/hero/ works, e.g. `npx astro preview`.
//
// Opens /styleguide/hero/?poster in headless Chromium. The demo page mounts the
// scene in poster mode (settled frame, 560 × 460 CSS px at 2x, drawing buffer kept)
// and hands back the canvas as WebP and PNG. Writes:
//   public/art/hero-poster.webp  (quality 0.86, encoded by the browser)
//   public/art/hero-poster.png   (fallback; palette-quantised with sharp when it is
//                                 installed, which Astro brings along, else as rendered)
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] ?? "http://127.0.0.1:4322").replace(/\/$/, "");
const url = `${base}/styleguide/hero/?poster`;
const outDir = join(root, "public", "art");

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const problems = [];
  page.on("pageerror", (e) => problems.push(String(e)));
  page.on("console", (m) => {
    // The poster itself may 404 the first time it is ever rendered.
    if (m.type() === "error" && !/hero-poster\.(webp|png)/.test(m.location().url ?? "") && !/Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  const started = Date.now();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => "__heroPoster" in window, null, { timeout: 120_000 });
  const shot = await page.evaluate(() => window.__heroPoster);
  if (problems.length) throw new Error("Page errors while rendering:\n" + problems.join("\n"));
  if (shot.width !== 1120 || shot.height !== 920) throw new Error(`Unexpected canvas size ${shot.width}x${shot.height}`);
  if (!shot.webp.startsWith("data:image/webp")) throw new Error("This browser did not encode WebP");

  await mkdir(outDir, { recursive: true });
  const decode = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  const webp = decode(shot.webp);
  let png = decode(shot.png);
  try {
    const { default: sharp } = await import("sharp");
    png = await sharp(png).png({ palette: true, quality: 90, dither: 1, effort: 10, compressionLevel: 9 }).toBuffer();
  } catch {
    console.log("sharp not available: writing the PNG as the browser encoded it");
  }
  for (const [name, bytes] of [
    ["hero-poster.webp", webp],
    ["hero-poster.png", png]
  ]) {
    await writeFile(join(outDir, name), bytes);
    console.log(`public/art/${name}  ${shot.width}x${shot.height}  ${(bytes.length / 1024).toFixed(1)} KB`);
  }
  console.log(`Rendered from ${url} in ${((Date.now() - started) / 1000).toFixed(1)} s`);
} finally {
  await browser.close();
}
