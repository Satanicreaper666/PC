---
title: Warning letter
description: A warning letter issued after a show-cause reply has been considered, with the finding and reasons, what is expected now, how long it stays on file and how to appeal.
kind: letter
stage: grow
audiences: [hr, founders, employees]
order: 26
checked: 2026-11-02
useWhen: You have considered an employee's reply to a show-cause notice, found the allegation proved, and decided that a written warning is the right outcome.
tips:
  - "<strong>Decide only after the process.</strong> Read the reply and any hearing or inquiry notes in full, and check any new facts the reply raises. If the evidence doesn't support the allegation, close the matter in writing instead of warning someone 'to be safe'."
  - "<strong>Stick to what the notice said.</strong> The finding must be about the allegation in the <a href=\"/toolkit/show-cause-notice/\">show-cause notice</a>. If something new has come up, deal with it in a fresh notice, so the employee can answer it."
  - "<strong>Be proportionate and consistent.</strong> Weigh the employee's record and explanation, and check how similar cases were handled. If standing orders apply to you (industrial establishments with 300 or more workers), use the penalties and steps they set out; otherwise follow your HR policy."
  - "<strong>Keep records.</strong> File the notice, the reply, any hearing or inquiry notes, this letter and proof of delivery together. If your policy says how long a warning stays active, note the end date and don't rely on the warning after it."
  - "<strong>Common mistakes:</strong> warning someone who was never asked to explain, ignoring what the reply said, vague expectations such as 'improve your behaviour', threats that any future lapse means dismissal, and leaving out the right of appeal."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: ref_no, label: Reference number, group: Company }
  - { id: signatory_name, label: Signed by, required: true, group: Company }
  - { id: signatory_role, label: Signatory's designation, required: true, group: Company }
  - { id: e_name, label: Employee's full name, required: true, group: Employee }
  - { id: e_designation, label: Designation, required: true, group: Employee }
  - { id: e_id, label: Employee ID, group: Employee }
  - { id: e_department, label: Department, group: Employee }
  - { id: scn_date, label: Date of the show-cause notice, type: date, required: true, group: The process }
  - { id: matter, label: What the notice was about, required: true, group: The process, placeholder: "the alleged operation of the power press on line 2 with its safety guard removed on 14 October 2026", help: "Written to follow 'the show-cause notice … about…'." }
  - { id: reply_date, label: Date of the employee's reply, type: date, group: The process, help: "Leave empty if no reply came." }
  - { id: hearing_date, label: Date of the hearing, type: date, group: The process, help: "Only if the employee was heard in person." }
  - { id: inquiry_date, label: Date of the inquiry report, type: date, group: The process, help: "Only if an inquiry was held. Attach the report." }
  - { id: reply_status, label: "Did the employee reply?", type: select, required: true, group: The process, options: ["We have read your reply carefully and considered it together with the evidence.", "We did not receive a reply by the date in the notice, and you did not ask for more time, so we have considered the matter on the evidence we have."] }
  - { id: reply_summary, label: "What the reply said, in brief", type: textarea, group: The process, placeholder: "the guard was slowing down the work, and that you had planned to put it back before the end of the shift.", help: "Written to follow 'In your reply, you said that…'. Leave empty if no reply came." }
  - { id: finding, label: The finding, type: textarea, required: true, group: Decision, placeholder: "We find that on 14 October 2026 you operated the power press on line 2 with its safety guard removed for about 15 minutes, in breach of rule 7 of the plant safety manual.", help: "Only what the evidence shows, and only about the allegation in the notice." }
  - { id: reasons, label: The reasons, type: textarea, required: true, group: Decision, placeholder: "The CCTV recording shows the guard off from 3.10 to 3.25 pm while you were operating the press, and the maintenance log shows it was in place at the start of the shift. The manual doesn't allow the guard to be removed for any reason, because of the risk of serious injury. We have taken into account your six years of service and that there is no earlier warning on your file.", help: "Say what the evidence shows, answer the main points of the reply, and say what you took into account." }
  - { id: warning_type, label: Type of warning, type: select, required: true, group: Decision, options: ["written warning", "final written warning"], default: "written warning" }
  - { id: expectation, label: What you expect from now on, type: textarea, required: true, group: Decision, placeholder: "From now on, please operate the press only with the guard in place. If the guard causes a problem, stop the machine and tell your shift supervisor." }
  - { id: support, label: Support offered, type: textarea, group: Decision, placeholder: "Your shift supervisor will take you through the machine-safety training again by 15 November 2026." }
  - { id: warning_period, label: How long the warning stays active, group: Decision, placeholder: "12 months", help: "Only if your standing orders or HR policy set a period." }
  - { id: appeal_to, label: Appeal to (name or role), required: true, group: Appeal, placeholder: "Rahul Mehta, Plant Head, rahul.mehta@yourcompany.in", help: "Ideally someone senior who wasn't involved in this decision." }
  - { id: appeal_days, label: Days allowed to appeal, type: number, required: true, default: "7", group: Appeal, help: "Use the period your standing orders or HR policy set, if they set one." }
sources:
  - title: "The Industrial Relations Code, 2020 (section 28, standing orders for industrial establishments with 300 or more workers)"
    url: https://www.indiacode.nic.in/bitstream/123456789/22040/1/aa202035.pdf
    publisher: India Code
  - title: "Sur Enamel and Stamping Works (P) Ltd v. Their Workmen, 7 May 1963 (charge, evidence, chance to answer, findings with reasons)"
    url: https://www.orissahighcourt.nic.in/uploads/vernacular_judgements/sc_judgements/Civil%20Appeal_681_1962_e.pdf
    publisher: Supreme Court of India (copy on the Orissa High Court website)
related:
  - toolkit/show-cause-notice
  - toolkit/termination-letter
  - toolkit/performance-improvement-plan
  - handbooks/labour-law/06-termination-grievance-and-disputes
  - glossary/show-cause-notice
  - glossary/domestic-inquiry
  - glossary/standing-orders
faq:
  - q: Can a warning letter be given without a show-cause notice?
    a: It's safer not to. Before any penalty, including a warning, the employee should know the specific allegation and have a fair chance to answer it. Your standing orders or HR policy may set the exact steps.
  - q: How long does a warning letter stay on an employee's record?
    a: As long as your standing orders or HR policy say. If they set a period, state it in the letter, apply it the same way to everyone, and don't count the warning against the employee once it ends.
  - q: Can an employee appeal against a warning letter?
    a: They should be able to. Name who will hear the appeal, ideally a senior person who wasn't involved in the decision, and the time allowed. If standing orders apply to you, follow their appeal procedure.
  - q: What if the employee refuses to sign the warning letter?
    a: The signature only confirms receipt. Note the date and how you delivered the letter, for example by email or by hand with a witness present, and keep that note on file. Don't pressure anyone to sign.
  - q: What is the difference between a warning letter and a show-cause notice?
    a: A show-cause notice asks for an explanation before anything is decided. A warning letter records the decision after the explanation has been considered, gives the reasons and offers a right of appeal.
keywords: [warning letter format, warning letter to employee for misconduct, final warning letter format india, disciplinary warning letter, warning letter after show cause notice]
draft: false
---

**{{company}}**
**Private and confidential**

Ref: {{ref_no}}

{{today}}

**To:** {{e_name}}, {{e_designation}}

Employee ID: {{e_id}}

Department: {{e_department}}

**Subject: Decision on the show-cause notice dated {{scn_date}}**

Dear {{e_name}},

This letter gives you our decision on the show-cause notice dated {{scn_date}} about {{matter}}.

**How we reached this decision**

- Your written reply, dated {{reply_date}}
- A hearing on {{hearing_date}}, where you explained your side in person
- An inquiry, whose report dated {{inquiry_date}} is attached

{{reply_status}}

In your reply, you said that {{reply_summary}}

**Our finding**

{{finding}}

{{reasons}}

**The warning**

For these reasons, we are giving you a {{warning_type}}.

{{expectation}}

{{support}}

This warning will stay active on your file for {{warning_period}} from the date of this letter, as our policy provides. After that, it will not be taken into account in any future disciplinary matter.

If there is a similar issue in future, we will again follow a fair process, and this warning may be taken into account in deciding what to do.

**Your right to appeal**

If you disagree with this decision, you may appeal in writing to {{appeal_to}} within {{appeal_days}} days of receiving this letter, giving your reasons. Where possible, someone who was not involved in this decision will hear your appeal.

Yours sincerely,

{{signatory_name}}
{{signatory_role}}
{{company}}

---

**Acknowledgement of receipt**

I have received this letter. Signing confirms receipt only; it does not mean I agree with its contents.

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_
