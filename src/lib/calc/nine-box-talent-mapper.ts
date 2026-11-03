/**
 * 9-box talent grid: place people by performance (left → right) and
 * potential (bottom → top), three levels each.
 *
 * Levels: 1 = low, 2 = moderate, 3 = high.
 * Box names follow the site's Matrix vocabulary. Suggested actions are
 * starting points for a talent conversation, never a decision on their own.
 */

export type Level = 1 | 2 | 3;
export type Person = { id: string; name: string; performance: Level; potential: Level };
export type Tone = "good" | "bad" | "accent" | "neutral";
export type Box = { performance: Level; potential: Level; title: string; action: string; tone: Tone };

export const LEVEL_LABEL: Record<Level, string> = { 1: "Low", 2: "Moderate", 3: "High" };

/** All nine boxes. Order: potential high → low (rows), performance low → high (columns). */
export const BOXES: Box[] = [
  { potential: 3, performance: 1, title: "Rough diamond", action: "Coach closely and check the role fits their strengths.", tone: "neutral" },
  { potential: 3, performance: 2, title: "Rising star", action: "Give stretch work with support; review progress often.", tone: "neutral" },
  { potential: 3, performance: 3, title: "Future leader", action: "Plan the next role; add to succession plans; agree a development plan.", tone: "accent" },
  { potential: 2, performance: 1, title: "Inconsistent", action: "Find the blocker: role clarity, skills, workload or personal circumstances.", tone: "neutral" },
  { potential: 2, performance: 2, title: "Core player", action: "Keep them growing with clear goals and regular feedback.", tone: "neutral" },
  { potential: 2, performance: 3, title: "High performer", action: "Recognise the results; widen scope where they want it.", tone: "neutral" },
  { potential: 1, performance: 1, title: "Under-performer", action: "Agree clear expectations and support in writing; review role fit fairly.", tone: "bad" },
  { potential: 1, performance: 2, title: "Effective", action: "Clarify goals and recognise steady contribution.", tone: "neutral" },
  { potential: 1, performance: 3, title: "Trusted professional", action: "Retain and recognise; use their expertise to coach others.", tone: "good" }
];

export function boxFor(performance: Level, potential: Level): Box {
  return BOXES.find((b) => b.performance === performance && b.potential === potential)!;
}

export type PlacedBox = Box & { people: Person[]; share: number };

/** People placed into the nine boxes (same order as BOXES), names sorted A–Z inside each box. */
export function placePeople(people: Person[]): PlacedBox[] {
  const total = people.length;
  return BOXES.map((b) => {
    const inBox = people
      .filter((p) => p.performance === b.performance && p.potential === b.potential)
      .sort((x, y) => x.name.localeCompare(y.name, "en-IN", { sensitivity: "base" }));
    return { ...b, people: inBox, share: total ? inBox.length / total : 0 };
  });
}

/** Share of people at each level of one axis, low → high. */
export function axisSpread(people: Person[], axis: "performance" | "potential") {
  const total = people.length || 1;
  return ([1, 2, 3] as Level[]).map((l) => {
    const n = people.filter((p) => p[axis] === l).length;
    return { level: l, label: LEVEL_LABEL[l], count: n, share: n / total };
  });
}

/**
 * Read a level from a cell: words (low / moderate / medium / high, or L / M / H)
 * or a number on the chosen scale. On a 1–5 scale, 1–2 is low, 3 is moderate, 4–5 is high.
 */
export function parseLevel(raw: string, scale: 3 | 5 = 3): Level | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (["low", "l"].includes(s)) return 1;
  if (["moderate", "medium", "mid", "m"].includes(s)) return 2;
  if (["high", "h"].includes(s)) return 3;
  const n = Number(s);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (scale === 3) return n >= 1 && n <= 3 ? (n as Level) : null;
  if (n < 1 || n > 5) return null;
  return n <= 2 ? 1 : n === 3 ? 2 : 3;
}

export type ParseResult = { people: Omit<Person, "id">[]; errors: { line: number; text: string; message: string }[] };

/**
 * Parse pasted rows: name, performance, potential. Accepts tabs (from a
 * spreadsheet), commas or semicolons. A first row that looks like a header is skipped.
 */
export function parsePeople(text: string, scale: 3 | 5 = 3): ParseResult {
  const out: ParseResult = { people: [], errors: [] };
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    const cells = splitRow(line);
    const lineNo = idx + 1;
    if (out.people.length === 0 && out.errors.length === 0 && /name/i.test(cells[0] ?? "") && /perform|potential/i.test(cells.slice(1).join(" "))) return;
    if (cells.length < 3) {
      out.errors.push({ line: lineNo, text: line, message: "Needs three columns: name, performance, potential." });
      return;
    }
    const name = cleanName(cells[0]);
    const performance = parseLevel(cells[1], scale);
    const potential = parseLevel(cells[2], scale);
    if (!name) out.errors.push({ line: lineNo, text: line, message: "The name is empty." });
    else if (!performance) out.errors.push({ line: lineNo, text: line, message: `Performance "${cells[1].trim()}" isn't a level we can read.` });
    else if (!potential) out.errors.push({ line: lineNo, text: line, message: `Potential "${cells[2].trim()}" isn't a level we can read.` });
    else out.people.push({ name, performance, potential });
  });
  return out;
}

export function splitRow(line: string): string[] {
  const sep = line.includes("\t") ? "\t" : line.includes(";") && !line.includes(",") ? ";" : ",";
  // Minimal CSV: supports "quoted, values" with doubled quotes inside.
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"' && cur.trim() === "") quoted = true;
    else if (ch === sep) {
      cells.push(cur);
      cur = "";
    } else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

export function cleanName(s: string) {
  return s.replace(/\s+/g, " ").trim().slice(0, 80);
}

/**
 * One CSV cell. Text that a spreadsheet would treat as a formula (starting
 * with = + - @) gets a leading apostrophe; cells with commas or quotes are quoted.
 */
export function esc(s: string) {
  const v = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** CSV with a header row; levels written as words so the file reads well in a spreadsheet. */
export function toCsv(people: Person[]): string {
  const rows = placePeople(people).flatMap((b) => b.people.map((p) => [esc(p.name), LEVEL_LABEL[p.performance], LEVEL_LABEL[p.potential], b.title].join(",")));
  return ["Name,Performance,Potential,Box", ...rows].join("\n");
}

/** Example team for "Load an example". Fictional names. */
export const EXAMPLE_PEOPLE: Omit<Person, "id">[] = [
  { name: "Aditi Rao", performance: 3, potential: 3 },
  { name: "Imran Shaikh", performance: 3, potential: 2 },
  { name: "Kavya Menon", performance: 2, potential: 3 },
  { name: "Rohan Gupta", performance: 2, potential: 2 },
  { name: "Sneha Pillai", performance: 2, potential: 2 },
  { name: "Arjun Nair", performance: 2, potential: 2 },
  { name: "Meera Iyer", performance: 3, potential: 1 },
  { name: "Vikram Singh", performance: 2, potential: 1 },
  { name: "Farah Khan", performance: 1, potential: 2 },
  { name: "Deepak Joshi", performance: 1, potential: 1 },
  { name: "Neha Kulkarni", performance: 1, potential: 3 },
  { name: "Siddharth Bose", performance: 3, potential: 2 }
];
