/**
 * Everything a reader saves must be removable by the privacy page's "Clear everything"
 * button, which deletes localStorage keys matching CLEAR_PATTERN. This finds every
 * storage key the code defines and checks it matches.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const files = (d: string): string[] =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|astro)$/.test(f) && !f.endsWith(".test.ts") ? [p] : [];
  });

const privacy = readFileSync(join(root, "src/pages/privacy.astro"), "utf8");
const clearSource = /if \((\/[^/]+\/[a-z]*)\.test\(k\)\)/.exec(privacy)?.[1];

test("the privacy page clears keys by a pattern this test can read", () => {
  assert.ok(clearSource, "privacy.astro should test each key with a regex literal");
});

test("every localStorage key in the code is cleared by the privacy page", () => {
  const [, body, flags] = /^\/(.*)\/([a-z]*)$/.exec(clearSource!)!;
  const clears = new RegExp(body, flags);
  const keys = new Set<string>();
  for (const f of files(join(root, "src"))) {
    const t = readFileSync(f, "utf8");
    if (!/localStorage/.test(t) && !/KEY\s*=/.test(t)) continue;
    // const STORE_KEY = "…", KEY = `pc-…${id}`, setItem("…"), getItem("…")
    for (const m of t.matchAll(/\b[A-Z_]*KEY\s*=\s*["'`]([^"'`$]+)/g)) keys.add(m[1]);
    for (const m of t.matchAll(/\b[a-z]*Key\s*=\s*["'`]([^"'`$]+)/g)) keys.add(m[1]);
    for (const m of t.matchAll(/localStorage\.(?:setItem|getItem|removeItem)\(\s*["'`]([^"'`$]+)/g)) keys.add(m[1]);
  }
  assert.ok(keys.size >= 10, `expected to find the site's storage keys, found ${keys.size}`);
  const missed = [...keys].filter((k) => !k.startsWith("/") && !clears.test(k));
  assert.deepEqual(missed, [], `keys "Clear everything" would leave behind: ${missed.join(", ")}`);
});
