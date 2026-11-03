/**
 * The same person across documents. When a reader fills in a person in one
 * letter or form (the offer letter: name, role, start date, CTC…), those details
 * are kept on this device, so the appointment letter, joining form or experience
 * letter can be filled from them with "Fill from a recent person".
 *
 * Templates name the same detail differently (e_name, employee_name,
 * candidate_name…), so each detail lists the field ids it fills and the ids it
 * is read from, most specific first. Only employment details travel: no PAN,
 * Aadhaar, bank details or dates of birth.
 *
 * Storage: "pc-people", the 10 most recent people.
 */
import { readJson, removeKey, shortId, writeJson } from "./store.ts";

export const PEOPLE_KEY = "pc-people";
export const MAX_PEOPLE = 10;

export type PersonKey =
  | "name"
  | "empId"
  | "role"
  | "department"
  | "joined"
  | "location"
  | "reportingTo"
  | "employment"
  | "fixedTermEnd"
  | "probation"
  | "notice"
  | "ctc"
  | "gross"
  | "address"
  | "lwd";

type Detail = {
  key: PersonKey;
  /** Plain words for status messages. */
  words: string;
  /** Field ids this detail is filled into. */
  fill: string[];
  /** Field ids it is read from, preferred first. Defaults to `fill`. */
  read?: string[];
  /** Only some fields with a shared id mean this detail (a PIP's start_date is not a joining date). */
  when?: (id: string, label: string) => boolean;
};

export const PERSON_DETAILS: Detail[] = [
  { key: "name", words: "name", fill: ["e_name", "employee_name", "candidate_name", "full_name", "your_name"] },
  {
    key: "role",
    words: "role",
    fill: ["designation", "e_designation", "role", "your_role"],
    // A salary revision letter's new designation is the person's role from then on.
    read: ["new_designation", "designation", "e_designation", "role", "your_role"]
  },
  { key: "department", words: "department", fill: ["department", "e_department"] },
  { key: "empId", words: "employee ID", fill: ["e_id", "employee_id", "employee_code", "e_code"] },
  {
    key: "joined",
    words: "joining date",
    fill: ["joining_date", "doj", "e_doj", "start_date"],
    when: (id, label) => id !== "start_date" || /^\s*(start date|date of joining|joining date)\s*$/i.test(label)
  },
  { key: "location", words: "location", fill: ["location"] },
  { key: "reportingTo", words: "manager", fill: ["reporting_to", "manager", "e_manager", "manager_name"] },
  { key: "employment", words: "type of employment", fill: ["employment_type"] },
  { key: "fixedTermEnd", words: "fixed-term end date", fill: ["fixed_term_end"] },
  { key: "probation", words: "probation", fill: ["probation"] },
  { key: "notice", words: "notice period", fill: ["notice", "notice_period"] },
  {
    key: "ctc",
    words: "CTC",
    // The CTC "before" a revision is the CTC the person has now; after it, the revised one.
    fill: ["ctc_annual", "old_ctc"],
    read: ["ctc_annual", "new_ctc", "old_ctc"]
  },
  { key: "gross", words: "gross monthly pay", fill: ["gross_monthly"] },
  {
    key: "address",
    words: "address",
    fill: ["candidate_address", "employee_address"],
    read: ["candidate_address", "employee_address", "current_address"]
  },
  { key: "lwd", words: "last working day", fill: ["lwd", "e_lwd", "last_day"] }
];

const BY_KEY = new Map(PERSON_DETAILS.map((d) => [d.key, d]));

/** One field of a template that holds a person detail. */
export type PersonSlot = { key: PersonKey; fill: boolean; rank: number };
export type PersonSlots = Record<string, PersonSlot>;

/** Which person detail each field of a template holds. Runs at build time, from the template's fields. */
export function personSlots(fields: { id: string; label: string }[]): PersonSlots {
  const out: PersonSlots = {};
  for (const f of fields) {
    for (const d of PERSON_DETAILS) {
      const read = d.read ?? d.fill;
      const inFill = d.fill.includes(f.id);
      const rank = read.indexOf(f.id);
      if (!inFill && rank < 0) continue;
      if (d.when && !d.when(f.id, f.label)) continue;
      out[f.id] = { key: d.key, fill: inFill, rank: rank < 0 ? read.length : rank };
      break;
    }
  }
  return out;
}

/** The template's own name field, if it has one: the picker only appears where there is a person. */
export function nameFieldOf(slots: PersonSlots): string | undefined {
  return Object.entries(slots).find(([, s]) => s.key === "name" && s.fill)?.[0];
}

export type PersonData = Partial<Record<PersonKey, string>>;
export type Person = { id: string; updated: number; from?: string; data: PersonData };

/** Read the person out of a document's values: for each detail, the preferred field that has text. */
export function readPerson(values: Record<string, string>, slots: PersonSlots): PersonData {
  const best = new Map<PersonKey, { rank: number; value: string }>();
  for (const [id, slot] of Object.entries(slots)) {
    const v = (values[id] ?? "").trim();
    if (!v) continue;
    const cur = best.get(slot.key);
    if (!cur || slot.rank < cur.rank) best.set(slot.key, { rank: slot.rank, value: v });
  }
  const out: PersonData = {};
  for (const [k, { value }] of best) out[k] = value;
  return out;
}

export const normName = (s: string | undefined) =>
  (s ?? "")
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/**
 * Is a changed name still the same person? Yes when the reader finished typing it
 * ("Priya" → "Priya Nair") or fixed a typo ("Priya Nari" → "Priya Nair"). A
 * different name ("Priya Nair" → "Priya Sharma") is a different person.
 */
export function sameName(a: string | undefined, b: string | undefined): boolean {
  const x = normName(a);
  const y = normName(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.startsWith(y) || y.startsWith(x)) return true;
  return Math.min(x.length, y.length) >= 6 && distance(x, y) <= 2;
}

/**
 * Add or update a person. The document's own linked person is updated while the
 * name is still theirs; otherwise a person with the same name is updated, or a new
 * one is added. Details the document leaves empty keep what other documents filled.
 */
export function upsertPerson(
  list: Person[],
  data: PersonData,
  opts: { linkId?: string; from?: string; now?: number; makeId?: () => string } = {}
): { list: Person[]; id?: string } {
  const name = (data.name ?? "").trim();
  if (normName(name).length < 2) return { list, id: opts.linkId };
  const now = opts.now ?? Date.now();
  const linked = opts.linkId ? list.find((p) => p.id === opts.linkId) : undefined;
  const linkedSame = linked && sameName(linked.data.name, name) ? linked : undefined;
  const exact = list.find((p) => normName(p.data.name) === normName(name));
  const target = exact ?? linkedSame;
  // The linked entry was this same person typed half-way ("Priya"): fold it into the full entry.
  const fold = exact && linkedSame && exact.id !== linkedSame.id ? linkedSame : undefined;
  const clean: PersonData = {};
  for (const [k, v] of Object.entries(data) as [PersonKey, string | undefined][]) if (v && v.trim()) clean[k] = v.trim();
  const person: Person = target
    ? { ...target, updated: now, from: opts.from ?? target.from, data: { ...(fold?.data ?? {}), ...target.data, ...clean } }
    : { id: (opts.makeId ?? shortId)(), updated: now, from: opts.from, data: clean };
  const rest = list.filter((p) => p.id !== person.id && p.id !== fold?.id);
  return { list: [person, ...rest].sort((a, b) => b.updated - a.updated).slice(0, MAX_PEOPLE), id: person.id };
}

/** "Priya Nair, Senior Accountant" */
export function personLabel(p: Person): string {
  return [p.data.name, p.data.role].filter(Boolean).join(", ");
}

const SYNONYMS: string[][] = [["permanent", "regular"]];

/** The option of a select that means this value, allowing for wording that differs between templates. */
export function matchOption(value: string, options: string[]): string | null {
  const v = value.trim().toLowerCase();
  const exact = options.find((o) => o.trim().toLowerCase() === v);
  if (exact) return exact;
  for (const group of SYNONYMS) {
    if (!group.includes(v)) continue;
    const hit = options.find((o) => group.includes(o.trim().toLowerCase()));
    if (hit) return hit;
  }
  return null;
}

export type FillPlan = {
  /** Field id → new value ("" clears a detail that belonged to someone else). */
  values: Record<string, string>;
  /** Details that were filled in, in plain words. */
  filled: string[];
  /** "replace" when the document held a different person, whose details are all replaced. */
  mode: "fill" | "replace";
};

/**
 * What to put in each field when the reader picks a person. If the document
 * already holds someone else, all of that person's details are replaced, so two
 * people's details never mix. Otherwise only empty fields are filled, so nothing
 * the reader typed here (a negotiated CTC, say) is overwritten.
 *
 * `accept(id, value)` returns the value as the field can take it (an option of a
 * select, a yyyy-mm-dd date for a date input) or null if it can't.
 */
export function planFill(
  person: Person,
  slots: PersonSlots,
  current: Record<string, string>,
  accept: (id: string, value: string) => string | null
): FillPlan {
  const nameId = nameFieldOf(slots);
  const currentName = nameId ? current[nameId] : "";
  const mode: FillPlan["mode"] = currentName?.trim() && !sameName(currentName, person.data.name) ? "replace" : "fill";
  const values: Record<string, string> = {};
  const filled = new Set<string>();
  for (const [id, slot] of Object.entries(slots)) {
    if (!slot.fill) continue;
    const raw = person.data[slot.key];
    const ok = raw ? accept(id, raw) : null;
    const has = !!(current[id] ?? "").trim();
    if (mode === "fill") {
      if (has || ok == null) continue;
      values[id] = ok;
      filled.add(BY_KEY.get(slot.key)!.words);
    } else if (ok != null) {
      values[id] = ok;
      filled.add(BY_KEY.get(slot.key)!.words);
    } else if (has) {
      values[id] = "";
    }
  }
  return { values, filled: [...filled], mode };
}

/* ---------- Storage ---------- */

export function loadPeople(): Person[] {
  const raw = readJson<unknown>(PEOPLE_KEY);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is Person => !!p && typeof p === "object" && typeof (p as Person).id === "string" && !!(p as Person).data?.name)
    .map((p) => {
      const data: PersonData = {};
      for (const d of PERSON_DETAILS) {
        const v = p.data[d.key];
        if (typeof v === "string" && v.trim()) data[d.key] = v;
      }
      return { id: p.id, updated: Number(p.updated) || 0, from: typeof p.from === "string" ? p.from : undefined, data };
    })
    .sort((a, b) => b.updated - a.updated)
    .slice(0, MAX_PEOPLE);
}

export function savePeople(list: Person[]): boolean {
  if (!list.length) {
    removeKey(PEOPLE_KEY);
    return true;
  }
  return writeJson(PEOPLE_KEY, list.slice(0, MAX_PEOPLE));
}

export function forgetPeople(): void {
  removeKey(PEOPLE_KEY);
}
