#!/usr/bin/env node
/**
 * Statutory figures must come from src/data/statutory.ts, never be typed into a page.
 *
 * For each watched fact this looks through src/content for its current figure
 * (₹25,000, 0.75%, 26 weeks …) in a sentence about that subject (PF, ESI,
 * maternity …). A match fails the check unless the sentence is listed in
 * scripts/facts-allow.json with a reason (a worked example, a historical
 * figure, a different rule that happens to share the number).
 *
 * Fix a failure by writing the figure as:
 *   - front matter, glossary.json, .md templates: {{fact:esi.wageCeiling}} or {{fact:esi.wageCeiling|short}}
 *   - MDX prose:                                  <Fact id="esi.wageCeiling" short />
 *   - MDX component props:                        fx("esi.wageCeiling", "short")  (import { fx } from ".../data/statutory")
 *
 * Allow-list entries that name a fact are checked too: when the fact's figure
 * changes, the example is reported so its sums can be redone.
 *
 * Also warns when a page's "checked" date is more than STALE_DAYS old.
 *
 * Usage: node scripts/check-facts.mjs            (exit 1 on any failure)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { factText } from "../src/data/statutory.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONTENT = join(ROOT, "src/content");
const STALE_DAYS = 100;

/** Facts to police, and the words that show a sentence is about them. */
const WATCH = [
  { id: "epf.wageCeiling", about: /\b(E?PF|EPFO|provident|pension|EPS|wage ceiling)\b/i },
  { id: "epf.wageCeilingBefore", about: /\b(E?PF|EPFO|provident|pension|EPS|wage ceiling)\b/i },
  { id: "epf.epsRate", about: /\b(pension|EPS)\b/i },
  { id: "esi.wageCeiling", about: /\bESIC?\b/ },
  { id: "esi.wageCeilingPwd", about: /\bESIC?\b|disabilit/i },
  { id: "esi.employeeRate", about: /\bESIC?\b/ },
  { id: "esi.employerRate", about: /\bESIC?\b/ },
  { id: "gratuity.ceiling", about: /gratuity/i },
  { id: "maternity.weeks", about: /maternity/i },
  { id: "bonus.wageCeiling", about: /\bbonus/i },
  { id: "bonus.calcCeiling", about: /\bbonus/i },
  { id: "bonus.minRate", about: /\bbonus/i }
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** "₹25,000" must not match "₹2,25,000" or "₹25,0001". */
const figureRx = (short) => new RegExp(`(?<![\\d,.])${esc(short).replace(/\\ /g, "\\s?")}(?![\\d,])`, "g");

const allow = JSON.parse(readFileSync(join(ROOT, "scripts/facts-allow.json"), "utf8"));
const used = new Set();

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(mdx?|json)$/.test(f) ? [p] : [];
  });
}

/** Blank out text that may quote a figure verbatim: source titles and keyword lists. */
function maskQuoted(text) {
  const lines = text.split("\n");
  let inFm = false;
  let skip = false;
  return lines
    .map((line, i) => {
      if (line.trim() === "---") {
        if (i === 0) inFm = true;
        else if (inFm) inFm = false;
        skip = false;
        return line;
      }
      if (!inFm) return line;
      if (/^[A-Za-z]/.test(line)) skip = /^(sources|keywords):/.test(line);
      return skip ? "" : line;
    })
    .join("\n");
}

function sentenceAround(text, start, end) {
  const before = text.slice(0, start);
  const b = Math.max(...["\n", ". ", "? ", "! "].map((s) => before.lastIndexOf(s)));
  const after = text.slice(end);
  const ends = ["\n", ". ", "? ", "! "].map((s) => after.indexOf(s)).filter((n) => n >= 0);
  const e = ends.length ? end + Math.min(...ends) : text.length;
  return text.slice(b + 1, e + 1).trim();
}

const failures = [];
const warnings = [];

for (const file of files(CONTENT)) {
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, "utf8");
  const text = maskQuoted(raw);
  for (const w of WATCH) {
    const short = factText(w.id, "short");
    for (const m of text.matchAll(figureRx(short))) {
      const sentence = sentenceAround(text, m.index, m.index + m[0].length);
      if (!w.about.test(sentence)) continue;
      const ok = allow.find((a) => a.file === rel && sentence.includes(a.text));
      if (ok) {
        used.add(ok);
        continue;
      }
      const line = text.slice(0, m.index).split("\n").length;
      failures.push(`${rel}:${line}  ${short} (${w.id}) typed in: "${sentence.slice(0, 140)}"`);
    }
  }
  const checked = /^checked:\s*(\d{4}-\d{2}-\d{2})/m.exec(raw);
  if (checked) {
    const age = (Date.now() - Date.parse(checked[1])) / 86400000;
    if (age > STALE_DAYS) warnings.push(`${rel}: checked ${checked[1]}, ${Math.floor(age)} days ago (review every quarter)`);
  }
}

for (const a of allow) {
  if (a.fact) {
    const short = factText(a.fact, "short");
    if (!a.text.includes(short)) warnings.push(`${a.file}: example "${a.text}" was written for ${a.fact} but the figure is now ${short}; redo the sums`);
  }
  if (!used.has(a) && !readFileSync(join(ROOT, a.file), "utf8").includes(a.text)) warnings.push(`scripts/facts-allow.json: "${a.text}" no longer appears in ${a.file}; remove the entry`);
}

for (const w of warnings) console.warn(`warning  ${w}`);
if (failures.length) {
  console.error(`\n${failures.length} statutory figure(s) typed into pages. Use {{fact:id}}, <Fact id="…" /> or fx("…") instead, or add the sentence to scripts/facts-allow.json with a reason:\n`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`Statutory figures: every watched figure in ${files(CONTENT).length} content files comes from src/data/statutory.ts or is an allowed example.`);
