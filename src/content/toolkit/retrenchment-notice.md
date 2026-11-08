---
title: Retrenchment notice to a worker
description: "Retrenchment notice for a 'worker' under the Industrial Relations Code: reasons, one month's notice or pay in lieu, compensation, the re-skilling fund and re-employment rights."
kind: letter
stage: exit
audiences: [hr, founders]
order: 36
checked: 2026-11-08
useWhen: You are retrenching a worker with at least a year's continuous service for business reasons, after following the selection and notice rules.
tips:
  - "<strong>Check who is a worker.</strong> Retrenchment rules protect 'workers': broadly everyone except managerial and administrative staff and supervisors above the wage limit. For others, follow the contract and a <a href=\"/toolkit/termination-letter/\">termination letter</a>."
  - "<strong>Select fairly.</strong> Within a category of workers, retrench the one employed last first (last in, first out), unless you record reasons for choosing someone else (section 71). Keep the seniority list and your reasons on file."
  - "<strong>Pay at the time of retrenchment.</strong> Section 70 requires one month's notice in writing with the reasons, or wages in lieu, and compensation of 15 days' average pay for every completed year (and part over six months), paid when the worker is retrenched. The <a href=\"/toolkit/full-and-final-settlement-calculator/\">full and final calculator</a> works it out, with the TDS and the settlement statement."
  - "<strong>Tell the government, and pay the re-skilling fund.</strong> Send notice of the retrenchment to the appropriate government as the rules require, and pay 15 days' last drawn wages for each retrenched worker into the worker re-skilling fund (section 83)."
  - "<strong>Large establishments need permission first.</strong> Factories, mines and plantations with 300 or more workers need the government's prior permission, and three months' notice or wages in lieu."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: ref_no, label: Reference number, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: hr_contact, label: Who to contact, required: true, group: Company, placeholder: "Anita Rao, HR Manager, anita.rao@yourcompany.in" }
  - { id: e_name, label: Worker's full name, required: true, group: Worker }
  - { id: e_designation, label: Designation, required: true, group: Worker }
  - { id: e_id, label: Employee ID, group: Worker }
  - { id: doj, label: Date of joining, type: date, required: true, group: Worker }
  - { id: reasons, label: Reasons for the retrenchment, type: textarea, required: true, group: Retrenchment, placeholder: "The packaging line at the Hosur unit is closing because our largest customer has moved its packaging in-house, and the line will have no work from 1 January 2027." }
  - { id: selection, label: How workers were selected, type: textarea, required: true, group: Retrenchment, placeholder: "Packing operators were selected in reverse order of joining (last in, first out), as section 71 of the Industrial Relations Code requires. The seniority list is on the notice board and available from HR." }
  - { id: notice_or_pay, label: Notice or wages in lieu, type: select, required: true, group: Retrenchment, options: ["one month's notice: your last working day is the date below", "wages for one month in lieu of notice: your last working day is the date below"] }
  - { id: lwd, label: Last working day, type: date, required: true, group: Retrenchment }
  - { id: compensation, label: Retrenchment compensation, type: money, required: true, group: Payments, help: "15 days' average pay for every completed year of service, and any part over six months." }
  - { id: lieu_amount, label: Wages in lieu of notice (if paid), type: money, group: Payments, help: "Leave empty if notice is being served." }
  - { id: other_dues, label: Other dues, type: textarea, group: Payments, placeholder: "Salary up to the last working day, leave encashment and gratuity, as shown in the attached settlement statement." }
  - { id: pay_date, label: Paid on, type: date, required: true, group: Payments, help: "Compensation and wages in lieu are paid at the time of retrenchment." }
sources:
  - title: "The Industrial Relations Code, 2020 (sections 70, 71, 72 and 83; Chapter X)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
  - title: "The Code on Wages, 2019 (section 17(2), wages within two working days)"
    url: https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf
    publisher: India Code
related:
  - toolkit/full-and-final-settlement-calculator
  - toolkit/crisis-communication-templates
  - toolkit/termination-letter
  - toolkit/relieving-letter
  - handbooks/labour-law/06-termination-grievance-and-disputes
faq:
  - q: What must be paid when a worker is retrenched?
    a: "One month's notice in writing with the reasons, or wages for that period in lieu, and compensation of {{fact:notice.retrenchmentCompensationDays}} for every completed year of continuous service and any part over six months, paid at the time of retrenchment (Industrial Relations Code, section 70). The employer also pays {{fact:notice.reskillingFundDays}} into the worker re-skilling fund for each retrenched worker."
  - q: Is last in, first out compulsory?
    a: Section 71 says the employer should ordinarily retrench the worker employed last within the category, unless it records reasons for retrenching someone else. Keep the seniority list and any recorded reasons.
  - q: Does a retrenched worker have a right to be rehired?
    a: Yes. If the employer hires again within a year of the retrenchment, it must give retrenched workers who are citizens of India the chance to come back, with preference over others (section 72).
keywords: [retrenchment notice format, retrenchment letter to worker, retrenchment compensation letter, layoff letter india, section 70 industrial relations code]
---

**{{company}}**
**Private and confidential**

Ref: {{ref_no}}

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

**Subject: Notice of retrenchment**

Dear {{e_name}},

I am very sorry to tell you that your employment, which began on {{doj}}, is to end by retrenchment. This is not because of anything you have done.

**The reasons**

{{reasons}}

**How workers were selected**

{{selection}}

**Notice and payments**

You are being given {{notice_or_pay}}: {{lwd}}.

On {{pay_date}} you will be paid retrenchment compensation of {{compensation}}, worked out at 15 days' average pay for every completed year of your service and any part of a year over six months, as section 70 of the Industrial Relations Code, 2020 requires.

Wages in lieu of notice: {{lieu_amount}}.

{{other_dues}}

The company is also paying 15 days of your last drawn wages into the worker re-skilling fund, as section 83 of the Code requires. The fund will credit it to you.

**Re-employment**

If we hire again for work like yours within one year, we will give you the chance to come back before we consider other candidates, as section 72 of the Code requires. Please keep {{hr_contact}} informed of your address and phone number.

Your relieving and experience letters will be issued on your last working day. If you have questions about this notice or your payments, please contact {{hr_contact}}. We will help however we can, including with references.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this notice.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
