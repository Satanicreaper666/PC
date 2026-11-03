#!/usr/bin/env node
/**
 * The site can be served by Vercel (vercel.json) or by Apache/LiteSpeed (public/.htaccess).
 * Their security headers must say the same thing; this fails when they drift apart.
 * Usage: node scripts/check-headers.mjs
 */
import { readFileSync } from "node:fs";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const all = vercel.headers.find((h) => h.source === "/(.*)").headers;
const fromVercel = Object.fromEntries(all.map((h) => [h.key.toLowerCase(), h.value]));

const htaccess = readFileSync("public/.htaccess", "utf8");
const fromApache = Object.fromEntries([...htaccess.matchAll(/Header always set ([\w-]+) "([^"]*)"/g)].map((m) => [m[1].toLowerCase(), m[2]]));

const problems = [];
for (const [key, value] of Object.entries(fromVercel)) {
  if (!(key in fromApache)) problems.push(`${key}: set in vercel.json, missing from public/.htaccess`);
  else if (fromApache[key] !== value) problems.push(`${key} differs:\n    vercel.json: ${value}\n    .htaccess:   ${fromApache[key]}`);
}
for (const key of Object.keys(fromApache)) if (!(key in fromVercel)) problems.push(`${key}: set in public/.htaccess, missing from vercel.json`);

if (problems.length) {
  console.error(`Security headers differ between vercel.json and public/.htaccess:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`Security headers: vercel.json and public/.htaccess agree (${Object.keys(fromVercel).length} headers).`);
