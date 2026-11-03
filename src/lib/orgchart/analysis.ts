/**
 * Structure figures for the org chart: levels, span of control, managers and
 * individual contributors, managers with one report, single points of
 * failure, and department and location breakdowns.
 *
 * The span thresholds are the user's assumptions, not a standard: there is
 * no single right span of control.
 */
import type { Org } from "./hierarchy.ts";

export type Settings = {
  /** Flag managers with fewer direct reports than this. */
  narrowBelow: number;
  /** Flag managers with more direct reports than this. */
  wideAbove: number;
  /** Flag the only manager in a department when at least this many people in the department sit under them. */
  spofMin: number;
};
export const DEFAULT_SETTINGS: Settings = { narrowBelow: 3, wideAbove: 10, spofMin: 5 };
export const NOT_RECORDED = "Not recorded";

/** Whole numbers in a sensible range; the wide limit can't be below the narrow one. */
export function cleanSettings(s: Partial<Settings>): Settings {
  const whole = (v: unknown, d: number, lo: number, hi: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) && v !== "" && v !== null ? Math.min(hi, Math.max(lo, n)) : d;
  };
  const narrowBelow = whole(s.narrowBelow, DEFAULT_SETTINGS.narrowBelow, 1, 50);
  const wideAbove = Math.max(narrowBelow, whole(s.wideAbove, DEFAULT_SETTINGS.wideAbove, 1, 500));
  return { narrowBelow, wideAbove, spofMin: whole(s.spofMin, DEFAULT_SETTINGS.spofMin, 1, 10_000) };
}

export type SpanFlag = "narrow" | "wide" | null;
export type SpanRow = { i: number; reports: number; below: number; flag: SpanFlag };
export type GroupRow = {
  name: string;
  people: number;
  managers: number;
  ics: number;
  /** Share of everyone in the file, in %. */
  share: number;
  /** People whose manager is in a different group (another location, another department). */
  managerElsewhere: number;
};
export type Spof = { i: number; dept: string; inLine: number; deptPeople: number };

export type Analysis = {
  people: number;
  /** Levels from the top of a tree to the deepest person. */
  levels: number;
  /** People at each level, top first. */
  perLevel: number[];
  /** Trees in the chart (more than one when people have no manager or a manager who isn't in the file). */
  tops: number;
  managers: number;
  ics: number;
  /** Individual contributors per manager. */
  icsPerManager: number | null;
  span: { median: number | null; mean: number | null; widest: SpanRow | null; rows: SpanRow[]; narrow: number; wide: number };
  oneReport: { i: number; report: number }[];
  spof: Spof[];
  departments: GroupRow[];
  locations: GroupRow[];
};

export function spanFlag(reports: number, s: Settings): SpanFlag {
  if (reports < s.narrowBelow) return "narrow";
  if (reports > s.wideAbove) return "wide";
  return null;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function analyse(org: Org, settings: Settings): Analysis {
  const s = cleanSettings(settings);
  const n = org.people.length;
  const levels = n ? Math.max(...org.level) : 0;
  const perLevel = new Array<number>(levels).fill(0);
  for (const l of org.level) if (l > 0) perLevel[l - 1]++;

  const rows: SpanRow[] = [];
  org.children.forEach((kids, i) => {
    if (kids.length) rows.push({ i, reports: kids.length, below: org.below[i], flag: spanFlag(kids.length, s) });
  });
  rows.sort((a, b) => b.reports - a.reports || b.below - a.below || a.i - b.i);
  const counts = rows.map((r) => r.reports);
  const managers = rows.length;
  const ics = n - managers;

  const oneReport = rows.filter((r) => r.reports === 1).map((r) => ({ i: r.i, report: org.children[r.i][0] }));

  // Single points of failure: the only person in a department who manages anyone,
  // with at least `spofMin` people of that department in their reporting line.
  const dept = (i: number) => org.people[i].dept;
  const byDept = new Map<string, number[]>();
  org.people.forEach((p, i) => {
    if (p.dept) byDept.set(p.dept.toLowerCase(), [...(byDept.get(p.dept.toLowerCase()) ?? []), i]);
  });
  const spof: Spof[] = [];
  for (const members of byDept.values()) {
    const deptManagers = members.filter((i) => org.children[i].length > 0);
    if (deptManagers.length !== 1) continue;
    const m = deptManagers[0];
    const key = dept(m).toLowerCase();
    let inLine = 0;
    const stack = [...org.children[m]];
    while (stack.length) {
      const i = stack.pop()!;
      if (dept(i).toLowerCase() === key) inLine++;
      stack.push(...org.children[i]);
    }
    if (inLine >= s.spofMin) spof.push({ i: m, dept: dept(m), inLine, deptPeople: members.length });
  }
  spof.sort((a, b) => b.inLine - a.inLine || a.i - b.i);

  const groups = (key: "dept" | "location"): GroupRow[] => {
    const map = new Map<string, GroupRow>();
    org.people.forEach((p, i) => {
      const raw = p[key];
      const k = raw ? raw.toLowerCase() : "";
      let g = map.get(k);
      if (!g) {
        g = { name: raw || NOT_RECORDED, people: 0, managers: 0, ics: 0, share: 0, managerElsewhere: 0 };
        map.set(k, g);
      }
      g.people++;
      if (org.children[i].length) g.managers++;
      else g.ics++;
      const boss = org.parent[i];
      if (boss !== null && raw && org.people[boss][key] && org.people[boss][key].toLowerCase() !== k) g.managerElsewhere++;
    });
    const list = [...map.values()];
    for (const g of list) g.share = n ? (g.people / n) * 100 : 0;
    return list.sort((a, b) => (a.name === NOT_RECORDED ? 1 : b.name === NOT_RECORDED ? -1 : b.people - a.people || a.name.localeCompare(b.name)));
  };

  return {
    people: n,
    levels,
    perLevel,
    tops: org.roots.length,
    managers,
    ics,
    icsPerManager: managers ? ics / managers : null,
    span: {
      median: median(counts),
      mean: counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : null,
      widest: rows[0] ?? null,
      rows,
      narrow: rows.filter((r) => r.flag === "narrow").length,
      wide: rows.filter((r) => r.flag === "wide").length
    },
    oneReport,
    spof,
    departments: groups("dept"),
    locations: groups("location")
  };
}
