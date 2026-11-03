# Audit: PeopleCraft org chart builder (original `peoplecraft-orgchart.html`)

Audited 2 November 2026 against `refs/upload-latest/src/peoplecraft-orgchart.html` (690 lines, inline script). Rebuilt as `/toolkit/org-chart-builder/`.

## Summary

- **Common HR exports break it or are misdrawn without a word.** A CEO listed as their own manager (a usual export pattern) becomes their own child, so there is no root and the tool stops. People in a reporting loop are never reached and vanish from the chart but stay in the totals. Duplicate IDs overwrite each other. Rows without an ID are skipped. The rebuild handles each case and lists it, with row numbers, in a data-checks panel.
- **Columns are matched by substring.** `findCol` takes the first header containing "id", so "Manager ID" before "Employee ID" becomes the person's own ID. The rebuild scores whole-word matches, never reads a manager column as the person's own field, and lets the user check every match.
- **Figures disagree and use invented norms.** "Total Headcount: Active employees" counts every row; depth is `maxD+1` on screen but `maxD` on the slide; "All managers have healthy span of control (<7)", with red at 8 on one tile and 10 on another. The rebuild uses one tested analysis everywhere and flags spans against a range the user sets, described as an assumption.
- **Keyboard and screen-reader users are locked out.** The drop zone and export cards are clickable `div`s and the file input is hidden. The chart is an unlabelled SVG; search only dims boxes. The rebuild has real buttons, a labelled chart with keyboard pan and zoom, and a WAI-ARIA tree view of the same people.
- **A "privacy-first" page loads third parties.** PptxGenJS loads from jsDelivr on every visit without Subresource Integrity, plus Google Fonts and Vercel Insights. The rebuild installs pptxgenjs from npm and imports it only when someone clicks PowerPoint.

What was good and kept: everything runs in the browser, a CSV template and sample data, the department table, the manager-to-contributor ratio, three export formats, and escaping of file text before it goes into SVG markup.

## Head, meta tags and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| pptxgenjs `<script>` from jsDelivr | No SRI; about 470 KB on every visit, used or not | Performance, legal | High | npm dependency in its own chunk, loaded on click |
| Google Fonts, Vercel Insights | Third-party requests on a page promising "No data leaves your device" | Legal | Med | Self-hosted font, no tracking |
| `data-theme="dark"` default | Exports inherit it, so PNG and slides can come out dark | Visual | Low | Exports are always white |

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Cross-site bar | 0.62rem links at 28% white; hidden under 768px | Accessibility | High | Shared site header |
| Upload/Chart/Analyze/Export tabs | No tab semantics; focus doesn't move; empty tabs before data | Accessibility, UX | Med | Three steps; each heading is focused and announced |
| `d` key toggles the theme | Single-key shortcut that can't be turned off (WCAG 2.1.4) | Accessibility | Med | Removed |
| `.app{height:100vh;overflow:hidden}` | Page inside a nested scroll box; no `<main>` | Accessibility | Med | Normal page scroll; only the chart pans |

## Upload

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Drop zone `div onclick`, hidden input | No keyboard path to a file | Accessibility | High | "Choose a file" button; drop kept for mouse users |
| `accept=".csv"` | HR exports are usually .xlsx | UX | High | CSV and Excel, several sheets, title rows above the header |
| CSV parser | Breaks quoted multi-line cells and `""` escapes | Accuracy | Med | papaparse, loaded on demand |
| `alert()` errors | "CSV must have "Employee ID" and "Name" columns." | Copy, UX | Med | Inline messages saying what to do next |
| Template rows | Realistic names in a file people forward | HR practice | Low | Blank template; sample of 62 obviously invented people |

## Building the hierarchy

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Self-manager | Own child: no root, "Cannot determine hierarchy" | Accuracy | High | Treated as the top; noted |
| Reporting loops | Silently missing from the chart | Accuracy | High | Broken at the first person in the file; listed |
| Duplicate IDs | One row overwritten | Accuracy | High | Both kept; reports go to the first; listed |
| Manager not found | Becomes a root, unexplained | UX | Med | Top of a separate chart, with the missing ID shown |
| Manager names | Not supported | UX | Med | IDs, names, "Name (ID)", "ID - Name"; namesakes reported |

## Chart

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Layout | Every report side by side, so big teams are very wide | UX | Med | Contributors stack in columns under their manager |
| Cards | Names cut at 17 characters, no tooltip; status as a red or green dot only | Accessibility | Med | Full text in a tooltip and the tree; colours always named in a legend |
| Zoom "-" "+" | Unlabelled; `cursor:grab` but no drag | Accessibility, UX | Med | Labelled buttons; keys +, −, 0 and arrows; drag to pan |
| Search, department filter | Dim others to 15% opacity; no count or jump | Accessibility | Med | Match list, count announced, chosen person centred; "Show only this team" |
| Collapse | None | UX | Med | + and − on each manager; big organisations start at three levels (tested with 3,000 people) |
| Text alternative | None for the SVG | Accessibility | High | Tree view: arrow keys, Home/End, type-ahead, shared open and closed state |

## Analyze

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Headcount, managers | All rows counted as "active"; missing managers counted as managers | Accuracy | Med | "People" in the file; managers are people with a direct report |
| Span alerts | "healthy" below 7; thresholds differ by tile | Accuracy, HR practice | High | User's range (default under 3 or over 10) with a note that there is no single right span |
| "Single Points of Failure" | Any one-manager department, even a one-report team; undefined | Accuracy | Med | Only manager in a department with at least N of its people in their line; N editable; framed as a succession prompt |
| One-report managers | Not shown | HR practice | Low | Listed |
| Department table | Useful | | | Kept, plus locations and "manager elsewhere" |

## Export

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Export cards | Clickable `div`s | Accessibility | High | Buttons with status messages |
| PNG | Captures dimmed search state | Visual | Low | Clean export of what is shown, scaled within browser limits |
| PowerPoint chart slide | SVG image that older PowerPoint and LibreOffice may not show | UX | Med | PNG chart plus editable boxes, one slide per team, departments and "worth a look" |
| Metrics slide | Depth and counts differ from the screen | Accuracy | Med | Same analysis as the page |

## Footer and guidance

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| No explanation | Figures undefined; privacy covered in one line | UX, legal | Med | "How it works" with a Flow diagram and formula, file steps, a data-check table, a privacy callout with DPDP context, FAQ |
| No storage | Nothing can be kept between visits | UX | Low | Opt-in "Keep this list in this browser" with Delete |
