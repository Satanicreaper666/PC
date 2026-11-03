/**
 * The columns the org chart builder reads, how it recognises them in an
 * uploaded file, and how it turns rows into people. Header matching works the
 * same way as the people-analytics tool: exact and whole-word synonyms,
 * checked against the values, each column used once.
 */
import { cellText, normaliseHeader, type Cell } from "../analytics/fields.ts";

export type { Cell };

export const OC_FIELD_KEYS = ["id", "name", "title", "managerId", "managerName", "dept", "location"] as const;
export type OcFieldKey = (typeof OC_FIELD_KEYS)[number];
/** Field → column index in the file. */
export type OcColumnMap = Partial<Record<OcFieldKey, number>>;

export type OcFieldDef = {
  key: OcFieldKey;
  label: string;
  /** What the tool uses it for, shown in the column check. */
  use: string;
  required?: boolean;
  synonyms: string[];
};

export const OC_FIELDS: OcFieldDef[] = [
  {
    key: "name",
    label: "Name",
    use: "Shown on each box in the chart.",
    required: true,
    synonyms: ["employee name", "emp name", "name", "full name", "employee full name", "associate name", "staff name", "name of employee", "=person"]
  },
  {
    key: "id",
    label: "Employee ID",
    use: "Links each person to their manager and finds duplicates.",
    synonyms: ["employee id", "emp id", "employee code", "emp code", "employee no", "emp no", "employee number", "staff id", "staff code", "ecode", "empid", "personnel number", "person id", "worker id", "=id", "=code", "=emp", "=eid"]
  },
  {
    key: "title",
    label: "Job title",
    use: "Shown under the name.",
    synonyms: ["designation", "job title", "=title", "position", "=role", "job role", "designation name", "position title", "=job"]
  },
  {
    key: "managerId",
    label: "Manager's employee ID",
    use: "Who each person reports to. IDs are unique, so this works best.",
    synonyms: [
      "reporting manager id", "reporting manager code", "reporting manager emp code", "reporting manager employee id", "reporting manager employee code",
      "manager id", "manager code", "manager emp code", "manager employee id", "manager employee code", "reports to id", "reports to code",
      "reporting to id", "supervisor id", "supervisor code", "rm id", "rm code", "rm emp code", "l1 manager id", "l1 manager code", "line manager id",
      "parent id", "manager emp id"
    ]
  },
  {
    key: "managerName",
    label: "Manager's name",
    use: "Use it if your file has names instead of IDs. Each name must match someone in the Name column.",
    synonyms: [
      "reporting manager name", "manager name", "manager full name", "line manager name", "supervisor name", "rm name", "reports to name",
      "reporting to name", "l1 manager name", "reporting manager full name"
    ]
  },
  {
    key: "dept",
    label: "Department",
    use: "Department breakdown, colour on the chart and the single-point-of-failure check.",
    synonyms: ["department", "dept", "department name", "=function", "division", "business unit", "=bu", "vertical", "=team", "sub department"]
  },
  {
    key: "location",
    label: "Location",
    use: "Location breakdown and managers in another location.",
    synonyms: ["location", "work location", "base location", "office location", "=office", "=city", "branch", "=site", "work city", "location name"]
  }
];

/** Headers that name a manager without saying whether they hold IDs or names. */
const MANAGER_ANY = [
  "reporting manager", "reports to", "reporting to", "=manager", "line manager", "=supervisor", "=rm", "l1 manager", "reporting officer",
  "reporting authority", "direct manager", "immediate manager", "reporting head", "=mgr"
];

export const ocFieldDef = (k: OcFieldKey) => OC_FIELDS.find((f) => f.key === k)!;

/** Headers without case, punctuation or a possessive: "Manager's Emp. ID" → "manager emp id". */
export const norm = (h: string) => normaliseHeader(h.replace(/['’`]s\b/gi, ""));

/** A header about someone's manager, which must never be read as the person's own ID or name. */
const MANAGERISH = /\b(manager|mgr|supervisor|reports|reporting|rm|l1|boss|parent|superior|head)\b/;

/**
 * How well a header matches a list of synonyms: 100+ for an exact match,
 * 60+ when the header contains the synonym as whole words. Synonyms written
 * "=word" are too generic for that and only count as an exact match.
 */
export function headerScore(header: string, synonyms: string[]): number {
  const n = norm(header);
  if (!n) return 0;
  const compact = n.replace(/ /g, "");
  let best = 0;
  synonyms.forEach((syn, i) => {
    const exactOnly = syn.startsWith("=");
    const sn = normaliseHeader(syn);
    const rank = (synonyms.length - i) / synonyms.length;
    if (n === sn || compact === sn.replace(/ /g, "")) best = Math.max(best, 100 + rank);
    else if (!exactOnly && ` ${n} `.includes(` ${sn} `)) best = Math.max(best, 60 + rank + sn.length / 20);
  });
  return best;
}

const SALUTATIONS = new Set(["mr", "ms", "mrs", "miss", "dr", "shri", "smt", "kumari", "prof", "mx"]);

/**
 * Value checks that stop a look-alike header winning: IDs mostly unique, a title
 * column isn't Mr/Ms, names aren't numbers. A header that names the field exactly
 * ("Emp ID") only needs mostly unique values, so a file with a few duplicate IDs
 * is still read, and the duplicates reported.
 */
function valuesFit(key: OcFieldKey, values: Cell[], specific: boolean): boolean {
  const filled = values.map(cellText).filter(Boolean);
  if (!filled.length) return true;
  const share = (test: (v: string) => boolean) => filled.filter(test).length / filled.length;
  if (key === "id") return new Set(filled.map((v) => v.toLowerCase())).size / filled.length >= (specific ? 0.6 : 0.9);
  if (key === "name") return share((v) => /[a-z]/i.test(v)) >= 0.8;
  if (key === "title") return share((v) => SALUTATIONS.has(v.toLowerCase().replace(/[^a-z]/g, ""))) < 0.5;
  return true;
}

/** Text key for matching IDs and names: case and extra spaces don't matter. */
export const matchKey = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");
/** "Asha Rao (E102)" → "E102"; "E102 - Asha Rao" → "E102". */
export function embeddedId(v: string): string[] {
  const out: string[] = [];
  const inBrackets = v.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (inBrackets) out.push(inBrackets);
  const leading = v.trim().match(/^([^\s]+)\s*[-–:|]\s*\S/)?.[1];
  if (leading) out.push(leading);
  return out;
}
/** "Asha Rao (E102)" → "Asha Rao". */
export const stripBrackets = (v: string) => v.replace(/\s*\([^)]*\)\s*/g, " ").trim();

/**
 * Does a manager column hold employee IDs or names? Counts how many filled
 * values match someone's ID (directly, in brackets or as "ID - Name") and
 * how many match someone's name.
 */
export function managerColumnKind(values: Cell[], ids: Cell[], names: Cell[]): "id" | "name" | null {
  const idSet = new Set(ids.map((v) => matchKey(cellText(v))).filter(Boolean));
  const nameSet = new Set(names.map((v) => matchKey(cellText(v))).filter(Boolean));
  const filled = values.map(cellText).filter(Boolean);
  if (!filled.length) return null;
  let byId = 0;
  let byName = 0;
  for (const v of filled) {
    const k = matchKey(v);
    if (idSet.has(k) || embeddedId(v).some((x) => idSet.has(matchKey(x)))) byId++;
    else if (nameSet.has(matchKey(stripBrackets(v)))) byName++;
  }
  if (!byId && !byName) return null;
  return byId >= byName ? "id" : "name";
}

/**
 * Match file columns to fields. Specific headers first ("Manager ID",
 * "Manager name"); a generic "Reporting manager" column is then read as IDs
 * or names depending on what its values match.
 */
export function detectOrgColumns(headers: string[], rows: Cell[][]): OcColumnMap {
  const sample = rows.slice(0, 500);
  const col = (i: number) => sample.map((r) => r[i] ?? null);
  const candidates: { key: OcFieldKey; col: number; score: number }[] = [];
  headers.forEach((h, i) => {
    const managerish = MANAGERISH.test(norm(h));
    for (const f of OC_FIELDS) {
      const ownField = f.key !== "managerId" && f.key !== "managerName";
      if (ownField && managerish) continue;
      const s = headerScore(h, f.synonyms);
      // "Emp ID" names the field; "Code" or "ID" alone could be anything, so it must hold unique values.
      const specific = s >= 100 && !["id", "code", "emp", "eid"].includes(norm(h));
      if (s > 0 && valuesFit(f.key, col(i), specific)) candidates.push({ key: f.key, col: i, score: s });
    }
  });
  candidates.sort((a, b) => b.score - a.score || a.col - b.col);
  const map: OcColumnMap = {};
  const used = new Set<number>();
  for (const c of candidates) {
    if (map[c.key] !== undefined || used.has(c.col)) continue;
    map[c.key] = c.col;
    used.add(c.col);
  }
  // A generic manager column: decide by its values.
  if (map.managerId === undefined || map.managerName === undefined) {
    const generic = headers
      .map((h, i) => ({ i, score: headerScore(h, MANAGER_ANY) }))
      .filter((g) => g.score > 0 && !used.has(g.i))
      .sort((a, b) => b.score - a.score);
    for (const g of generic) {
      const kind = managerColumnKind(col(g.i), map.id === undefined ? [] : col(map.id), map.name === undefined ? [] : col(map.name));
      let key: OcFieldKey | null = null;
      if (kind === "name") key = map.managerName === undefined ? "managerName" : null;
      else if (kind === "id") key = map.managerId === undefined ? "managerId" : null;
      // Nothing matches anyone yet: with an ID column, assume IDs; otherwise names.
      else if (map.id !== undefined && map.managerId === undefined) key = "managerId";
      else if (map.managerName === undefined) key = "managerName";
      if (!key) continue;
      map[key] = g.i;
      used.add(g.i);
      if (map.managerId !== undefined && map.managerName !== undefined) break;
    }
  }
  return map;
}

/** The row in the first 15 that looks most like a header row (many exports start with a title line). */
export function findOrgHeaderRow(rows: Cell[][]): number {
  const all = [...OC_FIELDS.flatMap((f) => f.synonyms), ...MANAGER_ANY].map((x) => normaliseHeader(x.replace(/^=/, "")));
  let best = 0;
  let bestScore = -1;
  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const cells = (rows[i] ?? []).map(cellText).filter(Boolean);
    if (!cells.length) continue;
    let score = 0;
    for (const c of cells) {
      const n = norm(c);
      if (all.includes(n)) score += 3;
      else if (all.some((s) => s.length > 2 && ` ${n} `.includes(` ${s} `))) score += 1;
    }
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return best;
}

/** One person as read from the file. Text only; nothing is resolved yet. */
export type Person = {
  /** Spreadsheet row number, so people can find it. */
  row: number;
  id: string;
  name: string;
  title: string;
  dept: string;
  location: string;
  managerId: string;
  managerName: string;
};

export type OrgTable = { headers: string[]; rows: Cell[][]; firstRow: number };

/** Rows → people, skipping blank lines. */
export function readPeople(t: OrgTable, map: OcColumnMap): Person[] {
  const out: Person[] = [];
  t.rows.forEach((row, idx) => {
    if (!row.some((c) => cellText(c) !== "")) return;
    const text = (k: OcFieldKey) => {
      const i = map[k];
      return i === undefined ? "" : cellText(row[i] ?? null).replace(/\s+/g, " ");
    };
    out.push({
      row: t.firstRow + idx,
      id: text("id"),
      name: text("name"),
      title: text("title"),
      dept: text("dept"),
      location: text("location"),
      managerId: text("managerId"),
      managerName: text("managerName")
    });
  });
  return out;
}

/** What's wrong with a column choice, written for the reader; "" when it can be used. */
export function mappingProblem(map: OcColumnMap, headers: string[]): string {
  if (map.name === undefined) return "Choose the column with each person's name. The chart needs it for every box.";
  if (map.managerId === undefined && map.managerName === undefined)
    return "Choose the column that says who each person reports to: the manager's employee ID or the manager's name.";
  if (map.managerId !== undefined && map.id === undefined)
    return "You chose a manager ID column, so also choose the Employee ID column. The tool matches each manager ID to someone's employee ID.";
  const used = new Map<number, string[]>();
  for (const f of OC_FIELDS) {
    const c = map[f.key];
    if (c !== undefined) used.set(c, [...(used.get(c) ?? []), f.label]);
  }
  for (const [c, labels] of used)
    if (labels.length > 1) return `“${headers[c] ?? "This column"}” is chosen for both ${labels.join(" and ")}. Choose a different column for one of them.`;
  return "";
}

/** CSV with just the header row, for people starting from scratch. */
export const TEMPLATE_HEADERS = ["Employee ID", "Name", "Job title", "Manager's employee ID", "Department", "Location"];
export const templateCsv = () => TEMPLATE_HEADERS.map((h) => (/[",]/.test(h) ? `"${h.replace(/"/g, '""')}"` : h)).join(",") + "\r\n";
