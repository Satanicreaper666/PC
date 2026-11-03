---
title: Probation confirmation letter
description: Confirm an employee's employment after probation, with the date it takes effect, any change in notice period or terms, and an optional note from the review.
kind: letter
stage: onboard
audiences: [hr, founders, employees]
order: 40
checked: 2026-11-02
useWhen: An employee has completed probation and you have decided to confirm them; if you need more time, extend probation in a separate letter instead, as explained below.
tips:
  - "<strong>Decide on evidence, before probation ends.</strong> Base the decision on the goals set at joining and the feedback given along the way. The employee shouldn't hear about a concern for the first time at the final review."
  - "<strong>Check the terms.</strong> Read the probation, extension and notice clauses in the employee's <a href=\"/toolkit/appointment-letter/\">appointment letter</a> (the OSH Code requires one for every employee), your HR policy and any standing orders that apply. Restate in this letter anything that changes on confirmation, such as the notice period."
  - "<strong>If probation needs extending, write a different letter.</strong> Send it before probation ends, with the specific reasons, the new review date and the support you will give, such as weekly check-ins, training or a buddy. Extend only if the appointment letter, your policy or standing orders allow it, and for no longer than they allow."
  - "<strong>Update the records.</strong> Change the employee's status in HR and payroll records from the confirmation date, and start any benefits that begin on confirmation."
  - "<strong>Common mistakes:</strong> letting probation run past its end date with no decision, confirming late without saying from when, praise that isn't specific, and adding terms on confirmation that were never agreed, such as a longer notice period."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: designation, label: Designation, required: true, group: Employee }
  - { id: department, label: Department, group: Employee }
  - { id: doj, label: Date of joining, type: date, required: true, group: Confirmation }
  - { id: confirm_date, label: Confirmed from, type: date, required: true, group: Confirmation, help: "Usually the day after probation ends." }
  - { id: review_note, label: Reviewer's note, type: textarea, group: Confirmation, placeholder: "Your manager noted the vendor onboarding checklist you built, which cut supplier set-up time from ten days to four.", help: "Optional. One or two specific sentences from the probation review, written to the employee." }
  - { id: notice_after, label: Notice period after confirmation, group: Changes on confirmation, placeholder: "60 days", help: "Only if it changes on confirmation, as the appointment letter or policy provides." }
  - { id: terms_change, label: Other changes from the same date, type: textarea, group: Changes on confirmation, placeholder: "You are also eligible for the company's group term life insurance from the same date.", help: "Optional. Only changes already agreed or set by policy, written as full sentences." }
sources:
  - title: "The Occupational Safety, Health and Working Conditions Code, 2020 (appointment letter for every employee)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf
    publisher: India Code
  - title: "The Industrial Relations Code, 2020 (section 28, standing orders for industrial establishments with 300 or more workers)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
related:
  - toolkit/appointment-letter
  - toolkit/offer-letter
  - toolkit/onboarding-checklist
  - toolkit/performance-improvement-plan
  - handbooks/recruitment/08-onboarding-day-1-to-90
  - glossary/probation
  - glossary/confirmation
  - glossary/notice-period
faq:
  - q: Do I need to give a confirmation letter after probation?
    a: It is good practice whenever probation ends in confirmation. The letter records the date the employee became permanent and any change in terms, such as the notice period, and it avoids later arguments about whether they were confirmed.
  - q: Can probation be extended?
    a: Only if the appointment letter, your HR policy or any standing orders that apply allow it, and only for as long as they allow. Tell the employee in writing before probation ends, with the reasons, the new review date and the support you will give.
  - q: What happens if probation ends without a confirmation or an extension letter?
    a: It depends on the wording of the appointment letter and any standing orders that apply, and it can lead to disputes about the employee's status. Decide before probation ends and put the decision in writing.
  - q: Does the notice period change after confirmation?
    a: Only if the appointment letter or your policy says so, for example 30 days during probation and 60 days after confirmation. Restate the notice period in the confirmation letter so there is no doubt.
keywords: [probation confirmation letter, confirmation letter after probation, employee confirmation letter format, probation completion letter, confirmation of employment letter india]
draft: false
---

**{{company}}**

{{today}}

**To:** {{e_name}}, {{designation}}

Employee ID: {{e_id}}

Department: {{department}}

**Subject: Confirmation of your employment**

Dear {{e_name}},

Following your probation review, I am pleased to confirm your employment as {{designation}} from {{confirm_date}}.

**From your probation review:** {{review_note}}

From the same date, your notice period is {{notice_after}}.

{{terms_change}}

All other terms of your employment stay as set out in your appointment letter.

Thank you for your work since you joined us on {{doj}}. We look forward to working with you.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement**

I have received this letter.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
