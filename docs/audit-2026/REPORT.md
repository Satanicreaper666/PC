# PeopleCraft 360° audit

**Audited:** the uploaded copy `peoplecraft-website-2026-11-03.zip` (Astro 7 source and its built `dist/`), on 3 November 2026.
**Method:** I built and tested the copy and served it locally. Every one of the 172 built pages was crawled at phone (390 px) and desktop (1,280 px) width with Playwright and axe-core. I ran Lighthouse on 8 key pages, sent 35 real search queries to the site's search, worked calculator cases by hand, tested offline copies, and reviewed the code. The full measurements are in [APPENDIX.md](APPENDIX.md).
**Not covered:** the live site (the audit environment's network proxy blocked `peoplecraft.vercel.app`), Vercel dashboard settings, Safari, Firefox and real iPhones, a manual screen-reader pass, opening the Word and PowerPoint exports in Office, Google Docs and LibreOffice, stress tests with big files, and a full legal review. See [What was not tested](#what-was-not-tested).

Severity: **P0** means a launch blocker (possible legal or financial harm to a reader, a broken public promise, or a broken core task), **P1** significant, **P2** should fix, **P3** polish. Effort: **S** under 2 hours, **M** under 2 days, **L** longer.

---

## 1. Executive summary

This is a well-engineered site: fast, accessible, private and well tested. Its biggest risks are about trust, not code. The "How we check facts" page makes promises the site doesn't yet keep, no qualified person has reviewed the legal content, and some statutory numbers rest on vendor blogs rather than official sources.

### Scorecard

| # | Area | Score | Why |
|---|---|---|---|
| 1 | Legal and factual accuracy | **6/10** | Strong structure: one statutory data file, "as at" dates, and unsettled points flagged on the page. But the content was drafted with AI and no legal professional has reviewed it. 15 of 59 statutory facts and 14 of 17 professional-tax states cite no official source. |
| 2 | Calculators and tools | **8/10** | 276 unit tests pass, and every hand-worked case matched (gratuity, EPF, ESI, PT). Output is escaped and exports are safe from spreadsheet formulas. The gratuity result is too absolute for people just short of 5 years. |
| 3 | Technical SEO | **7/10** | Unique titles and descriptions, correct canonicals, and rich structured data (JDs correctly use `Occupation`, not `JobPosting`). Weak points: the site is on a vercel.app address, 45 titles are too long, JD pages are about two-thirds boilerplate, the author is an organisation rather than a person, and the sitemap has no `lastmod`. |
| 4 | Performance | **8/10** | Lighthouse mobile scores 90–99 with no blocking time and no layout shift. Fonts are about 80% of every page's weight (≈256 KB), which keeps Largest Contentful Paint at 2.6–3.2 s. |
| 5 | Accessibility | **9/10** | Zero WCAG A or AA violations across all 172 pages, and Lighthouse accessibility scores of 98–100. Three moderate best-practice issues remain. A manual screen-reader pass is still needed. |
| 6 | Security and privacy | **8/10** | Zero third-party requests and data storage the reader opts into. The security policy (CSP) still lets inline scripts run, which can be fixed easily. One dependency has a high-severity advisory (low real risk), and the two hosts' header settings have drifted slightly. |
| 7 | UX and navigation | **7/10** | Clear navigation and good search for core terms. On phones no calculator is usable without scrolling first. Search misses some shorthand and spellings; "resignation letter format", for example, doesn't find the resignation letter. |
| 8 | Content and editorial | **6.5/10** | Plain, careful writing. But the "How we check" page describes a process the content doesn't follow yet: numbers stored in one place, official sources first, and a human check behind every "Checked on" date. |
| 9 | Visual design and brand | **8.5/10** | Distinctive and polished, with no layout overflow at 390 px. Not tested in Safari, which the README flags as a risk. |
| 10 | Trust and the site's own legal position | **6/10** | AI use is honestly disclosed on the About page. But every page says "Facts checked 2 Nov 2026" with no named reviewer, and the README's "Confirm before launch" list is entirely unchecked. |
| 11 | Growth and sustainability | **4/10** | No way to measure anything, no way for readers to follow law changes, and every page in a section shares one generic share image (300 KB). |
| 12 | Engineering and maintainability | **7/10** | Typed and tested, with a link checker. But there's no CI and no git history (the site exists only as a zip), statutory numbers are typed directly into 18 content files, and CSV export is implemented three times. |
| 13 | Operations and resilience | **6.5/10** | Redirects exist for both hosts, and the 404 and offline pages work. The page a reader first lands on is never saved for offline use, and there is no uptime monitoring or domain decision yet. |

### The 10 most important fixes

1. **Get a qualified labour-law and tax reviewer** to sign off the labour-law and TDS handbooks and the statutory calculators, and name them on the pages (LEG-1, TRU-1).
2. **Make "How we check facts" true, or reword it.** Today it promises numbers "stored once and used everywhere" and secondary sources "never as the only source for a number". Neither is true yet (CON-1, LEG-2, LEG-3).
3. **Move the typed-in statutory figures into `<Fact>`** or a `{{fact:…}}` token, and add a build check that fails when a figure is typed directly into a page (LEG-2, ENG-2).
4. **Add official sources** for the 15 statutory facts and 14 professional-tax states that rely only on vendor or blog sources (LEG-3).
5. **Soften the gratuity "not yet payable" message** for people with 4 or more years of service. Explain the unsettled 240-day question and point them to an adviser (CALC-1).
6. **Decide on the domain before launch** (peoplecraft.in or vercel.app) so canonical links, share images and Search Console start on the final address (SEO-1).
7. **Subset the fonts.** Cutting ~150 KB per page should bring Largest Contentful Paint under 2.5 s on phones (PERF-1).
8. **Put the calculator first on phones.** The first input currently sits 1.1–1.4 screens down (UX-1).
9. **Add search synonyms and typo handling** ("labor", "F&F", "payslip", "format") (UX-2).
10. **Set up CI, add a Search Console property, and add a "What changed" page with an RSS feed** so the site can be maintained and measured without breaking its no-tracking promise (ENG-1, GRO-1, GRO-2).

### Launch verdict: **Not ready to launch yet.** It can go live once the P0 items below are closed.

The engineering is ready. Launch is blocked by the legal review and by the public promises about how facts are checked.

---

## 2. Launch blockers (P0)

| ID | Blocker | Status | What closes it |
|---|---|---|---|
| LEG-1 | No qualified professional has reviewed the AI-drafted labour-law and TDS content or the calculators (README, "Confirm before launch") | Open | A named reviewer signs off; their name and the review date go on reviewed pages |
| CON-1 | "How we check facts" makes three claims the site doesn't meet (see CON-1) | Open | Fix the content (LEG-2, LEG-3) or reword the page to describe what actually happens |
| TRU-1 | Every page says "Facts checked 2 Nov 2026"; the page defines that as the day "someone compared every fact", but it was an AI research pass | Open | Relabel until a human review happens (wording in TRU-1) |
| OPS-0 | Vercel Web Analytics status unknown. If it's on, the "no tracking" promise is broken | **Couldn't check** (no dashboard access) | The owner confirms it is off in Vercel → Project → Analytics |
| — | README items that are still unchecked: open legal points; contact email published on every page; About-page credential wording; terms licence; domain; trademark search; Safari check; deleting the Firebase project | Open | Owner decisions (see [section 7](#7-questions-for-the-owner)) |

---

## 3. Findings by area

### 3.1 Legal and factual accuracy

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| LEG-1 | No qualified professional has reviewed the law content and calculators. The README says all content "was researched and drafted with AI assistance" | `README.md`, "Confirm before launch" (unchecked); `src/pages/about/index.astro:148` | Readers will act on these numbers when paying settlements and filing taxes. Errors cause financial harm and expose you to liability | Hire an employment lawyer and a CA, chapter by chapter, starting with labour-law chapters 02, 04, 06 and 08, TDS chapters 02 and 05, and the gratuity, F&F, EPF, ESI and PT calculators. Record `reviewedBy` and `reviewed` (date) in each file's frontmatter (see TRU-1) | P0 | L | Confirmed | Legal reviewer |
| LEG-2 | Statutory figures are typed directly into page text, so the "one number, one place" design doesn't hold | `<Fact>` is used 42 times. "₹25,000" appears 78 times in 18 content files (for example `toolkit/epf-calculator.mdx:16`, `handbooks/labour-law/04-social-security-and-benefits.mdx:79,117`, `glossary.json:53`, `jds/hr-operations-manager.md:46`). "₹21,000" appears 22 times in 11 files and "₹15,000" 26 times in 11 | When the EPF or ESI ceiling next changes, someone must find and edit 18+ files by hand. Any missed page will contradict the calculator | (1) Add `{{fact:epf.wageCeiling}}` tokens for frontmatter strings and `glossary.json`, resolved at build time with `stat(id).display`. (2) Replace inline figures in MDX with `<Fact id>`. (3) Add `scripts/check-facts.mjs`, which fails the build when a `display` value from `STAT` appears as plain text outside a `<Fact>` (allow-list example salaries with a comment marker) | P1 | M | Confirmed | Developer + Content |
| LEG-3 | Some statutory facts rely only on vendor or blog sources | 15 of 59 `STAT` facts have no .gov.in, India Code, PIB or PRS source. Examples: `epf.epsRate`, `epf.edliRate`, `epf.adminRate` and `epf.govtEpsShare` (only `staffnews.in`); `esi.wageCeiling` (SCC Online, L&S, Mercans); `esi.lowWageExemption` and `esi.contributionPeriods` (only `mercans.com`); `osh.maxContinuousHours` (only Taxmann). 14 of 17 professional-tax states cite `hrone.cloud`, `zdblogs.zohocorp.com`, `akriviahcm.com`, `ascent-hr.com`, `taxguru.in` or `cavirtual.webtel.in` | `/about/how-we-check/` says secondary sources are used "never as the only source for a number". HR software blogs aren't the "major law and accounting firms" the page describes | Add the primary source to each: EPFO contribution-rate pages and circulars (epfindia.gov.in); ESIC rates and the 8 May 2026 notification (esic.gov.in, egazette.gov.in); each state's PT Act schedule from its commercial-tax or finance department. Where none exists, set `confidence: "medium"` and show the caveat on the page | P1 | M | Confirmed | Content + Legal |
| LEG-4 | The core EPF fact checks out | ₹25,000 from 17 Sep 2026 (S.O. 5109(E)) is confirmed by [SCC Online](https://www.scconline.com/blog/post/2026/09/19/labour-ministry-notifies-25000-wage-ceiling-under-social-security-code/), [TaxGuru](https://taxguru.in/?p=1092840) and [ELP](https://elplaw.in/leadership/epfo-wage-ceiling-increased-from-inr-15000-to-inr-25000-per-month-2/). The ESI ₹21,000 and gratuity ₹20 lakh figures couldn't be confirmed from a primary source in this pass | — | Keep. Link the Gazette PDF of S.O. 5109(E) as the main source. Have the reviewer confirm ESI and gratuity against the Gazette | — | S | Partly verified | Legal |
| LEG-5 | Unsettled points are handled well: an unverified fact (`gratuity.taxExemptionLimit`) isn't used in any page, and the Kerala and Goa PT states are marked "not covered" | `src/data/statutory.ts:250,942,953` | — | Keep. But `<Fact>` ignores the `verified` flag, so a future editor could publish an unverified number with no warning. Make `Fact.astro` throw at build when `verified: false` (or show "unconfirmed") | P3 | S | Confirmed | Developer |
| LEG-6 | The legally sensitive templates are balanced | `toolkit/termination-letter.md` includes an appeal route, a receipt-only acknowledgement, the 2-working-day wage line and a 30-day gratuity line | — | Keep. Have the reviewer check show-cause, warning, termination, PIP and the POSH forms for natural justice and the inquiry steps under the IR Code and the POSH Act | P2 | M | Confirmed | Legal |

### 3.2 Calculators and interactive tools

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| CALC-1 | Gratuity says "Not yet payable" with no qualification for anyone under 5 completed years. For example, 4 years 8 months gives "Not yet payable: 4 years and 8 months of service; 5 completed years needed." | `src/lib/calc/gratuity.ts:142`. The 240-day caveat is only in the page body (`toolkit/gratuity-calculator.mdx:122`), far from the result | The most common employee question is "I worked 4 years and N months, do I get gratuity?" Some High Courts have treated 4 years and 240 days as 5 years under the old Act, and whether that carries over to the Code is unsettled. A flat "no" may stop someone claiming money they're owed | When `service.years === minYears - 1`, add to the result: "Close to the 5-year line. Some courts have counted 4 years and 240 days worked as 5 years; whether that applies under the Code isn't settled. Check with HR or an adviser before giving up the claim." Optionally ask for "days actually worked in the last 12 months". Add a unit test | P1 | S | Confirmed (behaviour); legal point needs counsel | Developer + Legal |
| CALC-2 | All hand-worked cases match | Gratuity, EPF (incl. the 16/17 Sep split), ESI boundary and PwD limit, and PT for KA, MH (incl. the women's slab), WB and TN. See [APPENDIX E](APPENDIX.md#e-other-checks) | — | Keep. Put these cases in the test suite as "worked examples from the page" so page text and code can't drift | P3 | S | Confirmed | Developer |
| CALC-3 | Exports are safe: a shared CSV writer prefixes `=`, `+`, `-`, `@` to stop formula injection, and names in mail merge and the org chart are escaped (with a test) | `src/scripts/csv.ts:7`, `src/lib/calc/scenarios.ts:480`, `src/lib/orgchart/svg.ts:29`, `src/lib/mailmerge/merge.test.ts:37` | — | Keep. Combine the three CSV and download helpers (ENG-3) | — | — | Confirmed | — |
| CALC-4 | Big-file and export round trips weren't tested | — | Mail merge with 1,000+ rows, the org chart with 500+ people, and .docx/.pptx opened in Word, Google Docs and LibreOffice are core promises | Add a Playwright test with fixture files (CSV and XLSX with Unicode names, empty cells and 1,000 rows), and open one export of each kind by hand before launch | P2 | M | Not tested | Developer |

### 3.3 Technical SEO and discoverability

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| SEO-1 | The canonical domain is `peoplecraft.vercel.app`, but the old site's metadata used `peoplecraft.in` | `astro.config.mjs:7`; every canonical, `og:url` and the sitemap | Moving domains after Google has indexed the site costs rankings, and a vercel.app subdomain looks less trustworthy for legal content | Decide before launch. If you own `peoplecraft.in`, add it in Vercel, then run `SITE_URL=https://peoplecraft.in npm run assets && npm run build`. Redirect vercel.app to it (Vercel domain redirect) and verify the domain in Search Console | P1 | S | Confirmed | Owner |
| SEO-2 | Articles name the organisation as author, and have no `datePublished`, `image` or reviewer | Article JSON-LD on the 41 chapters (`/handbooks/labour-law/wages-and-pay/`) | Google weighs who wrote legal and money content heavily, and a named, credentialed person carries more weight than "PeopleCraft" | Set `author` to a `Person` (name, `url: /about/`, `jobTitle`, `sameAs` LinkedIn), and add `datePublished`, `image` (the OG image), and `reviewedBy` once LEG-1 is done | P2 | S | Confirmed | Developer |
| SEO-3 | JD pages are mostly template text | Across 51 JDs, the median page shares 67% of its 5-word phrases with at least half the others; the median pairwise overlap is 0.50 | Search engines may treat near-duplicate pages as thin and rank none of them well | Move shared blocks (how to use, the generic interview-kit text, fill-in help) to one "How to use these JDs" page and link to it. Add role-specific depth: India-specific scope notes, KPIs, a 30-60-90 plan, career path. Consider `noindex` on the thinnest until enriched | P2 | L | Confirmed | Content |
| SEO-4 | 45 titles are longer than 65 characters (up to 89) | HR-professional chapters, e.g. `/handbooks/hr-professional/business-acumen/` | Search results cut them off and lose "PeopleCraft" | In `src/pages/handbooks/[book]/[chapter].astro:61`, use a short book name (e.g. "HR Pro handbook") or drop the book from the title tag | P3 | S | Confirmed | Developer |
| SEO-5 | The sitemap has no `lastmod` | `dist/sitemap-0.xml` (168 URLs) | Search engines don't know which pages changed after a law update | Use `@astrojs/sitemap`'s `serialize` to set `lastmod` from each entry's `checked` date | P3 | S | Confirmed | Developer |
| SEO-6 | The glossary is one 364 KB page holding 193 terms | `/glossary/` (4,263 DOM elements) | Terms people search for ("UAN", "CTC", "LOP", "F&F") can't rank alone | Give the top 25–30 terms their own page (`/glossary/<id>/`, 150–300 words, `DefinedTerm` markup) and keep the A–Z page as the index | P2 | M | Confirmed | Content + Developer |
| SEO-7 | Share images are 295–316 KB PNGs, and only 9 exist (one per section) | `public/og/*.png` | WhatsApp is widely reported to skip preview images over ~300 KB, and your readers share on WhatsApp. Every calculator also shares the same generic card | Compress to under 150 KB (oxipng/pngquant, or JPEG at quality 80). Extend `scripts/make-assets.cjs` to make a titled card for each calculator and chapter | P2 | M | Suspected (WhatsApp limit not tested) | Developer |
| SEO-8 | The basics are good: titles and descriptions are all unique, every page has one H1, canonicals are correct, `robots.txt` and noindex pages are consistent, JDs use `Occupation`, the glossary uses `DefinedTermSet`, and calculators use `WebApplication` | [APPENDIX C](APPENDIX.md#c-crawl-of-every-built-page-playwright-with-axe-core-410-at-390-px-and-1280-px-wide) | — | Keep. FAQPage markup is fine to keep, but Google now shows FAQ rich results mainly for government and health sites, so don't expect them | — | — | Confirmed | — |

### 3.4 Performance

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| PERF-1 | Fonts are about 80% of page weight: Anek Latin (latin 102 KB plus latin-ext 81 KB) and Caveat (73 KB) | A chapter page totals 317 KB, of which fonts are 256 KB. Its LCP element is text (`p.lede`, `h1.display`) | LCP of 2.6–3.2 s (simulated slow 4G) is just over Google's 2.5 s "good" line, on the budget phones you're targeting | Subset with `pyftsubset` or `glyphhanger` to the glyphs actually used, plus ₹ (U+20B9), as one file. Drop the width axis if only "standard" is used. Load Caveat only on pages with margin notes, or switch it to `font-display: optional`. Expect about 150 KB saved per page | P1 | M | Confirmed | Developer |
| PERF-2 | Five small CSS files block rendering | Lighthouse `render-blocking-resources`: Compare, BaseLayout, Flow, `_chapter_` and ItemCard CSS (≈19 KB total) | About 300–450 ms before first paint | Set `build.inlineStylesheets: "always"` for these small sheets, or merge them per layout | P3 | S | Confirmed | Developer |
| PERF-3 | The heavy libraries load only when needed: three.js (577 KB) on the desktop home only, pptx and docx on export | Phone home page ≈9 KB JS; chapter ≈20 KB; Lighthouse blocking time 0 ms | — | Keep. Silence the Vite chunk-size warning with `build.chunkSizeWarningLimit` so real regressions stand out | — | — | Confirmed | — |

### 3.5 Accessibility

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| A11Y-1 | The side panel (`aside.side`) is nested inside another landmark | 96 pages, 176 elements (axe `landmark-complementary-is-top-level`) | Screen-reader landmark lists look odd | Move the `<aside>` outside `<main>`/`<article>`, or turn it into a `<div>` with no role | P3 | S | Confirmed | Developer |
| A11Y-2 | Scrollable tables share the same unnamed `role="region"` | 19 pages (`landmark-unique`) | Several identical "region" landmarks on one page | `TableWrap.astro`: add `aria-label` from the table caption | P3 | S | Confirmed | Developer |
| A11Y-3 | Headings skip a level in the offer and appointment letters | `/toolkit/offer-letter/`, `/toolkit/appointment-letter/` (`heading-order`) | Minor navigation issue | Change the `h3` inside the letter body to `h2`, or style it differently | P3 | S | Confirmed | Content |
| A11Y-4 | The highlighter colours carry meaning (pink = deadline or risk, yellow = number to remember) that isn't in the text | `<mark class="hl hl-pink">within two working days</mark>` | The words still make sense alone, so this isn't a WCAG failure, but colour-blind and screen-reader users miss the extra layer | Add a small visible key ("Pink: deadlines") in the chapter header, and a visually hidden label for the first pink mark on each page | P3 | S | Confirmed | Developer |
| A11Y-5 | Overall: 0 WCAG A or AA violations on 172 pages, 43 `:focus-visible` rules, 23 reduced-motion queries, no horizontal scrolling at 390 px | [APPENDIX C](APPENDIX.md#c-crawl-of-every-built-page-playwright-with-axe-core-410-at-390-px-and-1280-px-wide) | — | Keep. Do one manual NVDA or VoiceOver pass over the home page, a chapter, a calculator and the org chart before launch | P2 | S | Partly verified | Owner |

### 3.6 Security and privacy

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| SEC-1 | The security policy (CSP) lets any inline script run (`'unsafe-inline'`), although the site has only 13 distinct inline scripts and no inline event handlers | `vercel.json` CSP, the same in `public/.htaccess` | Without it, an XSS bug can't run injected scripts. Removing it is cheap here | Use Astro's built-in CSP support if your Astro version has it (check the docs for `security.csp`), or add a post-build step that hashes each inline `<script>` and writes `'sha256-…'` values into `vercel.json` and `.htaccess` | P2 | M | Confirmed | Developer |
| SEC-2 | `npm audit` reports 2 high-severity issues: `image-size` (endless loop on malformed images), pulled in by `pptxgenjs` 4.0.1 | [APPENDIX A](APPENDIX.md#a-commands) | This only runs in the reader's own browser on images they supply, so the real risk is low. But a "high" warning in an audit looks bad | Add an `overrides` entry pinning `image-size` to a fixed release once one exists, or follow the npm fix for `pptxgenjs`. Re-run `npm audit` in CI | P3 | S | Confirmed | Developer |
| SEC-3 | Two storage-key prefixes are in use (`peoplecraft-orgchart-v1`, `peoplecraft:pay-equity:v1`, `peoplecraft:nine-box:v1`, `peoplecraft-analytics-v1`), though the README says "every key starts with `pc-`" | `README.md:114`; `src/components/calculators/pay-equity-analyzer.astro:134` | The privacy page's "clear everything" handles both (`/^(pc[_-]|peoplecraft)/`), so nothing is left behind, but a future key with a third prefix would survive | Rename to `pc-…` with a one-time migration, or correct the README. Add a test that every `localStorage` key matches the clear-all pattern | P3 | S | Confirmed | Developer |
| SEC-4 | The two hosts' security headers have drifted: `.htaccess` sends `interest-cohort=()` (FLoC, now retired), while Vercel sends `browsing-topics=()` | `public/.htaccess:59`, `vercel.json` | A minor gap that will keep widening | Generate both files from one source in `make-assets` | P3 | S | Confirmed | Developer |
| SEC-5 | Privacy holds up: 0 requests to other websites on any page, salary and people data is saved only if the reader ticks a box, uploaded text is inserted with `textContent` or escaped, and the clear-all also removes the offline caches | Crawl ([APPENDIX C](APPENDIX.md#c-crawl-of-every-built-page-playwright-with-axe-core-410-at-390-px-and-1280-px-wide)), `src/components/analytics/app.ts:7`, `src/pages/privacy.astro:115-132` | — | Keep. Add the nine-box tool's "shared computer" reminder to people analytics, pay equity and the org chart too | P3 | S | Confirmed | — |

### 3.7 UX and navigation

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| UX-1 | On phones, no calculator or template shows an input on the first screen | The first input sits at 815–1,197 px on a 390×844 screen (gratuity 987, take-home 1,026, F&F 998, offboarding checklist 1,197). Above it: breadcrumb, two chips, description, "Use it when", the facts badge, audience, privacy note, pin and the lifecycle strip | Most visitors come from search wanting a quick answer, and phone users bounce if they have to scroll before they can type | Below 640 px, put the form directly after the H1 and one-line description. Fold "Use it when", audience and lifecycle into a collapsed "About this tool" row, or add a "Jump to calculator" button under the H1 | P1 | M | Confirmed | Developer |
| UX-2 | Search misses shorthand, US spellings and typos | "labor code" returns 2 JD pages. "resignation letter format" doesn't find the resignation letter. "F&F" misses the F&F calculator. "UAN" returns the appointment letter first. "payslip" and "salary slip" have no target. "gratuty" returns only the glossary | Indian users search exactly like this | In `src/scripts/search.ts`, rewrite queries before searching: a synonym map (labor→labour, f&f / fnf→full and final, payslip→salary slip, pf→provident fund, posh→sexual harassment), and drop "format", "sample", "template", "pdf", "download". Add a "Did you mean" step using edit distance over tool and chapter titles. Raise the weight of titles with `data-pagefind-weight` | P2 | S | Confirmed | Developer |
| UX-3 | Search works well for the core queries: gratuity, full and final, notice period buyout, POSH, form 16, CTC, take-home, leave encashment, show cause, relieving and experience letters, probation, termination, PIP and fixed-term all put the right page first | [APPENDIX D](APPENDIX.md#d-search-35-real-queries-against-the-pagefind-index) | — | Keep | — | — | Confirmed | — |
| UX-4 | Common needs have no page (search found nothing): payslip, HRA exemption, statutory bonus, labour welfare fund | [APPENDIX D](APPENDIX.md#d-search-35-real-queries-against-the-pagefind-index); toolkit ids | These are high-volume Indian HR searches | See the content gaps in CON-3 | P2 | L | Confirmed | Content |

### 3.8 Content and editorial

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| CON-1 | "How we check facts" promises more than the site does: (a) "stored once and used everywhere… so two pages can't disagree" (LEG-2 shows they can); (b) secondary sources "never as the only source for a number" (LEG-3 shows 15 facts and 14 states that are); (c) "Checked on" means "the last day someone compared every fact" (all 148 pages share one date from an AI pass; TRU-1) | `src/pages/about/how-we-check.astro:30,51,60` | A public statement about method that isn't true is a trust and consumer-protection risk, and the page exists precisely to earn trust | Fix LEG-2, LEG-3 and TRU-1, or reword the page now to describe what happens today and what is planned | P0 | S (reword) / M (fix) | Confirmed | Owner + Content |
| CON-2 | "Pages are reviewed every quarter" has no mechanism behind it | Same page; no schedule or check found | Pages will quietly go stale | In CI, warn when any `checked` date is older than 100 days. Add a review log to `docs/` | P2 | S | Confirmed | Developer |
| CON-3 | Content gaps compared with common Indian HR searches | Toolkit ids; search results | Missed readers and links | Suggested next 12: payslip template; HRA exemption calculator; statutory bonus calculator; labour welfare fund by state; minimum wages lookup (by state, with the date checked); F&F settlement statement; employee guide to UAN transfer and withdrawal; Form 16 explained for employees; notice-period buyout letter; NDA or confidentiality agreement; WFH or hybrid policy; background-check consent form. An income-tax calculator would be the most-searched but contradicts the "toolkit does not compute tax" decision, so it's your call | P2 | L | Suggested | Content |
| CON-4 | 21 of 56 toolkit pages have no sources (mostly letters and forms) | e.g. `toolkit/experience-letter.md`, `relieving-letter.md`, `exit-interview-form.md` | Fine for HR-practice templates. Templates that make legal statements should cite the law | Add sources to templates that mention a legal duty (for example, the relieving letter and experience letter citing the IR Code or state S&E Act rules on service certificates, where applicable) | P3 | S | Confirmed | Content |

### 3.9 Visual design and brand

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| VIS-1 | Not tested in Safari or WebKit (the README flags CSS masks, drop-shadow filters and WebGL) | No WebKit in the audit environment | A large share of Indian professionals, especially HR leaders, use iPhones | Before launch, check 5 pages on a real iPhone and a Mac, or use `npx playwright install webkit` locally and screenshot each page type | P2 | S | Not tested | Owner |
| VIS-2 | The design is distinctive and consistent, with no horizontal overflow at 390 px on any page, and the phone and reduced-motion hero falls back to a still image | Screenshots; crawl | — | Keep | — | — | Confirmed | — |

### 3.10 Trust and the site's own legal position

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| TRU-1 | "Facts checked 2 Nov 2026" is on every page, all 148 entries share that date, and none names a person | `checked: 2026-11-02` in every content file; the schema has no reviewer field | It reads as a human check. If a reader relies on a wrong figure, the badge counts against you | Until review: show "Sources checked 2 Nov 2026 · legal review pending". After review: add `reviewedBy` and `reviewed` to the schema and show "Reviewed by [name, credential] on [date]" | P0 | S | Confirmed | Owner |
| TRU-2 | AI use is disclosed honestly, but only on the About page | `src/pages/about/index.astro:148` | Readers of a chapter won't see it | Add one line to the sources footer of each chapter and calculator: "Drafted with AI assistance and checked against the sources below." | P2 | S | Confirmed | Content |
| TRU-3 | The About page's credentials ("CIPD certified", "SHRM member", "NHRDN member", "MSc Heriot-Watt", "255+ hires") haven't been confirmed | README checklist | Each body has its own rules on how membership and certification can be described | Check each against the body's own wording (CIPD, for example, uses membership grades such as Assoc CIPD and Chartered MCIPD) | P1 | S | Open | Owner |

### 3.11 Growth and sustainability (within the no-tracking promise)

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| GRO-1 | No way to know whether anyone uses the site | No analytics by design | You can't tell which pages to improve or whether search traffic is growing | Add Google Search Console (verify by DNS, no on-page script, no reader tracking) and Bing Webmaster Tools. Both give queries, clicks and pages without touching readers. If you want more later, a cookie-free tool needs the privacy page updated first | P1 | S | Confirmed | Owner |
| GRO-2 | Readers can't follow law changes | No RSS feed, newsletter or "what changed" page | Law changes are your best reason for readers to come back and for others to link to you | Add `/changes/`, a dated log of each law update and the pages it touched, plus an RSS feed (`@astrojs/rss`). Link it from the footer and every "Checked on" badge | P2 | M | Confirmed | Developer + Content |
| GRO-3 | Sharing is hard: no share button, and generic share cards | SEO-7 | HR people share in WhatsApp groups | Add "Share on WhatsApp" (a `wa.me/?text=` link, no script) and "Copy link" to calculators and chapters, with titled share images (SEO-7) | P2 | S | Confirmed | Developer |
| GRO-4 | Corrections are mailto-only, which publishes the email everywhere | `src/data/contact.ts`; README checklist | Spam, and the owner becomes a bottleneck | Keep mailto for now. Later, a GitHub "Report an error" issue template, or a Vercel function that forwards a correction with no personal data stored | P3 | M | Confirmed | Owner |

### 3.12 Engineering and maintainability

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| ENG-1 | No version control history or CI. The site was handed over as a zip with `.gitignore` but no `.git` and no `.github/` | The zip contents | No rollback, no review, and the checks only run if someone remembers to | Commit the source to a repository and add `.github/workflows/ci.yml` running `npm ci`, `npm test`, `npx astro check`, `npm run build`, `npm run check:links`, the facts check (LEG-2), `npm audit --omit=dev --audit-level=high`, and Lighthouse CI with budgets (LCP 2.5 s, 350 KB) | P1 | S | Confirmed | Developer |
| ENG-2 | Content files have no automated statutory-number check | LEG-2 | Drift returns after the first law change | `scripts/check-facts.mjs` (LEG-2), run in CI | P1 | S | Confirmed | Developer |
| ENG-3 | CSV and download code exists three times | `src/scripts/csv.ts` (`csvCell`, `downloadBlob`); `src/lib/calc/scenarios.ts:480` (`csvField`, `toCsv`); `download()` in `src/components/calc/scenario-ui.ts:181` and `src/components/analytics/app.ts:76` | Three places to fix the next CSV bug | Keep one `csv.ts` (escape, BOM, CRLF, download) and import it everywhere | P3 | S | Confirmed | Developer |
| ENG-4 | Code health is good: 0 type errors, 276 tests, 16,592 internal links checked, and a fresh build matches the shipped one byte for byte apart from the timestamp | [APPENDIX A](APPENDIX.md#a-commands) | — | Keep | — | — | Confirmed | — |

### 3.13 Operations and resilience

| ID | Finding | Evidence | Why it matters | How to fix | Sev | Effort | Conf. | Owner |
|---|---|---|---|---|---|---|---|---|
| OPS-1 | The page a reader lands on is never saved for offline use. Only pages opened after the service worker takes control are kept | Chromium test: land on `/toolkit/gratuity-calculator/`, open a chapter, go offline. The chapter opens; the gratuity page shows "You're offline". `public/sw.js:32` caches only `/offline/`, `/` and `/desk/` at install | The README's own launch test ("open two pages, switch on airplane mode and reopen them") fails for the first page, which is usually the one the reader came for | In `activate`, after `clients.claim()`, loop over `self.clients.matchAll({ type: "window" })` and call `keepPage()` on each client's URL. Or have `desk.ts` (`:361`) `postMessage` the current path once `navigator.serviceWorker.ready` resolves | P2 | S | Confirmed | Developer |
| OPS-2 | Old-site redirects and anchors are handled for both hosts, and old chapter anchors (`#c3`) line up because the labour-law chapter order is unchanged | `vercel.json`, `public/.htaccess:30-50`, `src/pages/handbooks/[book]/index.astro:27`, `src/pages/toolkit/index.astro:15` | — | Keep. After deploying, test 3 old URLs live (not possible from here) | P3 | S | Config verified, live not tested | Owner |
| OPS-3 | No uptime or certificate monitoring, and nobody named for domain renewal | — | An outage or expired domain would go unnoticed | A free uptime check on `/` and one calculator. Calendar reminders for domain renewal | P3 | S | Confirmed | Owner |

---

## 4. Checking the earlier audit's claims

`docs/audit/*.md` audited the old site, and its "What the rebuild does" column describes what was fixed. I checked a sample of 14 claims; I didn't check the full set.

| Claim | Status | Evidence |
|---|---|---|
| One H1 per page (`index.md`) | **True** | 172/172 pages have exactly one H1 |
| Counts rendered at build time from the content | **True** | The home page shows 41 chapters, 56 tools and 193 terms, matching the files (41 `.mdx`, 56 toolkit, 193 glossary ids) |
| Pricing, Razorpay and refund copy removed | **True** | No "1,999", "Razorpay" or "refund guarantee" anywhere in `dist/` |
| Unsourced numbers ("2,847", "4.9/5", "Fastest-Growing") removed | **True** | None found in `dist/` |
| No roadmap dates | **True** | The one "Q4 2026" hit is a real calendar quarter in the annual HR calendar |
| Labelled buttons, visible focus | **True** | 0 axe `button-name` or `label` violations; 43 `:focus-visible` rules |
| Self-hosted fonts, no Google Fonts or CDNs | **True** | 0 requests to other websites |
| No login, Firebase or analytics in the build | **True** | 0 requests to other websites; no Firebase code. Whether Vercel Analytics is off can't be checked from the code (OPS-0) |
| Old `.html` URLs redirect | **True (config)** | Present in `vercel.json` and `.htaccess`; not tested live |
| Old deep links `#c3`, `#fc7`, `#lc2` forwarded | **True (code)** | Forwarding maps in the handbook and toolkit index pages |
| "Every page shows 'Checked on' and its sources" | **Partly true** | Every page shows a date, but it's the same date everywhere, and 21 toolkit and 37 JD pages list no sources |
| "Statutory numbers in one file … nothing can disagree between pages" | **False** | LEG-2: 200+ statutory figures are typed directly into page text |
| "Every key starts with `pc-`" | **False (harmless)** | SEC-3: four `peoplecraft…` keys; clear-all still covers them |
| Pinned and recent pages work offline | **Partly true** | OPS-1: the landing page isn't kept |

---

## 5. What's good: keep it

- **The privacy design.** Zero requests to other websites on 172 pages, data saved only when the reader opts in, a clear-all that also empties the offline caches, and output that is escaped everywhere.
- **The statutory data model.** One file, dates when each value starts and ends (the EPF split on 16 and 17 Sep is handled correctly), `verified` and `confidence` flags, and honest "not settled" notes. Finish the job (LEG-2) rather than redesign it.
- **Calculator engineering.** Pure functions with 276 tests, scenarios you can compare, "show working", CSV export protected against formulas, and every hand check correct.
- **Accessibility.** WCAG A and AA clean across the whole site, which is rare.
- **Performance discipline.** Heavy libraries load only when needed, there's no layout shift, and the home page on a phone has a 9 KB JS budget.
- **Balanced, employee-fair templates.** For example, the termination letter's appeal route and its receipt-only signature.
- **Honest AI disclosure on About**, and the decision to drop unsourced salary bands and testimonials.

---

## 6. Roadmap (ordered by impact for the effort)

**Week 1–2 (before launch)**
1. Reword "How we check" and relabel "Checked on" (CON-1, TRU-1): S.
2. Confirm Vercel Analytics is off; decide the domain and rebuild with `SITE_URL` (OPS-0, SEO-1): S.
3. Gratuity near-miss message plus a test (CALC-1): S.
4. Phone layout puts the calculator first (UX-1): M.
5. Search synonyms and query clean-up (UX-2): S.
6. Fix the offline landing page (OPS-1): S.
7. Commit to git, add CI (ENG-1): S.
8. Start the legal review (LEG-1), labour-law and calculators first: L, in parallel.
9. Check the About-page credential wording; test on a real iPhone (TRU-3, VIS-1): S.

**Next 30 days**
1. Facts tokens and the build check; move typed-in figures into `<Fact>` (LEG-2, ENG-2): M.
2. Official sources for the 15 facts and 14 states (LEG-3): M.
3. Font subsetting (PERF-1): M.
4. Search Console and Bing Webmaster (GRO-1): S.
5. Person author and reviewer markup; sitemap `lastmod`; shorter titles (SEO-2, SEO-4, SEO-5): S.
6. Compressed, titled share images and a WhatsApp share link (SEO-7, GRO-3): M.
7. CSP hashes; `image-size` override (SEC-1, SEC-2): M.

**Next 90 days**
1. `/changes/` log and RSS (GRO-2): M.
2. Pages for the top glossary terms (SEO-6): M.
3. Rewrite the JD template, cut the boilerplate (SEO-3): L.
4. Content gaps, starting with payslip, HRA, bonus and LWF (CON-3): L.
5. Quarterly review reminder in CI (CON-2): S.
6. Export and large-file tests in Playwright (CALC-4): M.

---

## 7. Questions for the owner

1. **Vercel Analytics:** is Web Analytics switched off for this project? I couldn't see the dashboard.
2. **Domain:** do you own `peoplecraft.in`? Should the site launch on it rather than `peoplecraft.vercel.app`?
3. **Legal reviewer:** who will review, and are they willing to be named on the pages?
4. **Search Console:** is DNS verification acceptable? It adds nothing to the pages.
5. **Email on every page:** keep the mailto correction link, or move to a form or GitHub issues?
6. **JD library:** should JDs be indexed by search engines while they're mostly template text, or set to `noindex` until enriched?
7. **Tax:** the toolkit deliberately doesn't compute income tax. Do you want to revisit that, given it's the most-searched salary question?
8. **Source of truth:** where should the site's source live? This repository (`PC`) currently holds only the audit files.

---

## What was not tested

- **Live site.** HTTP headers, redirects, real Core Web Vitals, and the Vercel project settings. The audit environment's network proxy returned 403 for `peoplecraft.vercel.app`. All performance numbers are lab numbers from a local server.
- **Browsers.** Safari, iOS Safari, Firefox and Samsung Internet. Only Chromium is available here.
- **Manual accessibility.** No NVDA or VoiceOver pass, and no 200% or 400% zoom check.
- **Files.** Word and PowerPoint exports were not opened in Office, Google Docs or LibreOffice. Mail merge and the org chart were not tested with large files.
- **Legal.** I spot-checked the EPF ceiling against secondary sources and checked calculator logic against the rules as written in `statutory.ts`. I didn't independently verify each statutory figure against the Gazette; that is LEG-1.
- **Earlier audit claims.** I checked 14 of them, not all.
