# Audit: HR Toolkit pay and exit calculators (original page)

Scope: tools 22–26 and 35 of the original `hr-toolkit.html` (take-home, leave encashment, ESI, EPF, professional tax, F&F) and the shell they share. Facts are judged against the law on 2 November 2026; sources are in `src/data/statutory.ts`.

## Summary

- **The F&F tool gave the wrong legal deadline.** It said "F&F must be settled within 30 days of LWD". Since 21 November 2025 the Code on Wages (s.17(2)) requires wages to be paid within two working days of resignation, removal, dismissal, retrenchment or closure. Gratuity has its own 30-day limit.
- **Every statutory number was hard-coded and several are now out of date.** Examples: the PF wage ceiling (₹15,000; ₹25,000 from 17 Sep 2026), Karnataka professional tax (threshold ₹15,000; ₹25,000 since April 2023, with ₹300 in February since April 2025), West Bengal slabs (changed October 2026), Tamil Nadu (monthly figures; actually half-yearly, revised October 2024), Rajasthan (given slabs, but it levies none) and Odisha (repealed April 2026).
- **None of the tools used the Labour Codes' definition of wages.** PF, ESI, gratuity and leave were all worked on "basic" or "gross". The Codes' wages (basic + DA + non-excluded pay, with excluded items over 50% added back) drive all four, and the 50% rule was not mentioned anywhere.
- **Tax was computed with 2025-26 rules under the repealed 1961 Act**, inside a tool sold as "exact monthly in-hand". It mixed slab maths, an approximate rebate and an HRA rule that treated Bangalore as a metro. The rebuild stops at in-hand pay before tax and links to the TDS handbook.
- **The shell was hard to use with a keyboard or screen reader.** Cards opened from a clickable `div`, inputs had no `<label for>`, results were injected with `innerHTML` with no live region, there were emojis in headings and ALL CAPS results, and nothing could be shared or linked per tool.

## Shared shell, meta and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Header CTA | "₹1,999/year — Executive Access →" | copy, legal | High | Free library; no sales language |
| Intro stats | "16 Calculators" and "5 Live Calculators" on one page | accuracy | Med | No counts; one page per calculator |
| Tool cards | Opened by `onclick` on a `div` (34 instances); not focusable | accessibility | High | Calculator is always open; real form controls |
| Inputs | `<span class="calc-label">` beside `type=number`; no `<label for>`, no ₹ prefix, no Indian digit grouping | accessibility, UX | High | `Num`/`Pick`/`DateIn` with labels, help text, ₹ prefix, commas accepted |
| Calculate buttons | Result appears only after a click; empty input returns silently | UX | Med | Recalculates on every input; plain messages say what to fix |
| Results | `innerHTML` strings, no `aria-live`; red/green inline colours carry meaning | accessibility, visual | Med | Polite live region, line table with labels, notes as text |
| Headings and results | Emojis (💵 🏦 🏛 💸); "NET PAYABLE", "NOT ELIGIBLE" | copy | Low | Sentence case, no emojis |
| Sources and dates | No source or checked date for any rate | legal, accuracy | High | "Rates and limits as at 2 November 2026" panel on every calculator, with law, source link and confidence |
| URL and SEO | All tools on one page; no per-tool URL, FAQ or shareable result | SEO, UX | Med | One page per calculator with FAQ schema; inputs kept in the URL |
| Script | 987 lines of global inline JS, no tests | performance, accuracy | Med | Pure logic modules with 89 unit tests, including every worked example on the pages |

## Take-home salary calculator (tool 22)

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Promise | "see exact monthly in-hand after all statutory deductions … and TDS" | copy, accuracy | High | "In-hand pay before income tax"; TDS handbook link |
| City picker | Metro mapped to Maharashtra PT, everything else to Karnataka; Delhi has none, Chennai is half-yearly, Kolkata uses WB slabs | accuracy | High | State picker driven by verified state slabs |
| PF | ₹15,000 ceiling; worked on basic only | accuracy | High | ₹25,000 from 17 Sep 2026; on the Codes' wages |
| Admin + EDLI | 1% on the PF base, always deducted from CTC; EDLI not capped | accuracy | Med | Shown as an employer cost outside CTC, EDLI capped |
| ESI | Gross-pay test, `Math.round`, one-pass estimate | accuracy | Med | Codes' wages, rounded up per SS (Central) Rules r.19, structure solved so all parts add to CTC |
| Tax | FY 2025-26 slabs, `if (ti<=1200000) tax=0` rebate shortcut, old-regime HRA with Bangalore as metro | accuracy, legal | High | Removed |
| 50% rule | Absent | HR practice | High | Shows the share of excluded allowances and any add-back; optional "count employer PF" toggle because the point is unsettled |
| Good | Line-by-line CTC → gross → net layout; gratuity provision at 15/26 | — | — | Kept, with a breakdown diagram and worked example |

## EPF / PF calculator (tool 25)

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Basis options | "Restricted (12% of Basic, EPS on ₹15,000)" computed exactly like "Voluntary" | accuracy, UX | Med | Two clear options: up to the ceiling, or full wages |
| Ceiling | ₹15,000 throughout | accuracy | High | Date-aware ₹15,000 → ₹25,000 (17 Sep 2026), split-month note |
| EPS | Always deducted, even for non-members | accuracy | Med | Asks "member of EPS?" instead of assuming |
| EDLI admin | Folds a 0.02% "EDLI admin" charge into admin (the code comment says 0.002%) | accuracy | Low | EDLI 0.5% and admin 0.5%, as in EPFO's 2026 examples |
| Projections | Corpus at a fixed 8.25%, salary growth, EPS pension (₹7,500 maximum) | accuracy | Med | Removed: rates and EPS rules change, and EPS 2026 needs fresh verification |
| Notes | "EPF is withdrawable after 2 months of unemployment"; tax-free limits under the 1961 Act | legal | High | Removed; EPF Scheme 2026 bars full withdrawal for 12 months after leaving in most cases |
| New joiners | Not covered | HR practice | Med | Flags an "excluded employee" above the ceiling |
| Good | Clear EPF vs EPS split, EPS capped at the ceiling | — | — | Kept, with a Breakdown and a who-must-join decision tree |

## ESI calculator (tool 24)

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Rounding | `Math.round` (₹18,100 gives ₹588 employer share; rules say round up to ₹589) | accuracy | Med | Rounds each share up to the next rupee |
| Limits | No ₹25,000 limit for employees with a disability | accuracy | Med | Added |
| Coverage note | "10+ employees (20 in Maharashtra and Chandigarh)", "register within 15 days" | accuracy | Med | Code position: 10 employees, voluntary below, hazardous work always covered |
| Transition | Silent | legal | High | Banner: old ESI rules are saved only to 20 Nov 2026 |
| Low wages | No exemption for very low daily wages | accuracy | Low | Optional ₹176 average-daily-wage check, marked "confirm with ESIC" |
| Good | Continued coverage to period end was explained | — | — | Kept as a note and on the page |

## Professional tax calculator (tool 26)

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Karnataka | Taxed above ₹15,000 at ₹200 | accuracy | High | Nil below ₹25,000; ₹200, ₹300 in February (Act 33 of 2025) |
| Maharashtra | February ₹300 only in a note; no women's exemption up to ₹25,000 | accuracy | Med | Both computed; gender asked only for Maharashtra |
| Tamil Nadu | Monthly slabs ₹135–₹1,095 | accuracy | High | Greater Chennai Corporation half-yearly slabs (₹180–₹1,250, from Oct 2024); other bodies flagged |
| West Bengal | Slabs replaced from October 2026 | accuracy | High | Date-aware: old slabs to Sep 2026, new from Oct 2026 |
| Rajasthan, Odisha | Slabs shown; Rajasthan is reported to levy none, Odisha repealed from 1 Apr 2026 | accuracy | High | Shown as no professional tax |
| Kerala, MP, Assam | Unverified monthly slabs; Kerala is half-yearly by local body | accuracy | Med | Not computed; Kerala and Goa explained |
| "State max PT per year" | ₹13,140 for TN, ₹12,000 for Kerala, while the same card says Article 276 caps PT at ₹2,500 | accuracy | High | Removed; annual totals come from the slabs |
| Good | Telangana, Andhra Pradesh, Gujarat slabs; Delhi and UP as nil | — | — | Kept (TS/AP marked medium confidence) |

## Leave encashment calculator (tool 23)

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Daily rate | `Math.round(basic/26)` before multiplying by days | accuracy | Low | Full precision, rounded once |
| Divisor | 26 fixed; many policies use 30 | HR practice | Med | Choice of ÷26 or ÷30, said to be a policy matter |
| Tax | Encashment on resignation called "fully taxable", which is not the usual reading of the 1961 Act exemption for retirement "whether on superannuation or otherwise"; tax now sits in the 2025 Act | accuracy, legal | High | Tax not computed; link to the TDS chapter on leavers |
| Timing | No payment deadline | legal | Med | OSH Code s.32: 2 working days on leaving, 2 months on retirement or death, on request at year end |

## Full and final settlement calculator (tool 35)

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Deadline | "within 30 days of LWD" | legal | High | Due dates per part: 2 working days (wages), OSH rule for leave, 30 days for gratuity, using the employer's working-day calendar |
| Gratuity years | `floor(days/365.25)`; a final part-year over six months ignored (6 y 8 m paid as 6) | accuracy | High | Calendar years, months and days; part-year rule for the amount only |
| Gratuity eligibility | Five years only; no fixed-term (1 year) or death rule | accuracy | High | Shares the gratuity calculator's logic |
| Notice recovery | `gross/30 × shortfall` applied to everyone | HR practice, legal | Med | User enters the contractual figure; the page explains why |
| Tax note | "TDS on F&F applies per Section 192" (1961 Act) | legal | Med | Points to the TDS handbook under the 2025 Act |
| Good | Dues, recoveries and net in one statement; PF settled separately | — | — | Kept, with a Timeline of deadlines and a checklist of steps |

## New in the rebuild

The gratuity calculator now follows the Code on Social Security (service dates, fixed-term rule, ₹20 lakh ceiling). Added: a notice period calculator (contractual notice, month-end dates, buy-out and waiver) and a working days calculator (three weekly-off patterns, holidays).
