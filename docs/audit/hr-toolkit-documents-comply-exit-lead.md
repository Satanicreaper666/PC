# Audit: HR Toolkit, documents for pay and compliance, exits and leadership

Original page: `hr-toolkit.html` (written around March–April 2026). Scope: tools 18, 19, 28–34, 36 and 39–42. Checked against the law in force on 2 November 2026.

## Summary

- **The final settlement deadline was wrong in three places.** The termination letter, offboarding checklist and audit checklist say F&F "within 30 days". Since 21 November 2025, Code on Wages s.17(2) requires wages within two working days. The rebuild uses the two-day rule, notes that the trigger date hasn't been officially clarified, and keeps 30 days for gratuity.
- **Several compliance claims were outdated or overstated.**
  - The breach template says breaches are "Reported to [Data Protection Board] ... as required under DPDP Act 2023", but those duties apply only from May 2027. CERT-In's six-hour rule, which applies now, was missing.
  - The POSH report "by 31 January" is presented as statutory.
  - The calendar lists "Advance tax (Q3) by 15 Jan".
  - Forms 130, 138 and 124, the ₹25,000 EPF ceiling and the bonus deadline are missing.
- **Some wording was unfair to employees.**
  - The experience and relieving letters are given "upon return of company assets".
  - The POSH declaration warns complainants about "false or malicious" complaints.
  - The leave policy blocks leave during notice and earned leave during probation.
  - Stay interviews are for "top performers" only, with notes hidden from the employee.
- **The leave policy fell below some state minimums.** Sick leave was 8 days against Karnataka's 12, and carry-forward was 30 days against 45 in Karnataka and Maharashtra. There was no OSH Code basis.
- **The tools were static and partly inaccessible.** Templates could only be printed or copied. PC-F-04 had 47 controls and no `<label>`. A shortcut bug toggled the theme when someone typed "d" in a textarea. The maturity score treated unanswered items as 3 and quoted unsourced benchmarks.

  Kept: PC-F-04's sections, the five culture questions, the 30-60-90 phases, and the layoff message's "told individually today".

## Page-level elements these tools depend on

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Header CTA "₹1,999/year — Executive Access →" | Sales language | Copy | Med | Removed (layout) |
| Intro counts ("31 Tools", "16 Calculators", "42+ ready-to-deploy") | Contradict each other | Accuracy | Low | No counts |
| "Fills all 8+ forms automatically" | Fills only `[Company Name]`; nothing else can be filled or saved | UX | Low | Labelled fields per document, browser draft, Word, PDF and copy |
| Tool cards opened by `div onclick` | Can't be opened with the keyboard | Accessibility | High | Each tool is its own page |
| PC-F-04: `<span class="form-label">` + `<input>` | 47 controls, 0 labels | Accessibility | High | Visible, associated labels |
| Shortcut handler skips only INPUT and SELECT | "d" or "m" typed in a textarea toggles theme or sidebar | UX | Med | Not carried over |
| `printForm()` popup with `document.write` | Blocked by popup blockers; no Word file | UX | Low | Print stylesheet and Word download |
| Emoji headings (💰 🛡 🚨) and one page-wide meta description | Noise; individual tools can't be found in search | Copy, SEO | Low | Removed; per-page meta, FAQ and JSON-LD |

## 18. Salary revision letter

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Example letter (Neha Gupta, 15%) | Static; the ASCII "————" table breaks when pasted | UX | Med | Fillable; before-and-after table; empty rows hide |
| Component table | Arithmetic is right (₹24,00,000 to ₹27,60,000), but there is no warning about the 50% wage rule | Legal | Med | Tip on the 50% rule; breakup as an annexure |
| Specific reason line | Good | — | — | Kept as guidance |

## 19. Leave policy template

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| SL 8 days; carry-forward 30 | Below Karnataka (12 days, 45) and Maharashtra (45) | Legal | High | Defaults EL 18, CL 8, SL 12, carry-forward 45; editable; more-generous-law clause |
| "As per Maternity Benefit Act"; "12 weeks (third child onwards)" | Now SS Code Chapter VI; the rule is two or more *surviving* children; adoption, miscarriage, nursing breaks and 80-day eligibility missing | Accuracy | Med | Full section, including the 2026 adoption ruling |
| "Apply at least 8 weeks before expected delivery" | Reads as a legal condition; it isn't | Legal | Med | "Tell HR as early as you are comfortable" |
| No leave in probation or notice; "Unapproved absence = Loss of Pay" | Restrictive; no chance to explain | HR practice | Med | Leave usable as it accrues; sick leave during notice; LWP only after contact |
| No OSH Code, state or encashment rules | — | Legal | High | Legal-minimums clause; encashment; refused EL carried forward |

## 28. HR compliance audit checklist

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "F&F settlement process documented (≤30 days)" | Wrong (two working days) | Legal | High | Corrected |
| "ESI registration (if applicable: wages ≤₹21,000)" | Mixes the 10-employee threshold with the wage limit | Accuracy | Med | Stated separately |
| "Form 16 ... by 15 June"; "TDS ... by 7th" | Form 130 from 2026-27; 30 April for March missing | Accuracy | Med | Rules 218/219; Forms 124/130/138 |
| "Consent forms ... signed" for DPDP | Duties start May 2027; employment is mostly a "legitimate use" | Legal | Med | Readiness items; CERT-In six hours now |
| Three duplicates; key Labour Code items missing | Inflated count | Accuracy | Med | Still 50 points in 10 groups, adding appointment letters, wages by the 7th, the 50% rule, overtime, bonus, fixed-term parity, PF ceiling, Grievance Redressal Committee, accident reporting and health check-ups |
| "Annual POSH report ... by 31 January" | The Act says "each calendar year" | Accuracy | Low | Calendar-year duty; 31 January noted as a common date |

## 29–30. POSH complaint form and IC constitution checklist

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Declaration: "a false or malicious complaint may result in action against me" | Can deter genuine complaints | HR practice | High | Neutral declaration (complaint shared with the respondent, kept confidential) |
| No time limit, interim relief or conciliation choice | — | Legal | Med | Three months (plus three); interim relief; optional conciliation; 90/10/60/90-day FAQ |
| Static form | Can't be filled privately | UX | Med | Fillable; tip to clear the draft on shared computers |
| "External member ... legal background" | Not the statutory test | Accuracy | Med | NGO or association committed to women, or a person familiar with sexual harassment issues |
| 10-item checklist | Missing: an IC per office or unit with 10+ employees, Local Committee, quorum of three, display of the order, annual report | Legal | Med | 25 items in five stages |

## 31. Annual HR calendar

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "Advance tax (Q3) by 15 Jan" | Wrong date (15 December) and not an HR duty | Accuracy | High | Removed |
| April row: "TDS Q4 return by 31 May" | Wrong month | Accuracy | Med | In May |
| "PF/ESI monthly" fillers | Monthly rhythm unclear | UX | Med | `<Cycle>`: wages and TDS by the 7th, PF and ESI by the 15th |
| Missing: bonus by 30 November, Forms 130/138/124, EPF ₹25,000 (17 Sep 2026), ESI periods, leave-year close | — | Accuracy | High | Month table, `<Timeline>` of fixed dates, state dates flagged |

## 32–33. Exit interview form (PC-F-04) and questionnaire

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "Overall job satisfaction" and "Overall experience" | Duplicate ratings | UX | Low | 13 ratings with "prefer not to say" |
| "strict confidentiality"; "Recommend as great workplace?" | Over-promise; leading question | Copy | Low | Says who sees it; neutral wording; rehire reason limited to facts |
| Questionnaire: name required; "(1-5) ___" with no anchors | No anonymity; unclear scale | HR practice | Med | Optional anonymity; labelled scale; prompts visible in blank Word and PDF |
| Form or survey? | — | UX | — | Kept as a **form**, so reasons and comments stay in one returnable document (explained in its tips) |

## 34. Termination letter

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "F&F timeline: Within 30 days" | Wrong | Legal | High | Two working days; gratuity in 30 days |
| "Experience/relieving letter ... upon return of company assets" | Documents used as leverage | HR practice | High | Issued on or soon after the last working day; property handled separately |
| "non-solicitation clauses remain in effect for 12 months" | Post-employment restraints are largely void (Contract Act s.27) | Legal | Med | Confidentiality reminder only |
| No appeal route; no worker retrenchment rules; acknowledgement could imply agreement | — | Legal | Med | Optional appeal; IR Code s.70, standing orders and state notice in tips and FAQ; "receipt only" |

## 36. Employee offboarding checklist

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "F&F paid within 30 days of LWD" | Wrong | Legal | High | Two working days |
| "Company data wiped from personal devices" | Privacy risk | Legal | Med | With the employee present, without opening personal data |
| 16 items | Missing: notice changes in writing, gratuity, TDS, EPFO exit date, Form 130 | HR practice | Med | 28 items in five stages |

## 39. HR maturity self-assessment

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| `calcHRMaturity()`: `var val=3` for unanswered | Skews results towards "Operational" | Accuracy | High | Every item must be answered |
| "Indian mid-market median: 2.6–3.0 ... Top-quartile ... 3.8+" | Unsourced benchmark | Accuracy | High | Removed; "not a benchmark" note |
| "Transformative ... world-class"; colour-only bars | Hype; accessibility | Copy, accessibility | Med | Reactive to Integrated with concrete advice; band edges match the displayed score; text values |
| 24 statements in 6 dimensions | Good | — | — | Kept; wording made checkable |

## 40–42. HRBP 90 days, stay interviews, crisis templates

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "Skip-level conversations with 20% of employees"; "STRATEGIZE" | Arbitrary figure; all caps | HR practice, copy | Low | Every team and level; 30-60-90 `<Timeline>`; plan outline |
| Stay interviews "For Top Performers, Quarterly"; "No notes visible to employee" | Exclusive; too frequent; not transparent | HR practice | Med | Critical roles first, then everyone yearly; say what is noted; two-week follow-up `<Flow>` |
| Breach: "as required under DPDP Act 2023" | Duty starts May 2027; CERT-In six hours missing | Legal | High | Corrected; legal-notices table |
| Three templates; no layoff law | Missing incident and leader-exit messages; no IR Code notice or compensation | Legal | Med | Five copyable messages, one-to-one script, response `<Flow>`; IR Code s.70/83, OSH s.10/11, CERT-In and DPDP notices |
