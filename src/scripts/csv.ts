/** Saving files in the browser. The CSV writer itself is src/lib/csv.ts. */
import { toCsv } from "../lib/csv.ts";
export { csvCell, toCsv } from "../lib/csv.ts";

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
