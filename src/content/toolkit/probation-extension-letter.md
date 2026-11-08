---
title: Probation extension letter
description: Extend an employee's probation fairly, with the specific reasons, the goals for the extra time, the support you will give and the new review date, sent before probation ends.
kind: letter
stage: onboard
audiences: [hr, founders, employees]
order: 41
checked: 2026-11-08
useWhen: Probation is about to end, you can't yet confirm the employee, and their appointment letter, your policy or standing orders allow an extension.
tips:
  - "<strong>Check that you can extend.</strong> Extend only if the <a href=\"/toolkit/appointment-letter/\">appointment letter</a>, your HR policy or the standing orders that apply allow it, and for no longer than they allow. Name the clause in the letter."
  - "<strong>Send it before probation ends.</strong> An extension sent after the end date invites a dispute about whether the employee was already confirmed."
  - "<strong>Be specific.</strong> Give two or three concrete reasons, with examples, and goals the employee can meet in the time. 'Needs to improve' is not a reason."
  - "<strong>Give real support.</strong> Name the check-ins, training or buddy you will provide, and hold the reviews you promise. Record each review in writing."
  - "<strong>If you confirm them later,</strong> use the <a href=\"/toolkit/probation-confirmation-letter/\">probation confirmation letter</a>, from the day after the extended probation ends."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: hr_contact, label: Who to contact with questions, required: true, group: Company, placeholder: "Anita Rao, HR Manager, anita.rao@yourcompany.in" }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: designation, label: Designation, required: true, group: Employee }
  - { id: manager, label: Reporting manager, required: true, group: Employee }
  - { id: doj, label: Date of joining, type: date, required: true, group: Employee }
  - { id: probation_end, label: Probation was due to end on, type: date, required: true, group: The extension }
  - { id: extended_to, label: Probation extended to, type: date, required: true, group: The extension }
  - { id: allowed_by, label: What allows the extension, required: true, group: The extension, placeholder: "clause 4 of your appointment letter", help: "Written to follow 'as … allows'." }
  - { id: review_date, label: Date of the probation review, type: date, required: true, group: The extension }
  - { id: reasons, label: Why probation is being extended, type: textarea, required: true, group: Reasons and goals, placeholder: "Two of the three monthly vendor reconciliations had errors that Finance had to correct (August and September).\nCustomer escalations were not logged in the CRM within the agreed 24 hours.", help: "Specific facts, one per line, already discussed with the employee." }
  - { id: goals, label: What we need to see by the new date, type: textarea, required: true, group: Reasons and goals, placeholder: "Vendor reconciliations for November and December completed without errors, by the 5th working day.\nEvery escalation logged in the CRM within 24 hours.", help: "One measurable goal per line." }
  - { id: support, label: Support we will give, type: textarea, required: true, group: Reasons and goals, placeholder: "A weekly 30-minute check-in with your manager.\nA half-day session on the reconciliation process with the Finance team.", help: "One item per line." }
  - { id: check_ins, label: Interim review dates, required: true, group: Reasons and goals, placeholder: "15 December 2026 and 15 January 2027" }
sources:
  - title: "The Occupational Safety, Health and Working Conditions Code, 2020 (appointment letter for every employee)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf
    publisher: India Code
  - title: "The Industrial Relations Code, 2020 (standing orders for industrial establishments with 300 or more workers)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
related:
  - toolkit/probation-confirmation-letter
  - toolkit/appointment-letter
  - toolkit/performance-improvement-plan
  - handbooks/recruitment/08-onboarding-day-1-to-90
  - glossary/probation
faq:
  - q: How long can probation be extended?
    a: As long as the appointment letter, your HR policy or the standing orders that apply allow, and no longer. Many employers allow one extension of up to three months. Extending again and again weakens your position if the decision is later challenged.
  - q: Do we need the employee's agreement to extend probation?
    a: Not if the appointment letter or policy already allows an extension; then you give notice of it in writing. If nothing provides for it, agree the extension with the employee in writing.
  - q: What if the employee doesn't meet the goals in the extended period?
    a: Review the evidence with them, hear their side, and decide in writing. If you decide not to confirm, follow the appointment letter's terms for ending employment during probation, and pay what is due on time.
keywords: [probation extension letter, extension of probation period letter, probation extension letter format india, letter for extending probation]
---

**{{company}}**
**Private and confidential**

{{today}}

**To:** {{e_name}}, {{designation}}

Employee ID: {{e_id}}

**Subject: Extension of your probation**

Dear {{e_name}},

You joined us on {{doj}}, and your probation was due to end on {{probation_end}}. We reviewed your probation with you on {{review_date}}. We are not yet able to confirm your employment, and we are extending your probation to {{extended_to}}, as {{allowed_by}} allows.

**Why we are extending it**

{{reasons}}

**What we need to see by {{extended_to}}**

{{goals}}

**How we will support you**

{{support}}

{{manager}} will review your progress with you on {{check_ins}}, and we will give you a written note after each review.

If you meet these goals, we will confirm your employment from the day after your extended probation ends. If you do not, we will discuss the reasons with you and hear your side before we decide, and we may decide not to confirm your employment.

All other terms of your employment stay as set out in your appointment letter. If you have questions about this letter, please contact {{hr_contact}}.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement**

I have received this letter.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
