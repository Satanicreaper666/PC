# Audit: home page (`index.html`)

Original: a 111 KB single file. It has 50 KB of inline CSS, two inline scripts, Inter from Google Fonts, 10 SVG images (6 product illustrations, 1 comparison graphic, 3 testimonial avatars) and no external JS.

## Summary of the most important findings

- **The page sells a paid product that no longer exists.** It mentions "₹1,999/year" eleven times, along with a "30-day refund guarantee", "Secure Razorpay / UPI" and "Price locked for 2026 — increases next year". PeopleCraft is now a free public library, so every pricing, checkout and subscription claim is removed, not reworded.
- **It makes numbers and social proof that can't be backed up.** "2,847 HR professionals", "4.9/5 Avg. Rating", "India's Fastest-Growing HR Library", "Library Growth +24%" and three five-star testimonials ("ROI: 10x the subscription cost") have no source. They are a consumer-protection risk (the CCPA's 2022 guidelines on misleading advertisements and endorsements) and break trust once noticed. The rebuild removes them and shows proof readers can check: the date each fact was checked, the source list and the method.
- **The structure is confusing and inaccessible.** There are five `<h1>` elements rotating in the hero, KPI counters that render as "0 Chapters 0 HR Tools" without JavaScript, no visible focus styles, and only four `aria-label`s on a page with icon-only buttons. The rebuild has one H1 per page, counts computed at build time from the content itself, visible focus everywhere and labelled controls.
- **The content counts don't agree with each other.** The page variously says "50+", "55+" and "97" chapters, "42" and "42+" tools, "7 calculators" and "17 calculators", "15 quizzes", and "5 Chapters" under "Handbook Split". The rebuild derives every count from the content collections, so they can never drift.
- **Some legal snippets were risky shorthand.** "50% Basic Pay Minimum" isn't what the Code says (the 50% rule is an add-back to "wages", not a minimum basic). "2 days F&F Deadline" omits "working days" and the open question about when the clock starts. "₹12.75L Tax-Free (New)" depends on the regime and income type. These now live inside handbook chapters with the full rule, its caveat and the source, not as headline chips.

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| "/HR Platform" wordmark | Slash prefix reads as a URL fragment; brand mark is text-only | Visual | Low | New woven "P" mark (warp and weft) with a proper SVG favicon, app icons and OG images |
| Nav: Why This Exists, Library, Frameworks, Pricing, FAQ | Anchors to sales sections; no route to the actual tools | UX | High | Nav is the library itself: Handbooks, Toolkit, People analytics, Glossary, plus "Start here" and a search button (/ or Ctrl K) |
| "Updated Mar 2026" badge | Stale by November, and site-wide when only some pages were updated | Accuracy | Med | Each chapter and tool shows its own "Checked on" date |
| ◑ theme toggle and ☰ buttons | Glyph-only buttons with no accessible names | Accessibility | High | Labelled buttons; full-screen mobile menu with focus handling; dark mode dropped for now (one well-tested light theme with a print stylesheet) |
| "Start My Library →" CTA | Leads to WhatsApp checkout | Copy, legal | High | Removed. The primary action is "Start here" (reading paths by reader) |

## Hero

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Five rotating `<h1>`s ("India's Fastest-Growing HR Library", "The Operating System for Indian HR", …) | Five H1s confuse screen readers and search engines; the rotation is distracting and the claims unprovable | Accessibility, SEO, legal | High | One H1 that says what the site is: a free, plain-English HR library for India |
| "2,847 HR professionals use PeopleCraft…" | Unsourced number | Legal, trust | High | Removed |
| "without relying on expensive consultants" | Contradicts the FAQ, which sells consulting | Copy | Low | Removed |
| KPI counters (`data-count`, start at 0) | Show "0 Chapters" with no JS or with reduced motion | Accessibility | Med | Counts rendered in HTML at build time |
| Dashboard mock ("Library Growth +24%", "Handbook Split 5 Chapters") | Fake product UI with invented metrics | Visual, trust | Med | Replaced by a collage of real pages (a chapter diagram, a calculator, a letter) |
| Marquee of topics (Code on Wages 2025 … Form 16 · 24Q), duplicated | Decorative motion that never stops; "Section 392 TDS" stated without context | Accessibility, accuracy | Med | A static row of "quick answer" chips that link straight into the toolkit; the hero search form sends you to full search |
| Mouse-tracking "hero orbs" | Decoration with a `mousemove` listener on every frame | Performance | Low | Removed. The site's one motion moment is the self-drawing diagrams and the loom |

## "The problem" and positioning (SHRM, CIPD, AIHR, MBA)

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Comparison of SHRM-CP, CIPD L5, AIHR, MBA | Fair in tone ("we don't claim to replace these"), but on a home page it frames PeopleCraft as a certification alternative | Copy, UX | Low | Kept where it helps a reader: the HR professional handbook's competency-model chapter maps its chapters to these frameworks |
| "Honest mapping" table with roadmap dates (Q2 2026, Q3 2026, Q4 2026, 2027) | Q2 and Q3 have passed with those items not shipped; dated promises age badly | Accuracy, trust | Med | Removed. No roadmap dates on the public site |
| "Interactive, not static… Bookmark sections. Track your progress." | Features listed that the library pages didn't consistently have | Accuracy | Med | Only features that exist: search, print, Word download, saved drafts and ticks |
| "Written by someone who's filed PF returns…" | Good practitioner voice, but not attributable to a named author | Trust | Low | The About page has a short practitioner statement and flags the author bio for confirmation |

## Library cards (six products)

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Card stats ("11 Chapters · 8 Quizzes · 19 Tables · 31 Accordions") | Counting accordions is not a value to a reader; counts disagree across the page | Copy | Med | Shelf of four handbooks with chapter lists; counts derived from content |
| Labour law chips: "29→4 Laws Consolidated", "50% Basic Pay Minimum", "2 days F&F Deadline" | Second chip is wrong as worded; third lacks "working days" and the caveat | Accuracy, legal | High | Each rule is explained inside the chapter with its source and caveat |
| TDS chips: "Section 392", "₹12.75L Tax-Free (New)", "₹75K Std Deduction", "15 Jun Form 16 Due" | Figures need regime and tax-year context, and every section number and date has to be re-checked against the Income-tax Act, 2025 and the Rules, 2026 | Accuracy | Med | Moved into the TDS handbook, re-verified against the Income-tax Act, 2025 |
| Recruitment chips: "77% Face Hiring Woes", "₹15K Avg Cost/Hire", "42d Time to Fill" | No sources; cost-per-hire varies hugely by role | Accuracy | Med | Removed; the cost-per-hire calculator lets readers work out their own |
| "HR Toolkit… 42 Tools · 8 Fillable Forms · 17 Calculators" | Numbers disagree with the FAQ ("7 calculators") | Accuracy | Med | Toolkit index with live counts, filters by type and stage |
| People Analytics "No data leaves your machine" | True and important | Privacy | (kept) | Kept and stated on the tool and the privacy page |
| SVG illustrations with alt text "…Handbook illustration" | Alt text adds nothing; images are decorative | Accessibility | Low | Book covers are CSS and type, marked decorative |

## Testimonials

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Priya M., Rajesh K., Anitha S. with avatars and outcome badges | Can't verify they are real; outcome claims ("Team resolves TDS queries 4x faster") are advertising claims | Legal, trust | High | Removed. If real, signed-off quotes exist, they can return on the About page with permission (flagged in README) |

## Pricing and FAQ

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| "₹5.47/day — less than your morning chai", "A single PF penalty costs ₹2–5 Lakhs" | Fear-based selling; penalty range unsourced | Copy, accuracy | High | Removed |
| "Secure checkout · 30-day refund guarantee · Cancel anytime" | Refund and cancellation promises with no terms page | Legal | High | Removed; the new Terms page states the library is free and provided as is |
| FAQ "Can my HR team access this? …volume pricing" | Obsolete | Copy | High | Replaced by short FAQs on handbook and tool pages, with FAQPage structured data |
| FAQ "Do you offer consulting… 5,000+ candidate pool" | Unsourced number; commercial offer mixed into a library | Trust | Med | A single quiet line on the About page (flagged for confirmation) |

## Closing CTA and footer

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| "One PF penalty costs more than 5 years of PeopleCraft" | Fear-based; no longer applicable | Copy | High | Closing band offers the glossary and the two real contact routes (WhatsApp, LinkedIn) |
| Floating WhatsApp bubble 💬 | Emoji as the only label; covers content on phones | Accessibility, UX | Med | WhatsApp link with a text label, in the footer and closing band |
| No privacy, terms or disclaimer pages | Required for a site that hosts legal-adjacent content and tools | Legal | High | Privacy, Terms of use, Disclaimer and How we check facts pages |

## Meta, structured data, performance

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Duplicate `og:title` / `og:description` / `og:type` (two sets, different wording) | Crawlers pick one unpredictably | SEO | Med | One set per page from a shared layout |
| `og:image` points to `/og-image.jpg`, which isn't in the archive | Broken social previews | SEO | Med | Generated 1200×630 OG images per section |
| No canonical URL, no favicon, no sitemap, no robots.txt | Basic hygiene missing | SEO | Med | Canonical, favicons, manifest, sitemap, robots.txt, 301s from old .html URLs |
| JSON-LD WebSite only, no SearchAction | Misses rich results | SEO | Low | WebSite with SearchAction, BreadcrumbList, Article, FAQPage, DefinedTermSet, WebApplication |
| 50 KB inline CSS on every page; Inter from Google Fonts | Repeated payload; third-party font request | Performance, privacy | Med | One cached stylesheet; self-hosted variable font (Anek Latin); no third-party requests |
| `prefers-reduced-motion` handled with `!important` blanket | Works, but counters still start at 0 | Accessibility | Low | Motion is opt-in behind a `js-anim` class and off for reduced motion; content never depends on it |

## What was good and kept

- The lifecycle model (Recruit, Onboard, Grow, Pay/comply, Exit, Lead) is now the spine of the toolkit and the home page "loom".
- The four handbooks and their chapter plans are kept, renamed where helpful, and fully re-verified.
- The form codes (PC-F-01 to PC-F-08) are kept so existing users can find their forms.
- In-browser analytics, with no upload to a server, is kept and extended to the whole toolkit.
- The practitioner tone ("the answers when your CEO asks…") is kept, made plainer and aimed at all four readers.
