# Appendix: raw results

These results were produced on 3 November 2026 from the uploaded copy (`peoplecraft-website-2026-11-03.zip`). The copy was built locally and served with `astro preview`. The network proxy blocked access to `peoplecraft.vercel.app`, so none of these numbers come from the live site or from real visitors.

## A. Commands

| Command | Result |
|---|---|
| `npm ci` | Installed, exit 0 (Node 22.23) |
| `npm test` | 276 passed, 0 failed |
| `npx astro check` | 0 errors, 0 warnings, 2 hints (256 files) |
| `npm run build` | Built in about 10 s. Pagefind indexed 149 pages. Vite warned that one chunk is over 500 kB (the three.js hero). |
| `npm run check:links` | All 16592 internal links in 174 pages resolve. |
| `npm audit --omit=dev` | 2 high-severity issues in `image-size` 0.6.3–2.0.2 (GHSA-5p2g-fcmc-qvqq and GHSA-w3rx-r6r6-pgpr: a malformed image can freeze the parser in an endless loop). `pptxgenjs` 4.0.1 pulls it in. |
| Fresh build vs shipped `dist/` | Identical apart from the build timestamp (`data-build`) |

## B. Lighthouse (phone settings with simulated slow network, local server)

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Weight | DOM elements |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 95 | 100 | 100 | 100 | 1.7 s | 2.7 s | 0 ms | 0.001 | 277 KB | 1,726 elements |
| `/glossary/` | 95 | 100 | 100 | 100 | 2.0 s | 2.6 s | 0 ms | 0 | 272 KB | 4,263 elements |
| `/handbooks/labour-law/wages-and-pay/` | 93 | 100 | 100 | 100 | 2.3 s | 2.9 s | 0 ms | 0 | 317 KB | 1,295 elements |
| `/jd-library/data-scientist/` | 93 | 100 | 100 | 100 | 2.3 s | 2.9 s | 0 ms | 0 | 322 KB | 1,097 elements |
| `/toolkit/offer-letter/` | 99 | 98 | 100 | 100 | 1.5 s | 2.1 s | 0 ms | 0 | 260 KB | 1,085 elements |
| `/toolkit/org-chart-builder/` | 94 | 100 | 100 | 100 | 2.1 s | 2.9 s | 0 ms | 0 | 276 KB | 977 elements |
| `/toolkit/people-analytics/` | 90 | 100 | 100 | 100 | 2.5 s | 3.2 s | 0 ms | 0 | 361 KB | 1,213 elements |
| `/toolkit/take-home-salary-calculator/` | 92 | 100 | 100 | 100 | 2.3 s | 3.0 s | 0 ms | 0 | 360 KB | 1,253 elements |

What a chapter page downloads (`/handbooks/labour-law/wages-and-pay/`):

| Type | Transfer size |
|---|---|
| Total | 317 KB |
| Font | 256 KB |
| Document | 22 KB |
| Stylesheet | 19 KB |
| Script | 11 KB |
| Other | 9 KB |
| Image | 0 KB |
| Media | 0 KB |
| Third-party | 0 KB |

Font files on that page: `anek-latin-latin-standard-normal` 102 KB, `anek-latin-latin-ext-standard-normal` 81 KB, `caveat-latin` 73 KB.

## C. Crawl of every built page (Playwright with axe-core 4.10, at 390 px and 1280 px wide)

- Pages crawled: 172 (every `index.html` in `dist/`).
- Requests to any other website: 0.
- JavaScript errors: 0. Console errors: 0. The desktop hero logged two WebGL performance warnings.
- Pages wider than the screen at 390 px: 0.
- Pages without exactly one H1: 0. Duplicate titles: 0. Duplicate meta descriptions: 0.
- Titles longer than 65 characters: 45. Meta descriptions outside 70–165 characters: 25.
- Pages with no axe violations at all: 72 of 172.

| axe rule | Impact | Pages | Elements | What it means |
|---|---|---|---|---|
| `landmark-complementary-is-top-level` | moderate | 96 | 176 | Aside should not be contained in another landmark |
| `landmark-unique` | moderate | 19 | 19 | Landmarks should have a unique role or role/label/title (i.e. accessible name) combination |
| `heading-order` | moderate | 2 | 2 | Heading levels should only increase by one |

None of these is a WCAG A or AA failure. All three are axe "best practice" rules.

Structured data found, by page type:

| Section | JSON-LD types | Pages |
|---|---|---|
| about | BreadcrumbList | 1 |
| about | BreadcrumbList + AboutPage | 1 |
| desk | (none) | 1 |
| disclaimer | BreadcrumbList | 1 |
| glossary | BreadcrumbList + DefinedTermSet | 1 |
| handbooks | Article + BreadcrumbList + FAQPage | 41 |
| handbooks | BreadcrumbList + Book | 4 |
| handbooks | BreadcrumbList + CollectionPage | 1 |
| home | WebSite + Organization | 1 |
| jd-library | BreadcrumbList + CollectionPage | 1 |
| jd-library | DigitalDocument + BreadcrumbList | 1 |
| jd-library | Occupation + BreadcrumbList | 50 |
| offline | (none) | 1 |
| privacy | BreadcrumbList | 1 |
| search | WebSite | 1 |
| start | BreadcrumbList | 1 |
| start | BreadcrumbList + ItemList | 4 |
| styleguide | (none) | 2 |
| terms | BreadcrumbList | 1 |
| toolkit | BreadcrumbList + CollectionPage | 1 |
| toolkit | DigitalDocument + BreadcrumbList + FAQPage | 35 |
| toolkit | WebApplication + BreadcrumbList + FAQPage | 21 |

## D. Search: 35 real queries against the Pagefind index

These are the top three results for each query. A query in bold means the page you would expect is not in the top three.

| Query | Results | Top 3 |
|---|---|---|
| gratuity | 38 | `/toolkit/gratuity-calculator/` · `/handbooks/labour-law/social-security-and-benefits/` · `/toolkit/full-and-final-settlement-calculator/` |
| **F&F** | 3 | `/handbooks/tds/joiners-leavers-and-transfers/` · `/handbooks/tds/mistakes-and-audit-triggers/` · `/glossary/` |
| full and final | 51 | `/toolkit/full-and-final-settlement-calculator/` · `/handbooks/labour-law/whats-next/` · `/handbooks/labour-law/the-four-labour-codes/` |
| PF | 40 | `/handbooks/labour-law/social-security-and-benefits/` · `/toolkit/epf-calculator/` · `/toolkit/take-home-salary-calculator/` |
| **UAN** | 6 | `/toolkit/appointment-letter/` · `/toolkit/offboarding-checklist/` · `/toolkit/employee-joining-form/` |
| form 16 | 27 | `/handbooks/tds/form-16-and-employee-queries/` · `/toolkit/esi-calculator/` · `/toolkit/epf-calculator/` |
| notice period buyout | 8 | `/toolkit/notice-period-calculator/` · `/handbooks/recruitment/offers-and-negotiation/` · `/toolkit/resignation-letter/` |
| POSH | 20 | `/handbooks/labour-law/posh-compliance/` · `/toolkit/posh-ic-constitution-checklist/` · `/handbooks/labour-law/penalties/` |
| PT Karnataka | 3 | `/handbooks/labour-law/state-specific-rules/` · `/toolkit/professional-tax-calculator/` · `/handbooks/labour-law/leave-and-working-hours/` |
| **labor code** | 2 | `/jd-library/cybersecurity-analyst/` · `/jd-library/quality-assurance-manager/` |
| labour code | 51 | `/handbooks/labour-law/the-four-labour-codes/` · `/handbooks/labour-law/penalties/` · `/handbooks/labour-law/compliance-checklists/` |
| CTC | 26 | `/handbooks/tds/ctc-design-and-perquisites/` · `/handbooks/recruitment/do-you-need-this-role/` · `/toolkit/take-home-salary-calculator/` |
| take home salary | 65 | `/toolkit/take-home-salary-calculator/` · `/handbooks/tds/what-hr-must-know/` · `/handbooks/tds/ctc-design-and-perquisites/` |
| maternity leave | 13 | `/handbooks/labour-law/leave-and-working-hours/` · `/toolkit/leave-policy/` · `/toolkit/hr-compliance-audit-checklist/` |
| leave encashment | 10 | `/toolkit/leave-encashment-calculator/` · `/toolkit/full-and-final-settlement-calculator/` · `/handbooks/tds/joiners-leavers-and-transfers/` |
| show cause notice | 10 | `/toolkit/show-cause-notice/` · `/toolkit/warning-letter/` · `/handbooks/tds/mistakes-and-audit-triggers/` |
| relieving letter | 14 | `/toolkit/relieving-letter/` · `/toolkit/experience-letter/` · `/toolkit/document-checklist/` |
| experience letter | 72 | `/toolkit/experience-letter/` · `/toolkit/mail-merge/` · `/handbooks/hr-professional/employee-experience/` |
| **salary slip** | 10 | `/handbooks/labour-law/compliance-checklists/` · `/jd-library/technical-programme-manager/` · `/handbooks/tds/contractor-or-employee/` |
| **payslip** | 15 | `/toolkit/salary-revision-letter/` · `/handbooks/tds/form-16-and-employee-queries/` · `/handbooks/tds/compliance-checklists/` |
| HRA exemption | 7 | `/handbooks/tds/investment-declarations/` · `/handbooks/tds/ctc-design-and-perquisites/` · `/handbooks/tds/salary-tds/` |
| new tax regime | 15 | `/handbooks/tds/ctc-design-and-perquisites/` · `/handbooks/tds/salary-tds/` · `/handbooks/tds/mistakes-and-audit-triggers/` |
| ESI | 36 | `/toolkit/esi-calculator/` · `/handbooks/labour-law/social-security-and-benefits/` · `/handbooks/labour-law/whats-next/` |
| bonus | 28 | `/handbooks/labour-law/wages-and-pay/` · `/glossary/` · `/toolkit/cost-per-hire-calculator/` |
| **minimum wage** | 22 | `/toolkit/salary-band-designer/` · `/handbooks/labour-law/wages-and-pay/` · `/handbooks/labour-law/state-specific-rules/` |
| probation | 15 | `/toolkit/probation-confirmation-letter/` · `/handbooks/recruitment/onboarding-day-1-to-90/` · `/toolkit/offer-letter/` |
| termination | 16 | `/toolkit/termination-letter/` · `/handbooks/labour-law/termination-grievance-and-disputes/` · `/toolkit/offboarding-checklist/` |
| internship certificate | 3 | `/toolkit/internship-certificate/` · `/handbooks/hr-professional/the-path-to-chro/` · `/toolkit/mail-merge/` |
| PIP | 13 | `/toolkit/performance-improvement-plan/` · `/jd-library/vp-sales-b2b-saas/` · `/handbooks/hr-professional/performance-and-learning/` |
| 80C | 3 | `/handbooks/tds/salary-tds/` · `/handbooks/tds/what-hr-must-know/` · `/handbooks/tds/investment-declarations/` |
| overtime | 15 | `/handbooks/labour-law/leave-and-working-hours/` · `/handbooks/labour-law/wages-and-pay/` · `/toolkit/take-home-salary-calculator/` |
| **gratuty** | 2 | `/glossary/` · `/handbooks/labour-law/wages-and-pay/` |
| fixed term employment | 53 | `/handbooks/labour-law/contracts-and-fixed-term-employment/` · `/toolkit/gratuity-calculator/` · `/handbooks/labour-law/social-security-and-benefits/` |
| sexual harassment complaint | 9 | `/toolkit/posh-complaint-form/` · `/handbooks/labour-law/posh-compliance/` · `/handbooks/hr-professional/the-hr-crisis-playbook/` |
| **resignation letter format** | 4 | `/toolkit/document-checklist/` · `/handbooks/recruitment/offers-and-negotiation/` · `/handbooks/hr-professional/communication-and-influence/` |

pagefind bytes downloaded for 35 queries: 746139.

## E. Other checks

- **Hand-worked calculator cases** (run against `src/lib/calc`):
  - Gratuity: ₹50,000 for 7 years 7 months gives 8 years, ₹2,30,769. 7 years 6 months gives 7 years. A ₹3 lakh salary over 30 years is capped at ₹20 lakh. A 1-year fixed-term contract ending on expiry pays. Death after 1 year pays.
  - EPF: ₹30,000 in Oct 2026 gives ₹3,000 / ₹3,000, with EPS ₹2,083. Aug 2026 gives ₹1,800 / ₹1,250. The split on 16 and 17 Sep 2026 is right.
  - ESI: ₹20,000 gives ₹150 / ₹650. ₹21,000 is covered and ₹21,001 is not. ₹23,000 is covered for a person with disability.
  - Professional tax: Karnataka ₹200 a month (₹300 in February, ₹2,500 a year). Maharashtra is ₹175 or ₹200, with women nil up to ₹25,000. West Bengal ₹100 at ₹30,000.
  - All of these match the page text and the law as stated in `statutory.ts`.
- **Offline copies** (Chromium): the second page opened is kept and opens offline. The first page opened (the landing page) is not kept; offline it shows "You're offline".
- **Mobile layout**: on a 390 × 844 phone, the first form field of every calculator and template tested sits 815–1,197 px down, so none is visible without scrolling.
- **Content duplication** (5-word phrases): across the 51 JD pages, the median page shares 67% of its phrases with at least half the other JDs, and the median pairwise overlap is 0.50. Across the 56 toolkit pages the shared share is 3%.
- **Statutory sources**: 15 of 59 facts in `STAT`, and 14 of 17 professional-tax states, cite no official (.gov.in, India Code, PIB or PRS) source.
- **Hard-coded statutory figures**: `<Fact>` is used 42 times. "₹25,000" appears 78 times in 18 content files, "₹21,000" 22 times in 11, "₹15,000" 26 times in 11, and "₹20 lakh" 9 times in 6.
- **"Checked on" dates**: all 148 dated content items say 2026-11-02. No content item names a reviewer.
