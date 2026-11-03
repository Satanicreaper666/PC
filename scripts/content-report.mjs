/**
 * Quick editorial report over the content collections: one line per page
 * with its checked date, sources, FAQs, words, diagrams and draft state,
 * plus warnings for things the content guide requires.
 *
 * Usage: node scripts/content-report.mjs [--warnings-only]
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const onlyWarn = process.argv.includes("--warnings-only");
const DIAGRAMS = ["Timeline", "Flow", "Breakdown", "Formula", "DecisionTree", "Matrix", "Cycle", "KeyNumbers", "Compare", "Figure"];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
}

function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] } : { fm: "", body: src };
}
const has = (fm, key) => new RegExp(`^${key}:`, "m").test(fm);
const val = (fm, key) => (fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m")) || [])[1]?.trim();
const countList = (fm, key) => {
  const m = fm.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-[\\s\\S]*?)(?=^\\S|$(?![\\s\\S])))`, "m"));
  if (!m) return /\[\s*\]/.test(val(fm, key) ?? "") ? 0 : val(fm, key) ? 1 : 0;
  return (m[1].match(/^\s{0,4}-\s/gm) || []).length;
};

let warnings = 0;
for (const coll of ["handbooks", "toolkit"]) {
  const files = walk(path.join(root, "src/content", coll)).filter((f) => /\.mdx?$/.test(f)).sort();
  console.log(`\n${coll} (${files.length})`);
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const { fm, body } = frontmatter(src);
    const rel = path.relative(path.join(root, "src/content"), f);
    const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const diagrams = DIAGRAMS.reduce((n, d) => n + (body.match(new RegExp(`<${d}[\\s>]`, "g")) || []).length, 0);
    const sources = countList(fm, "sources");
    const faq = countList(fm, "faq");
    const draft = /^draft:\s*true/m.test(fm);
    const checked = val(fm, "checked") ?? "—";
    const w = [];
    if (!has(fm, "checked")) w.push("no checked date");
    if (coll === "handbooks" && sources === 0) w.push("no sources");
    if (coll === "handbooks" && diagrams === 0) w.push("no diagram");
    if (draft) w.push("draft");
    if (/\b(TODO|TBD|lorem ipsum|XXX)\b/i.test(src)) w.push("placeholder text");
    if ((val(fm, "description") ?? "").length > 200) w.push("description > 200 chars");
    warnings += w.length;
    if (!onlyWarn || w.length) {
      console.log(`  ${rel.padEnd(62)} ${checked.padEnd(11)} src:${String(sources).padStart(2)} faq:${String(faq).padStart(2)} words:${String(words).padStart(5)} diag:${diagrams}${w.length ? "  ! " + w.join(", ") : ""}`);
    }
  }
}
const gl = path.join(root, "src/content/glossary.json");
if (fs.existsSync(gl)) {
  const terms = JSON.parse(fs.readFileSync(gl, "utf8"));
  const list = Array.isArray(terms) ? terms : Object.values(terms);
  const ids = new Set(list.map((t) => t.id));
  const badSee = list.flatMap((t) => (t.seeAlso ?? []).filter((s) => !ids.has(s)).map((s) => `${t.id}→${s}`));
  console.log(`\nglossary: ${list.length} terms${badSee.length ? `  ! seeAlso to missing terms: ${badSee.slice(0, 10).join(", ")}` : ""}`);
  warnings += badSee.length;
}
console.log(`\n${warnings} warning${warnings === 1 ? "" : "s"}`);
