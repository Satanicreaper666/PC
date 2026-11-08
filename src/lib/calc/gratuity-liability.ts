/**
 * Gratuity liability for everyone on the rolls at a date: the year-end figure finance
 * asks for, worked out as if each person left on that date.
 *
 *   accrued = wages × 15 ÷ 26 × years counted (part-year over six months counts),
 *             capped at the gratuity ceiling
 *   vested  = accrued for people past the minimum service (5 years; 1 for fixed-term)
 *
 * Undiscounted, with no salary growth or attrition: an actuarial valuation (Ind AS 19
 * or AS 15) will give a different, usually lower, figure. Pure functions; tested.
 */
import { gratuityRules, roundRupee, serviceLength, yearsForAmount } from "./gratuity.ts";

export type Cell = string | number | boolean | null;
export type LiabilityPerson = { row: number; id: string; name: string; dept: string; doj: string | null; wages: number; fixedTerm: boolean; left: boolean };
export type LiabilityRow = LiabilityPerson & { years: number; counted: number; accrued: number; vested: boolean; capped: boolean; excluded?: string };

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function parseDate(c: Cell): string | null {
  const s = String(c ?? "").trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
}
const money = (c: Cell) => (typeof c === "number" ? c : Number(String(c ?? "").replace(/[₹,\s]/g, "")));

export function readLiability(table: Cell[][]): { people: LiabilityPerson[]; found: Record<string, number> } {
  const h = table.findIndex((r) => r.some((c) => c !== null && c !== ""));
  const heads = (table[h] ?? []).map(norm);
  const find = (syns: string[]) => {
    for (const exact of [true, false])
      for (const s of syns) {
        const i = heads.findIndex((x) => (exact ? x === s : x.includes(s)));
        if (i >= 0) return i;
      }
    return -1;
  };
  const found = {
    id: find(["employee id", "emp id", "employee code", "emp code", "id", "code"]),
    name: find(["employee name", "full name", "name"]),
    dept: find(["department", "dept", "function", "division"]),
    doj: find(["date of joining", "doj", "joining date", "hire date", "start date"]),
    wages: find(["gratuity wages", "basic da", "basic and da", "basic pay", "basic", "wages"]),
    type: find(["employment type", "contract type", "type"]),
    lwd: find(["last working day", "date of exit", "exit date", "lwd", "date of leaving"])
  };
  const get = (r: Cell[], i: number) => (i >= 0 ? (r[i] ?? null) : null);
  const people = table
    .slice(h + 1)
    .filter((r) => r.some((c) => c !== null && c !== ""))
    .map((r, i) => ({
      row: h + i + 2,
      id: String(get(r, found.id) ?? "").trim(),
      name: String(get(r, found.name) ?? "").trim(),
      dept: String(get(r, found.dept) ?? "").trim() || "Not given",
      doj: parseDate(get(r, found.doj)),
      wages: money(get(r, found.wages)),
      fixedTerm: /fixed/i.test(String(get(r, found.type) ?? "")),
      left: !!parseDate(get(r, found.lwd))
    }));
  return { people, found };
}

export type Liability = { rows: LiabilityRow[]; counted: number; total: number; vested: number; vestedPeople: number; capped: number; byDept: { dept: string; people: number; total: number; vested: number }[] };

export function computeLiability(people: LiabilityPerson[], asOf: string): Liability {
  const g = gratuityRules();
  const rows: LiabilityRow[] = people.map((p) => {
    const base = { ...p, years: 0, counted: 0, accrued: 0, vested: false, capped: false };
    if (p.left) return { ...base, excluded: "Has left" };
    if (!p.doj || p.doj > asOf) return { ...base, excluded: p.doj ? "Joins after the date" : "No date of joining" };
    if (!(p.wages > 0)) return { ...base, excluded: "No wages" };
    const s = serviceLength(p.doj, asOf);
    const counted = yearsForAmount(s, g.partYearMonths);
    const raw = ((p.wages * g.daysPerYear) / g.divisor) * counted;
    const accrued = roundRupee(Math.min(raw, g.ceiling));
    const minYears = p.fixedTerm ? g.fixedTermMinYears : g.minYears;
    return { ...base, years: s.years + s.months / 12 + s.days / 365, counted, accrued, vested: s.years >= minYears, capped: raw > g.ceiling };
  });
  const ok = rows.filter((r) => !r.excluded);
  const by = new Map<string, LiabilityRow[]>();
  for (const r of ok) by.set(r.dept, [...(by.get(r.dept) ?? []), r]);
  return {
    rows,
    counted: ok.length,
    total: ok.reduce((a, r) => a + r.accrued, 0),
    vested: ok.filter((r) => r.vested).reduce((a, r) => a + r.accrued, 0),
    vestedPeople: ok.filter((r) => r.vested).length,
    capped: ok.filter((r) => r.capped).length,
    byDept: [...by.entries()]
      .map(([dept, list]) => ({ dept, people: list.length, total: list.reduce((a, r) => a + r.accrued, 0), vested: list.filter((r) => r.vested).reduce((a, r) => a + r.accrued, 0) }))
      .sort((a, b) => b.total - a.total)
  };
}
