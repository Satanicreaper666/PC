---
title: Domestic inquiry report
description: The inquiry officer's report on misconduct charges, with the procedure followed, the evidence on each charge, the findings and the reasons, ready for the employee's comments before any penalty.
kind: form
stage: grow
audiences: [hr]
order: 26.5
checked: 2026-11-08
useWhen: An inquiry officer has finished hearing the evidence on a charge-sheet and must record the findings and reasons for the disciplinary authority.
tips:
  - "<strong>Findings, not penalties.</strong> The report says whether each charge is proved, partly proved or not proved, and why. The penalty is for the disciplinary authority to decide, after it has heard the employee on the report."
  - "<strong>Reason from the evidence on record.</strong> Refer to the documents and witness statements produced at the inquiry, deal with the employee's defence and say why you prefer one account to another. Don't rely on anything the employee wasn't shown."
  - "<strong>Record the fairness steps.</strong> Notices given, adjournments asked for and granted, the helper allowed, documents supplied and witnesses cross-examined. A tribunal will look for these first."
  - "<strong>Share it before deciding.</strong> Send a copy to the employee and give them time to comment on the findings, then decide. The <a href=\"/toolkit/penalty-order/\">penalty order</a> records that step."
fields:
  - { id: company, label: Company name, required: true, group: The case }
  - { id: ref_no, label: Charge-sheet reference and date, required: true, group: The case }
  - { id: e_name, label: Employee's full name, required: true, group: The case }
  - { id: e_designation, label: Designation and ID, required: true, group: The case }
  - { id: officer, label: Inquiry officer, required: true, group: The case }
  - { id: appointed_by, label: Appointed by and on, group: The case, placeholder: "the Plant Head, on 25 October 2026" }
  - { id: presenting, label: Presenting officer, group: The case }
  - { id: helper, label: Employee helped by, group: The case, placeholder: "Mr Prakash, a co-worker", help: "Or 'nobody, by the employee's choice'." }
  - { id: hearings, label: Hearings held, type: textarea, required: true, group: Procedure, placeholder: "4 November 2026: charges read and explained; employee denied both charges.\n7 November 2026: company witnesses examined and cross-examined.\n11 November 2026: employee's evidence and witness; closing statements.", help: "One per line: date and what happened." }
  - { id: fairness, label: Fairness steps, type: textarea, required: true, group: Procedure, placeholder: "Copies of all documents given to the employee on 28 October 2026.\nAdjournment asked for on 4 November granted to 7 November.\nEach day's record read over and signed by the employee.", help: "Notices, documents supplied, adjournments, language, records signed." }
  - { id: company_evidence, label: Evidence for the charges, type: textarea, required: true, group: Evidence, help: "Documents marked and witnesses examined, one per line." }
  - { id: defence_evidence, label: Evidence for the employee, type: textarea, required: true, group: Evidence, help: "Write 'None produced' if none." }
  - { id: findings, label: Findings on each charge, with reasons, type: textarea, required: true, group: Findings, placeholder: "Charge 1: Proved. The CCTV recording (exhibit C-2) shows the guard removed from 3.02 to 3.17 pm, and the employee accepted in cross-examination that he operated the press during that time. His explanation that the guard was faulty is not supported by the maintenance log (C-3), which records it working at 2.00 pm.\nCharge 2: Not proved. The supervisor's account and the employee's differ, no other witness heard the exchange, and the CCTV has no sound.", help: "One paragraph per charge: proved, partly proved or not proved, and why." }
  - { id: report_date, label: Date of the report, type: date, required: true, group: Signature }
sources:
  - title: "Sur Enamel and Stamping Works (P) Ltd v. Their Workmen, 7 May 1963 (what makes a domestic inquiry proper)"
    url: https://www.orissahighcourt.nic.in/uploads/vernacular_judgements/sc_judgements/Civil%20Appeal_681_1962_e.pdf
    publisher: Supreme Court of India (copy on the Orissa High Court website)
related:
  - toolkit/inquiry-notice
  - toolkit/penalty-order
  - toolkit/charge-sheet
  - toolkit/disciplinary-process-guide
faq:
  - q: Should the inquiry report recommend a penalty?
    a: No. The inquiry officer finds the facts. The disciplinary authority decides the penalty after reading the report and the employee's comments on it, and after weighing the employee's record and the seriousness of what was proved.
  - q: Must the employee get a copy of the inquiry report?
    a: Yes. Give the employee a copy and a fair chance to comment on the findings before any penalty is decided. Skipping this step is a common reason penalties are set aside.
keywords: [domestic inquiry report format, enquiry officer report, inquiry findings report misconduct, enquiry report sample india]
---

**{{company}}**
**Private and confidential**

## Domestic inquiry report

| Detail | Answer |
| --- | --- |
| Charge-sheet | {{ref_no}} |
| Employee | {{e_name}}, {{e_designation}} |
| Inquiry officer | {{officer}} |
| Appointed by | {{appointed_by}} |
| Presenting officer | {{presenting}} |
| Employee helped by | {{helper}} |

### 1. Hearings

{{hearings}}

### 2. Steps taken to make the inquiry fair

{{fairness}}

### 3. Evidence

**In support of the charges**

{{company_evidence}}

**For the employee**

{{defence_evidence}}

### 4. Findings and reasons

{{findings}}

These findings are based only on the evidence produced at the inquiry and recorded above. This report makes no recommendation on penalty.

Inquiry officer: {{officer}}

Date: {{report_date}}

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
