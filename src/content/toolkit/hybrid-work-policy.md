---
title: Hybrid and remote work policy
description: A fair hybrid and remote work policy with eligibility, office days, core hours, equipment and expenses, data security, health and safety, and how requests are decided and reviewed.
kind: policy
stage: lead
audiences: [hr, founders, employees]
order: 47
checked: 2026-11-08
useWhen: People in some roles can work away from the office, and you want consistent rules instead of manager-by-manager arrangements.
tips:
  - "Decide eligibility by the role, not the person, and apply it the same way across teams. Write down why a role can't be hybrid."
  - "Measure output, not online status. If you use any monitoring software, say so in the policy and the employee privacy notice."
  - "Check the extra costs: internet and equipment allowances, and whether a home-office allowance counts as taxable salary."
  - "Women returning from maternity leave can ask to work from home where the nature of the work allows it, on conditions agreed with the employer (Code on Social Security)."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: effective_date, label: Policy applies from, type: date, required: true, group: Company }
  - { id: office_days, label: Office days a week for hybrid roles, required: true, default: "two days a week, agreed within each team", group: Rules }
  - { id: core_hours, label: Core hours, required: true, default: "11 am to 4 pm, Monday to Friday", group: Rules }
  - { id: allowance, label: Equipment and costs, type: textarea, required: true, group: Support, default: "We provide a laptop, headset and any software you need. Hybrid and remote employees receive an internet allowance of ₹1,000 a month." }
  - { id: hr_contact, label: Where to send requests, required: true, group: Rules, placeholder: "hr@yourcompany.in" }
sources:
  - title: "The Code on Social Security, 2020 (maternity benefit, work from home after maternity leave)"
    url: https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf
    publisher: India Code
  - title: "The Digital Personal Data Protection Act, 2023"
    url: https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
    publisher: Ministry of Electronics and Information Technology
related:
  - toolkit/employee-privacy-notice
  - toolkit/leave-policy
  - toolkit/appointment-letter
faq:
  - q: Is work from home a legal right in India?
    a: Not in general. It depends on the employment terms and company policy. One exception is the Code on Social Security, which lets a woman work from home after maternity leave where the nature of her work allows it, on conditions agreed with the employer.
  - q: Can an employer change a hybrid arrangement?
    a: If the arrangement is a policy rather than a contract term, yes, with reasonable notice and a consistent reason. If remote work is written into someone's appointment letter, changing it needs their agreement.
keywords: [hybrid work policy template, remote work policy india, work from home policy sample, wfh policy for employees]
---

## {{company}} hybrid and remote work policy

Applies from {{effective_date}}.

### 1. Purpose

Where the work allows it, {{company}} lets people choose where they work part of the time. This policy sets out who can, how it works and what we expect, so that arrangements are fair and consistent.

### 2. Who it applies to

Each role is classed as office-based, hybrid or remote, depending on the work, not on the person. Your manager and HR will tell you which class your role is in and why. Roles that need you on site, such as plant operations, front desk or lab work, are office-based.

### 3. How hybrid work runs

- Hybrid roles work from the office {{office_days}}.
- Everyone is available during core hours, {{core_hours}}, wherever they work.
- Working hours, overtime, leave and attendance rules are the same wherever you work. Record your time as you would in the office.
- Teams agree how they communicate and when they meet in person, and write it down.

### 4. Equipment and costs

{{allowance}}

### 5. Data and security

Treat company and personal data at home exactly as you would in the office: use company devices and approved tools, lock your screen, don't print confidential documents at home, and don't work on public Wi-Fi without the company VPN. Report a lost device or a suspected data breach to IT straight away.

### 6. Health and safety

Set up a safe place to work, with a proper chair and screen height. Tell us about an accident while working, wherever it happens. Ask us if you need equipment for your health.

### 7. Requests and changes

You can ask for a different arrangement, for example during caring responsibilities, after maternity leave or for health reasons, by writing to {{hr_contact}}. We will consider every request fairly and reply in writing with reasons. We may change this policy, or an arrangement, with reasonable notice when the needs of the work change.

### 8. Fair treatment

Where you work doesn't affect how your performance is judged, your pay or your chance of promotion. Managers are judged on how fairly they lead mixed teams.
