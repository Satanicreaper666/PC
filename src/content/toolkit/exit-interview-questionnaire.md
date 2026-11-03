---
title: Exit interview questionnaire
description: A written exit questionnaire leavers fill in on their own, with optional anonymity, 10 rated statements and open questions. Send it as Word or PDF, or fill it in here.
kind: form
stage: exit
audiences: [hr, employees]
order: 45
checked: 2026-11-02
useWhen: You want honest written feedback from people who are leaving, before or instead of a face-to-face exit interview, or a leaver wants to give feedback in writing.
tips:
  - "This is a form rather than a scored survey on purpose. The most useful answers are the reasons and the open comments, and a form keeps them together in one document the leaver can send back."
  - "Send it a few days before the last working day, and say who will read it. Answers are often franker when someone outside the leaver's team collects them."
  - "Make the name optional and mean it. Never use handwriting, timing or other clues to work out who wrote an anonymous form."
  - "Put each completed form's ratings into a simple spreadsheet. With 10 or more leavers, patterns by team or manager start to show."
fields:
  - { id: company, label: Company name, required: true, group: Before you send it }
  - { id: return_to, label: Who to return it to, group: Before you send it, placeholder: "Meera in HR, or hr@yourcompany.in" }
  - { id: name, label: Name, group: About the leaver (all optional), help: "Leave blank to answer anonymously." }
  - { id: department, label: Department, group: About the leaver (all optional), help: "Leave blank if it would identify the person." }
  - { id: tenure, label: Time with the company, type: select, group: About the leaver (all optional), options: ["Less than 1 year", "1 to 2 years", "3 to 5 years", "More than 5 years"] }
  - { id: reason, label: Main reason for leaving, type: select, required: true, group: Leaving, options: ["Better opportunity elsewhere", "Pay", "Career growth", "Work-life balance", "My manager", "Culture", "Relocation", "Personal or family reasons", "Higher studies", "Prefer not to say", "Other"] }
  - { id: reason2, label: Any other reason, type: select, group: Leaving, options: ["Better opportunity elsewhere", "Pay", "Career growth", "Work-life balance", "My manager", "Culture", "Relocation", "Personal or family reasons", "Higher studies", "Other"] }
  - { id: considered, label: How long they had been thinking about leaving, type: select, group: Leaving, options: ["Less than a month", "1 to 3 months", "3 to 6 months", "More than 6 months"] }
  - { id: trigger, label: Was there a moment that made them decide, type: textarea, group: Leaving }
  - { id: q_role, label: "My role matched what I was told when I joined", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_support, label: "I had the training and support I needed", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_growth, label: "I had real chances to grow here", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_recognition, label: "My work was recognised", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_manager, label: "I had a good working relationship with my manager", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_feedback, label: "My manager gave me regular, useful feedback", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_team, label: "My team worked well together", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_values, label: "The company's values were practised, not just stated", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_pay, label: "My pay was fair for my work and the market", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: q_workload, label: "My workload was manageable", type: select, required: true, group: Ratings, options: ["Strongly agree", "Agree", "Neither agree nor disagree", "Disagree", "Strongly disagree", "Prefer not to say"] }
  - { id: come_back, label: Would they consider coming back one day, type: select, group: Open questions, options: ["Yes", "Maybe", "No"] }
  - { id: o_well, label: What did we do well, type: textarea, group: Open questions }
  - { id: o_improve, label: What should we improve first, type: textarea, group: Open questions }
  - { id: o_advice, label: Advice for the person who takes over the role, type: textarea, group: Open questions }
  - { id: o_other, label: Anything else, type: textarea, group: Open questions }
related:
  - toolkit/exit-interview-form
  - toolkit/offboarding-checklist
  - toolkit/stay-interview-guide
  - toolkit/engagement-pulse-survey
  - handbooks/hr-professional/08-employee-experience
faq:
  - q: Should exit questionnaires be anonymous?
    a: Offer anonymity and let the leaver choose. Anonymous answers tend to be franker, but named answers let you follow up. Either way, report themes, not individual answers.
  - q: What is the difference between an exit interview and an exit questionnaire?
    a: An exit interview is a conversation, recorded by the interviewer (use the PC-F-04 exit interview form). A questionnaire is filled in by the leaver alone. Many employers use both, with the questionnaire first so the conversation can go deeper.
  - q: What questions should an exit questionnaire ask?
    a: Why they are leaving and when they started thinking about it, how they rate their role, growth, manager, team, pay and workload, and what the company should keep and change. Keep it short enough to finish in 10 minutes.
keywords: [exit interview questionnaire, exit survey questions, exit questionnaire template, employee exit survey, anonymous exit survey]
---

**{{company}}**

## Exit questionnaire

Thank you for taking a few minutes to tell us about your time here. This questionnaire is voluntary. Your answers are used only to improve how we work, and we report them as themes, never as individual answers. You don't have to give your name, and you can choose "prefer not to say" for any question.

Please return it to {{return_to}}.

### About you (optional)

You can leave any of these blank.

**Name**

{{name}}

**Department**

{{department}}

**Time with the company**

{{tenure}}

### Leaving

**What is your main reason for leaving?**

{{reason}}

**Was there another reason?**

{{reason2}}

**How long had you been thinking about leaving?**

{{considered}}

**Was there a moment that made you decide?**

{{trigger}}

### How you saw your time here

For each statement, answer strongly agree, agree, neither agree nor disagree, disagree, strongly disagree, or prefer not to say.

| Statement | Your answer |
| --- | --- |
| My role matched what I was told when I joined | {{q_role}} |
| I had the training and support I needed | {{q_support}} |
| I had real chances to grow here | {{q_growth}} |
| My work was recognised | {{q_recognition}} |
| I had a good working relationship with my manager | {{q_manager}} |
| My manager gave me regular, useful feedback | {{q_feedback}} |
| My team worked well together | {{q_team}} |
| The company's values were practised, not just stated | {{q_values}} |
| My pay was fair for my work and the market | {{q_pay}} |
| My workload was manageable | {{q_workload}} |

### In your own words

**Would you consider coming back one day?**

{{come_back}}

**What did we do well?**

{{o_well}}

**What should we improve first?**

{{o_improve}}

**What advice would you give the person who takes over your role?**

{{o_advice}}

**Is there anything else you would like to tell us?**

{{o_other}}

Thank you. We wish you every success in what comes next.
