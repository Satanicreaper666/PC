# PeopleCraft: the free HR library for India

A static website of plain-English HR handbooks, working tools and a glossary for everyone who works in India: HR professionals, founders, employees, and students or job seekers. There are no accounts, ads, analytics or third-party requests. Calculators, templates and people analytics run in the reader's browser.

Built with [Astro](https://astro.build) (static output), MDX and [Pagefind](https://pagefind.app) for offline search.

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # builds dist/, the search index, and hash-locks inline scripts (scripts/csp-meta.mjs)
npm run preview      # serve dist/ locally
npm run check:links  # after a build: every internal link and #anchor must resolve
npm run check:facts  # statutory figures in pages come from src/data/statutory.ts (see below)
npm test             # calculator and library unit tests (worked examples from the law)
npx astro check      # type-check pages and scripts
npm run assets       # regenerate favicon, app icons, share images (og/*.jpg), manifest
node scripts/check-headers.mjs   # vercel.json and public/.htaccess send the same security headers
sh scripts/make-fonts.sh         # rebuild the subset web fonts (needs: pip install "fonttools[woff]")
```

GitHub Actions (`.github/workflows/ci.yml`) runs all of these, plus `npm audit` and Lighthouse budgets, on every push. A daily job (`uptime.yml`) checks that the live site answers.

Node 22 or 24. The site builds for `https://peoplecraft.vercel.app` (the current live address). When you add a custom domain, set `SITE_URL` so canonical links, the sitemap and social images use it, and regenerate the social images:

```bash
SITE_URL=https://peoplecraft.in npm run assets
SITE_URL=https://peoplecraft.in npm run build
```

## Deploying to Vercel (where the site lives today)

1. Push this folder to the Git repository connected to the Vercel project (or run `npx vercel --prod` from it).
2. Vercel reads `vercel.json`. It builds with `npm run build` (including the search index), serves `dist/`, adds the trailing-slash rule, 301-redirects every old `.html` page, and sets the security and caching headers.
3. In the Vercel project settings, remove Web Analytics if it was turned on. The new site promises no tracking, and the privacy page says so.
4. Optional: add a custom domain in Vercel, then rebuild with `SITE_URL` set (see above).
5. The old site loaded Firebase Auth/Firestore for an admin page. The new site has no login. You can delete that Firebase web app, or restrict its API key, once you no longer need it.

## Deploying to Hostinger (or any Apache/LiteSpeed host)

1. Run `npm run build`, then `npm run check:links`.
2. Upload the **contents** of `dist/` (not the folder itself) to `public_html/`, including the hidden `.htaccess`.
3. Turn on the free SSL certificate in hPanel. `.htaccess` then forces HTTPS and a single host (no `www.`).
4. Open these to confirm: `/`, `/handbooks/labour-law/`, `/toolkit/gratuity-calculator/`, `/search/?q=gratuity`, `/labor-law-handbook.html` (should redirect), `/does-not-exist/` (should show the 404 page).
5. Submit `https://<domain>/sitemap-index.xml` in Google Search Console.

`.htaccess` handles:
- 301 redirects from the old pages:
  - `labor-law-handbook.html`, `tds-handbook.html`, `recruitment-mastery.html`, `hr-professional.html`;
  - `hr-toolkit.html`, `peoplecraft-analytics.html`, `peoplecraft-orgchart.html`, `mail-merge.html`;
  - `jd-library.html`, `about.html`, `admin.html`, `index.html`;
- old deep links (`#c3`, `#fc7`, `#lc2`), which a small script on the new page forwards to the right chapter or tool;
- caching, compression and security headers, including a strict Content-Security-Policy (only the site's own files load).

## How the site is organised

```
src/
  content/
    handbooks/<book>/<NN>-<slug>.mdx   chapters (URL: /handbooks/<book>/<slug>/)
    toolkit/<id>.md|mdx                tools (URL: /toolkit/<id>/)
    glossary.json                      terms (URL: /glossary/#<id>)
  content.config.ts                    the schema every page must follow
  data/
    statutory.ts      every statutory number (ceilings, rates, caps), with source and "as at" date
    taxonomy.ts       lifecycle stages, readers, tool types
    books.ts          the four handbooks
    paths.ts          "Start here" reading paths per reader
    site.ts, contact.ts
  components/
    diagrams/         Timeline, Flow, Breakdown, Formula, DecisionTree, Matrix, Cycle, KeyNumbers, Compare
    content/          InShort, Callout, Steps, Figure, Faq, Sources, Fact, Snapshot …
    calc/, calculators/, tools/   calculator kit (scenarios, compare, working) and the template, checklist and survey engines
    art/              paper-cut spot icons, scenes and the stick figure (docs/ART-DIRECTION.md)
    marks/            highlighters, pen ticks and crosses, sticky notes, margin notes
    glance/, jds/     the pictures in tool and JD headers
    desk/             My desk: pins, recently viewed, reading progress, work in progress
    home/             the three.js paper hero (still image for phones and reduced motion)
  pages/              routes (offline.astro is the page the offline worker shows)
  scripts/            browser code (search, templates, drafts, people, Word export, desk, calculators)
  styles/global.css   design tokens and base styles
docs/
  CONTENT-GUIDE.md    voice, structure, diagrams, facts and accessibility rules for writers
  ART-DIRECTION.md    the paper-cut art and what each highlighter and pen mark means
  CHANGELOG.md        what changed in the rebuild, and why
public/               favicon, icons, OG images, manifest, .htaccess, fonts, sw.js (offline copies)
scripts/              make-assets.cjs, check-links.mjs, make-preview.mjs, render-hero-poster.mjs
```

### Adding or updating content

- Read `docs/CONTENT-GUIDE.md` first.
- **A rate or limit changed** (EPF ceiling, ESI limit, gratuity cap, professional tax slab): edit `src/data/statutory.ts` only, and update `verified`, the source and the date. Calculators, chapters, tools and the glossary all read figures from it: `<Fact id="…" />` in MDX prose, `fx("…")` in MDX component props, and `{{fact:…}}` tokens in front matter, `glossary.json` and Markdown templates. Then run `npm run check:facts`: it fails if a page types a watched figure by hand, and lists worked examples in `scripts/facts-allow.json` whose sums need redoing. The change also appears on `/changes/` and its RSS feed automatically.
- **A reviewer has checked a page**: add `reviewedBy: "Name, credential"` and `reviewed: YYYY-MM-DD` to its front matter. The stamp then shows the reviewer instead of "expert review pending".
- **A chapter**: edit the `.mdx` file and set `checked:` to the date you compared every fact with its source.
- **A new tool**: add `src/content/toolkit/<id>.md` with `kind:` (calculator, letter, form, policy, checklist, survey, plan). Letters and forms use `{{field}}` placeholders and get Word download automatically.
- **Drafts**: `draft: true` keeps a page visible in `npm run dev` and out of the build.

## Decisions made in the rebuild

| Decision | Why |
|---|---|
| Free public library; all pricing, checkout and subscription copy removed | The owner's direction: "a platform for all people for free" |
| Unverifiable numbers and testimonials removed ("2,847 professionals", "4.9/5", named quotes) | Can't be backed up; a consumer-protection risk and a trust risk |
| Four readers (HR, founders, employees, students) with "Start here" paths | Same library, different first steps |
| Content organised by the employee lifecycle (Recruit → Lead) | Kept from the original toolkit; it's how HR work actually flows |
| Every page shows "Checked on" and its sources; statutory numbers in one file | So nothing can silently go stale or disagree between pages |
| Law as in force on 2 November 2026: four Labour Codes (from 21 Nov 2025), Income-tax Act, 2025 (from 1 Apr 2026), EPF ceiling ₹25,000 (from 17 Sep 2026) | The original was written before these took effect |
| Light theme only, with a print stylesheet | One well-tested theme beats two half-tested ones; dark mode can come later |
| Self-hosted Anek Latin font, no Google Fonts or CDNs | Privacy and speed |
| Old URLs and anchors redirect | Existing links and bookmarks keep working |
| JD library keeps the 50 roles, interview questions and signals, but drops the salary bands, "market intelligence" trends and the rule-based "AI generator" | The pay figures had no traceable source. Each JD links to the salary band designer, so teams set bands from their own data |
| No login, no Firebase, no Vercel Analytics | The About page promises "No login. No tracking"; the site now keeps that promise |
| Mail merge works with every letter in the toolkit | One template system to maintain, instead of 8 separate copies |
| Art direction: paper-cut stick figures on woven cloth (`docs/ART-DIRECTION.md`) | A craft brand needs its own pictures. No skin tones, faces or gendered clothing, so every reader can see themselves |
| A "marked-up desk": highlighters, pen marks, notepaper and sticky notes, each with one meaning | Pages read the way an expert would mark them: yellow for the number to remember, pink for a deadline or risk, green for what to do, blue for a defined term |
| Every page header carries a picture of its own data (book position, letter sections, calculator inputs, role level) | The empty half of the header now helps the reader decide whether this is the right page |
| SVG for icons, scenes and covers; three.js only for the home hero, with a still image for phones and reduced motion | Crisp on any screen and fast on budget phones; WebGL only where depth earns its weight |
| Everything a reader saves stays in their browser: pins, drafts, company details, people, checklist owners, survey answers, calculator scenarios | No accounts to run or breach. Every key starts with `pc-` or `peoplecraft`, and the privacy page's one button clears both (a test checks every key the code defines) |
| Pinned and recently opened pages work offline (`public/sw.js`), network first | HR work happens on factory floors and weak mobile data. Online, a page is always the newest; offline, the saved copy opens |
| Calculators show their working and compare saved scenarios | HR has to explain a number to an employee or to Finance, and a number without its working can't be checked |

## Confirm before launch

- [ ] **Legal review.** All content was researched and drafted with AI assistance and checked against official sources dated up to 2 Nov 2026. Have a qualified professional review the labour-law and TDS handbooks and the calculators before launch. Items marked "not settled" on the pages need watching.
- [ ] **Open legal points** (from `docs/research/hr-facts-india.md`, "Could not verify"): state Labour Code rules after Oct 2026, the new ESI regulations (old ones saved only until 20 Nov 2026), the start of the 2-working-day F&F clock, the gratuity tax exemption under the 2025 Act, Goa/Kerala/TN professional tax, and exact DPDP dates.
- [ ] **Contact routes** (in `src/data/contact.ts`), all carried over from the live site:
  - WhatsApp `+91 91108 42614`;
  - email `akashmukund1996@gmail.com`, now also used for "Email a correction" links under every page's sources;
  - the PeopleCraft LinkedIn company page and your personal LinkedIn.

  Confirm you're happy publishing the email on every page.
- [ ] **About page**: the bio, credentials ("CIPD certified", "SHRM member", "NHRDN member", "MSc, Heriot-Watt University") and "255+ hires" come from your live About page. Check the credential wording matches how each body names it.
- [ ] **Salary data**: if you hold licensed salary surveys, send the sources and the JD library can show sourced pay ranges again.
- [ ] **Testimonials**: removed. Re-add only real, signed-off quotes.
- [ ] **Terms of use**: the template licence (free to adapt, including commercially) and "don't republish whole chapters" are policy choices. Confirm them.
- [ ] **Domain**: builds default to `https://peoplecraft.vercel.app`. The old pages' metadata pointed at `peoplecraft.in`. If you own that domain, add it in Vercel, then run `SITE_URL=https://peoplecraft.in npm run assets` and build with `SITE_URL`, and verify it in Google Search Console (DNS verification, no script on the pages).
- [ ] **Trademark**: no conflicting "PeopleCraft" HR brand was found in a web search, but run a formal check before investing in the brand.
- [x] **Vercel Analytics**: confirmed off on 3 Nov 2026 (the Vercel API reports no Web Analytics for project `peoplecraft-hr-os`), and the pages load no analytics script. If you want analytics later, choose a cookie-free tool and update the privacy page first.
- [ ] **Safari**: check a few pages on an iPhone and a Mac. Card edges use CSS masks and drop-shadow filters, and the hero uses WebGL; Safari draws these slightly differently from Chrome, which is what the build was tested in.
- [ ] **Offline copies**: after the first deploy, open two pages, switch on airplane mode and reopen them (the first page you opened is kept too, since 3 Nov 2026); open a third page to see the offline page. `sw.js` must be served from the site root with `Cache-Control: no-cache` (`vercel.json` and `.htaccess` already say so).
- [ ] **Firebase**: the old admin panel used Firebase sign-in and Firestore, and its web config was public in `js/firebase-config.js`. The rebuild uses neither. Delete the Firebase project (or at least lock its Firestore rules) and any user records you no longer need.
