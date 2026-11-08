/**
 * "Load your people once": an employee file read by one tool can be used by the
 * others (increment cycle, talent review, pay equity) without choosing it again.
 *
 * Kept in sessionStorage only, and only when the reader ticks "Use this file in
 * other tools until I close this tab": it is gone when the tab closes, never
 * leaves the device, and "Forget it" removes it at once. Keys start with "pc-",
 * so the privacy page's "Clear everything" removes it too.
 */
export type RosterCell = string | number | boolean | null;
export type Roster = { fileName: string; rows: RosterCell[][]; savedAt: number };

const KEY = "pc-roster-session";
/** Larger files are not shared (sessionStorage is small); the tool still works with them. */
const MAX_CHARS = 4_000_000;

export function shareRoster(fileName: string, rows: RosterCell[][]): boolean {
  try {
    const text = JSON.stringify({ fileName, rows, savedAt: Date.now() } satisfies Roster);
    if (text.length > MAX_CHARS) return false;
    sessionStorage.setItem(KEY, text);
    return true;
  } catch {
    return false;
  }
}

export function sharedRoster(): Roster | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as Roster;
    return Array.isArray(r.rows) && typeof r.fileName === "string" ? r : null;
  } catch {
    return null;
  }
}

export function forgetRoster(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}
