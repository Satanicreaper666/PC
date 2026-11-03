---
title: Termination letter
description: A fair, factual termination letter that records the reason and the process followed, notice or pay in lieu, final dues, return of property and how to appeal.
kind: letter
stage: exit
audiences: [hr, founders]
order: 25
checked: 2026-11-02
useWhen: You have already followed a fair process, such as an improvement plan or a disciplinary inquiry, and need to confirm in writing that someone's employment is ending.
tips:
  - "The letter records a decision; it can't fix a weak process. For misconduct, there should be a written charge, an inquiry and a chance to respond. For performance, a documented improvement plan with real support."
  - "Check which notice rules apply: the contract, any standing orders, your state's Shops and Establishments Act and, for a 'worker' with a year's service whose job ends for a reason other than disciplinary action, the IR Code's retrenchment conditions."
  - "Keep the reason to facts and the standard that wasn't met. Avoid words that judge character, such as 'dishonest' or 'incompetent', unless an inquiry has made that finding."
  - "Give the letter in a private meeting, with HR present, and email a copy the same day. Never deliver it in front of colleagues."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: hr_contact, label: HR contact for questions, required: true, group: Company, placeholder: "Anita Rao, HR, anita.rao@yourcompany.in" }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_designation, label: Designation, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: e_department, label: Department, group: Employee }
  - { id: lwd, label: Last working day, type: date, required: true, group: Decision }
  - { id: reason_type, label: Type of termination, type: select, required: true, group: Decision, options: ["Performance did not improve after an improvement plan", "Misconduct found proved at a disciplinary inquiry", "Role no longer needed (redundancy)", "End of probation without confirmation", "Other"] }
  - { id: process, label: The process followed, type: textarea, required: true, group: Decision, placeholder: "a performance improvement plan from 1 July to 30 September 2026, with review meetings on 31 July, 31 August and 30 September", help: "Written to follow 'We reached this decision after…'. Give dates and steps." }
  - { id: reason_detail, label: The reason, in facts, type: textarea, required: true, group: Decision, placeholder: "The plan set three targets: closing 95% of tickets within two days, zero repeat escalations and completing the product certification. At the final review, ticket closure was 71% and the certification had not been completed.", help: "Two or three factual sentences. No opinions about character." }
  - { id: notice_text, label: How notice is handled, type: select, required: true, group: Notice and dues, options: ["You will work your notice period, and your last working day is the date above.", "You do not need to work your notice period. We will pay you wages in lieu of notice, as set out below.", "Your employment ends on the date above as a disciplinary penalty following the inquiry."] }
  - { id: notice_pay, label: Pay in lieu of notice, type: money, group: Notice and dues }
  - { id: retrench_comp, label: Retrenchment compensation, type: money, group: Notice and dues, help: "For a 'worker' with at least a year's service whose job ends for a non-disciplinary reason: 15 days' average pay for each completed year of service (a part-year over six months counts as a year)." }
  - { id: leave_days, label: Unused earned leave to be paid (days), type: number, group: Notice and dues }
  - { id: gratuity, label: Gratuity, type: money, group: Notice and dues, help: "Only if eligible: usually after five years' continuous service." }
  - { id: insurance_until, label: Health insurance continues until, type: date, group: Support }
  - { id: support, label: Other support offered, type: textarea, group: Support, placeholder: "Three months of outplacement support, and access to our employee assistance programme until 31 March 2027." }
  - { id: assets, label: Company property to return, type: textarea, group: Support, placeholder: "Laptop (asset tag LAP-0342), ID card and access card" }
  - { id: appeal_to, label: Appeal to (name or role), group: Appeal }
  - { id: appeal_days, label: Days allowed to appeal, type: number, group: Appeal, default: "7" }
sources:
  - title: The Code on Wages, 2019 (section 17(2), wages within two working days)
    url: https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf
    publisher: India Code
  - title: The Industrial Relations Code, 2020 (sections 2(zh), 2(zr) and 70, retrenchment)
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
  - title: The Code on Social Security, 2020 (gratuity)
    url: https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf
    publisher: India Code
  - title: Model Standing Orders, 2026
    url: https://www.taxheal.com/model-standing-orders-2026.html
    publisher: Taxheal (reproduction of S.O. 2312(E))
  - title: Karnataka Shops and Commercial Establishments Act, 1961 (section 39)
    url: https://prsindia.org/files/bills_acts/acts_states/karnataka/1962/1962KA8.pdf
    publisher: PRS Legislative Research
  - title: "Two working days: Code on Wages and the employee's final settlement"
    url: https://www.livelaw.in/articles/two-working-days-code-wages-employee-final-settlement-552780
    publisher: LiveLaw
related:
  - handbooks/labour-law/06-termination-grievance-and-disputes
  - toolkit/performance-improvement-plan
  - toolkit/full-and-final-settlement-calculator
  - toolkit/offboarding-checklist
  - toolkit/relieving-letter
  - glossary/full-and-final-settlement
faq:
  - q: What notice must an employer give to terminate employment in India?
    a: Mostly what the contract says. On top of that, a 'worker' with at least a year's continuous service who is retrenched must get one month's written notice with reasons, or wages in lieu (IR Code section 70); standing orders, where they apply, require one month for permanent workers; and some state Shops and Establishments Acts require notice too, such as one month in Karnataka for employees with six months' service, except for misconduct proved at an inquiry (where that Act still applies after its 2026 amendment).
  - q: Is termination for poor performance treated as retrenchment?
    a: It can be. For a 'worker', the IR Code treats any termination as retrenchment unless it is a disciplinary punishment or falls in a listed exception, such as retirement, the end of a fixed term or continued ill-health. If so, retrenchment conditions apply, including notice, compensation and notice to the government. Take advice before ending a worker's job for performance.
  - q: When must final dues be paid after termination?
    a: Wages must be paid within two working days of the removal or dismissal (Code on Wages section 17(2)). Gratuity, if due, must be paid within 30 days of it becoming payable.
  - q: Should a termination letter state the reason?
    a: Yes, briefly and factually. A retrenchment notice must state the reasons, and a clear, accurate reason helps if the decision is challenged. Leave out opinions and anything you can't support with records.
keywords: [termination letter, termination letter format india, employment termination letter, termination letter for poor performance, dismissal letter]
---

**{{company}}**
**Private and confidential**

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

Department: {{e_department}}

**Subject: Termination of your employment**

Dear {{e_name}},

This letter confirms our decision to end your employment with {{company}}. Your last working day will be {{lwd}}.

**Reason:** {{reason_type}}.

We reached this decision after {{process}}.

{{reason_detail}}

{{notice_text}}

**What you will receive**

- Your salary up to and including your last working day
- Pay in lieu of notice: {{notice_pay}}
- Retrenchment compensation: {{retrench_comp}}
- Payment for {{leave_days}} days of unused earned leave
- Gratuity of {{gratuity}}, which we will pay within 30 days of it becoming payable
- Any approved reimbursements you have claimed

We will pay your final wages within two working days of your last working day, and send you a statement showing how each amount was worked out.

Your group health insurance continues until {{insurance_until}}.

{{support}}

**Company property**

Please return the following by your last working day: {{assets}}

We will issue your relieving letter and experience letter on or soon after your last working day.

**Confidentiality**

Your duty to keep the company's confidential information private continues after you leave, as set out in your employment contract.

**Questions and appeal**

If you have any questions about this letter or your final settlement, please contact {{hr_contact}}.

If you wish to appeal against this decision, please write to {{appeal_to}} within {{appeal_days}} days of receiving this letter.

We thank you for your work with us and wish you well for the future.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this letter. Signing confirms receipt only; it does not mean I agree with its contents.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
