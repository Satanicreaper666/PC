/**
 * Branching cases (src/components/learn/Scenario.astro): one page of the case at a time.
 *
 * Without this script every node is a section and every choice a link to the next one.
 * With it, only the current page shows; each choice becomes a button; "Your path" keeps
 * the thread of choices made; "Go back a step" and "Start again" rewind. Moving to a new
 * page puts focus on its words, so a screen reader reads what happened next. Nothing is
 * stored: reload the page and the case starts again.
 */
type Step = { from: string; to: string; label: string };

function setup(root: HTMLElement) {
  if (root.hasAttribute("data-ready")) return;
  const start = root.dataset.start ?? "";
  const nodes = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>("[data-node]").forEach((s) => nodes.set(s.dataset.node ?? "", s));
  if (!nodes.has(start)) return;
  root.setAttribute("data-ready", "");

  // Links become buttons: a choice changes the page in place, it doesn't go anywhere.
  root.querySelectorAll<HTMLAnchorElement>("a.sc-choice[data-to]").forEach((a) => {
    const b = document.createElement("button");
    // Keep every attribute but the link's (the class, data-to and the scoped-style marker).
    for (const at of Array.from(a.attributes)) if (at.name !== "href") b.setAttribute(at.name, at.value);
    b.type = "button";
    b.append(...Array.from(a.childNodes));
    a.replaceWith(b);
  });
  root.querySelectorAll<HTMLElement>("[data-sc-nojs]").forEach((e) => (e.hidden = true));

  const foot = root.querySelector<HTMLElement>("[data-sc-foot]");
  const trail = root.querySelector<HTMLOListElement>("[data-sc-trail]");
  const empty = root.querySelector<HTMLElement>("[data-sc-empty]");
  const back = root.querySelector<HTMLButtonElement>("[data-sc-back]");
  const restart = root.querySelector<HTMLButtonElement>("[data-sc-restart]");
  const found = root.querySelector<HTMLElement>("[data-sc-found]");
  const endings = Number(root.dataset.endings ?? 0);
  const reached = new Set<string>();
  const path: Step[] = [];
  let current = start;

  const isEnd = (id: string) => !!nodes.get(id)?.classList.contains("sc-end");

  function paintTrail() {
    if (!trail) return;
    const items = path.map((s, i) => {
      const li = document.createElement("li");
      const n = document.createElement("span");
      n.className = "sc-trail-n";
      n.textContent = `${i + 1}.`;
      li.append(n, s.label);
      return li;
    });
    if (isEnd(current)) {
      const li = document.createElement("li");
      li.className = "is-end";
      li.textContent = nodes.get(current)?.querySelector(".sc-out-t")?.textContent?.trim() ?? "The end";
      items.push(li);
    }
    trail.replaceChildren(...items);
    if (empty) empty.hidden = path.length > 0;
  }

  function show(id: string, focus: boolean) {
    current = id;
    nodes.forEach((s, k) => (s.hidden = k !== id));
    const node = nodes.get(id)!;
    const tab = node.querySelector<HTMLElement>("[data-sc-step]");
    if (tab) tab.textContent = isEnd(id) ? "How it ended" : `Decision ${path.length + 1}`;
    if (isEnd(id)) {
      reached.add(id);
      // The ending's pen mark draws in now that it is on the page.
      requestAnimationFrame(() => requestAnimationFrame(() => node.querySelectorAll(".sc-pen").forEach((p) => p.classList.add("drawn"))));
    }
    if (found && endings > 1 && reached.size) {
      found.hidden = false;
      found.textContent = `Endings found: ${reached.size} of ${endings}`;
    }
    paintTrail();
    if (back) back.disabled = path.length === 0;
    if (foot) foot.hidden = false;
    if (focus) {
      const read = node.querySelector<HTMLElement>("[data-sc-read]");
      read?.focus({ preventScroll: true });
      const top = node.getBoundingClientRect().top;
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) * 16 || 68;
      if (top < headerH || top > window.innerHeight * 0.6) node.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  root.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-to]");
    if (!b || !root.contains(b)) return;
    const to = b.dataset.to ?? "";
    if (!nodes.has(to)) return;
    path.push({ from: current, to, label: b.textContent?.trim() ?? "" });
    show(to, true);
  });
  back?.addEventListener("click", () => {
    const last = path.pop();
    if (!last) return;
    show(last.from, true);
  });
  restart?.addEventListener("click", () => {
    path.length = 0;
    show(start, true);
  });

  show(start, false);
}

document.querySelectorAll<HTMLElement>("[data-scenario]").forEach(setup);

export {};
