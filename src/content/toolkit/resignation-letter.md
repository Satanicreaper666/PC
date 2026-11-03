---
title: Resignation letter
description: A clear, polite resignation letter that states your last working day, offers a proper handover and asks about next steps. Fill it in, then download it as Word or PDF.
kind: letter
stage: exit
audiences: [employees, students]
order: 20
checked: 2026-11-02
useWhen: You have decided to leave and want to resign in writing, the way most appointment letters require.
tips:
  - "Check the notice period in your appointment letter before you choose a last working day. No law sets one notice period for private-sector jobs; your contract does."
  - "Send it by email to your manager, copied to HR, and keep the reply. It is your record of the date you resigned."
  - "You don't have to give a reason. If you do, keep it short and positive."
  - "Ask HR how they will pay your final settlement. Under the Code on Wages, final wages are due within two working days of leaving."
fields:
  - { id: your_name, label: Your full name, required: true, group: You }
  - { id: your_role, label: Your designation, required: true, group: You }
  - { id: employee_id, label: Employee ID, group: You }
  - { id: manager_name, label: "Manager's name", required: true, group: Company }
  - { id: company, label: Company name, required: true, group: Company }
  - { id: last_day, label: Last working day, type: date, required: true, group: Dates, help: "Usually the day you resign plus your notice period." }
  - { id: notice_period, label: Your notice period, group: Dates, placeholder: "60 days" }
  - { id: reason, label: A line about why you're leaving, type: textarea, group: Optional, placeholder: "I have accepted a role that fits my plans for the next few years." }
  - { id: request, label: Anything you'd like to ask for, type: textarea, group: Optional, placeholder: "If the handover allows, I would be grateful if we could discuss an earlier last working day." }
  - { id: personal_email, label: Personal email for after you leave, type: email, group: Optional }
related:
  - toolkit/notice-period-calculator
  - toolkit/full-and-final-settlement-calculator
  - toolkit/gratuity-calculator
  - toolkit/relieving-letter
  - toolkit/experience-letter
  - glossary/notice-period
faq:
  - q: Is there a legal notice period for resignation in India?
    a: No law sets a general resignation notice period for private-sector employees. It comes from your appointment letter or employment contract, so check it before you resign.
  - q: Can I leave before my notice period ends?
    a: Only if your employer agrees to release you early, or your contract allows you to pay for the shortfall (a notice buy-out). Get any agreement in writing.
  - q: When will I get my full and final settlement?
    a: The Code on Wages requires wages to be paid within two working days of resignation, commonly read as two working days after your last working day; there is no official clarification yet. Gratuity, if you are eligible, is due within 30 days.
  - q: Should I resign by email or on paper?
    a: Email is fine unless your contract asks for something else. It gives you a dated record, and you can attach this letter as a PDF.
keywords: [resignation letter, resignation letter format, resignation email to manager, simple resignation letter, resignation letter with notice period]
---

{{today}}

Dear {{manager_name}},

Please accept this letter as my formal resignation from the role of {{your_role}} at {{company}}.

My employee ID is {{employee_id}}.

My last working day will be {{last_day}}.

This is in line with my notice period of {{notice_period}}.

{{reason}}

I will hand over my work in an orderly way before I leave, and I am happy to help train whoever takes over.

{{request}}

Please let me know the next steps for my handover, final settlement and relieving letter.

After I leave, you can reach me at {{personal_email}}.

Thank you for the opportunities and support during my time here.

Yours sincerely,

{{your_name}}
