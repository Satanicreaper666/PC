/**
 * Lays out My desk (src/pages/desk.astro) from this browser's storage:
 *   Pinned           pc-desk-pins, as library cards (ItemCard) pinned to a cloth board
 *   In progress      template drafts (pc_tpl_<id>) and checklist ticks (pc_cl_<id>), as sticky notes
 *   Reading progress pc-desk-read, as a thread of knots per handbook
 *   Recently viewed  pc-desk-recent
 * Every section has an empty state and a "Clear" with a second step. Nothing is sent anywhere.
 */
import {
  DESK_CHANGE,
  clearPins,
  clearRead,
  clearRecent,
  getEdits,
  getPins,
  getRead,
  getRecent,
  pin,
  readRaw,
  removeKeys,
  siteHref,
  storageWorks,
  storedKeys,
  toast,
  unpin,
  type DeskItem
} from "../../scripts/desk";
import { draftTitle, parseStore, writeDrafts } from "../../scripts/drafts";
import { CHECKLIST_PLAN_PREFIX, CHECKLIST_PREFIX, DESK_KEYS, DRAFTS_PREFIX, LEGACY_DRAFT_PREFIX, SURVEY_PREFIX, hash, type DraftMeta, type ToolMeta } from "./shared";

/* ---------- Dates, said the way people say them ---------- */
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const dayYearFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const weekdayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "long" });
const DAY = 86_400_000;
export function when(t: number, now = Date.now()): string {
  if (!t) return "";
  const diff = now - t;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  const n = new Date(now);
  const today = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  const d = new Date(t);
  if (t >= today) return `today, ${timeFmt.format(d)}`;
  if (t >= today - DAY) return "yesterday";
  if (t >= today - 6 * DAY) return weekdayFmt.format(d);
  return d.getFullYear() === n.getFullYear() ? dayFmt.format(d) : dayYearFmt.format(d);
}
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** A slight, steady tilt, so cards and notes look placed by hand. */
const TILTS = [-0.7, 0.5, -0.3, 0.8, -0.5, 0.3, -0.9, 0.6];

/* ---------- In progress: what the saved drafts and checklists say ---------- */
type Work = {
  /** The storage key it came from, and for a draft its template and draft id. */
  key: string;
  tpl?: string;
  draftId?: string;
  title: string;
  /** "Ravi Kumar", "Draft 2": which draft, when a template has more than one or the draft has a name. */
  label?: string;
  href: string;
  kind: string;
  done: number;
  /** Required details, or checklist steps. A survey has no end: 0. */
  total: number;
  type: "draft" | "checklist" | "survey";
  edited: number;
};
type SavedDraft = { id?: string; label?: string; updated: number; values: Record<string, string> };

/** The legacy single draft: { fieldId: value }. */
function flatValues(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: Record<string, string> = {};
  for (const [k, x] of Object.entries(raw as Record<string, unknown>)) if (typeof x === "string") out[k] = x;
  return out;
}

/** Every saved draft of a template, newest first, from the named-drafts store or the older single draft. */
function savedDrafts(tpl: string, meta: DraftMeta, keys: Set<string>, edits: Record<string, number>): SavedDraft[] {
  const store = keys.has(DRAFTS_PREFIX + tpl) ? parseStore(readRaw(DRAFTS_PREFIX + tpl)) : null;
  if (store) {
    const many = store.drafts.length > 1;
    return store.drafts
      .map((d) => {
        const named = draftTitle(d, meta.nameField);
        return { id: d.id, label: many || named !== `Draft ${d.n}` ? named : undefined, updated: d.updated, values: d.values };
      })
      .sort((a, b) => b.updated - a.updated);
  }
  const legacy = keys.has(LEGACY_DRAFT_PREFIX + tpl) ? flatValues(readRaw(LEGACY_DRAFT_PREFIX + tpl)) : null;
  return legacy ? [{ updated: edits[LEGACY_DRAFT_PREFIX + tpl] ?? 0, values: legacy }] : [];
}

function collectWork(drafts: Map<string, DraftMeta>, lists: Map<string, ToolMeta>, surveys: Map<string, ToolMeta>): Work[] {
  const edits = getEdits();
  const keys = new Set(storedKeys());
  const out: Work[] = [];
  const seen = new Set<string>();
  for (const key of keys) {
    const tpl = key.startsWith(DRAFTS_PREFIX) ? key.slice(DRAFTS_PREFIX.length) : key.startsWith(LEGACY_DRAFT_PREFIX) ? key.slice(LEGACY_DRAFT_PREFIX.length) : null;
    if (tpl !== null) {
      const meta = drafts.get(tpl);
      if (!meta || seen.has(tpl)) continue;
      seen.add(tpl);
      for (const d of savedDrafts(tpl, meta, keys, edits)) {
        const v = (id: string) => (d.values[id] ?? "").trim();
        // Something the reader typed: a value that isn't the field's pre-filled one.
        const own = Object.keys(d.values).some((id) => v(id) && meta.def[id] !== hash(v(id)));
        if (!own) continue;
        const ids = meta.req.length ? meta.req : Object.keys(d.values);
        out.push({
          key: d.id ? DRAFTS_PREFIX + tpl : LEGACY_DRAFT_PREFIX + tpl,
          tpl,
          draftId: d.id,
          title: meta.title,
          label: d.label,
          href: meta.href,
          kind: meta.kind,
          done: ids.filter((id) => v(id)).length,
          total: meta.req.length || meta.n,
          type: "draft",
          edited: d.updated
        });
      }
    } else if (key.startsWith(CHECKLIST_PREFIX)) {
      const meta = lists.get(key.slice(CHECKLIST_PREFIX.length));
      const ticks = meta ? readRaw(key) : null;
      if (!meta || !Array.isArray(ticks)) continue;
      const done = ticks.filter((t) => t === true).length;
      if (!done) continue;
      out.push({ key, title: meta.title, href: meta.href, kind: "Checklist", done, total: ticks.length, type: "checklist", edited: edits[key] ?? 0 });
    } else if (key.startsWith(SURVEY_PREFIX)) {
      const meta = surveys.get(key.slice(SURVEY_PREFIX.length));
      const raw = meta ? (readRaw(key) as { responses?: unknown } | null) : null;
      const n = Array.isArray(raw?.responses) ? raw!.responses.filter((r) => r && typeof r === "object").length : 0;
      if (!meta || !n) continue;
      out.push({ key, title: meta.title, href: meta.href, kind: "Team survey", done: n, total: 0, type: "survey", edited: 0 });
    }
  }
  const complete = (w: Work) => (w.total && w.done >= w.total ? 1 : 0);
  return out.sort((a, b) => complete(a) - complete(b) || b.edited - a.edited || a.title.localeCompare(b.title));
}

/** Open a particular draft: the template page opens the store's active draft. */
function makeActive(tpl: string, id: string) {
  const store = parseStore(readRaw(DRAFTS_PREFIX + tpl));
  if (!store || store.active === id || !store.drafts.some((d) => d.id === id)) return;
  store.active = id;
  writeDrafts(tpl, store);
}

function mood(w: Work): string {
  if (w.type === "survey") return "Collecting answers";
  const r = w.total ? w.done / w.total : 0;
  if (r >= 1) return w.type === "draft" ? "Ready to download" : "All done";
  if (r >= 0.66) return "Nearly there";
  if (r >= 0.33) return "Halfway there";
  return "Just started";
}

/* ---------- The page ---------- */
function init(root: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(sel: string) => root.ownerDocument.querySelector<T>(sel);
  const clone = <T extends HTMLElement>(sel: string): T => {
    const tpl = $<HTMLTemplateElement>(sel);
    return tpl!.content.firstElementChild!.cloneNode(true) as T;
  };
  const cardArts = new Set(Array.from(document.querySelectorAll<HTMLTemplateElement>("template[data-card-tpl]")).map((t) => t.dataset.cardTpl!));

  let catalog: { drafts: DraftMeta[]; checklists: ToolMeta[]; surveys?: ToolMeta[] } = { drafts: [], checklists: [] };
  try {
    catalog = JSON.parse($("#desk-catalog")?.textContent ?? "") as typeof catalog;
  } catch {
    /* no catalogue: In progress stays empty */
  }
  const draftMeta = new Map(catalog.drafts.map((d) => [d.tpl, d]));
  const listMeta = new Map(catalog.checklists.map((c) => [c.id, c]));
  const surveyMeta = new Map((catalog.surveys ?? []).map((c) => [c.id, c]));

  if (!storageWorks()) $("[data-no-storage]")!.hidden = false;

  // Changes made here re-render once, not twice: the desk's own change events are ignored while they fire.
  let quiet = false;
  const mutate = (fn: () => void) => {
    quiet = true;
    try {
      fn();
    } finally {
      quiet = false;
    }
  };

  const setCount = (what: string, n: number) => {
    const c = $(`[data-count="${what}"]`);
    if (c) c.textContent = n ? String(n) : "";
    const g = $(`[data-glance="${what}"]`);
    if (g) g.textContent = String(n);
  };
  /** Show the section's empty state, or its "Clear" when there is something to clear. */
  const setEmpty = (what: string, empty: boolean, clearable = !empty) => {
    const e = $(`[data-empty="${what}"]`);
    if (e) e.hidden = !empty;
    const clear = $(`[data-clear="${what}"]`);
    if (clear) {
      clear.hidden = !clearable;
      if (!clearable) resetClear(clear);
    }
  };

  /* ----- Pinned ----- */
  let undo: { item: DeskItem; index: number } | null = null;

  const fallbackArt = (href: string) => {
    const m = href.match(/^\/handbooks\/([a-z0-9-]+)\//);
    if (m && cardArts.has(m[1])) return m[1];
    if (href.startsWith("/jd-library/")) return "jd";
    if (href.startsWith("/glossary/")) return "glossary";
    return "letter";
  };
  const fill = (el: Element, sel: string, value: string | undefined) => {
    const t = el.querySelector(sel);
    if (!t) return;
    if (value) t.textContent = value;
    else t.remove();
  };
  function card(p: DeskItem): HTMLAnchorElement {
    const art = cardArts.has(p.art) ? p.art : fallbackArt(p.href);
    const a = clone<HTMLAnchorElement>(`template[data-card-tpl="${art}"]`);
    a.href = siteHref(p.href);
    fill(a, ".k", p.kind || undefined);
    fill(a, ".code", p.code);
    fill(a, ".t", p.title);
    fill(a, ".d", p.description);
    fill(a, ".m", p.meta);
    return a;
  }
  function pinNode(p: DeskItem, i: number): HTMLElement {
    const li = clone<HTMLLIElement>("template[data-pin-tpl]");
    li.style.setProperty("--tilt", `${TILTS[i % TILTS.length]}deg`);
    li.dataset.href = p.href;
    li.prepend(card(p));
    const btn = li.querySelector<HTMLButtonElement>(".unpin")!;
    btn.setAttribute("aria-label", `Unpin ${p.title}`);
    btn.addEventListener("click", () => {
      const index = getPins().findIndex((x) => x.href === p.href);
      mutate(() => unpin(p.href));
      undo = { item: p, index: Math.max(0, index) };
      renderPins();
      renderGlance();
      $<HTMLButtonElement>("[data-list='pins'] [data-undo]")?.focus();
    });
    return li;
  }
  function undoNode(item: DeskItem): HTMLElement {
    const li = clone<HTMLLIElement>("template[data-undo-tpl]");
    li.querySelector("[data-undo-text]")!.textContent = `Unpinned “${item.title}”.`;
    const b = li.querySelector<HTMLButtonElement>("[data-undo]")!;
    b.setAttribute("aria-label", `Undo: pin ${item.title} again`);
    b.addEventListener("click", () => {
      if (!undo) return;
      const { index } = undo;
      mutate(() => pin(item, index));
      undo = null;
      renderPins();
      renderGlance();
      toast(`${item.title} is pinned again`);
      $<HTMLAnchorElement>(`[data-list='pins'] li[data-href="${CSS.escape(item.href)}"] a`)?.focus();
    });
    return li;
  }
  function renderPins() {
    const pins = getPins();
    if (undo && pins.some((p) => p.href === undo!.item.href)) undo = null;
    const nodes = pins.map(pinNode);
    if (undo) nodes.splice(Math.min(undo.index, nodes.length), 0, undoNode(undo.item));
    $("[data-list='pins']")!.replaceChildren(...nodes);
    setEmpty("pins", !pins.length && !undo, pins.length > 0);
    setCount("pins", pins.length);
  }

  /* ----- In progress ----- */
  let work: Work[] = [];
  function noteNode(w: Work, i: number): HTMLElement {
    const li = clone<HTMLLIElement>("template[data-note-tpl]");
    const complete = w.total > 0 && w.done >= w.total;
    li.style.setProperty("--tilt", `${TILTS[(i + 3) % TILTS.length]}deg`);
    li.classList.toggle("done", complete);
    li.querySelector(".mood")!.textContent = mood(w);
    const a = li.querySelector<HTMLAnchorElement>(".note-t a")!;
    a.href = siteHref(w.href);
    a.textContent = w.title;
    if (w.tpl && w.draftId) {
      const open = () => makeActive(w.tpl!, w.draftId!);
      a.addEventListener("click", open);
      a.addEventListener("auxclick", open);
    }
    const which = li.querySelector<HTMLElement>(".note-who")!;
    if (w.label) which.textContent = w.label;
    else which.remove();
    const changed = w.edited ? ` · ${w.type === "draft" ? "edited" : "updated"} ${when(w.edited)}` : "";
    li.querySelector(".note-k")!.textContent = `${w.type === "draft" ? `${w.kind} draft` : w.kind}${changed}`;
    const bar = li.querySelector<HTMLElement>(".note-bar")!;
    if (w.total) bar.style.setProperty("--p", `${Math.round((w.done / w.total) * 100)}%`);
    else bar.remove();
    const unit = w.type === "draft" ? "required details filled" : "steps ticked";
    li.querySelector(".note-c span")!.textContent =
      w.type === "survey" ? `${plural(w.done, "response", "responses")} so far` : complete ? `All ${w.total} ${unit}` : `${w.done} of ${w.total} ${unit}`;
    // Marks drawn by site.ts on load don't know about this note: show its tick as drawn.
    li.querySelector(".note-tick")?.classList.add("drawn");
    return li;
  }
  function renderProgress() {
    work = collectWork(draftMeta, listMeta, surveyMeta);
    $("[data-list='progress']")!.replaceChildren(...work.map(noteNode));
    setEmpty("progress", !work.length);
    setCount("progress", work.length);
  }

  /* ----- Reading progress ----- */
  let readTotal = 0;
  function renderReading() {
    const read = getRead();
    const shelf = $("[data-shelf]");
    if (!shelf) return;
    const books = Array.from(shelf.querySelectorAll<HTMLElement>(":scope > [data-book]"));
    readTotal = 0;
    const order = books.map((b, i) => {
      const lis = Array.from(b.querySelectorAll<HTMLElement>("[data-ch]"));
      const isRead = lis.map((li) => !!read[li.dataset.ch ?? ""]);
      const n = isRead.filter(Boolean).length;
      const total = lis.length;
      readTotal += n;
      const next = isRead.findIndex((r) => !r);
      lis.forEach((li, j) => {
        li.classList.toggle("read", isRead[j]);
        li.classList.toggle("next", n > 0 && j === next);
        const a = li.querySelector("a");
        if (a) {
          const label = (a.dataset.label ??= a.getAttribute("aria-label") ?? "");
          a.setAttribute("aria-label", isRead[j] ? `${label} (read)` : n > 0 && j === next ? `${label} (next to read)` : label);
        }
      });
      const last = lis.length - 1;
      const at = (k: number) => `${last ? (k / last) * 100 : 0}%`;
      const stops = isRead.slice(0, -1).map((r, k) => `${r && isRead[k + 1] ? "var(--neel-500)" : "var(--neel-200)"} ${at(k)} ${at(k + 1)}`);
      b.querySelector<HTMLElement>(".sb-thread")?.style.setProperty("--thread", stops.length ? `linear-gradient(90deg, ${stops.join(", ")})` : "");
      b.classList.toggle("started", n > 0);
      b.querySelector("[data-book-count]")!.textContent = !n ? `${total} chapters, none read yet` : n === total ? `All ${total} chapters read` : `${n} of ${total} chapters read`;
      const nextP = b.querySelector<HTMLElement>("[data-book-next]")!;
      const doneP = b.querySelector<HTMLElement>("[data-book-done]")!;
      nextP.hidden = n === total;
      doneP.hidden = n !== total;
      if (n === total) doneP.querySelector(".sb-tick")?.classList.add("drawn");
      if (next >= 0) {
        const li = lis[next];
        nextP.querySelector(".sb-k")!.textContent = n ? "Next" : "Start with";
        const a = nextP.querySelector<HTMLAnchorElement>("a")!;
        a.href = siteHref(li.dataset.ch!);
        a.textContent = `Chapter ${li.dataset.n}: ${li.dataset.title}`;
      }
      const lastRead = Math.max(0, ...lis.map((li) => read[li.dataset.ch ?? ""] ?? 0));
      return { b, key: n ? [0, -lastRead] : [1, i] };
    });
    // Books in progress first, the most recently read on top; then the rest in the usual order.
    order.sort((x, y) => x.key[0] - y.key[0] || x.key[1] - y.key[1]).forEach(({ b }) => shelf.appendChild(b));
    setEmpty("read", !readTotal);
    setCount("read", readTotal);
    // The hero's little thread: its knots fill in proportion to all the chapters there are.
    const knots = Array.from(document.querySelectorAll<HTMLElement>("[data-glance-knots] i"));
    const all = shelf.querySelectorAll("[data-ch]").length;
    const on = readTotal ? Math.max(1, Math.round((readTotal / Math.max(1, all)) * knots.length)) : 0;
    knots.forEach((k, i) => k.classList.toggle("on", i < on));
    knots[0]?.parentElement?.style.setProperty("--knots", on > 1 ? `${((on - 1) / (knots.length - 1)) * 100}%` : "0%");
  }

  /* ----- Recently viewed ----- */
  function icon(art: string): Element {
    const fromCard = document.querySelector(`template[data-card-tpl="${CSS.escape(art)}"]`) as HTMLTemplateElement | null;
    const svg = fromCard?.content.querySelector(".tile svg") ?? ($<HTMLTemplateElement>(`template[data-icon-tpl="${CSS.escape(art)}"]`) ?? $<HTMLTemplateElement>('template[data-icon-tpl="page"]'))?.content.firstElementChild;
    return (svg?.cloneNode(true) as Element) ?? document.createElement("span");
  }
  function renderRecent() {
    const recent = getRecent();
    const now = Date.now();
    $("[data-list='recent']")!.replaceChildren(
      ...recent.map((p) => {
        const li = clone<HTMLLIElement>("template[data-recent-tpl]");
        li.querySelector(".rv-ic")!.append(icon(p.art || fallbackArt(p.href)));
        const a = li.querySelector<HTMLAnchorElement>(".rv-t")!;
        a.href = siteHref(p.href);
        a.textContent = p.title;
        li.querySelector(".rv-k")!.textContent = p.kind;
        const t = li.querySelector<HTMLTimeElement>("time")!;
        if (p.at) {
          t.dateTime = new Date(p.at).toISOString();
          t.textContent = when(p.at, now);
        } else t.remove();
        return li;
      })
    );
    setEmpty("recent", !recent.length);
    setCount("recent", recent.length);
  }

  function renderGlance() {
    setCount("pins", getPins().length);
    setCount("progress", work.length);
    setCount("read", readTotal);
    setCount("recent", getRecent().length);
  }

  function renderAll() {
    renderPins();
    renderProgress();
    renderReading();
    renderRecent();
    renderGlance();
  }

  /* ----- Clearing, with a second step ----- */
  function resetClear(wrap: Element) {
    wrap.querySelector<HTMLElement>("[data-clear-confirm]")!.hidden = true;
    wrap.querySelector<HTMLElement>("[data-clear-ask]")!.hidden = false;
  }
  function setupClear(what: string, heading: string, question: () => string, run: () => string) {
    const wrap = $(`[data-clear="${what}"]`);
    if (!wrap) return;
    const ask = wrap.querySelector<HTMLButtonElement>("[data-clear-ask]")!;
    const box = wrap.querySelector<HTMLElement>("[data-clear-confirm]")!;
    const yes = wrap.querySelector<HTMLButtonElement>("[data-clear-yes]")!;
    const no = wrap.querySelector<HTMLButtonElement>("[data-clear-no]")!;
    ask.addEventListener("click", () => {
      wrap.querySelector("[data-clear-q]")!.textContent = question();
      ask.hidden = true;
      box.hidden = false;
      no.focus();
    });
    const cancel = () => {
      resetClear(wrap);
      ask.focus();
    };
    no.addEventListener("click", cancel);
    box.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cancel();
    });
    yes.addEventListener("click", () => {
      let message = "";
      mutate(() => (message = run()));
      resetClear(wrap);
      renderAll();
      $<HTMLElement>(`#${heading}`)?.focus();
      toast(message);
    });
  }
  setupClear(
    "pins",
    "pinned-h",
    () => `Remove all ${plural(getPins().length, "pin", "pins")} from your desk? The pages themselves stay in the library.`,
    () => {
      clearPins();
      undo = null;
      return "Pins removed from your desk";
    }
  );
  setupClear(
    "progress",
    "progress-h",
    () => {
      const count = (t: Work["type"]) => work.filter((w) => w.type === t).length;
      const [d, c, sv] = [count("draft"), count("checklist"), count("survey")];
      const parts = [
        d ? plural(d, "draft", "drafts") : "",
        c ? `the ticks on ${plural(c, "checklist", "checklists")}` : "",
        sv ? `the answers collected in ${plural(sv, "survey", "surveys")}` : ""
      ].filter(Boolean);
      const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
      return `Delete ${list} from this browser? This can't be undone.`;
    },
    () => {
      const kinds = [DRAFTS_PREFIX, LEGACY_DRAFT_PREFIX, CHECKLIST_PREFIX, CHECKLIST_PLAN_PREFIX, SURVEY_PREFIX];
      removeKeys([...storedKeys().filter((k) => kinds.some((p) => k.startsWith(p))), DESK_KEYS.edits]);
      return "Drafts, ticks and survey answers deleted";
    }
  );
  setupClear(
    "read",
    "reading-h",
    () => `Forget the ${plural(readTotal, "chapter", "chapters")} you've read? Your knots start empty again.`,
    () => {
      clearRead();
      return "Reading progress reset";
    }
  );
  setupClear(
    "recent",
    "recent-h",
    () => "Clear the list of pages you've opened?",
    () => {
      clearRecent();
      return "Recently viewed list cleared";
    }
  );

  renderAll();

  // Another tab pinned, read or typed something; or this page came back from the back/forward cache.
  let pending = 0;
  window.addEventListener(DESK_CHANGE, () => {
    if (quiet) return;
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(renderAll);
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) renderAll();
  });
}

const deskRoot = document.querySelector<HTMLElement>("[data-desk]");
if (deskRoot) init(deskRoot);
