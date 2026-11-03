---
title: Interview evaluation form
description: A structured scorecard for one interviewer. Rate the role's competencies on evidence, note strengths and concerns, and give a clear, reasoned recommendation.
kind: form
stage: recruit
audiences: [hr, founders]
order: 10
code: PC-F-03
checked: 2026-11-02
useWhen: You are interviewing a candidate and want every interviewer to score the same competencies, on evidence, before the panel discusses.
tips:
  - "Agree the competencies, the questions and what a score of 3 looks like <strong>before</strong> the first interview, using the job description. Ask every candidate the same core questions."
  - "Each interviewer fills in their own form and scores it <strong>before</strong> the panel meets, so the first or loudest opinion doesn't set everyone's score."
  - "Write down what the candidate said or did, not impressions such as 'good fit'. Leave out age, marital status, family plans, religion, caste and anything else that has nothing to do with the job."
  - "Keep pay out of this form. Salary expectations belong to the offer stage, after the hiring decision."
fields:
  - { id: company, label: Company name, group: Interview details }
  - { id: candidate_name, label: "Candidate's name", required: true, group: Interview details }
  - { id: role, label: Role applied for, required: true, group: Interview details }
  - { id: department, label: Department, group: Interview details }
  - { id: interview_date, label: Date of interview, type: date, required: true, group: Interview details }
  - { id: interview_round, label: Round, type: select, options: [Screening, Functional or technical, Hiring manager, Panel, Final], group: Interview details }
  - { id: interview_mode, label: Format, type: select, options: [In person, Video, Phone], group: Interview details }
  - { id: interviewer, label: Your name and role, required: true, placeholder: "Asha Rao, Finance Manager", group: Interview details }
  - { id: comp_1, label: Competency 1, default: Role knowledge and skills, help: "Use 4 or 5 competencies from the job description. Edit the names to fit the role.", group: Competency scores }
  - { id: score_1, label: Score 1, type: select, required: true, help: "5 exceptional, 4 strong, 3 meets what the role needs, 2 partly meets, 1 does not meet.", options: ["5", "4", "3", "2", "1", "Not assessed"], group: Competency scores }
  - { id: evidence_1, label: Evidence 1, type: textarea, placeholder: "What did the candidate say or do? Note specific examples.", group: Competency scores }
  - { id: comp_2, label: Competency 2, default: Problem solving, group: Competency scores }
  - { id: score_2, label: Score 2, type: select, required: true, options: ["5", "4", "3", "2", "1", "Not assessed"], group: Competency scores }
  - { id: evidence_2, label: Evidence 2, type: textarea, group: Competency scores }
  - { id: comp_3, label: Competency 3, default: Communication, group: Competency scores }
  - { id: score_3, label: Score 3, type: select, required: true, options: ["5", "4", "3", "2", "1", "Not assessed"], group: Competency scores }
  - { id: evidence_3, label: Evidence 3, type: textarea, group: Competency scores }
  - { id: comp_4, label: Competency 4, default: Working with others, group: Competency scores }
  - { id: score_4, label: Score 4, type: select, required: true, options: ["5", "4", "3", "2", "1", "Not assessed"], group: Competency scores }
  - { id: evidence_4, label: Evidence 4, type: textarea, group: Competency scores }
  - { id: comp_5, label: Competency 5, default: Ownership and follow-through, help: "Clear this name if you only need four.", group: Competency scores }
  - { id: score_5, label: Score 5, type: select, options: ["5", "4", "3", "2", "1", "Not assessed"], group: Competency scores }
  - { id: evidence_5, label: Evidence 5, type: textarea, group: Competency scores }
  - { id: strengths, label: Main strengths for this role, type: textarea, required: true, group: Summary }
  - { id: concerns, label: Gaps or concerns, type: textarea, required: true, help: "Write 'None' if you have none.", group: Summary }
  - { id: candidate_questions, label: Questions the candidate asked, type: textarea, group: Summary }
  - { id: overall, label: Overall score, type: select, required: true, options: ["5 – Exceptional", "4 – Strong", "3 – Meets what the role needs", "2 – Partly meets", "1 – Does not meet"], help: "Your judgement across the whole interview, not an average of the scores above.", group: Summary }
  - { id: recommendation, label: Recommendation, type: select, required: true, options: [Strongly recommend, Recommend, Do not recommend, "Unsure: need more evidence"], group: Summary }
  - { id: reasons, label: Reasons for your recommendation, type: textarea, required: true, group: Summary }
  - { id: next_step, label: Suggested next step, type: select, options: [Move to the next round, Move to offer, Consider for another role, Close the application], group: Summary }
related: [handbooks/recruitment/05-structured-interviews, handbooks/recruitment/04-screening-and-shortlisting, toolkit/reference-check-report, toolkit/offer-letter]
faq:
  - q: What should an interview evaluation form include?
    a: The role's competencies, a defined rating scale, evidence for each score, an overall recommendation with reasons, and the interviewer's name, signature and date. It should not ask for personal details that have nothing to do with the job.
  - q: Should interviewers discuss a candidate before scoring?
    a: No. Each interviewer should score on their own first and then discuss. Talking first lets one view anchor everyone's scores and hides real disagreement.
  - q: What rating scale should interviewers use?
    a: A 5-point scale where each point has a clear meaning. Anchor the middle point on what the role needs, so a 3 means "meets the role's needs" and the panel can see at a glance where a candidate is above or below that.
keywords: [interview evaluation form, interview scorecard template, interview feedback form india, candidate evaluation form, structured interview rating scale]
draft: false
---

{{company}}

## Interview evaluation

Form PC-F-03 · Confidential: for the hiring panel and HR only

| Detail | Entry |
| --- | --- |
| Candidate | {{candidate_name}} |
| Role applied for | {{role}} |
| Department | {{department}} |
| Date of interview | {{interview_date}} |
| Round | {{interview_round}} |
| Format | {{interview_mode}} |
| Interviewer | {{interviewer}} |

### Competency scores

Score each competency only on what you saw and heard in this interview: 5 exceptional, 4 strong, 3 meets what the role needs, 2 partly meets, 1 does not meet. Choose "Not assessed" if you didn't cover it.

| Competency | Score | Evidence: what the candidate said or did |
| --- | --- | --- |
| {{comp_1}} | {{score_1}} | {{evidence_1}} |
| {{comp_2}} | {{score_2}} | {{evidence_2}} |
| {{comp_3}} | {{score_3}} | {{evidence_3}} |
| {{comp_4}} | {{score_4}} | {{evidence_4}} |
| {{comp_5}} | {{score_5}} | {{evidence_5}} |

### Summary

**Main strengths for this role:** {{strengths}}

**Gaps or concerns:** {{concerns}}

**Questions the candidate asked:** {{candidate_questions}}

**Overall score:** {{overall}}

**Recommendation:** {{recommendation}}

**Reasons:** {{reasons}}

**Suggested next step:** {{next_step}}

| Interviewer | Signature | Date |
| --- | --- | --- |
| {{interviewer}} | | |
