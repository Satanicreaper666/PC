/**
 * Vercel Web Analytics: anonymous page-view counts, no cookies.
 *
 * - Built in only when the site is built on Vercel (__VERCEL_ANALYTICS__, set in
 *   astro.config.mjs), so local, CI and Apache builds load nothing.
 * - "production" mode loads /_vercel/insights/script.js from this site, never a
 *   script from another host.
 * - Only the page's path is sent. Query strings and #fragments are stripped, because
 *   calculators put their inputs (salaries, dates) in the address for "Copy link",
 *   and search puts the words typed there.
 * - Visitors whose browser sends Do Not Track or Global Privacy Control are not counted.
 *
 * The privacy page (src/pages/privacy.astro, "Counting visits") describes this:
 * keep the two in step.
 */
import { inject } from "@vercel/analytics";

/** "https://x/toolkit/take-home/?ctc=900000#working" → "https://x/toolkit/take-home/" */
export const pathOnly = (url: string): string => url.replace(/[?#].*$/, "");

export function optedOut(nav: { doNotTrack?: string | null; globalPrivacyControl?: boolean }): boolean {
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function startAnalytics(): void {
  if (optedOut(navigator as Navigator & { globalPrivacyControl?: boolean })) return;
  inject({
    mode: "production",
    beforeSend: (event) => ({ ...event, url: pathOnly(event.url) })
  });
}
