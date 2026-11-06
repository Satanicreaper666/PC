import { test } from "node:test";
import assert from "node:assert/strict";
import { optedOut, pathOnly } from "./analytics.ts";

test("only the path is sent: calculator inputs and search words never leave the page", () => {
  assert.equal(pathOnly("https://peoplecraft.vercel.app/toolkit/take-home-salary-calculator/?ctc=9%2C00%2C000&state=KA"), "https://peoplecraft.vercel.app/toolkit/take-home-salary-calculator/");
  assert.equal(pathOnly("https://peoplecraft.vercel.app/search/?q=gratuity"), "https://peoplecraft.vercel.app/search/");
  assert.equal(pathOnly("https://peoplecraft.vercel.app/handbooks/tds/salary-tds/#form-16"), "https://peoplecraft.vercel.app/handbooks/tds/salary-tds/");
  assert.equal(pathOnly("https://peoplecraft.vercel.app/learn/"), "https://peoplecraft.vercel.app/learn/");
});

test("Do Not Track and Global Privacy Control opt a visitor out", () => {
  assert.equal(optedOut({ doNotTrack: "1" }), true);
  assert.equal(optedOut({ globalPrivacyControl: true }), true);
  assert.equal(optedOut({ doNotTrack: "0", globalPrivacyControl: false }), false);
  assert.equal(optedOut({}), false);
});
