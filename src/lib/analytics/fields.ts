/**
 * The columns the people-analytics tool understands, how it recognises them
 * in an uploaded file, and how it reads gender, status and salary values.
 */
import { detectDateOrder, parseDate, type DateOrder } from "./dates.ts";

/** One spreadsheet cell after reading: text, a number, or empty. */
export type Cell = string | number | boolean | null;

export const FIELD_KEYS = ["id", "name", "dept", "designation", "grade", "gender", "doj", "doe", "status", "location", "manager", "salary", "dob"] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];
/** Field → column index in the file. */
export type ColumnMap = Partial<Record<FieldKey, number>>;

export type FieldDef = {
  key: FieldKey;
  label: string;
  /** What the tool uses it for, shown in the mapping step. */
  use: string;
  kind: "text" | "date" | "money";
  required?: boolean;
  synonyms: string[];
};

export const FIELDS: FieldDef[] = [
  {
    key: "doj",
    label: "Date of joining",
    use: "Headcount over time, joiners and tenure.",
    kind: "date",
    required: true,
    synonyms: ["date of joining", "doj", "joining date", "date joined", "join date", "joined on", "date of hire", "hire date", "hiring date", "start date", "joining"]
  },
  {
    key: "doe",
    label: "Last working day",
    use: "Leavers and attrition. Leave it blank for people still working.",
    kind: "date",
    synonyms: ["last working day", "last working date", "lwd", "date of exit", "exit date", "date of leaving", "dol", "leaving date", "date of relieving", "relieving date", "date of separation", "separation date", "termination date", "=end date"]
  },
  {
    key: "status",
    label: "Status",
    use: "Cross-checks the last working day (for example, active or resigned).",
    kind: "text",
    synonyms: ["employee status", "employment status", "emp status", "status", "active status", "active inactive"]
  },
  {
    key: "id",
    label: "Employee ID",
    use: "Spots duplicates and links people to their manager.",
    kind: "text",
    synonyms: ["employee id", "emp id", "employee code", "emp code", "employee no", "emp no", "employee number", "staff id", "staff code", "ecode", "personnel number", "=id", "=code", "=emp"]
  },
  {
    key: "name",
    label: "Name",
    use: "Only shown to you, in the data checks and manager lists.",
    kind: "text",
    synonyms: ["employee name", "emp name", "name", "full name", "employee full name", "associate name", "staff name"]
  },
  {
    key: "dept",
    label: "Department",
    use: "Department filter and attrition by department.",
    kind: "text",
    synonyms: ["department", "dept", "department name", "=function", "division", "business unit", "=bu", "vertical", "=team"]
  },
  {
    key: "location",
    label: "Location",
    use: "Location filter.",
    kind: "text",
    synonyms: ["location", "work location", "base location", "office location", "=office", "=city", "branch", "=site", "work city"]
  },
  {
    key: "gender",
    label: "Gender",
    use: "Gender ratio and the gender filter.",
    kind: "text",
    synonyms: ["gender", "=sex"]
  },
  {
    key: "manager",
    label: "Reporting manager",
    use: "Span of control. A manager's employee ID works best; a name also works.",
    kind: "text",
    synonyms: [
      "reporting manager id", "reporting manager code", "manager id", "manager code", "manager emp code", "reporting manager emp code", "reporting manager",
      "reporting manager name", "reports to", "reporting to", "=manager", "manager name", "line manager", "=supervisor", "=rm", "l1 manager"
    ]
  },
  {
    key: "salary",
    label: "Salary or CTC",
    use: "Pay spread by department or grade.",
    kind: "money",
    synonyms: ["annual ctc", "ctc", "ctc annual", "ctc per annum", "total ctc", "fixed ctc", "annual salary", "gross salary", "salary", "monthly gross", "=gross", "monthly salary", "=compensation", "=pay"]
  },
  {
    key: "grade",
    label: "Grade or band",
    use: "Pay spread by grade.",
    kind: "text",
    synonyms: ["grade", "=band", "=level", "job level", "job grade", "pay grade", "cadre", "grade band"]
  },
  {
    key: "designation",
    label: "Designation",
    use: "Shown in the data checks.",
    kind: "text",
    synonyms: ["designation", "job title", "=title", "=position", "=role", "job role", "designation name"]
  },
  {
    key: "dob",
    label: "Date of birth",
    use: "Only used to check for impossible dates.",
    kind: "date",
    synonyms: ["date of birth", "dob", "birth date", "birthdate", "birthday"]
  }
];

export const fieldDef = (k: FieldKey) => FIELDS.find((f) => f.key === k)!;

/** Plain text of a cell. Booleans become TRUE/FALSE as Excel shows them. */
export function cellText(c: unknown): string {
  if (c == null) return "";
  if (typeof c === "boolean") return c ? "TRUE" : "FALSE";
  if (c instanceof Date) return Number.isNaN(c.getTime()) ? "" : c.toISOString().slice(0, 10);
  return String(c).trim();
}

/** "Annual CTC (₹)" → "annual ctc"; "D.O.J." → "d o j" */
export function normaliseHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * How well a header matches a field's synonyms: 100+ for an exact match,
 * 60+ when the header contains the synonym as whole words. Synonyms written
 * "=word" are too generic for that ("Home city", "Location code") and only
 * count when the header is exactly that word.
 */
function headerScore(header: string, synonyms: string[]): number {
  const n = normaliseHeader(header);
  if (!n) return 0;
  const compact = n.replace(/ /g, "");
  let best = 0;
  synonyms.forEach((syn, i) => {
    const exactOnly = syn.startsWith("=");
    const sn = normaliseHeader(syn);
    const rank = (synonyms.length - i) / synonyms.length; // earlier synonyms win ties
    if (n === sn || compact === sn.replace(/ /g, "")) best = Math.max(best, 100 + rank);
    else if (!exactOnly && ` ${n} `.includes(` ${sn} `)) best = Math.max(best, 60 + rank + sn.length / 20);
  });
  return best;
}

const YES_NO = new Set(["y", "n", "yes", "no", "true", "false", "0", "1"]);

/** Value checks that stop a look-alike header winning: dates must be dates, IDs mostly unique, and so on. */
function valuesFit(key: FieldKey, kind: FieldDef["kind"], values: Cell[], order: DateOrder): boolean {
  const filled = values.filter((v) => cellText(v) !== "");
  if (!filled.length) return true;
  const share = (test: (v: Cell) => boolean) => filled.filter(test).length / filled.length;
  if (kind === "date") return share((v) => parseDate(v, order) !== null) >= 0.5;
  if (kind === "money") return share((v) => parseMoney(v) !== null) >= 0.6;
  if (key === "id") return new Set(filled.map((v) => cellText(v).toLowerCase())).size / filled.length >= 0.9;
  if (key === "status") return share((v) => classifyStatus(v) !== null) >= 0.5;
  if (key === "manager") return share((v) => YES_NO.has(cellText(v).toLowerCase())) < 0.5;
  return true;
}

export type Detection = { map: ColumnMap; dateOrder: DateOrder; dateAmbiguous: boolean; salaryPeriod: "annual" | "monthly" };

/**
 * Match file columns to fields: header names first (exact, then whole-word
 * matches), checked against the values (a "date" column must hold dates).
 * Each column is used once; the strongest matches are assigned first.
 */
export function detectColumns(headers: string[], rows: Cell[][]): Detection {
  const sample = rows.slice(0, 300);
  const col = (i: number) => sample.map((r) => r[i] ?? null);
  const allDateCells = headers.flatMap((h, i) => (/date|doj|dob|lwd|dol|day|joining|birth|exit|leaving/i.test(h) ? col(i) : []));
  const { order: dateOrder, ambiguous } = detectDateOrder(allDateCells);

  const candidates: { key: FieldKey; col: number; score: number }[] = [];
  for (const f of FIELDS) {
    headers.forEach((h, i) => {
      const s = headerScore(h, f.synonyms);
      if (s > 0 && valuesFit(f.key, f.kind, col(i), dateOrder)) candidates.push({ key: f.key, col: i, score: s });
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  const map: ColumnMap = {};
  const used = new Set<number>();
  for (const c of candidates) {
    if (map[c.key] !== undefined || used.has(c.col)) continue;
    map[c.key] = c.col;
    used.add(c.col);
  }
  const salaries = map.salary === undefined ? [] : col(map.salary).map(parseMoney).filter((v): v is number => v !== null && v > 0);
  return { map, dateOrder, dateAmbiguous: ambiguous, salaryPeriod: guessSalaryPeriod(salaries) };
}

/**
 * Many HR exports start with a title ("Employee master as on 31-10-2026")
 * before the header row. Pick the row in the first 15 that looks most like headers.
 */
export function findHeaderRow(rows: Cell[][]): number {
  const all = FIELDS.flatMap((f) => f.synonyms.map((x) => normaliseHeader(x.replace(/^=/, ""))));
  let best = -1;
  let bestScore = -1;
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const cells = (rows[i] ?? []).map(cellText).filter(Boolean);
    if (!cells.length) continue;
    let score = 0;
    for (const c of cells) {
      const n = normaliseHeader(c);
      if (all.includes(n)) score += 3;
      else if (all.some((s) => s.length > 2 && ` ${n} `.includes(` ${s} `))) score += 1;
    }
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return Math.max(0, best);
}

/* ---------- Values ---------- */

export type Gender = "women" | "men" | "other" | "unknown";
export const GENDER_LABEL: Record<Gender, string> = { women: "Women", men: "Men", other: "Another gender", unknown: "Not stated" };

const squash = (v: string) => v.toLowerCase().replace(/[^a-z]/g, "");
const WOMEN = new Set(["f", "female", "woman", "women", "w", "fem", "transwoman"]);
const MEN = new Set(["m", "male", "man", "men", "transman"]);
const OTHER = new Set(["transgender", "trans", "tg", "nonbinary", "nb", "other", "others", "x", "thirdgender", "genderqueer", "intersex", "agender", "genderfluid"]);
const NOT_STATED = new Set(["", "na", "nil", "none", "unknown", "notstated", "notdisclosed", "undisclosed", "notspecified", "prefernottosay", "prefernottodisclose", "declined"]);

/** Gender as recorded, grouped for reporting. `recognised` is false for values like "Femal". */
export function classifyGender(v: unknown): { gender: Gender; recognised: boolean } {
  const s = squash(cellText(v));
  if (WOMEN.has(s)) return { gender: "women", recognised: true };
  if (MEN.has(s)) return { gender: "men", recognised: true };
  if (OTHER.has(s)) return { gender: "other", recognised: true };
  if (NOT_STATED.has(s)) return { gender: "unknown", recognised: true };
  return { gender: "unknown", recognised: false };
}

const LEFT_EXACT = new Set(["left", "exit", "exited", "inactive", "former", "exemployee", "separated", "relieved", "resigned", "terminated", "retired", "deceased", "expired", "absconding", "absconded", "dismissed", "laidoff", "fnfdone", "settled"]);
const ACTIVE_EXACT = new Set(["active", "working", "current", "employed", "confirmed", "probation", "onprobation", "probationer", "regular", "permanent", "trainee", "intern", "onleave", "suspended", "yettojoin", "offeraccepted", "deputed"]);

/**
 * What a status value says: still on the rolls, has left, or unclear (null).
 * "Serving notice" counts as still working; "Inactive" as left.
 */
export function classifyStatus(v: unknown): "active" | "left" | null {
  const raw = cellText(v).toLowerCase();
  const s = squash(raw);
  if (!s) return null;
  if (LEFT_EXACT.has(s)) return "left";
  if (ACTIVE_EXACT.has(s)) return "active";
  if (/notice/.test(s)) return "active";
  if (/^(not|no longer|ex[\s-])/.test(raw)) return "left";
  if (/resign|terminat|abscond|retire|separat|exited|relieve|inactive|deceas|dismiss|laid ?off|contract (ended|completed)|fnf|f ?& ?f|full and final/.test(raw)) return "left";
  if (/active|working|current|confirm|probation|leave|employ|join/.test(raw)) return "active";
  return null;
}

/**
 * Read a salary: 12,00,000 · ₹12,00,000/- · 12 LPA · 12.5 lakh · 1.2 Cr · 45k.
 * Returns null for text, blanks and negative numbers.
 */
export function parseMoney(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) && v >= 0 ? v : null;
  let s = cellText(v).toLowerCase();
  if (!s) return null;
  s = s
    .replace(/₹|\brs\.?|\binr\b|\/-/g, "")
    .replace(/(per annum|per month|p\.?\s?a\.?|p\.?\s?m\.?|annual|monthly|yearly)$/g, "")
    .replace(/,/g, "")
    .trim();
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lpa|l|k|thousand)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2] ?? "";
  if (/^cr/.test(unit)) return n * 1e7;
  if (/^(lakh|lac|lpa|l)/.test(unit)) return n * 1e5;
  if (unit === "k" || unit === "thousand") return n * 1e3;
  return n;
}

/** Monthly gross pay is rarely above ₹2 lakh for the typical (median) employee; annual CTC rarely below it. */
export function guessSalaryPeriod(values: number[]): "annual" | "monthly" {
  if (!values.length) return "annual";
  const s = [...values].sort((a, b) => a - b);
  const median = s[Math.floor(s.length / 2)];
  return median < 200_000 ? "monthly" : "annual";
}
