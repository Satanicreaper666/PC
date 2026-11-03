# Audit: Indian Labor Law Handbook (original `labor-law-handbook.html`)

Audited 2 November 2026 against the law in force that day. Rebuilt as 11 chapters in `src/content/handbooks/labour-law/`.

## Summary

- **The legal status was out of date and partly wrong.** It said final central rules were "expected 1 Apr 2026" (they were notified 8–9 May 2026), that Karnataka, Maharashtra and Kerala had "notified final state rules" (they were still on drafts in late 2026), and that there was "no transitional period" (old rules continue where consistent with the Codes: Code on Wages s.69(2), Ministry FAQs; SS Code s.164 saves schemes for a year).
- **Several headline rules were overstated or misstated:** "basic ≥ 50% of CTC" (the test is on excluded items, against total remuneration, and nothing forces a restructure); "300+ workers need permission to retrench" (only factories, mines and plantations, IR Code s.77); crèche at "50+ female employees" (50+ employees, either gender); pay "by 7th or 10th" (7th for everyone); TDS due "15th" (7th) and an EPF "ECR return on the 25th" (with payment by the 15th).
- **Penalty tables carried unverifiable or wrong numbers:** "₹5,000/worker" for late F&F, "₹30,000/day" for non-registration, "30 days' notice" before any action, POSH "₹50K–₹3L", PF non-deposit as fine-only in the quiz. Each is replaced with section-level figures (Code on Wages s.54, SS Code s.133, OSH s.94, POSH s.26) or removed.
- **Big changes after March 2026 were missing:** EPF ceiling ₹25,000 from 17 Sep 2026, new EPF/EPS/EDLI schemes (29 Jun 2026), bonus ceilings (Aug 2026), the Supreme Court's adoption ruling (17 Mar 2026), ESI saving period ending 20 Nov 2026, Karnataka's Shops Act amendment (4 Sep 2026).
- **Good and kept:** the executive snapshot device, the chapter order, old-versus-new tables, worked scenarios and the 22-point transition checklist, all rebuilt as `<Snapshot>`, `<Compare>`, worked `<Formula>` examples and a corrected checklist. The disclaimer is kept. Accessibility, SEO and sales language needed the most work outside the law.

## Header, navigation and hero

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "₹1,999/year — Executive Access →" in the top bar | Paywall CTA on a page now free | Copy | High | Removed; site header only |
| "Labor Law" / title "Indian Labor Law Handbook 2026" | US spelling; year in title ages badly | Copy, SEO | Low | "Labour", no year; dated "Facts checked" stamp |
| "Updated February 2026" (hero), "Updated Mar 2026" (sidebar), "Current as of February 2026" (footer) | Three different dates | Accuracy | Med | One `checked` date per chapter, shown with the source count |
| Hero stats "64%+ Workers covered", "50% Basic pay minimum" | Unsourced; the second is a myth | Accuracy | High | Removed; ch.1 callout explains the real 50% test |
| "The definitive compliance guide", "What You'll Master" | Superlatives, sales tone | Copy | Med | Plain description per chapter |
| A−/A+, theme toggle, bookmarks (☆) | Duplicated browser features; state in localStorage | UX | Low | Dropped; site-wide layout handles themes and print |

## Table of contents and page structure

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| All 11 chapters in one 200 KB page | One URL and title for every topic; weak for search; heavy on phones | SEO, performance | High | 11 URLs with their own title, description, FAQ schema and keywords |
| Sidebar TOC, scroll spy, mini floating TOC, two back-to-top buttons | Three overlapping navigation devices | UX | Low | One sticky "In this chapter" list plus chapter pager |
| Accordions (`div role="button" tabindex="0" onclick`) ×46 | No Enter/Space handler; content hidden by default | Accessibility | High | No accordions; content is always visible; FAQ uses native disclosure |
| Duplicate "6.5" headings in chapter 6 | Numbering error | Copy | Low | Sentence-case headings without numbers |

## Chapter 1: Introduction and overview

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "No Transitional Period … compliance required immediately" | Overstated: old rules continue where consistent; schemes saved to 20 Nov 2026 | Accuracy, legal | High | "How the transition works" with sources |
| Timeline "1 Apr 2026 (Expected) Final rules notified" | Wrong; notified 8–9 May 2026 | Accuracy | High | Verified timeline to 20 Nov 2026 |
| "Karnataka, Maharashtra, and Kerala have notified final state rules" | Wrong per Oct 2026 trackers | Accuracy | High | States with final rules listed "as reported", with a check-first warning |
| Four-codes table (4/3/9/13 Acts) | Correct | Accuracy | — | Kept, with all 29 Acts listed |
| Labour-market statistics (47.5 → 64.33 crore) | Unsourced, not needed for compliance | Accuracy | Low | Removed |
| "Algorithm-driven randomized inspections" | Not in the Codes as stated | Accuracy | Low | "Inspector-cum-Facilitator … inspection scheme" |
| "Vacancy reporting to career centres" | Thresholds and timelines not verified this pass | Accuracy | Low | Left out; noted for follow-up |
| Quiz, "How Do I Measure This? __/22", SHRM/CIPD/AIHR "Framework Alignment" | Placeholders and filler | UX, copy | Med | Replaced by FAQ, a decision tree on whose rules apply, and "What to do first" steps |

## Chapter 2: Wages

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "Basic pay below 50% of CTC" (snapshot) | Misstates s.2(y) | Accuracy | High | Exclusions (a)–(k), the add-back, a ₹60,000 worked example |
| Exclusions "capped at 50%" include gratuity, retrenchment comp. | (j) and (k) sit outside the test | Accuracy | Med | Corrected list |
| Priya scenario: PF "₹42,000 → ₹60,000", "₹12+ lakhs" | Wrong premise; ignores the PF wage ceiling | Accuracy | High | Example shows when PF does and doesn't change |
| "By 7th (<1,000 workers) or 10th (1,000+)" | Old Payment of Wages Act | Accuracy | High | Wage-period table from s.17 |
| "Bank transfer, cheque, or digital only" | s.15 also allows cash | Accuracy | Low | Corrected |
| "2-day F&F … regardless of … any other exit" | s.17(2) lists specific exits; start date unsettled | Accuracy, legal | Med | Timeline plus "not settled" callout |
| "Late F&F → ₹5,000/worker penalty" | No source | Accuracy | High | Removed; s.54 penalties |
| "Floor wage reviewed every 5 years" | That is minimum wages (s.8(4)); floor wage not yet notified | Accuracy | Med | Corrected, with "check the latest notification" |
| Bonus 8.33%–20%, 30 days, 8 months | Correct | — | — | Kept; ₹21,000/₹7,000 ceilings now sourced (Aug 2026) |

## Chapter 3: Leave and working hours

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "Spread over max 12 hours — OSHWC Code" | Not in the Code; state rules | Accuracy | Med | Table cites Code, central or state rules per row |
| Leave ranges "Sick 6–12", "Casual 7–10", "Festival 5–15" | Unsourced ranges | Accuracy | Med | Verified Karnataka and Maharashtra examples |
| "Crèche … 50+ female employee establishments" | 50+ employees, either gender | Accuracy | High | Corrected; ₹500 allowance with validity caveat |
| "12 weeks … adoption (child <3 months)" | Struck down 17 Mar 2026 | Accuracy | High | Updated |
| "Maternity compliance affirmed in Board Reports (July 2025)" | Not verified this pass | Accuracy | Low | Left out; flagged |
| Crèche cost scenario "~25 eligible employees" | Speculative | Accuracy | Low | Removed |
| 180-day leave, OT at 2×, 8/48 hours | Correct | — | — | Kept; adds 30-minute break rule, OT formula, 144-hour cap |

## Chapter 4: Social security

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| ₹15,000 PF ceiling (ch. 9 quiz) | Now ₹25,000 from 17 Sep 2026 | Accuracy | High | Breakdown of PF at ₹25,000 |
| "Vishwas Scheme" damages, "appeal deposit 25%", "withdrawals up to 75%" | Not verified | Accuracy | Med | Removed |
| ESI non-deposit "up to 2 years" | SS Code s.133: 1–3 years + ₹1 lakh | Accuracy | High | Corrected |
| Gratuity formula on "basic" with no ceiling | Wages include add-back; ₹20 lakh cap | Accuracy | High | Formula with cap; link to calculator |
| Welfare table: safety committee "500/250/100", crèche "up from 30", "welfare officer 250+ employees" | Mixes safety officers with committees; crèche wrong | Accuracy | Med | Corrected table in ch. 3 from OSH ss.22, 24 |
| Gig "IT/ITES freelancers"; "Shram Shakti Niti" | Not in the Code; draft policy | Accuracy | Med | s.114 rates, registration rules, "schemes awaited" |
| Employee fine "up to ₹10,000"; death "50% of fine to heirs" | Not verified | Accuracy | Med | Duties kept; numbers removed |

## Chapters 5–6: Contracts, termination and disputes

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Appointment letters "within 3 months of rules" | 3 months from 21 Nov 2025 (OSH s.6(1)(f)) | Accuracy | Med | Corrected |
| "Displacement allowance 50% or ₹75" | 1979 Act; not in the OSH Code | Accuracy | High | Removed; journey allowance kept |
| "Single pan-India licence valid for 5 years" | Validity not verified | Accuracy | Low | Multi-state licence only |
| Remote workers "governed by … state where they physically work" | Not a stated rule | Accuracy | Med | Removed |
| "Establishments with 300+ workers need prior government permission" | Only factories, mines, plantations | Accuracy | High | Decision tree from s.77 |
| "14 days' notice for strikes" | s.62: notice within 60 days before; not within 14 days of notice | Accuracy | Med | Full s.62 list |
| "Conciliation 90 days maximum … approach tribunal directly" | Report in 45 days; tribunal within 90 days of report | Accuracy | Med | Grievance flow from s.4 and s.53 |
| Retrenchment calculator "package" | Adds the fund payment as if paid by the employer to the worker; ÷26 presented as law | Accuracy, UX | Med | Formula with divisor caveat; timeline of payments |

## Chapters 7–11: POSH, states, checklists, penalties, outlook

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| POSH "Fines: ₹50K–₹3L; repeat → license cancellation" | Conflates POSH s.26 with company-law penalties | Accuracy | High | s.26 only |
| "Bills in Rajya Sabha (Dec 2025)", SHe-Box registration "per SC directives" | Not verified | Accuracy | Med | Removed; SHe-Box as a complaint portal |
| State status "Final: Karnataka, Maharashtra, Kerala" | Wrong | Accuracy | High | Dated list plus check-first callout |
| Calendar "15th: EPF + ESI + TDS", "25th EPF ECR return" | TDS 7th; ECR with payment by 15th | Accuracy | High | Monthly cycle and event-deadline tables |
| "9 statutory registers", "electronic maintenance required" | Not a legal list | Accuracy | Med | Records table with the section requiring each |
| "Inspector-cum-Facilitator must give 30 days' notice" | s.54(3): written direction for some offences; no 30 days | Accuracy | High | Enforcement flow |
| Penalty table: "Wages ₹1L/₹2L + 3 months", "non-registration ₹30,000/day", "false statements 1–3 years", OSH repeat "₹1K/day" | Wrong or unsourced | Accuracy | High | Tables from s.54, s.133, s.94 |
| Scenario: PF non-deposit compoundable at "50–75%" | Deducted-but-unpaid PF carries 1–3 years' imprisonment | Accuracy, legal | High | Corrected |
| "2026 = triple compliance event", "most significant compliance year" | Hype | Copy | Low | Dated watch list and next-year steps |

## Interactive widgets, CTAs, footer, meta and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Gratuity and retrenchment calculators | Inputs with placeholders but no `<label>`; no ceiling or eligibility check | Accessibility, accuracy | High | Links to the toolkit gratuity and F&F calculators |
| Single-key shortcuts `d`, `m`, arrows | Conflict with assistive tech (WCAG 2.1.4) | Accessibility | Med | None |
| Quiz options, example toggles (`div onclick`) | Not keyboard operable | Accessibility | Med | Removed; FAQ instead |
| Text at .64–.68rem; emojis in headings | Small text; screen readers announce emojis | Accessibility | Med | Design-system type scale; no emojis |
| KPI count-up animation, chapter "Mark as read" | Motion and tracking with no clear value | UX | Low | Removed; diagrams honour reduced motion |
| Google Fonts link | Third-party request | Performance, privacy | Low | Self-hosted font |
| JSON-LD dates 1 Feb / 1 Mar 2026; canonical `.html` | Out of step with page; old URL | SEO | Low | Article, breadcrumb and FAQ schema per chapter; old URL redirects |
| Footer disclaimer | Good | Legal | — | Kept, on every chapter |
