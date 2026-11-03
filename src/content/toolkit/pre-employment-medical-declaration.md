---
title: Pre-employment medical declaration
description: A minimal fitness-for-role form. The candidate confirms they can do the job's real physical or safety duties, asks for any adjustments and gives written consent.
kind: form
stage: recruit
audiences: [hr, founders, employees]
order: 30
code: PC-F-06
checked: 2026-11-02
useWhen: A role has genuine physical or safety demands, such as driving, lifting or working at height, and you need to confirm fitness after making a conditional offer.
tips:
  - "Use it <strong>only after a conditional offer</strong>, and only for roles with real physical or safety demands. Most office roles don't need it."
  - "Ask only whether the person can do the listed duties, with or without adjustments. Don't ask about pregnancy or family plans, HIV status, past mental-health treatment, disability or family medical history."
  - "Health information is sensitive personal data. Get written consent (the signed form does this), keep it in a separate locked file and tell the manager only the outcome."
  - "If someone asks for an adjustment, talk about what would work before you decide anything."
fields:
  - { id: company, label: Company name, required: true, group: The role (HR fills in) }
  - { id: candidate_name, label: "Candidate's name", required: true, group: The role (HR fills in) }
  - { id: role, label: Role offered, required: true, group: The role (HR fills in) }
  - { id: offer_date, label: Date of the conditional offer, type: date, required: true, group: The role (HR fills in) }
  - { id: duties, label: Physical or safety demands of the role, type: textarea, required: true, placeholder: "Drives a company van for up to 4 hours a day. Lifts boxes of up to 15 kg. Works night shifts one week in three.", help: "List only real demands of the job. The candidate answers against this list.", group: The role (HR fills in) }
  - { id: hr_contact, label: Who will see the answers, required: true, placeholder: "Priya Nair, HR Manager", help: "Usually one named HR person, plus the examining doctor if there is an examination.", group: The role (HR fills in) }
  - { id: able, label: Can you carry out the duties listed?, type: select, required: true, options: ["Yes, I can do all of them", "Yes, with some adjustments", "Not at present", "I'd like to discuss this privately first"], group: "Candidate's answers" }
  - { id: adjustments, label: Adjustments that would help you do the job, type: textarea, help: "Optional. For example, a set break time, a ground-floor workstation or a different shift pattern.", group: "Candidate's answers" }
  - { id: restrictions, label: Current medical advice that limits any of these duties, type: textarea, placeholder: "For example: no heavy lifting for 3 months after surgery.", help: "Optional. Describe the limit and how long it lasts. You don't need to name a condition.", group: "Candidate's answers" }
sources:
  - { title: "The Code on Wages, 2019, section 3", url: "https://www.indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf", publisher: India Code }
  - { title: "The HIV and AIDS (Prevention and Control) Bill (passed in 2017): summary and status", url: "https://prsindia.org/billtrack/the-human-immunodeficiency-virus-and-acquired-immune-deficiency-syndrome-prevention-and-control-bill-2014", publisher: PRS Legislative Research }
  - { title: "Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011", url: "https://prsindia.org/files/bills_acts/bills_parliament/2011/IT_Rules_2011.pdf", publisher: PRS Legislative Research }
  - { title: "What happens to the SPDI Rules after DPDP enforcement", url: "https://ksandk.com/data-protection-and-data-privacy/what-happens-spdi-rules-after-dpdp-enforcement/", publisher: "King Stubb & Kasiva" }
  - { title: "Occupational Safety, Health and Working Conditions (Central) Rules, 2026", url: "https://prsindia.org/files/bills_acts/bills_parliament/2026/Occupational_Safety_Rules,%202026.pdf", publisher: PRS Legislative Research }
related: [toolkit/offer-letter, toolkit/employee-joining-form, toolkit/document-checklist, handbooks/recruitment/06-offers-and-negotiation]
faq:
  - q: Can an employer ask a candidate about pregnancy?
    a: It shouldn't. The Code on Wages, 2019 bars discrimination on the ground of sex when recruiting for the same or similar work, and a pregnancy question invites exactly that. If a role carries a real safety risk, describe the risk and let the candidate decide what to share.
  - q: Can an employer make an HIV test a condition of the job?
    a: No. The HIV and AIDS (Prevention and Control) Act, 2017 prohibits requiring an HIV test as a pre-requisite for employment and bars discrimination in employment against people living with HIV.
  - q: Is a pre-employment medical test compulsory in India?
    a: Not for most jobs. Some sectors have their own medical examination rules, such as mines under the OSH (Central) Rules, 2026, and you must follow those where they apply. Otherwise, use a medical check only where the job's duties need it.
  - q: Who can see my medical information at work?
    a: Only the people who need it, usually one named HR person and the examining doctor. Under the IT Act's SPDI Rules, health information is sensitive personal data, so an employer needs your written consent to collect it, must tell you why and who will receive it, can't keep it longer than needed and needs your permission before sharing it with a third party, unless the law requires it.
keywords: [pre employment medical form, medical fitness declaration format, pre employment medical check india, fitness for work form]
draft: false
---

{{company}}

## Pre-employment medical declaration

Form PC-F-06 · Confidential health information: keep separately from the personnel file

### Part A: the role (filled in by HR)

| Detail | Entry |
| --- | --- |
| Candidate | {{candidate_name}} |
| Role offered | {{role}} |
| Date of conditional offer | {{offer_date}} |
| Who will see the answers | {{hr_contact}} |

**Physical or safety demands of this role:** {{duties}}

### Part B: your answers (filled in by the candidate)

Please read the duties above and answer only about your ability to do them. You don't need to tell us about any diagnosis, condition or treatment.

**Can you carry out the duties listed?** {{able}}

**Adjustments that would help you do the job:** {{adjustments}}

**Current medical advice that limits any of these duties, and for how long:** {{restrictions}}

### How we will use this information

- We use this form only to confirm that you can do the duties above safely and to plan any adjustments you need.
- Only {{hr_contact}} and, if there is an examination, the examining doctor will see your answers. Your manager will be told only whether you are fit for the duties, with or without adjustments.
- Asking for an adjustment will not, on its own, lead to your offer being withdrawn. If a duty can't be done even with reasonable adjustments, we will talk to you before making any decision.
- We keep this form securely and separately from your personnel file, and delete it when it is no longer needed for this purpose or by law.
- You may choose not to answer. If you do, we will talk with you about what that means for the role. You can ask to see or correct this information at any time.

### Consent and declaration

I agree that {{company}} may use the information on this form, and the outcome of any medical examination, for the purposes above. My answers are true to the best of my knowledge.

| Candidate | Signature | Date |
| --- | --- | --- |
| {{candidate_name}} | | |

### Part C: medical examination (only if the role needs one)

The examining doctor shares only the outcome and any adjustments with {{company}}, never a diagnosis or test results.

Outcome (tick one): ☐ Fit for the duties listed  ☐ Fit with the adjustments below  ☐ Not fit for these duties at present

Adjustments or restrictions, and review date if temporary: ________________________

Doctor's name, registration number, signature and date: ________________________
