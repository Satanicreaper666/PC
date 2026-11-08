/**
 * Read an employee file in the browser. CSV goes through papaparse and Excel
 * through read-excel-file; each library is fetched from this site only when a
 * file of that type is chosen. Nothing is sent anywhere.
 */
import type { Cell } from "../../lib/analytics/fields.ts";

export type Sheet = { name: string; rows: Cell[][] };
export type LoadedFile = { fileName: string; sheets: Sheet[] };

/** A message written for the reader, safe to show as is. */
export class LoadError extends Error {}

const MAX_MB = 30;

/** `what` names the file in messages: "employee list", "survey responses". */
export async function readEmployeeFile(file: File, what = "employee list"): Promise<LoadedFile> {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (file.size > MAX_MB * 1024 * 1024) throw new LoadError(`This file is larger than ${MAX_MB} MB. Remove columns you don't need, or split it by year, and try again.`);
  if (file.size === 0) throw new LoadError(`This file is empty. Export the ${what} again and choose the new file.`);
  if (ext === "xls") throw new LoadError("Older Excel files (.xls) can't be read here. In Excel, choose Save as and pick Excel Workbook (.xlsx) or CSV, then try again.");
  if (ext === "xlsx" || ext === "xlsm") return { fileName: file.name, sheets: await readXlsx(file) };
  if (["csv", "txt", "tsv"].includes(ext) || file.type === "text/csv") return { fileName: file.name, sheets: [{ name: "", rows: await readCsv(file) }] };
  throw new LoadError("This tool reads CSV and Excel (.xlsx) files. Save your list in one of those formats and try again.");
}

async function readCsv(file: File): Promise<Cell[][]> {
  let text = await file.text();
  // Older versions of Excel save CSV in Windows-1252, which shows up as replacement characters.
  if (text.includes("�")) text = new TextDecoder("windows-1252").decode(await file.arrayBuffer());
  text = text.replace(/^﻿/, "");
  const Papa = (await import("papaparse")).default;
  const result = Papa.parse<unknown[]>(text, { skipEmptyLines: "greedy" });
  const rows = result.data.filter(Array.isArray).map((r) => r.map((c) => (c == null ? "" : String(c))));
  if (!rows.length) throw new LoadError("No rows were found in this file. Check that it has a header row and one row per person.");
  return rows;
}

async function readXlsx(file: File): Promise<Sheet[]> {
  const { default: readExcel } = await import("read-excel-file/browser");
  let sheets: { sheet: string; data: unknown[][] }[];
  try {
    sheets = (await readExcel(file)) as unknown as { sheet: string; data: unknown[][] }[];
  } catch {
    throw new LoadError("This Excel file couldn't be opened. If it is password-protected, remove the password, save it and try again.");
  }
  const out = sheets
    .map((s) => ({ name: s.sheet, rows: s.data.map((row) => row.map(cell)) }))
    .filter((s) => s.rows.some((r) => r.some((c) => c !== null && c !== "")));
  if (!out.length) throw new LoadError("Every sheet in this workbook is empty.");
  return out;
}

/** Keep cells as text or numbers so they can be saved as JSON; dates become 2026-01-31. */
function cell(c: unknown): Cell {
  if (c == null) return null;
  if (c instanceof Date) {
    if (Number.isNaN(c.getTime())) return null;
    const t = new Date(c.getTime() + 12 * 3_600_000);
    return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
  }
  if (typeof c === "string") return c.trim();
  if (typeof c === "number" || typeof c === "boolean") return c;
  return String(c);
}

/** The sheet most likely to be the employee list: the one with the most filled rows. */
export function bestSheet(sheets: Sheet[]): number {
  let best = 0;
  sheets.forEach((s, i) => {
    const filled = (x: Sheet) => x.rows.filter((r) => r.some((c) => c !== null && c !== "")).length;
    if (filled(s) > filled(sheets[best])) best = i;
  });
  return best;
}
