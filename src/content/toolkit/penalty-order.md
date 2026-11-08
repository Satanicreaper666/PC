---
title: Disciplinary penalty order
description: The final order after a domestic inquiry, recording the findings, the employee's comments, the penalty chosen and why it is proportionate, and the right to appeal.
kind: letter
stage: grow
audiences: [hr, founders]
order: 27.5
checked: 2026-11-08
useWhen: The inquiry report has been shared with the employee, you have considered their comments, and the disciplinary authority is ready to decide.
tips:
  - "<strong>Decide only on what was proved.</strong> Penalise only the charges the inquiry found proved. If none were proved, close the case in writing and pay any wages held back during suspension."
  - "<strong>Make it proportionate.</strong> Weigh how serious the proved act was, the harm caused, the employee's past record and length of service, any admission or remorse, and what you did in similar cases. Write those reasons into the order; a tribunal can reduce a penalty that is out of proportion."
  - "<strong>Use only penalties your rules allow.</strong> Standing orders or policy list them: for example warning or censure, a fine within the Code on Wages limits, withholding an increment, suspension for a short period, demotion, discharge or dismissal."
  - "<strong>Dismissal or discharge</strong> ends the employment: pay the final wages within two working days of the last day, and gratuity and leave encashment as the law requires (gratuity can be forfeited only in the cases the Code allows, by a reasoned order). The <a href=\"/toolkit/full-and-final-settlement-calculator/\">full and final calculator</a> works out the settlement."
  - "<strong>Offer an appeal</strong> to someone senior who wasn't involved, with a time limit."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: ref_no, label: Reference number, required: true, group: Company }
  - { id: signatory_name, label: Disciplinary authority, required: true, group: Company }
  - { id: signatory_role, label: Designation, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_designation, label: Designation, required: true, group: Employee }
  - { id: e_id, label: Employee ID, required: true, group: Employee }
  - { id: charge_ref, label: Charge-sheet reference and date, required: true, group: The case }
  - { id: report_date, label: Date of the inquiry report, type: date, required: true, group: The case }
  - { id: report_sent, label: Report sent to the employee on, type: date, required: true, group: The case }
  - { id: comments, label: The employee's comments on the report, type: textarea, required: true, group: The case, placeholder: "In your reply of 20 November 2026 you accepted the finding on charge 1, said the guard had been sticking for a week, and asked for a lenient view given your eleven years' service.", help: "Summarise them fairly, or write that none were received by the date given." }
  - { id: proved, label: What was proved, type: textarea, required: true, group: Decision, placeholder: "Charge 1 (operating the press with its guard removed) was proved. Charge 2 was not proved and plays no part in this decision." }
  - { id: penalty, label: The penalty, required: true, group: Decision, placeholder: "withholding of your next annual increment, due in April 2027, and a final written warning that stays on your record for 12 months" }
  - { id: effective, label: Takes effect from, type: date, required: true, group: Decision }
  - { id: reasons, label: Why this penalty is proportionate, type: textarea, required: true, group: Decision, placeholder: "Removing a machine guard put you and others at risk of serious injury. We have taken into account your eleven years' service with no earlier warnings, your admission of the facts, and the defect you reported. A lesser penalty would not reflect the risk; dismissal would be out of proportion." }
  - { id: suspension_end, label: Suspension ends (if suspended), type: date, group: Decision, help: "Optional. Say how the suspension period is treated in the next field." }
  - { id: suspension_pay, label: How the suspension period is treated, group: Decision, placeholder: "as suspension, with no wages beyond the subsistence allowance already paid" }
  - { id: appeal_to, label: Appeal to, required: true, group: Appeal, placeholder: "the Director, Operations, at director.ops@yourcompany.in" }
  - { id: appeal_days, label: Days allowed to appeal, type: number, required: true, default: "15", group: Appeal }
sources:
  - title: "The Industrial Relations Code, 2020 (standing orders; section 38, suspension)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
  - title: "The Code on Wages, 2019 (fines and deductions; section 17, payment on dismissal)"
    url: https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf
    publisher: India Code
  - title: "The Code on Social Security, 2020 (forfeiture of gratuity)"
    url: https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf
    publisher: India Code
related:
  - toolkit/inquiry-report
  - toolkit/warning-letter
  - toolkit/termination-letter
  - toolkit/full-and-final-settlement-calculator
  - toolkit/disciplinary-process-guide
faq:
  - q: What penalties can an employer impose for misconduct?
    a: Only those its standing orders or HR policy list, usually from warning or censure and withholding an increment up to demotion, discharge or dismissal. The penalty must fit what was proved and be consistent with similar cases.
  - q: Can a court change a penalty the employer imposed?
    a: Yes. Under the Industrial Relations Code a tribunal can set aside a discharge or dismissal and order reinstatement or a lesser penalty if it finds the punishment unjustified or disproportionate. A reasoned, proportionate order is the best protection.
keywords: [punishment order after domestic inquiry, penalty order misconduct, dismissal order after enquiry, final order disciplinary action india]
---

**{{company}}**
**Private and confidential**

Ref: {{ref_no}}

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

**Subject: Order on charge-sheet {{charge_ref}}**

Dear {{e_name}},

**The inquiry**

A domestic inquiry was held into the charges in charge-sheet {{charge_ref}}. The inquiry officer's report is dated {{report_date}}, and a copy was sent to you on {{report_sent}} so that you could comment on it before any decision.

**Your comments**

{{comments}}

**What was proved**

{{proved}}

**Decision**

Having considered the report, your comments and your record, I have decided on the following penalty: {{penalty}}, with effect from {{effective}}.

**Why**

{{reasons}}

**Suspension.** Your suspension ends on {{suspension_end}}, and the period of suspension will be treated {{suspension_pay}}.

**Appeal**

If you disagree with this order, you may appeal in writing to {{appeal_to}} within {{appeal_days}} days of receiving it. Your appeal will be decided by someone who was not involved in the inquiry or in this decision.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this order.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
