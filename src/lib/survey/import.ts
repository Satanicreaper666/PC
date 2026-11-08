/**
 * Survey results from a real survey: the CSV or Excel file Google Forms or
 * Microsoft Forms exports, one row per person, one column per statement.
 *
 * - Statement columns are found by their wording (Google Forms grids put it in
 *   brackets: "How much do you agree? [My priorities are clear]"), or by the
 *   statement's id (clarity_1).
 * - Answers may be numbers ("4", "4 - Agree") or the scale's labels ("Agree"),
 *   including "Neither agree nor disagree" for the middle point.
 * - A group column (team, department, location…) gives cuts, shown only for
 *   groups of five or more so that no one can be identified.
 * - A 0–10 "recommend" column gives eNPS.
 *
 * Pure functions, so the maths is tested; the page (survey-tool.ts) reads the file.
 */
export type Cell = string | number | boolean | null;
export type SurveyQuestion = { id: string; text: string; dim: string; rev: boolean };
export type Scale = { min: number; max: number; labels: string[] };
export type Answers = Record<string, number>;

/** Groups smaller than this are never shown on their own. */
export const MIN_GROUP = 5;

export const norm = (s: unknown): string =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const GROUP_HEADER = /\b(team|department|dept|function|division|location|office|site|branch|business unit|bu|group|segment|grade|level|band|tenure)\b/;
const ENPS_HEADER = /(0\s*(to|-)\s*10|recommend|enps|e nps|net promoter)/;

export type ColumnMatch = {
  /** Question id → column index. */
  questions: Record<string, number>;
  missing: string[];
  group?: number;
  enps?: number;
};

/** Find each statement's column, a group column and an eNPS column. */
export function matchColumns(header: Cell[], questions: SurveyQuestion[]): ColumnMatch {
  const heads = header.map(norm);
  const used = new Set<number>();
  const out: Record<string, number> = {};
  for (const q of questions) {
    const t = norm(q.text);
    const id = norm(q.id);
    let idx = heads.findIndex((h, i) => !used.has(i) && (h === t || h === id));
    // Grid questions and exports that add a prefix or number: the statement inside a longer header.
    if (idx < 0 && t.length >= 12) idx = heads.findIndex((h, i) => !used.has(i) && h.includes(t));
    if (idx >= 0) {
      out[q.id] = idx;
      used.add(idx);
    }
  }
  const enps = heads.findIndex((h, i) => !used.has(i) && ENPS_HEADER.test(h) && !questions.some((q) => out[q.id] === i));
  if (enps >= 0) used.add(enps);
  const group = heads.findIndex((h, i) => !used.has(i) && GROUP_HEADER.test(h));
  return {
    questions: out,
    missing: questions.filter((q) => out[q.id] === undefined).map((q) => q.text),
    ...(group >= 0 ? { group } : {}),
    ...(enps >= 0 ? { enps } : {})
  };
}

/** A cell as a point on the scale, or NaN. */
export function parseAnswer(c: Cell, scale: Scale): number {
  if (c === null || c === undefined || c === "") return NaN;
  if (typeof c === "number") return Number.isInteger(c) && c >= scale.min && c <= scale.max ? c : NaN;
  const s = String(c).trim();
  const lead = /^(\d+)(?:\s*[-–:.)]|\s|$)/.exec(s);
  if (lead) {
    const n = Number(lead[1]);
    return n >= scale.min && n <= scale.max ? n : NaN;
  }
  const t = norm(s);
  // Longest label first, so "strongly agree" isn't read as "agree".
  const labels = scale.labels.map((l, i) => ({ l: norm(l), v: scale.min + i })).sort((a, b) => b.l.length - a.l.length);
  const hit = labels.find((x) => t === x.l) ?? labels.find((x) => x.l && t.startsWith(x.l));
  if (hit) return hit.v;
  if (/neither|neutral|unsure|not sure/.test(t)) return Math.round((scale.min + scale.max) / 2);
  return NaN;
}

export type ImportedRow = { answers: Answers; group?: string; enps?: number };
export type ImportResult = { rows: ImportedRow[]; skipped: number; unreadable: number; match: ColumnMatch };

/** Rows with at least half the statements answered are kept; the rest are counted as skipped. */
export function readResponses(table: Cell[][], questions: SurveyQuestion[], scale: Scale): ImportResult {
  const headerAt = table.findIndex((r) => r.some((c) => c !== null && c !== ""));
  const header = table[headerAt] ?? [];
  const match = matchColumns(header, questions);
  const rows: ImportedRow[] = [];
  let skipped = 0;
  let unreadable = 0;
  for (const r of table.slice(headerAt + 1)) {
    if (!r.some((c) => c !== null && c !== "")) continue;
    const answers: Answers = {};
    for (const q of questions) {
      const i = match.questions[q.id];
      if (i === undefined) continue;
      const v = parseAnswer(r[i] ?? null, scale);
      if (Number.isFinite(v)) answers[q.id] = v;
      else if (r[i] !== null && r[i] !== undefined && r[i] !== "") unreadable++;
    }
    const found = Object.keys(match.questions).length;
    if (!found || Object.keys(answers).length * 2 < found) {
      skipped++;
      continue;
    }
    const row: ImportedRow = { answers };
    if (match.group !== undefined) {
      const g = String(r[match.group] ?? "").trim();
      if (g) row.group = g;
    }
    if (match.enps !== undefined) {
      const e = Number(String(r[match.enps] ?? "").trim().split(/\s/)[0]);
      if (Number.isInteger(e) && e >= 0 && e <= 10) row.enps = e;
    }
    rows.push(row);
  }
  return { rows, skipped, unreadable, match };
}

export type ItemScore = { id: string; text: string; dim: string; n: number; avg: number; favourable: number; unfavourable: number };
export type AreaScore = { dim: string; avg: number; favourable: number };
export type Summary = { n: number; overall: number; favourable: number; areas: AreaScore[]; items: ItemScore[]; enps?: { n: number; score: number; promoters: number; detractors: number } };

const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);

/**
 * Scores with reverse-worded statements flipped. "Favourable" is the top two points
 * of a five-point scale after flipping (agree or strongly agree on a positive
 * statement; disagree or strongly disagree on a reverse one).
 */
export function summarise(rows: ImportedRow[], questions: SurveyQuestion[], scale: Scale): Summary {
  const flip = (q: SurveyQuestion, v: number) => (q.rev ? scale.max + scale.min - v : v);
  // Top two and bottom two points of the scale.
  const favCut = scale.max - 1;
  const lowCut = scale.min + 1;
  const items: ItemScore[] = questions.map((q) => {
    const vals = rows.map((r) => r.answers[q.id]).filter((v) => Number.isFinite(v)).map((v) => flip(q, v));
    return {
      id: q.id,
      text: q.text,
      dim: q.dim,
      n: vals.length,
      avg: mean(vals),
      favourable: vals.length ? vals.filter((v) => v >= favCut).length / vals.length : NaN,
      unfavourable: vals.length ? vals.filter((v) => v <= lowCut).length / vals.length : NaN
    };
  });
  const dims = Array.from(new Set(questions.map((q) => q.dim)));
  const all = (pick: (q: SurveyQuestion) => boolean) => {
    const vals: number[] = [];
    for (const r of rows) for (const q of questions) if (pick(q) && Number.isFinite(r.answers[q.id])) vals.push(flip(q, r.answers[q.id]));
    return vals;
  };
  const fav = (vals: number[]) => (vals.length ? vals.filter((v) => v >= favCut).length / vals.length : NaN);
  const areas = dims.map((d) => {
    const vals = all((q) => q.dim === d);
    return { dim: d, avg: mean(vals), favourable: fav(vals) };
  });
  const overallVals = all(() => true);
  const e = rows.map((r) => r.enps).filter((v): v is number => v !== undefined);
  const enps = e.length
    ? (() => {
        const promoters = e.filter((v) => v >= 9).length / e.length;
        const detractors = e.filter((v) => v <= 6).length / e.length;
        return { n: e.length, score: Math.round((promoters - detractors) * 100), promoters, detractors };
      })()
    : undefined;
  return { n: rows.length, overall: mean(overallVals), favourable: fav(overallVals), areas, items, ...(enps ? { enps } : {}) };
}

export type GroupCut = { name: string; summary: Summary };

/**
 * Results by group, never for fewer than MIN_GROUP people. People in small groups,
 * or with no group, are pooled as "Other groups". If that pool is still under
 * MIN_GROUP it could be worked out by subtracting the groups shown from the total,
 * so the smallest shown group joins it. With only one group left there are no cuts.
 */
export function cuts(rows: ImportedRow[], questions: SurveyQuestion[], scale: Scale): { groups: GroupCut[]; pooled: number } {
  const by = new Map<string, ImportedRow[]>();
  const rest: ImportedRow[] = [];
  for (const r of rows) {
    if (!r.group) {
      rest.push(r);
      continue;
    }
    const list = by.get(r.group) ?? [];
    list.push(r);
    by.set(r.group, list);
  }
  const big = [...by.entries()].filter(([, l]) => l.length >= MIN_GROUP).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  for (const [, l] of by.entries()) if (l.length < MIN_GROUP) rest.push(...l);
  let pooledGroups = [...by.values()].filter((l) => l.length < MIN_GROUP).length;
  while (rest.length > 0 && rest.length < MIN_GROUP && big.length) {
    const [, l] = big.pop()!;
    rest.push(...l);
    pooledGroups++;
  }
  const groups: GroupCut[] = big.map(([name, l]) => ({ name, summary: summarise(l, questions, scale) }));
  if (rest.length) groups.push({ name: "Other groups", summary: summarise(rest, questions, scale) });
  if (groups.length < 2) return { groups: [], pooled: 0 };
  return { groups, pooled: pooledGroups };
}

/** Change per area against an earlier round, both read from files. */
export function trend(now: Summary, before: Summary): { dim: string; now: number; before: number; change: number }[] {
  return now.areas.map((a) => {
    const b = before.areas.find((x) => x.dim === a.dim);
    return { dim: a.dim, now: a.avg, before: b?.avg ?? NaN, change: b ? a.avg - b.avg : NaN };
  });
}
