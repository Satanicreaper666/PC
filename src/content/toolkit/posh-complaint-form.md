---
title: POSH complaint form
description: A written complaint of sexual harassment for the Internal Committee under the POSH Act, 2013, with guidance on time limits, interim relief and what happens next.
kind: form
stage: pay
audiences: [employees, hr]
order: 95
checked: 2026-11-02
useWhen: You want to make a written complaint of sexual harassment at work to your organisation's Internal Committee, or you are an HR team offering employees a clear complaint format.
tips:
  - "Your draft is saved in this browser so you can come back to it. On a shared or office computer, download or print it when you're done, then press <strong>Clear all fields</strong>."
  - "The time limit is three months from the incident, or from the last incident if there was more than one. The Internal Committee can allow up to three more months if something stopped you complaining sooner."
  - "Write what happened in your own words. You don't need a lawyer or complete evidence to complain; the committee can ask you for more detail later. If you would like help writing it, you can ask a member of the committee."
  - "You can ask for protection while the inquiry runs, such as a transfer of either person, leave of up to three months, or stopping the other person from reviewing your work."
fields:
  - { id: company, label: Organisation name, required: true, group: Where you are filing }
  - { id: presiding_officer, label: Presiding Officer's name, group: Where you are filing, help: "Optional. Find it on the committee notice displayed at work or in the POSH policy." }
  - { id: c_name, label: Your full name, required: true, group: About you }
  - { id: c_role, label: Your designation and team, required: true, group: About you }
  - { id: c_relationship, label: Your relationship to the organisation, type: select, required: true, group: About you, options: ["Employee", "Contract or agency worker", "Intern, trainee or apprentice", "Visitor or client", "Other"] }
  - { id: c_contact, label: Safe way to contact you, required: true, group: About you, help: "A phone number or personal email that only you use." }
  - { id: r_name, label: Name of the person you are complaining about, required: true, group: The other person }
  - { id: r_role, label: Their designation, team or organisation, group: The other person }
  - { id: r_relationship, label: How they are connected to you at work, type: select, group: The other person, options: ["My manager or someone senior to me", "A colleague", "Someone who reports to me", "A client, customer or vendor", "Other"] }
  - { id: i_dates, label: Date or dates of the incident, required: true, group: What happened, placeholder: "12 August 2026, and again on 3 September 2026" }
  - { id: i_place, label: Where it happened, required: true, group: What happened, placeholder: "Office, client site, work trip, online call or chat" }
  - { id: i_description, label: What happened, type: textarea, required: true, group: What happened, help: "In your own words: what was said or done, in what order, and how it affected you. Share as much as you are comfortable with." }
  - { id: i_witnesses, label: Witnesses, or people you told at the time, type: textarea, group: What happened }
  - { id: i_evidence, label: Documents or evidence you are attaching, type: textarea, group: What happened, placeholder: "Screenshots of messages from 12 August; email of 3 September" }
  - { id: i_delay, label: If it has been more than three months, why, type: textarea, group: What happened, help: "Leave this empty if you are filing within three months." }
  - { id: outcome, label: The outcome you are seeking, type: textarea, required: true, group: What you are asking for, placeholder: "An inquiry and appropriate action, and an assurance that I will not face retaliation." }
  - { id: relief_interim, label: Help you need while the inquiry runs, type: textarea, group: What you are asking for, placeholder: "I would like the respondent to stop reviewing my work until the inquiry is complete." }
  - { id: conciliation, label: Would you like to try conciliation first, type: select, group: What you are asking for, options: ["No, I would like the committee to hold an inquiry", "Yes, I would like to try conciliation first", "I would like to discuss this with the committee first"], help: "Conciliation happens only if you ask for it." }
sources:
  - title: Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013
    url: https://wcd.nic.in/sites/default/files/Sexual-Harassment-at-Workplace-Act.pdf
    publisher: Ministry of Women and Child Development
  - title: Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Rules, 2013
    url: https://wcd.nic.in/sites/default/files/Sexual-Harassment-at-Workplace-Rules.pdf
    publisher: Ministry of Women and Child Development
  - title: POSH compliance guide
    url: https://employmentlaw.lkslaw.com/posh
    publisher: Lakshmikumaran & Sridharan
related:
  - handbooks/labour-law/07-posh-compliance
  - toolkit/posh-ic-constitution-checklist
  - toolkit/hr-compliance-audit-checklist
  - glossary/posh
  - glossary/internal-committee
faq:
  - q: What is the time limit to file a POSH complaint?
    a: Three months from the incident, or from the last incident in a series. The Internal Committee can extend this by up to three more months if there was a good reason for the delay.
  - q: What happens after I file a complaint?
    a: The committee shares the complaint with the other person so they can reply. If you ask for it, the committee can try conciliation before an inquiry. An inquiry must be completed within 90 days, the report goes to the employer and both parties within 10 days of completion, and the employer must act on it within 60 days.
  - q: Can I get protection while the inquiry is going on?
    a: Yes. You can ask in writing for interim relief, such as a transfer for you or the other person, leave of up to three months, or an order that the other person stops reporting on or reviewing your work.
  - q: My workplace has fewer than 10 employees. Where do I complain?
    a: To the Local Committee set up by the District Officer for your district.
  - q: Can I appeal against the committee's findings?
    a: Yes. Either party can appeal within 90 days of the recommendations.
  - q: Can I go to the police as well?
    a: Yes. If the harassment is also a crime, you can file a police complaint, and your employer must help you if you choose to.
keywords: [posh complaint form, sexual harassment complaint format, internal committee complaint, posh complaint letter, how to file posh complaint]
---

## Complaint of sexual harassment at the workplace

To: The Presiding Officer, Internal Committee, {{company}}

Presiding Officer: {{presiding_officer}}

Made under the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.

*Confidential. For the Internal Committee only.*

### Part A: About me

| Detail | My answer |
| --- | --- |
| Name | {{c_name}} |
| Designation and team | {{c_role}} |
| Relationship to the organisation | {{c_relationship}} |
| Safe way to contact me | {{c_contact}} |

### Part B: The person I am complaining about

| Detail | My answer |
| --- | --- |
| Name | {{r_name}} |
| Designation, team or organisation | {{r_role}} |
| How they are connected to me at work | {{r_relationship}} |

### Part C: What happened

| Detail | My answer |
| --- | --- |
| Date or dates | {{i_dates}} |
| Where it happened | {{i_place}} |

**What happened**

{{i_description}}

**Witnesses, or people I told at the time:** {{i_witnesses}}

**Documents or evidence attached:** {{i_evidence}}

**Why I am filing after three months:** {{i_delay}}

### Part D: What I am asking for

**The outcome I am seeking:** {{outcome}}

**Help I need while the inquiry runs (interim relief):** {{relief_interim}}

**Conciliation:** {{conciliation}}

### Part E: Declaration

The information in this complaint is true to the best of my knowledge. I understand that the Internal Committee will share this complaint with the person I have named so that they can respond, and that the committee will keep the complaint and the inquiry confidential.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Date: {{today}}

---

### For the Internal Committee

Received by (name and role): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Date and time received: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Reference number: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
