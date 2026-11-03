// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The live site is on Vercel. When a custom domain is added, build with e.g. SITE_URL=https://peoplecraft.in npm run build
const site = process.env.SITE_URL || "https://peoplecraft.vercel.app";

/**
 * Sitemap lastmod: each chapter, tool and JD's "checked" date, read from its file, so
 * search engines can tell which pages changed after a law update. Other pages use the
 * most recent date.
 */
function lastModByPath() {
  /** @type {Map<string, string>} */
  const map = new Map();
  /** @param {string} file */
  const read = (file) => /^checked:\s*(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(file, "utf8"))?.[1];
  /** @param {string} d */
  const dir = (d) => readdirSync(d, { withFileTypes: true });
  for (const book of dir("src/content/handbooks").filter((e) => e.isDirectory())) {
    for (const f of dir(join("src/content/handbooks", book.name))) {
      const date = read(join("src/content/handbooks", book.name, f.name));
      if (date) map.set(`/handbooks/${book.name}/${f.name.replace(/^\d+-/, "").replace(/\.mdx?$/, "")}/`, date);
    }
  }
  for (const f of dir("src/content/toolkit")) {
    const date = read(join("src/content/toolkit", f.name));
    if (date) map.set(`/toolkit/${f.name.replace(/\.mdx?$/, "")}/`, date);
  }
  for (const f of dir("src/content/jds")) {
    const date = read(join("src/content/jds", f.name));
    if (date) map.set(`/jd-library/${f.name.replace(/\.md$/, "")}/`, date);
  }
  const latest = [...map.values()].sort().pop();
  /** @param {string} path */
  const get = (path) => map.get(path) ?? latest;
  return { get };
}
const lastMod = lastModByPath();

export default defineConfig({
  site,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  integrations: [
    mdx(),
    sitemap({
      // Pages marked noindex (not found, My desk, offline, the style guide) stay out of the sitemap too.
      filter: (page) => !/^\/(?:404|desk|offline|styleguide)(?:[/.]|$)/.test(new URL(page).pathname),
      serialize: (item) => {
        const date = lastMod.get(new URL(item.url).pathname);
        return date ? { ...item, lastmod: new Date(date).toISOString() } : item;
      }
    })
  ],
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  markdown: {
    shikiConfig: { theme: "github-light" }
  },
  devToolbar: { enabled: false }
});
