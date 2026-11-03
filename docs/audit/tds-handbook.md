# Audit: TDS for HR handbook (original `tds-handbook.html`)

Original: single page, "Updated February 2026" (JSON-LD `dateModified` 2026-03-01), sold behind "₹1,999/year — Executive Access". Audited on 2 November 2026 against the Income-tax Act, 2025 and Income-tax Rules, 2026 as published on incometaxindia.gov.in. Rebuilt as 10 chapters in `src/content/handbooks/tds/`.

## Summary

- **Right law, old vocabulary.** The page correctly put salary TDS under section 392 from 1 April 2026, but kept 1961-era forms and numbers that the 2026 Rules replaced: Form 16 → 130, 24Q → 138, 12BB → 124, 12B and 12BAA → 122, 12BA → 123, 16A → 131, 26Q → 140; 87A → 156, 89 → 157, 234E → 427, 201(1A) → 398. The rebuild maps old to new everywhere.
- **Values went stale on 1 April 2026.** Rule 15 of the 2026 Rules raised the car perquisite (₹1,800/₹2,400 → ₹5,000/₹7,000; chauffeur ₹900 → ₹3,000), meals (₹50 → ₹200 a meal), gifts (₹5,000 → ₹15,000) and the loan threshold (₹20,000 → ₹2 lakh). Rule 279 added Bengaluru, Hyderabad, Pune and Ahmedabad to the 50% HRA cities.
- **Some claims were wrong or contradicted each other.** A mid-year "regime change window" and "switch once during the year"; employer NPS at "14% in both regimes" (old regime is 10% for private employers) in one chapter and "14% govt / 10% others" in the new regime in another; "basic must be 50% of CTC"; "higher basic = higher TDS"; "refund excess TDS in the settlement"; and an exit example whose arithmetic was wrong and whose "₹79,020 shortfall" is actually an excess.
- **Hard to use without a mouse.** 26 accordions hid most content behind `div role="button"` elements with click-only handlers; true/false answers were unfocusable spans; single-key shortcuts (d, m, arrows) had no off switch; 109 emoji served as icons. The snapshot and "Remember" boxes of chapters 3, 4 and 5 described other chapters.
- **Good and kept:** the HR-centred chapter plan; correct core numbers (new-regime slabs, ₹75,000 standard deduction, ₹12 lakh rebate, 7th/30 April deposits, quarterly dates, 1%/1.5% interest, ₹200 a day, 15 June); the section 392(4)(b) house-property point; the 392(5)(a) perquisite statement; the 392(3) start-up ESOP deferral; the push to collect previous-employer details; "deposit by the 5th"; prosecution capped at two years (matches the Finance Act, 2026).

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "₹1,999/year — Executive Access →" | Paywall CTA; site is now free | copy, legal | Med | Removed |
| Sidebar chapter list (`div.nav-i` with `onclick`) | Not links; one URL for ten topics | accessibility, SEO | Med | One page per chapter; sidebar links and previous/next |
| Shortcuts d, m, ↑/↓ | Single-key shortcuts without an off switch (WCAG 2.1.4) | accessibility | Med | Not carried over |
| A−/A+, theme toggle, in-page search | Useful but page-only | UX | Low | Site theme, print and site-wide search |

## Hero

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Badges "Income Tax Act, 2025 · Section 392 · Finance Bill 2026" | Correct Act and section; the Bill became the Finance Act, 2026 (assent 30 Mar 2026) | accuracy | Low | Cites Act, Rules and Finance Act |
| KPI "₹12.75L Tax-free salary" | True only for residents whose only income is salary; it is taxable salary, not CTC | accuracy | Med | Rebate, marginal relief and residency explained (ch 2) |
| "Compute TDS under Section 192 … contractor payments (194C), rent (194-I)" | Old sections beside new ones; rent TDS never covered | accuracy | Med | Old→new table (ch 1); rent dropped |
| "top 10 TDS penalties that cost companies lakhs every year" | Unsourced, sales tone | copy | Low | Removed |

## Table of contents

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Progress strip, "Mark as read", bookmarks, floating mini-TOC | Extra scripts on one 152 KB page | performance | Low | Per-chapter TOC from headings |

## Chapters

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Ch 1 regime table: "NPS 80CCD(2) … 14%" in both columns | Old regime: 10% for non-government employers (s.124(1)(b)); 14% for all only in the new regime (s.124(2)) | accuracy | Med | Corrected (ch 1, 3) |
| Ch 1 "80D up to ₹75K" | Not re-verified under the 2025 Act | accuracy | Low | Number dropped |
| Ch 1 callout "a renumbering, not a policy change" | Forms and perquisite values changed too | accuracy | Med | Old→new Compare diagram |
| Ch 2 slabs, ₹60,000 rebate, Priya example | Correct (kept); called "Section 87A"; marginal relief missing from text | accuracy | Low | s.156, decision tree with marginal relief |
| Ch 2 EPF: "no PAN → maximum marginal rate" | That proviso was dropped in 2023; s.392(7) sets 10% on withdrawals of ₹50,000+ | accuracy | Low | Moved to ch 5 with s.392(7) |
| Ch 3 "basic + DA must be at least 50% of total remuneration" | Codes add excluded allowances above 50% back into "wages"; no 50%-basic rule (Code on Wages s.2(y)) | accuracy, HR practice | High | Corrected; links labour law ch 2 |
| Ch 3 "Higher basic = more taxable salary = higher TDS" | Wrong in the new regime | accuracy | Med | Table of real effects |
| Ch 3 perquisites: car ₹1,800–2,400 + ₹900; housing "15% of salary"; gifts "amount exceeding ₹5,000"; meals ₹50 "old regime only"; loans at "SBI PLR" | Rule 15 (2026): ₹5,000/₹7,000 + ₹3,000; 10/7.5/5% by city size; nil below ₹15,000, else the whole amount; ₹200 a meal with no regime condition; SBI rate on day one of the tax year, nil up to ₹2 lakh | accuracy | High | 1962-vs-2026 Compare and valuation table |
| Ch 3 "medical insurance exempt", "mobile reimbursement exempt" | Not re-verified for the 2026 Rules | accuracy | Low | Left out |
| Ch 3 NPS "14% (central govt) or 10% (others)" in new regime | Contradicts ch 1 and s.124(2) | accuracy | Med | Corrected |
| Ch 4 calendar "Oct–Nov Regime Change Window" | No such window; the final choice is made in the return (s.202(4)); CBDT practice under the 1961 Act (Circular 4/2023) fixed the TDS choice for the year | accuracy | High | "No mid-year window" callout |
| Ch 4 "Paying rent to spouse? Not allowed" | No such bar; rule 205 now requires disclosing the relationship | accuracy | Med | Disclosure and evidence guidance |
| Ch 4 "Form 12BAA"; implied four HRA metros | Now Form 122; eight 50% cities (rule 279) | accuracy | Med | Form 122; HRA formula with a Bengaluru example |
| Ch 5 Amit exit example | Tax on ₹13.25L is ₹78,750, not ₹93,750; on ₹16.05L ₹1,21,000, not ₹1,56,750; a ₹24L projection would have deducted about ₹1.71 lakh by October, not ₹84K | accuracy | High | New computed example; Form 122 Compare |
| Ch 5 "Refund excess TDS — Sec 392(5)(c)"; ch 6 Q9 "we refund in settlement" | 392(5)(c) only adjusts later deductions in the same year; deposited TDS comes back through the return | accuracy | High | Final-settlement formula and explanation |
| Ch 5 "₹80K leave encashment (taxable for non-govt)" | Can be exempt within s.19 limits | accuracy | Med | F&F tax table with caveats |
| Ch 5 NRI: "Section 393 Table 2 / old 195", "15CA/15CB", "22 countries have SSAs" | Salary to non-residents stays under s.392; 15CA/CB are for remittances; SSA count unverified | accuracy | Med | Short residency section; get advice |
| Ch 6 "CBDT will notify revised formats before 1 Apr 2026" | Done: Form 130 with Parts A, B, C (rule 215); first due 15 Jun 2027 | accuracy | Med | Form 16 vs 130 Compare; TRACES flow |
| Ch 6 Q3 "you can switch regime once during the year" | No basis; contradicts ch 1 | accuracy | High | Corrected |
| Ch 6 Q5 "80EEA/24b … New regime: only loss from house property" | 80EEA covered loans sanctioned to March 2022; new regime bars setting house-property loss against salary (s.202(2)(b)) | accuracy | Med | Corrected |
| Ch 6 Q2 "If investments >₹3–4L, old may be better" | Break-even is about ₹5.4 lakh (₹15L salary) to ₹8 lakh (₹25L+) | accuracy | Med | Break-even table (ch 2) |
| Ch 7 "Form 16A", "26Q", "194C/194J", "Sec 402(47)" | Now Forms 131/140 and s.393; the department's FAQ cites s.402(27) for "work" | accuracy | Med | Compare diagram; sub-clause omitted |
| Ch 8 dates, 1%/1.5%, ₹200 a day | Correct; now ss.398 and 427, Forms 138/130 | accuracy | Low | Kept with new references |
| Ch 8 "₹10K–₹1L under 271H"; late Form 16 "₹100/day per certificate" | 2025 Act equivalents not confirmed | accuracy | Med | 271H amount removed; ₹100 shown as 1961 Act rule with a caveat |
| Ch 9 "respond to CPC notices within 30 days" | Unsourced | accuracy | Med | Removed |
| Ch 10 checklists; "deposit by 5th" | Good practice | HR practice | — | Kept as task lists with cycle and timeline |

## Interactive widgets

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Salary TDS calculator (CTC, employer NPS) | Slabs, rebate and marginal relief right; treated CTC as taxable salary; no old regime, surcharge or residency. Meta description promised "regime comparison calculators" | accuracy, SEO | Med | Removed; method, decision tree and break-even table in ch 2 |
| Late Form 16 penalty calculator (employees × days × ₹100) | 1961 Act rule, capped at the tax; not confirmed for the 2025 Act | accuracy | Med | Removed; explained in ch 8 |
| Quizzes and true/false | Click-only; T/F spans unfocusable; colour-coded feedback | accessibility | Med | FAQ and "Myths and facts" table |
| 26 accordions | Most content collapsed; no Enter/Space handling | accessibility, SEO | High | All content visible, headings in order |

## Callouts and boxes

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Snapshot "Exposure: ₹50K–₹5L" (every chapter) | Unsourced ranges | accuracy | Med | Consequences tied to s.398 or s.448 |
| Snapshot and "Remember" boxes, ch 3–5 | Ch 3 and 4 swapped; ch 5's belonged to ch 8 | copy | Med | Rewritten per chapter |
| "How do I measure this?" (`__%` placeholders) | Empty metrics | UX | Low | Removed |
| "Framework alignment" (SHRM, CIPD, AIHR) | Not relevant to tax compliance | copy | Low | Removed |
| 109 emoji icons | Read aloud by screen readers; banned by the guide | accessibility | Low | Site icon set |

## CTAs and footer

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Footer "For educational purposes — consult a tax professional" | Good, but only at the very end | legal | Low | Layout disclaimer on every chapter |

## Meta tags and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| `<title>` "PeopleCraft — TDS for HR Professionals 2026" | One title for ten topics | SEO | Med | Ten titles of 26–50 characters |
| Meta description ("regime comparison calculators … Finance Bill 2026"); og:description "Section 192 obligations" | Overstated and inconsistent | SEO, accuracy | Med | Per-chapter descriptions (150–166 characters), keywords, FAQ |
| JSON-LD `dateModified` 2026-03-01 vs "Updated February 2026" | Inconsistent | SEO | Low | One `checked` date per chapter |
| 47 KB inline CSS, 14 KB inline JS, Google Fonts | Heavy; third-party font request | performance, privacy | Low | Static pages with shared assets |
