# PeopleCraft content guide

PeopleCraft is a **free, public HR library for India**: four handbooks, a free HR course (PeopleCraft Learn, at `/learn/`; writers also read `docs/LEARN-GUIDE.md`), a toolkit (calculators, letters, forms, policies, checklists, surveys, plans), a people-analytics tool and a glossary. No sign-up, no tracking, English (India). Readers: HR professionals, founders and small businesses, employees, students and job seekers.

This guide is the contract for everyone writing or rebuilding pages. Read it fully before you start.

---

## 1. Voice

Write like a senior HR leader explaining things to a smart colleague: plain, calm, specific.

- **Plain words, short sentences, active voice.** "Pay dues within two working days", not "Dues are required to be settled within a period of two working days".
- **Sentence case** for every heading and label. No ALL CAPS, no Title Case Headings.
- **Indian English:** labour, organisation, programme, enrol, judgement. Money as `₹1,38,462` (Indian grouping), `₹20 lakh`, `₹1.2 crore`. Dates as `2 November 2026` or `2 Nov 2026`.
- **Name things the way people at work do:** CTC, in-hand pay, full and final (F&F), notice period, comp-off, LWP. Expand an abbreviation the first time on a page: "leave without pay (LWP)".
- **No sales language.** The site is free. Never write "subscribe", "plan", "premium", "unlock", "executive-grade", "infrastructure", "operating system", "fastest-growing", "built by C-suite practitioners".
- **No hype or slogans:** no exclamation marks, no emojis, no superlatives ("best", "leading", "ultimate"), no paired-fragment slogans ("Hire fast. Hire right."). Claims only what a reader can check.
- **Be honest about uncertainty.** If the law is unsettled, state rules pending, or practice varies by state or contract, say so in one sentence.
- **Kind and fair.** HR content affects people's livelihoods. Explain employee rights and employer duties evenly. Never coach anyone to get around the law.
- **Errors and empty states** say what happened and what to do next. They don't apologise.

## 2. What every handbook chapter contains

Files: `src/content/handbooks/<book>/<NN>-<slug>.mdx` where `<book>` is `labour-law`, `tds`, `recruitment` or `hr-professional`. `NN` is the two-digit chapter number. The slug becomes the URL: `/handbooks/labour-law/leave-and-working-hours/`.

```yaml
---
title: Leave and working hours            # ≤ 60 characters, sentence case, says what the chapter covers
description: >-                           # 120–170 characters; written for a search result
  Daily and weekly hour limits, overtime at twice the wage, earned leave after 180 days and maternity rules under the OSH Code.
book: labour-law
chapter: 3
stage: pay                                # recruit | onboard | grow | pay | exit | lead (optional)
audiences: [hr, founders, employees]      # hr | founders | employees | students
checked: 2026-11-02                       # the date YOU verified every fact on the page
summary:                                  # 2–5 sentences for the "In short" box
  - "Working hours are capped at 8 a day and 48 a week."
  - "Overtime is paid at twice the ordinary wage."
sources:                                  # official sources first; every legal number must trace to one
  - { title: "Occupational Safety, Health and Working Conditions Code, 2020", url: "https://…", publisher: "Ministry of Labour and Employment" }
related: [toolkit/leave-encashment-calculator, handbooks/labour-law/04-social-security, glossary/earned-leave]
faq:                                      # 2–5 real questions people search for, answered in 1–3 sentences
  - q: Is overtime mandatory to pay at double rate?
    a: Yes. Under the Code on Wages, overtime is paid at not less than twice the ordinary rate of wages.
keywords: [overtime rules india, earned leave eligibility, working hours labour code]
draft: false
---
```

Body structure (MDX):

1. Optional `<Snapshot>` executive box (who should read it, biggest risks, common mistakes, exposure, focus by role) when the source chapter had one.
2. 3–7 `##` sections, each with `###` subsections as needed. **Never use `#` (h1) in the body.** Headings are sentence case and say what the section answers.
3. **At least two diagrams per chapter** (see section 4), placed where they explain something. Tables count as content, not diagrams.
4. Callouts where they help: `<Callout type="law">` (a rule with its source), `type="tip"`, `type="warning"` (common mistake or risk), `type="note"`.
5. Keep paragraphs to 2–4 sentences. Use lists for sets of 3+ items. Use tables for comparisons with 3+ rows.

The layout adds the title, checked stamp, "In short", table of contents, FAQ, sources, disclaimer, previous/next and related links. Don't repeat those in the body.

## 3. Toolkit items

Files: `src/content/toolkit/<slug>.md` (letters, forms, policies, checklists, surveys) or `.mdx` (calculators and plans, which render MDX). URL: `/toolkit/<slug>/`.

Common frontmatter:

```yaml
title: Full and final settlement calculator
description: 120–170 characters.
kind: calculator          # calculator | letter | form | policy | checklist | survey | plan
stage: exit
audiences: [hr, employees]
order: 10                 # sort order inside its stage
code: PC-F-04             # optional: keep the original form code if it had one
checked: 2026-11-02
useWhen: One sentence starting with a clause, e.g. "An employee is leaving and you need to work out what they are owed."
tips: ["2–4 practical tips. Simple HTML like <strong> is allowed."]
sources: []
related: []
faq: []
keywords: []
```

Per kind:

- **calculator**: add `calculator: <id>`. Build `src/components/calculators/<id>.astro` (UI) and `src/lib/calc/<id>.ts` (pure logic, no DOM) plus `src/lib/calc/<id>.test.ts` (node:test). Use the calc kit: `CalcShell`, `Num`, `Pick`, `DateIn` from `src/components/calc/` and `bindCalculator` from `src/scripts/calc-kit.ts`. Look at the gratuity calculator as the reference implementation. Statutory numbers come from `src/data/statutory.ts` (add entries there with source and checked date; never hard-code a legal number in a calculator). In logic files, import with explicit `.ts` extensions so `npm test` runs. The `.mdx` body explains how it's worked out, with a `<Formula>` and other diagrams.
- **letter / form / policy**: `fields` (id, label, type: text | textarea | date | number | email | tel | select | money, required, placeholder, help, options, default, group) and a Markdown body with `{{field_id}}` placeholders and `{{today}}`. Line breaks are kept. A paragraph or list item whose only placeholders are optional and empty is hidden automatically, so put optional content in its own paragraph. Write the body as the finished document (headings `##`, lists, simple tables). Users can download it as Word, print it or copy it.
- **checklist**: Markdown body with `##` groups and task items `- [ ] Do this`. Short paragraphs under a heading are allowed for context. Ticks are saved in the browser and the page shows progress.
- **survey**: `scale` ({min, max, labels}), `questions` ({id, text, dimension, reverse}) and `bands` on the average score ({min, max, label, advice}), lowest first, covering the full range. The body (MDX) is a short intro on how to use the results.
- **plan**: an MDX guide (e.g. first-90-days plan, stay-interview guide, crisis messages) using the same components as chapters; may include task lists.

## 4. Diagrams (the site's main visual language)

All diagrams are data-driven components, available in every `.mdx` file **without imports**. Wrap each in `<Figure title="…" caption="How to read it…">` (add `wide` for diagrams that need room). Titles say what the diagram shows; captions say how to read it in one sentence.

| Component | Use it for | Example |
| --- | --- | --- |
| `<Timeline items spans>` | Dated sequences: notice period, F&F timeline, probation, filing dates | `items={[{ when: "Day 0", label: "Resignation", accent: true }]} spans={[{ from: 0, to: 2, label: "Notice period" }]}` |
| `<Flow steps outcomes>` | Processes with an outcome: approvals, complaint process, hiring stages | `steps={[{ who: "Manager", title: "Reviews", detail: "Within 2 days" }]} outcomes={[{ title: "Approved", tone: "good" }]}` |
| `<Breakdown total parts groups>` | One whole split into ≤ 6 parts: CTC, payslip, PF split, budget | `parts={[{ label: "Basic + DA", value: 25000, display: "₹25,000", note: "…" }]}` |
| `<Formula parts result example>` | Any calculation people should understand | `parts={[{ value: "Wages", label: "basic + DA" }, { op: "×" }, …]}` |
| `<DecisionTree node>` | Yes/no applicability: ESI, PF, POSH IC, gratuity eligibility | `node={{ q: "…?", yes: { result: "…", tone: "good" }, no: { q: "…", yes: {…}, no: {…} } }}` |
| `<Matrix rows cols cells xLabel yLabel>` | Two-axis grids: 9-box, risk matrix | see `/styleguide/` |
| `<Cycle items center>` | Repeating cycles: TDS year, performance cycle, payroll month | `items={[{ title: "April", note: "Declarations" }]}` |
| `<KeyNumbers items>` | The 2–4 numbers a reader must remember | `items={[{ value: "26 weeks", label: "maternity leave…" }]}` |
| `<Compare columns rows highlight>` | Old vs new, option A vs B | `columns={["Before", "Labour Codes"]} highlight={1}` |
| `<Steps items>` | Numbered how-to sequences | `items={[{ title: "…", body: "…" }]}` |

Rules: labels ≤ 8 words; never rely on colour alone (labels always visible); at most 6 parts in a Breakdown; no decorative diagrams; example numbers say "Example". See every component rendered at `/styleguide/`.

Inline statutory values: `<Fact id="gratuity.ceiling" />` prints the value from `src/data/statutory.ts` with its source on hover, so chapters and calculators never disagree.

## 5. Facts and sources (non-negotiable)

- Write for the law **in force on the `checked` date**. As of November 2026, India's four Labour Codes are in force (from 21 November 2025, with rules and some provisions phased in), and salary TDS falls under the **Income-tax Act, 2025** from 1 April 2026. Verify both before relying on them.
- Verified facts and sources are collected in `/home/claude/work/research/hr-facts-india.md` (if present). Use it first; verify anything else yourself with official sources (labour.gov.in, egazette.gov.in, epfindia.gov.in, esic.gov.in, incometaxindia.gov.in, indiacode.nic.in, state labour departments).
- Every legal number or deadline must be traceable to a source listed in `sources`. If you can't verify a claim from the original content, either remove it or soften it to what you can verify. Never invent penalties, section numbers, case names or statistics.
- Section numbers matter: under the new laws they changed. If unsure, name the code without a section number.
- When something depends on the state, the contract or company policy, say so.

## 6. Accessibility and SEO

- Headings in order (`##` then `###`); descriptive link text (never "click here"); tables need a header row; every diagram has a meaningful title.
- `title` ≤ 60 characters where possible; `description` 120–170 characters; `keywords` are phrases people actually type into Google; `faq` uses real questions.
- Link generously to related chapters, tools and glossary terms through `related`, and inline with Markdown links to `/handbooks/…/`, `/toolkit/…/` and `/glossary/#term-id`.

## 7. Working rules for agents

- **Own only your files.** Write only inside the paths your brief gives you. Don't edit shared components, layouts, styles or other agents' files. If you need a new component, put it in `src/components/<your-area>/` and mention it in your report.
- **Don't install packages** and don't touch `package.json`.
- Verify with `npx astro check` (filter output to your files), `npm test` (calculators), and by viewing your pages on the dev server (`npx astro dev --port <your port> --host 127.0.0.1`) using `node /home/claude/scripts/shot.cjs <url> <out.png> 1280 900 1 800 1` (the last `1` = reduced motion, so everything is visible), then look at the PNG. Check a phone width (390) too.
- Keep `draft: true` on anything you couldn't verify; the build hides drafts.
