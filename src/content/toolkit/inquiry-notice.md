---
title: Domestic inquiry notice
description: Notice of a domestic inquiry into misconduct charges, naming the inquiry officer, the date, time and place, and the employee's rights to a co-worker's help, the evidence and witnesses.
kind: letter
stage: grow
audiences: [hr, founders]
order: 26
checked: 2026-11-08
useWhen: The employee has replied to a charge-sheet (or not replied in time), the facts are disputed, and you have appointed an inquiry officer.
tips:
  - "<strong>Choose an independent inquiry officer.</strong> Someone who wasn't a witness, didn't investigate the incident and won't decide the penalty. An external officer helps when the charges are serious or senior people are involved."
  - "<strong>Give enough notice.</strong> Several working days at least, so the employee can prepare and arrange a co-worker to help. Agree to a reasonable request to move the date."
  - "<strong>Hold the hearing in a language the employee understands.</strong> Record the proceedings, and give the employee a copy of each day's record to sign."
  - "<strong>Ex parte only as a last resort.</strong> If the employee doesn't attend, send a second notice. Go ahead without them only if they stay away without good reason after fair warning, and record why."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: ref_no, label: Reference number, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_designation, label: Designation, required: true, group: Employee }
  - { id: e_id, label: Employee ID, required: true, group: Employee }
  - { id: charge_ref, label: Charge-sheet reference and date, required: true, group: Inquiry, placeholder: "PEE/HR/2026/114 of 18 October 2026" }
  - { id: officer, label: Inquiry officer, required: true, group: Inquiry, placeholder: "Ms Leela Menon, independent inquiry officer" }
  - { id: presenting, label: Presenting officer (for the company), group: Inquiry, placeholder: "Mr Arun Shetty, Senior Manager, HR" }
  - { id: hearing_date, label: Date of the first hearing, type: date, required: true, group: Inquiry }
  - { id: hearing_time, label: Time, required: true, group: Inquiry, placeholder: "10.30 am" }
  - { id: hearing_place, label: Place, required: true, group: Inquiry, placeholder: "Conference room 2, administration block, Peenya plant" }
  - { id: companion, label: Who may help the employee, required: true, default: "a co-worker of your choice", group: Inquiry, help: "As your standing orders or policy allow." }
  - { id: language, label: Language of the proceedings, required: true, default: "English, with Kannada interpretation if you ask for it", group: Inquiry }
  - { id: officer_contact, label: Contact for the inquiry, required: true, group: Inquiry, placeholder: "inquiry.officer@yourcompany.in" }
  - { id: signatory_name, label: Issued by, required: true, group: Signature, help: "The inquiry officer, or the authority that appointed them." }
  - { id: signatory_role, label: Designation, required: true, group: Signature }
sources:
  - title: "Sur Enamel and Stamping Works (P) Ltd v. Their Workmen, 7 May 1963 (what makes a domestic inquiry proper)"
    url: https://www.orissahighcourt.nic.in/uploads/vernacular_judgements/sc_judgements/Civil%20Appeal_681_1962_e.pdf
    publisher: Supreme Court of India (copy on the Orissa High Court website)
  - title: "The Industrial Relations Code, 2020 (standing orders; section 38, inquiry ordinarily within 90 days of suspension)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
related:
  - toolkit/charge-sheet
  - toolkit/inquiry-report
  - toolkit/penalty-order
  - toolkit/disciplinary-process-guide
  - glossary/domestic-inquiry
faq:
  - q: Can the employee bring a lawyer to a domestic inquiry?
    a: Usually not, unless the standing orders or policy allow it, or the company is itself represented by a lawyer or a legally trained officer. A co-worker or, where standing orders allow, a union representative is the usual helper.
  - q: What if the employee doesn't attend the inquiry?
    a: Send a second notice warning that the inquiry will go ahead without them. If they still don't attend without good reason, the inquiry officer can proceed ex parte, recording why. Courts look closely at ex parte inquiries, so be patient and keep proof of every notice.
keywords: [domestic inquiry notice format, notice of enquiry to employee, enquiry notice for misconduct, departmental inquiry notice india]
---

**{{company}}**
**Private and confidential**

Ref: {{ref_no}}

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

**Subject: Notice of domestic inquiry**

Dear {{e_name}},

A domestic inquiry will be held into the charges in charge-sheet {{charge_ref}}. {{officer}} has been appointed as the inquiry officer.

**When and where**

The first hearing will be held on {{hearing_date}} at {{hearing_time}}, at {{hearing_place}}. Please attend in person.

**The company's case** will be presented by {{presenting}}.

**Your rights at the inquiry**

- You may be helped at the inquiry by {{companion}}.
- You may see the documents listed in the charge-sheet before the hearing, and ask for copies.
- You may question every witness who gives evidence in support of the charges.
- You may give your own evidence, produce documents and call your own witnesses.
- The proceedings will be in {{language}}, and you will be given a copy of the record of each hearing.

If you can't attend on this date for a good reason, please tell {{officer_contact}} as soon as possible, and a new date will be fixed.

If you don't attend and give no reason, the inquiry may go ahead without you.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this notice.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
