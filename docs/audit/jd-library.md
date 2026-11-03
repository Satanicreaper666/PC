# Audit: JD library (`jd-library.html`, live snapshot)

One 279 KB HTML file. All 50 JDs sit in an inline `const JD_DATA` array and are drawn by JavaScript into a card grid, a slide-in panel, an "AI" generator, a "Market intelligence" view and an "Analytics" view with 16 Chart.js charts.

## Summary of the most important findings

- **Invented salary and market data presented as research.** Every JD carries P25/P50/P75 CTC for "Metro" and "Tier 2", a trend label ("Overheated · 18% YoY"), ESOP percentages and benefit amounts. The page says they were "cross-referenced across 6 primary compensation surveys" and that "41 bands [are] confirmed within ±10%", but nothing traces to a dataset, and the page contradicts itself (see below). The rebuild drops all of it. Each JD now has a pay-range field for the employer's own figures and links to the salary band designer.
- **The "AI generator" isn't AI.** `generateJD()` waits 600 ms "for UX feel", copies responsibilities from other JDs at random (`Math.random`) and multiplies a base salary by `salMult`. The rebuild replaces it with an honest blank JD template.
- **Discriminatory and outdated requirements.** Eight JDs filter on institution ("MBA from Tier 1 institution (IIM A/B/C or equivalent)", "from Tier 1 institution (IIT, IIM, BITS, SRCC, ISB)"). The MR JD asks for field visits "in any weather" and owning "a two-wheeler or four-wheeler". JDs cite repealed laws ("ID Act", "Factory Act", "Payment of Bonus Act") and "Form 16" without its successor, Form 130. All 50 were rewritten. The four Labour Codes (in force from 21 November 2025), the Income-tax Act, 2025 and the DPDP phasing (most duties from May 2027) are now stated correctly.
- **The core action is inaccessible and phones lose features.** Cards are `<div onclick>`, so they can't be reached by keyboard. The detail panel has no dialog role, no focus handling and an unlabelled "×". The page has no `role` attributes at all. Below 700 px the sidebar is `display:none`, so phones get no filters. The rebuild uses links, real pages, labelled selects and a layout that works at 390 px.
- **One URL, JavaScript-only content and third-party requests.** Without JS the grid is empty, and there are no per-role URLs for search engines. The page loads Google Fonts, Chart.js from cdnjs and Vercel Insights analytics. The rebuild has 51 static pages with Occupation JSON-LD, no external scripts and no tracking.

## Meta tags, head and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Description | "50 research-validated job descriptions… AI-powered JD generator, salary benchmarks… India 2025": three unprovable claims and a stale year | trust, SEO | High | Plain description per page; no "validated", "AI" or year claims |
| `og:url` | Points to `peoplecraft.vercel.app`; no canonical; `lang="en"` | SEO | Med | Canonical per page from the site config; `en-IN` |
| Scripts | `/_vercel/insights/script.js`, `fonts.googleapis.com`, cdnjs Chart.js | legal, performance | High | None: self-hosted font, no charts, no analytics |
| Handlers | Inline `onclick` throughout | performance, security | Low | Bundled scripts, compatible with the site's strict CSP |

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Cross-module bar plus top bar | Two navigation rows; "Labor Law" (US spelling) | UX, copy | Low | Shared site header; breadcrumbs on every page |
| View tabs (JD, Market intelligence, Analytics) | Two of three views are invented data | trust | High | Removed |
| "Generate JD" button | Leads to the fake generator | trust | High | "Start from a blank JD" |
| Theme key `d` | Single-key shortcut that can't be turned off (WCAG 2.1.4) | accessibility | Med | Removed; light theme only, as site-wide |
| Count chip "50 JDs" | Fine | UX | Low | Live "Showing n of 50" in an `aria-live` region |

## Sidebar filters

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Industry counts | Hard-coded and wrong for five industries: Technology & SaaS shows 8 (actually 10), Healthcare 6 (5), Manufacturing 5 (4), HR & People 5 (6), Real Estate 2 (1) | accuracy | Med | Counts computed at build time and updated live as other filters change |
| Taxonomy | "HR & People" listed as an industry; Academic Head and Curriculum Designer filed under "Operations" | accuracy | Low | Separate industry and function lists; new "Education and learning" function |
| Mobile | Sidebar hidden at ≤700 px | UX | High | Three labelled selects that stack on phones |
| State | Filters not in the URL; `aria-pressed` missing | UX, accessibility | Med | URL-synced (`?function=…&level=…`); home-page links land pre-filtered |

## JD cards and detail panel

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Card | `<div onclick>`, not focusable; shows "Metro P50 CTC" and a trend chip | accessibility, trust | High | Card is a link to the JD's own page; level, experience and summary only |
| Panel | No dialog semantics, focus or Escape; "×" has no name; tabs lack `aria-selected` | accessibility | High | A normal page with sections and jump links |
| Salary tab | P25/P50/P75 grid, "Fixed : Variable", "ESOP / RSU Norms", "₹10L health cover" | accuracy, HR practice | High | Removed; pay-range field and salary band designer link |
| Copy JD | Pastes "SALARY BENCHMARK Metro P50…" and "Generated by PeopleCraft JD Library" into the user's JD | trust, UX | Med | Fill-in JD with company, location and work mode, reporting line, pay, apply-by and how to apply; Copy, Word and Print |
| Emoji icons | 📋 📍 📅 🔍 ✓ ✗ used as labels | visual, accessibility | Low | The site's SVG icon set |
| Type size | 10–13 px used about 80 times | accessibility | Med | Site scale; labels never under 13 px |

## JD content (50 records)

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Narratives | Hype: "builds careers", "zero attrition" as a success measure, "no ceiling", "unlimited upside", "a 5-year gold rush", "not a job — it is a full MBA" | copy, HR practice | Med | Plain two-to-three-sentence summary: why the role exists and what success looks like |
| Must-haves | Institution filters in 8 JDs; "Existing HNI/UHNI book preferred" invites poaching a former employer's clients; vehicle ownership | legal, HR practice | High | Skills and results instead; degree only where the work needs it |
| Law | "ID Act", "Factory Act", "Payment of Bonus Act", "ICC", "MCI guidelines", "Form 16", "Section 143(2)", "FLDG" | accuracy, legal | High | Labour Codes, OSH Code, Internal Committee, Form 130, Income-tax Act, 2025 transition; unverifiable regulator names generalised |
| Errors | "ESOP grant cycle… including ESIC tax computation"; "PIL or APA experience" | accuracy | Med | ESOP perquisite tax; APA or mutual agreement procedure |
| Competency scale | Mixes "Basic", "Developing" and "Leadership"; entry roles rated "Expert" | accuracy | Low | Working knowledge, Proficient or Expert; Technical or Behavioural; entry roles capped at Proficient; key explains each level |
| Flags | Some unfair or outcome-biased ("Wants a structured role with clear KPIs", "QN escalate to commercial penalties under their watch") | HR practice | Med | Evidence-based signals, with a note never to judge personal details |
| Questions | Three per role, no scoring guidance; some dated ("in 2025", "IRDAI has recently tightened…") | HR practice | Med | Same questions where sound, each with "What a strong answer shows"; work-sample rules (short, same brief, never real work) |

## "AI Generate JD" modal

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Generator | Rule-based remix with random picks; invented salary via `salMult`; JD lost on reload; `alert()` for errors | trust, UX | High | Blank JD template with prompts, live preview, drafts saved in the browser, Word export |
| Narrative template | "take us to the next level… thrive in ambiguity, this is your stage" | copy | Med | Writer's prompts and the six-part structure from the recruitment handbook |

## Market intelligence view

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| Stat tiles | "JDs Validated 50", "Bands Confirmed 41", "New Jobs Projected 1.28Cr" with no dataset | trust | High | Removed |
| Source cards | Survey figures quoted without links; Aon given as "1,176 companies" here and "1,400+ companies" in the footer note | accuracy | High | Removed |
| "Key findings" | "All Regulatory Citations Validated as Current", while the JDs cite repealed Acts; "DPDP… a 15–20% salary premium trigger" | accuracy, trust | High | Removed; legal points checked against `hr-facts-india.md` |
| Roadmap note | "Version 3 should add a GCC flag per JD": an internal note published to users | copy | Low | Removed |

## Analytics view

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| KPI tiles | "National Avg Increment 9.2%" here and 9.4% in the previous view | accuracy | High | Removed |
| 16 charts and heatmap | Hard-coded arrays; P50 CTC "₹ Lakhs" heatmap by industry × level; `<canvas>` with no text alternative | trust, accessibility | High | Removed; Chart.js no longer loads |
| Validation donut | Data `[41,7,2]`, while the text says "Trend label adjusted upward 5 roles" | accuracy | Med | Removed |

## What was good and kept

- **A realistic spread of Indian roles**, from medical representative, CRA and pharmacovigilance to RERA sales, BRSR and NABH, with India-specific context such as UPI, regional-language users and TPA claims. All 50 roles were kept.
- **A sound JD structure:** responsibilities, competencies, must-have and good-to-have, signals and interview questions. It became the content schema, and every list was kept and edited.
- **Many good behavioural questions** ("How do you decide what not to build?"). They were kept and given scoring guidance.
- **Filtering by industry, level and function, text search and copy to clipboard.** All were kept and improved, with URL sync, live counts, grouping, Word and Print.
