/** RSS for /changes/: one item per dated change, newest first. */
import type { APIRoute } from "astro";
import { changes } from "../../lib/changes";

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export const GET: APIRoute = ({ site }) => {
  const base = new URL("/changes/", site).toString();
  const items = changes()
    .map(
      (c) => `    <item>
      <title>${esc(c.title)}</title>
      <link>${esc(`${base}#${c.anchor}`)}</link>
      <guid isPermaLink="false">${esc(c.anchor)}</guid>
      <pubDate>${new Date(`${c.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc([c.detail, `${c.law}.`, `Source: ${c.source.title} ${c.source.url}`].filter(Boolean).join(" "))}</description>
    </item>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PeopleCraft: what changed</title>
    <link>${esc(base)}</link>
    <description>Changes to Indian labour law rates and rules used by PeopleCraft's calculators and handbooks.</description>
    <language>en-IN</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
