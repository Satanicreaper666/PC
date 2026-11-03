/**
 * "Where to start" (src/components/learn/WhereToStart.astro): six questions, one per
 * block, each answered Not yet (0), With help (1) or Confidently (2).
 *
 * The recommendation is the first module of the block with the lowest answer; ties go to
 * the earlier block, because the course builds in order. Even answers mean Module 1.
 * If the module isn't written yet, the note says so and offers the first one that is.
 * The CourseMap on the same page moves its turmeric "Start here" knot to the pick.
 *
 * Nothing is stored or sent: no storage, no network, no form submission.
 */
type Mod = { n: number; title: string; href: string; ready: boolean };
type Block = { id: string; letter: string; title: string; modules: Mod[] };
type Data = { mapPrefix: string; blocks: Block[] };

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids);
  return node;
};
const name = (m: Mod) => `Module ${m.n}: ${m.title}`;

/** The pick, and the reason in one or two plain sentences. */
export function recommend(blocks: Block[], scores: number[]): { pick: Mod; block: Block; why: string } {
  const all = blocks.flatMap((b) => b.modules);
  const first = all.find((m) => m.n === 1) ?? all[0];
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  if (min === max) {
    return {
      pick: first,
      block: blocks[0],
      why:
        min === 2
          ? "You feel confident in every block. Start at Module 1 and move quickly: the practice questions in each module will show you where to slow down."
          : "Your answers are even across the course, so its own order works best: start at Module 1 and work through."
    };
  }
  const i = scores.indexOf(min);
  const block = blocks[i];
  const why =
    i === 0
      ? `${block.title} is where you feel least sure, and it's where the course begins.`
      : `${block.title} (block ${block.letter}) is where you feel least sure, so begin with its first module. The earlier blocks are there whenever a module assumes something you haven't met.`;
  return { pick: block.modules[0], block, why };
}

function init(root: HTMLElement) {
  const raw = root.querySelector("[data-ws-data]")?.textContent;
  const out = root.querySelector<HTMLElement>("[data-ws-out]");
  const progress = root.querySelector<HTMLElement>("[data-ws-progress]");
  const result = root.querySelector<HTMLElement>("[data-ws-result]");
  const reset = root.querySelector<HTMLButtonElement>("[data-ws-reset]");
  if (!raw || !out || !progress || !result || !reset) return;
  const data = JSON.parse(raw) as Data;
  const radios = Array.from(root.querySelectorAll<HTMLInputElement>("input[type=radio][data-ws-block]"));
  const waiting = Array.from(result.childNodes).map((n) => n.cloneNode(true));
  const all = data.blocks.flatMap((b) => b.modules);
  const firstReady = all.find((m) => m.ready);

  // The course map on this page, if there is one, and the knot it marks before any answer.
  const map = document.querySelector<HTMLElement>('[data-cmap="full"]');
  const defaultStart = map?.querySelector<HTMLElement>("[data-cm-mod][data-start]")?.dataset.cmMod ?? null;

  const markOnMap = (n: string | null, animate: boolean) => {
    if (!map) return;
    map.querySelectorAll<HTMLElement>("[data-cm-mod]").forEach((li) => {
      const on = n !== null && li.dataset.cmMod === n;
      const was = li.hasAttribute("data-start");
      li.toggleAttribute("data-start", on);
      const here = li.querySelector<HTMLElement>(".cm-here");
      if (here) here.hidden = !on;
      li.classList.remove("just-picked");
      if (on && animate && !was) {
        void li.offsetWidth; // restart the one-off "pick" motion
        li.classList.add("just-picked");
      }
    });
  };

  const render = () => {
    const answers = new Map<string, number>();
    for (const r of radios) if (r.checked) answers.set(r.dataset.wsBlock ?? "", Number(r.value));
    const total = data.blocks.length;
    progress.textContent = `${answers.size} of ${total} answered`;
    reset.hidden = answers.size === 0;
    if (answers.size < total) {
      if (result.querySelector(".ws-wait") === null) {
        result.replaceChildren(...waiting.map((n) => n.cloneNode(true)));
        markOnMap(defaultStart, false);
      }
      return;
    }

    const { pick, block, why } = recommend(
      data.blocks,
      data.blocks.map((b) => answers.get(b.id) ?? 0)
    );
    const parts: Node[] = [
      el("p", { className: "ws-k hand" }, "Start with"),
      el("p", { className: "ws-pick" }, pick.ready ? el("a", { href: pick.href }, name(pick)) : name(pick)),
      el("p", { className: "ws-why" }, why)
    ];
    if (!pick.ready) {
      const alt = block.modules.find((m) => m.ready) ?? firstReady;
      parts.push(
        alt
          ? el("p", { className: "ws-alt" }, `Module ${pick.n} is still being written. Until it's ready, begin with `, el("a", { href: alt.href }, name(alt)), ", the first module in reach.")
          : el("p", { className: "ws-alt" }, `Module ${pick.n} is still being written, like the rest of the course. The first modules will appear on the map as they're published.`)
      );
    }
    if (map) parts.push(el("a", { className: "ws-map", href: `#${data.mapPrefix}m-${pick.n}` }, "See it on the course map"));
    result.replaceChildren(...parts);
    markOnMap(String(pick.n), true);
  };

  radios.forEach((r) => r.addEventListener("change", render));
  reset.addEventListener("click", () => {
    radios.forEach((r) => (r.checked = false));
    render();
    radios[0]?.focus();
  });
  out.hidden = false;
  // Browsers can restore ticked answers on back/forward; show what they add up to.
  render();
}

document.querySelectorAll<HTMLElement>("[data-ws]").forEach(init);
