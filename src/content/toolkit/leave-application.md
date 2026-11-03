---
title: Leave application
description: A short, polite leave request email for any kind of leave, with dates, handover and contact details. Fill it in and copy it into an email, or download it.
kind: letter
stage: pay
audiences: [employees, students]
order: 75
checked: 2026-11-02
useWhen: You need to ask your manager for leave in writing, whether it is planned leave, sick leave or leave for a family event.
tips:
  - "Check your leave balance first. Your company's leave policy says how far ahead to ask for planned leave."
  - "You don't have to share private details. For sick leave, 'I am unwell' is enough; your policy may ask for a medical certificate if you are away for several days."
  - "If you were taken ill suddenly, call or message your manager first, then send this as soon as you can."
  - "Keep the approval email. It is your record if there is a question about your attendance later."
fields:
  - { id: your_name, label: Your full name, required: true, group: You }
  - { id: employee_id, label: Employee ID, group: You }
  - { id: manager_name, label: Your manager's name, required: true, group: You }
  - { id: leave_type, label: Type of leave, type: select, required: true, group: Leave, options: ["earned leave", "casual leave", "sick leave", "maternity leave", "paternity leave", "bereavement leave", "compensatory off", "leave without pay"] }
  - { id: from_date, label: First day of leave, type: date, required: true, group: Leave }
  - { id: to_date, label: Last day of leave, type: date, required: true, group: Leave }
  - { id: days, label: Number of working days, type: number, required: true, group: Leave }
  - { id: reason, label: A short reason, type: textarea, group: Optional, placeholder: "I am attending my sister's wedding in Mysuru.", help: "Optional. Share only what you are comfortable with." }
  - { id: handover, label: Who will cover your work, type: textarea, group: Optional, placeholder: "Arjun has agreed to cover the weekly client report, and my open tickets are updated with notes." }
  - { id: contact, label: How to reach you if something is urgent, group: Optional, placeholder: "+91 98450 00000 (calls only)" }
related:
  - toolkit/leave-policy
  - toolkit/working-days-calculator
  - handbooks/labour-law/03-leave-and-working-hours
  - glossary/earned-leave
faq:
  - q: How do I write a leave application to my manager?
    a: Keep it short. Give the type of leave, the dates and the number of working days, say who will cover your work, and ask for approval. A one-line reason is enough.
  - q: Can I apply for leave after I have taken it?
    a: For sudden illness or an emergency, yes. Tell your manager as soon as you can by phone or message, then send a written application when you are able.
  - q: Can my manager refuse my leave?
    a: Planned leave usually needs approval, and a manager can ask you to move the dates for a genuine work reason. Your company's leave policy sets the rules. Under the OSH Code, earned leave that a 'worker' applies for and is refused can be carried forward, so it is not lost.
keywords: [leave application, leave application format, leave request email to manager, sick leave application, casual leave application]
---

**Subject: Leave request from {{from_date}} to {{to_date}}**

Dear {{manager_name}},

I would like to apply for {{leave_type}} from {{from_date}} to {{to_date}}. That is {{days}} working days.

{{reason}}

While I am away, {{handover}}

If something urgent comes up, you can reach me at {{contact}}.

Please let me know if these dates work, or if you would like to talk about them.

Thank you,

{{your_name}}

Employee ID: {{employee_id}}
