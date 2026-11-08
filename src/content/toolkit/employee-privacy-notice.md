---
title: Employee privacy notice (DPDP Act)
description: Tell employees what personal data you hold, why, who sees it, how long you keep it and their rights under the DPDP Act, 2023, ready before its main duties start in May 2027.
kind: policy
stage: pay
audiences: [hr, founders, employees]
order: 96
checked: 2026-11-08
useWhen: You are preparing for the DPDP Act's duties as an employer and want one clear notice for employees about how their personal data is handled.
tips:
  - "Write down each use of employee data and the reason for it before you fill this in. Most employment uses are allowed without consent as 'legitimate uses', but health data, background checks and monitoring need care."
  - "Set real retention periods: for example, payroll records for as long as tax and labour law require, candidate records for six months. Then delete on schedule."
  - "Give the notice in English or any language in the Eighth Schedule of the Constitution, as the person prefers."
  - "Have it reviewed by a privacy lawyer, especially if you transfer data outside India or use monitoring tools."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: effective_date, label: Notice applies from, type: date, required: true, group: Company }
  - { id: contact, label: Privacy contact or grievance officer, required: true, group: Company, placeholder: "Ms Anita Rao, Privacy Officer, privacy@yourcompany.in" }
  - { id: data_held, label: Personal data we hold, type: textarea, required: true, group: Data, default: "Identity and contact details; date of birth; PAN and, if you choose to give it, Aadhaar; bank details; education and work history; salary, tax and statutory contributions (PF, ESI); attendance and leave; performance records; emergency contact; and, only where needed for your role or a law, health information." }
  - { id: processors, label: Service providers who process it for us, type: textarea, required: true, group: Sharing, placeholder: "Our payroll provider; our HR software provider; our group health insurer and its administrator; our bank for salary payments." }
  - { id: retention, label: How long we keep it, type: textarea, required: true, group: Retention, default: "While you work with us, and afterwards only as long as tax, labour and other laws require, or as needed to deal with a claim. We then delete it or make it anonymous." }
  - { id: abroad, label: Data stored or processed outside India, group: Sharing, placeholder: "Our HR software stores data in Singapore." , help: "Optional. Leave empty if none." }
sources:
  - title: "The Digital Personal Data Protection Act, 2023"
    url: https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
    publisher: Ministry of Electronics and Information Technology
  - title: "Government notifies the Digital Personal Data Protection Rules, 2025"
    url: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014&reg=3&lang=2
    publisher: Press Information Bureau
related:
  - toolkit/employee-joining-form
  - toolkit/document-checklist
  - toolkit/hr-compliance-audit-checklist
  - toolkit/pre-employment-medical-declaration
faq:
  - q: Do employers need consent to process employee data under the DPDP Act?
    a: Not for most employment purposes. Section 7 of the Act lets an employer process personal data without consent for purposes of employment, such as payroll, attendance and protecting the business. Consent is still the safer basis for things that go beyond employment, and every employee should get a clear notice.
  - q: When do the DPDP Act's duties apply to employers?
    a: The Rules were notified in November 2025. The main duties for data fiduciaries, including notices, security safeguards, breach reporting and data principals' rights, apply from May 2027.
keywords: [employee privacy notice dpdp, dpdp act employer obligations, employee data protection policy india, privacy notice for employees template]
---

## {{company}} employee privacy notice

Applies from {{effective_date}}.

This notice explains how {{company}} handles your personal data as an employee, under the Digital Personal Data Protection Act, 2023 and its Rules.

### 1. What we hold

{{data_held}}

### 2. Why we use it

We use your personal data for the purposes of your employment: to hire and onboard you, pay you and deduct tax and statutory contributions, manage attendance, leave and benefits, review performance, keep our workplaces and systems safe, meet our duties under labour, tax and other laws, and deal with legal claims. The Act allows an employer to process personal data for these purposes without separate consent. Where we want to use your data for anything else, we will ask for your consent first, and you can withdraw it at any time.

### 3. Who we share it with

Only people at {{company}} who need it for their work can see your data. We also share it with service providers who process it for us under contract and our instructions: {{processors}}. We give information to government authorities when the law requires it, for example for tax, PF and ESI.

Data stored or processed outside India: {{abroad}}

### 4. How long we keep it

{{retention}}

### 5. How we protect it

We limit who can see your data, protect our systems, and train our people. If a breach of your personal data happens, we will tell you and the Data Protection Board of India as the Act and its Rules require.

### 6. Your rights

You can:

- ask what personal data we hold about you and how we use it;
- ask us to correct, complete or update it;
- ask us to erase data we no longer need, unless a law requires us to keep it;
- withdraw any consent you gave;
- nominate someone to exercise your rights if you die or can't act;
- complain to us, and then to the Data Protection Board of India if you are not satisfied.

### 7. Contact

Questions, requests and complaints go to {{contact}}. We will respond within the time the Rules set.
