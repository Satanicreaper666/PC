/**
 * The gate for the live hero. Tiny and dependency-free: it decides whether the
 * WebGL diorama may replace the poster, and only then imports three.js.
 *
 * Live only when all hold: the hero is in view, WebGL 2 is available without a
 * major performance caveat, prefers-reduced-motion is no-preference, the
 * viewport is at least 600px wide, and Save-Data is not on. Otherwise, or if
 * anything fails, the poster simply stays.
 */

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const WIDE = "(min-width: 600px)";

type Connection = { saveData?: boolean };

function saveData(): boolean {
  return (navigator as Navigator & { connection?: Connection }).connection?.saveData === true;
}

/** After the page has loaded and the browser is idle, so the poster and fonts come first. */
function whenSettled(cb: () => void) {
  const idle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 1500 });
    else setTimeout(cb, 200);
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

function webgl(): { canvas: HTMLCanvasElement; context: WebGL2RenderingContext } | null {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: true
    });
    return context ? { canvas, context } : null;
  } catch {
    return null;
  }
}

function setup(fig: HTMLElement) {
  if (fig.dataset.paperHeroInit) return;
  fig.dataset.paperHeroInit = "1";
  if (saveData() || !("IntersectionObserver" in window) || !("ResizeObserver" in window)) return;
  // Read each media query once, then follow its change events (see index.ts).
  const motion = window.matchMedia(MOTION_OK);
  const wide = window.matchMedia(WIDE);
  let motionOk = motion.matches;
  let wideOk = wide.matches;
  let inView = false;
  let started = false;
  const onMotion = (e: MediaQueryListEvent) => {
    motionOk = e.matches;
    tryStart();
  };
  const onWide = (e: MediaQueryListEvent) => {
    wideOk = e.matches;
    tryStart();
  };

  const stop = () => {
    io.disconnect();
    motion.removeEventListener("change", onMotion);
    wide.removeEventListener("change", onWide);
  };

  function tryStart() {
    if (started || !inView || !motionOk || !wideOk) return;
    started = true;
    stop();
    const gl = webgl();
    if (!gl) return;
    import("./index")
      .then(({ mount }) => mount(fig, gl))
      .catch(() => {
        // The poster stays. Drop the half-made context.
        gl.context.getExtension("WEBGL_lose_context")?.loseContext();
        gl.canvas.remove();
        fig.classList.remove("is-live", "is-in");
      });
  }

  const io = new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    tryStart();
  });
  whenSettled(() => io.observe(fig));
  motion.addEventListener("change", onMotion);
  wide.addEventListener("change", onWide);
}

export function initPaperHero(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-paper-hero]").forEach(setup);
}
