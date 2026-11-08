/**
 * The annual increment cycle, one person at a time, from an employee file.
 *
 *   compa-ratio   = salary ÷ band midpoint (or, without one, ÷ the grade's median salary)
 *   matrix %      = merit matrix cell for the person's rating and compa-ratio zone
 *   proration     = 1 if they joined by the cycle start; months served ÷ 12 if later;
 *                   0 if they joined after the eligibility cut-off
 *   merit %       = matrix % × proration × fit factor (when fitting to the budget)
 *   promotion %   = a separate, extra increase for people marked for promotion
 *   new salary    = salary × (1 + (merit % + promotion %) ÷ 100)
 *
 * Merit and promotion have separate budgets, as most companies run them. The fit
 * factor scales every matrix cell so merit spends exactly the merit budget.
 * Pure functions: the page (src/components/increment/app.ts) reads the file.
 */
export const RATINGS = ["Outstanding", "Exceeds expectations", "Meets expectations", "Below expectations", "Unsatisfactory"] as const;
export const ZONES = ["Below 0.90", "0.90 to 1.10", "Above 1.10"] as const;
export const DEFAULT_MATRIX = [
  [14, 12, 9],
  [11, 9, 7],
  [8, 7, 5],
  [3, 2, 0],
  [0, 0, 0]
];

export type Cell = string | number | boolean | null;
export type ColKey = "id" | "name" | "dept" | "designation" | "grade" | "manager" | "salary" | "rating" | "midpoint" | "max" | "doj" | "promote" | "newDesignation";

const SYN: Record<ColKey, string[]> = {
  id: ["employee id", "emp id", "employee code", "emp code", "employee no", "emp no", "staff id", "ecode", "id", "code"],
  name: ["employee name", "emp name", "full name", "name"],
  dept: ["department", "dept", "function", "division", "team", "business unit"],
  designation: ["designation", "job title", "title", "role", "position"],
  grade: ["grade", "level", "band", "job grade", "pay grade"],
  manager: ["reporting manager", "manager name", "manager", "reports to", "line manager", "supervisor"],
  salary: ["annual ctc", "ctc", "annual salary", "fixed pay", "fixed ctc", "annual fixed", "base salary", "salary", "gross annual", "current ctc"],
  rating: ["final rating", "performance rating", "appraisal rating", "rating", "performance", "score"],
  midpoint: ["band midpoint", "range midpoint", "midpoint", "mid point", "market midpoint", "band mid"],
  max: ["band maximum", "range maximum", "band max", "maximum", "range max"],
  doj: ["date of joining", "doj", "joining date", "date joined", "hire date", "start date"],
  promote: ["promotion", "promote", "promoted", "for promotion", "promotion recommended"],
  newDesignation: ["new designation", "new title", "promoted to", "new role"]
};

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Column index for each field, by exact header first and then by a header that contains the synonym. */
export function detectColumns(header: Cell[]): Partial<Record<ColKey, number>> {
  const heads = header.map(norm);
  const out: Partial<Record<ColKey, number>> = {};
  const used = new Set<number>();
  const order: ColKey[] = ["newDesignation", "midpoint", "max", "rating", "salary", "doj", "manager", "id", "name", "dept", "designation", "grade", "promote"];
  for (const pass of [0, 1]) {
    for (const k of order) {
      if (out[k] !== undefined) continue;
      for (const syn of SYN[k]) {
        const i = heads.findIndex((h, j) => !used.has(j) && (pass === 0 ? h === syn : h.includes(syn)));
        if (i >= 0) {
          out[k] = i;
          used.add(i);
          break;
        }
      }
    }
  }
  return out;
}

export type RatingScale = "five-best" | "one-best";

/** A rating cell as an index into RATINGS (0 = best), or −1 if it can't be read. */
export function parseRating(c: Cell, scale: RatingScale = "five-best"): number {
  if (c === null || c === "") return -1;
  const s = norm(c);
  const n = Number(String(c).trim().split(/[\s/]/)[0]);
  if (Number.isFinite(n) && n >= 1 && n <= 5 && /^\d(\.\d+)?$/.test(String(c).trim().split(/[\s/]/)[0])) {
    const r = Math.round(n);
    return scale === "five-best" ? 5 - r : r - 1;
  }
  if (/outstand|exceptional|far exceed|role model|^a$/.test(s)) return 0;
  if (/exceed|above|strong|^b$/.test(s)) return 1;
  if (/meet|solid|achiev|good|^c$/.test(s)) return 2;
  if (/below|partial|needs|improv|^d$/.test(s)) return 3;
  if (/unsatis|poor|does not|not met|^e$/.test(s)) return 4;
  return -1;
}

export function parseMoney(c: Cell): number {
  if (typeof c === "number") return c;
  const s = String(c ?? "").replace(/[₹,\s]/g, "").replace(/^rs\.?/i, "");
  const m = /^(\d+(?:\.\d+)?)(l|lakh|lakhs|lac|cr|crore)?$/i.exec(s);
  if (!m) return NaN;
  const v = Number(m[1]);
  const u = (m[2] ?? "").toLowerCase();
  return u.startsWith("l") ? v * 100000 : u.startsWith("c") ? v * 10000000 : v;
}

const YES = /^(y|yes|true|1|promote|promoted|recommended)$/i;

/** yyyy-mm-dd from a cell: ISO, dd/mm/yyyy or dd-mm-yyyy. */
export function parseDate(c: Cell): string | null {
  const s = String(c ?? "").trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

export type Person = {
  row: number;
  id: string;
  name: string;
  dept: string;
  designation: string;
  grade: string;
  manager: string;
  salary: number;
  rating: number;
  ratingText: string;
  midpoint: number | null;
  max: number | null;
  doj: string | null;
  promote: boolean;
  newDesignation: string;
};

export function readPeople(table: Cell[][], scale: RatingScale = "five-best"): { people: Person[]; cols: Partial<Record<ColKey, number>>; headerRow: number } {
  const headerRow = table.findIndex((r) => r.some((c) => c !== null && c !== ""));
  const cols = detectColumns(table[headerRow] ?? []);
  const get = (r: Cell[], k: ColKey) => (cols[k] === undefined ? null : (r[cols[k]!] ?? null));
  const text = (r: Cell[], k: ColKey) => String(get(r, k) ?? "").trim();
  const people: Person[] = [];
  table.slice(headerRow + 1).forEach((r, i) => {
    if (!r.some((c) => c !== null && c !== "")) return;
    const mid = parseMoney(get(r, "midpoint"));
    const max = parseMoney(get(r, "max"));
    people.push({
      row: headerRow + i + 2,
      id: text(r, "id"),
      name: text(r, "name"),
      dept: text(r, "dept") || "Not given",
      designation: text(r, "designation"),
      grade: text(r, "grade"),
      manager: text(r, "manager") || "Not given",
      salary: parseMoney(get(r, "salary")),
      rating: parseRating(get(r, "rating"), scale),
      ratingText: text(r, "rating"),
      midpoint: Number.isFinite(mid) && mid > 0 ? mid : null,
      max: Number.isFinite(max) && max > 0 ? max : null,
      doj: parseDate(get(r, "doj")),
      promote: YES.test(text(r, "promote")),
      newDesignation: text(r, "newDesignation")
    });
  });
  return { people, cols, headerRow };
}

export type CycleSettings = {
  /** Merit budget, % of the eligible payroll. */
  budgetPct: number;
  matrix: number[][];
  /** Compa-ratio zone edges, default [0.9, 1.1]. */
  zones?: [number, number];
  /** First day of the new salaries (yyyy-mm-dd). */
  effectiveDate: string;
  /** People who joined after this date get no merit increase this cycle (yyyy-mm-dd). */
  cutoffDate: string;
  /** Prorate merit for people who joined in the 12 months before the effective date. */
  prorate: boolean;
  /** Scale the matrix so merit spends exactly the budget. */
  fit: boolean;
  /** Extra increase for promotions, % of salary. */
  promotionPct: number;
  /** Promotion budget, % of the eligible payroll. */
  promotionBudgetPct: number;
};

export type Outcome = Person & {
  status: "ok" | "excluded";
  reason?: string;
  compa: number | null;
  /** Midpoint came from the grade's median salary, not the file. */
  midFromGrade: boolean;
  zone: number;
  matrixPct: number;
  proration: number;
  meritPct: number;
  promotionPct: number;
  totalPct: number;
  meritCost: number;
  promotionCost: number;
  newSalary: number;
  aboveMax: boolean;
};

export type GroupTotal = { name: string; people: number; payroll: number; meritCost: number; promotionCost: number; avgPct: number };

export type CycleResult = {
  outcomes: Outcome[];
  eligible: number;
  excluded: number;
  payroll: number;
  meritBudget: number;
  meritCostUnscaled: number;
  meritCost: number;
  fitFactor: number;
  promotionBudget: number;
  promotionCost: number;
  promotions: number;
  newPayroll: number;
  byDept: GroupTotal[];
  byManager: GroupTotal[];
  byRating: { rating: string; people: number; avgPct: number }[];
  aboveMax: number;
  midFromGrade: number;
};

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN;
};

function monthsBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  return Math.max(0, (y2 - y1) * 12 + (m2 - m1) + (d2 >= d1 ? 0 : -1));
}

export function runCycle(people: Person[], s: CycleSettings): CycleResult {
  const [lo, hi] = s.zones ?? [0.9, 1.1];
  const gradeMedian = new Map<string, number>();
  const byGrade = new Map<string, number[]>();
  for (const p of people) if (p.grade && p.salary > 0) byGrade.set(p.grade, [...(byGrade.get(p.grade) ?? []), p.salary]);
  for (const [g, list] of byGrade) gradeMedian.set(g, median(list));

  const base: Outcome[] = people.map((p) => {
    const blank = { compa: null, midFromGrade: false, zone: -1, matrixPct: 0, proration: 0, meritPct: 0, promotionPct: 0, totalPct: 0, meritCost: 0, promotionCost: 0, newSalary: p.salary, aboveMax: false };
    if (!(p.salary > 0)) return { ...p, ...blank, status: "excluded", reason: "No salary" };
    if (p.doj && p.doj > s.cutoffDate) return { ...p, ...blank, newSalary: p.salary, status: "excluded", reason: "Joined after the cut-off" };
    if (p.rating < 0 && !p.promote) return { ...p, ...blank, status: "excluded", reason: p.ratingText ? `Rating "${p.ratingText}" not recognised` : "No rating" };
    const mid = p.midpoint ?? (p.grade ? (gradeMedian.get(p.grade) ?? null) : null);
    const compa = mid ? p.salary / mid : null;
    const zone = compa === null ? 1 : compa < lo ? 0 : compa > hi ? 2 : 1;
    const matrixPct = p.rating >= 0 ? (s.matrix[p.rating]?.[zone] ?? 0) : 0;
    let proration = 1;
    if (s.prorate && p.doj) {
      const yearStart = `${Number(s.effectiveDate.slice(0, 4)) - 1}${s.effectiveDate.slice(4)}`;
      if (p.doj > yearStart) proration = Math.min(1, monthsBetween(p.doj, s.effectiveDate) / 12);
    }
    return { ...p, ...blank, status: "ok", compa, midFromGrade: p.midpoint === null && compa !== null, zone, matrixPct, proration };
  });

  const ok = base.filter((o) => o.status === "ok");
  const payroll = ok.reduce((a, o) => a + o.salary, 0);
  const meritBudget = (payroll * s.budgetPct) / 100;
  const meritCostUnscaled = ok.reduce((a, o) => a + (o.salary * o.matrixPct * o.proration) / 100, 0);
  const fitFactor = s.fit && meritCostUnscaled > 0 ? meritBudget / meritCostUnscaled : 1;

  for (const o of ok) {
    o.meritPct = o.matrixPct * o.proration * fitFactor;
    o.promotionPct = o.promote ? s.promotionPct : 0;
    o.totalPct = o.meritPct + o.promotionPct;
    o.meritCost = (o.salary * o.meritPct) / 100;
    o.promotionCost = (o.salary * o.promotionPct) / 100;
    o.newSalary = Math.round(o.salary * (1 + o.totalPct / 100));
    o.aboveMax = o.max !== null && o.newSalary > o.max;
  }

  const group = (key: (o: Outcome) => string): GroupTotal[] => {
    const m = new Map<string, Outcome[]>();
    for (const o of ok) m.set(key(o), [...(m.get(key(o)) ?? []), o]);
    return [...m.entries()]
      .map(([name, list]) => {
        const pay = list.reduce((a, o) => a + o.salary, 0);
        const mc = list.reduce((a, o) => a + o.meritCost, 0);
        const pc = list.reduce((a, o) => a + o.promotionCost, 0);
        return { name, people: list.length, payroll: pay, meritCost: mc, promotionCost: pc, avgPct: pay > 0 ? ((mc + pc) / pay) * 100 : 0 };
      })
      .sort((a, b) => b.payroll - a.payroll);
  };

  const meritCost = ok.reduce((a, o) => a + o.meritCost, 0);
  const promotionCost = ok.reduce((a, o) => a + o.promotionCost, 0);
  return {
    outcomes: base,
    eligible: ok.length,
    excluded: base.length - ok.length,
    payroll,
    meritBudget,
    meritCostUnscaled,
    meritCost,
    fitFactor,
    promotionBudget: (payroll * s.promotionBudgetPct) / 100,
    promotionCost,
    promotions: ok.filter((o) => o.promote).length,
    newPayroll: ok.reduce((a, o) => a + o.newSalary, 0),
    byDept: group((o) => o.dept),
    byManager: group((o) => o.manager),
    byRating: RATINGS.map((rating, r) => {
      const list = ok.filter((o) => o.rating === r);
      const pay = list.reduce((a, o) => a + o.salary, 0);
      return { rating, people: list.length, avgPct: pay > 0 ? (list.reduce((a, o) => a + o.meritCost, 0) / pay) * 100 : 0 };
    }),
    aboveMax: ok.filter((o) => o.aboveMax).length,
    midFromGrade: ok.filter((o) => o.midFromGrade).length
  };
}

/** Rows for the mail merge's salary revision letter: headers are that letter's field labels, so the merge maps them itself. */
export function revisionLetterRows(r: CycleResult, effectiveDate: string): string[][] {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
  const [y, m, d] = effectiveDate.split("-");
  const date = `${d}/${m}/${y}`;
  const header = ["Employee's full name", "Employee ID", "Current designation", "New designation", "Revised salary applies from", "Fixed pay before (a year)", "Revised fixed pay (a year)", "Total CTC before (a year)", "Revised total CTC (a year)", "Increase in total CTC"];
  const rows = r.outcomes
    .filter((o) => o.status === "ok" && o.totalPct > 0)
    .map((o) => [o.name, o.id, o.designation, o.promote ? o.newDesignation : "", date, fmt(o.salary), fmt(o.newSalary), fmt(o.salary), fmt(o.newSalary), `${(Math.round(o.totalPct * 10) / 10).toFixed(1)}%`]);
  return [header, ...rows];
}
