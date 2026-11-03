/**
 * Small SVG charts for the people-analytics dashboard. No libraries.
 *
 * Mark specs (from the site's data-viz method): bars at most 24px thick with
 * 4px rounded data ends and a square baseline; 2px lines; 8px+ markers with a
 * 2px surface ring; 10% area wash; solid hairline grid. Text uses ink tokens,
 * never the series colour. Every chart can be read with the keyboard (arrow
 * keys) as well as by pointer, and the tooltip never holds the only copy of a
 * value: each chart has a table view built by the dashboard.
 */
import { MONTHS } from "../../lib/analytics/format.ts";

const NS = "http://www.w3.org/2000/svg";
export type TipRow = { value: string; label: string; color?: string; shape?: "line" | "rect" | "dot" };
export type Tip = { title: string; rows: TipRow[]; note?: string };

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  parent?.appendChild(el);
  return el;
}
function text(parent: Element, x: number, y: number, value: string, cls: string, anchor: "start" | "middle" | "end" = "start") {
  const t = svg("text", { x, y, class: cls, "text-anchor": anchor }, parent);
  t.textContent = value;
  return t;
}

let measureCtx: CanvasRenderingContext2D | null = null;
/** Width of a label in px, measured with the page font. */
export function textWidth(s: string, size = 12, weight = 500): number {
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return s.length * size * 0.56;
  measureCtx.font = `${weight} ${size}px ${getComputedStyle(document.body).fontFamily}`;
  return measureCtx.measureText(s).width;
}

/** Round tick steps (1, 2, 2.5, 5 × 10ⁿ) from zero to at least `max`. */
export function niceTicks(max: number, target = 4, integer = true): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  let step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  if (integer) step = Math.max(1, Math.ceil(step));
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  if (ticks.length < 2) ticks.push(step);
  return ticks;
}

const intFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Rounded-top column: square at the baseline, 4px radius at the data end. */
function columnPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
/** Bar growing right from a baseline at x. */
function barPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, h / 2, w);
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

/** Two-line month ticks: "Nov" with the year under the first month and every January. */
function monthTick(g: Element, x: number, y: number, mi: number, first: boolean) {
  text(g, x, y, MONTHS[mi % 12], "pa-tick", "middle");
  if (first || mi % 12 === 0) text(g, x, y + 14, String(Math.floor(mi / 12)), "pa-tick pa-tick-year", "middle");
}

/**
 * Which ticks to label when they don't all fit: every `step`-th counting back
 * from the last (so the latest month is always labelled), and the first
 * labelled one carries its year.
 */
function tickIndices(n: number, step: number): { shown: Set<number>; first: number } {
  const shown = new Set<number>();
  for (let i = n - 1; i >= 0; i -= step) shown.add(i);
  return { shown, first: Math.min(...shown) };
}

/* ---------- Base ---------- */

export abstract class Chart {
  protected readonly root: HTMLElement;
  protected readonly svgEl: SVGSVGElement;
  private readonly tipEl: HTMLDivElement;
  private readonly live: HTMLElement;
  protected width = 0;
  protected active = -1;
  private drawn = false;

  constructor(root: HTMLElement, label: string) {
    this.root = root;
    root.replaceChildren();
    root.classList.add("pa-chart");
    root.tabIndex = 0;
    root.setAttribute("role", "group");
    root.setAttribute("aria-roledescription", "chart");
    root.setAttribute("aria-label", `${label}. Use the arrow keys to read each value, or show the table.`);
    this.svgEl = svg("svg", { class: "pa-svg", "aria-hidden": "true", focusable: "false" });
    this.tipEl = document.createElement("div");
    this.tipEl.className = "pa-tip";
    this.tipEl.hidden = true;
    this.tipEl.setAttribute("aria-hidden", "true");
    this.live = document.createElement("p");
    this.live.className = "visually-hidden";
    this.live.setAttribute("aria-live", "polite");
    root.append(this.svgEl, this.tipEl, this.live);

    const point = (e: PointerEvent) => {
      const r = this.svgEl.getBoundingClientRect();
      this.setActive(this.hit(e.clientX - r.left, e.clientY - r.top), false);
    };
    root.addEventListener("pointermove", point);
    root.addEventListener("pointerdown", point);
    // On touch screens the tooltip stays until the reader taps elsewhere (blur).
    root.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse" && document.activeElement !== root) this.setActive(-1, false);
    });
    root.addEventListener("focus", () => this.setActive(this.active >= 0 ? this.active : this.count() - 1, true));
    root.addEventListener("blur", () => this.setActive(-1, false));
    root.addEventListener("keydown", (e) => {
      const n = this.count();
      if (!n) return;
      const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next = this.active;
      if (e.key in keys) next = Math.min(n - 1, Math.max(0, (this.active < 0 ? 0 : this.active) + keys[e.key]));
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = n - 1;
      else if (e.key === "Escape") next = -1;
      else return;
      e.preventDefault();
      this.setActive(next, true);
    });
    new ResizeObserver(() => {
      const w = Math.round(this.root.clientWidth);
      if (w && w !== this.width) this.draw();
    }).observe(root);
  }

  /** Redraw with the current data (call after changing it). */
  draw() {
    const w = Math.round(this.root.clientWidth);
    if (!w) return;
    this.width = w;
    this.svgEl.replaceChildren();
    const h = this.render(w);
    this.svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
    this.svgEl.setAttribute("width", String(w));
    this.svgEl.setAttribute("height", String(h));
    this.drawn = true;
    if (this.active >= this.count()) this.active = -1;
    this.highlight(this.active);
    if (this.active >= 0) this.showTip(this.active);
    else this.tipEl.hidden = true;
  }

  protected setActive(i: number, announce: boolean) {
    if (!this.drawn) return;
    if (i === this.active && (i < 0 || !this.tipEl.hidden)) return;
    this.active = i;
    this.highlight(i);
    if (i < 0) {
      this.tipEl.hidden = true;
      return;
    }
    const tip = this.showTip(i);
    if (announce) this.live.textContent = `${tip.title}: ${tip.rows.map((r) => `${r.value} ${r.label}`).join(", ")}${tip.note ? `. ${tip.note}` : ""}`;
  }

  private showTip(i: number): Tip {
    const tip = this.tip(i);
    const box = this.tipEl;
    box.replaceChildren();
    const title = document.createElement("p");
    title.className = "pa-tip-title";
    title.textContent = tip.title;
    box.append(title);
    const list = document.createElement("ul");
    for (const r of tip.rows) {
      const li = document.createElement("li");
      if (r.color) {
        const k = document.createElement("span");
        k.className = `pa-key pa-key-${r.shape ?? "line"}`;
        k.style.setProperty("--k", r.color);
        li.append(k);
      }
      const v = document.createElement("strong");
      v.textContent = r.value;
      const l = document.createElement("span");
      l.textContent = r.label;
      li.append(v, " ", l);
      list.append(li);
    }
    box.append(list);
    if (tip.note) {
      const n = document.createElement("p");
      n.className = "pa-tip-note";
      n.textContent = tip.note;
      box.append(n);
    }
    box.hidden = false;
    const a = this.anchor(i);
    const bw = box.offsetWidth;
    const bh = box.offsetHeight;
    let x = a.x + 14;
    if (x + bw > this.width) x = a.x - bw - 14;
    x = Math.max(0, Math.min(x, this.width - bw));
    const y = Math.max(0, a.y - bh - 10);
    box.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    return tip;
  }

  /** Number of focusable data positions. */
  abstract count(): number;
  /** Draw into this.svgEl at width w; return the height used (axis labels included). */
  protected abstract render(w: number): number;
  /** Data position under the pointer, or -1. */
  protected abstract hit(x: number, y: number): number;
  protected abstract tip(i: number): Tip;
  /** Where the tooltip points, in px from the chart's top-left. */
  protected abstract anchor(i: number): { x: number; y: number };
  /** Show (i ≥ 0) or clear (i = -1) the hover state. */
  protected abstract highlight(i: number): void;
}

/* ---------- Line over months (one series, area wash) ---------- */

export type LineData = { months: number[]; values: number[]; color: string; tip: (i: number) => Tip };

export class LineChart extends Chart {
  data: LineData = { months: [], values: [], color: "var(--c1)", tip: () => ({ title: "", rows: [] }) };
  private xs: number[] = [];
  private ys: number[] = [];
  private top = 0;
  private bottom = 0;
  private hl: SVGGElement | null = null;
  private over: SVGGElement | null = null;

  count() {
    return this.data.values.length;
  }

  protected render(w: number): number {
    const { months, values, color } = this.data;
    const plotH = 190;
    const ticks = niceTicks(Math.max(...values, 1));
    const max = ticks[ticks.length - 1];
    const left = Math.ceil(Math.max(...ticks.map((t) => textWidth(intFmt.format(t))))) + 10;
    const last = values[values.length - 1] ?? 0;
    const right = Math.ceil(textWidth(intFmt.format(last), 13, 650)) + 14;
    this.top = 14;
    this.bottom = this.top + plotH;
    const plotW = Math.max(10, w - left - right);
    const n = values.length;
    this.xs = values.map((_, i) => left + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1)));
    this.ys = values.map((v) => this.bottom - (v / max) * plotH);

    const grid = svg("g", {}, this.svgEl);
    for (const t of ticks) {
      const y = this.bottom - (t / max) * plotH;
      svg("line", { x1: left, x2: w - right + 6, y1: y, y2: y, class: t === 0 ? "pa-base" : "pa-gl" }, grid);
      text(grid, left - 8, y + 4, intFmt.format(t), "pa-tick", "end");
    }
    const step = Math.max(1, Math.ceil(34 / Math.max(1, plotW / Math.max(1, n - 1))));
    const ticksAt = tickIndices(n, step);
    months.forEach((mi, i) => {
      if (ticksAt.shown.has(i)) monthTick(grid, this.xs[i], this.bottom + 18, mi, i === ticksAt.first);
    });
    this.hl = svg("g", {}, this.svgEl);
    if (n > 1) {
      const line = this.xs.map((x, i) => `${i ? "L" : "M"}${x},${this.ys[i]}`).join("");
      svg("path", { d: `${line}L${this.xs[n - 1]},${this.bottom}L${this.xs[0]},${this.bottom}Z`, class: "pa-wash", style: `fill:${color}` }, this.svgEl);
      svg("path", { d: line, class: "pa-line", style: `stroke:${color}` }, this.svgEl);
    }
    if (n) {
      svg("circle", { cx: this.xs[n - 1], cy: this.ys[n - 1], r: 4, class: "pa-dot", style: `fill:${color}` }, this.svgEl);
      text(this.svgEl, this.xs[n - 1] + 9, this.ys[n - 1] + 4, intFmt.format(last), "pa-end");
    }
    this.over = svg("g", {}, this.svgEl);
    return this.bottom + 40;
  }

  protected hit(x: number): number {
    if (!this.xs.length) return -1;
    let best = 0;
    this.xs.forEach((px, i) => {
      if (Math.abs(px - x) < Math.abs(this.xs[best] - x)) best = i;
    });
    return best;
  }
  protected tip(i: number) {
    return this.data.tip(i);
  }
  protected anchor(i: number) {
    return { x: this.xs[i], y: this.ys[i] };
  }
  protected highlight(i: number) {
    if (!this.hl || !this.over) return;
    this.hl.replaceChildren();
    this.over.replaceChildren();
    if (i < 0) return;
    svg("line", { x1: this.xs[i], x2: this.xs[i], y1: this.top, y2: this.bottom, class: "pa-cross" }, this.hl);
    svg("circle", { cx: this.xs[i], cy: this.ys[i], r: 5, class: "pa-dot", style: `fill:${this.data.color}` }, this.over);
  }
}

/* ---------- Columns (one or more series; months or ordered bands) ---------- */

export type ColumnSeries = { name: string; values: number[]; color: string };
export type ColumnData = {
  labels: string[];
  /** Month indices: when set, ticks show "Nov / 2025" instead of labels. */
  months?: number[];
  series: ColumnSeries[];
  /** Per-bar colours for one series on an ordered scale (overrides the series colour). */
  barColors?: string[];
  /** Print the value of the tallest bar on its cap. */
  labelMax?: boolean;
  tip: (i: number) => Tip;
};

export class ColumnChart extends Chart {
  data: ColumnData = { labels: [], series: [], tip: () => ({ title: "", rows: [] }) };
  private bands: { x: number; w: number }[] = [];
  private top = 0;
  private bottom = 0;
  private maxY = 1;
  private hl: SVGGElement | null = null;

  count() {
    return this.data.labels.length;
  }

  protected render(w: number): number {
    const { labels, months, series, barColors } = this.data;
    const plotH = 180;
    const all = series.flatMap((s) => s.values);
    const ticks = niceTicks(Math.max(...all, 1));
    this.maxY = ticks[ticks.length - 1];
    const left = Math.ceil(Math.max(...ticks.map((t) => textWidth(intFmt.format(t))))) + 10;
    const right = 6;
    this.top = 18;
    this.bottom = this.top + plotH;
    const plotW = Math.max(10, w - left - right);
    const n = labels.length;
    const band = plotW / Math.max(1, n);
    const s = series.length;
    const gap = 2;
    const barW = Math.max(2, Math.min(24, (band * 0.72 - gap * (s - 1)) / s));
    const groupW = barW * s + gap * (s - 1);
    this.bands = labels.map((_, i) => ({ x: left + i * band, w: band }));

    const grid = svg("g", {}, this.svgEl);
    for (const t of ticks) {
      const y = this.bottom - (t / this.maxY) * plotH;
      svg("line", { x1: left, x2: w - right, y1: y, y2: y, class: t === 0 ? "pa-base" : "pa-gl" }, grid);
      text(grid, left - 8, y + 4, intFmt.format(t), "pa-tick", "end");
    }
    this.hl = svg("g", {}, this.svgEl);
    const marks = svg("g", {}, this.svgEl);
    let maxVal = 0;
    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < n; i++) {
      const x0 = left + i * band + (band - groupW) / 2;
      for (let k = 0; k < s; k++) {
        const v = series[k].values[i] ?? 0;
        if (v <= 0) continue;
        const h = (v / this.maxY) * plotH;
        const x = x0 + k * (barW + gap);
        svg("path", { d: columnPath(x, this.bottom - h, barW, h), class: "pa-bar", style: `fill:${barColors?.[i] ?? series[k].color}` }, marks);
        if (v > maxVal) {
          maxVal = v;
          maxX = x + barW / 2;
          maxY = this.bottom - h;
        }
      }
    }
    if (this.data.labelMax && maxVal > 0) text(this.svgEl, maxX, maxY - 6, intFmt.format(maxVal), "pa-cap", "middle");
    // Tick labels: months as two lines; bands as one line, thinned to fit.
    const minGap = months ? 34 : Math.max(...labels.map((l) => textWidth(l))) + 8;
    const step = Math.max(1, Math.ceil(minGap / band));
    const ticksAt = tickIndices(n, step);
    labels.forEach((l, i) => {
      if (!ticksAt.shown.has(i)) return;
      const cx = left + i * band + band / 2;
      if (months) monthTick(grid, cx, this.bottom + 18, months[i], i === ticksAt.first);
      else text(grid, cx, this.bottom + 18, l, "pa-tick", "middle");
    });
    return this.bottom + (months ? 40 : 28);
  }

  protected hit(x: number): number {
    return this.bands.findIndex((b) => x >= b.x && x < b.x + b.w);
  }
  protected tip(i: number) {
    return this.data.tip(i);
  }
  protected anchor(i: number) {
    const b = this.bands[i];
    const v = Math.max(...this.data.series.map((s) => s.values[i] ?? 0));
    return { x: b.x + b.w / 2, y: this.bottom - (v / this.maxY) * (this.bottom - this.top) };
  }
  protected highlight(i: number) {
    if (!this.hl) return;
    this.hl.replaceChildren();
    if (i < 0) return;
    const b = this.bands[i];
    svg("rect", { x: b.x, y: this.top - 8, width: b.w, height: this.bottom - this.top + 8, class: "pa-band" }, this.hl);
  }
}

/* ---------- Ranked horizontal bars with an optional reference line ---------- */

export type HBarRow = { label: string; value: number; display: string; sub?: string; tip: Tip };
export type HBarData = { rows: HBarRow[]; color: string; ref?: { value: number; label: string } };

export class HBarChart extends Chart {
  data: HBarData = { rows: [], color: "var(--c1)" };
  private rowsY: { y: number; h: number; barY: number; end: number }[] = [];

  count() {
    return this.data.rows.length;
  }

  protected render(w: number): number {
    const { rows, color, ref } = this.data;
    const narrow = w < 520;
    const valueW = Math.ceil(Math.max(0, ...rows.map((r) => textWidth(r.display, 13, 650) + (r.sub ? textWidth(` ${r.sub}`, 12) : 0)))) + 12;
    const labelW = narrow ? 0 : Math.min(Math.round(w * 0.36), Math.ceil(Math.max(0, ...rows.map((r) => textWidth(r.label, 13)))) + 14);
    const x0 = labelW;
    const plotW = Math.max(10, w - x0 - valueW);
    const max = Math.max(...rows.map((r) => r.value), ref?.value ?? 0, 1e-9);
    const rowH = narrow ? 46 : 32;
    const barH = 14;
    const top = ref ? 24 : 4;
    this.rowsY = [];
    const hl = svg("g", { class: "pa-hl" }, this.svgEl);
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const barY = narrow ? y + 22 : y + (rowH - barH) / 2;
      const len = (r.value / max) * plotW;
      this.rowsY.push({ y, h: rowH, barY, end: x0 + len });
      if (narrow) text(this.svgEl, 0, y + 14, r.label, "pa-cat");
      else text(this.svgEl, labelW - 12, barY + barH / 2 + 4.5, r.label, "pa-cat", "end");
      if (len > 0.5) svg("path", { d: barPath(x0, barY, len, barH), class: "pa-bar", style: `fill:${color}` }, this.svgEl);
      const v = text(this.svgEl, x0 + len + 6, barY + barH / 2 + 4.5, "", "pa-val");
      const strong = svg("tspan", { class: "pa-val-main" }, v);
      strong.textContent = r.display;
      if (r.sub) {
        const sub = svg("tspan", { class: "pa-val-sub" }, v);
        sub.textContent = ` ${r.sub}`;
      }
    });
    const bottom = top + rows.length * rowH;
    svg("line", { x1: x0, x2: x0, y1: top - 2, y2: bottom, class: "pa-base" }, this.svgEl);
    if (ref) {
      const rx = x0 + (ref.value / max) * plotW;
      svg("line", { x1: rx, x2: rx, y1: 16, y2: bottom, class: "pa-ref" }, this.svgEl);
      const anchor = rx > w - 90 ? "end" : rx < x0 + 60 ? "start" : "middle";
      text(this.svgEl, rx, 11, ref.label, "pa-ref-label", anchor);
    }
    this.hlLayer = hl;
    return bottom + 6;
  }
  private hlLayer: SVGGElement | null = null;

  protected hit(_x: number, y: number): number {
    return this.rowsY.findIndex((r) => y >= r.y && y < r.y + r.h);
  }
  protected tip(i: number) {
    return this.data.rows[i].tip;
  }
  protected anchor(i: number) {
    const r = this.rowsY[i];
    return { x: Math.min(r.end, this.width - 40), y: r.barY };
  }
  protected highlight(i: number) {
    if (!this.hlLayer) return;
    this.hlLayer.replaceChildren();
    if (i < 0) return;
    const r = this.rowsY[i];
    svg("rect", { x: 0, y: r.y, width: this.width, height: r.h, class: "pa-band", rx: 6 }, this.hlLayer);
  }
}

/* ---------- Pay spread: lowest–highest, middle half, median ---------- */

export type RangeRow = { label: string; sub: string; stats: { min: number; p25: number; median: number; p75: number; max: number } | null; display: string; tip: Tip };
export type RangeData = { rows: RangeRow[]; color: string; tick: (v: number) => string; hidden: string };

export class RangeChart extends Chart {
  data: RangeData = { rows: [], color: "var(--c1)", tick: String, hidden: "" };
  private rowsY: { y: number; h: number; mid: number; x: number }[] = [];
  private hlLayer: SVGGElement | null = null;

  count() {
    return this.data.rows.length;
  }

  protected render(w: number): number {
    const { rows, color } = this.data;
    const narrow = w < 560;
    const shown = rows.filter((r) => r.stats);
    const maxV = Math.max(1, ...shown.map((r) => r.stats!.max));
    const ticks = niceTicks(maxV, narrow ? 3 : 5, false);
    const max = ticks[ticks.length - 1];
    // On narrow screens the median moves onto the label line so the plot gets the full width.
    const valueW = narrow ? 0 : Math.ceil(Math.max(0, ...rows.map((r) => (r.stats ? textWidth(r.display, 13, 650) : 0)))) + 14;
    const labelW = narrow ? 0 : Math.min(Math.round(w * 0.32), Math.ceil(Math.max(0, ...rows.map((r) => Math.max(textWidth(r.label, 13), textWidth(r.sub, 12))))) + 16);
    const x0 = labelW + 4;
    const plotW = Math.max(10, w - x0 - valueW - (narrow ? 12 : 8));
    const X = (v: number) => x0 + (v / max) * plotW;
    const rowH = narrow ? 52 : 40;
    const top = 6;
    this.rowsY = [];
    const grid = svg("g", {}, this.svgEl);
    this.hlLayer = svg("g", {}, this.svgEl);
    const bottom = top + rows.length * rowH;
    for (const t of ticks) {
      svg("line", { x1: X(t), x2: X(t), y1: top, y2: bottom, class: t === 0 ? "pa-base" : "pa-gl" }, grid);
      text(grid, X(t), bottom + 16, this.data.tick(t), "pa-tick", t === 0 ? "start" : t === max && narrow ? "end" : "middle");
    }
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const mid = narrow ? y + 34 : y + rowH / 2;
      if (narrow) {
        const t = text(this.svgEl, 0, y + 14, r.label, "pa-cat");
        const s = svg("tspan", { class: "pa-val-sub" }, t);
        s.textContent = `  ${r.sub}`;
      } else {
        text(this.svgEl, labelW - 8, mid - 2, r.label, "pa-cat", "end");
        text(this.svgEl, labelW - 8, mid + 13, r.sub, "pa-sub", "end");
      }
      if (!r.stats) {
        text(this.svgEl, x0 + 4, mid + 4.5, this.data.hidden, "pa-sub");
        this.rowsY.push({ y, h: rowH, mid, x: x0 + 40 });
        return;
      }
      const s = r.stats;
      svg("line", { x1: X(s.min), x2: X(s.max), y1: mid, y2: mid, class: "pa-whisker", style: `stroke:${color}` }, this.svgEl);
      const bw = Math.max(4, X(s.p75) - X(s.p25));
      svg("rect", { x: X(s.p25), y: mid - 6, width: bw, height: 12, rx: 4, class: "pa-iqr", style: `fill:${color}` }, this.svgEl);
      svg("circle", { cx: X(s.median), cy: mid, r: 5, class: "pa-median" }, this.svgEl);
      if (narrow) text(this.svgEl, w, y + 14, r.display, "pa-val-main", "end");
      else text(this.svgEl, w - valueW + 6, mid + 4.5, r.display, "pa-val-main");
      this.rowsY.push({ y, h: rowH, mid, x: X(s.median) });
    });
    return bottom + 26;
  }

  protected hit(_x: number, y: number): number {
    return this.rowsY.findIndex((r) => y >= r.y && y < r.y + r.h);
  }
  protected tip(i: number) {
    return this.data.rows[i].tip;
  }
  protected anchor(i: number) {
    const r = this.rowsY[i];
    return { x: r.x, y: r.mid - 6 };
  }
  protected highlight(i: number) {
    if (!this.hlLayer) return;
    this.hlLayer.replaceChildren();
    if (i < 0) return;
    const r = this.rowsY[i];
    svg("rect", { x: 0, y: r.y, width: this.width, height: r.h, class: "pa-band", rx: 6 }, this.hlLayer);
  }
}
