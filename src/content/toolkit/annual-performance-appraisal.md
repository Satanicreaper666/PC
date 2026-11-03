---
title: Annual performance appraisal form
description: A fair annual review form with goals and evidence, competencies rated by employee and manager, development goals, an overall rating and room for the employee's comments.
kind: form
stage: grow
audiences: [hr, founders, employees]
order: 10
code: PC-F-08
checked: 2026-11-02
useWhen: The review period has ended and the manager and employee need to record performance, agree development goals and give an overall rating.
tips:
  - "Agree goals and how they will be measured at the <strong>start</strong> of the year. Nothing in this form should come as a surprise."
  - "Rate on evidence from the whole period, not just the last month. Short notes kept through the year make this much easier."
  - "Compare ratings across teams before sharing them, so that a 4 means the same thing in every team."
  - "Have the pay conversation separately, after ratings are settled. The <a href=\"/toolkit/increment-budget-allocator/\">increment budget allocator</a> helps plan the budget."
fields:
  - { id: company, label: Company name, group: Employee and review }
  - { id: employee_name, label: "Employee's name", required: true, group: Employee and review }
  - { id: employee_code, label: Employee code, group: Employee and review }
  - { id: designation, label: Designation, required: true, group: Employee and review }
  - { id: department, label: Department, group: Employee and review }
  - { id: manager, label: Reviewer (manager), required: true, group: Employee and review }
  - { id: review_period, label: Review period, required: true, placeholder: "1 April 2025 to 31 March 2026", group: Employee and review }
  - { id: review_date, label: Date of review meeting, type: date, required: true, group: Employee and review }
  - { id: goal_1, label: "Goal 1, measure and weight", required: true, placeholder: "Close the monthly books by the 5th working day (30%)", group: Goals }
  - { id: result_1, label: Goal 1 result and evidence, type: textarea, required: true, group: Goals }
  - { id: rating_1, label: Goal 1 rating, type: select, required: true, options: ["5", "4", "3", "2", "1"], help: "5 exceptional, 4 exceeds, 3 fully meets, 2 partly meets, 1 does not meet.", group: Goals }
  - { id: goal_2, label: "Goal 2, measure and weight", required: true, group: Goals }
  - { id: result_2, label: Goal 2 result and evidence, type: textarea, required: true, group: Goals }
  - { id: rating_2, label: Goal 2 rating, type: select, required: true, options: ["5", "4", "3", "2", "1"], group: Goals }
  - { id: goal_3, label: "Goal 3, measure and weight", required: true, group: Goals }
  - { id: result_3, label: Goal 3 result and evidence, type: textarea, required: true, group: Goals }
  - { id: rating_3, label: Goal 3 rating, type: select, required: true, options: ["5", "4", "3", "2", "1"], group: Goals }
  - { id: goal_4, label: "Goal 4, measure and weight", help: "Optional. Leave blank if there were only three goals.", group: Goals }
  - { id: result_4, label: Goal 4 result and evidence, type: textarea, group: Goals }
  - { id: rating_4, label: Goal 4 rating, type: select, options: ["5", "4", "3", "2", "1"], group: Goals }
  - { id: comp_1, label: Competency 1, default: Quality of work, help: "Edit the names to match your competency framework. Add 'Leading others' for people managers.", group: Competencies }
  - { id: self_1, label: Self rating 1, type: select, options: ["5", "4", "3", "2", "1"], help: "The employee's own rating. Same scale as the goals.", group: Competencies }
  - { id: mgr_1, label: Manager rating 1, type: select, required: true, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: example_1, label: Examples 1, type: textarea, group: Competencies }
  - { id: comp_2, label: Competency 2, default: Delivery and ownership, group: Competencies }
  - { id: self_2, label: Self rating 2, type: select, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: mgr_2, label: Manager rating 2, type: select, required: true, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: example_2, label: Examples 2, type: textarea, group: Competencies }
  - { id: comp_3, label: Competency 3, default: Teamwork, group: Competencies }
  - { id: self_3, label: Self rating 3, type: select, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: mgr_3, label: Manager rating 3, type: select, required: true, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: example_3, label: Examples 3, type: textarea, group: Competencies }
  - { id: comp_4, label: Competency 4, default: Communication, group: Competencies }
  - { id: self_4, label: Self rating 4, type: select, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: mgr_4, label: Manager rating 4, type: select, required: true, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: example_4, label: Examples 4, type: textarea, group: Competencies }
  - { id: comp_5, label: Competency 5, default: Problem solving, group: Competencies }
  - { id: self_5, label: Self rating 5, type: select, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: mgr_5, label: Manager rating 5, type: select, required: true, options: ["5", "4", "3", "2", "1"], group: Competencies }
  - { id: example_5, label: Examples 5, type: textarea, group: Competencies }
  - { id: learning_done, label: Learning completed this year, type: textarea, placeholder: "Courses, certifications, projects or mentoring", group: Development }
  - { id: dev_goal_1, label: Development goal 1 for next year, required: true, group: Development }
  - { id: dev_support_1, label: Support the company will give for goal 1, required: true, placeholder: "A mentor from the FP&A team; budget for one course", group: Development }
  - { id: dev_goal_2, label: Development goal 2 for next year, group: Development }
  - { id: dev_support_2, label: Support for goal 2, group: Development }
  - { id: self_summary, label: "Employee's self-assessment", type: textarea, placeholder: "What went well, what was hard, what you'd do differently", group: Overall }
  - { id: manager_summary, label: "Manager's summary", type: textarea, required: true, group: Overall }
  - { id: overall_rating, label: Overall rating, type: select, required: true, options: ["5 – Exceptional", "4 – Exceeds expectations", "3 – Fully meets expectations", "2 – Partly meets expectations", "1 – Does not meet expectations"], group: Overall }
  - { id: readiness, label: Ready for a bigger role?, type: select, options: [Not yet, Ready within a year, Ready now], group: Overall }
  - { id: employee_comments, label: "Employee's comments", type: textarea, help: "The employee writes this after the meeting, in their own words.", group: Overall }
related: [toolkit/performance-improvement-plan, toolkit/increment-budget-allocator, toolkit/nine-box-talent-mapper, toolkit/competency-self-assessment, handbooks/hr-professional/09-performance-and-learning]
faq:
  - q: How should a manager prepare for an appraisal meeting?
    a: Read the goals and the employee's self-assessment, collect examples from across the year, draft ratings with evidence and plan two or three development points. Leave most of the meeting for listening.
  - q: Should employees rate themselves in an appraisal?
    a: Yes. A self-rating gives the employee a voice and shows where the two views differ, which is where the conversation matters most.
  - q: Does an employee have to sign the appraisal form?
    a: Signing usually confirms that the meeting happened and the employee has seen the form, not that they agree. Give space for the employee's comments and keep them with the form.
keywords: [performance appraisal form, annual appraisal format india, performance review template, employee appraisal form with ratings]
draft: false
---

{{company}}

## Annual performance appraisal

Form PC-F-08 · Confidential

| Detail | Entry |
| --- | --- |
| Employee | {{employee_name}} |
| Employee code | {{employee_code}} |
| Designation | {{designation}} |
| Department | {{department}} |
| Reviewer (manager) | {{manager}} |
| Review period | {{review_period}} |
| Date of review meeting | {{review_date}} |

**Rating scale.** 5 exceptional: well above expectations all year. 4 exceeds expectations. 3 fully meets expectations: the solid standard we expect. 2 partly meets expectations. 1 does not meet expectations.

### A. Goals for the review period

| Goal, measure and weight | Result and evidence | Rating |
| --- | --- | --- |
| {{goal_1}} | {{result_1}} | {{rating_1}} |
| {{goal_2}} | {{result_2}} | {{rating_2}} |
| {{goal_3}} | {{result_3}} | {{rating_3}} |
| {{goal_4}} | {{result_4}} | {{rating_4}} |

### B. Competencies

| Competency | Ratings | Examples |
| --- | --- | --- |
| {{comp_1}} | Self {{self_1}}, manager {{mgr_1}} | {{example_1}} |
| {{comp_2}} | Self {{self_2}}, manager {{mgr_2}} | {{example_2}} |
| {{comp_3}} | Self {{self_3}}, manager {{mgr_3}} | {{example_3}} |
| {{comp_4}} | Self {{self_4}}, manager {{mgr_4}} | {{example_4}} |
| {{comp_5}} | Self {{self_5}}, manager {{mgr_5}} | {{example_5}} |

### C. Learning and development

**Learning completed this year:** {{learning_done}}

| Development goal for next year | Support the company will give |
| --- | --- |
| {{dev_goal_1}} | {{dev_support_1}} |
| {{dev_goal_2}} | {{dev_support_2}} |

### D. Overall

**Employee's self-assessment:** {{self_summary}}

**Manager's summary:** {{manager_summary}}

**Overall rating:** {{overall_rating}}

**Ready for a bigger role?** {{readiness}}

### E. Employee's comments

{{employee_comments}}

The employee may add comments here or attach them on a separate page. They are kept with this form.

Signing confirms that the review meeting took place and the employee has seen this form. It does not mean the employee agrees with every rating.

| Signed by | Signature | Date |
| --- | --- | --- |
| Employee: {{employee_name}} | | |
| Manager: {{manager}} | | |
| HR | | |
