---
title: Charge-sheet for misconduct
description: A formal charge-sheet that frames each charge precisely, lists the evidence and witnesses, and gives the employee time to reply before a domestic inquiry, as natural justice requires.
kind: letter
stage: grow
audiences: [hr, founders]
order: 25
checked: 2026-11-08
useWhen: An employee's reply to a show-cause notice doesn't settle the facts, or the allegation is serious enough to need a domestic inquiry before any major penalty.
tips:
  - "<strong>One charge, one act.</strong> Write each charge as a specific act or omission, with the date, place and the rule or standing-order clause it breaches. A vague charge ('indiscipline', 'misbehaviour') is the most common reason a dismissal is set aside."
  - "<strong>Don't prejudge.</strong> The charge-sheet says what is alleged, not what happened. Avoid 'you are guilty', and don't name the penalty you have in mind."
  - "<strong>List everything you'll rely on.</strong> Documents and witnesses not listed here shouldn't be used against the employee later. Include anything that helps them, too."
  - "<strong>Use the right procedure.</strong> Follow certified or model standing orders where they apply (industrial establishments with 300 or more workers), otherwise your HR policy. A sexual harassment complaint goes to the Internal Committee, not through this process."
  - "<strong>Next steps:</strong> if the reply doesn't settle it, appoint an independent inquiry officer and send the <a href=\"/toolkit/inquiry-notice/\">inquiry notice</a>. The <a href=\"/toolkit/disciplinary-process-guide/\">disciplinary process guide</a> covers the whole sequence."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: ref_no, label: Reference number, required: true, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company, help: "Someone with authority to take disciplinary action, as your standing orders or policy say." }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: hr_contact, label: Who to reply to, required: true, group: Company, placeholder: "Anita Rao, HR Manager, anita.rao@yourcompany.in" }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_designation, label: Designation, required: true, group: Employee }
  - { id: e_id, label: Employee ID, required: true, group: Employee }
  - { id: scn_date, label: Date of the show-cause notice, type: date, group: Background, help: "Optional, if one was sent." }
  - { id: reply_date, label: Date of the employee's reply, type: date, group: Background, help: "Optional." }
  - { id: charges, label: The charges, type: textarea, required: true, group: The charges, placeholder: "Charge 1: On 14 October 2026, at about 3.15 pm, at power press line 2 of the Peenya plant, you operated the press with its safety guard removed for about 15 minutes, in breach of rule 7 of the plant safety manual.\nCharge 2: On the same day, when the shift supervisor asked you to stop, you refused and continued to operate the press, in breach of clause 14(3)(a) of the standing orders (wilful insubordination).", help: "One charge per line: what, when, where, and the rule or clause it breaches." }
  - { id: evidence, label: Documents relied on, type: textarea, required: true, group: Evidence, placeholder: "Shift supervisor's incident report, 14 October 2026\nCCTV recording of line 2, 3.00 to 3.30 pm, 14 October 2026\nMaintenance log for line 2, 14 October 2026", help: "One per line." }
  - { id: witnesses, label: Witnesses, type: textarea, group: Evidence, placeholder: "Ravi Kumar, Shift Supervisor\nMeena S, Maintenance Technician", help: "One per line. Optional." }
  - { id: reply_days, label: Days allowed to reply, type: number, required: true, default: "7", group: Reply }
  - { id: companion, label: Who may help the employee at the inquiry, required: true, default: "a co-worker of your choice", group: Reply, help: "As your standing orders or policy allow." }
sources:
  - title: "The Industrial Relations Code, 2020 (section 28, standing orders; section 38, suspension and subsistence allowance)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
  - title: "Sur Enamel and Stamping Works (P) Ltd v. Their Workmen, 7 May 1963 (what makes a domestic inquiry proper)"
    url: https://www.orissahighcourt.nic.in/uploads/vernacular_judgements/sc_judgements/Civil%20Appeal_681_1962_e.pdf
    publisher: Supreme Court of India (copy on the Orissa High Court website)
related:
  - toolkit/show-cause-notice
  - toolkit/suspension-order
  - toolkit/inquiry-notice
  - toolkit/inquiry-report
  - toolkit/penalty-order
  - toolkit/disciplinary-process-guide
  - glossary/domestic-inquiry
  - glossary/standing-orders
faq:
  - q: What is the difference between a show-cause notice and a charge-sheet?
    a: A show-cause notice asks for an explanation of an allegation. A charge-sheet frames formal charges for a domestic inquiry. Many employers send a show-cause notice first and a charge-sheet only if the reply doesn't settle the facts; for serious misconduct some start with the charge-sheet.
  - q: Can new charges be added later?
    a: Only by issuing a fresh or amended charge-sheet and giving the employee time to reply to it. An inquiry can't find someone guilty of something they weren't charged with.
  - q: Must the employee be given copies of the documents?
    a: Yes, or a fair chance to inspect them, in time to prepare a defence. Refusing access to evidence relied on is a common reason inquiries are found unfair.
keywords: [charge sheet format for misconduct, charge sheet to employee, chargesheet domestic inquiry, charge sheet sample india, disciplinary charge sheet]
---

**{{company}}**
**Private and confidential**

Ref: {{ref_no}}

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

**Subject: Charge-sheet**

Dear {{e_name}},

We sent you a show-cause notice on {{scn_date}}.

We received your reply on {{reply_date}}.

Having considered the matter, we have decided that it needs a domestic inquiry.

The following charges are framed against you. They are allegations; nothing has been decided.

**The charges**

{{charges}}

**Evidence**

The charges are based on the following documents, which you can inspect, or ask for copies of, by contacting {{hr_contact}}:

{{evidence}}

**Witnesses** who may be examined in support of the charges: {{witnesses}}

**Your reply**

Please send your written reply to {{hr_contact}} within {{reply_days}} days of receiving this charge-sheet. Say which charges you admit or deny, and give any explanation, documents or names of witnesses you would like considered. If you need more time to read the evidence, please ask before the deadline.

If you admit the charges, or your reply doesn't settle the facts, an independent inquiry officer will hold a domestic inquiry. You will be told the date, time and place in writing, and you may be helped by {{companion}}. At the inquiry you can see the evidence, question the witnesses and give your own evidence and witnesses.

If we receive no reply and no request for more time, the inquiry will go ahead on the evidence available.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this charge-sheet.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
