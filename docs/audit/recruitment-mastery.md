# Audit: Recruitment Mastery (original `recruitment-mastery.html`)

Audited 2 November 2026 against the archived page (`/home/claude/refs/hr-os-archive/recruitment-mastery.html`, "Updated February 2026") and its inline script. Rebuilt as 9 chapters in `src/content/handbooks/recruitment/`.

## Summary

- **The practical core is good and was kept:** the headcount test, the one-sentence hiring case, JD anatomy, three-pass screening, the phone-screen script, STAR questions with a 1–5 scorecard and independent scoring before the debrief, negotiation scripts, the 30-60-90 plan and the phase checklist.
- **Unsourced statistics everywhere:** hero KPIs ("82% Indian firms face hiring difficulty", "₹25K–2L cost per hire", "36–42 days"), "80% of JDs in India are terrible", "JDs with salary get 30% more applications", "62% check Glassdoor", "20% leave within 45 days", "60–70% who accept counter-offers leave within 6 months", "Brandon Hall: 82%", platform prices and benchmark bands. None could be traced; all were removed or rewritten as practice advice.
- **The CTC calculator gives wrong numbers:** gratuity is computed at 57.7% of basic instead of about 4.8%, the PF cap has a units error, and old-regime tax slabs are labelled "new regime". For ₹12 lakh it shows special allowance of ₹1,846. Dropped; the chapter links to the toolkit's take-home calculator.
- **Legal statements were wrong or missing:** "Labour Codes 2025: basic + DA must be ≥50%" misstates the wage definition; the appointment-letter duty, the anti-discrimination laws, background-check consent and the DPDP Act's phased start were absent or vague; non-compete clauses were recommended without noting they are generally void after exit.
- **Structure and accessibility problems:** executive snapshots and "What you should remember" boxes in chapters 2 and 3 belong to other chapters; quiz and true/false controls are not keyboard-operable; single-key shortcuts (d, m, j, k) hijack typing for assistive-technology users; a ₹1,999 "Executive Access" CTA sits in the header of what is now a free library.

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Top bar CTA "₹1,999/year — Executive Access →" | Sales language on a free library | copy, legal | High | Removed; site-wide header comes from the shared layout |
| Search box (⌘K) | Searches only this page; results built with `innerHTML` from page text | UX | Low | Site-wide search via the shared layout |
| A−/A+/◑ buttons | Duplicate browser zoom and OS theme; settings in localStorage | UX | Low | Dropped |
| Keyboard shortcuts `d`, `m`, `j`, `k`, arrows | Single-character shortcuts with no off switch (WCAG 2.1.4) | accessibility | High | Not carried over |

## Hero

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Tagline "complete playbook… stop guessing and start hiring right" | Superlative, slogan tone | copy | Med | Book subtitle in plain words (shared `books.ts`) |
| KPI tiles: 82%, ₹25K–2L, 36–42 days, "9 steps" | No sources; animated count-up | accuracy, a11y | High | Removed; chapter 9 explains why no external benchmarks are given |
| "What You'll Master": "Handle… contract labour" | Contract labour is never covered in the body | accuracy | Med | Chapter 1 points to the labour law handbook for contract labour |
| Hero illustration `alt=""` | Decorative, fine | accessibility | Low | Not needed |

## Table of contents (sidebar)

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Chapter list with reading times and ☆ bookmarks | Bookmarks are `<span onclick>`, not focusable; one 49-minute page | accessibility, SEO | Med | Nine chapter URLs with an in-page TOC and "All chapters" list |
| "Updated Feb 2026" vs JSON-LD `dateModified: 2026-03-01` | Dates disagree | accuracy | Low | One "Facts checked 2 Nov 2026" stamp per chapter |

## Chapter by chapter

| Chapter | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| 1 Before you hire | Decision tree and "one sentence" test are strong | HR practice | (kept) | `DecisionTree` and worked example kept |
| 1 | "True cost" table adds employer PF, ESI and gratuity on top of CTC (double counting) and adds ESI for a ₹6L earner, who is above the ₹21,000/month ceiling | accuracy | High | `Formula` + example `Breakdown` that warns to add only costs outside CTC |
| 1 | Agency "8–15%" here vs "8–25%" and "8.33–15%" elsewhere; internship stipends; "2–2.5× salary" wrong-hire cost | accuracy | Med | Numbers removed; fee structure described instead |
| 1 | "Hire slow, fire fast" | HR practice, copy | Med | Replaced with early, fair probation feedback |
| 2 Writing JDs | Snapshot and "Remember" box are about sourcing, not JDs | UX, accuracy | High | New snapshot written for the chapter |
| 2 | Good/bad JD comparison and inclusive-language list are useful | HR practice | (kept) | Kept as a `Compare` and a table |
| 2 | "Women apply 20% less", "30% more applications", "Young… illegal in many contexts" | accuracy, legal | High | Stats removed; adds Code on Wages s.3, Transgender Persons Act s.9 and RPwD duties with sources |
| 3 Sourcing | Snapshot and "Remember" box are about interviews | UX | High | Rewritten |
| 3 | Platform prices (Naukri ₹30K–1.5L, LinkedIn ₹60K–1.2L, Apna ₹999–5K) and star ratings | accuracy | High | Prices removed; cost models only, with "check current plans" |
| 3 | "40-40-20 rule", "2× faster, 30–40% cheaper, 40% better retention" | accuracy | Med | Removed; adds the diversity risk of referral-only hiring |
| 3 | No mention of candidate data with agencies | legal | Med | DPDP s.8(2) processor contract (from May 2027) and fake-offer warning |
| 4 Screening | Three-pass system and phone script are practical | HR practice | (kept) | `Flow` and `Timeline` |
| 4 | "10-second scan" vs "30 seconds" in the Remember box | accuracy | Low | One figure: about 30 seconds |
| 4 | Red flags: gaps, "4+ jobs in 4 years", "formatting chaos", side projects as initiative | HR practice, fairness | Med | `Compare` of snap judgements vs fairer readings |
| 4 | "Asking current CTC is standard… unlike the US" | legal, HR practice | Med | Keeps "pay for the role"; adds equal-pay duty and "share your range first" |
| 4 | No candidate privacy guidance | legal | High | SPDI Rules now, DPDP duties from May 2027, unsettled s.7(i) position for applicants, collect-by-stage table |
| 5 Interviews | "Predict… about as well as a coin flip" | accuracy | Med | Removed; benefits stated without numbers |
| 5 | 5-point rubric, then "4-point scale works better" | accuracy, UX | Med | One 1–5 scale matching the interview evaluation form |
| 5 | "Never ask" list mixes legal bans and etiquette; "culture fit" scored as a competency | legal, fairness | High | Table separating legal grounds from not-job-related questions; "culture fit" replaced with defined behaviours; accessibility adjustments added |
| 5 | Round guidance tied to "below ₹15L CTC"; "offer-to-join 60–70%" | accuracy | Med | Round guidance by role seniority; stat removed |
| 6 Offers | CTC calculator (see widgets) and "basic + DA ≥ 50%" | accuracy, legal | High | Correct 50% wage rule with `Breakdown` and `Formula`, source Code on Wages s.2(y) |
| 6 | "Every day you delay… ~5%", "30–40% of offers rejected" | accuracy | Med | Removed; timeline of recommended targets |
| 6 | Non-compete clause listed as a standard term | legal | Med | Warns post-exit non-competes are generally void (Contract Act s.27) |
| 6 | Offer letter treated as meeting the appointment-letter duty | legal | High | Separates the two; OSH Code s.6(1)(f), Central Rules 2026 format, state formats |
| 6 | No background-check consent | legal | High | Consent `Flow` and data rules |
| 7 Employer brand | EVP worksheet, rejection email are useful | HR practice | (kept) | Kept, with specific-proof `Compare` |
| 7 | "Ex-Google, ex-Flipkart" as an EVP example; "50–100 inbound applications a month" | HR practice, accuracy | Med | Replaced; no promised numbers |
| 7 | No guidance against review manipulation or identifying reviewers | legal, ethics | Med | Review-reply `Matrix` and "lines you never cross" |
| 8 Onboarding | Pre-boarding and 30-60-90 plan are good | HR practice | (kept) | Two `Timeline`s and a table |
| 8 | "20% leave in 45 days", "buddies reduce anxiety 36%", "Brandon Hall 82%" | accuracy | High | Removed |
| 8 | Warning signs include "eating alone" and "LinkedIn profile updated" | HR practice, privacy | Med | Work-based signs only; "ask, don't assume" |
| 8 | Joining compliance reduced to "PF nomination, tax declarations" | legal | High | Compliance table (appointment letter, EPF ₹25,000 ceiling from 17 Sep 2026, ESI ₹21,000, POSH) and probation `DecisionTree` |
| 9 Metrics | "Time to hire" defined as time to fill; India benchmark bands unsourced | accuracy | Med | Clear definitions, own-baseline approach, two `Formula`s |
| 9 | Top-10 mistakes and phase checklist are useful | HR practice | (kept) | Kept and extended with fairness and consent |
| 9 | No fairness metric | HR practice | Med | Pass-through rates by group, with data-handling warning |

## Interactive widgets

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| CTC breakup calculator | Gratuity `basic×15/26/12×12` = 57.7% of basic; PF cap `21600×12` (₹2,59,200/yr) instead of ₹21,600; old-regime slabs labelled "new regime"; PT fixed at ₹2,500 for every state; HRA label says 40% after silently falling back to 30% | accuracy | High | Not rebuilt here; links to the toolkit take-home calculator, which uses `statutory.ts` |
| Notice buyout calculator | Uses CTC ÷ 30; real buyouts follow the old employer's contract (basic or gross, 26 or 30 days) | accuracy | Med | `Formula` with that caveat and a worked example |
| Cost per hire calculator | "Excellent / Average / High" bands and "₹25K–50K entry" are unsourced; no negative-value checks; result not announced | accuracy, a11y | Med | Formula in chapter 9; links to the toolkit calculator |
| Quizzes ("Quick Check", "Score This Response") | `<div role="button" tabindex="0" onclick>` with no key handler | accessibility | Med | Converted to worked-example callouts |
| True/false quiz | `<span onclick>`, not focusable; item 3 states the wrong 50% rule as true; item 5 asserts an unsourced cost | accessibility, accuracy | High | Removed; points covered in FAQ |
| "Mark as read", progress strip, mini TOC | localStorage state; extra fixed UI | UX, performance | Low | Dropped |

## Tables, callouts and boxes

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Executive Snapshot | Useful format, but "Exposure ₹50K–₹5L per bad hire" etc. unsourced; ch 2–3 misplaced | accuracy | Med | `Snapshot` kept per chapter, no exposure figures |
| "What You Should Remember" | Generic or belongs to another chapter | UX | Med | Replaced by the "In short" summary |
| "How Do I Measure This?" with blanks (`__days`) | Placeholders that do nothing | UX | Low | Metrics consolidated in chapter 9 |
| "Framework Alignment" (SHRM, CIPD, AIHR) | Implies alignment or endorsement without basis | legal, accuracy | Med | Removed |
| Accordions (▾) | Key tables collapsed by default | UX | Low | Content always visible |
| Emoji icons (~38) | Inconsistent, read aloud by screen readers | visual, a11y | Low | Icons from the shared component set |

## CTAs and footer

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Header CTA "₹1,999/year — Executive Access" | Paywall language on a now-free library | copy | High | None; no sales language anywhere |
| Footer "For educational purposes" | No legal disclaimer, no sources anywhere on the page | legal | High | Per-chapter sources (2–11 each) and the shared law disclaimer |

## Meta tags and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| `<title>` "PeopleCraft — Recruitment Mastery 2026" | One title for nine topics | SEO | Med | Nine titles under 60 characters |
| Meta description "SHRM Talent Acquisition aligned" | Unverifiable claim | SEO, legal | Med | Chapter descriptions of 144–165 characters |
| og:image `og-image.jpg`, canonical to `.html` | Generic image; old URL | SEO | Low | Shared layout; old URL redirects to the book |
| JSON-LD Article only | No FAQ or breadcrumb data | SEO | Low | Layout adds Article, Breadcrumb and FAQ JSON-LD from frontmatter |
| 45 KB inline CSS, Google Fonts, three inline scripts, scroll listeners | Render-blocking font request; third-party font call | performance, privacy | Med | Static Astro pages, shared self-hosted styles |
| Calculator inputs | `aria-label` only, no visible `<label>` (0 labels on page) | accessibility | Med | No form inputs in chapters |
