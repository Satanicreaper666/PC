// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// The live site is on Vercel. When a custom domain is added, build with e.g. SITE_URL=https://peoplecraft.in npm run build
const site = process.env.SITE_URL || "https://peoplecraft.vercel.app";

export default defineConfig({
  site,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  integrations: [
    mdx(),
    sitemap({
      // Pages marked noindex (not found, My desk, offline, the style guide) stay out of the sitemap too.
      filter: (page) => !/^\/(?:404|desk|offline|styleguide)(?:[/.]|$)/.test(new URL(page).pathname)
    })
  ],
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  markdown: {
    shikiConfig: { theme: "github-light" }
  },
  devToolbar: { enabled: false }
});
