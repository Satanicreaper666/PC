---
title: Employee joining form
description: A privacy-aware joining form that collects only what payroll, PF, ESI and emergencies need, says why each detail is asked and keeps sensitive IDs optional.
kind: form
stage: onboard
audiences: [hr, founders, employees]
order: 10
code: PC-F-01
checked: 2026-11-02
useWhen: A new employee is joining and you need their personal, bank and emergency details to pay them and register them for PF, ESI and insurance.
tips:
  - "Send new joiners the link to this page. They fill it in on their own device and download it for you; nothing is uploaded to this site."
  - "Collect only what you'll use. This form leaves out marital status, religion, caste, previous salary and disability percentages, which payroll and statutory registration don't need."
  - "Bank details and health information are sensitive personal data under the IT Act's SPDI Rules. The signed declaration records written consent; store the form securely and limit who can open it."
  - "Optional items left blank are left out of the finished form, so each joiner signs only what they chose to share."
fields:
  - { id: company, label: Company name, required: true, group: Company (HR fills in) }
  - { id: privacy_contact, label: Contact for questions about personal data, required: true, placeholder: "hr@yourcompany.in", group: Company (HR fills in) }
  - { id: full_name, label: Full name, required: true, help: "As on your PAN or other official ID.", group: About you }
  - { id: preferred_name, label: Name you'd like to be called, group: About you }
  - { id: dob, label: Date of birth, type: date, required: true, group: About you }
  - { id: parent_name, label: "Father's or mother's name", required: true, group: About you }
  - { id: gender, label: Gender, type: select, options: [Female, Male, Transgender, Prefer not to say], group: About you }
  - { id: nationality, label: Nationality, help: "Fill in only if you are not an Indian citizen.", group: About you }
  - { id: blood_group, label: Blood group, type: select, options: [A+, A−, B+, B−, AB+, AB−, O+, O−, "Don't know"], group: About you }
  - { id: personal_email, label: Personal email, type: email, required: true, group: Contact }
  - { id: mobile, label: Mobile number, type: tel, required: true, group: Contact }
  - { id: current_address, label: Current address, type: textarea, required: true, group: Contact }
  - { id: permanent_address, label: Permanent address, type: textarea, help: "Leave blank if it's the same as your current address.", group: Contact }
  - { id: pan, label: PAN, help: "Needed to deduct income tax from your salary correctly. If you leave it blank, give it to payroll before your first salary.", group: Tax and social security numbers }
  - { id: aadhaar, label: Aadhaar number, help: "Only if your PF or ESI registration needs it. You can give it in those forms instead.", group: Tax and social security numbers }
  - { id: uan, label: UAN from a previous job, help: "So your existing PF account carries on instead of a new one being opened.", group: Tax and social security numbers }
  - { id: esi_no, label: ESI insurance number from a previous job, help: "So your ESI cover carries on.", group: Tax and social security numbers }
  - { id: bank_name, label: Bank name, required: true, group: Bank account for salary }
  - { id: account_holder, label: "Account holder's name", required: true, group: Bank account for salary }
  - { id: account_number, label: Account number, required: true, group: Bank account for salary }
  - { id: ifsc, label: IFSC code, required: true, group: Bank account for salary }
  - { id: emergency_name, label: Emergency contact's name, required: true, group: Emergency contact }
  - { id: emergency_relationship, label: Relationship to you, required: true, group: Emergency contact }
  - { id: emergency_phone, label: Their phone number, type: tel, required: true, group: Emergency contact }
  - { id: insurance_family, label: Family members to cover under health insurance, type: textarea, placeholder: "Name, relationship, date of birth", help: "Only if the company's insurance covers family.", group: Optional details }
  - { id: support, label: Support or adjustments you'd like at work, type: textarea, help: "You don't need to share a diagnosis. If you hold a disability certificate, telling HR can affect your ESI cover.", group: Optional details }
  - { id: qualification, label: "Highest qualification, institution and year", help: "Only if your role needs a qualification, or for background verification.", group: Optional details }
  - { id: last_employer, label: "Last employer, your role and dates", type: textarea, help: "Used for background verification, done only with your written consent.", group: Optional details }
  - { id: employee_code, label: Employee code, group: For HR use }
  - { id: joining_date, label: Date of joining, type: date, group: For HR use }
sources:
  - { title: "Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011", url: "https://prsindia.org/files/bills_acts/bills_parliament/2011/IT_Rules_2011.pdf", publisher: PRS Legislative Research }
  - { title: "What happens to the SPDI Rules after DPDP enforcement", url: "https://ksandk.com/data-protection-and-data-privacy/what-happens-spdi-rules-after-dpdp-enforcement/", publisher: "King Stubb & Kasiva" }
  - { title: "India's Digital Personal Data Protection Act: phased rollout and key compliance milestones", url: "https://www.azbpartners.com/bank/indias-digital-personal-data-protection-act-phased-rollout-and-key-compliance-milestones/", publisher: "AZB & Partners" }
  - { title: "Occupational Safety, Health and Working Conditions (Central) Rules, 2026, rule 6 (appointment letter format)", url: "https://prsindia.org/files/bills_acts/bills_parliament/2026/Occupational_Safety_Rules,%202026.pdf", publisher: PRS Legislative Research }
related: [toolkit/document-checklist, toolkit/onboarding-checklist, toolkit/appointment-letter, handbooks/recruitment/08-onboarding-day-1-to-90, handbooks/tds/05-joiners-leavers-and-transfers]
faq:
  - q: Do I have to give my Aadhaar number to my employer?
    a: This form doesn't require it. Some PF and ESI processes may ask for it; if so, payroll should tell you which form needs it and why. You shouldn't need to hand over an Aadhaar copy just to prove who you are.
  - q: Why does my employer need my PAN?
    a: To deduct income tax (TDS) from your salary correctly and report it against your name, so that it matches your tax records when you file your return.
  - q: How long can an employer keep my personal data?
    a: Only as long as it is needed for the purpose it was collected for, or as another law requires. The IT Act's SPDI Rules already say this for sensitive data such as bank details and health information, and the Digital Personal Data Protection Act, 2023 adds similar duties as its provisions come into force.
  - q: Can my employer share my bank details with others?
    a: Only for the purposes you were told about, such as paying your salary. Under the SPDI Rules, an employer needs your permission before disclosing sensitive data such as bank details to a third party, unless your contract allows it or the law requires it.
keywords: [employee joining form format, new joiner form india, joining form template, employee information form]
draft: false
---

{{company}}

## Employee joining form

Form PC-F-01 · Confidential

Please fill in your details. You can leave optional items blank. Each section says why we ask.

### 1. About you

| Detail | Your answer | Why we ask |
| --- | --- | --- |
| Full name | {{full_name}} | For your appointment letter, payslips and PF record |
| Name you'd like to be called | {{preferred_name}} | So colleagues get it right |
| Date of birth | {{dob}} | For PF, ESI, gratuity and insurance |
| Father's or mother's name | {{parent_name}} | Your appointment letter must show it |
| Gender | {{gender}} | For PF, ESI and insurance records |
| Nationality | {{nationality}} | PF rules differ for international workers |
| Blood group | {{blood_group}} | Used only in an emergency |

### 2. Contact details

We use these to send your payslips and letters until your work email is set up.

| Detail | Your answer |
| --- | --- |
| Personal email | {{personal_email}} |
| Mobile number | {{mobile}} |
| Current address | {{current_address}} |
| Permanent address | {{permanent_address}} |

### 3. Tax and social security numbers

These are optional here. If you leave one blank, payroll will ask for it only when it is needed. Please don't send a copy of your Aadhaar card unless we ask for one.

- PAN, to deduct income tax from your salary correctly: {{pan}}
- Aadhaar, only if your PF or ESI registration needs it: {{aadhaar}}
- UAN from a previous job, so your PF account carries on: {{uan}}
- ESI insurance number from a previous job, so your ESI cover carries on: {{esi_no}}

### 4. Bank account for your salary

We pay your salary into this account and share these details only with our bank and payroll provider.

| Detail | Your answer |
| --- | --- |
| Bank name | {{bank_name}} |
| Account holder's name | {{account_holder}} |
| Account number | {{account_number}} |
| IFSC code | {{ifsc}} |

### 5. Emergency contact

We contact this person only in an emergency. Please let them know you have named them.

| Detail | Your answer |
| --- | --- |
| Name | {{emergency_name}} |
| Relationship to you | {{emergency_relationship}} |
| Phone number | {{emergency_phone}} |

### 6. Optional details

Fill these in only if they apply to you.

- Family members to cover under the company's health insurance: {{insurance_family}}
- Support or adjustments you'd like at work: {{support}}
- Highest qualification, institution and year: {{qualification}}
- Last employer, your role and dates (for background verification, done only with your written consent): {{last_employer}}

### 7. Forms you will fill in separately

Payroll will also ask you to complete the PF and ESI joining forms (if you are covered), your PF and gratuity nominations, and your income-tax declaration for the year. If you changed jobs during this tax year, please give payroll a statement of the income paid and tax deducted by your previous employer, so your tax is worked out correctly.

### 8. How we use your information

{{company}} uses the details on this form only for your employment: to pay your salary and deduct tax, to register you for PF, ESI and insurance, to contact you or your emergency contact, and to meet our legal duties. Only HR, payroll and the service providers who help us with these tasks will see them. We keep them securely while you work here, and afterwards only as long as the law or a genuine need requires. You can ask to see or correct your details at any time by writing to {{privacy_contact}}.

Your bank details, and anything you tell us about your health, are sensitive personal data. By signing below, you agree to our using them for these purposes.

### 9. Declaration

I confirm that the information on this form is correct to the best of my knowledge, and I will tell HR if any of it changes.

| Name | Signature | Date |
| --- | --- | --- |
| {{full_name}} | | |

**For HR use. Employee code:** {{employee_code}}

**Date of joining:** {{joining_date}}
