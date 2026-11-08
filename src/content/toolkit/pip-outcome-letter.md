---
title: Performance improvement plan outcome letter
description: Close a performance improvement plan in writing with one of three outcomes (goals met, plan extended, or goals not met with a meeting before any decision), fairly and with reasons.
kind: letter
stage: grow
audiences: [hr, founders, employees]
order: 29
checked: 2026-11-08
useWhen: A performance improvement plan has reached its end date and you have reviewed the evidence with the employee.
tips:
  - "<strong>Fill in one outcome.</strong> The letter has three paragraphs, one for each outcome. Fill in the fields for the outcome that applies and leave the others empty: their paragraphs disappear from the letter."
  - "<strong>Decide on the evidence in the plan.</strong> Judge only the goals and measures the <a href=\"/toolkit/performance-improvement-plan/\">plan</a> set, using the records from the check-ins. Don't add new goals at the end."
  - "<strong>Goals not met is not yet a decision.</strong> Meet the employee, hear their explanation and anything outside their control (workload, missing support, health), and only then decide. Write the decision and its reasons in a separate letter."
  - "<strong>Ending employment for poor performance</strong> needs the notice or pay in lieu the appointment letter sets and, for a 'worker', may count as retrenchment or need standing-order procedure. Take advice before deciding, and pay the settlement within two working days of the last day."
  - "<strong>Close a successful plan clearly.</strong> Say the plan is closed and that it won't be held against the employee in normal reviews."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: designation, label: Designation, required: true, group: Employee }
  - { id: pip_start, label: Plan started on, type: date, required: true, group: The plan }
  - { id: pip_end, label: Plan ended on, type: date, required: true, group: The plan }
  - { id: review_date, label: Final review meeting held on, type: date, required: true, group: The plan }
  - { id: summary, label: What the review found, type: textarea, required: true, group: The plan, placeholder: "Goal 1, error-free reconciliations: met in all three months.\nGoal 2, escalations logged within 24 hours: met for 41 of 43 escalations.", help: "One line per goal, with the evidence." }
  - { id: closed_on, label: "Outcome A, goals met: plan closed on", type: date, group: "Outcome A: goals met", help: "Fill in only for this outcome." }
  - { id: extended_to, label: "Outcome B, extended: new end date", type: date, group: "Outcome B: plan extended", help: "Fill in only for this outcome." }
  - { id: extend_reason, label: "Outcome B: why the plan is extended", type: textarea, group: "Outcome B: plan extended", placeholder: "You met the first goal, and the second improved steadily but is not yet at the agreed level. The system outage in week 4 also cost you a week." }
  - { id: meeting_date, label: "Outcome C, goals not met: meeting on", type: date, group: "Outcome C: goals not met", help: "Fill in only for this outcome. Give a few working days' notice." }
  - { id: companion, label: "Outcome C: who may come with the employee", group: "Outcome C: goals not met", placeholder: "a colleague of your choice" }
  - { id: hr_contact, label: Who to contact with questions, required: true, group: Contact, placeholder: "Anita Rao, HR Manager, anita.rao@yourcompany.in" }
sources:
  - title: "The Code on Wages, 2019 (section 17(2), wages within two working days of leaving)"
    url: https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf
    publisher: India Code
  - title: "The Industrial Relations Code, 2020 (retrenchment and standing orders)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
related:
  - toolkit/performance-improvement-plan
  - toolkit/annual-performance-appraisal
  - toolkit/termination-letter
  - handbooks/hr-professional/09-performance-and-learning
faq:
  - q: What happens at the end of a performance improvement plan?
    a: The manager and HR review the evidence against each goal with the employee. The plan then closes successfully, is extended once for a clear reason, or, if the goals weren't met, the employer meets the employee to hear them before deciding what to do.
  - q: Can a PIP be extended?
    a: Yes, once, when there is real progress or something outside the employee's control got in the way. Give the reason and a new end date in writing. Repeated extensions suggest the plan wasn't realistic.
  - q: Can an employee be dismissed after a failed PIP?
    a: Ending employment is possible, but not automatic. Hear the employee first, consider alternatives such as another role, and follow the appointment letter, standing orders and the Labour Codes. Take legal advice for a 'worker', for whom it can count as retrenchment.
keywords: [pip outcome letter, performance improvement plan completion letter, pip extension letter, pip closure letter, pip failed letter]
---

**{{company}}**
**Private and confidential**

{{today}}

**To:** {{e_name}}, {{designation}}

Employee ID: {{e_id}}

**Subject: Outcome of your performance improvement plan**

Dear {{e_name}},

Your performance improvement plan ran from {{pip_start}} to {{pip_end}}. We reviewed it with you on {{review_date}}. The review found:

{{summary}}

**Goals met.** You met the goals of the plan, and it closed on {{closed_on}}. Thank you for the effort you put in. The plan won't be held against you in your normal reviews, and your performance will be reviewed in the usual way from here.

**Plan extended to {{extended_to}}.** {{extend_reason}} The goals and support in the plan stay the same, and we will review progress with you at the same check-ins until the new end date.

**Goals not met: meeting on {{meeting_date}}.** The plan's goals were not met, as set out above. No decision has been made. Before we decide anything, we would like to meet you on {{meeting_date}} to hear your explanation and anything you would like us to consider, including support or a different role. You may bring {{companion}}. We will tell you our decision, and the reasons for it, in writing.

If you have questions about this letter, please contact {{hr_contact}}.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement**

I have received this letter.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
