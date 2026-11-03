---
title: Appointment letter
description: An appointment letter that covers the particulars the OSH Code's rules require, plus probation, hours, pay, leave, notice and confidentiality. Fill it in on joining.
kind: letter
stage: recruit
audiences: [hr, founders, employees]
order: 50
checked: 2026-11-02
useWhen: A new employee is joining, or someone already working for you never received one, and you need to give them their terms in writing.
tips:
  - "Every employee must get an appointment letter under the OSH Code. Part A follows the format in the OSH (Central) Rules, 2026. If your state's rules prescribe a different format, use that one."
  - "Record the Aadhaar number only if the employee agrees; the rules ask for consent. \"Not given\" is a complete answer."
  - "Notice periods come from the contract, not from a general law. Check that what you write matches your policy, any standing orders that apply and your state's shops and establishments law."
  - "Give the letter when the person joins, keep a signed copy and give one to the employee. Anyone who joined earlier without one should get one now."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: company_address, label: Company address, type: textarea, group: Company }
  - { id: lin, label: Labour Identification Number (LIN) of the establishment, required: true, help: "As issued when the establishment registered. If your state's rules use a registration number instead, enter that.", group: Company }
  - { id: ref_no, label: Reference number, group: Company }
  - { id: signatory_name, label: Signed by (name), required: true, group: Company }
  - { id: signatory_role, label: "Signatory's designation", required: true, group: Company }
  - { id: employee_name, label: "Employee's full name", required: true, group: Employee }
  - { id: employee_address, label: "Employee's address", type: textarea, group: Employee }
  - { id: dob, label: Date of birth, type: date, required: true, group: Employee }
  - { id: parent_name, label: "Father's or mother's name", required: true, group: Employee }
  - { id: aadhaar, label: Aadhaar number, default: Not given, help: "Replace 'Not given' with the number only if the employee agrees to it being recorded.", group: Employee }
  - { id: uan_esi, label: UAN (PF) and/or ESI insurance number, default: Not yet allotted, help: "Enter the numbers if the employee already has them from a previous job.", group: Employee }
  - { id: designation, label: Designation, required: true, group: Role }
  - { id: employment_type, label: Type of employment, type: select, required: true, options: [Regular, Fixed-term, Contractual], group: Role }
  - { id: fixed_term_end, label: Fixed-term end date, type: date, help: "Only for fixed-term employment. Adds a clause on equal treatment and gratuity.", group: Role }
  - { id: skill, label: Category of skill, type: select, required: true, options: [Unskilled, Semi-skilled, Skilled, Highly skilled], help: "The skill category used for minimum wages.", group: Role }
  - { id: joining_date, label: Date of joining, type: date, required: true, group: Role }
  - { id: location, label: Place of work, required: true, placeholder: "Koramangala office, Bengaluru", group: Role }
  - { id: reporting_to, label: Reporting to, placeholder: "Name and designation", group: Role }
  - { id: duties, label: Broad nature of duties, type: textarea, required: true, placeholder: "Manages accounts payable, monthly vendor reconciliations and GST input records for the finance team.", group: Role }
  - { id: basic_da, label: Basic pay and dearness allowance (monthly), type: money, required: true, group: Pay and benefits }
  - { id: allowances, label: "Other allowances, including accommodation", required: true, placeholder: "HRA ₹16,000 a month; special allowance ₹9,000 a month", help: "Write 'None' if there are none.", group: Pay and benefits }
  - { id: gross_monthly, label: Gross monthly wages, type: money, required: true, group: Pay and benefits }
  - { id: ctc_annual, label: Annual CTC, type: money, group: Pay and benefits }
  - { id: pay_day, label: When wages are paid, required: true, default: "on or before the 7th day of the following month", group: Pay and benefits }
  - { id: pf, label: PF (EPF), type: select, required: true, options: [Applies from the date of joining, Does not apply], help: "PF covers establishments with 20 or more employees. Someone earning above the PF wage ceiling when they join may be excluded, but can join with the company's consent.", group: Pay and benefits }
  - { id: esi, label: ESI, type: select, required: true, options: [Applies from the date of joining, Does not apply], help: "ESI covers employees earning up to the ESI wage limit in covered establishments.", group: Pay and benefits }
  - { id: leave_summary, label: Leave in brief, placeholder: "18 days' annual leave and 12 days' sick or casual leave a year", group: Pay and benefits }
  - { id: probation, label: Probation period, placeholder: "6 months", group: Terms }
  - { id: hours, label: Working hours and weekly off, required: true, placeholder: "9:30 am to 6:30 pm, Monday to Friday, with a one-hour lunch break", group: Terms }
  - { id: notice, label: Notice period, required: true, placeholder: "30 days during probation and 60 days after confirmation", group: Terms }
  - { id: other_info, label: Any other information, default: None, group: Terms }
sources:
  - { title: "The Occupational Safety, Health and Working Conditions Code, 2020, section 6(1)(f)", url: "https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf", publisher: India Code }
  - { title: "Occupational Safety, Health and Working Conditions (Central) Rules, 2026, rule 6 and format (G.S.R. 345(E), 8 May 2026)", url: "https://prsindia.org/files/bills_acts/bills_parliament/2026/Occupational_Safety_Rules,%202026.pdf", publisher: PRS Legislative Research }
  - { title: "Review of the Occupational Safety, Health and Working Conditions (Central) Rules, 2026", url: "https://prsindia.org/files/bills_acts/bills_parliament/2026/Review_Occupational_Safety_Rules_2026.pdf", publisher: PRS Legislative Research }
  - { title: "The Code on Social Security, 2020 (gratuity, maternity benefit)", url: "https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf", publisher: India Code }
  - { title: "The Industrial Relations Code, 2020, section 2(o) (fixed-term employment)", url: "https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf", publisher: India Code }
  - { title: "The Code on Wages, 2019, section 17 (time of payment)", url: "https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf", publisher: India Code }
  - { title: "Top 10 FAQs on fixed term employment", url: "https://www.lkslaw.com/insights/articles/top-10-faqs-on-fixed-term-employment-fte", publisher: "Lakshmikumaran & Sridharan" }
related: [toolkit/offer-letter, toolkit/employee-joining-form, toolkit/onboarding-checklist, handbooks/labour-law/05-contracts-and-fixed-term-employment, handbooks/labour-law/01-the-four-labour-codes]
faq:
  - q: Is an appointment letter mandatory in India?
    a: Yes, in establishments covered by the OSH Code, which generally means those with ten or more workers. Every employee must be given a letter of appointment, and people already employed when the Code came into force on 21 November 2025 were to receive one within three months.
  - q: What must an appointment letter contain under the Labour Codes?
    a: The OSH (Central) Rules, 2026 prescribe a format with the employee's name, date of birth and parent's name, Aadhaar (only with consent), the establishment's Labour Identification Number, UAN or ESI number, designation, type of employment, skill category, date of joining, wages and allowances, PF and ESI applicability, broad duties and, for women employees, maternity benefits. State rules may prescribe their own format.
  - q: Can I refuse to give my Aadhaar number for the appointment letter?
    a: Yes. The OSH (Central) Rules, 2026 ask for the Aadhaar number to be recorded in the letter only after the employee's consent.
  - q: Do fixed-term employees get the same benefits as permanent staff?
    a: Yes. Under the Industrial Relations Code, 2020, a fixed-term employee gets the same hours, wages, allowances and benefits as a permanent worker doing the same or similar work, and gratuity after one year of service under the contract.
keywords: [appointment letter format india, appointment letter under labour codes, appointment letter format osh code, employment letter template]
draft: false
---

**{{company}}**

{{company_address}}

Ref: {{ref_no}}

{{today}}

{{employee_name}}

{{employee_address}}

**Subject: Letter of appointment**

Dear {{employee_name}},

We are pleased to appoint you as {{designation}} at {{company}}, with effect from {{joining_date}}, on the terms in this letter. Part A sets out the particulars the law requires. Part B sets out your other terms of employment.

### Part A: Particulars of employment

| No. | Particular | Details |
| --- | --- | --- |
| 1 | Name of employee | {{employee_name}} |
| 2 | Date of birth | {{dob}} |
| 3 | Father's or mother's name | {{parent_name}} |
| 4 | Aadhaar number (recorded only with consent) | {{aadhaar}} |
| 5 | Labour Identification Number of the establishment | {{lin}} |
| 6 | UAN (PF) and/or ESI insurance number | {{uan_esi}} |
| 7 | Designation | {{designation}} |
| 8 | Type of employment | {{employment_type}} |
| 9 | Category of skill | {{skill}} |
| 10 | Date of joining | {{joining_date}} |
| 11 | Wages: basic pay and dearness allowance (monthly) | {{basic_da}} |
| 12 | Other allowances, including accommodation | {{allowances}} |
| 13 | Social security | PF: {{pf}}. ESI: {{esi}}. |
| 14 | Broad nature of duties | {{duties}} |
| 15 | Maternity benefit for women employees | See Part B, clause 7 |
| 16 | Any other information | {{other_info}} |

### Part B: Terms of employment

**1. Place of work.** You will work at {{location}}. If the business needs you to work from another location, we will discuss it with you and give you reasonable notice.

You will report to {{reporting_to}}.

**2. Probation.** You will be on probation for {{probation}} from your date of joining. Before it ends, we will review your work with you and either confirm your employment in writing or tell you in writing why we are extending probation and for how long.

**Fixed-term employment.** This is fixed-term employment ending on {{fixed_term_end}}. You will receive the same working hours, wages, allowances and other benefits as permanent employees doing the same or similar work, and you will be eligible for gratuity if you complete one year of service under this contract.

**3. Working hours.** Your working hours are {{hours}}. Any overtime, where the law provides for it, needs your consent and is paid at twice your ordinary rate of wages.

**4. Pay.** Your gross monthly wages are {{gross_monthly}}, paid {{pay_day}} into your bank account, after the deductions the law requires, such as PF, ESI, professional tax and income tax. You will receive a payslip each month.

Your annual cost to company (CTC) is {{ctc_annual}}.

**5. Leave and holidays.** You are entitled to leave and paid holidays under the company's leave policy, which gives at least what the law at your place of work requires.

In brief: {{leave_summary}}.

**6. Social security.** PF and ESI apply to you as shown in Part A, item 13. You will be eligible for gratuity as the Code on Social Security, 2020 provides: generally after five years of continuous service, or after one year for fixed-term employees.

**7. Maternity benefit.** Women employees are entitled to maternity benefit under Chapter VI of the Code on Social Security, 2020. This includes up to 26 weeks of paid leave for those who have worked at least 80 days in the 12 months before the expected delivery (12 weeks for a woman who already has two or more surviving children, and for adopting and commissioning mothers), and nursing breaks until the child is 15 months old. Our maternity policy has the details.

**8. Ending employment.** Either you or the company may end your employment by giving notice in writing: {{notice}}. The company may pay wages instead of all or part of the notice period, and will also give any notice, pay or compensation the law requires. Employment may be ended without notice for serious misconduct proved after a fair inquiry, in line with our disciplinary policy and any standing orders that apply.

**9. Conduct and policies.** You agree to follow the company's code of conduct and policies, including the policy on preventing sexual harassment at work. We will tell you about any important change to them.

**10. Confidentiality.** During and after your employment, you must keep the company's confidential information private and use it only for your work. When you leave, you must return all company property and information.

**11. Your personal data.** We use your personal data only for purposes connected with your employment, such as pay, tax, social security, benefits and meeting the law. We keep it secure, share it only with people and service providers who need it for those purposes or where the law requires, and keep it only as long as needed. You can ask to see or correct it at any time.

**12. Other terms.** If this letter and your offer letter differ, this letter applies. Any change to these terms will be made in writing.

Please sign and return a copy of this letter to confirm that you have received and accepted it.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
for {{company}}

---

### Employee's acceptance

I have read and accept the terms of this letter, and I have received a copy.

| Name | Signature | Date |
| --- | --- | --- |
| {{employee_name}} | | |
