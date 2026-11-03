---
title: Internship certificate
description: A factual internship certificate with the intern's dates, department or programme and the work they did, plus an optional supervisor's note. Download it as Word or PDF.
kind: letter
stage: exit
audiences: [hr, founders, students]
order: 58
checked: 2026-11-02
useWhen: An internship has ended and the intern needs a certificate for their college, their CV or a future employer.
tips:
  - "<strong>Ask what the college needs.</strong> Colleges often need a certificate from the host organisation to give credit, and some send their own evaluation form for the supervisor. AICTE's internship policy, for example, asks students to get a training certificate from the organisation and counts one credit as at least 40 to 45 hours of work, so state the dates and hours accurately."
  - "<strong>Keep it factual.</strong> Check the dates, hours and work done against your records. If the internship ended early, give the actual last day."
  - "<strong>Keep opinions to the supervisor's note.</strong> The default text makes no judgement about character. If the supervisor adds a note, make it specific: what the intern did and how it was used."
  - "<strong>Common mistakes:</strong> the same stock praise for every intern, dates that don't match attendance records, listing a project the intern only watched, and calling a regular job an internship. If the person was employed, give an <a href=\"/toolkit/experience-letter/\">experience letter</a> instead."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: full_name, label: Intern's full name, required: true, group: Intern }
  - { id: institution, label: College or university, group: Intern, placeholder: "Christ University, Bengaluru (BBA, second year)" }
  - { id: programme, label: Internship programme, group: Internship, placeholder: "Summer internship programme 2026" }
  - { id: department, label: Department or team, required: true, group: Internship }
  - { id: from_date, label: Start date, type: date, required: true, group: Internship }
  - { id: to_date, label: End date, type: date, required: true, group: Internship, help: "The actual last day, even if it was earlier than planned." }
  - { id: hours, label: Working pattern and hours, group: Internship, placeholder: "Full time, about 40 hours a week, in the Bengaluru office", help: "Add this if the college counts hours for credit." }
  - { id: supervisor, label: Supervisor, group: Internship, placeholder: "Ravi Menon, Marketing Manager" }
  - { id: project, label: Project and work done, type: textarea, required: true, group: Work, placeholder: "Researched how customers use the company's mobile app, interviewed 12 customers and wrote a report with five recommendations for the sign-up screens.", help: "Facts only: what the intern worked on and produced." }
  - { id: supervisor_note, label: Supervisor's note, type: textarea, group: Work, placeholder: "The interview guide written during the internship is now the team's template for customer interviews.", help: "Optional. Specific and factual; leave empty if there is nothing specific to say." }
sources:
  - title: "AICTE Internship Policy: Guidelines and Procedures (training certificate from the organisation; credits and hours)"
    url: https://aicte.gov.in/sites/default/files/AICTE%20Internship%20Policy.pdf
    publisher: All India Council for Technical Education
related:
  - toolkit/experience-letter
  - toolkit/relieving-letter
  - toolkit/offer-letter
  - handbooks/recruitment/01-do-you-need-this-role
faq:
  - q: What should an internship certificate include?
    a: The intern's name, your organisation, the department or programme, the start and end dates and the work done. Add the hours or working pattern if the college needs them, and a short, specific note from the supervisor if you want to.
  - q: Is an internship certificate the same as an experience letter?
    a: No. An experience letter confirms a period of employment. An internship certificate confirms a learning placement, often for a college's credit requirement. If the person was employed, give an experience letter.
  - q: Should an internship certificate say how good the intern was?
    a: Not in the main text. Use the optional supervisor's note for specific, factual comments, or the college's own evaluation form if it has one.
  - q: Can you give a certificate for a remote or part-time internship?
    a: Yes. Say how it was done, for example 'remote, part time, about 20 hours a week', so the college can count the hours correctly.
keywords: [internship certificate format, internship completion certificate, internship certificate sample, internship letter from company, internship experience certificate]
draft: false
---

**{{company}}**

{{today}}

**To whom it may concern**

**Internship certificate**

This is to certify that {{full_name}} was an intern with {{company}} from {{from_date}} to {{to_date}}.

College or university: {{institution}}

Programme: {{programme}}

Department: {{department}}

Working pattern: {{hours}}

Supervisor: {{supervisor}}

**Project and work done**

{{project}}

**Supervisor's note:** {{supervisor_note}}

We wish {{full_name}} every success in their studies and career.

For {{company}},

{{signatory_name}}
{{signatory_role}}
