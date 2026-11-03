# Audit: HR toolkit, planning calculators (`hr-toolkit.html`)

Scope: the nine planning tools on the original HR Toolkit page. Each was a collapsible card with inputs, a "Calculate" button and HTML output from `hr-toolkit.js`. The tools are cost per hire, salary band designer, increment budget allocator, 9-box mapper, HR budget builder, attrition cost, HR metrics (20 formulas), headcount planning and pay equity. Page chrome is covered in the toolkit page audit.

## Summary of the most important findings

- **Three tools gave wrong or self-contradicting numbers.**
  - *Attrition cost:* the default result is "0.3x the annual CTC", yet the note under it says replacement "is typically 1.5–2.5x annual CTC".
  - *Headcount plan:* "Total hires needed (inc. attrition replacement)" counts only new roles. The default plan of 200 + 40 therefore ends at 204, and a 30-person team shows zero leavers.
  - *Salary bands:* a "40%" spread is really 50% on the standard (max − min) ÷ min.
- **About 30 benchmarks had no source.** Examples include "₹25K–50K for entry-level" cost per hire, "HR budget typically 1.5–3% of revenue", "IT 8–12%" increments and "Ideal: 10–20% in Star box". All are removed. Readers compare with their own history instead, and the pages cite only definitions we could verify: Bain's NPS method, Eurostat's pay gap definition and the Code on Wages.
- **Hidden assumptions drove the results.**
  - *HR budget:* fixed unit costs such as ₹9 lakh per HR person, ₹40,000 a hire and ₹600 a month per head for engagement.
  - *Attrition cost:* fixed percentages for vacancy loss, onboarding and ramp-up.
  - *Headcount plan:* a 30% "burden on top of CTC" that double counts the employer PF and gratuity already inside CTC.

  Every one of these is now a labelled input.
- **People-practice and legal risk.** The 9-box's "Exit Zone" said "Manage out; redeploy or separate". The pay equity tool collected names and unused experience data, silently dropped "Other" gender and never mentioned the equal pay rule. The rebuild frames the 9-box as a discussion tool and collects only role, gender and pay. It also cites sections 2(v) and 3 of the Code on Wages, 2019.
- **Accessibility and UX.**
  - *Labels:* all 82 labels are `<span>`s, so no input has a programmatic label.
  - *Results:* they are hidden until a click, with no live region.
  - *Cards:* click-only `<div>`s that keyboard users can't open.
  - *Errors:* `alert()` boxes.
  - *Data:* list tools lose their data on reload.

  All of this is fixed. The originals got some things right, and the rebuild keeps them: Indian number formatting, realistic example inputs, the honest average-salary note and the small-sample caution.

## Shared calculator pattern

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Card head `div onclick` | Not keyboard operable; no `aria-expanded` | Accessibility | High | One page per tool, with its own URL, title and description |
| `<span class="calc-label">` | No `<label for>` on any input | Accessibility | High | Real labels; help text linked by `aria-describedby` |
| "Calculate" buttons; result `display:none` | Stale or hidden results; no `aria-live` | UX, accessibility | Med | Live results, announced politely; inputs kept in the URL for sharing |
| Colour-only status (`#C05050` gaps, red "Remaining budget") | Lost for colour-blind readers and in print | Accessibility | Med | Words carry status ("Over budget", "lower") |
| Emoji titles; "CFO presentation-ready", "Board-ready output" | Decoration, sales copy | Copy | Low | Plain titles; no claims |
| `innerHTML` with typed names and roles | Self-XSS, fragile | Security | Low | `textContent` throughout |
| 31 tools on one 333 KB page | No per-tool URL, metadata or search entry | SEO | Med | Static pages with FAQ and structured data |

## Cost per hire

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Five cost inputs | Misses checks, referrals, travel and interviewers' time; full recruiter salary | Accuracy | Med | Nine lines as external and internal costs; recruiter time share; split bar; optional cost ratio |
| `hires \|\| 1` | Blank hires divides by 1 | Accuracy | Med | Requires hires |
| "₹25K–50K entry, ₹80K–1.5L mid, ₹2L–5L+ senior"; "8.33% (1 month salary)" | Unsourced; mixes salary and CTC | Accuracy | High | Removed; compare channels and years |

## Salary band designer

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| `min = mid × (1 − spread/200)` | "40%" spread is really 50% | Accuracy | High | Standard definitions, stated and tested |
| P25 = 0.85 × median, P75 = 1.15 × median | Invented percentile ratios | Accuracy | Med | Midpoint is your input |
| One role only | No progression, overlap or structure | HR practice | Med | 2–12 grades, overlap, band chart, grade table, CSV |
| Fixed compa guide; "Promote… or risk compression" | Ignores the band just built; promotion by pay position | Accuracy, HR practice | Med | Checks a real salary (compa-ratio, penetration); red/green-circle guidance |

## Increment budget allocator

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Rating multipliers only, solved to spend the pool | Not a merit matrix; no real budget check | HR practice | Med | Rating × band-position matrix, cost meter, one-click scaled matrix |
| "IT 8–12%, Manufacturing 6–9%"; "Outstanding 2.0–2.5×" | Unsourced | Accuracy | High | Removed |
| Average-salary note | Honest | Accuracy | (kept) | Kept in "What this tool assumes" |

## 9-box mapper

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| "Exit Zone: Manage out"; "Risk: PIP"; "retain at all cost" | Prescribes exits from a grid | HR practice, legal | High | Site vocabulary, conversation-starting actions, fair-process callout |
| `parseInt(...) \|\| 3` | Blank ratings become 3 | Accuracy | Med | Levels chosen explicitly |
| Array in memory | Lost on reload; no edit | UX | Med | Saved in this browser; edit, paste, CSV, print, clear |
| "Ideal: 10–20% in Star box, <5% in Exit Zone" | Unsourced | Accuracy | Med | Removed; calibration prompt |
| 1–5 ratings banded 1–2 / 3 / 4–5 | Sensible | HR practice | (kept) | Kept for pasted lists |

## HR budget builder

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Hard-coded unit costs and 1:100 HR ratio | Hidden, unsourced | Accuracy | High | Every unit cost is an input, marked as an example |
| `round(hc/100)` HR team; "N/A%" without revenue | 149 people get 1 HR person, 150 get 2; display bug | Accuracy | Low | Inputs; ratios shown only when given |
| "1.5–3% of revenue"; "SCQA framework from Chapter 3" | Unsourced; points to another product | Accuracy, copy | Med | Removed; per-employee figure against your history |

## Attrition cost

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| "0.3x" result beside "typically 1.5–2.5x" | Self-contradiction | Accuracy | High | No benchmark; × CTC and months of CTC |
| Fixed 50%, 5%, 40%, 260 days, "15% of daily rate" | Invisible assumptions | Accuracy | High | All inputs; manager time as hours × hourly cost |
| Time to hire used as vacancy | Ignores notice overlap | Accuracy | Med | Days the seat is actually empty; timeline |

## HR metrics (20 formulas)

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Static table | Nothing computable | UX | Med | 20 cards with formula, inputs and live result |
| "Gender Pay Gap = Avg male ÷ Avg female… Target: 1.0" | A ratio, not a gap | Accuracy | Med | (men − women) ÷ men × 100 (Eurostat) |
| "Training ROI = (Post − Pre perf) ÷ cost" | Not a return | Accuracy | Med | (benefit − cost) ÷ cost × 100 |
| "Time to Hire: JD posted → offer accepted" | That is time to fill | Accuracy | Low | Time to fill from a list of roles; timeline explains both |
| "POSH… closed in 90d ÷ Total" | Mixes closure with the inquiry limit | Legal | Low | "Completed within the legal time limit"; links the POSH chapter |
| Ten benchmark ranges | Unsourced | Accuracy | High | Removed; "set your own targets" |

## Headcount planning model

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Hires = new roles, labelled "inc. replacement" | Ends at 204, not 240 | Accuracy | High | Leavers replaced; months balance |
| `Math.round(opening × monthlyAtt)` | Small teams show no leavers | Accuracy | Med | Running-total rounding (30 people at 18% give 5) |
| 30% "burden on top of CTC" | Double counts PF and gratuity | Accuracy | High | "Costs outside CTC", default 0% |
| `ceil(hires × lead ÷ 240)` recruiters; industry ranges | Unexplained; unsourced | Accuracy | Med | Busiest month, roles to open early, empty seats |

## Pay equity analyzer

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Names and experience collected; experience unused | Excess personal data | Privacy | Med | Role, gender, pay only; nothing uploaded; storage opt-in |
| "Other" dropped silently; mean only | Misleading; incomplete | Accuracy | Med | Counts shown; mean, median, like-for-like, quartiles, role table |
| ">15%" colour flag; "Target: <5%"; "Used for ESG reporting" | Arbitrary, unsourced, colour-only | Accuracy | Med | Small-group flags in words; set your own threshold |
| "Sample size <5 per group may not be statistically meaningful" | Good caution | HR practice | (kept) | Kept, beside the results |
