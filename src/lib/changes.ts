/**
 * "What changed": every dated change in src/data/statutory.ts, newest first.
 * Built from the same data the calculators use, so the log can't drift from them.
 * Used by /changes/ and /changes/rss.xml.
 */
import { PT_STATES, STAT, type StatFact, type StatSource } from "../data/statutory.ts";

export type Change = {
  /** ISO date the change took effect. */
  date: string;
  title: string;
  detail: string;
  law: string;
  source: StatSource;
  /** STAT ids this change covers; pages that show them are listed with it. */
  facts: string[];
  anchor: string;
};

/** The day the four Labour Codes took effect: facts from that date are one entry. */
const CODES_FROM = "2025-11-21";

/** "PF wage ceiling: contributions are mandatory…" → "PF wage ceiling". */
const short = (label: string) => label.split(":")[0];

const dayBefore = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export function changes(): Change[] {
  const out: Change[] = [];
  const dated = Object.entries(STAT).filter(([, f]) => f.verified && f.from) as [string, StatFact & { from: string }][];

  const codes = dated.filter(([, f]) => f.from === CODES_FROM);
  if (codes.length) {
    out.push({
      date: CODES_FROM,
      title: "The four Labour Codes take effect",
      detail: codes.map(([, f]) => `${f.label}: ${f.display}.`).join(" "),
      law: "Code on Wages, 2019; Industrial Relations Code, 2020; Code on Social Security, 2020; OSH Code, 2020",
      source: codes[0][1].also?.find((s) => /pib\.gov\.in/.test(s.url)) ?? codes[0][1].source,
      facts: codes.map(([id]) => id),
      anchor: `c-${CODES_FROM}`
    });
  }

  // Professional tax facts are covered by the state schedules below.
  for (const [id, f] of dated.filter(([id, f]) => f.from !== CODES_FROM && !id.startsWith("pt."))) {
    // A fact with an "until" the day before this one started is the value it replaced.
    const before = Object.entries(STAT).find(([, g]) => g.until === dayBefore(f.from) && g.label.split(" ")[0] === f.label.split(" ")[0]);
    out.push({
      date: f.from,
      title: before ? `${short(f.label)}: ${before[1].display} → ${f.display}` : `${short(f.label)}: ${f.display}`,
      detail: f.note ?? "",
      law: f.law,
      source: f.source,
      facts: before ? [id, before[0]] : [id],
      anchor: `c-${f.from}-${id.replace(/\./g, "-")}`
    });
  }

  for (const s of PT_STATES) {
    for (const sch of s.schedules ?? []) {
      if (!sch.from || !s.verified) continue;
      out.push({
        date: sch.from,
        title: `Professional tax in ${s.name}: new slabs`,
        detail: s.note ?? "",
        law: s.law,
        source: s.source,
        facts: [],
        anchor: `c-${sch.from}-pt-${s.code.toLowerCase()}`
      });
    }
  }

  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

export const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
