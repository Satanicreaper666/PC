/**
 * Reading one spreadsheet cell for one template field: dates written the
 * Indian way (2 November 2026) and money in rupees with lakh grouping
 * (₹12,00,000), the same as the single-letter pages, plus a note of anything
 * that looks wrong.
 */
import { parseDate, ymd, type DateOrder, type DayNum } from "../analytics/dates.ts";
import { cellText, parseMoney, type Cell } from "../analytics/fields.ts";
import type { MergeField } from "./library.ts";

export type { Cell, DateOrder };

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** 2 November 2026 */
export function longDate(n: DayNum): string {
  const { y, m, d } = ymd(n);
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`;
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
/** ₹12,00,000: Indian digit grouping, whole rupees, as on the letter pages. */
export const rupees = (n: number) => inr.format(n);

export type Level = "error" | "warning" | "note";
export type Problem = { level: Level; message: string };
export type Read = { text: string; problem?: Problem };

const squash = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Text from a cell, keeping line breaks inside it (for multi-line fields) but not around it. */
export function cellValue(c: Cell): string {
  if (typeof c === "string") return c.replace(/\r\n?/g, "\n").trim();
  return cellText(c);
}

export function readValue(f: MergeField, raw: Cell, order: DateOrder): Read {
  const text = cellValue(raw);
  if (!text) return { text: "" };
  switch (f.type) {
    case "date": {
      const d = parseDate(typeof raw === "string" ? text : raw, order);
      return d === null ? { text, problem: { level: "error", message: `“${text}” can't be read as a date` } } : { text: longDate(d) };
    }
    case "money": {
      const m = parseMoney(raw);
      return m === null ? { text, problem: { level: "error", message: `“${text}” isn't an amount` } } : { text: rupees(m) };
    }
    case "number":
      return /^-?\d[\d,]*(\.\d+)?$/.test(text) ? { text } : { text, problem: { level: "warning", message: `“${text}” isn't a number` } };
    case "email":
      return EMAIL.test(text) ? { text } : { text, problem: { level: "warning", message: `“${text}” doesn't look like an email address` } };
    case "select": {
      // Exact (ignoring case and spaces), or a shortened form that fits only one option ("has been paid").
      const opts = f.options ?? [];
      const k = squash(text);
      const partial = k.length >= 4 ? opts.filter((o) => squash(o).includes(k)) : [];
      const hit = opts.find((o) => squash(o) === k) ?? (partial.length === 1 ? partial[0] : undefined);
      if (hit) return { text: hit };
      return { text, problem: { level: "warning", message: `“${short(text)}” isn't one of the letter's options; it is used as written` } };
    }
    default:
      return { text };
  }
}

const short = (s: string) => (s.length > 60 ? `${s.slice(0, 57)}…` : s);
