/**
 * CSV files that open cleanly in Excel and Google Sheets:
 * - UTF-8 with a byte-order mark, so ₹, é and – survive Excel on Windows;
 * - CRLF line ends and quotes only where a cell needs them;
 * - no cell that a spreadsheet would run as a formula (a leading =, +, -, @ is escaped with an apostrophe).
 */
export function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: unknown[][]): string {
  return `﻿${rows.map((r) => r.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

/** "Engagement pulse survey" → "engagement-pulse-survey". */
export function fileStem(text: string): string {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "download"
  );
}

/** Save a file the browser made, without a round trip to any server. */
export function downloadBlob(filename: string, blob: Blob): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export function downloadCsv(filename: string, rows: unknown[][]): void {
  downloadBlob(filename, new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
}
