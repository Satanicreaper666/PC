/**
 * Fill one letter with one row's values. Works on the letter's HTML as a
 * small tree (no DOM needed), so it runs the same in the browser and in tests.
 *
 * It follows the single-letter pages (src/scripts/template-engine.ts):
 * a paragraph, list item, heading or table row whose only placeholders are
 * optional and empty is left out of letters; forms keep them, because people
 * fill in the gaps by hand.
 */
export type HText = { text: string };
export type HEl = { tag: string; attrs: [string, string][]; kids: HNode[]; ph?: { optional: boolean; filled: boolean } };
export type HNode = HText | HEl;

const VOID = new Set(["br", "hr", "img", "input", "col", "wbr", "area", "source", "meta", "link"]);
const BLOCKS = new Set(["p", "li", "h1", "h2", "h3", "h4", "tr"]);
/** What an empty placeholder becomes in the Word file and printout: a line to write on. */
export const BLANK = "__________";

const isEl = (n: HNode): n is HEl => "tag" in n;
export const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function parseAttrs(s: string): [string, string][] {
  const out: [string, string][] = [];
  for (const m of s.matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const v = m[2] ?? (m[3] ?? m[4] ?? "").replace(/"/g, "&quot;");
    out.push([m[1].toLowerCase(), v]);
  }
  return out;
}

/** Parse well-formed HTML (as marked writes it) into a tree. Text keeps its entities. */
export function parseHtml(html: string): HNode[] {
  const root: HEl = { tag: "", attrs: [], kids: [] };
  const stack: HEl[] = [root];
  for (const m of html.matchAll(/<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)([^>]*)>|([^<]+)|</g)) {
    const top = stack[stack.length - 1];
    if (m[0].startsWith("<!--")) continue;
    if (m[1]) {
      const k = stack.map((e) => e.tag).lastIndexOf(m[1].toLowerCase());
      if (k > 0) stack.length = k;
      continue;
    }
    if (m[2]) {
      const tag = m[2].toLowerCase();
      const selfClosing = /\/\s*$/.test(m[3]);
      const el: HEl = { tag, attrs: parseAttrs(m[3].replace(/\/\s*$/, "")), kids: [] };
      top.kids.push(el);
      if (!VOID.has(tag) && !selfClosing) stack.push(el);
      continue;
    }
    top.kids.push({ text: m[4] ?? "&lt;" });
  }
  return root.kids;
}

export function toHtml(nodes: HNode[]): string {
  return nodes
    .map((n) => (isEl(n) ? `<${n.tag}${n.attrs.map(([k, v]) => ` ${k}="${v}"`).join("")}>${VOID.has(n.tag) ? "" : `${toHtml(n.kids)}</${n.tag}>`}` : n.text))
    .join("");
}

const attr = (n: HEl, name: string) => n.attrs.find(([k]) => k === name)?.[1];
const setAttr = (n: HEl, name: string, v: string) => {
  const a = n.attrs.find(([k]) => k === name);
  if (a) a[1] = v;
  else n.attrs.push([name, v]);
};
/** A value as text nodes, with its line breaks as <br>. */
const textNodes = (v: string): HNode[] =>
  v.split(/\r?\n/).flatMap((line, i): HNode[] => (i ? [{ tag: "br", attrs: [], kids: [] }, { text: escapeText(line) }] : [{ text: escapeText(line) }]));

export type MergeOptions = {
  /** Today's date as the letter shows it ("2 November 2026"). */
  today: string;
  /** Forms keep blocks whose optional placeholders are empty. */
  keepEmpty: boolean;
  /** How an empty placeholder shows: its label (on screen, highlighted) or a line to write on (Word and print). */
  blank: "label" | "line";
};

/** The letter for one row, as a tree. `values` hold the formatted text for each field id. */
export function mergeNodes(html: string, values: Record<string, string>, o: MergeOptions): HNode[] {
  const walk = (list: HNode[]): [HNode[], NonNullable<HEl["ph"]>[]] => {
    const out: HNode[] = [];
    const phs: NonNullable<HEl["ph"]>[] = [];
    for (const n of list) {
      if (!isEl(n)) {
        out.push(n);
        continue;
      }
      const classes = (attr(n, "class") ?? "").split(/\s+/).filter(Boolean);
      if (n.tag === "span" && classes.includes("ph") && !classes.includes("unknown")) {
        const f = attr(n, "data-f") ?? "";
        const v = (f === "today" ? o.today : (values[f] ?? "")).trim();
        n.ph = { optional: classes.includes("opt"), filled: !!v };
        if (v) {
          n.kids = textNodes(v);
          setAttr(n, "class", [...classes, "filled"].join(" "));
        } else if (o.blank === "line") n.kids = [{ text: BLANK }];
        phs.push(n.ph);
        out.push(n);
        continue;
      }
      const [kids, inner] = walk(n.kids);
      n.kids = kids;
      phs.push(...inner);
      if (!o.keepEmpty && BLOCKS.has(n.tag) && inner.length && inner.every((p) => p.optional && !p.filled)) continue;
      if ((n.tag === "ul" || n.tag === "ol") && !n.kids.some(isEl)) continue;
      out.push(n);
    }
    return [out, phs];
  };
  return walk(parseHtml(html))[0];
}

export const mergeHtml = (html: string, values: Record<string, string>, o: MergeOptions) => toHtml(mergeNodes(html, values, o));

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", rupee: "₹" };
export const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m)
  );

/** The letter as plain text, for copying into an email: blank lines between blocks, bullets for lists, " | " between table cells. */
export function plainText(nodes: HNode[]): string {
  const blocks: string[] = [];
  const inline = (list: HNode[]): string => list.map((n) => (isEl(n) ? (n.tag === "br" ? "\n" : inline(n.kids)) : decodeEntities(n.text).replace(/\s+/g, " "))).join("");
  const clean = (s: string) =>
    s
      .split("\n")
      .map((l) => l.trim())
      .join("\n")
      .trim();
  const rowsOf = (n: HEl): HEl[] => n.kids.filter(isEl).flatMap((k) => (k.tag === "tr" ? [k] : rowsOf(k)));
  const visit = (list: HNode[]) => {
    for (const n of list) {
      if (!isEl(n)) {
        const t = clean(inline([n]));
        if (t) blocks.push(t);
        continue;
      }
      if (n.tag === "ul" || n.tag === "ol") {
        let k = 0;
        const items = n.kids.filter(isEl).filter((li) => li.tag === "li").map((li) => `${n.tag === "ol" ? `${++k}.` : "•"} ${clean(inline(li.kids))}`);
        if (items.length) blocks.push(items.join("\n"));
      } else if (n.tag === "table") {
        const rows = rowsOf(n).map((tr) =>
          tr.kids
            .filter(isEl)
            .map((c) => clean(inline(c.kids)))
            .join(" | ")
        );
        if (rows.length) blocks.push(rows.join("\n"));
      } else if (n.tag === "div" || n.tag === "section" || n.tag === "article") visit(n.kids);
      else if (n.tag !== "hr") {
        const t = clean(inline(n.kids));
        if (t) blocks.push(t);
      }
    }
  };
  visit(nodes);
  return blocks.join("\n\n");
}
