/**
 * "Check yourself" (src/components/learn/Quiz.astro): marks each answer as it is chosen.
 *
 * Choosing means a tap or click, Space or Enter, or a screen reader's activate. Arrow keys
 * only move through a radio group: browsers check each radio as you arrow past it, so
 * marking on every change would answer a question just by reading its options.
 *
 * Once marked, every option shows its feedback, the right (or best) one gets a blue pen
 * tick and a wrong pick a red pen cross, and the verdict is written into a live region.
 * The score counts answers right first time; changing an answer later re-marks it but
 * doesn't change the score. Nothing is stored: drafts and answers live in this tab only.
 */
const ARROWS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
const letter = (i: number) => String.fromCharCode(65 + i);
const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

type Question = { id: string; reset: () => void; firstRadio: HTMLInputElement | null };

function setup(root: HTMLElement) {
  if (root.hasAttribute("data-ready")) return;
  root.setAttribute("data-ready", "");
  const total = Number(root.dataset.total ?? 0);
  const score = root.querySelector<HTMLElement>("[data-quiz-score]");
  const end = root.querySelector<HTMLElement>("[data-quiz-end]");
  const endText = root.querySelector<HTMLElement>("[data-quiz-end-text]");
  const resetBtn = root.querySelector<HTMLButtonElement>("[data-quiz-reset]");
  /** Question id -> was the first answer right? */
  const first = new Map<string, boolean>();
  const questions: Question[] = [];

  function paintScore() {
    const answered = first.size;
    const right = [...first.values()].filter(Boolean).length;
    if (score) {
      score.hidden = answered === 0;
      score.replaceChildren();
      if (answered) {
        score.append("You got ", el("span", "qz-score-n", `${right} of ${answered}`), " right first time");
        const left = total - answered;
        if (left > 0) score.append(` · ${left} to go`);
      }
    }
    const done = total > 0 && answered === total;
    end?.classList.toggle("is-done", done);
    if (resetBtn) resetBtn.hidden = !done;
    if (endText) endText.textContent = done ? `Done: ${right} of ${total} right first time.` : "";
  }

  root.querySelectorAll<HTMLElement>(".qz-item[data-answer]").forEach((item) => {
    const answer = Number(item.dataset.answer);
    const judgement = item.dataset.q === "judgement";
    const radios = Array.from(item.querySelectorAll<HTMLInputElement>(".qz-radio"));
    const opts = Array.from(item.querySelectorAll<HTMLElement>(".qz-opt"));
    const verdict = item.querySelector<HTMLElement>("[data-verdict]");
    const why = item.querySelector<HTMLElement>("[data-why]");
    let arrowing = false;
    let shown = -1;

    const optionText = (i: number) => (opts[i]?.querySelector(".qz-otext")?.textContent ?? "").replace(/^\s*[A-Z]\.\s*/, "").trim();
    const feedback = (i: number) => opts[i]?.querySelector(".qz-fbtext")?.textContent?.trim() ?? "";

    function mark(chosen: number) {
      if (chosen === shown || Number.isNaN(chosen)) return;
      shown = chosen;
      const right = chosen === answer;
      if (!first.has(item.id)) first.set(item.id, right);
      item.classList.add("is-answered");
      opts.forEach((o, i) => {
        o.classList.toggle("is-wrong", i === chosen && !right);
        o.classList.toggle("is-chosen", i === chosen);
        const fb = o.querySelector<HTMLElement>(".qz-fb");
        if (fb) fb.hidden = false;
        const mine = o.querySelector<HTMLElement>(".qz-mine");
        if (mine) mine.hidden = i !== chosen;
        o.querySelectorAll(".pen").forEach((p) => p.classList.remove("drawn"));
      });
      // The pen marks draw in once they are on the page (global.css, html.js-anim [data-mark]).
      requestAnimationFrame(() =>
        requestAnimationFrame(() => item.querySelectorAll(".is-key .qz-tick, .is-wrong .qz-cross").forEach((p) => p.classList.add("drawn")))
      );
      if (why) why.hidden = false;
      if (verdict) {
        const said = right ? (judgement ? "Best response." : "Right.") : judgement ? "Weaker response." : "Not quite.";
        // The feedback for a right answer often starts "Correct." or "Best."; the verdict already says so.
        const own = feedback(chosen).replace(right ? /^(?:correct|best|right)\b[.:,]?\s*/i : /^$/, "");
        verdict.classList.toggle("is-wrong", !right);
        const stop = (t: string) => (/[.!?]$/.test(t) ? t : `${t}.`);
        verdict.replaceChildren(el("strong", "qz-v", said));
        if (own) verdict.append(` ${stop(own.charAt(0).toUpperCase() + own.slice(1))}`);
        if (!right) verdict.append(` The ${judgement ? "best response" : "correct answer"} is ${letter(answer)}: ${stop(optionText(answer))}`);
      }
      paintScore();
    }

    item.addEventListener("keydown", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) || !t.classList.contains("qz-radio")) return;
      if (ARROWS.has(e.key)) {
        // The browser checks the next radio straight after this event; that's moving, not answering.
        arrowing = true;
        window.setTimeout(() => (arrowing = false), 0);
        return;
      }
      if (e.key === "Enter" || (e.key === " " && t.checked)) {
        e.preventDefault();
        t.checked = true;
        mark(Number(t.value));
      }
      // Space on an unchecked radio: the browser checks it, and the change below marks it.
    });
    item.addEventListener("change", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) || !t.classList.contains("qz-radio") || arrowing) return;
      mark(Number(t.value));
    });

    questions.push({
      id: item.id,
      firstRadio: radios[0] ?? null,
      reset() {
        shown = -1;
        item.classList.remove("is-answered");
        radios.forEach((r) => (r.checked = false));
        opts.forEach((o) => {
          o.classList.remove("is-wrong", "is-chosen");
          const fb = o.querySelector<HTMLElement>(".qz-fb");
          if (fb) fb.hidden = true;
          const mine = o.querySelector<HTMLElement>(".qz-mine");
          if (mine) mine.hidden = true;
          o.querySelectorAll(".pen").forEach((p) => p.classList.remove("drawn"));
        });
        if (why) why.hidden = true;
        if (verdict) {
          verdict.classList.remove("is-wrong");
          verdict.replaceChildren();
        }
      }
    });
  });

  // Written questions: a live word count for the draft. The draft itself goes nowhere.
  root.querySelectorAll<HTMLTextAreaElement>("[data-draft]").forEach((ta) => {
    const wc = ta.parentElement?.querySelector<HTMLElement>("[data-wc]");
    const paint = () => {
      const n = countWords(ta.value);
      if (wc) wc.textContent = `${n} ${n === 1 ? "word" : "words"}`;
    };
    ta.addEventListener("input", paint);
    paint();
  });

  resetBtn?.addEventListener("click", () => {
    first.clear();
    questions.forEach((q) => q.reset());
    paintScore();
    const q1 = questions[0];
    if (q1?.firstRadio) {
      document.getElementById(q1.id)?.scrollIntoView({ block: "start", behavior: "smooth" });
      q1.firstRadio.focus({ preventScroll: true });
    }
  });

  paintScore();
}

/* Printed, the answer key and model answers are part of the page: open their folds for the printer. */
let reopened: HTMLDetailsElement[] = [];
window.addEventListener("beforeprint", () => {
  reopened = Array.from(document.querySelectorAll<HTMLDetailsElement>("[data-quiz] details:not([open])"));
  reopened.forEach((d) => (d.open = true));
});
window.addEventListener("afterprint", () => {
  reopened.forEach((d) => (d.open = false));
  reopened = [];
});

document.querySelectorAll<HTMLElement>("[data-quiz]").forEach(setup);

export {};
