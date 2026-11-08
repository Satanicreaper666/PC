---
title: No-dues clearance form
description: A clearance sheet for a leaver, signed off by the manager, IT, admin, finance and HR, with assets returned and any amount to recover, so the final settlement is paid on time.
kind: form
stage: exit
audiences: [hr, founders]
order: 34
checked: 2026-11-08
useWhen: An employee is leaving and each department needs to confirm what has been returned and whether anything is owed, before the final settlement.
tips:
  - "Start it when the resignation is accepted, not on the last day. Final wages are due within two working days of the last working day."
  - "Clearance can't hold up the settlement or the relieving letter. Record what is outstanding and recover only what the employee agreed to or the law allows."
  - "Give a signed receipt for everything returned."
fields:
  - { id: company, label: Company name, required: true, group: Employee }
  - { id: e_name, label: Employee name, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: e_designation, label: Designation and department, required: true, group: Employee }
  - { id: lwd, label: Last working day, type: date, required: true, group: Employee }
  - { id: manager, label: Reporting manager, group: Employee }
sources: []
related:
  - toolkit/offboarding-checklist
  - toolkit/full-and-final-settlement-calculator
  - toolkit/relieving-letter
faq:
  - q: Can an employer withhold the final settlement until no-dues clearance is complete?
    a: No. Under the Code on Wages, final wages are due within two working days of the last working day. Record what is outstanding and recover agreed amounts, but don't hold back wages, the relieving letter or the experience letter to force a return.
keywords: [no dues certificate format, no dues clearance form employee, exit clearance form, full and final clearance checklist]
---

**{{company}}**

## No-dues clearance

| Detail | Answer |
| --- | --- |
| Employee | {{e_name}} |
| Employee ID | {{e_id}} |
| Designation and department | {{e_designation}} |
| Reporting manager | {{manager}} |
| Last working day | {{lwd}} |

### Clearance by department

| Department | Items to check | Returned or settled | Amount to recover (₹) | Name, signature and date |
| --- | --- | --- | --- | --- |
| Manager | Handover of work, files and client contacts | | | |
| IT | Laptop, charger, phone, data card; email and system access closed | | | |
| Admin and security | ID card, access card, keys, locker, parking pass | | | |
| Finance | Advances, loans, travel and expense claims, corporate card | | | |
| HR | Leave balance, notice period, documents returned, exit interview | | | |
| Other | | | | |

**Total to recover, as agreed:** ₹\_\_\_\_\_\_\_\_\_\_\_\_

Recoveries are made only as agreed by the employee or allowed by law, and are shown on the final settlement statement. The final settlement and the relieving letter are not held back for clearance.

Employee: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_

HR: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
