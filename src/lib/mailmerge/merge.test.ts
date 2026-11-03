import { test } from "node:test";
import assert from "node:assert/strict";
import { renderTemplate } from "../template.ts";
import { BLANK, decodeEntities, mergeHtml, mergeNodes, parseHtml, plainText, toHtml } from "./merge.ts";

const fields = [
  { id: "name", label: "Name", required: true, type: "text" },
  { id: "dept", label: "Department", required: false, type: "text" },
  { id: "note", label: "Note", required: false, type: "textarea" },
  { id: "pay", label: "Pay", required: false, type: "money" }
];
const body = `Dear {{name}},

Department: {{dept}}

{{note}}

- Item for {{name}}
- Optional {{dept}}

| Component | Amount |
| --- | --- |
| Pay | {{pay}} |
| Total | {{pay}} |

Dated {{today}}. Unknown {{nope}}.`;
const html = renderTemplate(body, fields);
const letter = { today: "2 November 2026", keepEmpty: false, blank: "label" as const };

test("parses and re-serialises marked's HTML without changes", () => {
  assert.equal(toHtml(parseHtml(html)), html);
  const odd = `<p a='x"y' b=plain c>Hi<br/>there &amp; <!-- note -->you</p>`;
  assert.equal(toHtml(parseHtml(odd)), `<p a="x&quot;y" b="plain" c="">Hi<br>there &amp; you</p>`);
});

test("fills placeholders, escaping the values", () => {
  const out = mergeHtml(html, { name: "Asha <Rao> & Co", dept: "HR", note: "", pay: "₹45,000" }, letter);
  assert.ok(out.includes(`<span class="ph filled" data-f="name" data-type="text" data-label="Name">Asha &lt;Rao&gt; &amp; Co</span>`));
  assert.ok(out.includes("2 November 2026"));
  assert.ok(out.includes("{{nope}}"), "an unknown placeholder stays visible");
  assert.ok(!out.includes(">Note<"), "an empty optional paragraph is left out");
});

test("leaves out paragraphs, list items and table rows whose only placeholders are optional and empty", () => {
  const out = plainText(mergeNodes(html, { name: "Asha", dept: "", note: "", pay: "" }, letter));
  assert.ok(!out.includes("Department"));
  assert.ok(!out.includes("Optional"));
  assert.ok(out.includes("• Item for Asha"));
  assert.ok(!out.includes("Pay |"), "both table rows go");
  assert.ok(out.includes("Component | Amount"), "the header row stays");
});

test("a required field that is empty stays, as its label on screen or a blank line in the file", () => {
  const screen = mergeHtml(html, { name: "" }, letter);
  assert.match(screen, /<span class="ph" data-f="name"[^>]*>Name<\/span>/);
  const file = plainText(mergeNodes(html, { name: "" }, { ...letter, blank: "line" }));
  assert.ok(file.startsWith(`Dear ${BLANK},`));
});

test("forms keep empty optional blocks, as lines to fill in by hand", () => {
  const out = plainText(mergeNodes(html, { name: "Asha" }, { ...letter, keepEmpty: true, blank: "line" }));
  assert.ok(out.includes(`Department: ${BLANK}`));
  assert.ok(out.includes(`Pay | ${BLANK}`));
});

test("a list whose items are all left out disappears", () => {
  const h = renderTemplate("Intro\n\n- {{dept}}\n- {{note}}\n\nEnd", fields);
  const out = mergeHtml(h, {}, letter);
  assert.ok(!out.includes("<ul>"));
});

test("a list item counts its nested paragraph's placeholders", () => {
  const h = renderTemplate("- First {{name}}\n\n- {{dept}}\n", fields);
  assert.ok(h.includes("<li><p>"), "a loose list wraps items in paragraphs");
  const out = mergeHtml(h, { name: "Asha" }, letter);
  assert.equal((out.match(/<li>/g) ?? []).length, 1);
});

test("multi-line values keep their line breaks", () => {
  const out = mergeHtml(html, { name: "Asha", note: "Line one\nLine <two>" }, letter);
  assert.ok(out.includes("Line one<br>Line &lt;two&gt;"));
  const text = plainText(mergeNodes(html, { name: "Asha", note: "Line one\nLine two" }, letter));
  assert.ok(text.includes("Line one\nLine two"));
});

test("plain text: blank lines between blocks, numbered lists, entities decoded", () => {
  const h = renderTemplate("**Subject: R&D's offer**\n\n1. One\n2. Two\n\n---\n\nBye", []);
  assert.equal(plainText(parseHtml(h)), "Subject: R&D's offer\n\n1. One\n2. Two\n\nBye");
  assert.equal(decodeEntities("&#39;&quot;&amp;&#x20B9;&nbsp;&unknown;"), `'"&₹ &unknown;`);
});
