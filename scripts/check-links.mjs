/**
 * Checks every internal link and asset in the built site, including #anchors.
 * Usage: node scripts/check-links.mjs dist [--site https://peoplecraft.vercel.app]
 * Exits with code 1 if anything is broken.
 */
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.argv[2] ?? "dist");
const siteArg = process.argv.indexOf("--site");
const site = new URL(siteArg > -1 ? process.argv[siteArg + 1] : process.env.SITE_URL || "https://peoplecraft.vercel.app");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}

const files = walk(dist);
const html = files.filter((f) => f.endsWith(".html"));
const idsCache = new Map();

function idsOf(file) {
  if (!idsCache.has(file)) {
    const s = fs.readFileSync(file, "utf8");
    idsCache.set(file, new Set([...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
}

/** Map a URL path to the file that serves it, or null. */
function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const candidates = clean.endsWith("/") ? [path.join(dist, clean, "index.html")] : [path.join(dist, clean), path.join(dist, clean, "index.html")];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

const broken = [];
let checked = 0;
for (const file of html) {
  const page = "/" + path.relative(dist, file).replace(/index\.html$/, "").replace(/\\/g, "/");
  // Keep <script src> attributes but ignore what's inside scripts (JSON-LD, data maps).
  const src = fs.readFileSync(file, "utf8").replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, "<script$1></script>");
  for (const m of src.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let ref = m[1].replace(/&amp;/g, "&");
    if (/^(mailto:|tel:|javascript:|data:|blob:|#$)/.test(ref)) continue;
    let url;
    try {
      url = new URL(ref, new URL(page, site));
    } catch {
      broken.push({ page, ref, why: "unparseable URL" });
      continue;
    }
    if (url.origin !== site.origin) continue; // external
    checked++;
    const target = resolve(url.pathname);
    if (!target) {
      broken.push({ page, ref, why: "no such page or file" });
      continue;
    }
    if (url.hash && target.endsWith(".html")) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!idsOf(target).has(id)) broken.push({ page, ref, why: `missing #${id}` });
    }
  }
}

if (broken.length) {
  const byPage = Object.groupBy ? Object.groupBy(broken, (b) => b.page) : broken.reduce((a, b) => ((a[b.page] ??= []).push(b), a), {});
  for (const [p, list] of Object.entries(byPage)) {
    console.log(`\n${p}`);
    for (const b of list) console.log(`  ${b.ref}  (${b.why})`);
  }
  console.log(`\n${broken.length} broken of ${checked} internal links in ${html.length} pages.`);
  process.exit(1);
}
console.log(`All ${checked} internal links in ${html.length} pages resolve.`);
