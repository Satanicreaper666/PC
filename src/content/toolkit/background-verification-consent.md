---
title: Background verification consent and authorisation
description: A candidate's written consent for background checks that says exactly which checks, who does them, how the data is used and kept, and the right to explain anything they find.
kind: form
stage: recruit
audiences: [hr, founders, employees]
order: 72
checked: 2026-11-08
sensitive: true
useWhen: You have made an offer that depends on background verification and need the candidate's informed, written consent before any check starts.
tips:
  - "Check only what the role needs. A criminal record check for a delivery driver or a cash role is easier to justify than for every job."
  - "Name the verification agency. It processes the candidate's data for you, so have a contract that limits what it can do with it."
  - "If a check turns up something, tell the candidate and hear their explanation before you decide. A discrepancy is not always dishonesty."
  - "Keep the consent with the offer file, and delete the check reports when your retention period ends."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: agency, label: Verification agency, required: true, group: Company, placeholder: "SafeCheck Verification Pvt Ltd" }
  - { id: hr_contact, label: Contact for questions, required: true, group: Company, placeholder: "privacy@yourcompany.in" }
  - { id: candidate_name, label: Candidate's full name, required: true, group: Candidate }
  - { id: role, label: Role offered, required: true, group: Candidate }
  - { id: checks, label: Checks to be done, type: textarea, required: true, group: Checks, default: "Identity (PAN and one address proof)\nEducation: the highest qualification listed in your application\nEmployment: your last two employers, dates and designation\nReferences: two references you name", help: "One per line. Add criminal records or credit checks only if the role needs them, and say why." }
  - { id: retention, label: How long the reports are kept, required: true, group: Checks, default: "for the duration of your employment and two years after, or six months if you don't join" }
sources:
  - title: "The Digital Personal Data Protection Act, 2023"
    url: https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
    publisher: Ministry of Electronics and Information Technology
related:
  - toolkit/offer-letter
  - toolkit/reference-check-report
  - toolkit/employee-privacy-notice
  - toolkit/employee-joining-form
faq:
  - q: Is consent needed for background verification in India?
    a: Yes in practice. Checks reach into education, past employment and sometimes criminal records, and involve sharing personal data with an agency. Get specific, written consent that says which checks, who does them and how the data is kept.
  - q: Can a candidate refuse a background check?
    a: They can, and the employer can then decide not to go ahead with an offer that depends on it. Explain at the offer stage which checks are a condition of the offer.
keywords: [background verification consent form, bgv authorization form, employee background check consent india, background check consent letter]
---

**{{company}}**

## Background verification: consent and authorisation

Candidate: {{candidate_name}}

Role offered: {{role}}

### What will be checked

Your offer depends on satisfactory background verification. With your consent, {{company}} and its verification agency, {{agency}}, will check:

{{checks}}

No other checks will be done without asking you again.

### How your information is used

- The information is used only to verify what you told us, for this offer.
- {{agency}} acts for {{company}} under a contract and may contact the institutions, employers and references named above.
- Reports are kept {{retention}}, and then deleted.
- You can ask what was collected about you and ask for mistakes to be corrected, by writing to {{hr_contact}}.

### If something doesn't match

We will tell you what we found and give you the chance to explain or correct it before we decide anything about your offer.

### Your consent

I, {{candidate_name}}, consent to the checks listed above, and authorise {{company}} and {{agency}} to contact the people and organisations named in my application for this purpose. I have read how my information will be used and kept.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
