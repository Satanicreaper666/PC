/**
 * Sample rows for any letter: five made-up people with the letter's own
 * field labels as headers. The names are invented (Indian spices and plants
 * as surnames) and the company is "Sample Company Pvt Ltd".
 *
 * Two rows have a deliberate mistake, so the checks have something to show:
 * one leaves a required detail empty, one has a date that doesn't exist.
 * Forms fill only their first group of details, as you would before handing
 * them out.
 */
import { dayNum, ymd, type DayNum } from "../analytics/dates.ts";
import type { MergeField, MergeTemplate } from "./library.ts";

const PEOPLE: [string, string][] = [
  ["Asha", "Pudina"],
  ["Rohit", "Javitri"],
  ["Meghna", "Anardana"],
  ["Yusuf", "Kalonji"],
  ["Diya", "Hing"]
];
const TITLES = ["Software engineer", "Sales executive", "Accountant", "Product designer", "Support specialist"];
const DEPTS = ["Engineering", "Sales", "Finance", "Product", "Customer support"];
const MANAGERS = ["Kabir Dalchini", "Vikram Saunf", "Pooja Jaiphal", "Mira Palash", "Kavya Kadamba"];
const SCALE = [1, 1.3, 0.9, 1.6, 0.75];
const SKIP_OPTIONAL = new Set(["variable_basis", "other_conditions", "request", "support", "insurance_family"]);
export const SAMPLE_ROWS = PEOPLE.length;

const pad = (n: number) => String(n).padStart(2, "0");
/** 02/11/2026, the way Indian spreadsheets usually write dates. */
const dmy = (n: DayNum) => {
  const { y, m, d } = ymd(n);
  return `${pad(d)}/${pad(m)}/${y}`;
};
/** 5,40,000 */
const inr = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const round = (n: number, to: number) => Math.round(n / to) * to;

const DATE_OFFSETS: Record<string, number> = {
  start_date: 21,
  joining_date: 21,
  accept_by: 7,
  last_day: 60,
  lwd: 0,
  resignation_date: -60,
  ff_date: 30,
  from_date: 14,
  to_date: 16,
  review_date: 7,
  interview_date: 2
};

function dateValue(id: string, k: number, today: DayNum): string {
  const { y, m } = ymd(today);
  if (id === "dob") return dmy(dayNum(1988 + k * 2, k + 2, 10 + k));
  if (id === "doj" || id === "e_doj") return dmy(dayNum(y - 2 - k, ((m + k) % 12) + 1, 1 + k * 3));
  if (id === "effective_date") return dmy(dayNum(m >= 4 ? y + 1 : y, 4, 1));
  return dmy(today + (DATE_OFFSETS[id] ?? 7) + (id === "lwd" ? -k : k));
}

function moneyValue(id: string, k: number): string {
  const basic = round(30_000 * SCALE[k], 500);
  const hra = basic / 2;
  const special = round(basic * 0.6, 100);
  const gross = basic + hra + special;
  const oldFixed = round(900_000 * SCALE[k], 1000);
  const newFixed = round(oldFixed * 1.1, 1000);
  const table: Record<string, number> = {
    basic,
    basic_da: basic,
    hra,
    special_allowance: special,
    gross_monthly: gross,
    ctc_annual: gross * 12,
    old_fixed: oldFixed,
    new_fixed: newFixed,
    old_ctc: oldFixed,
    new_ctc: newFixed
  };
  return table[id] === undefined ? "" : inr(table[id]);
}

function textValue(f: MergeField, k: number, today: DayNum): string {
  const [first, last] = PEOPLE[k];
  switch (f.id) {
    case "candidate_name":
    case "employee_name":
    case "e_name":
    case "your_name":
    case "full_name":
      return `${first} ${last}`;
    case "company":
      return "Sample Company Pvt Ltd";
    case "company_address":
      return "4th floor, 12 Example Road\nBengaluru 560001";
    case "candidate_address":
    case "employee_address":
      return `Flat ${k + 2}B, Example Residency\nPune 411001`;
    case "signatory_name":
      return "Anaya Neem";
    case "e_id":
    case "employee_id":
    case "employee_code":
    case "e_code":
      return `SC${101 + k}`;
    case "ref_no":
      return `SC/HR/${ymd(today).y}/${101 + k}`;
    case "role":
    case "designation":
    case "e_designation":
    case "your_role":
      return TITLES[k];
    case "department":
    case "e_department":
      return DEPTS[k];
    case "manager_name":
    case "manager":
    case "e_manager":
      return MANAGERS[k];
    case "reporting_to":
      return `${MANAGERS[k]}, team lead`;
    case "parent_name":
      return `Lakshmi ${last}`;
    case "lin":
      return "1234567890 (sample)";
    case "personal_email":
      return `${first}.${last}@example.com`.toLowerCase();
    case "increase_pct":
      return "10%";
    case "days":
      return String(2 + k);
  }
  if (f.type === "select") return f.default ?? f.options?.[0] ?? "";
  if (f.default) return f.default;
  // Optional details that only make sense with another one (variable pay, extra conditions) stay empty.
  if (f.placeholder && (f.required || !SKIP_OPTIONAL.has(f.id))) return f.placeholder;
  if (f.type === "email") return "hr@example.com";
  if (f.type === "tel") return `+91 90000 0000${k}`;
  return f.required ? `Example ${f.label.toLowerCase()}` : "";
}

export function sampleMergeTable(t: MergeTemplate, today: DayNum): { headers: string[]; rows: string[][] } {
  // Forms: only the first group (who and when), the rest is filled in by hand.
  const firstGroup = t.fields[0]?.group;
  const fields = t.kind === "form" ? t.fields.filter((f) => f.group === firstGroup) : t.fields;
  const rows = PEOPLE.map((_, k) =>
    t.fields.map((f) => {
      if (!fields.includes(f)) return "";
      if (f.type === "date") return f.required || DATE_OFFSETS[f.id] !== undefined || f.id === "doj" ? dateValue(f.id, k, today) : "";
      if (f.type === "money") return moneyValue(f.id, k);
      return textValue(f, k, today);
    })
  );
  // Row 4 leaves the first required non-name detail empty; row 5 has 31 February.
  const firstRequired = t.fields.findIndex((f, i) => f.required && fields.includes(f) && i > 0 && f.type !== "date" && !/name|company/.test(f.id));
  if (t.kind === "letter" && firstRequired >= 0) rows[3][firstRequired] = "";
  const firstDate = t.fields.findIndex((f) => f.type === "date" && f.required && fields.includes(f));
  if (firstDate >= 0) rows[4][firstDate] = `31/02/${ymd(today).y}`;
  return { headers: t.fields.map((f) => f.label), rows };
}
