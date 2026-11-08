# PeopleCraft toolkit: a CHRO's audit of all 56 tools

8 November 2026. Branch `claude/peoplecraft-site-fixes`.

**Scope.** Every item in `src/content/toolkit/`:

| Type | Count |
| --- | --- |
| Calculators | 18 |
| Apps (people analytics, org chart, mail merge) | 3 |
| Letters | 12 |
| Forms | 9 |
| Checklists | 5 |
| Surveys | 4 |
| Plans | 4 |
| Policy | 1 |

**Method.**
- Each of the 21 calculators and apps was run in a browser with realistic inputs.
- Their logic was read in `src/lib/calc/`, `src/lib/analytics/`, `src/lib/orgchart/` and `src/lib/mailmerge/`.
- Every letter, form, checklist, survey, plan and policy was read in full.
- Each tool was judged on one question: "Would I, as CHRO of a 300–3,000 person Indian company, use this to run a real decision, and defend it to the CFO, the board, an inspector or a court?"

**The second ask** was "make everything more comprehensive and functional for the real world". It is answered in three places:
- section 3, the platform upgrades;
- section 4, the edge cases each calculator must handle;
- the "real-world upgrade" column of the scorecard in section 5.

---

## 1. The verdict

**The toolkit is the best free, India-specific HR toolkit I have seen for getting one thing right for one person.** The statutory calculators are correct and current, show their working and state their limits. They cover:
- the PF ceiling change of 17 September 2026;
- the two-working-day final wage deadline;
- fixed-term gratuity;
- the Income-tax Act, 2025 form numbers.

The letters are fair, plain and lawful. Three examples:
- The appointment letter follows the OSH Rules format.
- The joining form collects only what payroll needs.
- The medical declaration is duty-based and filed separately.

Privacy is handled better than in most paid HRMS products. Nothing is uploaded, and storage on the device is opt-in where it matters.

**A CHRO's job happens at a different level.** It is about all 800 people at once, the decision that follows the number, and the paper trail behind it. Measured that way, the toolkit has three structural gaps.

1. **It works one person at a time.**
   - The increment allocator costs everyone at the average salary.
   - The nine-box is filled in one name at a time.
   - The salary band designer can't take a roster.
   - Gratuity can't produce the company-wide liability the CFO asks for every March.

   Only people analytics, org chart and mail merge accept a file.
2. **The tools don't talk to each other.**
   - The notice-period calculator doesn't pass a recovery amount to full and final (F&F).
   - F&F doesn't produce the settlement statement the employee must see.
   - The increment matrix doesn't flow into salary revision letters.
   - Exit interviews don't feed the attrition numbers.

   Each tool is excellent and each is an island.
3. **The decision layer is thin.** The tools answer "what is the number?" well. They rarely answer "what should I do, what will it cost, and how do I defend it?"
   - Pay equity gives a gap but no cost to close it.
   - Nine-box gives a box but no calibration.
   - The compliance checklist gives ticks but no owner, evidence or due date.

**None of these needs a server, a login or an HRMS.** The building blocks already exist in the codebase:
- the column-detecting file loader in `components/analytics/load.ts`, with papaparse and read-excel-file;
- Word export through `docx`;
- PowerPoint export through `pptxgenjs`;
- scenarios and CSV in `calc-kit.ts`;
- mail merge.

The work is to connect them.

**Overall scores:**
- statutory calculators: **4.5 / 5**;
- letters and forms: **4.2 / 5**;
- planning and talent tools: **3.2 / 5**;
- surveys as a team instrument: **3 / 5**.

---

## 2. The ten changes that matter most

Ranked by value to a real HR team, with effort as S (a day or two), M (one to two weeks) and L (a month or more).

| # | Change | Why a CHRO cares | Effort |
| --- | --- | --- | --- |
| 1 | **"Load your people once"**: one shared roster loader, used by increment, pay equity, nine-box, salary bands, gratuity liability, F&F (bulk) and org chart. It stays on the device. | Turns six demonstration tools into the tools HR actually runs the annual cycle on. | L |
| 2 | **Income tax (TDS) estimate, old vs new regime**, inside take-home and F&F | "What will I actually get?" is the question every employee and candidate asks. Both calculators stop before tax today. | M |
| 3 | **CTC structure builder** that checks the 50% wage rule and PF, ESI and gratuity, and writes the offer letter's salary annexure | The most common real task after the Labour Codes, and the most common source of errors | M |
| 4 | **F&F settlement statement** as a Word or print document from the calculator, with the due dates it already works out | The law expects a written statement before payment. HR re-types it today. | S–M |
| 5 | **Increment cycle end to end**: per-person matrix from the roster, then proration, promotion budget and a check against the budget, then salary revision letters through mail merge | This is the most stressful month in HR. The current allocator is a planning sketch. | L |
| 6 | **Disciplinary case kit**: charge-sheet, suspension order, inquiry notice, inquiry report, penalty order, a proportionality guide and a case timeline | The set stops at show-cause and warning. Most wrongful-dismissal losses happen in the steps that are missing. | M |
| 7 | **Survey results from a real survey**: import a CSV from Google Forms or Microsoft Forms, with favourability %, segment cuts (n ≥ 5), trend and eNPS | Today a team result means passing one device around, or typing rounded averages. Neither works for a 200-person company. | M |
| 8 | **Talent review kit**: bulk nine-box from the roster, calibration view, distribution guide, succession and a critical-role register | Nine-box is the weakest tool (2/5). Talent reviews are where CHROs earn board trust. | M–L |
| 9 | **Compliance tracker** with owner, evidence, frequency, due date and risk for each item. Add the missing items: contract labour, standing orders, crèche, apprentices. Export to .ics. | Ticks don't survive an inspection. Owners and evidence do. | M |
| 10 | **Policy library**: POSH policy, code of conduct, hybrid work, grievance, whistleblower, the DPDP employee privacy notice, travel and expense, IT acceptable use | There is one policy, leave. Policies are what founders and new HR heads search for first. | L |

---

## 3. Making it work in a real company: five platform upgrades

These apply across the toolkit. Each one makes many tools "real-world" at once.

### 3.1 Load your people once (shared roster, on the device only)

- **Reuse the loader.** Promote the people-analytics loader (`components/analytics/load.ts` + `lib/analytics/fields.ts`) to a shared "My roster" that any tool can read. People drop one CSV or Excel export once. Every roster-aware tool then shows a **Use my roster** button.
- **Add columns** to the field map:
  - rating;
  - potential;
  - last increment date and %;
  - promotion date;
  - exit type (voluntary or involuntary);
  - exit reason;
  - regretted (yes or no);
  - CTC components (basic, HRA, allowances);
  - state of work;
  - PF and ESI applicability.
- **Recognise HRMS headers.** Add header aliases from common Indian HRMS exports (greytHR, Keka, Zoho People, Darwinbox, HROne). Collect one real export from each to test the detector; don't guess their headers.
- **Templates.** Ship a downloadable blank CSV template per tool, with one example row.
- **Storage.** Keep the current privacy stance. Data is held in memory by default. Keeping it in the browser is an explicit, unticked-by-default choice, as pay equity already does. A **Forget my roster** button sits next to every tool that uses it.

### 3.2 Decisions in bulk, documents out

Every tool that decides something about a person should end in a document:

| From | To |
| --- | --- |
| Increment matrix | Salary revision letters |
| Probation reviews | Confirmation or extension letters |
| F&F | Settlement statement, relieving letter and experience letter |
| Nine-box | Individual development conversation notes |

Mail merge already renders every letter from rows. Each of these tools needs a **Send to mail merge** button that hands over its result rows with fields mapped.

### 3.3 Save, compare, hand over

Calculators already keep inputs in the URL, compare scenarios side by side and export CSV. Three additions make them usable in a team:
- **Named saved scenarios** on the device, for example "FY27 increment, Option B: 8.5%".
- **Workbook export and import**: a JSON file of the tool's inputs that can be emailed to a colleague or the CFO and opened in the same tool.
- **Results tables exported as CSV**, not only the inputs. Excel opens CSV directly.

### 3.4 Output you can defend

Add a print and Word header to every calculator result and analytics report. It should carry:
- company name;
- prepared by;
- date;
- a reference number;
- the "facts checked" dates of every statutory value used (already in `statutory.ts`);
- the assumptions list (already written on each page);
- a Prepared / Reviewed / Approved block.

An auditor, inspector or tribunal asks for exactly this. It also turns a free web tool into a working paper HR can file.

### 3.5 Edge cases and state rules

Covered tool by tool in section 4. As a principle:
- every simplification already stated in a file header ("Not modelled: …") should be visible on the page;
- each one should link to the handbook section that explains the manual route;
- the most common ones should be modelled (see section 4).

---

## 4. Edge cases each calculator must handle before real payroll use

Each calculator's source states what it leaves out ("Not modelled …"). The items below are what HR meets most often in practice, in priority order.

**Gratuity**

`gratuity.ts` excludes forfeiture, tax, seasonal and piece-rated work, and 4 years 240 days.
- Add **forfeiture** (wholly or partly, for proven misconduct causing loss, or for violent or riotous conduct), with a warning that it needs a termination order on record.
- Add the **tax-exempt amount** (lifetime cap) and the taxable remainder.
- Add **piece-rated wages** (average of the last three months).
- Add **seasonal establishments**.
- For **4 years 240 days**, don't model it. Show a callout that courts have differed and link to the handbook.
- New mode: **liability for all employees** from the roster, for the year-end provision, with a clear "undiscounted; your actuary's Ind AS 19 figure will differ" note.

**Full and final settlement**
- **TDS** on the settlement (see change 2).
- **Statutory bonus pro-rata** for the year of exit. Today this has to be typed into "Other dues".
- **Notice shortfall recovery**, worked out from the notice-period calculator instead of typed.
- **Variable pay and incentive pro-rata**, **arrears**, **reimbursements pending**.
- **Loss of pay (LOP)** days in the last month.
- **ESOP and joining-bonus clawback** as their own lines, so each is visible.
- **Output**: the settlement statement (change 4), and a no-dues sheet for IT, admin and finance sign-off.

**Take-home salary**
- **TDS estimate** under both regimes.
- **Reverse mode**: "the candidate wants ₹X in hand; what CTC does that need?"
- **Employer NPS** contribution.
- **Insurance premium inside CTC.**
- **Variable pay shown separately**, so it isn't counted as monthly pay.
- **Metro / non-metro** for the HRA exemption under the old regime.

**Notice period**
- **Buy-out ₹ amount** from salary and days bought out. Excluded today, per the file header.
- **Leave set-off**, where the policy allows it.
- **Garden leave.**
- Pass the shortfall to F&F.

**Leave encashment**
- **Tax-exempt amount on exit** (non-government cap) and the taxable remainder. Encashment while in service is fully taxable.
- Show the **OSH Code "worker" two-working-day deadline** next to the amount.

**Working days**
- **State holiday lists** (start with Karnataka, Maharashtra, Tamil Nadu, Telangana, Delhi and Haryana).
- **Payable days for payroll**, net of LOP.
- An **.ics export** of the holidays.

**EPF, ESI and professional tax**

These are already thorough: EPS for new joiners, EDLI, admin charges, ESI contribution periods and daily-wage exemption, PT February and women's slabs. Two additions:
- a **bulk mode** that takes the roster and returns the month's employer and employee totals by state, which is what payroll reconciles against the challan;
- **voluntary PF (VPF)** and **international workers** as visible exclusions.

**Attrition cost, cost per hire, HR metrics, HR budget, headcount plan**
- Break results down **by department, level and source**.
- Compute HR metrics **from the roster** instead of typed counts, so the numbers match people analytics.
- Add **budget vs actual by quarter** to the HR budget.
- Add a **recruiter-capacity check** to the headcount plan: hires needed per month against requisitions each recruiter can handle.

---

## 5. Scorecard: all 56 tools

Score = value to a CHRO today, out of 5.
- **Keep**: ready; small additions only.
- **Improve**: useful, with a material gap.
- **Rebuild**: needs a different model to be used for real decisions.

### 5.1 Statutory pay calculators (9)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Gratuity | 5 | Keep | Fixed-term rules; death and disablement; near-miss warning; working shown | No company-wide liability, forfeiture or tax split | Roster liability mode for the CFO; tax-exempt split; forfeiture option |
| Full and final settlement | 4 | Improve | Due dates per payment computed; recoveries itemised | No TDS, no bonus pro-rata, no statement document | Settlement statement (Word/print); bonus and LOP lines; TDS estimate; pull the notice shortfall in |
| Take-home salary | 4 | Improve | 50% wage test built in; state PT; clear working | Stops before income tax | TDS by regime; reverse mode (in-hand → CTC); feeds a CTC structure builder |
| EPF | 5 | Keep | Both ceilings across 17 Sep 2026; EPS eligibility; EDLI and admin charges | One employee at a time | Bulk month totals for challan reconciliation |
| ESI | 4 | Keep | Contribution periods; low-wage exemption | Coverage changes mid-period need care | Bulk mode; flag employees crossing the ceiling at the next period |
| Professional tax | 5 | Keep | State slabs incl. February and women's slabs; next-year schedule | One state, one person | Multi-state roster totals by state |
| Leave encashment | 4 | Keep | ÷26 / ÷30 choice; exit vs in-service | Tax not worked out | Exempt and taxable split on exit; due-date line |
| Notice period | 4 | Improve | Buy-out and waiver days; date rules | No ₹ amount for the buy-out | Buy-out and shortfall amounts → F&F |
| Working days | 4 | Keep | Common weekly-off patterns; national holidays | No state holiday lists | State lists; payable days net of LOP; .ics |

### 5.2 Planning and cost calculators (5)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Attrition cost | 4 | Keep | Honest components (vacancy, hiring, ramp-up) | One role at a time | Regretted vs non-regretted; by department from the roster; "value of cutting attrition by 1 point" for the business case |
| Cost per hire | 4 | Keep | Internal and external costs, incl. interviewer time | One blended number | Split by source (agency, referral, job board) and by level |
| HR metrics | 4 | Improve | Covers regretted and early attrition, time to fill, offer acceptance, quality of hire, eNPS | Typed counts can contradict people analytics | Compute from the roster; show the formula and a sourced benchmark range per metric |
| HR budget | 3 | Improve | Good line items; contingency | Per-head heuristics; no actuals | Quarter phasing; budget vs actual; export for finance |
| Headcount plan | 4 | Keep | Monthly hiring with attrition and notice lag; cost | Company-level only | By department; recruiter-capacity check; vacancy cost |

### 5.3 Talent and reward tools (4)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Increment budget allocator | 3 | Rebuild | Clear merit matrix (rating × compa-ratio), with a fit factor | Everyone costed at the average salary; same band split for every rating | Per-person matrix from the roster; proration for joiners; separate promotion budget; manager-level budgets; output to salary revision letters |
| Salary band designer | 3 | Rebuild | Sound midpoint progression and spread maths | Formula only; can't place real people | Load the roster; red- and green-circle lists with cost to bring them in; compa-ratio by grade; market data column (user-supplied, sourced) |
| Nine-box talent mapper | 2 | Rebuild | Good box names and suggested actions | Manual entry; no calibration, distribution or follow-through | Bulk from the roster; calibration view by manager; distribution guide; movement since last review; succession nominations; bias prompts (gender and tenure mix per box) |
| Pay equity analyser | 3 | Improve | Mean, median and like-for-like by role; n ≥ 5 per role; opt-in storage | No adjusted gap and no cost to close | Adjust for grade, tenure, location and rating; cost-to-close list; read the roster instead of pasting |

### 5.4 Apps (3)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| People analytics | 4 | Improve | Column detection; CSV and Excel; period presets; span of control; pay by group; exports | No exit type or reason, rating, regretted flag or promotions; pay groups shown from 3 people (surveys and pay equity use 5) | Add those columns and metrics (regretted, early and high-performer attrition, attrition by manager, women by level, promotion rate); raise pay groups to 5; one-page board report (PPT export exists) |
| Org chart builder | 3 | Improve | Builds from a file; manager matching | Shows reporting lines only | Vacancies and planned roles; layers and span flags; cost per manager; what-if moves; print to A3 |
| Mail merge | 4 | Keep | Every letter and form; CSV in; per-row output | Fed only by hand-made CSVs | Becomes the "documents out" stage for increment, confirmation, F&F and offers (section 3.2) |

### 5.5 Letters (12)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Offer letter | 5 | Keep | Clear, conditional, fair | Missing common clauses | Joining-bonus clawback; conflict of interest and moonlighting; IP assignment. Do not add a post-employment non-compete (Contract Act s.27). |
| Appointment letter | 5 | Keep | Follows the OSH (Central) Rules, 2026 format | CTC annexure typed by hand | Annexure generated by the CTC structure builder |
| Show-cause notice | 4 | Improve | Natural justice built in | The process stops here | Charge-sheet, inquiry notice, inquiry report and penalty order templates (change 6) |
| Warning letter | 4 | Keep | Proportionate, specific | No link to a case record | Case timeline and penalty guide |
| Salary revision letter | 4 | Keep | Clean | Typed per person | Generated in bulk from the increment cycle |
| Probation confirmation | 4 | Improve | Clear | No extension variant | Extension letter with reasons, goals and a review date |
| Relieving letter | 5 | Keep | Issued without waiting for disputes | None | Part of an "exit pack" with F&F |
| Experience letter | 5 | Keep | Factual | None | Part of the exit pack |
| Resignation letter | 4 | Keep | Employee-friendly | None | Shows the computed last working day from the notice calculator |
| Internship certificate | 4 | Keep | Factual | None | Bulk issue for a cohort via mail merge |
| Leave application | 3 | Keep | Useful for employees and search traffic | Low value to HR | Link to the leave policy and the working-days calculator |
| Termination letter | 4 | Improve | Reviewed in the first audit; fair-process wording | No retrenchment variant | Retrenchment letter for 'workers': notice or pay in lieu, compensation at 15 days per year, re-skilling fund, last-in-first-out note (IR Code s.71) and re-employment preference (s.72) |

### 5.6 Forms (9)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Employee joining form | 5 | Keep | Collects only what payroll needs, says why, Aadhaar optional | Background-check consent sits elsewhere | Separate background verification consent and authorisation form (DPDP-ready) |
| Pre-employment medical declaration | 5 | Keep | Duty-based, consent, filed separately | None | None needed |
| Reference check report | 4 | Keep | Consent logged; facts vs opinions | One referee per form | Question bank by relationship; summary across referees |
| Interview evaluation form | 4 | Improve | Evidence-based, independent scoring, pay kept out | No panel roll-up | Panel debrief sheet that combines each interviewer's scores; behavioural anchors per competency |
| Annual performance appraisal | 3 | Improve | Self vs manager; employee comments; fair sign-off wording | Goal weights are free text; no weighted score or calibration step | Weighted score worked out; calibration note; mid-year check-in version; feeds nine-box and the increment cycle |
| Performance improvement plan | 4 | Improve | Specific goals and support | No review or closure documents | Mid-point review and outcome letters (closed successfully, extended, or ended) |
| Exit interview form | 4 | Improve | Neutral interviewer; 13 ratings; actions with owners | No regretted flag, destination or pay jump; nothing to analyse in bulk | Add "regretted", "preventable", "new employer type" and "pay increase"; a CSV row per interview for exit analytics |
| Exit interview questionnaire | 4 | Improve | Optional anonymity; good questions | Results stay on paper | The same CSV row; a simple exit-themes report |
| POSH complaint form | 4 | Improve | Plain language; time limits; interim relief; conciliation choice | Draft auto-saves in the browser, which is risky on shared devices for this form | Make saving opt-in and unticked, as pay equity does; IC-side kit (case register, notice to respondent, inquiry report, annual report) |

### 5.7 Checklists (5)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Document checklist | 5 | Keep | Collect once, keep copies, health records apart | No retention periods | Retention period per document (feeds the DPDP retention item) |
| Onboarding checklist | 4 | Improve | Owners in brackets; day 30, 60 and 90 | Starts at day 1 in practice | Pre-boarding from acceptance to day 1, to cut offer drop-outs (weekly contact, a manager call, a welcome pack); variants for remote joiners and senior hires |
| Offboarding checklist | 4 | Keep | Two-working-day deadline; Form 130 | A few gaps | Health insurance continuation or portability notice; knowledge transfer for critical roles; alumni and rehire list |
| HR compliance audit | 3 | Improve | Current law; clear items | Missing contract labour (OSH Code, 50+ contract workers), standing orders (IR Code, 300+ workers), crèche (Code on Social Security, 50+ employees) and apprentices; no owner, evidence or due date | Add those items; owner / evidence / frequency / risk columns; state filter; CSV and .ics export (change 9) |
| POSH IC constitution | 5 | Keep | Complete and correct | Stops once the IC exists | Case register; annual report template; mention the government's SHe-Box portal as a complaint route |

### 5.8 Surveys (4)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Engagement pulse | 3 | Improve | Mostly original items; reverse items; sensible bands; anonymity warnings. One item is close to a Gallup Q12 item (fix 10). | The page says to enter team averages **rounded to whole numbers**, which can move a score by up to 0.5 per item and change the band. The one-device team mode doesn't work for a real company. | Fix the wording now; then CSV import from Google Forms or Microsoft Forms, favourability %, segment cuts (n ≥ 5), quarter-on-quarter trend, eNPS from the 0–10 item |
| Manager effectiveness | 3 | Improve | Good behaviour items; development-only use | Same rounding wording; no self vs team view | CSV import; self vs team gap report per manager; a coaching guide per low area |
| HR competency self-assessment | 4 | Keep | Eight-area model; 90-day plan | Self-rating only | Optional manager rating and gap; link each low area to Learn modules |
| HR maturity self-assessment | 4 | Keep | Six balanced areas; clear stages | One respondent's view | Compare HR's and leadership's answers; a next-step roadmap per area |

### 5.9 Plans and policy (5)

| Tool | Score | Verdict | What's strong | Top gap | Real-world upgrade |
| --- | --- | --- | --- | --- | --- |
| Annual HR calendar 2026-27 | 4 | Improve | Correct new form numbers and dates | Fixed to one year; can't go into a calendar | .ics download (by item and state); plan the 2027-28 edition before April 2027, ideally built from data |
| Crisis communication templates | 4 | Improve | Sequence, legal notices, humane wording | Layoff selection and compensation left to the reader | Selection-criteria sheet (incl. last-in-first-out for workers, IR Code s.71); retrenchment compensation calculator; manager talking points; message to remaining staff |
| HRBP first 90 days | 4 | Keep | Practical, sequenced | None | A one-page people-plan template to fill in at day 90 |
| Stay interview guide | 4 | Improve | Good questions and follow-through | No record or roll-up | A short record form; flight-risk flag that feeds the talent review |
| Leave policy | 4 | Improve | Thorough and current, incl. adoption, surrogacy and miscarriage | Silent on Karnataka's menstrual leave, though Karnataka is its main example | Optional menstrual leave clause with a Karnataka note (see section 6); voting-day leave; optional caregiver leave and sabbatical |

---

## 6. Quick fixes found during the audit

These are small changes that can ship this week.

1. **Survey wording** (`engagement-pulse-survey.mdx` line 47, and the "Score the team's answers" step in `manager-effectiveness-survey.mdx`). Both tell users to enter team averages "rounded to the nearest whole number". That changes area scores and bands. Instead, point teams to "Add another person's answers", and later to CSV import.
2. **POSH complaint draft storage.** Make saving opt-in and unticked by default, using the pattern already in pay equity. A complaint draft left on a shared office computer is a real harm.
3. **Anonymity threshold.** Surveys and pay equity use 5. People analytics shows pay by group from 3 (`MIN_PAY_GROUP` in `lib/analytics/metrics.ts`). With 3 people, individual pay can be worked out. Use 5 everywhere.
4. **Compliance audit checklist.** Add four items:
   - contract labour (OSH Code, establishments with 50 or more contract workers: principal employer registration and a contractor licence);
   - standing orders (IR Code, 300 or more workers);
   - a crèche (Code on Social Security, 50 or more employees);
   - apprentices.

   Mention SHe-Box in the POSH section.
5. **Leave policy and menstrual leave.** Karnataka's Menstrual Leave Policy, 2025 gives women one paid day a month (12 a year), including in private establishments. In April 2026 the High Court's Dharwad Bench directed strict implementation. Employer petitions against it were reported as pending, and no final ruling had been found as of July 2026. The policy template uses Karnataka as its main example but doesn't mention this. Add an optional clause and a dated note, and put it in `statutory.ts` with sources so it is checked like every other fact.
   - Sources: [LiveLaw, April 2026](https://www.livelaw.in/high-court/karnataka-high-court/karnataka-high-court-directs-menstrual-leave-strict-implementation-530402); [Bar & Bench](https://www.barandbench.com/news/no-stay-for-now-by-karnataka-hc-on-menstrual-leave-policy-after-state-defends-it-as-progressive-move); [Mondaq](https://www.mondaq.com/india/employee-rights-labour-relations/1788282/menstrual-leave-in-karnataka-what-the-karnataka-high-court-judgment-means-for-employers).
6. **Exit interview form.** Add four fields: regretted (yes/no), preventable (yes/no), type of new employer and pay increase. HR metrics already asks for "leavers you wanted to keep"; this is where that number should come from.
7. **Crisis templates.** Add last-in-first-out (IR Code s.71) and re-employment preference (s.72) to the layoff row of "Legal notices to check".
8. **Notice period.** Show the buy-out amount once a monthly salary is entered.
9. **Stage label.** The POSH complaint form, the POSH IC checklist and the compliance checklist sit under "Pay and comply", whose short label is "Pay". Consider "Comply" as the short label, or a separate stage, so people find POSH tools where they expect them.

10. **Survey item wording.** In the engagement pulse, "I know what is expected of me in my role" is almost word for word the first item of Gallup's copyrighted Q12. "I have the resources I need to do my work well" is a close paraphrase of the second. Reword both in your own construct language, for example "My priorities for this quarter are clear to me" and "I have the tools and information to do my job without workarounds".

---

## 7. What a complete toolkit would add

Grouped by the lifecycle the site already uses. Priority: ★★★ build next, ★★ this year, ★ later.

**Recruit**
- ★★ Panel debrief and hiring decision sheet (combines interview scorecards)
- ★★ Structured interview question bank by competency, with behavioural anchors
- ★★ Background verification consent and authorisation form
- ★ Job requisition and approval form (headcount plan → requisition → JD)

**Onboard**
- ★★ Pre-boarding plan (acceptance to day 1)
- ★ Induction attendance and policy acknowledgement register

**Perform and grow**
- ★★★ Increment cycle (change 5)
- ★★★ Talent review kit (change 8)
- ★★ Promotion letter
- ★★ Transfer letter
- ★★ PIP review and outcome letters
- ★★ Probation extension letter
- ★ Training needs analysis and L&D plan
- ★ Individual development plan

**Pay and comply**
- ★★★ CTC structure builder (change 3)
- ★★★ TDS estimator (change 2)
- ★★★ Compliance tracker (change 9)
- ★★ Statutory bonus calculator
- ★★ Payroll input checklist (monthly close)
- ★★ Contractor compliance checklist (principal employer duties)
- ★ Overtime calculator (twice the ordinary rate, with consent)

**Employee relations**
- ★★★ Disciplinary case kit (change 6)
- ★★ Grievance form and register (Grievance Redressal Committee for 20+ workers)
- ★★ POSH IC case kit (inquiry notice, report, annual report)
- ★ Whistleblower intake form

**Separate**
- ★★★ F&F statement (change 4)
- ★★ No-dues clearance form
- ★★ Exit analytics (from exit form CSVs)
- ★★ Retrenchment compensation calculator and selection sheet
- ★ Alumni and rehire register

**Lead and plan**
- ★★★ Policy library (change 10)
- ★★ Quarterly people report / board pack: one page with headcount, regretted attrition, hiring, cost per head, engagement and top risks, exported to PowerPoint
- ★★ Succession and critical-role register
- ★ Workforce cost dashboard (cost per head by department, the mix of fixed and variable pay)

---

## 8. Roadmap

| When | What | Outcome |
| --- | --- | --- |
| **This week** (all S) | Section 6, items 1–10 | Removes the risks and inaccuracies found in this audit |
| **Next 30 days** | F&F statement; notice → F&F link; exit form fields + CSV row; survey CSV import; .ics for the calendar; probation extension, promotion, transfer and PIP outcome letters | The exit and probation flows produce every document end to end |
| **30–90 days** | Shared roster loader (section 3.1); TDS estimator; CTC structure builder → appointment annexure; increment cycle → mail merge; disciplinary case kit; compliance tracker | The annual pay cycle, offers and discipline can run on the site |
| **90–180 days** | Talent review kit; adjusted pay equity with cost to close; board pack; policy library; output headers that hold up under audit (section 3.4); gratuity liability | The site supports a CHRO's board and audit conversations, not just HR operations |

**Process for every new legal template.** Fill in the existing `reviewedBy` and `reviewed` fields with a named employment lawyer before publishing. Start with the termination, discipline and POSH templates. The schema already supports it.

---

## 9. What not to build

- **Not an HRMS or payroll engine.** The site's edge is free, private and correct. Keep data on the device and avoid accounts, which would bring DPDP processor duties and a breach surface.
- **No salary benchmarks without a source.** Let users bring their own market data. An unsourced benchmark would undermine the trust the statutory facts have earned.
- **No post-employment non-compete clauses.** They are void under section 27 of the Contract Act. Confidentiality and non-solicitation are the lawful route.
- **No auto-written letters without review.** Keep the template plus human review model. AI drafting, if added, should only fill the existing fields.

---

## Appendix: files read for this audit

- Calculators and apps: `src/lib/calc/*.ts`, `src/lib/analytics/{fields,metrics}.ts`, `src/lib/orgchart/fields.ts`, `src/lib/mailmerge/library.ts`, `src/components/calculators/*.astro`, `src/scripts/{calc-kit,survey-tool}.ts`, `src/components/tools/SurveyTool.astro`
- Content: all 56 files in `src/content/toolkit/`
- Taxonomy: `src/data/taxonomy.ts`
- Browser runs: inputs and outputs for the 21 calculators and apps were captured with Playwright. No console errors.

---

## Implementation status (8 November 2026)

Work after this audit, on branch `claude/peoplecraft-site-fixes`, deployed to production. The toolkit grew from 56 to 80 tools.

**Section 6 quick fixes: all ten done.** Survey wording, POSH and medical-declaration drafts opt-in (new `sensitive` flag), pay groups from 5, compliance items (contract labour, standing orders, crèche, apprentices, SHe-Box), menstrual leave clause with a sourced Karnataka fact, exit form fields, LIFO and re-employment, notice buy-out amount, "Comply" label, Gallup-like items reworded.

**Section 2 top changes**

| # | Change | Status |
| --- | --- | --- |
| 1 | Load your people once | Done for the new file-based tools: an opt-in, tab-only shared roster (sessionStorage) used by the increment cycle, talent review, pay equity and gratuity liability. People analytics, org chart and mail merge keep their own loaders. |
| 2 | TDS estimate | Done: income tax calculator (old vs new, HRA, NPS, break-even), TDS in take-home and in F&F. |
| 3 | CTC structure builder | Done as the take-home calculator's salary annexure (Word). |
| 4 | F&F settlement statement | Done, plus retrenchment and closure compensation, severance and its tax, PF, ESI, PT and TDS (owner's request). |
| 5 | Increment cycle | Done: increment cycle planner with per-person matrix, proration, promotion budget, fit to budget, totals by manager, revision letters CSV for mail merge. |
| 6 | Disciplinary case kit | Done: charge-sheet, suspension order, inquiry notice, inquiry report, penalty order, process guide; retrenchment notice. |
| 7 | Survey CSV import | Done: Google or Microsoft Forms files, favourability, eNPS, trend, cuts by group (5+) with pooling. |
| 8 | Talent review kit | Done: talent review and calibration app. |
| 9 | Compliance tracker | Done: checklists take an owner, due date and evidence note per item, and export due dates to a calendar. |
| 10 | Policy library | Started: POSH, grievance redressal, whistleblower, DPDP employee privacy notice, hybrid work. Not yet: code of conduct, travel and expense, IT acceptable use. |

**Section 3 platform upgrades:** 3.2 partly (increment cycle to mail merge; forms export a CSV row); 3.4 done (every calculator has a working paper with a Prepared / Reviewed / Approved block); 3.1 and 3.5 partly, as above.

**Also done:** statutory bonus calculator; gratuity liability, forfeiture and tax split; promotion, transfer, probation extension and PIP outcome letters; background verification consent, no-dues clearance and panel debrief forms; offer letter clauses (joining bonus clawback, outside work, IP); pre-boarding, offboarding and retention-period items; HR calendar as an .ics file.

**Not yet done:** HRMS header aliases tested against real exports; people analytics columns for regretted and exit reasons; exit analytics from the exit form's CSV rows; bulk EPF, ESI and PT; state holiday lists; HR metrics from the roster; HR budget phasing; recruiter capacity in the headcount plan; org chart vacancies and spans; POSH IC case kit; grievance form and register; board pack; reverse take-home (in-hand to CTC); the remaining policies; and a named employment lawyer's review (`reviewedBy`) of the legal templates, starting with the disciplinary kit, retrenchment notice and POSH policy.
