---
title: Promotion letter
description: Confirm a promotion in writing with the new designation, grade, reporting line, pay from the effective date and any change in terms, so there is no doubt later about what changed.
kind: letter
stage: grow
audiences: [hr, founders, employees]
order: 31
checked: 2026-11-08
useWhen: An employee is moving to a bigger role or a higher grade and you need to confirm the new title, pay and terms in writing.
tips:
  - "<strong>Say what changes, and from when.</strong> Title, grade, manager, pay and any change in notice period or benefits, each with its date. If pay changes on a different date from the role, say so."
  - "<strong>Attach the new salary structure.</strong> Show the monthly breakdown so the employee can check the 50% wage rule, PF and take-home pay. The <a href=\"/toolkit/take-home-salary-calculator/\">take-home salary calculator</a> works it out."
  - "<strong>Check whether the employee stays a 'worker'.</strong> A move into a managerial or administrative role, or into supervision above the wage limit, takes someone outside the Labour Codes' definition of worker, which changes things such as overtime, leave payment deadlines and retrenchment compensation. Explain this in plain words if it applies."
  - "<strong>Be careful with 'probation in the new role'.</strong> If you set one, say what happens if it doesn't work out, for example a return to a role at the previous grade and pay. Make sure the appointment letter or policy allows it."
  - "<strong>Keep it consistent.</strong> Use the same promotion criteria and salary ranges for everyone at the same level, and check the decision with the <a href=\"/toolkit/pay-equity-analyzer/\">pay equity analyser</a>."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: current_designation, label: Current designation, required: true, group: Employee }
  - { id: new_designation, label: New designation, required: true, group: The promotion }
  - { id: new_grade, label: New grade or level, group: The promotion }
  - { id: effective_date, label: Promotion takes effect from, type: date, required: true, group: The promotion }
  - { id: reports_to, label: New reporting manager, required: true, group: The promotion }
  - { id: why, label: Why, in one or two sentences, type: textarea, group: The promotion, placeholder: "This recognises how you led the warehouse migration and have coached two new team leads over the past year." }
  - { id: responsibilities, label: Main new responsibilities, type: textarea, group: The promotion, placeholder: "Leading the inbound logistics team of 14\nOwning the monthly freight budget\nHiring for the team" }
  - { id: new_ctc, label: New annual CTC, type: money, required: true, group: Pay }
  - { id: pay_effective, label: New pay applies from, type: date, required: true, group: Pay, help: "Often the same as the promotion date." }
  - { id: variable, label: Variable pay or incentive, group: Pay, placeholder: "up to 15% of fixed pay, under the sales incentive plan", help: "Optional. Written to follow 'You are also eligible for…'." }
  - { id: other_changes, label: Other changes in terms, type: textarea, group: Pay, placeholder: "Your notice period becomes 60 days from the same date.", help: "Optional. Only changes already agreed or set by policy." }
sources:
  - title: "The Code on Wages, 2019 (section 2(y), wages and the 50% rule; section 3, no discrimination on the ground of gender)"
    url: https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf
    publisher: India Code
  - title: "The Occupational Safety, Health and Working Conditions Code, 2020 (definition of worker)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf
    publisher: India Code
related:
  - toolkit/salary-revision-letter
  - toolkit/increment-budget-allocator
  - toolkit/salary-band-designer
  - toolkit/take-home-salary-calculator
  - toolkit/annual-performance-appraisal
faq:
  - q: What should a promotion letter include?
    a: The new designation and grade, the date it takes effect, the new reporting manager, the new pay and when it applies, the salary breakdown, and any change in terms such as notice period or benefits. Say that all other terms stay as they are.
  - q: Can a promotion come with a probation period?
    a: Some employers set one for the new role. Say how long it is, how it will be judged, and what happens if it doesn't work out, such as a return to a role at the previous grade and pay. It must be allowed by the appointment letter or policy.
  - q: Does a promotion change the notice period?
    a: Only if the appointment letter, your policy or this letter says so. Many companies have longer notice periods at senior grades; state the new period clearly.
keywords: [promotion letter, promotion letter format india, employee promotion letter, promotion and salary increase letter, letter of promotion]
---

**{{company}}**
**Private and confidential**

{{today}}

**To:** {{e_name}}, {{current_designation}}

Employee ID: {{e_id}}

**Subject: Your promotion to {{new_designation}}**

Dear {{e_name}},

I am delighted to confirm your promotion to {{new_designation}} from {{effective_date}}.

Your new grade is {{new_grade}}.

{{why}}

From that date you will report to {{reports_to}}.

**Your main new responsibilities:** {{responsibilities}}

**Your pay**

Your annual cost to company (CTC) will be {{new_ctc}} from {{pay_effective}}. The attached annexure shows the monthly breakdown.

You are also eligible for {{variable}}.

{{other_changes}}

All other terms of your employment stay as set out in your appointment letter and any later letters.

Congratulations, and thank you for everything you have contributed. We look forward to working with you in your new role.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement**

I have received this letter and its annexure.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
