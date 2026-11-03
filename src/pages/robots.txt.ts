import type { APIRoute } from "astro";

/** robots.txt, pointing crawlers at the sitemap for whichever domain the site is built for. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL("/sitemap-index.xml", site).toString();
  const body = ["User-agent: *", "Allow: /", "Disallow: /styleguide/", "", `Sitemap: ${sitemap}`, ""].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
