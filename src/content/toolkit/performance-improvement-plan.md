---
title: Performance improvement plan (PIP)
description: A fair, specific improvement plan that sets out the gaps with evidence, measurable goals, the support on offer, check-in dates, possible outcomes and the employee's view.
kind: form
stage: grow
audiences: [hr, founders, employees]
order: 20
checked: 2026-11-02
useWhen: Someone's performance has stayed below what the role needs despite clear feedback, and you want to give them a fair, structured chance to improve.
tips:
  - "Use a plan only after regular, specific feedback hasn't worked. No one should first hear about a problem through a PIP."
  - "Make each goal measurable and possible in the time given. 30 to 90 days is common, depending on how quickly results show in the role."
  - "Give the support you write down, hold every check-in and keep notes. A plan that isn't followed is unfair, and hard to defend later."
  - "Don't use a PIP to cover a decision that has already been made. If the role is going or the relationship has broken down, deal with that honestly and lawfully."
fields:
  - { id: company, label: Company name, group: Employee and dates }
  - { id: employee_name, label: "Employee's name", required: true, group: Employee and dates }
  - { id: employee_code, label: Employee code, group: Employee and dates }
  - { id: designation, label: Designation, required: true, group: Employee and dates }
  - { id: manager, label: Manager, required: true, group: Employee and dates }
  - { id: hr_contact, label: HR contact, required: true, group: Employee and dates }
  - { id: start_date, label: Plan starts on, type: date, required: true, group: Employee and dates }
  - { id: end_date, label: Final review on, type: date, required: true, group: Employee and dates }
  - { id: previous_feedback, label: "Feedback already given, with dates", type: textarea, required: true, placeholder: "12 Jan: missed deadlines discussed in our one-to-one. 9 Feb: written follow-up after the client escalation.", help: "If there is none, give clear feedback first and hold off on a plan.", group: Background }
  - { id: gap_1, label: "Area 1: the gap, with evidence", type: textarea, required: true, placeholder: "4 of the last 6 monthly reports were late, by 3 to 8 days.", group: Areas to improve }
  - { id: goal_1, label: "Area 1: what good looks like by the final review", type: textarea, required: true, placeholder: "Every monthly report submitted by the 5th working day.", group: Areas to improve }
  - { id: measure_1, label: "Area 1: how it will be measured", required: true, placeholder: "Submission dates in the reporting tracker", group: Areas to improve }
  - { id: gap_2, label: "Area 2: the gap, with evidence", type: textarea, group: Areas to improve }
  - { id: goal_2, label: "Area 2: what good looks like by the final review", type: textarea, group: Areas to improve }
  - { id: measure_2, label: "Area 2: how it will be measured", group: Areas to improve }
  - { id: gap_3, label: "Area 3: the gap, with evidence", type: textarea, group: Areas to improve }
  - { id: goal_3, label: "Area 3: what good looks like by the final review", type: textarea, group: Areas to improve }
  - { id: measure_3, label: "Area 3: how it will be measured", group: Areas to improve }
  - { id: support, label: Support the company will give, type: textarea, required: true, placeholder: "A 30-minute weekly coaching session with the manager; two weeks of pairing with a senior colleague; the internal Excel reporting course.", group: Support and check-ins }
  - { id: checkin_1, label: First check-in, type: date, required: true, group: Support and check-ins }
  - { id: checkin_2, label: Second check-in, type: date, group: Support and check-ins }
  - { id: checkin_3, label: Third check-in, type: date, group: Support and check-ins }
  - { id: employee_comments, label: "Employee's comments", type: textarea, help: "The employee writes this, in their own words, during or after the meeting.", group: "Employee's view" }
sources:
  - { title: "The Industrial Relations Code, 2020 (retrenchment, notice and compensation)", url: "https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf", publisher: India Code }
related: [toolkit/annual-performance-appraisal, toolkit/termination-letter, handbooks/hr-professional/09-performance-and-learning, handbooks/labour-law/06-termination-grievance-and-disputes]
faq:
  - q: Is a PIP required by law before dismissing someone in India?
    a: No law requires a PIP. But ending someone's employment for poor performance must still follow their appointment letter, company policy and labour law, which can require notice, pay or compensation. A fair, documented plan shows that you acted reasonably; take advice before you act.
  - q: How long should a performance improvement plan last?
    a: Long enough for real change to show, usually 30 to 90 days depending on the role. Set check-ins every two to four weeks so that progress, or the lack of it, is never a surprise at the end.
  - q: Can an employee refuse to sign a PIP?
    a: They can decline to sign, but that doesn't stop the plan. Note that it was given and discussed, and invite their written comments. Signing only confirms receipt, not agreement.
  - q: What should a PIP include?
    a: The gaps with evidence, measurable goals, the support the company will give, check-in dates, the possible outcomes and space for the employee's own comments.
keywords: [performance improvement plan template, pip format india, pip letter for employee, performance improvement plan example]
draft: false
---

{{company}}

## Performance improvement plan

Confidential

| Detail | Entry |
| --- | --- |
| Employee | {{employee_name}} |
| Employee code | {{employee_code}} |
| Designation | {{designation}} |
| Manager | {{manager}} |
| HR contact | {{hr_contact}} |
| Plan starts on | {{start_date}} |
| Final review on | {{end_date}} |

### 1. Why we are using this plan

Your performance in the areas below has been below what your role needs, and the feedback so far has not closed the gap. This plan sets out clearly what needs to change, how we will measure it and the support we will give you. We want you to succeed, and we will review progress with you regularly.

**Feedback already given:** {{previous_feedback}}

### 2. Areas to improve

| The gap, with evidence | What good looks like by the final review | How it will be measured |
| --- | --- | --- |
| {{gap_1}} | {{goal_1}} | {{measure_1}} |
| {{gap_2}} | {{goal_2}} | {{measure_2}} |
| {{gap_3}} | {{goal_3}} | {{measure_3}} |

### 3. Support we will give

{{support}}

If anything gets in the way of your progress, raise it at any time with your manager or with {{hr_contact}}.

### 4. Check-ins

We will meet on these dates to review progress against each goal. After each meeting, we will write down what was discussed and agreed, and give you a copy.

- {{checkin_1}}
- {{checkin_2}}
- {{checkin_3}}
- Final review: {{end_date}}

### 5. Possible outcomes

- **Goals met:** the plan closes, and we confirm this in writing.
- **Clear progress, but not all goals met:** we may extend the plan once, for a stated period, with written reasons.
- **Goals not met:** we will discuss the next steps with you. These may include a change of role or ending your employment, in line with your appointment letter, company policy and the law.

### 6. Your comments

{{employee_comments}}

You may add your comments here or send them in writing later. They will be kept with this plan.

### 7. Acknowledgement

Signing confirms that you have received this plan and discussed it with your manager. It does not mean you agree with it.

| Signed by | Signature | Date |
| --- | --- | --- |
| Employee: {{employee_name}} | | |
| Manager: {{manager}} | | |
| HR: {{hr_contact}} | | |
