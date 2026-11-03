#!/usr/bin/env node
/**
 * Lock inline scripts to their exact content.
 *
 * The CSP header in vercel.json and public/.htaccess has to allow 'unsafe-inline'
 * scripts, because Astro writes a few small inline scripts (13 distinct ones across
 * the site) and a static header can't list per-page hashes. This step runs after
 * the build and adds, to every page, a second policy as a <meta> tag:
 *
 *   script-src 'self' 'wasm-unsafe-eval' 'sha256-…' (one hash per inline script on that page)
 *
 * Browsers enforce both policies, so an inline script now runs only if its hash
 * matches: injected markup can't run code even though the header allows inline.
 * Everything else (default-src, frame-ancestors, …) still comes from the header.
 *
 * Usage: node scripts/csp-meta.mjs dist      (part of `npm run build`)
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] || "dist";
/** Script types the browser executes; JSON-LD and other data blocks are not scripts to CSP. */
const EXECUTABLE = /^(?:|text\/javascript|application\/javascript|module)$/i;
const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function pages(d) {
  return readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? pages(p) : f.endsWith(".html") ? [p] : [];
  });
}

let files = 0;
const distinct = new Set();
for (const file of pages(dir)) {
  let html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) continue; // already done
  const hashes = new Set();
  for (const [, attrs, body] of html.matchAll(SCRIPT)) {
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = /\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attrs)?.[1] ?? "";
    if (!EXECUTABLE.test(type)) continue;
    const h = `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`;
    hashes.add(h);
    distinct.add(h);
  }
  const policy = ["script-src 'self' 'wasm-unsafe-eval'", ...hashes].join(" ");
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
  // Must come before any script; right after the charset is the earliest valid place.
  const at = html.search(/<meta charset[^>]*>/i);
  if (at < 0) throw new Error(`${file}: no <meta charset> to put the policy after`);
  const end = html.indexOf(">", at) + 1;
  html = html.slice(0, end) + meta + html.slice(end);
  writeFileSync(file, html);
  files++;
}
console.log(`CSP: script hashes added to ${files} pages (${distinct.size} distinct inline scripts).`);
