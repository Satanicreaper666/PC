/**
 * The site's real letters, end to end: every placeholder is a declared field,
 * the sample data matches every column, and every row merges cleanly.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dayNum } from "../analytics/dates.ts";
import { buildLibrary, MERGE_FORMS, usedFields, type ToolEntry } from "./library.ts";
import { autoMap } from "./mapping.ts";
import { mergeNodes, plainText } from "./merge.ts";
import { checkRows, summarise } from "./rows.ts";
import { sampleMergeTable, SAMPLE_ROWS } from "./sample.ts";
import { longDate } from "./values.ts";

const dir = new URL("../../content/toolkit/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
const split = (src: string) => {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { front: m[1], body: m[2] } : { front: "", body: src };
};
const kindOf = (front: string) => front.match(/^kind:\s*(\S+)/m)?.[1] ?? "";

test("every placeholder in a letter or mergeable form is one of its fields", () => {
  for (const f of files) {
    const { front, body } = split(readFileSync(new URL(f, dir), "utf8"));
    const id = f.replace(/\.md$/, "");
    if (kindOf(front) !== "letter" && !MERGE_FORMS.includes(id)) continue;
    const declared = new Set([...front.matchAll(/\bid:\s*"?([a-z][a-z0-9_]*)/g)].map((m) => m[1]));
    for (const p of usedFields(body)) if (p !== "today") assert.ok(declared.has(p), `${f}: {{${p}}} has no field`);
  }
});

// The full pipeline needs a YAML parser for the frontmatter. Astro brings one;
// if it ever doesn't, skip rather than fail.
const yaml = await import("yaml").catch(() => null);

test("the real letters merge cleanly with their sample data", { skip: !yaml && "no YAML parser installed" }, () => {
  const entries: ToolEntry[] = files.map((f) => {
    const { front, body } = split(readFileSync(new URL(f, dir), "utf8"));
    const data = yaml!.parse(front) as ToolEntry["data"] & { draft?: boolean };
    data.fields = (data.fields ?? []).map((x) => ({ ...x, type: x.type ?? "text", required: x.required ?? false }));
    return { id: f.replace(/\.md$/, ""), body, data };
  });
  const lib = buildLibrary(entries);
  assert.ok(lib.filter((t) => t.kind === "letter").length >= 8, "the site's letters are all there");
  const today = dayNum(2026, 11, 2);
  for (const t of lib) {
    const sample = sampleMergeTable(t, today);
    const { map } = autoMap(t, sample.headers, sample.rows);
    assert.equal(Object.keys(map).length, t.fields.length, `${t.id}: every sample column is matched`);
    const rows = checkRows(t, sample.rows, 2, map, "dmy");
    assert.equal(rows.length, SAMPLE_ROWS);
    const s = summarise(rows);
    // The samples break one required detail (letters) and one required date (when there is one).
    const firstGroup = t.fields[0]?.group;
    const hasReqDate = t.fields.some((f) => f.type === "date" && f.required && (t.kind !== "form" || f.group === firstGroup));
    assert.equal(s.fix, (t.kind === "letter" ? 1 : 0) + (hasReqDate ? 1 : 0), `${t.id}: the deliberate mistakes are caught`);
    assert.equal(rows[0].status, "ready", `${t.id}: ${rows[0].problems.map((p) => p.label + " " + p.message).join("; ")}`);
    for (const r of rows) {
      const text = plainText(mergeNodes(t.html, r.values, { today: longDate(today), keepEmpty: t.kind === "form", blank: "line" }));
      assert.ok(!text.includes("{{"), `${t.id}: no placeholder left behind`);
      assert.ok(text.length > 100);
    }
  }
});
