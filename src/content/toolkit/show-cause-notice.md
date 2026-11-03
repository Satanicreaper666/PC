---
title: Show-cause notice
description: A fair show-cause notice that sets out one specific allegation and its evidence, gives time to reply and a hearing, and says clearly that nothing is decided yet.
kind: letter
stage: grow
audiences: [hr, founders, employees]
order: 24
checked: 2026-11-02
useWhen: You have a specific allegation of misconduct against an employee and need their explanation before you decide anything.
tips:
  - "<strong>Look into it first.</strong> Collect the evidence before you write: records, documents, CCTV and signed statements. The notice should describe one specific incident (what happened, when and where) and the rule it concerns, not a general complaint about someone's conduct."
  - "<strong>Follow your own rules.</strong> If standing orders apply to you (the IR Code requires them in industrial establishments with 300 or more workers), follow the procedure they set out; otherwise follow your HR policy. A sexual harassment complaint doesn't go through this notice: it goes to the <a href=\"/handbooks/labour-law/posh-compliance/\">Internal Committee</a> under the POSH Act."
  - "<strong>Plan a fair inquiry.</strong> If the reply doesn't settle the facts, hold an inquiry before any serious penalty, with the safeguards the Supreme Court set out: the charge made clear, witnesses heard, ordinarily in the employee's presence, a fair chance to question them and to give their own evidence, and findings with reasons."
  - "<strong>Deliver it properly and keep records.</strong> Give the notice in a language the employee understands, and keep proof of delivery, the reply, any hearing or inquiry notes and the decision in one file. Check how similar cases were handled before, so that people are treated alike."
  - "<strong>Common mistakes:</strong> a vague charge such as 'indiscipline', no dates or evidence, too little time to reply, wording that decides the outcome ('you are guilty of', 'you will be dismissed'), and using a show-cause notice for poor performance, which needs an <a href=\"/toolkit/performance-improvement-plan/\">improvement plan</a> instead."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: ref_no, label: Reference number, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: hr_contact, label: Who to reply to, required: true, group: Company, placeholder: "Anita Rao, HR Manager, anita.rao@yourcompany.in", help: "Name, role and email. The employee also asks this person to see the evidence." }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_designation, label: Designation, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: e_department, label: Department, group: Employee }
  - { id: incident_date, label: Date of the incident, type: date, required: true, group: The allegation, help: "If it happened on more than one day, give the first date here and the others in the description." }
  - { id: incident_time, label: Time, group: The allegation, placeholder: "About 3.15 pm" }
  - { id: incident_place, label: Place, required: true, group: The allegation, placeholder: "Power press, line 2, Peenya plant" }
  - { id: allegation, label: What is alleged to have happened, type: textarea, required: true, group: The allegation, placeholder: "It is alleged that you operated the power press with its safety guard removed for about 15 minutes.", help: "Facts only, in one to three sentences. Write 'It is alleged that…', not that it happened." }
  - { id: rule_ref, label: The rule or policy it concerns, group: The allegation, placeholder: "rule 7 of the plant safety manual (machine guards)", help: "Written to follow 'If it is proved, this would be a breach of…'." }
  - { id: evidence, label: Evidence, type: textarea, required: true, group: The allegation, placeholder: "The shift supervisor's incident report, dated 14 October 2026\nThe CCTV recording of line 2, 3.00 to 3.30 pm on 14 October 2026\nThe maintenance log, showing the guard was in place at the start of the shift", help: "One item per line. List everything you may rely on, including anything that helps the employee." }
  - { id: reply_days, label: Days allowed to reply, type: number, required: true, default: "7", group: Reply and hearing, help: "Counted from the day the employee receives the notice. Give more time if the evidence is long." }
  - { id: companion, label: Who may come with the employee to a hearing, default: "a colleague of your choice", group: Reply and hearing, help: "What your standing orders or HR policy allow. Clear it if they don't provide for a companion." }
  - { id: suspension_from, label: Suspended from (only if suspending), type: date, group: Suspension, help: "Leave empty unless you are suspending the employee while the matter is looked into. Suspension pending inquiry is not a penalty." }
  - { id: subsistence, label: Subsistence allowance during suspension, group: Suspension, help: "Only if suspending: what will be paid, as your standing orders or HR policy provide, e.g. '50% of your wages for the first 90 days, and 75% after that if the inquiry takes longer for reasons not caused by you'." }
sources:
  - title: "The Industrial Relations Code, 2020 (section 28, standing orders for 300 or more workers; section 38, suspension pending inquiry and subsistence allowance)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
  - title: "Sur Enamel and Stamping Works (P) Ltd v. Their Workmen, 7 May 1963 (what makes a domestic inquiry proper)"
    url: https://www.orissahighcourt.nic.in/uploads/vernacular_judgements/sc_judgements/Civil%20Appeal_681_1962_e.pdf
    publisher: Supreme Court of India (copy on the Orissa High Court website)
  - title: "The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (sections 9 and 11: complaints to and inquiry by the Internal Committee)"
    url: https://www.indiacode.nic.in/handle/123456789/2104
    publisher: India Code
related:
  - toolkit/warning-letter
  - toolkit/termination-letter
  - toolkit/performance-improvement-plan
  - handbooks/labour-law/06-termination-grievance-and-disputes
  - handbooks/labour-law/07-posh-compliance
  - glossary/show-cause-notice
  - glossary/domestic-inquiry
  - glossary/standing-orders
faq:
  - q: What should a show-cause notice contain?
    a: The specific allegation (what happened, when and where), the rule it concerns, the evidence and how to see it, the time allowed to reply, the right to be heard, and a clear statement that no decision has been made. It should be signed by someone with the authority to act on it.
  - q: How much time should an employee get to reply to a show-cause notice?
    a: Use the period your standing orders or HR policy set, if they set one. If not, give enough time to read the evidence and prepare a reply. This template uses seven days, and you should agree to any reasonable request for more.
  - q: Can an employee be suspended while a show-cause notice is pending?
    a: "Suspension pending inquiry is not a punishment, so use it only for a good reason, such as a risk to evidence, people or property. Where standing orders apply, the inquiry should ordinarily finish within 90 days of the suspension, and a suspended worker gets a subsistence allowance: 50% of wages for the first 90 days, and 75% after that if the delay isn't the worker's fault."
  - q: How should an employee reply to a show-cause notice?
    a: In writing, before the deadline. Ask to see the evidence, say which parts of the allegation you accept, deny or want to explain, and name any documents or witnesses that support you. If you need more time or want to be heard in person, ask in writing.
  - q: Is a show-cause notice the same as a charge-sheet?
    a: The terms are often used for the same thing. Some employers send a show-cause notice first and a formal charge-sheet if an inquiry follows. Either way, the employee must know the specific charge and have a fair chance to answer it.
keywords: [show cause notice format, show cause notice to employee for misconduct, show cause notice sample india, explanation letter to employee, how to reply to show cause notice]
draft: false
---

**{{company}}**
**Private and confidential**

Ref: {{ref_no}}

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

Department: {{e_department}}

**Subject: Show-cause notice: request for your explanation**

Dear {{e_name}},

This notice sets out an allegation against you and asks for your explanation. No decision has been made, and none will be made until we have considered your reply.

**The allegation**

- Date: {{incident_date}}
- Time: {{incident_time}}
- Place: {{incident_place}}

{{allegation}}

If it is proved, this would be a breach of {{rule_ref}}.

**The evidence**

The allegation is based on:

{{evidence}}

You can see these documents, or ask for copies, by contacting {{hr_contact}}.

**Your reply**

Please send your written explanation to {{hr_contact}} within {{reply_days}} days of receiving this notice. You may accept, deny or explain any part of the allegation, and you may send documents or name witnesses you would like us to consider.

If you need more time, for example to read the evidence, please ask before the deadline. We will agree to any reasonable request.

You may also ask to explain your side in person at a hearing.

You may bring {{companion}} with you to the hearing.

If you would like this notice in another language, or explained to you in person, please tell us.

If we receive no reply and no request for more time, we will consider the matter on the information we have.

**What happens next**

We will consider your reply carefully before deciding what to do. If the facts are disputed, we will hold an inquiry at which you can see the evidence, question any witnesses and give your own evidence. We will tell you our decision, and the reasons for it, in writing.

**Suspension pending inquiry.** You are suspended from {{suspension_from}} while this matter is looked into. Suspension is not a penalty, and it does not mean that any decision has been made about the allegation.

During the suspension, you will be paid a subsistence allowance of {{subsistence}}.

We will keep this matter confidential and share it only with the people who need to know.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this notice. Signing confirms receipt only; it does not mean I accept the allegation.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
