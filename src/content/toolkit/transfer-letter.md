---
title: Transfer letter
description: Transfer an employee to another location, unit or team in writing, with the reason, the dates, the joining time, relocation support and any change in pay, under the transfer clause they agreed to.
kind: letter
stage: grow
audiences: [hr, founders, employees]
order: 32
checked: 2026-11-08
useWhen: You are moving an employee to another office, plant, state or team, and their appointment letter or your policy allows transfers.
tips:
  - "<strong>Check the transfer clause.</strong> Transfer only within what the appointment letter, policy or standing orders allow. Without a transfer clause, agree the move with the employee in writing."
  - "<strong>Give a genuine reason and fair notice.</strong> A transfer made to punish someone, or ordered without notice while a complaint they raised is pending, is easy to challenge. Allow joining time for a move to another city."
  - "<strong>Think about the person.</strong> Ask about health, a working spouse, children's schooling and elderly parents before deciding, and record what you considered. A transfer that looks reasonable on paper can still be unfair."
  - "<strong>Fix the payroll changes.</strong> A move to another state changes professional tax, labour welfare fund and the Shops and Establishments registration that covers the employee, and can change the ESI branch. The PF account stays the same within one company."
  - "<strong>A POSH complainant</strong> can ask the Internal Committee to transfer either person during an inquiry. Don't transfer a complainant against their wishes while a complaint is open."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: hr_contact, label: Who to contact about the move, required: true, group: Company, placeholder: "Anita Rao, HR Manager, anita.rao@yourcompany.in" }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: designation, label: Designation, required: true, group: Employee }
  - { id: from_place, label: Current location, unit or team, required: true, group: The transfer, placeholder: "the Peenya plant, Bengaluru" }
  - { id: to_place, label: New location, unit or team, required: true, group: The transfer, placeholder: "the Chakan plant, Pune" }
  - { id: clause, label: What allows the transfer, required: true, group: The transfer, placeholder: "clause 9 of your appointment letter" }
  - { id: reason, label: Why, in plain words, type: textarea, required: true, group: The transfer, placeholder: "The Chakan plant is starting a second shift in January and needs an experienced quality lead to set up the inspection process." }
  - { id: relieve_date, label: Relieved from the current place on, type: date, required: true, group: Dates }
  - { id: report_date, label: Report at the new place on, type: date, required: true, group: Dates, help: "Allow joining time for a move to another city." }
  - { id: report_to, label: Report to, required: true, group: Dates, placeholder: "Suresh Patil, Plant Head" }
  - { id: relocation, label: Relocation support, type: textarea, group: Support and pay, placeholder: "Travel for you and your family, paid by the company\nUp to 15 days' hotel stay while you find a home\nA one-time relocation allowance of ₹60,000, paid with your first salary in Pune", help: "One item per line. Leave empty for a move within the same city." }
  - { id: pay_change, label: Change in pay or allowances, type: textarea, group: Support and pay, placeholder: "Your city allowance changes from ₹4,000 to ₹3,000 a month from the date you report in Pune.", help: "Optional. Say if nothing changes by leaving it empty." }
sources:
  - title: "The Occupational Safety, Health and Working Conditions Code, 2020 (appointment letter for every employee)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf
    publisher: India Code
  - title: "The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (section 12, interim relief including transfer)"
    url: https://www.indiacode.nic.in/handle/123456789/2104
    publisher: India Code
related:
  - toolkit/appointment-letter
  - toolkit/professional-tax-calculator
  - toolkit/promotion-letter
  - handbooks/labour-law/08-state-specific-rules
faq:
  - q: Can an employer transfer an employee without consent?
    a: Yes, if the appointment letter, policy or standing orders allow transfers and the transfer is made in good faith for a business reason. Courts set aside transfers that are punitive, made in bad faith or against the terms of employment.
  - q: How much notice should a transfer letter give?
    a: Enough to arrange the move. Policy often sets joining time for a transfer to another city, such as 7 to 15 days, and relocation support. Give more for a family move in the middle of a school year if you can.
  - q: Does professional tax change when an employee is transferred to another state?
    a: Yes. Professional tax follows the state where the employee works, so payroll stops deducting the old state's tax and starts the new one's from the month of the move.
keywords: [transfer letter, employee transfer letter format, transfer order letter, inter-state transfer letter, job transfer letter india]
---

**{{company}}**
**Private and confidential**

{{today}}

**To:** {{e_name}}, {{designation}}

Employee ID: {{e_id}}

**Subject: Your transfer to {{to_place}}**

Dear {{e_name}},

As {{clause}} provides, we are transferring you from {{from_place}} to {{to_place}}.

**Why**

{{reason}}

**Dates**

You will be relieved from {{from_place}} on {{relieve_date}}, and you should report to {{report_to}} at {{to_place}} on {{report_date}}. Your designation and length of service continue without a break.

**Support with the move:** {{relocation}}

**Pay:** {{pay_change}}

All other terms of your employment stay as set out in your appointment letter and any later letters. If anything makes this move especially difficult for you or your family, please talk to {{hr_contact}} as soon as you can, before {{relieve_date}}, and we will consider it.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement**

I have received this letter.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
