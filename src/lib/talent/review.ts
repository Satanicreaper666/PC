/**
 * Talent review from an employee file: the nine-box for everyone at once, with the
 * checks a calibration meeting needs.
 *
 * - Placement: performance (rating) × potential, each low / moderate / high
 *   (5-point scales: 1–2 low, 3 moderate, 4–5 high).
 * - Distribution: share in each box, against a guide range for the top and bottom boxes.
 * - Calibration by manager: each manager's average performance level against the
 *   company's, flagged when a team of five or more sits half a level or more away.
 * - Fairness: women's share of the top row (high potential) and of high performance,
 *   against their share of everyone reviewed; flagged at 10 points or more lower.
 * - Succession: the people in the top-right boxes, with role, manager and tenure.
 *
 * Pure functions; the page is src/components/talent/app.ts.
 */
import { BOXES, boxFor, parseLevel, type Level } from "../calc/nine-box-talent-mapper.ts";

export type Cell = string | number | boolean | null;
type Key = "id" | "name" | "dept" | "designation" | "manager" | "gender" | "doj" | "performance" | "potential" | "critical" | "risk";

const SYN: Record<Key, string[]> = {
  id: ["employee id", "emp id", "employee code", "emp code", "staff id", "id", "code"],
  name: ["employee name", "full name", "name"],
  dept: ["department", "dept", "function", "division", "team"],
  designation: ["designation", "job title", "title", "role", "position"],
  manager: ["reporting manager", "manager name", "manager", "reports to", "line manager"],
  gender: ["gender", "sex"],
  doj: ["date of joining", "doj", "joining date", "hire date", "start date"],
  performance: ["performance rating", "final rating", "performance", "rating", "appraisal rating"],
  potential: ["potential rating", "potential"],
  critical: ["critical role", "key role", "critical"],
  risk: ["flight risk", "risk of leaving", "attrition risk", "retention risk"]
};

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function detect(header: Cell[]): Partial<Record<Key, number>> {
  const heads = header.map(norm);
  const out: Partial<Record<Key, number>> = {};
  const used = new Set<number>();
  const order: Key[] = ["potential", "performance", "risk", "critical", "manager", "doj", "id", "name", "dept", "designation", "gender"];
  for (const exact of [true, false])
    for (const k of order) {
      if (out[k] !== undefined) continue;
      for (const syn of SYN[k]) {
        const i = heads.findIndex((h, j) => !used.has(j) && (exact ? h === syn : h.includes(syn)));
        if (i >= 0) {
          out[k] = i;
          used.add(i);
          break;
        }
      }
    }
  return out;
}

export type Gender = "woman" | "man" | "other" | "unknown";
const genderOf = (s: string): Gender => {
  const t = norm(s);
  if (/^(f|female|woman|women)$/.test(t)) return "woman";
  if (/^(m|male|man|men)$/.test(t)) return "man";
  if (!t) return "unknown";
  return "other";
};

export type TalentPerson = {
  row: number;
  id: string;
  name: string;
  dept: string;
  designation: string;
  manager: string;
  gender: Gender;
  doj: string | null;
  performance: Level | null;
  potential: Level | null;
  critical: boolean;
  risk: string;
};

/** Level from a cell on a 3- or 5-point scale, or words ("high", "exceeds expectations"). */
export function levelOf(c: Cell, scale: 3 | 5): Level | null {
  const s = String(c ?? "").trim();
  if (!s) return null;
  const direct = parseLevel(s, scale);
  if (direct) return direct;
  const t = norm(s);
  if (/outstand|exceed|exceptional|high|strong|top/.test(t)) return 3;
  if (/meet|solid|moderate|medium|average/.test(t)) return 2;
  if (/below|low|needs|unsatis|poor/.test(t)) return 1;
  const n = Number(s);
  if (Number.isInteger(n) && n >= 1 && n <= 5) return n <= 2 ? 1 : n === 3 ? 2 : 3;
  return null;
}

const parseDate = (c: Cell): string | null => {
  const s = String(c ?? "").trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
};

export function readTalent(table: Cell[][], perfScale: 3 | 5 = 5, potScale: 3 | 5 = 3): { people: TalentPerson[]; cols: Partial<Record<Key, number>> } {
  const h = table.findIndex((r) => r.some((c) => c !== null && c !== ""));
  const cols = detect(table[h] ?? []);
  const get = (r: Cell[], k: Key) => (cols[k] === undefined ? null : (r[cols[k]!] ?? null));
  const text = (r: Cell[], k: Key) => String(get(r, k) ?? "").trim();
  const people = table
    .slice(h + 1)
    .map((r, i): TalentPerson | null =>
      r.some((c) => c !== null && c !== "")
        ? {
            row: h + i + 2,
            id: text(r, "id"),
            name: text(r, "name") || text(r, "id") || `Row ${h + i + 2}`,
            dept: text(r, "dept") || "Not given",
            designation: text(r, "designation"),
            manager: text(r, "manager") || "Not given",
            gender: genderOf(text(r, "gender")),
            doj: parseDate(get(r, "doj")),
            performance: levelOf(get(r, "performance"), perfScale),
            potential: levelOf(get(r, "potential"), potScale),
            critical: /^(y|yes|true|1|critical)$/i.test(text(r, "critical")),
            risk: text(r, "risk")
          }
        : null
    )
    .filter((p): p is TalentPerson => p !== null);
  return { people, cols };
}

export const MIN_GROUP = 5;

/** Guide ranges many companies use for a healthy distribution (share of people). */
export const GUIDE = { topRight: [0.05, 0.15] as [number, number], bottomLeft: [0, 0.1] as [number, number] };

export type ManagerCheck = { manager: string; people: number; avgPerformance: number; highShare: number; diff: number; flag: "high" | "low" | null };
export type FairnessCheck = { group: string; women: number; total: number; share: number; overall: number; gap: number; flag: boolean };

export type Review = {
  placed: number;
  missing: TalentPerson[];
  boxes: { title: string; performance: Level; potential: Level; people: TalentPerson[]; share: number; action: string }[];
  avgPerformance: number;
  managers: ManagerCheck[];
  fairness: FairnessCheck[];
  womenOverall: number | null;
  succession: TalentPerson[];
  atRiskTalent: TalentPerson[];
  criticalWithoutSuccessor: string[];
  tenureByRow: { potential: Level; years: number | null }[];
};

const yearsSince = (d: string, asOf: string) => (Date.parse(asOf) - Date.parse(d)) / (365.25 * 864e5);

export function review(people: TalentPerson[], asOf = "2026-11-08"): Review {
  const placed = people.filter((p) => p.performance && p.potential);
  const missing = people.filter((p) => !(p.performance && p.potential));
  const n = placed.length;
  const boxes = BOXES.map((b) => {
    const list = placed.filter((p) => p.performance === b.performance && p.potential === b.potential).sort((x, y) => x.name.localeCompare(y.name));
    return { title: b.title, performance: b.performance, potential: b.potential, people: list, share: n ? list.length / n : 0, action: b.action };
  });
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, v) => a + v, 0) / xs.length : NaN);
  const avgPerformance = avg(placed.map((p) => p.performance!));

  const byMgr = new Map<string, TalentPerson[]>();
  for (const p of placed) byMgr.set(p.manager, [...(byMgr.get(p.manager) ?? []), p]);
  const managers: ManagerCheck[] = [...byMgr.entries()]
    .map(([manager, list]) => {
      const a = avg(list.map((p) => p.performance!));
      const diff = a - avgPerformance;
      return {
        manager,
        people: list.length,
        avgPerformance: a,
        highShare: list.filter((p) => p.performance === 3).length / list.length,
        diff,
        flag: list.length >= MIN_GROUP && Math.abs(diff) >= 0.5 ? (diff > 0 ? ("high" as const) : ("low" as const)) : null
      };
    })
    .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));

  const known = placed.filter((p) => p.gender === "woman" || p.gender === "man");
  const womenOverall = known.length >= MIN_GROUP ? known.filter((p) => p.gender === "woman").length / known.length : null;
  const fair = (group: string, list: TalentPerson[]): FairnessCheck => {
    const k = list.filter((p) => p.gender === "woman" || p.gender === "man");
    const w = k.filter((p) => p.gender === "woman").length;
    const share = k.length ? w / k.length : 0;
    const gap = womenOverall === null ? 0 : share - womenOverall;
    return { group, women: w, total: k.length, share, overall: womenOverall ?? 0, gap, flag: womenOverall !== null && k.length >= MIN_GROUP && gap <= -0.1 };
  };
  const fairness =
    womenOverall === null
      ? []
      : [fair("High potential (top row)", placed.filter((p) => p.potential === 3)), fair("High performance (right column)", placed.filter((p) => p.performance === 3)), fair("Future leaders (top right)", placed.filter((p) => p.potential === 3 && p.performance === 3))];

  const succession = placed.filter((p) => (p.potential === 3 && p.performance! >= 2) || (p.potential === 2 && p.performance === 3)).sort((x, y) => y.potential! + y.performance! - (x.potential! + x.performance!));
  const atRiskTalent = succession.filter((p) => /high|yes|likely/i.test(p.risk));
  const critical = people.filter((p) => p.critical);
  const criticalWithoutSuccessor = [
    ...new Set(critical.filter((c) => !succession.some((s) => s.id !== c.id && s.dept === c.dept)).map((c) => `${c.designation || c.name} (${c.dept})`))
  ];
  const tenureByRow = ([3, 2, 1] as Level[]).map((pot) => {
    const ys = placed.filter((p) => p.potential === pot && p.doj).map((p) => yearsSince(p.doj!, asOf));
    return { potential: pot, years: ys.length >= MIN_GROUP ? avg(ys) : null };
  });
  return { placed: n, missing, boxes, avgPerformance, managers, fairness, womenOverall, succession, atRiskTalent, criticalWithoutSuccessor, tenureByRow };
}

export { boxFor };
