# Audit: PeopleCraft mail merge (original `mail-merge.html`)

Audited 2 November 2026 against `refs/upload-latest/src/mail-merge.html` (707 lines, inline script). Rebuilt as `/toolkit/mail-merge/`.

## Summary

- **Eight thin letters of its own, out of step with the library.** The mail merge carries hard-coded templates that the toolkit's letter pages already do better: its offer letter has no conditions, background-verification consent, notice period or CTC breakdown. The rebuild uses the site's own letters and two team-friendly forms, built from the toolkit at build time with the same renderer, so a merged letter matches the letter page word for word and updates when the letter does.
- **Some template text is unsafe to send in bulk.** The relieving letter says "All dues have been settled" and then that settlement "will be processed within {{fnf_timeline}}", with a sample of "45 days"; the Code on Wages requires wages due on an exit to be paid within two working days. The warning letter states a violation without asking for the employee's explanation, and every experience certificate calls the person "a dedicated professional", a judgement HR records may not support. The rebuild doesn't carry these templates over; the missing letter types are listed for the content owner.
- **The output is hard to use.** "Download All (.txt)" fires one download per letter, which browsers block after the first, and plain text loses bold, lists and tables. "Print" prints only the letter on screen. The rebuild makes one Word file with a letter on each page, prints all letters with page breaks, and copies one letter as formatted text.
- **No checks before letters go out.** Headers must equal variable names after lower-casing ("employee_name"); anything else becomes "[ctc]" inside the letter. Dates and amounts are printed as typed. The rebuild matches columns by label, id and common HR headings, lets the user fix each match or type one value for every letter, formats dates (2 November 2026) and rupees (₹12,00,000), and checks every row before output.
- **Keyboard users can't upload.** The upload area is a clickable `div` and the file input is hidden; steps are clickable `div`s; the toast isn't announced. The rebuild has real buttons, labelled fields, live status messages and visible focus.

What was good and kept: everything runs in the browser, a CSV template per letter, a row-by-row preview with previous and next, copy, and a clear three-step idea (letter, data, output), now four steps.

## Head, meta tags and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Google Fonts, `/_vercel/insights/script.js` | Third-party requests under "No data leaves your browser" | Legal | Med | Self-hosted font, no tracking |
| `data-theme="dark"` | Dark default; the letter preview turns dark too | Visual | Low | Light theme; letters on white paper |
| Description | Promises "warning letters" and "appraisal letters" | SEO, copy | Low | 166-character description of what the tool does |
| "Beta" chip | Unclear status on a tool people rely on | Copy | Low | Removed |

## Layout and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| `100vh` app grid with a sidebar | Nested scrolling; on phones the sidebar is a fixed overlay behind "☰", and it holds the upload and Generate button | UX | High | One column of steps that works at 390px with no overflow |
| "☰" toggle | No `aria-expanded`; covers the page | Accessibility | Med | No hidden panels |
| Step tabs (`div.step onclick`) | Not focusable | Accessibility | Med | Step headings; later steps appear when there is data |
| `d` and arrow-key shortcuts | Single-key shortcut toggles the theme (WCAG 2.1.4) | Accessibility | Low | Removed; previous and next are buttons |

## Templates

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Template list | Emoji icons; active state by colour only | Visual, accessibility | Low | A labelled select grouped into employer letters, forms and employee letters |
| Offer letter | No conditions, BGV consent, notice, breakdown or acceptance block; "₹{{ctc}}" doubles the ₹ if the file has one | HR practice, accuracy | Med | The site's offer letter, with amounts formatted once |
| Experience certificate | "a dedicated professional … with diligence and integrity" in every letter | HR practice, legal | Med | The site's factual experience letter |
| Relieving letter | "All dues have been settled" and "will be processed within 45 days" | Accuracy, legal | High | The site's relieving letter with a settlement-status choice |
| Warning letter | Finds a violation without the employee's explanation; bulk discipline | Legal, HR practice | High | Not carried over (gap listed for the content owner) |
| Appraisal and increment letters | Near duplicates; increment % typed by hand; "In recognition of your contributions" for any rating | HR practice | Low | The site's salary revision letter |
| Confirmation, internship certificate | No site equivalent | HR practice | Low | Not carried over (gaps listed) |
| Template preview | Raw `{{var}}` text in a mono badge | UX | Low | The real letter, with empty details highlighted |

## Data

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Upload area | Clickable `div`, hidden input: no keyboard path | Accessibility | High | "Choose a file" button and drop zone |
| CSV only; `.endsWith('.csv')` on drop | No Excel; "LIST.CSV" rejected | UX | Med | CSV and .xlsx, several sheets, title rows, Excel dates (lazy parsers) |
| Parser | Splits on `\n`, so an address with a line break breaks the row | Accuracy | Med | papaparse; line breaks inside a cell are kept in the letter |
| Header matching | Lower-cased header must equal the variable name; no manual fix | UX | High | Auto-match by label, id and usual headings; change any; "same for every letter" values |
| Missing columns | Badge "Missing: …" then "[ctc]" printed in letters | Accuracy | High | Required details flagged before output; rows that need fixing are held back unless included |
| Values | Dates and money printed as typed | Accuracy | Med | 2 November 2026 and ₹12,00,000, as on the letter pages; impossible dates such as 31/02 caught |
| Sample CSV | One row of realistic names | HR practice | Low | Five obviously invented people, two with deliberate mistakes |

## Output

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "Download All (.txt)" | One file per letter in a loop; browsers block the rest; formatting lost | UX | High | One Word file, one letter per page (`docx-export` extended to take several sections) |
| "Print" | Current letter only | UX | Med | "Print all" with a page break after each letter |
| Copy | Plain text; toast not announced | Accessibility | Low | Copies formatted and plain text; status read out |
| "‹" "›" buttons | No accessible names | Accessibility | Med | Labelled previous and next buttons plus a row picker |
| Limits | None stated | UX | Low | Up to 1,000 rows, stated on the page and in the FAQ |

## Footer and guidance

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| No guidance | Nothing on preparing the file or checking letters | UX | Med | "How it works" with a Flow diagram, preparation steps, a table of checks, privacy callout with DPDP context, FAQ on privacy, formats and limits |
| One-line privacy note | Under third-party scripts | Legal | Med | What happens to the list, stated plainly; nothing stored |

## Letter types the old page had and the library lacks

Warning letter (better as a show-cause notice followed by a decision letter), probation confirmation letter, internship certificate, and an appraisal outcome letter with the rating (the salary revision letter covers pay only). No toolkit content was created for these.
