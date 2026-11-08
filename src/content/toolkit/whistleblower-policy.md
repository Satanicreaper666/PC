---
title: Whistleblower (speak-up) policy
description: A whistleblower policy with a reporting channel outside the line, protection from retaliation, how reports are looked into and the vigil mechanism the Companies Act requires of some companies.
kind: policy
stage: lead
audiences: [hr, founders, employees]
order: 46
checked: 2026-11-08
useWhen: You want employees and others to report fraud, corruption, safety risks or other wrongdoing safely, or your company must have a vigil mechanism.
tips:
  - "Give a channel that doesn't go through line managers: an email monitored by the audit committee chair or an ombudsperson, or an external hotline."
  - "Listed companies, and companies that accept public deposits or have borrowed more than ₹50 crore from banks and financial institutions, must have a vigil mechanism under section 177 of the Companies Act and its rules. Check whether yours does."
  - "Report numbers and outcomes (not names) to the board or audit committee every quarter, so people see that reports lead somewhere."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: effective_date, label: Policy applies from, type: date, required: true, group: Company }
  - { id: channel, label: How to make a report, type: textarea, required: true, group: Reporting, placeholder: "Email speakup@yourcompany.in, read only by the Ethics Officer\nCall the independent hotline on 1800 000 0000 (any time, in English, Hindi or Kannada)" }
  - { id: ethics_officer, label: Who looks into reports, required: true, group: Reporting, placeholder: "the Ethics Officer, Ms Priya Nair" }
  - { id: escalation, label: Direct access for serious cases, required: true, group: Reporting, placeholder: "the Chair of the Audit Committee, Mr Vivek Rao, at auditchair@yourcompany.in" }
  - { id: ack_days, label: Days to acknowledge a report, type: number, required: true, default: "5", group: Reporting }
sources:
  - title: "The Companies Act, 2013, section 177(9) and (10) (vigil mechanism)"
    url: https://www.indiacode.nic.in/handle/123456789/2114
    publisher: India Code
  - title: "Companies (Meetings of Board and its Powers) Rules, 2014, rule 7 (companies that must have a vigil mechanism)"
    url: https://www.mca.gov.in/Ministry/pdf/Rules_Chapter_XII.pdf
    publisher: Ministry of Corporate Affairs
related:
  - toolkit/grievance-redressal-policy
  - toolkit/posh-policy
  - toolkit/disciplinary-process-guide
faq:
  - q: Which companies must have a whistleblower or vigil mechanism?
    a: Under section 177 of the Companies Act and its rules, listed companies, companies that accept deposits from the public, and companies that have borrowed more than ₹50 crore from banks and public financial institutions must set up a vigil mechanism for directors and employees. Listed companies have SEBI disclosure duties too.
  - q: Can a whistleblower stay anonymous?
    a: This policy accepts anonymous reports, though they are harder to look into because the reporter can't be asked follow-up questions. Whatever the channel, the reporter's identity is protected and shared only where the law requires.
keywords: [whistleblower policy template, vigil mechanism policy companies act, speak up policy india, whistle blower policy for employees]
---

## {{company}} whistleblower policy

Applies from {{effective_date}}.

### 1. Why we have this policy

We want to know about wrongdoing early, so we can stop it. This policy explains how employees, directors, contractors, suppliers and anyone else who works with {{company}} can report a concern safely, and how we protect them. It is also our vigil mechanism under the Companies Act, 2013, where the Act requires one.

### 2. What to report

Report anything you honestly believe may be wrong, for example:

- fraud, theft, bribery or corruption;
- false accounts or records;
- a risk to health, safety or the environment;
- breaking the law, or our code of conduct;
- misuse of company money, data or property;
- an attempt to hide any of these.

Personal grievances about your own job go through the grievance policy, and sexual harassment complaints to the Internal Committee under the POSH policy.

### 3. How to report

{{channel}}

Say what happened, when, who was involved and any evidence you have. You don't need proof, only an honest belief. You can report anonymously, although that makes follow-up questions harder.

For serious matters, or if your concern involves the people who would normally look into it, you can go directly to {{escalation}}.

### 4. What happens next

- We acknowledge your report within {{ack_days}} working days.
- {{ethics_officer}} decides how to look into it, independently of the people involved, and may appoint an investigator.
- We tell you when the matter is closed and, where we can, what was done. We may not be able to share details that would affect other people's privacy or an investigation.
- Where wrongdoing is found, we act under our disciplinary procedure and the law, and fix what allowed it.

### 5. Your protection

- We keep your identity confidential and share it only where the law requires.
- No one will be dismissed, demoted, harassed or treated worse for reporting a concern in good faith, even if it turns out to be mistaken. Retaliation is serious misconduct.
- Someone who knowingly makes a false report to harm another person may face disciplinary action.

### 6. Records and oversight

We keep a confidential record of every report and its outcome. The audit committee, or the board where there is no audit committee, reviews how the policy is working at least once a year.
