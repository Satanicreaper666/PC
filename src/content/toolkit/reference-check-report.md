---
title: Reference check report
description: A consistent record for reference calls. Log the candidate's consent, confirm dates and role, ask for real examples, and note what each referee said.
kind: form
stage: recruit
audiences: [hr, founders]
order: 20
code: PC-F-05
checked: 2026-11-02
useWhen: A candidate has reached the final stage and you want to speak to people who have managed or worked closely with them.
tips:
  - "Get the candidate's written agreement first, and ask them to name the referees. Don't contact a current employer without the candidate's permission."
  - "Use one form per referee, then compare. Look for patterns across referees rather than relying on a single comment."
  - "Ask for examples. \"Tell me about a time she handled a difficult client\" tells you far more than \"Was she good?\""
  - "If a referee raises a concern, give the candidate a fair chance to respond before you decide anything."
fields:
  - { id: company, label: Company name, group: Candidate }
  - { id: candidate_name, label: "Candidate's name", required: true, group: Candidate }
  - { id: role, label: Role applied for, required: true, group: Candidate }
  - { id: consent_date, label: Date the candidate agreed to this check, type: date, required: true, help: "Keep their written agreement, such as an email, with this form.", group: Candidate }
  - { id: checked_by, label: Check carried out by, required: true, placeholder: "Your name and role", group: Candidate }
  - { id: check_date, label: Date of the call or reply, type: date, required: true, group: Candidate }
  - { id: referee_name, label: "Referee's name", required: true, group: Referee }
  - { id: referee_org, label: Organisation, required: true, group: Referee }
  - { id: referee_role, label: "Referee's role", group: Referee }
  - { id: relationship, label: Relationship to the candidate, type: select, required: true, options: [Was their manager, Senior colleague, Peer, Reported to them, Client or partner, Other], group: Referee }
  - { id: worked_together, label: When and how long they worked together, placeholder: "Apr 2022 to Mar 2025, same team", group: Referee }
  - { id: mode, label: How you spoke, type: select, options: [Phone, Video, Email, In person], group: Referee }
  - { id: dates_confirmed, label: Dates of employment, type: select, required: true, options: ["Match what the candidate told us", "Differ (see note)", "Referee couldn't confirm"], group: Facts confirmed }
  - { id: role_confirmed, label: Role and designation, type: select, required: true, options: ["Match what the candidate told us", "Differ (see note)", "Referee couldn't confirm"], group: Facts confirmed }
  - { id: facts_note, label: Note on any difference, type: textarea, group: Facts confirmed }
  - { id: main_work, label: What the candidate was responsible for, type: textarea, group: What the referee said }
  - { id: strengths, label: "Strengths, with an example", type: textarea, required: true, group: What the referee said }
  - { id: development, label: "Areas to develop, with an example", type: textarea, required: true, group: What the referee said }
  - { id: teamwork, label: How they worked with others, type: textarea, group: What the referee said }
  - { id: reason_left, label: "Reason for leaving, as the referee understands it", type: textarea, group: What the referee said }
  - { id: work_again, label: Would the referee work with them again?, type: select, required: true, options: ["Yes", "Yes, with reservations", "No", "Preferred not to say"], group: What the referee said }
  - { id: anything_else, label: Anything that would help them succeed here, type: textarea, group: What the referee said }
  - { id: conclusion, label: This reference, type: select, required: true, options: [Supports the hiring decision, Raises points to discuss with the candidate, Raises serious concerns], group: Your conclusion }
  - { id: conclusion_note, label: Your note, type: textarea, help: "Stick to facts the referee gave. Note anything you need to check with the candidate.", group: Your conclusion }
related: [toolkit/interview-evaluation-form, toolkit/offer-letter, handbooks/recruitment/06-offers-and-negotiation, handbooks/recruitment/05-structured-interviews]
faq:
  - q: Do I need a candidate's consent before calling their references?
    a: It is fair practice to get it, in writing, every time. Ask the candidate to name their referees and confirm you may contact them, and never contact a current employer without the candidate's permission.
  - q: What questions can I ask a referee?
    a: Ask about the candidate's role, responsibilities, strengths and development areas, with examples, and whether the referee would work with them again. Don't ask about health, family, religion, caste or other personal matters.
  - q: How many references should I check?
    a: Two is common, ideally including a recent manager. One reference should never decide the outcome on its own; look for patterns and check any concern with the candidate.
  - q: What should I say when I call a referee?
    a: "Introduce yourself, say that the candidate has applied for a role and named them as a referee with their agreement, and ask if now is a good time for a 10-minute call. Tell them their comments will be shared only with the hiring team."
keywords: [reference check form, reference check questions, employee reference check template india, reference check report format]
draft: false
---

{{company}}

## Reference check report

Form PC-F-05 · Confidential: for the hiring team and HR only

| Detail | Entry |
| --- | --- |
| Candidate | {{candidate_name}} |
| Role applied for | {{role}} |
| Candidate agreed to this check on | {{consent_date}} |
| Check carried out by | {{checked_by}} |
| Date of call or reply | {{check_date}} |

### Referee

| Detail | Entry |
| --- | --- |
| Name | {{referee_name}} |
| Organisation | {{referee_org}} |
| Referee's role | {{referee_role}} |
| Relationship to the candidate | {{relationship}} |
| Worked together | {{worked_together}} |
| How we spoke | {{mode}} |

### Facts confirmed

| Check | Result |
| --- | --- |
| Dates of employment | {{dates_confirmed}} |
| Role and designation | {{role_confirmed}} |

**Note on any difference:** {{facts_note}}

### What the referee said

**Main responsibilities:** {{main_work}}

**Strengths, with an example:** {{strengths}}

**Areas to develop, with an example:** {{development}}

**How they worked with others:** {{teamwork}}

**Reason for leaving, as the referee understands it:** {{reason_left}}

**Would the referee work with them again?** {{work_again}}

**Anything that would help them succeed here:** {{anything_else}}

### Conclusion

**This reference:** {{conclusion}}

**Note:** {{conclusion_note}}

| Checked by | Signature | Date |
| --- | --- | --- |
| {{checked_by}} | | |
