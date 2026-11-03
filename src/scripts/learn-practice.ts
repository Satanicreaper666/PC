/**
 * The practice bank (src/pages/learn/practice/index.astro): filters by module, type
 * and level, and a "mixed set of 10" drawn at random from whatever the filters allow.
 *
 * Every question is already on the page, grouped by module, so with JavaScript off
 * nothing is lost. Filters only hide questions; the mixed set moves ten of them into
 * one list in random order and puts them back afterwards. Nothing is stored or sent.
 */
const SET = 10;

/** Fisher–Yates: every order equally likely. */
export function shuffle<T>(list: T[], rand: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function init(tools: HTMLElement) {
  const items = Array.from(document.querySelectorAll<HTMLLIElement>("li[data-pb]"));
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-pb-section]"));
  const select = tools.querySelector<HTMLSelectElement>("[data-pb-module]");
  const typeBtns = Array.from(tools.querySelectorAll<HTMLButtonElement>("[data-f-type]"));
  const levelBtns = Array.from(tools.querySelectorAll<HTMLButtonElement>("[data-f-level]"));
  const mixBtn = tools.querySelector<HTMLButtonElement>("[data-pb-mix]");
  const status = tools.querySelector<HTMLElement>("[data-pb-status]");
  const mixed = document.querySelector<HTMLElement>("[data-pb-mixed]");
  const mixedList = document.querySelector<HTMLOListElement>("[data-pb-mixed-list]");
  const mixedTitle = document.querySelector<HTMLElement>("[data-pb-mixed-title]");
  const none = document.querySelector<HTMLElement>("[data-pb-none]");
  if (!select || !mixBtn || !status || !mixed || !mixedList || !mixedTitle || !items.length) return;

  // Where each question lives, so a mixed set can put it back in its place.
  const home = new Map(items.map((li) => [li, li.parentElement as HTMLElement]));
  const order = new Map(items.map((li, i) => [li, i]));
  const total = items.length;
  let type = "";
  let level = "";
  let inMix = false;

  const matches = (li: HTMLElement) =>
    (!select.value || li.dataset.pbModule === select.value) && (!type || li.dataset.pbType === type) && (!level || li.dataset.pbLevel === level);

  const putBack = () => {
    for (const li of [...items].sort((a, b) => order.get(a)! - order.get(b)!)) home.get(li)!.append(li);
    mixed.hidden = true;
    inMix = false;
  };

  const filtersLine = () => {
    const bits = [
      select.value ? `Module ${select.value}` : "",
      type ? typeBtns.find((b) => b.dataset.fType === type)?.textContent?.trim().toLowerCase() ?? "" : "",
      level ? `${level} level` : ""
    ].filter(Boolean);
    return bits.length ? ` (${bits.join(", ")})` : "";
  };

  const apply = () => {
    if (inMix) putBack();
    let shown = 0;
    for (const li of items) {
      const ok = matches(li);
      li.hidden = !ok;
      if (ok) shown++;
    }
    sections.forEach((s) => (s.hidden = !s.querySelector("li[data-pb]:not([hidden])")));
    typeBtns.forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.fType ?? "") === type)));
    levelBtns.forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.fLevel ?? "") === level)));
    status.textContent = shown === total ? `Showing all ${total} questions` : `Showing ${shown} of ${total} questions${filtersLine()}`;
    if (none) none.hidden = shown > 0;
    mixBtn.disabled = shown === 0;
  };

  const draw = () => {
    if (inMix) putBack();
    const pool = items.filter(matches);
    if (!pool.length) return;
    const pick = shuffle(pool).slice(0, SET);
    for (const li of items) li.hidden = !pick.includes(li);
    sections.forEach((s) => (s.hidden = true));
    mixedList.replaceChildren(...pick);
    pick.forEach((li) => (li.hidden = false));
    const fromModules = new Set(pick.map((li) => li.dataset.pbModule)).size;
    const short = pool.length < SET;
    mixedTitle.textContent = short
      ? `A mixed set: all ${pool.length} matching ${pool.length === 1 ? "question" : "questions"}, in random order`
      : `A mixed set of ${SET} questions from ${fromModules} ${fromModules === 1 ? "module" : "modules"}`;
    status.textContent = `${mixedTitle.textContent}${filtersLine()}. Answers aren't saved; draw another set at any time.`;
    mixed.hidden = false;
    if (none) none.hidden = true;
    inMix = true;
    mixedTitle.focus({ preventScroll: true });
    mixed.scrollIntoView({ block: "start", behavior: "auto" });
  };

  select.addEventListener("change", apply);
  typeBtns.forEach((b) =>
    b.addEventListener("click", () => {
      type = b.dataset.fType ?? "";
      apply();
    })
  );
  levelBtns.forEach((b) =>
    b.addEventListener("click", () => {
      level = b.dataset.fLevel ?? "";
      apply();
    })
  );
  mixBtn.addEventListener("click", draw);
  document.querySelector("[data-pb-again]")?.addEventListener("click", draw);
  document.querySelector("[data-pb-exit]")?.addEventListener("click", () => {
    apply();
    mixBtn.focus();
  });
  document.querySelector("[data-pb-clear]")?.addEventListener("click", () => {
    select.value = "";
    type = "";
    level = "";
    apply();
  });

  // A module can be preselected with ?module=4, so module pages can link straight to their questions.
  const want = new URLSearchParams(location.search).get("module");
  if (want && Array.from(select.options).some((o) => o.value === want)) select.value = want;
  tools.hidden = false;
  apply();
}

const tools = document.querySelector<HTMLElement>("[data-pb-tools]");
if (tools) init(tools);
