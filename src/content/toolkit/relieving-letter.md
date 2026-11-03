---
title: Relieving letter
description: A relieving letter confirming that an employee's resignation was accepted and they are released from duty, with the final settlement status. Download as Word or PDF.
kind: letter
stage: exit
audiences: [hr, founders, employees]
order: 50
checked: 2026-11-02
useWhen: An employee who resigned is leaving and needs written proof that they have been released from their duties, usually for their next employer.
tips:
  - "Issue it on the last working day, or as soon as possible after. New employers often ask for it before the person can join."
  - "Don't make it conditional on things that are disputed. If property is still due, say so in a separate letter and keep this one factual."
  - "Make sure the last working day matches payroll, PF exit records and the experience letter."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: designation, label: Designation, required: true, group: Employee }
  - { id: resignation_date, label: Date of resignation, type: date, required: true, group: Dates }
  - { id: lwd, label: Last working day, type: date, required: true, group: Dates }
  - { id: ff_status, label: Final settlement status, type: select, required: true, group: Final settlement, options: ["has been paid", "is being processed, and you will receive a statement with the payment"] }
  - { id: ff_date, label: Date the final settlement was or will be paid, type: date, group: Final settlement }
  - { id: clearance, label: Handover and company property, type: select, group: Final settlement, options: ["You have completed your handover and returned all company property.", "Your handover is complete. We have written to you separately about company property still to be returned."] }
  - { id: hr_contact, label: HR contact after exit, group: Final settlement, placeholder: "hr@yourcompany.in" }
related:
  - toolkit/experience-letter
  - toolkit/offboarding-checklist
  - toolkit/resignation-letter
  - toolkit/full-and-final-settlement-calculator
  - glossary/full-and-final-settlement
faq:
  - q: When should a relieving letter be issued?
    a: On the last working day or soon after. The next employer usually needs it, so a delay can hold up someone's joining.
  - q: Can I get a relieving letter if I didn't serve my full notice period?
    a: That depends on your contract and what you agree with your employer, such as an early release or a notice buy-out. Get the agreement in writing, and ask for the relieving letter to reflect the agreed last working day.
  - q: Is the relieving letter the same as the final settlement?
    a: No. The relieving letter confirms you have been released from your duties. The final settlement is the payment of your dues. The Code on Wages requires wages within two working days of a resignation, commonly read as two working days after the last working day (there is no official clarification yet), and gratuity, if due, within 30 days.
keywords: [relieving letter format, relieving letter after resignation, relieving letter sample, relieving order, release letter from company]
---

**{{company}}**

{{today}}

**To:** {{e_name}}, {{designation}}

Employee ID: {{e_id}}

**Subject: Relieving letter**

Dear {{e_name}},

This refers to your resignation dated {{resignation_date}}. Your resignation has been accepted, and you are relieved of your duties with {{company}} from the close of business on {{lwd}}.

Your full and final settlement {{ff_status}}.

Date of payment: {{ff_date}}

{{clearance}}

Please remember that your duty to keep the company's confidential information private continues after you leave, as set out in your employment contract.

If you need anything from us after you leave, please contact {{hr_contact}}.

Thank you for your contribution to {{company}}. We wish you every success in the future.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}
