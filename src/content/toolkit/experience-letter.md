---
title: Experience letter
description: A factual experience certificate confirming dates of employment, designations and the role, ready to sign and give to a departing employee. Download it as Word or PDF.
kind: letter
stage: exit
audiences: [hr, founders, employees]
order: 55
checked: 2026-11-02
useWhen: An employee is leaving or has left, and needs a letter confirming how long they worked for you and in what role.
tips:
  - "Check every date and designation against HR records: the joining date in the appointment letter and the last working day in the relieving letter. A wrong date can delay someone's background check."
  - "Keep it factual and neutral. If you want to comment on performance, write a separate reference, and only with the employee's agreement."
  - "Issue it on or soon after the last working day, on letterhead, signed by someone authorised. Don't hold it back over unrelated disputes, such as a notice period shortfall."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: doj, label: Date of joining, type: date, required: true, group: Employment }
  - { id: lwd, label: Last working day, type: date, required: true, group: Employment }
  - { id: first_designation, label: Designation on joining, group: Employment, help: "Only if it was different from the last designation. Leave it empty and the line is left out of the letter." }
  - { id: designation, label: Designation at the time of leaving, required: true, group: Employment }
  - { id: department, label: Department, group: Employment }
  - { id: role_summary, label: What the role involved, type: textarea, group: Employment, placeholder: "The role involved managing payroll for 600 employees across three states, handling PF, ESI and professional tax filings, and supporting the annual audit.", help: "One to three factual sentences. Optional." }
  - { id: closing, label: Closing line, type: select, group: Employment, options: ["We wish them every success in the future.", "We thank them for their contribution and wish them every success in the future."], default: "We wish them every success in the future." }
related:
  - toolkit/relieving-letter
  - toolkit/offboarding-checklist
  - toolkit/resignation-letter
  - handbooks/labour-law/06-termination-grievance-and-disputes
faq:
  - q: What is the difference between an experience letter and a relieving letter?
    a: A relieving letter confirms that the employee's resignation was accepted and they have been released from their duties on a given date. An experience letter (or experience certificate) confirms how long they worked for you and in what role. New employers often ask for both.
  - q: What should an experience letter include?
    a: The employee's name, the dates of joining and leaving, designations held, and optionally a short factual description of the role. It should be on letterhead, dated and signed by an authorised person.
  - q: Can an experience letter mention poor performance?
    a: Keep it to facts that HR records support. An experience letter is not the place for opinions on performance or conduct; if a reference is needed, give it separately and fairly.
keywords: [experience letter format, experience certificate format, work experience letter, experience letter from company, service certificate format]
---

**{{company}}**

{{today}}

**To whom it may concern**

**Experience certificate**

This is to certify that {{e_name}} worked with {{company}} from {{doj}} to {{lwd}}.

Employee ID: {{e_id}}

Designation on joining: {{first_designation}}

Designation at the time of leaving: {{designation}}

Department: {{department}}

{{role_summary}}

{{closing}}

For {{company}},

{{signatory_name}}
{{signatory_role}}
