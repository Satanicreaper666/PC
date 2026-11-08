---
title: Grievance redressal policy
description: A grievance policy with simple steps, time limits and a Grievance Redressal Committee as the Industrial Relations Code requires for 20 or more workers, plus protection for anyone who raises a concern.
kind: policy
stage: pay
audiences: [hr, founders, employees]
order: 93
checked: 2026-11-08
useWhen: You want a clear, fair way for employees to raise problems at work, and you have (or will soon have) 20 or more workers and need a Grievance Redressal Committee.
tips:
  - "Set up the committee with equal numbers from the employer and the workers, and women represented, and display the members' names at work."
  - "Keep sexual harassment out of this route: it goes to the Internal Committee under the POSH policy. Keep concerns about fraud or wrongdoing in the whistleblower route."
  - "Keep a register of every grievance, the date received, the response and the date closed. Patterns tell you more than single cases."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: effective_date, label: Policy applies from, type: date, required: true, group: Company }
  - { id: first_contact, label: First person to raise a grievance with, required: true, default: "your manager, or HR if it is about your manager", group: Steps }
  - { id: hr_contact, label: HR contact, required: true, group: Steps, placeholder: "grievance@yourcompany.in" }
  - { id: step1_days, label: Days for a first response, type: number, required: true, default: "7", group: Steps }
  - { id: grc_members, label: Grievance Redressal Committee members, type: textarea, group: Committee, placeholder: "Employer side: Arun Shetty (Plant Head), Meera Iyer (HR Manager)\nWorker side: Ravi Kumar (Machine Operator), Lakshmi S (Quality Inspector)", help: "Needed if you employ 20 or more workers. Equal numbers from each side, up to 10 members, with women represented." }
sources:
  - title: "The Industrial Relations Code, 2020 (section 4, Grievance Redressal Committee)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
related:
  - toolkit/posh-policy
  - toolkit/whistleblower-policy
  - toolkit/hr-compliance-audit-checklist
  - handbooks/labour-law/06-termination-grievance-and-disputes
faq:
  - q: When is a Grievance Redressal Committee required?
    a: The Industrial Relations Code requires one or more Grievance Redressal Committees in every industrial establishment with 20 or more workers. The committee has equal employer and worker members, up to ten in all, with women represented in proportion to women workers.
  - q: How long does a grievance committee have to decide?
    a: The Code expects the committee to complete its proceedings within 30 days of receiving the grievance. A worker can raise a grievance within one year of the cause, and can take an unresolved dispute further under the Code.
keywords: [grievance redressal policy, grievance redressal committee industrial relations code, employee grievance procedure, grievance policy template india]
---

## {{company}} grievance redressal policy

Applies from {{effective_date}}.

### 1. Purpose

Everyone at {{company}} should be able to raise a problem at work and have it heard fairly and quickly. A grievance is any concern about your work, pay, working conditions, treatment by others, or how a rule or policy has been applied to you.

Sexual harassment complaints go to the Internal Committee under our POSH policy. Concerns about fraud, corruption or other wrongdoing go through our whistleblower policy. Everything else can be raised here.

### 2. Step 1: talk to someone

Raise the grievance, in person or in writing, with {{first_contact}}. They will respond within {{step1_days}} working days, and will try to resolve it informally where they can.

### 3. Step 2: write to HR

If the first step doesn't resolve it, or you'd rather not use it, write to {{hr_contact}}. Say what happened, when, who was involved and what outcome you are looking for. HR will acknowledge it within two working days, look into it, meet you, and give you a written response with reasons.

### 4. Step 3: the Grievance Redressal Committee

You can take the grievance to the Grievance Redressal Committee at any time, including if you are not satisfied with HR's response.

**The committee:** {{grc_members}}

The committee has an equal number of members from the employer and from the workers, with women represented, and its chairperson is chosen from each side in turn. You can raise a grievance with the committee within one year of the cause. The committee will hear you and complete its proceedings within 30 days of receiving the grievance, and tell you its decision in writing.

### 5. Your rights

- You can bring a colleague with you to any meeting about your grievance.
- Your grievance is kept confidential and shared only with the people who need to know to resolve it.
- No one will treat you worse for raising a grievance in good faith. Retaliation is misconduct.
- If the matter is not resolved, you can take it further under the Industrial Relations Code.

### 6. Records and review

HR keeps a register of every grievance and how it was resolved, and reviews the themes every quarter to fix their causes.
