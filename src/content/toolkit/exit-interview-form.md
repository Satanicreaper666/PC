---
title: Exit interview form
description: A structured exit interview record with reasons for leaving, 13 ratings, open feedback and HR's follow-up actions. Fill it in during the conversation.
kind: form
stage: exit
audiences: [hr]
order: 40
code: PC-F-04
checked: 2026-11-02
useWhen: You are holding an exit interview with someone who is leaving and want a consistent record you can compare across leavers.
tips:
  - "Hold it in the last week, in private, and have someone other than the person's manager run it. People are more open with a neutral interviewer."
  - "Tell the leaver what the record is for, who will see it and that taking part is voluntary. Accept 'prefer not to say' without pushing."
  - "Record facts and the leaver's own words. Avoid comments on character in the HR section; under the data protection law, people will be able to ask what you hold about them."
  - "The value is in the pattern. Download each record as a CSV row and paste the rows into one sheet, then review reasons, regretted exits and where people go every quarter, and report back what you changed."
fields:
  - { id: company, label: Company name, required: true, group: Company and employee }
  - { id: e_name, label: Employee name, required: true, group: Company and employee }
  - { id: e_code, label: Employee code, group: Company and employee }
  - { id: e_designation, label: Designation, required: true, group: Company and employee }
  - { id: e_department, label: Department, required: true, group: Company and employee }
  - { id: e_manager, label: Reporting manager, required: true, group: Company and employee }
  - { id: e_doj, label: Date of joining, type: date, required: true, group: Company and employee }
  - { id: e_lwd, label: Last working day, type: date, required: true, group: Company and employee }
  - { id: interviewer, label: Interview held by, required: true, group: Interview }
  - { id: interview_date, label: Date of interview, type: date, required: true, group: Interview }
  - { id: mode, label: How it was held, type: select, group: Interview, options: ["In person", "Video call", "Phone"] }
  - { id: separation_type, label: Type of exit, type: select, required: true, group: Reasons for leaving, options: ["Resignation", "Retirement", "End of fixed-term contract", "Termination by the company", "Other"] }
  - { id: reason_primary, label: Main reason for leaving, type: select, required: true, group: Reasons for leaving, options: ["Better role or career move elsewhere", "Higher pay elsewhere", "Lack of growth or promotion", "Relationship with manager", "Workload or work-life balance", "Culture or values", "Role not as expected", "Lack of recognition", "Relocation", "Health or family reasons", "Higher studies", "Retirement", "Contract or project ended", "Restructuring", "Prefer not to say", "Other"] }
  - { id: reason_secondary, label: Other reason, type: select, group: Reasons for leaving, options: ["Better role or career move elsewhere", "Higher pay elsewhere", "Lack of growth or promotion", "Relationship with manager", "Workload or work-life balance", "Culture or values", "Role not as expected", "Lack of recognition", "Relocation", "Health or family reasons", "Higher studies", "Retirement", "Contract or project ended", "Restructuring", "Other"] }
  - { id: reason_detail, label: The reason in their words, type: textarea, required: true, group: Reasons for leaving, help: "Write 'Declined' if they preferred not to say." }
  - { id: destination, label: Where they are going, type: select, group: Reasons for leaving, options: ["A competitor in our industry", "A company in another industry", "A start-up", "Further studies", "Their own business or freelancing", "A career break", "Not known", "Prefer not to say"] }
  - { id: pay_jump, label: Pay increase in the new role, type: select, group: Reasons for leaving, options: ["Same or less", "Under 10%", "10% to 20%", "20% to 30%", "30% to 50%", "More than 50%", "Not known", "Prefer not to say"], help: "Only if they choose to share it." }
  - { id: r_role, label: "Rating: clarity of role", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_onboarding, label: "Rating: onboarding", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_manager, label: "Rating: support from manager", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_reviews, label: "Rating: fairness of performance reviews", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_growth, label: "Rating: learning and growth", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_recognition, label: "Rating: recognition", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_pay, label: "Rating: pay and benefits", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_balance, label: "Rating: workload and work-life balance", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_team, label: "Rating: team and colleagues", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_leadership, label: "Rating: senior leadership and communication", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_culture, label: "Rating: culture and values", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_tools, label: "Rating: tools and working environment", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: r_overall, label: "Rating: overall experience", type: select, required: true, group: Ratings (5 = very satisfied), options: ["5", "4", "3", "2", "1", "Prefer not to say"] }
  - { id: f_enjoyed, label: What did you enjoy most about working here, type: textarea, required: true, group: Open feedback, help: "Write 'Declined' if they preferred not to answer." }
  - { id: f_change, label: What should we change first, type: textarea, required: true, group: Open feedback }
  - { id: f_manager, label: How did your manager support your growth, type: textarea, required: true, group: Open feedback }
  - { id: f_stay, label: Could anything have changed your decision, type: textarea, required: true, group: Open feedback }
  - { id: f_other, label: Anything else they want to say, type: textarea, group: Open feedback }
  - { id: recommend, label: Would you recommend us as a place to work, type: select, required: true, group: Open feedback, options: ["Yes", "Maybe", "No", "Prefer not to say"] }
  - { id: rejoin, label: Would you consider coming back, type: select, required: true, group: Open feedback, options: ["Yes", "Maybe", "No", "Prefer not to say"] }
  - { id: regretted, label: Regretted or not, type: select, required: true, group: For HR, options: ["Regretted: we wanted to keep them", "Not regretted"], help: "Would the company have tried to keep this person? Agree it with the manager against set criteria, such as performance and critical skills, not after the interview." }
  - { id: preventable, label: Could we have prevented it, type: select, required: true, group: For HR, options: ["Preventable: something we control", "Not preventable: relocation, studies, health, retirement or similar", "Not sure"] }
  - { id: rehire, label: Eligible for rehire, type: select, required: true, group: For HR, options: ["Yes", "Yes, for some roles", "No"] }
  - { id: rehire_reason, label: If not, the job-related reason, type: textarea, group: For HR, help: "Facts only, such as a proven misconduct finding. No opinions about character." }
  - { id: hr_summary, label: Key themes from the interview, type: textarea, required: true, group: For HR }
  - { id: actions, label: Follow-up actions and owners, type: textarea, group: For HR, placeholder: "Share workload feedback with the team head (owner: HRBP, by 15 December)." }
related:
  - toolkit/exit-interview-questionnaire
  - toolkit/offboarding-checklist
  - toolkit/stay-interview-guide
  - toolkit/attrition-cost-calculator
  - handbooks/hr-professional/08-employee-experience
faq:
  - q: Who should conduct an exit interview?
    a: Someone neutral, usually an HR business partner, not the leaver's own manager. If the reason for leaving is the manager, the leaver is unlikely to say so to them.
  - q: Is an exit interview compulsory for the employee?
    a: No. Offer it, explain how the information will be used, and respect a refusal. It should never be a condition for releasing dues or letters.
  - q: What is regretted attrition?
    a: Leavers the company would have tried to keep, usually strong performers or people with critical skills. Decide it with the manager against agreed criteria before the interview, so the label doesn't depend on what the leaver says. Regretted attrition, not total attrition, is the number a board should watch.
  - q: What is the difference between this form and the exit interview questionnaire?
    a: This form is the interviewer's record of a face-to-face conversation, with HR's assessment. The questionnaire is filled in by the leaver alone, can be anonymous, and works well before the interview or after they have left.
keywords: [exit interview form, exit interview format, exit interview questions, employee exit interview template, exit feedback form]
---

**{{company}}**

## Exit interview record

Form PC-F-04. *Confidential. For HR use only.*

The employee was told what this record is for, who will see it, and that answering is voluntary.

### Employee and interview details

| Detail | Answer |
| --- | --- |
| Employee name | {{e_name}} |
| Employee code | {{e_code}} |
| Designation | {{e_designation}} |
| Department | {{e_department}} |
| Reporting manager | {{e_manager}} |
| Date of joining | {{e_doj}} |
| Last working day | {{e_lwd}} |
| Interview held by | {{interviewer}} |
| Date of interview | {{interview_date}} |
| How it was held | {{mode}} |

### A. Reasons for leaving

| Detail | Answer |
| --- | --- |
| Type of exit | {{separation_type}} |
| Main reason | {{reason_primary}} |
| Other reason | {{reason_secondary}} |
| Where they are going | {{destination}} |
| Pay increase in the new role | {{pay_jump}} |

**In their words**

{{reason_detail}}

### B. Ratings

5 = very satisfied, 4 = satisfied, 3 = neutral, 2 = dissatisfied, 1 = very dissatisfied.

| Area | Rating |
| --- | --- |
| Clarity of role and responsibilities | {{r_role}} |
| Onboarding | {{r_onboarding}} |
| Support from manager | {{r_manager}} |
| Fairness of performance reviews | {{r_reviews}} |
| Learning and growth | {{r_growth}} |
| Recognition | {{r_recognition}} |
| Pay and benefits | {{r_pay}} |
| Workload and work-life balance | {{r_balance}} |
| Team and colleagues | {{r_team}} |
| Senior leadership and communication | {{r_leadership}} |
| Culture and values | {{r_culture}} |
| Tools and working environment | {{r_tools}} |
| Overall experience | {{r_overall}} |

### C. Open feedback

**What did you enjoy most about working here?**

{{f_enjoyed}}

**What should we change first?**

{{f_change}}

**How did your manager support your growth?**

{{f_manager}}

**Could anything have changed your decision to leave?**

{{f_stay}}

**Anything else they wanted to say:** {{f_other}}

| Question | Answer |
| --- | --- |
| Would you recommend us as a place to work? | {{recommend}} |
| Would you consider coming back? | {{rejoin}} |

### D. For HR

| Detail | Answer |
| --- | --- |
| Regretted or not | {{regretted}} |
| Could we have prevented it | {{preventable}} |
| Eligible for rehire | {{rehire}} |
| Reason, if not eligible | {{rehire_reason}} |

**Key themes**

{{hr_summary}}

**Follow-up actions and owners:** {{actions}}

### Sign-off

Interviewer (name, signature and date): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

HR head (signature and date): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Keep this record confidential, share it only with people who need it, and keep it no longer than your retention policy allows.
