import { resultItem, searchLibrary, loadPagefind } from "./search";
import { siteHref } from "./href";

/* ---------- Header: hairline once the page scrolls ---------- */
const header = document.querySelector<HTMLElement>("[data-header]");
const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Phone menu (focus in, Escape out, focus restored) ---------- */
const menu = document.querySelector<HTMLElement>("[data-menu]");
const menuBtn = document.querySelector<HTMLButtonElement>("[data-menu-open]");
function openMenu() {
  if (!menu || !menuBtn) return;
  menu.hidden = false;
  menuBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  menu.querySelector<HTMLElement>("a, button")?.focus();
}
function closeMenu() {
  if (!menu || !menuBtn || menu.hidden) return;
  menu.hidden = true;
  menuBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  menuBtn.focus();
}
menuBtn?.addEventListener("click", openMenu);
document.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu);
menu?.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => closeMenu()));

/* ---------- Search dialog ---------- */
const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
const input = dialog?.querySelector<HTMLInputElement>("[data-search-input]");
const list = dialog?.querySelector<HTMLUListElement>("[data-search-results]");
const status = dialog?.querySelector<HTMLElement>("[data-search-status]");
const quick = dialog?.querySelector<HTMLElement>("[data-search-quick]");
let lastQuery = "";
let timer = 0;

function openSearch() {
  if (!dialog || dialog.open) return;
  closeMenu();
  dialog.showModal();
  input?.focus();
  input?.select();
  void loadPagefind();
}
function closeSearch() {
  dialog?.close();
}
document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", openSearch));
dialog?.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) closeSearch();
});

async function runSearch(q: string) {
  if (!list || !status || !quick) return;
  lastQuery = q;
  if (!q.trim()) {
    list.replaceChildren();
    status.textContent = "";
    quick.hidden = !quick.querySelector("a");
    return;
  }
  const results = await searchLibrary(q, 10);
  if (q !== lastQuery) return;
  quick.hidden = true;
  if (results === null) {
    status.textContent = "Search becomes available once the site is built. Browse the library from the menu meanwhile.";
    list.replaceChildren();
    return;
  }
  const shown = results.shownFor ? ` for “${results.shownFor}”` : "";
  status.textContent = results.length ? `${results.length} ${results.length === 1 ? "match" : "matches"}${shown}` : `Nothing matches “${q}”. Try a shorter word, like “leave” or “PF”.`;
  list.replaceChildren(...results.map(resultItem));
}

input?.addEventListener("input", () => {
  window.clearTimeout(timer);
  const q = input.value;
  timer = window.setTimeout(() => void runSearch(q), 120);
});

dialog?.addEventListener("keydown", (e) => {
  if (!list) return;
  const links = Array.from(dialog.querySelectorAll<HTMLAnchorElement>("[data-search-results] a, [data-search-quick]:not([hidden]) a"));
  const typed = input?.value.trim() ?? "";
  if (e.key === "Enter" && document.activeElement === input && !list.querySelector("a") && typed) {
    // No instant results yet: hand over to the full search page.
    e.preventDefault();
    location.href = siteHref(`/search/?q=${encodeURIComponent(typed)}`);
    return;
  }
  if (!links.length) return;
  const idx = links.findIndex((l) => l === document.activeElement);
  if (e.key === "ArrowDown") {
    e.preventDefault();
    links[Math.min(links.length - 1, idx + 1)]?.focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (idx <= 0) input?.focus();
    else links[idx - 1]?.focus();
  } else if (e.key === "Enter" && document.activeElement === input) {
    e.preventDefault();
    links[0]?.click();
  }
});

window.addEventListener("keydown", (e) => {
  const target = e.target as HTMLElement | null;
  const typing = !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    openSearch();
  } else if (e.key === "/" && !typing) {
    e.preventDefault();
    openSearch();
  }
});

/* ---------- Reveal on scroll (gated in <head>: content is visible without JS) ---------- */
const root = document.documentElement;
if (root.classList.contains("js-anim")) {
  document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll<HTMLElement>(":scope > [data-reveal]").forEach((el, i) => el.style.setProperty("--rd", `${Math.min(i, 8) * 0.09}s`));
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("shown");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("shown"));
}

/* ---------- Diagrams draw themselves in (Saicorp technique) ---------- */
const drawables = document.querySelectorAll<HTMLElement>("[data-draw]");
if (drawables.length) {
  if (!root.classList.contains("js-anim")) {
    drawables.forEach((d) => d.classList.add("drawn"));
  } else {
    const dio = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("draw");
          window.setTimeout(() => el.classList.add("drawn"), 2200);
          dio.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );
    drawables.forEach((d) => {
      // Only animate diagrams that start below the fold; others are simply drawn.
      if (d.getBoundingClientRect().top < window.innerHeight * 0.9) d.classList.add("drawn");
      else dio.observe(d);
    });
  }
}

/* ---------- Marks: highlighter swipes and pen strokes draw in once, when seen ---------- */
const marks = document.querySelectorAll<HTMLElement | SVGElement>("[data-mark]");
if (marks.length) {
  if (!root.classList.contains("js-anim")) {
    marks.forEach((m) => m.classList.add("drawn"));
  } else {
    const mio = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // A small, increasing delay when several marks arrive together, like a pen moving down the page.
          const delay = Number(el.dataset.markDelay ?? 0);
          window.setTimeout(() => el.classList.add("drawn"), delay);
          mio.unobserve(el);
        }
      },
      { threshold: 0.6, rootMargin: "0px 0px -8% 0px" }
    );
    marks.forEach((m) => mio.observe(m));
  }
}

/* ---------- Glossary terms in chapters: the one-line definition on hover or focus ---------- */
const termLinks = document.querySelectorAll<HTMLAnchorElement>("a.term-link[data-def]");
if (termLinks.length) {
  const tip = document.createElement("div");
  tip.className = "term-tip";
  tip.id = "term-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.append(tip);
  let hideTimer = 0;
  let current: HTMLAnchorElement | null = null;
  const place = (a: HTMLElement) => {
    const r = a.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 24);
    tip.style.width = `${w}px`;
    const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
    const below = r.bottom + 10 + tip.offsetHeight < window.innerHeight;
    tip.style.left = `${left + window.scrollX}px`;
    tip.style.top = `${(below ? r.bottom + 10 : r.top - tip.offsetHeight - 10) + window.scrollY}px`;
  };
  const show = (a: HTMLAnchorElement) => {
    window.clearTimeout(hideTimer);
    current?.removeAttribute("aria-describedby");
    current = a;
    const title = document.createElement("strong");
    title.textContent = a.textContent ?? "";
    const def = document.createElement("span");
    def.textContent = a.dataset.def ?? "";
    const more = document.createElement("span");
    more.className = "more";
    more.textContent = "Open the glossary for more";
    tip.replaceChildren(title, def, more);
    tip.hidden = false;
    place(a);
    a.setAttribute("aria-describedby", "term-tip");
  };
  const hide = () => {
    hideTimer = window.setTimeout(() => {
      tip.hidden = true;
      current?.removeAttribute("aria-describedby");
      current = null;
    }, 120);
  };
  termLinks.forEach((a) => {
    a.addEventListener("mouseenter", () => show(a));
    a.addEventListener("mouseleave", hide);
    a.addEventListener("focus", () => show(a));
    a.addEventListener("blur", hide);
  });
  tip.addEventListener("mouseenter", () => window.clearTimeout(hideTimer));
  tip.addEventListener("mouseleave", hide);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !tip.hidden) {
      tip.hidden = true;
      current?.removeAttribute("aria-describedby");
    }
  });
}

/* ---------- Copy buttons (data-copy="#selector" or data-copy-text) ---------- */
document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const sel = btn.dataset.copy ?? "";
    const text = sel.startsWith("#") || sel.startsWith(".") ? document.querySelector<HTMLElement>(sel)?.innerText ?? "" : sel;
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.dataset.label ?? btn.textContent ?? "";
      btn.dataset.label = old;
      btn.setAttribute("aria-live", "polite");
      const span = btn.querySelector("[data-copy-label]");
      if (span) span.textContent = "Copied";
      window.setTimeout(() => {
        if (span) span.textContent = btn.dataset.copyIdle ?? "Copy";
      }, 1800);
    } catch {
      /* clipboard blocked: leave the text selectable */
    }
  });
});

/* ---------- Print buttons ---------- */
document.querySelectorAll("[data-print-page]").forEach((b) => b.addEventListener("click", () => window.print()));
