# PeopleCraft art direction: paper people on woven cloth

Read this before drawing anything for the site. It is the single source of truth for icons, illustrations, covers and the home hero.

## The idea

**Working life in India, cut from paper.** PeopleCraft is a library of documents and a craft brand: the logo is a 3×3 weave, and the home page is a loom. The art extends that world:
- documents are paper;
- people are stick figures cut from strips of paper;
- the cloth they stand on is woven.

Depth comes from real cast shadows between paper layers, never from gradients or glows.

Every picture shows **one HR moment** a reader recognises:
- two people across an interview table;
- someone stepping through a door with a welcome kit;
- a payslip handed over;
- a person leaving with a box, waving.

If a picture doesn't tell a moment or carry information, it doesn't go on the page.

## Materials (the only colours)

| Paper | Token | Hex | Use |
|---|---|---|---|
| Indigo | `--neel-600` | #3B44A6 | Main figures, dark paper |
| Deep indigo | `--neel-800` | #252B68 | Shadows of dark paper, hair-thin detail |
| Pale indigo | `--neel-100` | #DDE1F7 | Background paper, ground |
| Mid indigo | `--neel-300` | #949EE2 | Second figure, furniture |
| Turmeric | `--haldi-400` | #EFAB22 | The one thing that matters in the scene (the payslip, the offer, the key) |
| Light turmeric | `--haldi-200` | #FCD98A | Turmeric's lit edge or a second warm object |
| White paper | `--paper` | #FFFFFF | Documents, highlights |

- One turmeric object per scene. It is the subject of the moment.
- No other hues. No skin tones, no faces, no gendered clothing. Every reader should be able to see themselves.

## Light and shadow

- One light, from the **top left**, everywhere. Shadows fall down and to the right.
- Three depths, used as SVG `filter` or CSS `drop-shadow`:
  - **Layer 1** (paper glued flat): `drop-shadow(0.8px 1.2px 0 rgb(17 20 58 / 0.18))`
  - **Layer 2** (lifted): `drop-shadow(1.5px 2.5px 0 rgb(17 20 58 / 0.14)) drop-shadow(3px 6px 6px rgb(17 20 58 / 0.14))`
  - **Layer 3** (floating, the subject): `drop-shadow(2px 3px 0 rgb(17 20 58 / 0.12)) drop-shadow(6px 12px 14px rgb(17 20 58 / 0.18))`
- These are available as CSS custom properties `--paper-1`, `--paper-2` and `--paper-3` in `src/styles/global.css`. Use `filter: var(--paper-2)` on a `<g>`.
- At most 4 shadowed groups per illustration: shadows are the expensive part on budget phones.

## Stick people

- Built on a unit grid where **1u is the limb thickness**.
- **Head:** a circle, 2.4u in diameter.
- **Torso:** a rounded stroke, 1.3u thick and about 5u long.
- **Limbs:** rounded strokes 1u thick. An arm is 2 segments of 2.6u each; a leg is 2 segments of 3u each. Elbows and knees can bend.
- Draw limbs as `stroke-linecap="round"` paths, so a figure reads as cut from one strip of paper.
- A figure has no face, hands or feet detail. Pose carries everything; it must read in silhouette at 64px tall.
- Use at most 3 figures in a scene, each in a different paper (indigo, mid indigo, white with an indigo outline).
- Props are simple paper shapes:
  - sheet (with a folded corner), clipboard, coin with ₹, chair, table, door, box, ladder or steps;
  - calendar page, laptop, magnifier, badge, plant, flag, shield, scales.

## Icons

Two tiers. Don't mix them up.

- **UI icons (16–24px):** the existing line set in `src/lib/icons.ts`, for controls such as search, arrows, close and print. They stay as line icons, because paper detail fails at 16px.
- **Spot icons (48–96px):** paper-cut, with 2 or 3 layers and a cast shadow. They are a fixed set of 22, named:
  - stages: `recruit`, `onboard`, `grow`, `pay`, `exit`, `lead`;
  - tool kinds: `calculator`, `letter`, `form`, `policy`, `checklist`, `survey`, `plan`, `app`;
  - audiences: `hr`, `founders`, `employees`, `students`;
  - handbooks: `labour-law`, `tds`, `recruitment`, `hr-professional`.

  Use the same 48×48 viewBox, keep the same optical size, and build from the same paper colours.

**Showing spot icons:** a spot icon sits on its own small paper tile that **breaks the top edge of its card**, half outside, casting a shadow onto the card. Never use a pale rounded square behind a line icon; that's the look we are replacing.

## Scenes

Scenes are wide (16:9 or 2:1), 3–5 layers, with at most 3 figures. One per HR moment:
- **Stages:**
  - recruit: two figures across a table, one holding a turmeric sheet;
  - onboard: a figure stepping through a door, with a turmeric badge;
  - grow: a figure climbing steps towards a turmeric flag;
  - pay: a figure receiving a turmeric payslip and a ₹ coin;
  - exit: a figure walking away with a box and waving, with a turmeric relieving letter;
  - lead: a figure at a board pointing to an org chart, with a turmeric node.
- **Audiences:**
  - hr: a figure with a clipboard between two people;
  - founders: a figure watering a turmeric plant beside a tiny shopfront;
  - employees: a figure reading a turmeric payslip;
  - students: a figure in a mortarboard holding a turmeric CV.
- **Empty states:**
  - not-found: a figure with a magnifier over an empty sheet;
  - no-results: a figure looking into an empty box;
  - offline: a figure reading a turmeric copy while the laptop sits dark, its plug on the floor short of the socket.
- **About:** a figure at a loom, weaving a turmeric thread.

## Covers

Each handbook is a piece of cloth woven in one of the four basic structures (`src/lib/weave.ts`):
- labour law: **plain**;
- TDS: **twill**;
- recruitment: **basket**;
- HR professional: **herringbone**.

A paper-cut emblem is pinned on the cloth: scales, a ₹ coin stack, a magnifier or a ladder. The title sits on a sewn-on white label.

## Home hero (the one place for WebGL)

A live paper diorama, built in Three.js:
- the six stages of working life are paper stations along a woven thread road, each with stick people;
- on load, the paper layers settle once into place;
- after that, the pointer (or device tilt) turns the scene a few degrees, so the cast shadows shift.

Rules for the hero:
- Nothing loops.
- Rendering pauses when the hero is off screen or the tab is hidden.
- It loads after first paint.
- The same scene, pre-rendered to an image, is the poster: shown before JavaScript, without WebGL, with reduced motion, and on phones under 600px.
- Everything is bundled locally. No CDNs; the site's CSP forbids them and the privacy promise depends on it.

## Accessibility and performance

- A decorative picture gets `aria-hidden="true"`. A picture that carries meaning on its own gets a `role="img"` and an `aria-label` describing the moment.
- No looping motion. Hover and focus may lift a paper layer by 1–2px. Respect `prefers-reduced-motion`.
- SVG first. Keep each scene under 8 KB and each spot icon under 2 KB, minified.

## Marks and stationery: the desk of a careful HR reader

The second half of the identity. PeopleCraft pages look like an expert has already read them:
- a highlighter has been across the facts;
- pen marks show what is right and what is wrong;
- corrections are whited out and rewritten;
- the notes are on ruled paper.

Every piece of stationery means one thing. Never use one as decoration. The layout underneath stays clean and typographic.

| Stationery | Means | Where it appears | Component or class |
|---|---|---|---|
| Yellow highlighter | The number or fact to remember | "In short" numbers, a calculator's result, the key figure in a card | `.hl` |
| Pink highlighter | A deadline or a risk | Time limits in "In short", penalty amounts, risk titles | `.hl.hl-pink` |
| Green highlighter | What to do, or what you get | "Use it when", what a tool produces, a strong interview answer | `.hl.hl-green` |
| Blue highlighter | A defined term | Glossary headwords, terms in text | `.hl.hl-blue` |
| Orange highlighter | New under the 2025–26 rules | "New" labels, changed rules | `.hl.hl-orange` |
| Blue pen tick | Right, done, or checked | Green flags, good practice, completed checklist items, the checked stamp | `marks/PenTick.astro` |
| Red pen cross | Wrong, or avoid | Red flags, common mistakes, "don't" lists | `marks/PenCross.astro` |
| Red pen strike | A myth or an old habit | "Common mistakes" phrasing, superseded advice | `marks/PenStrike.astro` |
| Whitener (correction tape) | The law changed | Old form or section names covered over, with the new name written on top | `marks/Correction.astro` |
| Pen circle | Don't miss this | One deadline or number per section, at most | `marks/PenCircle.astro` |
| Wavy pen underline | The legally binding word | "must", "within", "at least" in a key sentence | `marks/PenUnderline.astro` |
| Pencil | Provisional: an example or an assumption | Worked examples, sample figures, "example only" notes | `.pencil` |
| Handwriting (Caveat) | A margin note from the expert | A note of six words or fewer with an arrow; never body text | `marks/MarginNote.astro`, `.hand` |
| Ruled notepaper, red margin line | Notes and summaries | "In short", FAQs, the glossary | `.notepaper` |
| Sticky note | A tip to act on | Tips and "before you send it" (yellow); warnings (pink); good practice (green) | `marks/StickyNote.astro` |
| Catalogue card | A reference entry | Glossary terms | glossary page |
| Rubber stamp | Verified against sources | "Facts checked" | `content/Checked.astro` |
| Washi tape, staple, paper clip | Holds a note to a page | Only to attach a sticky note, or the author photo | `.tape` |

Rules:
- Use at most one pen circle per section.
- Write handwriting in English, in six words or fewer, and never use it for anything the reader must read to understand the page.
- Marks draw in once, when they scroll into view (`data-mark`, handled by `site.ts`), and never loop. With reduced motion they are simply there.
- Every mark's meaning is also in the text. A screen reader user hears "previously Form 16" or "avoid"; colour and ink are never the only signal.
