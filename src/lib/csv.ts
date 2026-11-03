/**
 * The one CSV writer for every export on the site (calculator scenarios, checklists,
 * surveys, people analytics, salary bands). Files open cleanly in Excel and Google Sheets:
 * - RFC 4180 quoting, CRLF line ends;
 * - optional UTF-8 byte-order mark, so ₹, é and – survive Excel on Windows;
 * - text a spreadsheet could run as a formula (leading =, +, -, @, tab or CR) gets a
 *   leading apostrophe, because cell text can come from an uploaded file. Plain numbers
 *   such as "-500" are left alone so they stay numbers.
 */
export type CsvValue = string | number | null | undefined;

const PURE_NUMBER = /^-?\d+(\.\d+)?$/;

export function csvCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s) && !PURE_NUMBER.test(s)) s = `'${s}`;
  return /[",\r\n]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: unknown[][], { bom = true }: { bom?: boolean } = {}): string {
  return `${bom ? "﻿" : ""}${rows.map((r) => r.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
