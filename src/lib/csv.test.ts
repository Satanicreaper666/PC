import { test } from "node:test";
import assert from "node:assert/strict";
import { csvCell, toCsv } from "./csv.ts";

test("formula-like text is neutralised; plain numbers are not", () => {
  assert.equal(csvCell("=HYPERLINK(\"x\")"), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell("+91 98450"), "'+91 98450");
  assert.equal(csvCell("@sum"), "'@sum");
  assert.equal(csvCell("-500"), "-500");
  assert.equal(csvCell("-12.5"), "-12.5");
  assert.equal(csvCell("-x"), "'-x");
});

test("quoting, numbers and empties", () => {
  assert.equal(csvCell('Rao, "Asha"'), '"Rao, ""Asha"""');
  assert.equal(csvCell("two\nlines"), '"two\nlines"');
  assert.equal(csvCell(3.14159), "3.14");
  assert.equal(csvCell(Number.NaN), "");
  assert.equal(csvCell(null), "");
  assert.equal(csvCell(undefined), "");
});

test("toCsv: BOM and CRLF by default, BOM optional", () => {
  assert.equal(toCsv([["a", 1], ["b", 2]]), "﻿a,1\r\nb,2\r\n");
  assert.equal(toCsv([["a"]], { bom: false }), "a\r\n");
});
