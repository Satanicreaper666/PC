/**
 * Live paper diorama for the home hero. Loaded lazily by ./gate.ts, never on
 * phones, with reduced motion or Save-Data. Renders only while something
 * changes: the one-time settle, or the pointer easing the scene round.
 */
import { NoToneMapping, PCFShadowMap, SRGBColorSpace, WebGLRenderer } from "three";
import { buildDiorama } from "./scene";

export interface MountOptions {
  /** Canvas and context created by the gate's WebGL check, reused here. */
  canvas?: HTMLCanvasElement;
  context?: WebGL2RenderingContext;
  /** Render one settled frame at 2x for the poster script and keep the drawing buffer. */
  poster?: boolean;
  /** With `poster`: render the settle at this many seconds instead (for checking the motion). */
  at?: number;
}

export interface PaperHeroHandle {
  canvas: HTMLCanvasElement;
  /** Resolves once the first frame has been drawn. */
  ready: Promise<void>;
  dispose(): void;
}

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const WIDE = "(min-width: 600px)";
/** Seconds each paper layer takes to lift and settle; layers start a little apart. */
const SETTLE = 0.7;
/** The canvas fades in over the poster first (CSS), then the layers settle. */
const FADE_MS = 450;
const TURN_Y = (4 * Math.PI) / 180;
const TURN_X = (2 * Math.PI) / 180;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** 0 → 1 → 0: a quick lift, then a long soft landing. */
const lift = (t: number) => {
  if (t <= 0 || t >= 1) return 0;
  if (t < 0.28) {
    const k = t / 0.28;
    return 1 - (1 - k) * (1 - k);
  }
  const k = (t - 0.28) / 0.72;
  return 1 - k * k * (3 - 2 * k);
};

export function mount(host: HTMLElement, opts: MountOptions = {}): PaperHeroHandle {
  const poster = !!opts.poster;
  const canvas = opts.canvas ?? document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.classList.add("paper-hero-canvas");

  const renderer = new WebGLRenderer({
    canvas,
    context: opts.context,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: poster,
    powerPreference: "low-power"
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setPixelRatio(poster ? 2 : Math.min(window.devicePixelRatio || 1, 2));

  const { scene, camera, turntable, animated, fit, dispose: disposeScene } = buildDiorama({ shadowSize: poster ? 4096 : 2048, turn: { x: TURN_X, y: TURN_Y } });
  const total = animated.reduce((m, a) => Math.max(m, a.delay), 0) + SETTLE;

  // The first frame matches the poster exactly; then each layer lifts a little and settles.
  const applySettle = (t: number) => {
    for (const a of animated) {
      const u = lift(clamp((t - a.delay) / SETTLE, 0, 1));
      a.obj.position.y = a.restY + 0.9 * u;
      a.obj.position.z = a.restZ + 0.35 * u;
      a.obj.rotation.x = a.restRotX - 0.12 * u;
      if (a.swing !== undefined) a.obj.rotation.y = a.swing - 0.32 * u;
    }
  };

  const size = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    if (!poster) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    // The component keeps a 560:460 box; if a page changes that, re-frame rather than stretch.
    if (Math.abs(w / h - camera.aspect) > 0.01) fit(w / h);
  };
  size();
  host.appendChild(canvas);

  let resolveReady: () => void = () => {};
  const ready = new Promise<void>((r) => (resolveReady = r));

  if (poster) {
    applySettle(opts.at ?? total + 1);
    renderer.render(scene, camera);
    resolveReady();
    return {
      canvas,
      ready,
      dispose() {
        disposeScene();
        renderer.dispose();
        canvas.remove();
      }
    };
  }

  // Track the media queries through their change events only: reading .matches
  // in the render loop can swallow the next change event in Chromium.
  const motion = window.matchMedia(MOTION_OK);
  const wide = window.matchMedia(WIDE);
  let motionOk = motion.matches;
  let wideOk = wide.matches;
  let clock = 0;
  let settling = false;
  let inView = true;
  let broken = false;
  let shown = false;
  let raf = 0;
  let last = 0;
  const target = { x: 0, y: 0 };
  const turn = { x: 0, y: 0 };
  const eligible = () => motionOk && wideOk && !broken;
  const canRun = () => inView && !document.hidden && eligible();

  const frame = (now: number) => {
    raf = 0;
    // Queued just before the hero left the screen or the tab was hidden: resume later.
    if (!canRun()) {
      last = 0;
      return;
    }
    // Real time, but never a big jump (pauses reset `last`).
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;
    let busy = false;
    if (settling && clock < total) {
      clock = Math.min(total, clock + dt);
      applySettle(clock);
      busy = clock < total;
    }
    const k = 1 - Math.exp(-dt * 6);
    turn.x += (target.x - turn.x) * k;
    turn.y += (target.y - turn.y) * k;
    if (Math.abs(target.x - turn.x) < 2e-5 && Math.abs(target.y - turn.y) < 2e-5) {
      turn.x = target.x;
      turn.y = target.y;
    } else busy = true;
    turntable.rotation.set(turn.x, turn.y, 0);
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      host.classList.add("is-live");
      window.setTimeout(() => {
        if (!shown) return;
        host.classList.add("is-in");
        settling = true;
        invalidate();
      }, FADE_MS + 50);
      resolveReady();
    }
    if (busy) invalidate();
    else last = 0;
  };

  function invalidate() {
    if (!raf && canRun()) raf = window.requestAnimationFrame(frame);
  }

  const showPoster = () => {
    shown = false;
    host.classList.remove("is-live", "is-in");
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };

  const onEligibility = () => {
    if (eligible()) invalidate();
    else showPoster();
  };
  const onMotion = (e: MediaQueryListEvent) => {
    motionOk = e.matches;
    onEligibility();
  };
  const onWide = (e: MediaQueryListEvent) => {
    wideOk = e.matches;
    onEligibility();
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = host.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5), -1, 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.5), -1, 1);
    // Look from where the pointer is: left shows more of the left side, top more from above.
    target.y = -nx * TURN_Y;
    target.x = -ny * TURN_X;
    invalidate();
  };
  const onLeave = () => {
    target.x = 0;
    target.y = 0;
    invalidate();
  };
  const onVisibility = () => {
    last = 0;
    invalidate();
  };
  const io = new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    if (inView) {
      last = 0;
      invalidate();
    }
  });
  io.observe(host);
  const ro = new ResizeObserver(() => {
    size();
    invalidate();
  });
  ro.observe(host);
  const onLost = (e: Event) => {
    e.preventDefault();
    broken = true;
    showPoster();
  };
  const onRestored = () => {
    broken = false;
    invalidate();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  motion.addEventListener("change", onMotion);
  wide.addEventListener("change", onWide);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  invalidate();

  return {
    canvas,
    ready,
    dispose() {
      showPoster();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      wide.removeEventListener("change", onWide);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      disposeScene();
      renderer.dispose();
      canvas.remove();
    }
  };
}
