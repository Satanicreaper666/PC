/**
 * Make a copy of the built site that works from any folder or host path
 * (a file server, a zip opened locally, an artifact preview):
 *   - root links "/toolkit/" become relative "../toolkit/index.html"
 *   - CSS url(/…) and inline <style> urls become relative
 *   - <html data-root="../"> lets scripts build links with siteHref()
 *
 * Usage: node scripts/make-preview.mjs dist dist-preview
 */
import fs from "node:fs";
import path from "node:path";

const src = path.resolve(process.argv[2] ?? "dist");
const out = path.resolve(process.argv[3] ?? "dist-preview");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
}
const files = walk(out);

/** "/a/b/?q=1#x" seen from file F → relative path to the file that serves it. */
function rel(fromFile, url) {
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  const cut = url.search(/[?#]/);
  const p = cut === -1 ? url : url.slice(0, cut);
  const rest = cut === -1 ? "" : url.slice(cut);
  let target = p.replace(/^\/+/, "");
  if (target === "" || target.endsWith("/")) target += "index.html";
  else if (!/\.[a-z0-9]+$/i.test(target) && fs.existsSync(path.join(out, target, "index.html"))) target += "/index.html";
  let r = path.relative(path.dirname(fromFile), path.join(out, target)).split(path.sep).join("/");
  if (!r.startsWith(".")) r = `./${r}`;
  return r + rest;
}

const fixCssUrls = (file, css) => css.replace(/url\((['"]?)(\/[^'")]+)\1\)/g, (_, q, u) => `url(${q}${rel(file, u)}${q})`);

let pages = 0;
for (const f of files) {
  if (f.endsWith(".html")) {
    let s = fs.readFileSync(f, "utf8");
    // Attributes that load or link something.
    s = s.replace(/(\s(?:href|src|action|poster|data-src))="(\/[^"]*)"/g, (_, a, u) => `${a}="${rel(f, u)}"`);
    s = s.replace(/\ssrcset="([^"]+)"/g, (_, v) => ` srcset="${v.split(",").map((part) => part.trim().replace(/^(\/\S+)/, (u) => rel(f, u))).join(", ")}"`);
    // CSS inside <style> blocks and style="" attributes.
    s = s.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g, (_, o, css, c) => o + fixCssUrls(f, css) + c);
    s = s.replace(/\sstyle="([^"]*url\([^"]*)"/g, (_, css) => ` style="${fixCssUrls(f, css)}"`);
    // Tell scripts where the site root is.
    let root = path.relative(path.dirname(f), out).split(path.sep).join("/");
    root = root ? `${root}/` : "./";
    s = s.replace(/<html\b([^>]*)>/, (m, attrs) => (attrs.includes("data-root") ? m : `<html${attrs} data-root="${root}">`));
    fs.writeFileSync(f, s);
    pages++;
  } else if (f.endsWith(".css")) {
    fs.writeFileSync(f, fixCssUrls(f, fs.readFileSync(f, "utf8")));
  }
}

// Report any root-absolute asset paths left inside JS bundles (they would 404 in the preview).
const leftovers = files
  .filter((f) => f.endsWith(".js") && !f.includes(`${path.sep}pagefind${path.sep}`))
  .filter((f) => /["'`]\/_astro\//.test(fs.readFileSync(f, "utf8")))
  .map((f) => path.relative(out, f));
console.log(`Preview written to ${out} (${pages} pages).`);
if (leftovers.length) console.log(`Note: root paths remain inside: ${leftovers.join(", ")}`);
