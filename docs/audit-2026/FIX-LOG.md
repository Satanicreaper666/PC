# Fix log: what happened to each audit finding

Follows [REPORT.md](REPORT.md) (3 November 2026). Work is on branch `claude/peoplecraft-site-fixes` of `Satanicreaper666/PC`. The first commit on the branch imports the site exactly as it was deployed, so every fix after it is a reviewable diff.

**Status key:** Fixed · Partly fixed · Verified (checked, nothing to fix) · Not fixed: owner (needs a decision or action only the owner can take) · Not fixed: reason given.

## The live site on Vercel (checked 3 Nov 2026)

| What | Finding |
|---|---|
| Project | `peoplecraft-hr-os` (team "akashmukund1996-2155's projects"), production domain `peoplecraft.vercel.app`. No custom domain. |
| How it deploys | Uploaded from the Vercel CLI (`source: cli`). **The project is not connected to a Git repository**, so pushing to GitHub does not deploy anything by itself. |
| Live vs the audited zip | The live deployment's source matches the zip: all 685 files the API listed are byte-identical. The listing was cut off after that. So every audit finding applies to the live site. |
| Live build log | Clean: 174 pages, Pagefind indexed 149. Warnings: the >500 kB chunk (now raised to 600 kB, the known hero), and Vercel's note that `engines: ">=22"` auto-upgrades (now pinned to `22.x \|\| 24.x`). |
| Web Analytics | **Off.** The Vercel API answers "Web Analytics not found" for this project, and no page loads an analytics script. This closes launch blocker OPS-0. |
| Deployment protection | Vercel Authentication on everything except custom domains. Preview URLs need a Vercel login. |
| Live pages, headers, real-user speed | Not fetched. The audit environment's network blocks `peoplecraft.vercel.app`, and Vercel's fetch tool couldn't reach the deployment. |
| Preview of the fixes | A preview deployment of this branch was built from GitHub on Vercel (see the summary for the link). Production was not changed. |

## Launch blockers

| ID | Status | What changed / what's left |
|---|---|---|
| LEG-1 Legal review | **Not fixed: owner** | It needs a qualified lawyer and CA. The site no longer implies a review happened: every stamp says "expert review pending", and `reviewedBy` / `reviewed` front matter switches it to "Reviewed by …" when a real review happens. |
| CON-1 How we check | **Fixed** | Rewritten to describe what actually happens. Two of its claims are also now true: figures come from one file (enforced by a build check), and secondary-only figures are labelled. |
| TRU-1 "Facts checked" stamp | **Fixed** | Now "Sources checked 2 Nov 2026 · N sources · expert review pending". The sources footer says the page was drafted with AI assistance and checked against these sources. |
| OPS-0 Vercel Analytics | **Verified** | Off (see above). |

## All findings

| ID | Status | What changed | Verified by |
|---|---|---|---|
| LEG-2 Typed-in statutory figures | **Fixed** | About 80 statements of current rules now use `<Fact>`, `fx()` or `{{fact:…}}` tokens. Historical mentions and worked examples (19) are in `scripts/facts-allow.json` with reasons. `npm run check:facts` fails the build on a new typed figure and flags examples whose figure changed. | Check passes on 149 files. A text diff of the 15 edited pages shows only the intended wording changes. |
| LEG-3 Vendor-only sources | **Partly fixed** | EPFO (FAQ, rate sheet, employer booklet, EPS handbook) and ESIC (contribution page, FAQ) official sources added. Facts with no official source: 15 → 4. Those 4, and 14 states' professional tax, are now labelled "secondary source only" in the rates panel, the tooltip and the PT result. | Script count. |
| LEG-4 Spot checks | **Verified** | EPF ₹25,000 from 17 Sep 2026 confirmed again. ESI 0.75%/3.25%, ₹21,000/₹25,000 and ₹176 confirmed on esic.gov.in. Bonus ceilings ₹21,000/₹7,000 (S.O. 4711(E), 25 Aug 2026) confirmed by SCC Online and Khaitan, and added as facts. | Web search, official pages. |
| LEG-5 Unverified facts | **Fixed** | `factText()` throws for any `verified: false` fact, so one can't reach a page. | Build. |
| LEG-6 Template legal review | **Not fixed: owner** | Part of LEG-1. | — |
| CALC-1 Gratuity near miss | **Fixed** | From 4 years 6 months, the result adds a caution about the unsettled 240-day reading. | 2 new tests. |
| CALC-2 Worked examples as tests | **Verified** | The page examples are already tests (e.g. "page example … ₹2,76,923"). Total tests: 276 → 283. | `npm test` |
| CALC-3 Export safety | **Fixed** | One CSV writer (`src/lib/csv.ts`, with tests) and one download helper. The salary band export now escapes and uses CRLF and a BOM. | 3 new tests. |
| CALC-4 Exports and large files | **Partly fixed** | Smoke test with the CSP on: Word download of the offer letter (11 KB .docx), and the people-analytics and org-chart sample datasets render. | Playwright. Not done: 1,000-row files, or opening the .docx in Word, Google Docs and LibreOffice. |
| SEO-1 Domain | **Not fixed: owner** | No custom domain on the Vercel project. The README gives the exact steps once one is chosen. | — |
| SEO-2 Author markup | **Fixed** | Person author (name, role, About page, LinkedIn), `datePublished`, image, and `reviewedBy`/`lastReviewed` when set. | Build output. |
| SEO-3 JD duplication | **Partly fixed** | The ~230-word shared posting advice became a 5-line checklist linking to the chapter. Unique share 33% → 35%; the rest is the fill-in tool and interview-kit interface. | Phrase analysis. Not done: role-specific content (needs writing and review). |
| SEO-4 Long titles | **Fixed** | Chapter titles add the book only if the title fits in 65 characters. Over 65: 45 → 7 (all long role names). | Build output. |
| SEO-5 Sitemap lastmod | **Fixed** | Each page's `checked` date. | Sitemap. |
| SEO-6 Glossary pages | **Not fixed** | Each term is 1–3 sentences, so pages for them would be thin, and writing more AI-drafted legal text before LEG-1 adds to the risk. Do it with the reviewer. | — |
| SEO-7 Share images | **Fixed** | JPEG, 56–75 KB (was ~300 KB PNG), plus one titled card per calculator (21). | File sizes. |
| PERF-1 Fonts | **Fixed** | Subset and axis-limited Anek (61 KB), a 1 KB ₹-only file, and a static Caveat (49 KB). `scripts/make-fonts.sh` rebuilds them. | Lighthouse mobile, 8 pages: LCP 2.1–3.2 s → 2.0–2.4 s; weight 260–361 → 153–218 KiB; performance 90–99 → 96–99. |
| PERF-2 Render-blocking CSS | **Not fixed** | About 19 KB of small CSS files. LCP is now under 2.5 s everywhere tested, so inlining them isn't worth the lost caching. | — |
| PERF-3 Chunk warning | **Fixed** | Warn above 600 kB. | Build log. |
| A11Y-1 Nested asides | **Fixed** | Notes inside content are `role="note"`. | Crawl (below). |
| A11Y-2 Unnamed table regions | **Fixed** | Numbered labels; the headcount and salary band tables no longer give two regions one name. | Crawl: 173 of 173 pages with no axe violations (was 72 of 172). |
| A11Y-3 Letter heading order | **Fixed** | Hidden h2 for the document preview. | Crawl. |
| A11Y-4 Highlight colours | **Verified** | The "In short" box already shows a colour key, and highlighted words carry their meaning in the text. | — |
| A11Y-5 Screen reader pass | **Not fixed: owner** | Needs a person with NVDA or VoiceOver. | — |
| SEC-1 CSP 'unsafe-inline' | **Fixed** | Per-page `<meta>` CSP with sha256 hashes of inline scripts (14 distinct). | 0 CSP errors and 0 console errors across all 173 pages and the smoke tests. |
| SEC-2 npm audit | **Fixed** | `image-size` overridden to 2.0.4 (not used by the browser bundle). | `npm audit`: 0 vulnerabilities. |
| SEC-3 Storage keys | **Fixed** | README corrected, and a test checks every key is cleared. | New test. |
| SEC-4 Header drift | **Fixed** | `.htaccess` matches `vercel.json`; `scripts/check-headers.mjs` runs in CI. | Script. |
| SEC-5 Shared computers | **Fixed** | Reminder added to people analytics, pay equity and org chart. | — |
| UX-1 Phone layout | **Fixed** | Below 640 px the header drops repeated items. First field: 815–1,197 px → 489–645 px on calculators and letters (checklist: 844 px). | Playwright at 390×844. |
| UX-2 Search | **Fixed** | Filler words, synonyms and typo correction, with results merged. "labor code", "gratuty", "releiving letter", "resignation letter format" and "offer letter sample" now find the right page first; "F&F" finds the F&F calculator second. | 37 queries. |
| UX-4 / CON-3 Content gaps | **Not fixed** | New legal pages (payslip, HRA, bonus, LWF …) would be more unreviewed AI-drafted law. Write them alongside the review. | — |
| CON-2 Review cadence | **Fixed** | `check:facts` warns when a page's checked date is over 100 days old. | — |
| CON-4 Template sources | **Not fixed: owner** | Needs the legal reviewer to say which provisions each template relies on. | — |
| VIS-1 Safari | **Not fixed: owner** | No WebKit in this environment. Check on an iPhone and a Mac. | — |
| TRU-2 AI disclosure on pages | **Fixed** | Sources footer on every chapter, tool and JD. | Build output. |
| TRU-3 Credential wording | **Not fixed: owner** | Only you can confirm how each body describes your membership. | — |
| GRO-1 Measurement | **Not fixed: owner** | Add Google Search Console with DNS verification (no script on the pages). | — |
| GRO-2 Follow changes | **Fixed** | `/changes/` and `/changes/rss.xml`, built from the statutory data. Linked from the footer and How we check. | Build output. |
| GRO-3 Sharing | **Fixed** | WhatsApp link and share or copy button on chapters and tools. | Smoke test. |
| GRO-4 Corrections route | **Not fixed: owner** | Choice between mailto, a form or GitHub issues. | — |
| ENG-1 CI | **Fixed** | `.github/workflows/ci.yml` (tests, checks, build, links, audit, Lighthouse budgets). | First run on GitHub (see summary). |
| ENG-2 Facts check | **Fixed** | See LEG-2. | — |
| ENG-3 Duplicate CSV code | **Fixed** | See CALC-3. | — |
| OPS-1 Offline landing page | **Fixed** | The service worker keeps open pages when it activates. | Playwright: the landing page now opens offline. |
| OPS-2 Redirects | **Verified (config)** | Unchanged. Test 3 old URLs on the live site after the next deploy. | — |
| OPS-3 Uptime | **Fixed** | `.github/workflows/uptime.yml` checks 5 URLs daily. | — |

## 4 November 2026: merged with the owner's Learn update

The owner's 4 Nov zip was built on the 3 Nov source, so it was committed on top of the original import (`claude/owner-update-2026-11-04`) and merged into this branch. Three files conflicted: the glossary (the new 251-term version, with the six fact tokens re-applied), `make-assets.cjs` (the owner's option to make only some images, combined with JPEG output and calculator cards) and the home page imports. The new section then got the same fixes as the rest of the site:

| What | Done |
|---|---|
| Typed statutory figures in Learn | Modules 08 and 18 typed the EPF ceiling, ESI and bonus limits and maternity weeks in 9 places. They now come from the data file; 4 worked examples or dated history are allow-listed. Learn's quiz, summary and model fields resolve `{{fact:…}}`. Credentials figures were already read from `src/data/credentials.ts`. |
| Trust and SEO | Expert-review stamp and AI note, reviewer fields, Person author, `datePublished`, share image (JPEG), titles within 65 characters, sitemap lastmod. |
| Sharing | WhatsApp and share buttons on modules and guides. |
| Accessibility | Nested `<aside>` landmarks became notes; module 10's table got a first-column header. **199 of 199 pages pass axe with no violations.** |
| Layout shift | `/learn/models/` rendered its A–Z index open and closed it on phones after load, moving 145 cards: CLS 0.398 → 0.01, performance 80 → 99. |
| Checked | 283 tests, type check, facts and header checks, build (201 pages), 22,905 internal links, 0 CSP or console errors, 0 third-party requests; quizzes, scenarios, practice bank, models and search smoke-tested with the CSP on. |
| Still heavy | `/learn/practice/` renders all 193 questions (19,285 DOM elements; 250 ms blocking time, performance 93). Paging or rendering on demand would help as the bank grows. |

## Still for the owner

1. **Legal review** (LEG-1, LEG-6, CON-4), then record `reviewedBy` and `reviewed` on reviewed pages.
2. **Domain decision** (SEO-1), then Search Console (GRO-1).
3. **Credentials wording** on About (TRU-3).
4. **Safari check** (VIS-1) and a **screen-reader pass** (A11Y-5).
5. **Connect the Vercel project to this GitHub repository** (Vercel → peoplecraft-hr-os → Settings → Git), or keep deploying with `npx vercel --prod` from the repo. Then merge this branch to deploy production.
6. **Content gaps and JD depth** (UX-4/CON-3, SEO-3, SEO-6) once a reviewer is in place.
7. **Learn review:** the 20 modules are AI-drafted too. Modules 8, 10, 11 and 12 and the regulation claims in 16 and 17 had a separate AI fact review, but no qualified human has reviewed them.
