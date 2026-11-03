# Audit: PeopleCraft people analytics (original `peoplecraft-analytics.html`)

Audited 2 November 2026 against the archived page and its script (`refs/extracted/scripts/peoplecraft-analytics.js`). Rebuilt as `/toolkit/people-analytics/`.

## Summary

- **The attrition rate is wrong by construction.** Average headcount is `(total + activeCount) / 2`, where `total` is every row ever, so every past leaver inflates the denominator. Exits are counted from "one year ago" with no end date (future last working days count). With no exit-date column, "exits in the trailing 12 months" becomes every inactive person ever. The rebuild uses leavers ÷ ((opening + closing) ÷ 2) for the chosen period, the method in SEBI's BRSR guidance note, and shows the formula with the actual numbers.
- **Dates and statuses are silently misread.** `new Date(str)` reads 05/04/2024 as 4 May and returns nothing for any day above 12 (31/01/2024). Only "active", "working" and "current" count as active, so "Confirmed", "Probation" and "Notice period" are treated as leavers. Nothing tells the user. The rebuild reads Indian day-first dates (with detection and a switch), Excel dates and month names, lets the user decide how each status counts, and lists every affected row in a data-checks panel.
- **Third-party code on a page that handles salaries.** React, ReactDOM, prop-types, Recharts and Babel standalone (about 3 MB) load from unpkg with no Subresource Integrity, and JSX is compiled in the browser on every visit. The page is blank if unpkg is slow or blocked, and a CDN compromise would run with access to the file the page promises "never leaves your browser". The rebuild has no CDN and no framework: one local script (about 30 KB gzipped), with the CSV and Excel parsers loaded only when a file of that type is chosen.
- **Keyboard users can't load a file at all.** The file input is `display:none` and the drop zone is a clickable `div`; the "Expected column format" toggle is a clickable `div` too. Mapping selects have no labels, charts have no text alternative, and the default dark theme uses 9–10px uppercase labels and nav links at 28% white. The rebuild uses real buttons and labelled controls, charts readable with arrow keys, a table view for every chart, and sentence-case text at normal sizes.
- **Invented benchmarks and sales copy.** "Risk Intelligence" flags attrition "above industry benchmark (15%)" and women "below 30% benchmark" with no source; the copy promises "executive-grade workforce analytics" and the top bar sells "₹1,999/year — Executive Access". The rebuild removes the benchmarks, the paywall and the sales language, and explains each figure and its limits instead.

## Head, meta tags and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| `<script src="https://unpkg.com/...">` ×5 + `text/babel` | Runtime CDN libraries without SRI; in-browser JSX compile; slow first paint | Performance, legal | High | Bundled local script, no frameworks, lazy parsers |
| `<body>` | Only `<div id="analytics-root">`: no content without JavaScript, nothing to index | SEO, accessibility | Med | Explanations, formulas, FAQ and sources render as static HTML |
| `meta description` | "executive-grade workforce analytics" | Copy, SEO | Low | Plain 148-character description |
| Open Graph | No `og:image`, `og:url` or canonical; `lang="en"` | SEO | Med | Shared layout: canonical, OG image, `en-IN`, WebApplication and FAQ JSON-LD |

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Fixed top bar | Links at 0.62rem in `rgba(255,255,255,.28)`, far below 4.5:1 | Accessibility | High | Shared site header |
| "₹1,999/year — Executive Access →" | Paywall CTA on a tool page | Copy | Med | Removed; the library is free |
| Breadcrumb bar with "◑" toggle | Glyph-only button named by `title` only | Accessibility | Low | Removed; shared breadcrumbs |
| Both bars on phones | `nowrap` links and CTA overflow a 34px bar, hidden by `overflow-x:hidden` | UX | Med | Shared responsive header |

## Upload step

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Hero "HR Analytics / Dashboard" | Title case, sales tone | Copy | Low | "People analytics dashboard" with a use-when line |
| Drop zone | Not keyboard reachable; `.csv` and `.txt` only, though HR exports are usually `.xlsx` | Accessibility, UX | High | "Choose a file" button; CSV and Excel, multi-sheet workbooks, title rows above the header |
| Paste box | Monospace textarea for raw CSV | UX | Low | Dropped; blank template download instead |
| Errors | "⚠ Failed to parse CSV." with no next step | Copy, UX | Med | Specific messages for `.xls`, password-protected, empty and header-only files, each saying what to do |
| "Expected Column Format" | Clickable `div`, "REQ" badges in amber on cream | Accessibility | Med | "How to prepare your file" section with recognised headings |
| CSV parser | Splits on `\n`; no escaped quotes or multi-line cells; ignores encoding | Accuracy | Med | papaparse, delimiter detection, Windows-1252 fallback |

## Column mapping

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| `detectField` | Substring match on squashed headers: "id" matches "Manager ID", "base" (location) matches "Base Salary", "type" matches any "…type" column | Accuracy | High | Exact and whole-word scoring, exact-only generic words, value checks (dates must parse, IDs mostly unique), each column used once |
| Selects | Field names are `div`s, not labels | Accessibility | Med | Labelled selects with column letters and example values showing how each was read |
| Date format | None | Accuracy | High | Day-first or month-first, detected from the file |
| Status values | Hard-coded; not shown | Accuracy | High | Each value listed with "Still working / Has left / Go by the last working day" |
| Validation | Only "Date of Joining must be mapped"; a wrong column gives zeros silently | UX | Med | Checks for missing, duplicate and unreadable mappings |

## Calculations

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "Total Headcount" | Counts every row ever, including people who left years ago | Accuracy | High | Headcount on the period's end date, with the opening figure |
| Attrition rate | See summary; also blends any period into "trailing 12 months" | Accuracy | High | Per-period rate; annualised (and labelled) when not 12 months |
| "Hiring rate" | New hires ÷ every row ever | Accuracy | Med | Joiners per period and per month |
| Attrition by department | Lifetime exits ÷ lifetime rows; the chart plots exit counts only | Accuracy | High | Period rate per department, leavers beside it, overall reference line, small-team warning |
| Headcount growth | Calendar years, approximated from year numbers | Accuracy | Med | Month-end headcount; financial-year presets |
| Joiners vs exits | Calendar quarters ("Q1" = Jan–Mar, not the Indian Q1); empty quarters dropped | HR practice | Med | Every month, zeros included |
| Monthly hiring trend | Only months with hires, so gaps vanish | Accuracy | Med | Continuous months |
| Gender pay gap | Raw male vs female averages across all roles, red above 10% | HR practice | High | Removed; pay spread by department or grade, link to the pay equity analyser |
| Gender | "F", "female", "Female" counted separately; only Male/Female in the table | Accuracy | Med | Normalised, with "Another gender" and "Not stated" |
| Performance | `active.includes(r)` inside a filter is O(n²); department table re-filters per row | Performance | Med | Single passes and month buckets; 20,000 rows stay fast |

## Dashboard

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Risk Intelligence | Unsourced benchmarks presented as risks | Accuracy, legal | High | Removed; data checks explain what could make figures wrong |
| KPI tiles | Uppercase mono labels at 0.58rem, hover lift, colour stripes | Visual, accessibility | Med | Six tiles: headcount, joiners, leavers (with early leavers), attrition with formula, tenure, gender ratio |
| Pie charts (gender, employment type) | Close values in donuts; colour-only identity | Visual | Med | Thin segmented bar with legend and counts |
| Colours | Theme colours (terracotta, teal, amber…) never checked for colour-blind separation; dashed grids | Accessibility | Med | Site palette validated with the data-viz checks; one-hue validated ramp for ordered bands; solid hairlines |
| Tooltip | Formats any value over 10,000 as money (12,000 people → "₹12K"); the only route to exact values | Accuracy, accessibility | Med | Values lead, labels follow; keyboard and table views carry every value |
| Age profile | Area chart over age bands | Visual, HR practice | Low | Dropped; date of birth only checks impossible dates |
| Department summary table | Useful, but colour-coded numbers and binary gender | Accessibility | Low | Kept as each chart's table view and in the CSV export |
| Filters, export, print | None; dark theme prints light text on white | UX | Med | Period, department, location and gender filters; CSV summary; print stylesheet |
| Footer | "No data leaves your browser" while loading third-party code | Legal | Med | Privacy panel and section; opt-in local copy with delete |

## Sample data

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| 50-row `SAMPLE_CSV` | Dates end in 2024: on 2 November 2026 the 12-month view shows 0 exits and 0 hires, so attrition reads 0.0% | UX, accuracy | High | About 120 people plus past leavers, generated relative to today with a fixed seed |
| Labelling | Not marked as made up | Copy | Low | "Sample data" banner; includes deliberate mistakes to show the checks |

## What was good and kept

- Processing in the browser, the core promise. Kept, and now true without third-party code.
- Automatic column detection with a mapping step. Kept and made more careful.
- A one-click sample. Kept, with data that stays current.
- The department summary table. Kept as table views and in the export.
- The chart set: headcount trend, joiners against leavers, attrition by department, tenure. Kept, with span of control and pay spread added.
