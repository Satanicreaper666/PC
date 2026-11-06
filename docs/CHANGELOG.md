# PeopleCraft rebuild: what changed and why

## 6 November 2026: anonymous visit counts

Vercel Web Analytics, at the owner's request. It uses no cookies, and `src/scripts/analytics.ts` sends only the page path: calculator inputs (salaries, dates) and search words sit in the query string, so it is stripped before anything is sent, along with `#` fragments. Visitors whose browser sends Do Not Track or Global Privacy Control aren't counted. It is built in only when the site is built on Vercel, so local, CI and Apache builds load nothing. The privacy page has a new "Counting visits" section, and "no tracking" became "no cookies" on the home page, About, Learn and in the footer.

---

## 4 November 2026: audit fixes, merged with Learn

A 360° audit (`docs/audit-2026/REPORT.md`) and the fixes that followed (`docs/audit-2026/FIX-LOG.md`), merged with the Learn update above.

- **Trust:** stamps say "Sources checked … · expert review pending" until a qualified reviewer is recorded (`reviewedBy`, `reviewed` in front matter), and every sources footer says the page was drafted with AI assistance. "How we check" now describes what actually happens.
- **One place for figures:** statutory figures in chapters, tools, the glossary and Learn come from `src/data/statutory.ts` (`<Fact>`, `fx()`, `{{fact:…}}`); `npm run check:facts` fails the build on a typed figure. Bonus ceilings and rates added as facts. Official EPFO and ESIC sources added; figures with only secondary sources are labelled.
- **Calculators and search:** gratuity cautions people just short of five years; search understands shorthand, filler words and typos.
- **Speed and phones:** subset fonts (pages 30–45% lighter, LCP 2.0–2.4 s), tools on the first screen on phones, light JPEG share images with a card per calculator, Learn's models page no longer jumps on load.
- **Security and accessibility:** inline scripts hash-locked by a per-page CSP, header parity between Vercel and Apache checked, npm audit clean; no axe violations on any page.
- **New:** `/changes/` with RSS, WhatsApp and share buttons, the landing page kept for offline use, CI on GitHub Actions with Lighthouse budgets and a daily uptime check.

---

## 4 November 2026: PeopleCraft Learn

A free, visual, self-paced HR course at `/learn/`.

**What it's built from**
- What **XLRI** teaches in its PGDM (HRM), based on its 2025–2027 prospectuses.
- What **CIPD** teaches in its Level 5 and Level 7 diplomas, based on the 2026 specifications and the Profession Map.
- What **SHRM** tests in SHRM-CP and SHRM-SCP, based on the 2026 BASK and the 2026 Handbook.
- The standard HR books, Indian law as in force on 4 November 2026, and 2025–26 practice.

The research behind it (about 100,000 words, with sources and confidence tags) sits outside the repo, in the owner's `HRM/HR-Research_XLRI-CIPD-SHRM/` folder.

**Who it's for:** HR professionals with 2–8 years' experience who are moving into business-partner or strategic roles, many of them preparing for SHRM or CIPD.

**What's in it**
- **20 modules and 3 guides** (`src/content/learn/`, new `learn` collection), each taking 20–35 minutes. Every module follows the same rhythm:
  - a fictional Indian workplace situation;
  - the big idea;
  - pictures;
  - a worked example;
  - "Where experts disagree";
  - "In India";
  - a branching scenario;
  - "Try it at work";
  - check-yourself questions;
  - model cards, a bookshelf and a printable cheat sheet.
- **New diagrams:** Pyramid, Iceberg, Spectrum, Funnel and Venn, joining the existing library. **New learning components:**
  - Quiz, with instant feedback and SHRM-style "best response" judgement questions;
  - Scenario, a branching case that still works without JavaScript;
  - Worked, ModelCard, SchoolMap, Bookshelf, CheatSheet and ModuleThread.
- **Hub `/learn/`:**
  - a woven course map of 6 blocks and 20 modules;
  - a 2-minute "where to start" self-check;
  - a guide to how a module works;
  - the three guides: how the course works, which credential to take from India, and a map of what XLRI, CIPD and SHRM teach.
- **`/learn/models/`:** every theory and model as a card, with an A–Z index and a filter.
- **`/learn/practice/`:** every question in one practice bank, filterable by module, type and level, plus a random "mixed set of 10".
- **Integration:**
  - Learn is in the header, footer and home page, and in the start-here paths;
  - `learn/…` refs work in `related`;
  - Learn has its own search filter and OG image;
  - new glossary terms are drawn from the modules.

**Decisions**
- **No progress tracking, CPD log or flashcards.** The owner chose quizzes, exam-style practice and branching scenarios. Nothing a learner does is stored or sent.
- **Books are described, never quoted.** Each model carries its originator, year and citation. Writers used only DOIs and links they could confirm.
- **Changing facts live in one data file.** Exam fees, windows and membership costs are in `src/data/credentials.ts`, with source, as-at date and confidence, just as statutory numbers are in `statutory.ts`.
- **Law-heavy modules were reviewed independently.** Modules 8, 10, 11 and 12, plus the regulation claims in 16 and 17, were fact-reviewed by a separate agent before publishing.

**Corrections to existing pages, found during the Learn research and review**
- **Free annual health check-ups** (labour law chapters 03 and 09). The Central Rules 2026 apply them to employees aged 40 and above in dock work, mines and building or construction work, plus classes notified later. They do not cover all workers aged 40 and above. Wider coverage exists only in some state rules, many of them still drafts. Source: SCC Online summary of the OSH Central Rules 2026, 13 May 2026.
- **Monthly pay date** (`wages.monthlyPayDay`). Code on Wages s.17(1) allows payment up to the 7th, so the text now says "by the 7th of the next month", not "before the 7th".
- **Captions on phones.** Compare tables now stack into cards on phones, so the "scroll the table sideways" caption in the competency-model chapter was updated.
- **Glossary.** 58 new terms from the Learn modules, bringing the total to 251.

The writers' contract is `docs/LEARN-GUIDE.md`.

---

Rebuild completed 3 November 2026. It replaces the live site at peoplecraft.vercel.app, a 13-page static site:
- the home page;
- four handbook pages (labour law, TDS, recruitment, HR professional);
- the HR toolkit and people analytics;
- the JD library, org chart builder and mail merge;
- the About page;
- an admin panel and an OG generator page.

The page-by-page, element-by-element audit of the old site is in `docs/audit/`.

## Direction

- **From a paid subscription to a free public library.** All pricing, checkout, refund and "executive access" copy is gone. So are the unverifiable proof points: "2,847 professionals", "4.9/5", the three named testimonials and "India's fastest-growing".
- **Four readers, one library:**
  - HR professionals;
  - founders and small businesses;
  - employees;
  - students and job seekers.

  Each has a "Start here" reading path through the same content.
- **Organised by the employee lifecycle** (Recruit, Onboard, Grow, Pay and comply, Exit, Lead), kept from the original toolkit and now the spine of the whole site.

## Brand and design

- New identity, "the weave":
  - a woven 3×3 mark with one turmeric thread;
  - Neel (indigo) and Haldi (turmeric) palettes named after Indian textile dyes;
  - Anek Latin variable type with a stretched width for headings.
- Signature home-page "loom": stages × formats, where each knot shows how much the library holds at that crossing and opens the list.
- Generated brand files: SVG favicon, app icons (including maskable), 1200×630 social images per section, web manifest.
- One icon set drawn for the subject (no emoji), consistent radius and shadow hierarchy, a print stylesheet, and visible keyboard focus everywhere.

## Structure and pages

- New pages:
  - home;
  - Start here, plus four reader paths;
  - handbooks shelf and four handbook pages;
  - one page per chapter;
  - toolkit with filters by type and stage;
  - one page per tool;
  - people analytics;
  - an A–Z glossary with live filter;
  - full search;
  - About and How we check facts;
  - Privacy, Terms of use and Disclaimer;
  - a 404 page.
- Each long single-page handbook is now a set of chapter pages. Each chapter has a sticky table of contents, an "In short" box, an executive snapshot (biggest risks, common mistakes, cost of getting it wrong), FAQs, sources, previous/next chapter links and related tools.
- Every old URL redirects (301), and old in-page links such as `#c3` and `#fc7` are forwarded to the new chapter or tool.

## Content

- All four handbooks rewritten in plain Indian English and checked against the law in force on 2 November 2026:
  - the four Labour Codes (in force from 21 November 2025) and their Central Rules (May 2026);
  - the Income-tax Act, 2025 and Rules, 2026 (from 1 April 2026);
  - the new EPF wage ceiling of ₹25,000 (from 17 September 2026);
  - West Bengal's new professional tax slabs (from October 2026);
  - the Supreme Court's March 2026 ruling on adoptive mothers' maternity benefit;
  - DPDP Act phasing.
- Every chapter and tool shows "Facts checked" with the date and number of sources, and lists those sources.
- Statutory numbers live in one file (`src/data/statutory.ts`) with source, date and confidence. Calculators and text read from it.
- Unsettled points (for example, when the two-working-day clock for final wages starts) are labelled as unsettled instead of being stated as fact.
- Diagrams throughout: timelines, process flows, decision trees, formulas, breakdowns, matrices, cycles, key numbers and comparisons. They draw themselves in on screen, and work in print and with reduced motion.
- A new glossary of Indian workplace terms, each linked to the chapter or tool that goes deeper.

## New modules carried over from the live site

- **About:** Akash's story, photo, credentials and contact routes now lead the page. The footer credits him on every page. AI assistance is disclosed, with how facts are checked.
- **JD library:** 50 job descriptions. Each can be filled in with company details and downloaded as Word, and comes with interview questions, what a strong answer shows, and signals for the panel. There is also a blank JD template. Unsourced salary bands, "market intelligence" trends and the rule-based "AI generator" are removed. Each JD links to the salary band designer instead.
- **Org chart builder:**
  - works on a CSV or Excel file in the browser: auto hierarchy, data checks (orphans, cycles, duplicates), span-of-control analysis with editable thresholds, and an accessible tree view;
  - exports to SVG, PNG and PowerPoint (generated on the device; no CDN).
- **Mail merge:** works with every letter in the toolkit. Download a CSV template, upload your sheet, check each row, then download all letters as one Word file or print them.
- **Removed:** the admin panel and Firebase login (left over from paid tiers), Vercel Analytics, and Google Fonts. The About page's promise of "No login. No tracking" is now true.

## Toolkit

- Calculators:
  - each has a visible formula, worked examples tested in code and a shareable link;
  - each shows its as-at date and source.
- Letters, forms and policies:
  - fill in fields, see the document update live, and download as Word (.docx), print or save as PDF;
  - drafts stay in the browser.
- Checklists remember ticks and show progress per section. Surveys and self-assessments score instantly with bands.
- People analytics reads a CSV or Excel file entirely in the browser and never uploads it.
- The original form codes (PC-F-01 to PC-F-08) are kept so existing users can find their forms.

## Engineering

- Static site (Astro) with content collections, so every chapter and tool follows one schema.
- No trackers, ads, cookies or third-party requests. The font is self-hosted.
- Offline search (Pagefind), loaded only when used, with Ctrl/⌘K or `/` from any page and a full search page.
- SEO:
  - one H1 per page, plus a canonical URL and Open Graph/Twitter tags;
  - JSON-LD: WebSite with SearchAction, Organization, BreadcrumbList, Article, FAQPage, Book, DefinedTermSet, WebApplication and DigitalDocument;
  - sitemap and robots.txt.
- Deploy files for Vercel (`vercel.json`) and Hostinger (`.htaccess`): redirects from all 13 old URLs, trailing slashes, caching and security headers with a strict Content-Security-Policy.
- Checks: type check, calculator unit tests, internal link checker (including #anchors), content report.

## Accessibility

- WCAG 2.2 AA:
  - landmarks, a skip link and labelled controls;
  - visible focus;
  - keyboard support for search, menus and the loom;
  - contrast checked.
- Content never depends on animation, and reduced motion is respected.
- Diagrams are real text, with group labels.

## Removed

- Pricing and checkout, subscription FAQs, testimonials and avatars, rating badges, user counts, fake dashboard, rotating headlines, the topic marquee, mouse-tracking orbs, the floating emoji chat bubble, and roadmap dates that had passed.
- Dark mode, for now. The site ships one well-tested light theme and a print stylesheet.

## The redesign (3 November 2026)

The owner's feedback on the first build was that it looked plain, the cards looked generated, and the page headers had empty right halves. The redesign answers each point with something that means something.

- **Art.** 24 paper-cut spot icons (stages, tool kinds, readers, handbooks, JD, glossary) and 14 stick-figure scenes. One `Figure` primitive draws every person, so they look like one family (`src/components/art/`).
- **Covers.** Each handbook is woven in a different basic structure (plain, twill, basket, herringbone), with a paper-cut emblem and a sewn-on label (`src/lib/weave.ts`, `BookCover.astro`).
- **Headers that use their space.**
  - Chapters show where they sit in the book, as a thread of chapter knots.
  - Tools show where they fit in working life, plus a letter's real sections, a calculator's inputs and output, or a survey's scoring bands.
  - JDs show a level ladder, the experience range, the skill mix and the interview kit.
  - Hub pages show what is inside them.
- **Cards.** Each card's edge says what kind of paper it is:
  - a letter has a folded corner;
  - a calculator is a torn slip;
  - a checklist is a punched pad page;
  - a chapter is bound in its book's cloth;
  - a JD is an ID card;
  - a term is a catalogue card.

  The paper-cut icon is pinned over the top edge.
- **Marks and stationery.** Highlighters, pen ticks and crosses, red-pen strikes, pen-circled numbers, pencil for examples, handwritten margin notes (Caveat, self-hosted), notepaper, sticky notes, and an erratum slip for names the law changed. The meanings are fixed in `docs/ART-DIRECTION.md`.
  - "In short" summaries highlight deadlines and key numbers automatically (`src/lib/marks.ts`).
  - The first mention of a glossary term in a chapter links to its definition, with a catalogue-card tooltip (`src/lib/term-links.ts`).
- **Home hero.** A three.js paper diorama of working life, which loads after first paint. A still image covers phones, reduced motion and browsers without WebGL.
- **New letters.** Show-cause notice, warning letter, probation confirmation letter and internship certificate. These are the four letter types the old mail merge had.

## More working tools (3 November 2026)

The owner asked for more functionality across the tools and the site. Each addition answers a job HR actually does. Everything is still kept in the reader's own browser, and the privacy page's button clears all of it.

- **My desk** (`/desk/`). Pin any chapter, tool, JD or glossary term. The desk also shows drafts and checklists in progress, reading progress per handbook ("3 of 10 chapters read") and the last 12 pages opened. Chapters gain a "Before" and "Next" thread showing which chapters have been read, and a "Copy link" button on every section heading.
- **Works offline.** A service worker (`public/sw.js`) keeps a copy of every pinned page and the 80 pages opened most recently, with the files they need, for factory floors and weak mobile data.
  - Pages are network first, so they are never stale when you're online. After 4 seconds without an answer, the saved copy opens instead.
  - A page that isn't saved opens the offline page (`/offline/`). It names the page, lists what is saved, and reloads once the connection is back.
  - Each deploy gets fresh caches. Copies from the previous build are kept until the next one, so pages opened last week still open after a deploy.
  - Off in the sub-path preview and in development.
- **Letters, forms, policies and JDs.**
  - Company details and a letterhead logo fill every new letter, on screen and in the Word file.
  - The last 10 people filled in carry over to the next letter: name, role, dates and pay. PAN, Aadhaar, bank details and date of birth are never kept.
  - Several named drafts per template.
- **Checklists** take an owner and a due date per item, show overdue items in pink, and download as CSV. **Surveys** can collect several people's answers on one device, then score them as a team.
- **Calculators.**
  - Save up to 8 named scenarios per calculator and compare them side by side, with the differences against a chosen base.
  - Copy the table or download it as CSV.
  - "How this was worked out" shows every step: the formula in pencil, the answer in pen.
  - Sticky-note warnings flag unusual inputs, such as a gratuity claim just short of 4 years and 240 days, while the result stays on screen.
- **Fixes found on the way:**
  - amounts in calculator breakdowns broke mid-number on phones;
  - white percentage labels on red bar segments were below AA contrast.
