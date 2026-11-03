/*
 * PeopleCraft offline copies.
 *
 * Registered by src/scripts/desk.ts in production builds only, as /sw.js?v=<build id>,
 * so every deploy installs a fresh worker with fresh caches. The privacy page
 * (src/pages/privacy.astro, "Pages you can open offline") describes this behaviour
 * to readers: keep the two in step.
 *
 * Pages     Network first, so you always get the newest page when you are online.
 *           If the network is gone, or slower than SLOW_MS, the copy kept from your
 *           last visit opens instead; with no copy, the offline page (/offline/) does.
 *           Pages pinned to My desk are always kept, and fetched if they are missing;
 *           other pages are trimmed to the MAX_RECENT opened most recently.
 * Files     Built files (/_astro/), fonts, art and icons, and the search index:
 *           cache first. A build never changes a file in place, so a kept copy is
 *           always the right one for the pages that use it.
 *
 * Copies from the previous build are kept until the next one, so pages opened last
 * week still open offline after a deploy; older builds are deleted.
 * Every cache is named "pc-…", so the privacy page's button deletes them all.
 */
"use strict";

const VERSION = new URL(self.location.href).searchParams.get("v") || "0";
const PAGES = `pc-pages-${VERSION}`;
const FILES = `pc-files-${VERSION}`;
/** KEEP_CACHE and KEEP_URL in src/components/desk/shared.ts: the pinned paths, as JSON, written by the page. */
const KEEP = "pc-keep";
const KEEP_URL = "/__pc-keep.json";
const OFFLINE = "/offline/";
/** Opened at install, so they work offline from the second page on. */
const FIRST = [OFFLINE, "/", "/desk/"];
const MAX_RECENT = 80;
const SLOW_MS = 4000;
/** Files fetched for one kept page, at most (its styles, scripts, fonts and art). */
const MAX_FILES_PER_PAGE = 60;

const STATIC = /^\/(?:_astro|fonts|art|icons|pagefind)\//;
/** What a page needs to look and work right; the search index loads only when you search. */
const PAGE_FILES = /^\/(?:_astro|fonts|art|icons)\//;
/** Font subsets an English page never asks for. */
const UNUSED_FONT = /(?:vietnamese|cyrillic|greek)/i;

const here = self.location.origin;
const sameOrigin = (url) => url.origin === here;
/** Pages and files are kept under their path alone: "/search/?q=pf" is the "/search/" page. */
const keyOf = (url) => here + url.pathname;
const isHtml = (res) => (res.headers.get("content-type") || "").includes("text/html");
const keepable = (res) => !!res && res.status === 200 && res.type === "basic";

/* ---------- Install and activate ---------- */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      // Never fails the install: a page that can't be fetched now is kept on its next visit.
      await Promise.all(FIRST.map((path) => keepPage(pages, path).catch(() => {})));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await dropOldBuilds();
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable().catch(() => {});
      await self.clients.claim();
    })()
  );
});

/** Keeps this build and the one before it; caches from older builds are deleted. */
async function dropOldBuilds() {
  const builds = new Set();
  const names = await caches.keys();
  for (const name of names) {
    const m = /^pc-(?:pages|files)-(.+)$/.exec(name);
    if (m && m[1] !== VERSION) builds.add(m[1]);
  }
  // Build ids are timestamps (src/components/desk/build.ts), so they sort by age.
  const older = [...builds].sort();
  const previous = older.filter((b) => b < VERSION).pop();
  await Promise.all(
    names
      .filter((name) => {
        const m = /^pc-(?:pages|files)-(.+)$/.exec(name);
        return m && m[1] !== VERSION && m[1] !== previous;
      })
      .map((name) => caches.delete(name))
  );
}

/* ---------- Requests ---------- */

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!sameOrigin(url) || url.pathname === KEEP_URL) return;
  if (req.mode === "navigate") event.respondWith(page(event, url));
  else if (STATIC.test(url.pathname) && !req.headers.has("range")) event.respondWith(file(event, url));
});

/** A page: the network's answer if it comes in time, else the kept copy, else the offline page. */
async function page(event, url) {
  const key = keyOf(url);
  const pages = await caches.open(PAGES);
  const network = (async () => {
    const res = (await event.preloadResponse) || (await fetch(event.request));
    if (keepable(res) && !res.redirected && isHtml(res)) {
      const copy = res.clone();
      event.waitUntil(remember(pages, key, copy).catch(() => {}));
    }
    return res;
  })();
  // A kept copy may be shown first; the worker stays up until the fresh page is saved.
  event.waitUntil(network.catch(() => {}));

  const slow = new Promise((resolve) => setTimeout(resolve, SLOW_MS, "slow"));
  const first = await Promise.race([network.catch(() => "failed"), slow]);
  if (first instanceof Response && first.status < 500) return first;

  const copy = await keptPage(pages, key);
  if (copy) return copy;
  if (first instanceof Response) return first;
  if (first === "slow") {
    try {
      return await network;
    } catch {
      /* gone while we waited: fall through to the offline page */
    }
  }
  return (
    (await keptPage(pages, keyOf(new URL(OFFLINE, here)))) ||
    new Response("You're offline, and this page isn't saved on this device yet. It opens when your connection is back.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" }
    })
  );
}

/** This build's copy first, then the previous build's: an older copy beats no page. */
async function keptPage(pages, key) {
  return (await pages.match(key)) || (await caches.match(key));
}

/** A built file, font, picture or search-index file: the kept copy, else the network. */
async function file(event, url) {
  const key = keyOf(url);
  const files = await caches.open(FILES);
  // A hashed build file is the same file in every build, so any build's copy will do.
  const hashed = url.pathname.startsWith("/_astro/");
  const hit = (await files.match(key)) || (hashed ? await caches.match(key) : undefined);
  if (hit) return hit;
  try {
    const res = await fetch(event.request);
    if (keepable(res)) event.waitUntil(files.put(key, res.clone()).catch(() => {}));
    return res;
  } catch (err) {
    // Offline: an earlier build's copy is better than a broken page.
    const old = await caches.match(key);
    if (old) return old;
    throw err;
  }
}

/* ---------- Keeping and trimming ---------- */

/** Saves a page as the most recently opened, then trims the oldest. */
async function remember(pages, key, res) {
  // Deleting first moves the page to the end of the cache's list, which is its age order.
  await pages.delete(key);
  await pages.put(key, res);
  await trim(pages);
}

async function trim(pages) {
  const keep = new Set((await pinnedPaths()).map((p) => keyOf(new URL(p, here))));
  keep.add(keyOf(new URL(OFFLINE, here)));
  const recent = (await pages.keys()).filter((r) => !keep.has(r.url));
  for (const req of recent.slice(0, Math.max(0, recent.length - MAX_RECENT))) await pages.delete(req);
}

async function pinnedPaths() {
  try {
    // caches.match, not caches.open: reading the list must never create the cache.
    const res = await caches.match(KEEP_URL, { cacheName: KEEP });
    const list = res ? await res.json() : [];
    return Array.isArray(list) ? list.filter((p) => typeof p === "string" && p.startsWith("/") && !p.startsWith("//")) : [];
  } catch {
    return [];
  }
}

/* The page says when the pins change (and on every visit): fetch any pinned page not kept yet. */
let filling = null;
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "pc-keep") event.waitUntil(fillPinned());
});

function fillPinned() {
  if (!filling) {
    filling = (async () => {
      const paths = await pinnedPaths();
      if (!paths.length) return;
      const pages = await caches.open(PAGES);
      for (const path of paths) {
        if (!(await pages.match(keyOf(new URL(path, here))))) await keepPage(pages, path).catch(() => {});
      }
    })().finally(() => {
      filling = null;
    });
  }
  return filling;
}

/** Fetches a page and the files it needs to look and work right. */
async function keepPage(pages, path) {
  const url = new URL(path, here);
  if (!sameOrigin(url)) return;
  const res = await fetch(url.href, { credentials: "same-origin" });
  if (!keepable(res) || res.redirected || !isHtml(res)) return;
  const html = await res.clone().text();
  await pages.put(keyOf(url), res);
  await keepFiles(htmlRefs(html, url));
}

async function keepFiles(start) {
  const files = await caches.open(FILES);
  const queue = [...start];
  const seen = new Set(queue.map((u) => u.href));
  let fetched = 0;
  while (queue.length && fetched < MAX_FILES_PER_PAGE) {
    const url = queue.shift();
    const key = keyOf(url);
    let res = await files.match(key);
    if (!res && url.pathname.startsWith("/_astro/")) {
      res = await caches.match(key);
      if (res) await files.put(key, res.clone());
    }
    if (!res) {
      try {
        res = await fetch(url.href, { credentials: "same-origin" });
      } catch {
        continue;
      }
      fetched++;
      if (!keepable(res)) continue;
      await files.put(key, res.clone());
    }
    // Follow what a style sheet or script loads in turn.
    const kind = /\.css$/i.test(url.pathname) ? "css" : /\.m?js$/i.test(url.pathname) ? "js" : "";
    if (!kind) continue;
    const text = await res.text();
    for (const next of kind === "css" ? cssRefs(text, url) : jsRefs(text, url)) {
      if (!seen.has(next.href)) {
        seen.add(next.href);
        queue.push(next);
      }
    }
  }
}

function resolve(list, base, allow) {
  const out = [];
  for (const raw of list) {
    try {
      const u = new URL(raw.replace(/&amp;/g, "&"), base);
      if (sameOrigin(u) && allow.test(u.pathname) && !UNUSED_FONT.test(u.pathname)) out.push(u);
    } catch {
      /* not a URL */
    }
  }
  return out;
}

/** Styles, scripts, preloads, icons and pictures named in a page. */
function htmlRefs(html, base) {
  const raw = [];
  let m;
  const attr = /\s(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  while ((m = attr.exec(html))) raw.push(m[1]);
  const srcset = /\ssrcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = srcset.exec(html))) for (const part of m[1].split(",")) raw.push(part.trim().split(/\s+/)[0]);
  const urls = resolve(raw, base, PAGE_FILES);
  // A PNG with a WebP twin is only the fallback for old browsers: skip it.
  const webp = new Set(urls.filter((u) => /\.webp$/i.test(u.pathname)).map((u) => u.pathname.replace(/\.webp$/i, "")));
  return urls.filter((u) => !(/\.png$/i.test(u.pathname) && webp.has(u.pathname.replace(/\.png$/i, ""))));
}

/** Fonts and pictures a style sheet loads. */
function cssRefs(css, base) {
  const raw = [];
  let m;
  const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  while ((m = re.exec(css))) if (!m[2].startsWith("data:")) raw.push(m[2]);
  return resolve(raw, base, PAGE_FILES);
}

/** Chunks a script imports up front ("import … from './x.js'"); chunks loaded later on demand are skipped. */
function jsRefs(js, base) {
  const raw = [];
  let m;
  const re = /(?:\bfrom|\bimport)\s*["'](\.{1,2}\/[^"']+\.m?js)["']/g;
  while ((m = re.exec(js))) raw.push(m[1]);
  return resolve(raw, base, PAGE_FILES);
}
