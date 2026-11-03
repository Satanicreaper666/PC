/**
 * Small, safe wrappers around localStorage. Private browsing, a full disk or
 * blocked storage must never break a tool: reads fall back to null and writes
 * report whether they worked, so the page can say so.
 *
 * Every key the tools write starts with "pc-" or "pc_", which is what the
 * privacy page's "Clear everything" button removes.
 */
export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable: nothing to remove */
  }
}

/** A date as yyyy-mm-dd in the reader's own time zone, the format date inputs use. */
export function isoDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** A short random id for drafts and people. Not secret, only unique on this device. */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}
