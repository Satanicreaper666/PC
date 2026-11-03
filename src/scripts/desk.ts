/**
 * My desk (/desk/): what a returning reader pinned, opened, started and read.
 * Loaded on every page from BaseLayout. Everything stays in this browser:
 *
 *   pc-desk-pins    pinned chapters, tools, JDs and glossary terms (the "Pin to desk" buttons)
 *   pc-desk-recent  the last 12 library pages opened
 *   pc-desk-read    chapters read: reached the Sources section, or 85% of the text
 *   pc-desk-edits   when a checklist was last ticked (the ticks themselves are kept by the
 *                   checklist as pc_cl_<id>; drafts, pc-drafts-<id>, carry their own time)
 *
 * The privacy page's "Clear everything" removes these keys (/^(pc[_-]|peoplecraft)/i).
 * Nothing is sent anywhere. In production builds served from the site root this
 * also registers the offline service worker (public/sw.js).
 */
import { siteHref } from "./href";
import { DESK_KEYS, KEEP_CACHE, KEEP_URL, type DeskItem } from "../components/desk/shared";

export { siteHref };
export type { DeskItem };

export const RECENT_MAX = 12;
const PINS_MAX = 300;
/** Fired on window whenever desk data changes, in this tab or another one. detail.what: "pins" | "recent" | "read" | "edits" | "all". */
export const DESK_CHANGE = "pc-desk-change";
/** A chapter counts as read once its Sources section or 85% of its text has been on screen, and the page has been open this long. */
const READ_SHARE = 0.85;
const READ_MIN_MS = 10_000;

/* ---------- Storage (every read is checked, so a broken value can't break a page) ---------- */
function load(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function drop(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable: nothing saved */
  }
}

/** False when the browser won't let the site keep anything (blocked storage, some private modes). */
export function storageWorks(): boolean {
  try {
    localStorage.setItem("pc-desk-probe", "1");
    localStorage.removeItem("pc-desk-probe");
    return true;
  } catch {
    return false;
  }
}

/** Keys in localStorage, or none. */
export function storedKeys(): string[] {
  try {
    return Object.keys(localStorage);
  } catch {
    return [];
  }
}
export function readRaw(key: string): unknown {
  return load(key);
}
export function removeKeys(keys: string[]) {
  keys.forEach(drop);
}

/** A root path on this site ("/toolkit/x/", "/glossary/#ctc"), never a protocol or another host. */
export const isSitePath = (v: unknown): v is string => typeof v === "string" && /^\/(?!\/)/.test(v);
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export function cleanItem(v: unknown): DeskItem | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const title = text(o.title, 200);
  if (!isSitePath(o.href) || !title) return null;
  return {
    href: o.href,
    title,
    kind: text(o.kind, 80) ?? "",
    art: text(o.art, 40) ?? "",
    description: text(o.description, 400),
    meta: text(o.meta, 120),
    code: text(o.code, 24),
    at: typeof o.at === "number" && Number.isFinite(o.at) ? o.at : 0
  };
}
function items(key: string): DeskItem[] {
  const v = load(key);
  return Array.isArray(v) ? v.map(cleanItem).filter((x): x is DeskItem => !!x) : [];
}
function stamps(key: string): Record<string, number> {
  const v = load(key);
  const out: Record<string, number> = {};
  if (v && typeof v === "object" && !Array.isArray(v)) {
    for (const [k, t] of Object.entries(v)) if (typeof t === "number" && Number.isFinite(t)) out[k] = t;
  }
  return out;
}

function changed(what: string) {
  window.dispatchEvent(new CustomEvent(DESK_CHANGE, { detail: { what } }));
}

/* ---------- Pins ---------- */
export const getPins = () => items(DESK_KEYS.pins);

/** Pin an item (or put one back where it was, for "Undo"). False if the browser refused to save. */
export function pin(item: DeskItem, index = 0): boolean {
  const pins = getPins().filter((p) => p.href !== item.href);
  pins.splice(Math.max(0, Math.min(index, pins.length)), 0, { ...item, at: item.at || Date.now() });
  const ok = save(DESK_KEYS.pins, pins.slice(0, PINS_MAX));
  changed("pins");
  return ok;
}
export function unpin(href: string) {
  save(
    DESK_KEYS.pins,
    getPins().filter((p) => p.href !== href)
  );
  changed("pins");
}
export function clearPins() {
  drop(DESK_KEYS.pins);
  changed("pins");
}

/* ---------- Recently viewed ---------- */
export const getRecent = () => items(DESK_KEYS.recent);

export function recordVisit(item: Omit<DeskItem, "at">) {
  const rest = getRecent().filter((p) => p.href !== item.href);
  const entry: DeskItem = { href: item.href, title: item.title, kind: item.kind, art: item.art, at: Date.now() };
  if (save(DESK_KEYS.recent, [entry, ...rest].slice(0, RECENT_MAX))) changed("recent");
}
export function clearRecent() {
  drop(DESK_KEYS.recent);
  changed("recent");
}

/* ---------- Chapters read ---------- */
export const getRead = () => stamps(DESK_KEYS.read);

export function markRead(href: string): boolean {
  const read = getRead();
  if (read[href]) return false;
  read[href] = Date.now();
  const ok = save(DESK_KEYS.read, read);
  if (ok) changed("read");
  return ok;
}
export function clearRead() {
  drop(DESK_KEYS.read);
  changed("read");
}

/* ---------- When drafts and checklists were last changed ---------- */
export const getEdits = () => stamps(DESK_KEYS.edits);
const lastNoted = new Map<string, number>();
function noteEdit(key: string) {
  const now = Date.now();
  if (now - (lastNoted.get(key) ?? 0) < 4000) return;
  lastNoted.set(key, now);
  const edits = { ...getEdits(), [key]: now };
  // Keep the 80 most recent.
  save(DESK_KEYS.edits, Object.fromEntries(Object.entries(edits).sort((a, b) => b[1] - a[1]).slice(0, 80)));
}

/* ---------- Where am I ---------- */
/**
 * This page as a root path ("/toolkit/offer-letter/"), also in the offline preview
 * build, where <html data-root="../../"> says how far up the site root is.
 */
export function sitePath(): string {
  let p = location.pathname;
  const root = document.documentElement.dataset.root;
  if (root !== undefined) {
    const base = new URL(root, location.href).pathname;
    if (p.startsWith(base)) p = `/${p.slice(base.length)}`;
  }
  return p.replace(/index\.html$/, "");
}

/* ---------- A short status message at the bottom of the screen (role="status", in the site header) ---------- */
let toastTimer = 0;
export function toast(message: string) {
  const el = document.querySelector<HTMLElement>("[data-desk-toast]");
  if (!el) return;
  window.clearTimeout(toastTimer);
  el.classList.remove("show");
  el.textContent = "";
  // A fresh text node in a new frame, so a repeated message is announced again.
  requestAnimationFrame(() => {
    el.textContent = message;
    el.classList.add("show");
    toastTimer = window.setTimeout(() => {
      el.classList.remove("show");
      toastTimer = window.setTimeout(() => (el.textContent = ""), 400);
    }, 3400);
  });
}

/* ---------- Pin buttons and the header count ---------- */
export function pinData(b: HTMLElement): DeskItem | null {
  try {
    return cleanItem({ ...JSON.parse(b.dataset.pin ?? "null"), at: 0 });
  } catch {
    return null;
  }
}

/** Set every pin button's state and the header's count from storage. */
export function syncPins() {
  const pinned = new Set(getPins().map((p) => p.href));
  document.querySelectorAll<HTMLButtonElement>("button[data-pin]").forEach((b) => {
    const on = pinned.has(pinData(b)?.href ?? "");
    b.setAttribute("aria-pressed", String(on));
    if (b.hasAttribute("data-pin-page")) b.title = on ? "On your desk. Press again to unpin." : "Keep this page on My desk";
  });
  const n = pinned.size;
  document.querySelectorAll<HTMLElement>("[data-desk-count]").forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
  document.querySelectorAll<HTMLElement>("[data-desk-count-text]").forEach((el) => {
    el.textContent = n ? `, ${n} pinned` : "";
  });
}

function togglePin(b: HTMLButtonElement) {
  const item = pinData(b);
  if (!item) return;
  const on = b.getAttribute("aria-pressed") !== "true";
  if (on) {
    if (!pin({ ...item, at: Date.now() })) {
      toast("This browser isn't letting PeopleCraft save anything, so nothing was pinned.");
      syncPins();
      return;
    }
    toast(b.hasAttribute("data-pin-page") ? "Pinned to My desk" : `${item.title} pinned to My desk`);
  } else {
    unpin(item.href);
    toast(b.hasAttribute("data-pin-page") ? "Removed from My desk" : `${item.title} removed from My desk`);
  }
  syncPins();
}

/* ---------- Offline copies of pinned pages are never thrown away (public/sw.js reads this list) ---------- */
async function keepPinnedOffline() {
  const worker = navigator.serviceWorker?.controller;
  if (!("caches" in window) || !worker) return;
  try {
    const list = Array.from(new Set(getPins().map((p) => p.href.replace(/#.*$/, "")))).sort();
    // Nothing pinned and no list kept: leave cache storage alone (the privacy page may have just cleared it).
    if (!list.length && !(await caches.has(KEEP_CACHE))) return;
    const paths = JSON.stringify(list);
    const cache = await caches.open(KEEP_CACHE);
    const old = await cache.match(KEEP_URL);
    if (!old || (await old.text()) !== paths) {
      await cache.put(KEEP_URL, new Response(paths, { headers: { "content-type": "application/json" } }));
    }
    // The worker fetches any pinned page it hasn't kept yet (after a new build, say).
    if (list.length) worker.postMessage({ type: "pc-keep" });
  } catch {
    /* offline copies are a bonus */
  }
}

/* ---------- What this page is, for "Recently viewed" ---------- */
function pageItem(path: string): Omit<DeskItem, "at"> | null {
  // Not the desk, the offline page, a 404 or any other page kept out of search.
  if (document.querySelector('meta[name="robots"][content*="noindex"], [data-desk-skip]')) return null;
  const btn = document.querySelector<HTMLElement>("button[data-pin][data-pin-page]");
  const card = btn ? pinData(btn) : null;
  if (card && card.href === path) return card;
  const h1 = document.querySelector("main h1")?.textContent?.replace(/\s+/g, " ").trim();
  if (!h1) return null;
  let m = path.match(/^\/handbooks\/([a-z0-9-]+)\/$/);
  if (m) return { href: path, title: h1, kind: "Handbook", art: m[1] };
  m = path.match(/^\/start\/([a-z0-9-]+)\/$/);
  if (m) return { href: path, title: h1, kind: "Start here", art: m[1] };
  return null;
}

/* ---------- Chapters read ---------- */
function trackReading(path: string) {
  if (!/^\/handbooks\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(path) || getRead()[path]) return;
  const text = document.querySelector<HTMLElement>(".article .content") ?? document.querySelector<HTMLElement>("main article");
  if (!text) return;
  const sources = document.querySelector<HTMLElement>("#sources-title");
  const opened = Date.now();
  let reached = false;
  let done = false;
  let timer = 0;

  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scroll", onScroll);
    io?.disconnect();
    if (!markRead(path)) return;
    const book = path.split("/")[2];
    const total = document.querySelectorAll("[data-thread-chapter]").length;
    const read = Object.keys(getRead()).filter((h) => h.startsWith(`/handbooks/${book}/`)).length;
    toast(total ? `Chapter read: ${read} of ${total} in this handbook` : "Chapter marked as read on My desk");
  };
  const reach = () => {
    if (reached) return;
    reached = true;
    const wait = READ_MIN_MS - (Date.now() - opened);
    if (wait <= 0) finish();
    else timer = window.setTimeout(finish, wait);
  };
  const check = () => {
    const r = text.getBoundingClientRect();
    if (r.height > 0 && (window.innerHeight - r.top) / r.height >= READ_SHARE) reach();
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      check();
    });
  };
  const io =
    sources && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) reach();
        })
      : null;
  if (sources) io?.observe(sources);
  window.addEventListener("scroll", onScroll, { passive: true });
  check();
  window.addEventListener("pagehide", () => window.clearTimeout(timer), { once: true });
}

/* ---------- The offline service worker: production builds, served from the site root only ---------- */
function registerOffline() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  // <html data-root> marks the sub-path preview build (scripts/make-preview.mjs): no service worker there.
  if (document.documentElement.dataset.root !== undefined) return;
  const build = document.querySelector<HTMLElement>("[data-build]")?.dataset.build ?? "";
  // A first visit has no worker in charge yet: tell it about the pins once it takes over.
  navigator.serviceWorker.addEventListener("controllerchange", () => void keepPinnedOffline(), { once: true });
  const go = () => {
    navigator.serviceWorker
      .register(`/sw.js${build ? `?v=${encodeURIComponent(build)}` : ""}`)
      .then(() => keepPinnedOffline())
      .catch(() => {
        /* offline reading is a bonus; the site works without it */
      });
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}

/* ---------- Start ---------- */
function init() {
  syncPins();

  document.addEventListener("click", (e) => {
    const b = (e.target as Element | null)?.closest?.<HTMLButtonElement>("button[data-pin]");
    if (b) togglePin(b);
  });

  window.addEventListener(DESK_CHANGE, (e) => {
    syncPins();
    if ((e as CustomEvent<{ what?: string }>).detail?.what !== "recent") void keepPinnedOffline();
  });
  // Another tab changed the desk (or the privacy page cleared it).
  window.addEventListener("storage", (e) => {
    if (e.key === null || /^(pc[_-]|peoplecraft)/i.test(e.key)) changed("all");
  });
  // Back/forward cache: the page may be stale.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) syncPins();
  });

  // Checklists: remember when they were last ticked (the tool keeps the ticks; drafts carry their own time).
  const onEdit = (e: Event) => {
    const cl = (e.target as Element | null)?.closest?.<HTMLElement>("[data-checklist]")?.dataset.checklist;
    if (cl) noteEdit(`pc_cl_${cl}`);
  };
  document.addEventListener("input", onEdit, true);
  document.addEventListener("change", onEdit, true);

  const path = sitePath();
  const here = pageItem(path);
  if (here) {
    recordVisit(here);
    // A pinned page refreshes its card, in case its title or details changed.
    const pins = getPins();
    const i = pins.findIndex((p) => p.href === path);
    if (i >= 0) {
      const fresh = { ...pins[i], ...here, at: pins[i].at };
      if (JSON.stringify(fresh) !== JSON.stringify(pins[i])) {
        pins[i] = fresh;
        save(DESK_KEYS.pins, pins);
      }
    }
  }
  trackReading(path);
  registerOffline();
}

init();
