---
title: Offer letter
description: A clear, conditional job offer with the role, start date, CTC and monthly pay, probation, notice, conditions and an acceptance date. Fill it in, then download it.
kind: letter
stage: recruit
audiences: [hr, founders, students]
order: 40
code: PC-F-07
checked: 2026-11-02
useWhen: You have chosen a candidate and want to make a written offer before they join.
tips:
  - "Keep the offer and the <a href=\"/toolkit/appointment-letter/\">appointment letter</a> consistent. The appointment letter, given on joining, is the one the OSH Code requires in a prescribed format."
  - "Check the pay structure against the Labour Codes' definition of wages: if excluded allowances such as HRA and conveyance add up to more than half of total pay, the excess counts as wages for PF, gratuity and other benefits."
  - "Work out the likely take-home pay before you send the offer, with the <a href=\"/toolkit/take-home-salary-calculator/\">take-home salary calculator</a>. Candidates compare offers on in-hand pay."
  - "Tell the candidate what background verification covers, and carry it out only with their written consent."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: company_address, label: Company address, type: textarea, group: Company }
  - { id: ref_no, label: Reference number, group: Company }
  - { id: signatory_name, label: Signed by (name), required: true, group: Company }
  - { id: signatory_role, label: "Signatory's designation", required: true, placeholder: "Head of HR", group: Company }
  - { id: candidate_name, label: "Candidate's full name", required: true, group: Candidate }
  - { id: candidate_address, label: "Candidate's address", type: textarea, group: Candidate }
  - { id: role, label: Role, required: true, group: Role }
  - { id: department, label: Department, group: Role }
  - { id: location, label: Location, required: true, placeholder: "Bengaluru office", group: Role }
  - { id: reporting_to, label: Reporting to, placeholder: "Name and designation", group: Role }
  - { id: employment_type, label: Type of employment, type: select, required: true, options: [Permanent, Fixed-term], group: Role }
  - { id: fixed_term_end, label: Fixed-term end date, type: date, help: "Only for fixed-term roles. Adds a paragraph on equal treatment and gratuity.", group: Role }
  - { id: start_date, label: Start date, type: date, required: true, group: Role }
  - { id: work_pattern, label: Working pattern, placeholder: "Hybrid: three days a week in the office", group: Role }
  - { id: basic, label: Basic pay (monthly), type: money, required: true, group: Pay }
  - { id: da, label: Dearness allowance (monthly), type: money, group: Pay }
  - { id: hra, label: House rent allowance (monthly), type: money, group: Pay }
  - { id: special_allowance, label: Special allowance (monthly), type: money, group: Pay }
  - { id: other_allowances, label: Other fixed allowances (monthly), type: money, group: Pay }
  - { id: gross_monthly, label: Gross monthly pay, type: money, required: true, help: "The total of the monthly lines above.", group: Pay }
  - { id: employer_pf, label: Employer PF contribution (monthly), type: money, group: Pay }
  - { id: employer_esi, label: Employer ESI contribution (monthly), type: money, help: "Only if the employee will be covered by ESI.", group: Pay }
  - { id: gratuity, label: Gratuity provision (monthly), type: money, help: "Only if you show gratuity in CTC. Adds a note on when it is paid.", group: Pay }
  - { id: insurance_annual, label: Insurance premiums paid by the company (annual), type: money, group: Pay }
  - { id: variable_annual, label: Target variable pay (annual), type: money, help: "If you fill this in, also say below what it depends on.", group: Pay }
  - { id: variable_basis, label: What variable pay depends on, placeholder: "your individual goals and the company's results for the year", group: Pay }
  - { id: ctc_annual, label: Total annual CTC, type: money, required: true, help: "12 × (gross monthly pay + monthly employer costs) + the annual items.", group: Pay }
  - { id: probation, label: Probation period, placeholder: "6 months", group: Terms }
  - { id: notice, label: Notice period, required: true, placeholder: "30 days during probation and 60 days after confirmation", group: Terms }
  - { id: other_conditions, label: Any other condition of this offer, placeholder: "A valid driving licence for a light motor vehicle", group: Terms }
  - { id: accept_by, label: Accept by, type: date, required: true, group: Terms }
sources:
  - { title: "The Occupational Safety, Health and Working Conditions Code, 2020", url: "https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf", publisher: India Code }
  - { title: "Occupational Safety, Health and Working Conditions (Central) Rules, 2026, rule 6", url: "https://prsindia.org/files/bills_acts/bills_parliament/2026/Occupational_Safety_Rules,%202026.pdf", publisher: PRS Legislative Research }
  - { title: "The Code on Wages, 2019, section 2(y) (wages)", url: "https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf", publisher: India Code }
  - { title: "The Code on Social Security, 2020 (gratuity)", url: "https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf", publisher: India Code }
  - { title: "The Industrial Relations Code, 2020, section 2(o) (fixed-term employment)", url: "https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf", publisher: India Code }
  - { title: "Labour Ministry FAQs on the Labour Codes", url: "https://www.scconline.com/blog/post/2026/01/03/labour-ministry-issued-faqs-on-the-labour-codes/", publisher: SCC Online }
related: [toolkit/appointment-letter, toolkit/take-home-salary-calculator, toolkit/salary-band-designer, handbooks/recruitment/06-offers-and-negotiation, handbooks/labour-law/02-wages-and-pay, glossary/ctc]
faq:
  - q: Is an offer letter the same as an appointment letter?
    a: No. An offer letter makes a conditional offer before someone joins. The appointment letter is given when they join and sets out their terms of employment; under the OSH Code every employee must receive one, in the format the rules prescribe.
  - q: What is the difference between CTC and in-hand salary?
    a: CTC is everything the employer spends on you in a year, including its own PF and ESI contributions, any gratuity provision and target variable pay. In-hand pay is what reaches your bank account each month after your own PF contribution, ESI, professional tax and income tax are deducted.
  - q: Should gratuity be shown as part of CTC?
    a: Many employers include a gratuity provision in CTC. If you do, say clearly that it is not paid monthly. Under the Code on Social Security, 2020, gratuity is paid on leaving after five years of continuous service, or after one year for fixed-term employees.
keywords: [offer letter format india, job offer letter template, offer letter with ctc breakup, offer letter format word]
draft: false
---

**{{company}}**

{{company_address}}

Ref: {{ref_no}}

{{today}}

{{candidate_name}}

{{candidate_address}}

**Subject: Offer of employment as {{role}}**

Dear {{candidate_name}},

We are pleased to offer you the role of {{role}} at {{company}}, on the terms below. This offer depends on the conditions in section 4. When you join, you will receive an appointment letter with your full terms of employment.

### 1. Role and start date

- Role: {{role}}
- Department: {{department}}
- Location: {{location}}
- Reporting to: {{reporting_to}}
- Type of employment: {{employment_type}}
- Start date: {{start_date}}
- Working pattern: {{work_pattern}}

This is a fixed-term role ending on {{fixed_term_end}}. You will receive the same working hours, wages, allowances and other benefits as a permanent employee doing the same or similar work, and gratuity if you complete one year of service under the contract.

### 2. Pay

Your total annual cost to company (CTC) will be **{{ctc_annual}}**, and your gross monthly pay will be **{{gross_monthly}}**. The full breakdown is in the annexure.

Variable pay is not guaranteed. It depends on {{variable_basis}}.

### 3. Probation and notice

- Probation: {{probation}}
- Notice period: {{notice}}

### 4. Conditions of this offer

This offer depends on:

- satisfactory background verification, which we will carry out only with your written consent
- copies of the documents we ask for before you join, with the originals shown to us for checking
- {{other_conditions}}

If a condition is not met, we will talk to you before deciding whether to withdraw the offer.

### 5. Accepting this offer

Please sign and return a copy of this letter by **{{accept_by}}**. If we don't hear from you by then, the offer will lapse unless we agree a later date in writing.

We look forward to welcoming you.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

### Acceptance

I accept this offer on the terms above.

| Name | Signature | Date |
| --- | --- | --- |
| {{candidate_name}} | | |

---

### Annexure: CTC breakdown

| Component | Amount |
| --- | --- |
| Basic pay (monthly) | {{basic}} |
| Dearness allowance (monthly) | {{da}} |
| House rent allowance (monthly) | {{hra}} |
| Special allowance (monthly) | {{special_allowance}} |
| Other fixed allowances (monthly) | {{other_allowances}} |
| **Gross monthly pay** | **{{gross_monthly}}** |
| Employer PF contribution (monthly) | {{employer_pf}} |
| Employer ESI contribution (monthly) | {{employer_esi}} |
| Gratuity provision (monthly) | {{gratuity}} |
| Insurance premiums paid by the company (annual) | {{insurance_annual}} |
| Target variable pay (annual) | {{variable_annual}} |
| **Total annual CTC** | **{{ctc_annual}}** |

- Your take-home pay is your gross monthly pay minus the deductions the law requires, such as your own PF contribution, ESI (if you are covered), professional tax (in states that levy it) and income tax (TDS).
- Employer PF and ESI contributions are paid to the EPFO and ESIC for your benefit. They are not paid to you as salary.
- The gratuity provision of {{gratuity}} a month is not paid monthly. Gratuity is paid when you leave after five years of continuous service, or after one year on a fixed-term contract, as the Code on Social Security, 2020 provides.
