# Audit: The Complete HR Professional (`hr-professional.html`)

Original: one 217 KB page, 11 chapters in five parts, about 44 accordions, 17 tables, an HR budget calculator, an ethics quiz, a self-assessment checklist and a true/false quiz. Checked against the frameworks' owners (shrm.org, cipd.org, aihr.com), India Code and `/home/claude/work/research/hr-facts-india.md` on 2 November 2026.

## Summary

- **The framework facts were out of date and inconsistent, and the "mapping" overclaimed.** The page called SHRM's BASK "9 behavioral + 14 functional" in one place and "9 behavioural + 15 knowledge domains" in another. The 2026 BASK has 8 behavioural competencies plus HR Expertise (14 functional areas). AIHR's model now has 6 core competencies, not 5. CIPD's Map was called "UK-centric", but CIPD describes it as the international benchmark. Per-chapter "Framework Alignment" boxes used names that don't exist in the frameworks, and a level table claimed CIPD and SHRM certification equivalence. The rebuild describes each framework as its owner publishes it, adds one cross-reference table labelled as PeopleCraft's reading, and states that none of the three bodies endorses the model.
- **Several legal statements were wrong for 2026.** The layoff section cited Industrial Disputes Act s.25N and a 100-worker threshold. The Labour Codes replaced that Act on 21 Nov 2025: under the IR Code, a "worker" gets one month's notice or pay, compensation and notice to the government, and the 300-worker threshold applies to prior permission. Other errors: a claimed POSH duty for HR to report "regardless of the employee's wishes"; DPDP duties described as already in force (most apply from 2027); and "basic + DA must be ≥50%" (the actual rule caps exclusions from "wages" at half).
- **Unsourced statistics and "India benchmarks" were presented as fact.** Examples: "82% of HRBPs…", "59% of HR professionals lack data literacy (AIHR 2025)", "70% of CEOs… 55%", benchmarks for 20 metrics, HR budget ratios, vendor prices, CTC ranges by level, certification costs and "3× improvement". All were removed or replaced with formulas, labelled examples or sourced figures (Gallup's replacement-cost range, CCL on 70-20-10, Kirkpatrick).
- **There were intellectual-property and HR-practice risks.** "12 questions adapted from Gallup Q12" closely reproduced a proprietary survey. Vendors were named with prices. The page advised asking "happy employees" for reviews, and its 9-box said "retain at all costs" and "exit conversation needed". The rebuild uses original question themes, names no vendors, and words these points neutrally.
- **Accessibility and UX were weak.** Accordion headers were `div role="button"` elements that didn't respond to Enter or Space and never updated `aria-expanded`. Headings sat inside button roles. Quiz answers were clickable `div`/`span` elements (the true/false ones couldn't be focused). Checkboxes were `div`s, inputs had no labels, and "d" and "m" were single-key shortcuts. The rebuild is 11 static, semantic pages, each with at least two diagrams. **Kept:** the 11-chapter structure, the snapshots, the ethics dilemmas, SCQA, the data-story arc, the data traps, the policy before/after, the stakeholder table, the 90-day plan, the people review, the culture diagnostic, stay interviews, the PIP decision, the 9-box and the senior-exit protocol.

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "₹1,999/year — Executive Access →" | Sales call to action on what is now a free library | Copy | High | Removed; the site header is shared |
| Nav label "Labor Law" | US spelling | Copy | Low | "Labour law" |
| Search, A−/A+, theme toggle, "d"/"m" keys | Single-key shortcuts can't be turned off (WCAG 2.1.4) | Accessibility | Med | Site-wide search; no single-key shortcuts |
| Sidebar chapter list | `div onclick` items, not links | Accessibility | Med | Real links in "All 11 chapters" and the per-page contents |

## Hero

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| "everything an HR professional needs to be genuinely excellent" | Hype that can't be checked | Copy | Low | Plain book subtitle (shared `books.ts`) |
| "What You'll Master" | Promised CTC breakdowns, grievance redressal and "bell curves", none delivered (ch.9 argues against forced curves) | Accuracy | Med | Each chapter has its own summary; promises match content |
| KPI tiles ("3 Frameworks synthesized") with count-up animation | Implies a formal synthesis; animation ignores reduced-motion | Copy, accessibility | Low | Removed; the synthesis is described with a non-endorsement note |

## Chapters

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| 1.1 framework table | Counts outdated; CIPD described as UK/EU regulatory; SHRM "light on digital/AI" (2026 BASK added AI throughout) | Accuracy | High | Compare diagram checked against shrm.org, cipd.org and aihr.com |
| 1.3 levels table, "CIPD Equiv / SHRM Equiv" | Certification equivalence nobody grants | Accuracy, legal | High | Removed; Matrix of what good looks like at each stage |
| 1.4 certification costs and "India ROI" | Unverified prices and opinions | Accuracy | Med | What each credential is; "check fees on the owner's site" |
| Ch.2 snapshot and "Remember" box | Copied from a SHRM-prep chapter ("₹80K–₹1.5L certification cost", "map projects to BASK domains") | Copy | Med | Rewritten for ethics |
| Ch.2 POSH dilemma | "Legally required to report" against her wishes; we found no such duty in the Act | Accuracy, HR practice | High | Options, policy duties and no false promise of secrecy; links to the POSH chapter |
| Ch.2 medical-leave layoff | "Illegal discrimination under labour law" (too broad) | Accuracy | Med | Objective criteria; IR Code s.71 "last come, first go" |
| Ch.3 "82% of HRBPs", "40–70% of expenses", "India average 30–60%" | Unsourced | Accuracy | High | Removed; labelled example Breakdown and three Formulas |
| Ch.3 HR budget builder | Invented ratios (1:100 HR ratio, ₹9 lakh per HR person, 1.5–3% of revenue) | Accuracy | High | Steps to build a budget from the plan; links to the `hr-budget-builder` tool |
| Ch.3 "basic + DA must be ≥50%" | Misstates Code on Wages s.2(y) | Accuracy, legal | High | Correct 50% exclusion rule, linked to the labour law chapter |
| Ch.4 "59%… (AIHR 2025)", "India Benchmark" column | Unsourced | Accuracy | High | Removed; table of 20 formulas with "what it tells you" |
| Ch.4 gender pay gap "male ÷ female" | Non-standard definition | Accuracy | Low | (Men − women) ÷ men × 100, same level |
| Ch.4 "POSH cases… 100% (legal requirement)" | Garbled legal claim | Accuracy | Med | Replaced with "filings on time" |
| Ch.5 vendor table with ₹ prices | Unverified, dated, reads as endorsement | Accuracy, legal | Med | Categories plus a buying checklist; no vendors |
| Ch.5 "EEOC and proposed Indian regulations" | US agency; Indian proposal unverified | Accuracy | Med | Code on Wages s.3 and the DPDP Act |
| Ch.5 DPDP section | Written as if in force; "explicit consent" for all employee data | Accuracy, legal | High | DPDP timeline (most duties from 2027); s.7 legitimate uses; preparation steps |
| Ch.6 "32% lower attrition" | Unsourced statistic | Accuracy | Med | Reframed as your own company's data |
| Ch.6 termination script | No legal timeline for dues | HR practice | Med | Code on Wages s.17(2): two working days |
| Ch.7 "70% of CEOs… 55%"; "60–70% of time" | Unsourced | Accuracy | Med | Removed; labelled example Breakdown; Ulrich (HBR 1998) cited |
| Ch.8 Gallup-style 12 questions | Near-verbatim reproduction of a licensed survey | Legal | High | Original question themes; links to the free `engagement-pulse-survey` |
| Ch.9 "research consistently shows", "3×", "70-20-10… research shows" | Overstated or unsourced | Accuracy | Med | CCL described as a guideline; Kirkpatrick levels sourced |
| Ch.9 9-box "retain at all costs", "exit conversation needed" | Harsh, legally risky wording | HR practice | Med | Neutral labels; IR Code retrenchment warning for PIP exits |
| Ch.10 layoff "Section 25N… 100+ workers" | Repealed law and wrong threshold | Accuracy, legal | High | DecisionTree under the IR Code (worker test, 300+, s.70, re-skilling fund) |
| Ch.10 POSH "Non-negotiable rules" | Mix of correct and unverifiable items ("Retaliation = separate offence") | Accuracy | High | HR-role Flow; statutory detail deferred to the labour-law POSH chapter |
| Ch.10 Glassdoor "encourage happy employees" | Selective solicitation | HR practice | Med | Invite everyone; no incentives or pressure |
| Ch.10 compliance checklist | Out of scope and partly outdated (Equal Remuneration Act repealed; gratuity "5+ years" ignores the fixed-term rule) | Accuracy | Med | Crisis-readiness list; links to compliance checklists |
| Ch.10 intro promised self-harm guidance; none given | Gap on a safety-critical topic | HR practice | High | "Employee in distress" section with 112 (verified) and Tele-MANAS |
| Ch.11 CTC ranges by level | Unverified salary data | Accuracy | High | Removed; skills and readiness signals per stage |
| Ch.11 resources "India's best HR media platform" | Superlative | Copy | Low | Neutral descriptions |

## Interactive widgets

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Accordions (about 44) | Not keyboard operable; `aria-expanded` never changes; content hidden by default | Accessibility, SEO | High | All content visible; headings in order |
| Ethics quiz (ch.2) | `div` answers; the answer is in the `onclick` source | Accessibility | Med | Kept as a worked tip ("share the band, not the person") |
| Final true/false quiz | Unfocusable `span`s; Q1 now wrong (2026 BASK); Q2 invented "at least 2" specialisms; Q4 "20,000+ professionals" not found on CIPD pages | Accuracy, accessibility | High | Removed; facts corrected in ch.1 |
| 11.4 self-assessment checklist | `div` checkboxes; state lost on reload | Accessibility | Med | Links to the toolkit's `competency-self-assessment` and `hr-maturity-self-assessment` |
| HR budget builder inputs | No `<label>`; outputs based on invented ratios | Accessibility, accuracy | High | Replaced by the toolkit tool and guidance |
| Bookmarks, "Mark as read", mini table of contents | localStorage tracking, non-semantic controls | UX | Low | Not rebuilt |

## Tables, callouts and boxes

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| 17 tables | Had headers (good); no captions | Accessibility | Low | Kept as Markdown tables; comparisons moved into Compare |
| Executive Snapshot | Useful, but "Exposure" amounts were invented (e.g. "₹10L–₹5Cr") | Accuracy | Med | Kept with qualitative exposure lines and a "focus by role" section |
| "How Do I Measure This?" (`__/5` blanks) | Placeholders with no tool behind them | UX | Low | Removed; links to the assessments |
| "Framework Alignment" boxes | Wrong names (e.g. "SHRM Workplace > Culture", "Business > HR Strategy", "Interpersonal > Ethical Practice", CIPD "Senior People Professional (Level 7)", AIHR "Strategic HR Leadership") | Accuracy | High | One verified cross-reference table in ch.1 |
| Emoji icons (📖 ⚠ ✗ 💡 📌 🎓) | Read aloud by screen readers; against the style guide | Accessibility, copy | Low | Callout component with icons |

## Footer, meta tags and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
| --- | --- | --- | --- | --- |
| Footer "Synthesized from SHRM BASK, CIPD Profession Map & AIHR" | Implies an official synthesis | Copy, legal | Med | Ownership and non-endorsement note in ch.1 |
| `<title>`, meta description "Cross-mapped…", og:title differs | Overclaim; inconsistent | SEO, copy | Med | Per-chapter titles and descriptions of 120–170 characters, FAQ schema |
| JSON-LD `datePublished` 2026-02-01 vs "March 2026" | Inconsistent | SEO | Low | `checked` date per chapter |
| One URL for 11 chapters; canonical `.html` | Weak search targeting | SEO | Med | 11 URLs under `/handbooks/hr-professional/` |
| Google Fonts request; 55 KB inline CSS; scroll-spy scripts | Third-party request and page weight | Performance, privacy | Low | Shared site styles; no third-party calls |

**Note for the home-page agent:** `index.html` has a "Framework Alignment: Honest Mapping to SHRM, CIPD & AIHR" section that says the SHRM-CP covers "9+14 domains". Both overclaim and are now out of date. Please align with chapter 1.
