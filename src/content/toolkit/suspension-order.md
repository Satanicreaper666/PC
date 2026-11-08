---
title: Suspension order pending inquiry
description: Suspend an employee while a misconduct inquiry runs, with the reason, what it means, the subsistence allowance the Industrial Relations Code requires and how long it should last.
kind: letter
stage: grow
audiences: [hr, founders]
order: 25.5
checked: 2026-11-08
useWhen: There is a serious misconduct charge and keeping the employee at work risks evidence, witnesses, people or property while the inquiry runs.
tips:
  - "<strong>Suspend only for a reason.</strong> Suspension pending inquiry isn't a penalty, but it is serious. Use it when there's a real risk to evidence, witnesses, people or property, and record that reason."
  - "<strong>Pay the subsistence allowance.</strong> Under section 38 of the Industrial Relations Code a suspended worker gets half their wages for the first 90 days, and three-quarters after that if the delay in finishing the inquiry isn't caused by them. Your standing orders or policy may give more."
  - "<strong>Finish within 90 days.</strong> The Code expects the inquiry to be completed ordinarily within 90 days of the suspension. Plan the inquiry dates when you suspend."
  - "<strong>Keep it confidential and practical.</strong> Tell only those who need to know. Say how the employee should stay in touch, whether they need permission to visit the premises, and who handles their access and equipment."
  - "<strong>End it in writing.</strong> When the inquiry ends, revoke the suspension in the final order. If the charges aren't proved, pay full wages for the period, less the allowance already paid."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: ref_no, label: Reference number, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: hr_contact, label: Contact during the suspension, required: true, group: Company, placeholder: "Anita Rao, HR Manager, anita.rao@yourcompany.in, 98450 00000" }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_designation, label: Designation, required: true, group: Employee }
  - { id: e_id, label: Employee ID, required: true, group: Employee }
  - { id: charge_ref, label: Charge-sheet reference and date, required: true, group: Suspension, placeholder: "PEE/HR/2026/114 of 18 October 2026" }
  - { id: suspension_from, label: Suspended from, type: date, required: true, group: Suspension }
  - { id: why_suspend, label: Why suspension is needed, type: textarea, required: true, group: Suspension, placeholder: "Two of the witnesses work on your shift, and the charges concern the safety of the press line." }
  - { id: allowance, label: Subsistence allowance, required: true, group: Suspension, default: "half of your wages for the first 90 days, and three-quarters of your wages after that if the inquiry takes longer for reasons not caused by you", help: "What your standing orders or policy provide, if more than the Code requires." }
  - { id: conditions, label: Conditions during suspension, type: textarea, group: Suspension, placeholder: "Please don't come to the plant without permission from HR, except to attend the inquiry.\nPlease return your access card and laptop to HR on the day you receive this order.\nPlease stay reachable at your registered address and phone number.", help: "One per line." }
sources:
  - title: "The Industrial Relations Code, 2020 (section 38, suspension pending inquiry and subsistence allowance)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
  - title: "Subsistence allowance on suspension: 50 per cent, then 75 per cent (IR Code section 38)"
    url: https://righttoinformation.wiki/subsistence-allowance-suspension-inquiry-ir-code-section-38
    publisher: RTI Wiki
related:
  - toolkit/charge-sheet
  - toolkit/inquiry-notice
  - toolkit/penalty-order
  - toolkit/disciplinary-process-guide
  - toolkit/show-cause-notice
faq:
  - q: How much subsistence allowance must be paid during suspension?
    a: Under section 38 of the Industrial Relations Code, a worker suspended pending inquiry gets 50% of the wages they earned just before the suspension for the first 90 days, and 75% after that if the delay in completing the inquiry isn't caused by the worker. Standing orders or policy may give more.
  - q: How long can an employee be suspended pending inquiry?
    a: The Code expects the inquiry to be completed ordinarily within 90 days of the suspension. A longer suspension raises the allowance and invites a challenge, so plan the inquiry to finish within that time.
  - q: Is suspension pending inquiry a punishment?
    a: No. It keeps the employee away from work while the facts are found. A suspension as a penalty, after a finding of misconduct, is different and must be among the penalties your standing orders allow.
keywords: [suspension order format, suspension letter pending inquiry, subsistence allowance during suspension, suspension letter to employee india]
---

**{{company}}**
**Private and confidential**

Ref: {{ref_no}}

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

**Subject: Suspension pending inquiry**

Dear {{e_name}},

This refers to the charge-sheet {{charge_ref}}. While the inquiry into those charges takes place, you are suspended from {{suspension_from}}.

**Why**

{{why_suspend}}

**What suspension means**

Suspension is not a penalty, and it does not mean that any decision has been made about the charges. You remain an employee of {{company}} during the suspension.

**Subsistence allowance**

During the suspension you will be paid a subsistence allowance of {{allowance}}, as section 38 of the Industrial Relations Code, 2020 requires. If the charges are not proved, you will be paid your full wages for the period of suspension, less the allowance already paid.

We intend to complete the inquiry within 90 days of your suspension.

**During the suspension:** {{conditions}}

Please contact {{hr_contact}} with any questions.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this order.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
