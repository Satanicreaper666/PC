---
title: Salary revision letter
description: Confirm an employee's new pay in writing, with the start date, a before-and-after table, the reason and, if it follows an appraisal, the rating. Download as Word or PDF.
kind: letter
stage: pay
audiences: [hr, founders]
order: 60
checked: 2026-11-02
useWhen: You have agreed a pay rise or a new salary structure for an employee and need to confirm it in writing before the revised payslip.
tips:
  - "Check the new structure before you send it. Under the Labour Codes, if pay items left out of 'wages' (such as HRA and conveyance) add up to more than half of total pay, the excess counts as wages for PF and gratuity."
  - "Make the effective date match payroll, and send the letter before the first payslip that shows the new figures."
  - "Give the reason in one or two specific sentences. Don't compare the employee with colleagues or promise future increases."
  - "If you include the appraisal rating, use the final rating, with its scale, that the employee has already discussed with their manager. The letter shouldn't be the first time they hear it."
  - "Send it to the employee only and keep a copy in their personnel file. Pay is personal data."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company, placeholder: "Priya Nair" }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company, placeholder: "Head of HR" }
  - { id: hr_contact, label: HR contact for questions, group: Company, placeholder: "hr@yourcompany.in" }
  - { id: employee_name, label: Employee's full name, required: true, group: Employee }
  - { id: employee_id, label: Employee ID, group: Employee }
  - { id: designation, label: Current designation, required: true, group: Employee }
  - { id: new_designation, label: New designation, group: Employee, help: "Only if the revision comes with a promotion." }
  - { id: effective_date, label: Revised salary applies from, type: date, required: true, group: Revision }
  - { id: old_fixed, label: Fixed pay before (a year), type: money, required: true, group: Revision, placeholder: "1200000" }
  - { id: new_fixed, label: Revised fixed pay (a year), type: money, required: true, group: Revision, placeholder: "1320000" }
  - { id: old_variable, label: Variable pay at target before (a year), type: money, group: Revision, help: "Leave both variable pay boxes empty if there is no variable pay." }
  - { id: new_variable, label: Revised variable pay at target (a year), type: money, group: Revision }
  - { id: old_ctc, label: Total CTC before (a year), type: money, required: true, group: Revision }
  - { id: new_ctc, label: Revised total CTC (a year), type: money, required: true, group: Revision }
  - { id: increase_pct, label: Increase in total CTC, group: Revision, placeholder: "10%" }
  - { id: rating, label: Performance rating, group: Message, placeholder: "4 on a 5-point scale (exceeds expectations) for 2025–26", help: "Optional. The final appraisal rating, with its scale and the review period. Leave it empty if this revision isn't linked to an appraisal." }
  - { id: reason, label: Why the salary is being revised, type: textarea, group: Message, placeholder: "This reflects your work leading the billing migration, which cut month-end closing time by three days.", help: "One or two specific sentences about the person's work." }
  - { id: variable_note, label: How variable pay is decided, type: textarea, group: Message, placeholder: "Variable pay depends on company and individual results and is paid once a year after the results are confirmed." }
  - { id: breakup_ref, label: Salary breakup attached as, group: Message, default: "Annexure A", help: "Clear this if you are not attaching a component-wise breakup." }
sources:
  - title: The Code on Wages, 2019 (section 2(y), definition of wages)
    url: https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf
    publisher: India Code
  - title: Labour Ministry FAQs on the Labour Codes
    url: https://www.scconline.com/blog/post/2026/01/03/labour-ministry-issued-faqs-on-the-labour-codes/
    publisher: SCC Online
related:
  - handbooks/labour-law/02-wages-and-pay
  - handbooks/tds/03-ctc-design-and-perquisites
  - toolkit/increment-budget-allocator
  - toolkit/take-home-salary-calculator
  - toolkit/salary-band-designer
  - toolkit/annual-performance-appraisal
  - glossary/ctc
  - glossary/appraisal
faq:
  - q: Does the employee need to sign a salary revision letter?
    a: No law requires a signature, but asking the employee to sign and return a copy gives you a record that they received and accepted the revised terms.
  - q: Should the increase be shown on CTC or on fixed pay?
    a: Either works if you say which. Many employers show the percentage on total CTC and list fixed and variable pay separately, so the employee can see what is guaranteed.
  - q: Can the appraisal rating go in the salary revision letter?
    a: Yes, if the revision follows an appraisal. Give the final rating with its scale, for example '4 on a 5-point scale', and make sure the employee has already discussed it with their manager. Leave the rating line empty if the revision isn't linked to an appraisal.
  - q: Can a salary revision letter reduce someone's pay?
    a: A reduction changes the terms of employment, so agree it with the employee in writing first and take advice. Pay can never fall below the applicable minimum wage.
keywords: [salary revision letter, increment letter format, salary increment letter india, appraisal letter with salary hike, appraisal letter with rating, revised ctc letter]
---

**{{company}}**
**Private and confidential**

{{today}}

**To:** {{employee_name}}, {{designation}}

Employee ID: {{employee_id}}

**Subject: Revision of your salary**

Dear {{employee_name}},

I am pleased to confirm your revised salary, which takes effect from {{effective_date}}.

In your performance review, your overall rating was {{rating}}.

{{reason}}

From the same date, your designation will be {{new_designation}}.

| Pay item (a year) | Before | Revised |
| --- | --- | --- |
| Fixed pay | {{old_fixed}} | {{new_fixed}} |
| Variable pay at target | {{old_variable}} | {{new_variable}} |
| **Total cost to company (CTC)** | **{{old_ctc}}** | **{{new_ctc}}** |

This is an increase of {{increase_pct}} in your total CTC.

{{variable_note}}

Your component-wise salary breakup is attached as {{breakup_ref}}.

Your payslip for the first month the new salary applies will show the revised figures. All other terms of your employment stay the same.

If you have any questions, please speak to your manager.

You can also write to {{hr_contact}}.

Thank you for your contribution. We look forward to the year ahead with you.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement**

I have received this letter and accept the revised terms.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
