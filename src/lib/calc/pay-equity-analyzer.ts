/**
 * Pay equity analyser: gender pay gaps from rows of role, gender and pay.
 *
 *   Unadjusted gap (mean)   = (men's average − women's average) ÷ men's average × 100
 *   Unadjusted gap (median) = the same with medians
 *   Like-for-like gap       = Σ roles [women in role × (men's average − women's average)]
 *                             ÷ Σ roles [women in role × men's average] × 100
 *     i.e. compare each woman's pay with the average for men in the same role, and add up.
 *     Only roles with at least one woman and one man count.
 *
 * A positive gap means women are paid less on average; negative means more.
 * People of another gender or with gender not stated are counted but not in
 * the two-group gap, which is how the gap is defined.
 *
 * Nothing here sends data anywhere; the page keeps rows in the browser.
 */

export type Gender = "woman" | "man" | "other";
export type PayRow = { role: string; gender: Gender; pay: number };

/** Groups with fewer women or men than this are flagged as too small to read on their own. */
export const MIN_GROUP = 5;

export const GENDER_LABEL: Record<Gender, string> = { woman: "Woman", man: "Man", other: "Another gender or not stated" };

export function normaliseGender(raw: string): Gender {
  const s = raw.trim().toLowerCase().replace(/\.$/, "");
  if (["f", "w", "female", "woman", "women", "girl", "lady"].includes(s)) return "woman";
  if (["m", "male", "man", "men", "boy", "gentleman"].includes(s)) return "man";
  return "other";
}

/**
 * Read a pay amount: "12,50,000", "₹12,50,000", "Rs. 1250000", "12.5 L", "12.5 lakh", "1.2 Cr", "850k".
 * Returns null when it isn't a positive amount.
 */
export function parsePay(raw: string): number | null {
  let s = raw.trim().toLowerCase().replace(/₹|rs\.?|inr|\s/g, "").replace(/,/g, "");
  let mult = 1;
  const suffix = s.match(/(lakhs?|lacs?|l|crores?|cr|k)$/);
  if (suffix) {
    const u = suffix[1];
    mult = u.startsWith("c") ? 1e7 : u === "k" ? 1e3 : 1e5;
    s = s.slice(0, -u.length);
  }
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s) * mult;
  return n > 0 ? Math.round(n) : null;
}

export function cleanRole(s: string) {
  return s.replace(/\s+/g, " ").trim().slice(0, 80);
}

export type ParseOutcome = { rows: PayRow[]; errors: { line: number; text: string; message: string }[] };

/**
 * Parse pasted rows: role, gender, annual pay. Tabs (from a spreadsheet), commas or
 * semicolons. A first row that looks like a header is skipped. Extra columns are ignored.
 */
export function parseRows(text: string): ParseOutcome {
  const out: ParseOutcome = { rows: [], errors: [] };
  text.split(/\r?\n/).forEach((line, idx) => {
    if (!line.trim()) return;
    const cells = splitRow(line);
    const lineNo = idx + 1;
    if (out.rows.length === 0 && out.errors.length === 0 && /role|designation|title|grade|level/i.test(cells[0] ?? "") && /gender|sex/i.test(cells[1] ?? "")) return;
    if (cells.length < 3) {
      out.errors.push({ line: lineNo, text: line, message: "Needs three columns: role, gender, annual pay." });
      return;
    }
    const role = cleanRole(cells[0]);
    const pay = parsePay(cells[2]);
    if (!role) out.errors.push({ line: lineNo, text: line, message: "The role is empty." });
    else if (pay === null) out.errors.push({ line: lineNo, text: line, message: `Pay "${cells[2]}" isn't an amount we can read.` });
    else out.rows.push({ role, gender: normaliseGender(cells[1]), pay });
  });
  return out;
}

export function splitRow(line: string): string[] {
  const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
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

export function mean(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}
export function median(xs: number[]) {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
/** (men − women) ÷ men × 100, or null when either side is missing. */
export function gapPct(men: number, women: number) {
  return Number.isFinite(men) && Number.isFinite(women) && men > 0 ? ((men - women) / men) * 100 : null;
}

export type RoleRow = {
  role: string;
  women: number;
  men: number;
  other: number;
  meanWomen: number | null;
  meanMen: number | null;
  gap: number | null;
  comparable: boolean;
  small: boolean;
};

export type Quartile = { label: string; women: number; men: number; shareWomen: number | null };

export type Analysis = {
  counts: { women: number; men: number; other: number; total: number };
  overall: { meanWomen: number | null; meanMen: number | null; medianWomen: number | null; medianMen: number | null; gapMean: number | null; gapMedian: number | null };
  likeForLike: { gap: number | null; roles: number; women: number; men: number; womenNotCompared: number; inSmallGroups: number };
  /** Like-for-like using only roles with at least MIN_GROUP women and MIN_GROUP men. */
  likeForLikeLarge: { gap: number | null; roles: number };
  roles: RoleRow[];
  quartiles: Quartile[];
};

const QUARTILE_LABELS = ["Lowest-paid quarter", "Lower-middle quarter", "Upper-middle quarter", "Highest-paid quarter"];

export function analyse(rows: PayRow[], minGroup = MIN_GROUP): Analysis {
  const women = rows.filter((r) => r.gender === "woman").map((r) => r.pay);
  const men = rows.filter((r) => r.gender === "man").map((r) => r.pay);
  const other = rows.filter((r) => r.gender === "other").length;
  const nn = (x: number) => (Number.isFinite(x) ? x : null);

  // Group by role, case-insensitively, keeping the first spelling seen.
  const groups = new Map<string, { role: string; w: number[]; m: number[]; o: number }>();
  for (const r of rows) {
    const key = r.role.toLowerCase();
    if (!groups.has(key)) groups.set(key, { role: r.role, w: [], m: [], o: 0 });
    const g = groups.get(key)!;
    if (r.gender === "woman") g.w.push(r.pay);
    else if (r.gender === "man") g.m.push(r.pay);
    else g.o += 1;
  }

  const roles: RoleRow[] = [...groups.values()]
    .map((g) => {
      const mw = mean(g.w);
      const mm = mean(g.m);
      const comparable = g.w.length > 0 && g.m.length > 0;
      return {
        role: g.role,
        women: g.w.length,
        men: g.m.length,
        other: g.o,
        meanWomen: nn(mw),
        meanMen: nn(mm),
        gap: comparable ? gapPct(mm, mw) : null,
        comparable,
        small: g.w.length < minGroup || g.m.length < minGroup
      };
    })
    .sort((a, b) => b.women + b.men + b.other - (a.women + a.men + a.other) || a.role.localeCompare(b.role));

  const lfl = (subset: RoleRow[]) => {
    let num = 0;
    let den = 0;
    for (const r of subset) {
      num += r.women * ((r.meanMen ?? 0) - (r.meanWomen ?? 0));
      den += r.women * (r.meanMen ?? 0);
    }
    return den > 0 ? (num / den) * 100 : null;
  };
  const comparable = roles.filter((r) => r.comparable);
  const large = comparable.filter((r) => !r.small);

  return {
    counts: { women: women.length, men: men.length, other, total: rows.length },
    overall: {
      meanWomen: nn(mean(women)),
      meanMen: nn(mean(men)),
      medianWomen: nn(median(women)),
      medianMen: nn(median(men)),
      gapMean: gapPct(mean(men), mean(women)),
      gapMedian: gapPct(median(men), median(women))
    },
    likeForLike: {
      gap: lfl(comparable),
      roles: comparable.length,
      women: comparable.reduce((a, r) => a + r.women, 0),
      men: comparable.reduce((a, r) => a + r.men, 0),
      womenNotCompared: women.length - comparable.reduce((a, r) => a + r.women, 0),
      inSmallGroups: comparable.filter((r) => r.small).reduce((a, r) => a + r.women + r.men, 0)
    },
    likeForLikeLarge: { gap: lfl(large), roles: large.length },
    roles,
    quartiles: quartiles(rows)
  };
}

/**
 * Women's share in each pay quarter (women and men only), ranking everyone by pay
 * and cutting the list into four groups as equal as possible.
 */
export function quartiles(rows: PayRow[]): Quartile[] {
  const people = rows.filter((r) => r.gender !== "other").sort((a, b) => a.pay - b.pay);
  const n = people.length;
  if (n < 4) return [];
  const cuts = [0, Math.round(n / 4), Math.round(n / 2), Math.round((3 * n) / 4), n];
  return QUARTILE_LABELS.map((label, q) => {
    const slice = people.slice(cuts[q], cuts[q + 1]);
    const w = slice.filter((r) => r.gender === "woman").length;
    return { label, women: w, men: slice.length - w, shareWomen: slice.length ? (w / slice.length) * 100 : null };
  });
}

/** CSV for download; guards cells a spreadsheet would read as formulas. */
export function toCsv(rows: PayRow[]): string {
  const esc = (s: string) => {
    const v = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  return ["Role,Gender,Annual pay", ...rows.map((r) => [esc(r.role), GENDER_LABEL[r.gender], String(r.pay)].join(","))].join("\n");
}

/** Example data for "Load an example": a fictional 44-person company. */
export const EXAMPLE_ROWS: PayRow[] = [
  ...[360000, 372000, 380000, 395000, 410000, 420000].map((pay) => ({ role: "Customer support associate", gender: "woman" as Gender, pay })),
  ...[365000, 375000, 385000, 400000, 430000].map((pay) => ({ role: "Customer support associate", gender: "man" as Gender, pay })),
  ...[520000, 560000, 610000].map((pay) => ({ role: "Sales executive", gender: "woman" as Gender, pay })),
  ...[540000, 580000, 600000, 650000, 700000].map((pay) => ({ role: "Sales executive", gender: "man" as Gender, pay })),
  ...[900000, 980000, 1050000, 1150000].map((pay) => ({ role: "Software engineer", gender: "woman" as Gender, pay })),
  ...[920000, 1000000, 1060000, 1100000, 1160000, 1200000, 1250000, 1300000].map((pay) => ({ role: "Software engineer", gender: "man" as Gender, pay })),
  { role: "Software engineer", gender: "other", pay: 1080000 },
  ...[1650000, 1800000].map((pay) => ({ role: "Senior software engineer", gender: "woman" as Gender, pay })),
  ...[1600000, 1750000, 1850000, 1900000, 2000000, 2150000].map((pay) => ({ role: "Senior software engineer", gender: "man" as Gender, pay })),
  { role: "Engineering manager", gender: "woman", pay: 3000000 },
  ...[2900000, 3200000, 3400000].map((pay) => ({ role: "Engineering manager", gender: "man" as Gender, pay }))
];
