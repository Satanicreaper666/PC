/**
 * One id per build, the same on every page of it (the module is evaluated once
 * while the site is generated). The header carries it as data-build, and
 * src/scripts/desk.ts registers "/sw.js?v=<id>", so each release of the site gets
 * its own offline cache version and old copies of search and build files are replaced.
 * Server-only: don't import this from browser code.
 */
export const BUILD_ID = new Date().toISOString().slice(0, 16).replace(/\D/g, "");
