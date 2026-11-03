---
title: Leave policy template
description: A complete leave policy for Indian employers covering earned, casual and sick leave, holidays, maternity, paternity and bereavement, in line with the Labour Codes.
kind: policy
stage: pay
audiences: [hr, founders]
order: 70
checked: 2026-11-02
useWhen: You are writing or updating your company's leave policy and want one that meets the law and is easy for employees to follow.
tips:
  - "Check your state first. Shops and Establishments laws differ: Karnataka allows earned leave to build up to 45 days and gives 12 days of sickness leave a year; Maharashtra gives 8 days of casual leave and allows 45 days to build up. 'Workers' under the OSH Code can carry forward 30 days."
  - "Don't set the carry-forward limit or the sick leave below what your state allows. The policy says the more generous rule wins, but employees should not have to work that out."
  - "Maternity leave is set by law (the Code on Social Security, 2020): 26 weeks for the first two children. Paternity leave is not required by law for private employers, so the number of days is your choice."
  - "Have someone who knows your state's law read the final version, and share it with every employee at joining."
fields:
  - { id: company, label: Company name, required: true, group: Company }
  - { id: effective_date, label: Policy applies from, type: date, required: true, group: Company }
  - { id: states, label: State or states where you employ people, required: true, group: Company, placeholder: "Karnataka", help: "Used in the clause on legal minimums." }
  - { id: policy_owner, label: Policy owner, required: true, group: Company, default: "the HR team" }
  - { id: hr_contact, label: Where employees send questions, required: true, group: Company, placeholder: "hr@yourcompany.in" }
  - { id: leave_system, label: How employees apply for leave, required: true, group: Company, default: "the HR portal", help: "For example, the HR portal or an email to your manager and HR." }
  - { id: leave_year, label: Leave year, type: select, required: true, group: Leave year, options: ["1 January to 31 December", "1 April to 31 March"], default: "1 January to 31 December", help: "The OSH Code counts annual leave by calendar year, so a January to December leave year is simplest." }
  - { id: el_days, label: Earned leave days a year, type: number, required: true, group: Earned leave, default: "18", help: "Must be at least the legal minimum, which in the OSH Code and in Karnataka and Maharashtra is one day for every 20 days worked." }
  - { id: carry_cap, label: Earned leave carry-forward limit (days), type: number, required: true, group: Earned leave, default: "45", help: "Not less than your state allows: 45 days in Karnataka and Maharashtra, 30 days for OSH Code 'workers'." }
  - { id: el_notice, label: Notice for planned leave, required: true, group: Earned leave, default: "two weeks" }
  - { id: encash_rate, label: How a day of leave is valued when paid out, required: true, group: Earned leave, default: "your monthly wages divided by 26", help: "A company choice. 'Wages' under the Labour Codes can include more than basic pay; check with payroll." }
  - { id: cl_days, label: Casual leave days a year, type: number, required: true, group: Casual and sick leave, default: "8" }
  - { id: cl_max, label: Most casual leave days in a row, type: number, required: true, group: Casual and sick leave, default: "3" }
  - { id: sl_days, label: Sick leave days a year, type: number, required: true, group: Casual and sick leave, default: "12" }
  - { id: sl_cert, label: Medical certificate needed after (days in a row), type: number, required: true, group: Casual and sick leave, default: "2" }
  - { id: holidays, label: Paid public holidays a year, type: number, required: true, group: Holidays, default: "10", help: "Karnataka requires 10 paid holidays; Maharashtra 8. Check your state." }
  - { id: optional_holidays, label: Optional holidays employees choose, type: number, required: true, group: Holidays, default: "2" }
  - { id: paternity_days, label: Paternity and partner leave (working days), type: number, required: true, group: Family leave, default: "10" }
  - { id: paternity_window, label: Paternity leave can be taken within, required: true, group: Family leave, default: "six months of the birth or adoption" }
  - { id: bereavement_days, label: Bereavement leave (working days), type: number, required: true, group: Family leave, default: "5" }
  - { id: compoff_days, label: Compensatory off must be taken within (days), type: number, required: true, group: Other rules, default: "60" }
  - { id: sandwich, label: Weekends and holidays inside a leave period, type: select, required: true, group: Other rules, options: ["are not counted as leave", "are counted as leave"], default: "are not counted as leave" }
sources:
  - title: The Occupational Safety, Health and Working Conditions Code, 2020 (section 32, annual leave with wages)
    url: https://www.indiacode.nic.in/bitstream/123456789/22041/1/2020-37.pdf
    publisher: India Code
  - title: The Code on Social Security, 2020 (Chapter VI, maternity benefit)
    url: https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf
    publisher: India Code
  - title: Government announces implementation of four Labour Codes
    url: https://labour.gov.in/sites/default/files/pib2192463.pdf
    publisher: Press Information Bureau
  - title: Karnataka Shops and Commercial Establishments Act, 1961 (section 15, leave)
    url: https://prsindia.org/files/bills_acts/acts_states/karnataka/1962/1962KA8.pdf
    publisher: PRS Legislative Research
  - title: Karnataka Shops and Commercial Establishments (Amendment) Act, 2026 explained
    url: https://www.scconline.com/blog/post/2026/09/12/karnataka-shops-and-commercial-establishments-amendment-act-2026-explained/
    publisher: SCC Online
  - title: Maharashtra Shops and Establishments Act, 2017, section 18 (leave and holidays)
    url: https://lawgist.in/states/maharashtra/maharashtra-shops-and-establishments-regulation-of-employment-and-conditions-of-service-act-2017/18
    publisher: Lawgist
  - title: Supreme Court strikes down age limit on maternity leave for adoptive mothers (17 March 2026)
    url: https://www.livelaw.in/amp/top-stories/supreme-court-quashes-law-denying-maternity-leave-to-adoptive-mother-if-adopted-child-is-aged-above-3-months-526711
    publisher: LiveLaw
related:
  - handbooks/labour-law/03-leave-and-working-hours
  - handbooks/labour-law/08-state-specific-rules
  - toolkit/leave-application
  - toolkit/leave-encashment-calculator
  - toolkit/working-days-calculator
  - toolkit/annual-hr-calendar
  - glossary/earned-leave
faq:
  - q: How much earned leave is an employee entitled to under the Labour Codes?
    a: Under the OSH Code, a 'worker' who works at least 180 days in a calendar year earns one day of paid annual leave for every 20 days worked, and can carry forward up to 30 days. State Shops and Establishments Acts also apply and some give more, so check your state.
  - q: Is casual or sick leave required by law in India?
    a: There is no national minimum for private employers. Casual and sick leave come from state Shops and Establishments Acts (for example, 12 days of sickness leave in Karnataka and 8 days of casual leave in Maharashtra), standing orders where they apply, and company policy.
  - q: Is paternity leave mandatory for private companies?
    a: No central law requires it, so the number of days is the employer's choice. Central government employees get 15 days, which some employers use as a benchmark.
  - q: Does the Karnataka Shops and Establishments Act still apply to my company?
    a: An amendment in force from 4 September 2026 excludes establishments with 10 or more workers that are registered under the OSH Code. Experts differ on whether this removes them from the whole Act or only from registration, so until it is settled, keep giving at least the leave the Karnataka Act sets.
  - q: Who gets 26 weeks of maternity leave?
    a: A woman who has worked at least 80 days in the 12 months before her expected delivery gets 26 weeks of paid leave if she has fewer than two surviving children, and 12 weeks if she has two or more. Adopting and commissioning mothers get 12 weeks.
  - q: What happens to unused earned leave when someone leaves?
    a: It is paid out with the final settlement. For OSH Code 'workers' who are discharged, dismissed or who quit, the law says it must be paid within two working days.
keywords: [leave policy template india, leave policy for employees, earned leave casual leave sick leave policy, leave policy as per labour code, company leave policy format]
---

## {{company}} leave policy

Applies from {{effective_date}}. Owned by {{policy_owner}}.

### 1. What this policy covers

This policy explains the leave you can take, how to apply for it and how it is paid. It applies to every employee of {{company}}, including people on probation and on fixed-term contracts. Fixed-term employees get the same leave as permanent employees, in proportion to the time they work.

### 2. Legal minimums

This policy is written to give at least the leave that the law requires, including the Occupational Safety, Health and Working Conditions Code, 2020, the Code on Social Security, 2020, and the Shops and Establishments law of {{states}}. If any law that applies to you gives you more than this policy, you get the more generous entitlement. Where we employ people in more than one state, the law of the state you work in applies.

### 3. The leave year

Leave is credited and counted for the leave year {{leave_year}}. If you join or leave part-way through the year, your leave is worked out in proportion to the time you are with us.

### 4. Leave at a glance

| Leave | How much | Unused days |
| --- | --- | --- |
| Earned leave | {{el_days}} days a year | Up to {{carry_cap}} days carried forward; paid out when you leave |
| Casual leave | {{cl_days}} days a year | Lapse at the end of the leave year |
| Sick leave | {{sl_days}} days a year | Lapse at the end of the leave year |
| Public holidays | {{holidays}} days, plus {{optional_holidays}} optional | Lapse at the end of the leave year |
| Maternity leave | 26 weeks, or 12 weeks (section 9) | Not carried forward |
| Paternity and partner leave | {{paternity_days}} working days | Not carried forward |
| Bereavement leave | {{bereavement_days}} working days | Not carried forward |

### 5. Earned leave

- You earn {{el_days}} days of earned leave a year. It is credited in equal parts at the end of each month, starting from your first month, including probation.
- You can use earned leave as it builds up. For planned leave, apply at least {{el_notice}} in advance.
- At the end of the leave year you can carry forward up to {{carry_cap}} days. Days above that limit are paid out with the next month's salary.
- If you apply for earned leave and we refuse it, you can carry those days forward even if that takes you above the limit.
- A day of leave that is paid out is valued at {{encash_rate}}.
- When you leave {{company}}, any unused earned leave is paid with your final settlement.

### 6. Casual leave

- You get {{cl_days}} days of casual leave a year for short, unplanned needs.
- You can take up to {{cl_max}} days of casual leave in a row.
- Tell your manager before your working day starts, or as soon as you reasonably can.
- Casual leave cannot be carried forward or paid out.

### 7. Sick leave

- You get {{sl_days}} days of sick leave a year, for your own illness or injury.
- Tell your manager as soon as you can. You do not need to share details of your health.
- For sick leave of more than {{sl_cert}} days in a row, please share a certificate from a registered medical practitioner when you return.
- If your sick leave runs out, you can use earned leave, and then leave without pay.
- If you are insured under ESI, you may also be able to claim ESI sickness benefit for a longer illness. HR will help you with the claim.

### 8. Public holidays

- {{company}} gives {{holidays}} paid public holidays a year, including the holidays the law of your state requires, plus {{optional_holidays}} optional holidays that you choose from a published list.
- We publish the holiday list for the next leave year before it begins.
- If you are asked to work on a public holiday or your weekly off, you get a compensatory day off, plus any extra pay the law requires for that work (see section 12).

### 9. Maternity leave

- You are eligible if you have worked for us for at least 80 days in the 12 months before your expected date of delivery.
- You get 26 weeks of paid maternity leave if you have fewer than two surviving children. Up to 8 of these weeks can be taken before the expected delivery.
- If you have two or more surviving children, you get 12 weeks, of which up to 6 can be taken before the expected delivery.
- If you adopt a child or become a mother through surrogacy (as the commissioning mother), you get 12 weeks of paid leave from the date the child is handed over to you.
- Paid leave is also available after a miscarriage or medical termination of pregnancy (6 weeks) and after a tubectomy (2 weeks). If you have an illness arising from pregnancy, delivery or miscarriage, you can take up to one extra month.
- Maternity leave is paid at your average daily wage, as the law sets out.
- When you return, you can take two nursing breaks a day until your child is 15 months old. If your work allows it, you can ask to work from home for a period on terms we agree with you.
- Your job is protected. We will not end your employment or change your terms to your disadvantage because you are pregnant or on maternity leave.
- Please tell HR in writing as early as you are comfortable, so that we can plan cover and start your benefits on time.

### 10. Paternity and partner leave

- If you become a parent through birth or adoption and are not taking maternity leave, you get {{paternity_days}} working days of paid leave.
- You can take it in one block or in parts within {{paternity_window}}.

### 11. Bereavement leave

- You get {{bereavement_days}} working days of paid leave when a member of your immediate family dies: a spouse or partner, child, parent, parent-in-law, sibling or grandparent.
- Tell your manager when you can. We will not ask for proof before you take this leave.

### 12. Compensatory off

- If your manager asks you to work on a weekly off or a public holiday, you get a compensatory day off, to be taken within {{compoff_days}} days.
- Where the law requires extra wages for that work, we will pay them as well.

### 13. Leave without pay

- If you have no suitable leave left, you can ask for leave without pay (LWP). It needs approval from your manager and HR.
- If you are absent without approval and without telling us, we will first try to contact you. The absence is treated as leave without pay only after you have had a chance to explain.

### 14. How to apply

- Apply through {{leave_system}}.
- Your manager will reply within two working days. If you have not heard back, contact HR.
- A manager can refuse or move planned leave only for a genuine work reason, which they will explain to you.
- Weekends and public holidays that fall inside a period of leave {{sandwich}}.

### 15. Probation and notice period

- During probation you earn and use leave in the same way as everyone else.
- During your notice period you can take sick leave as normal. Planned leave needs your manager's approval so that the handover is not affected. Approved leave does not move your last working day unless you agree.

### 16. Records and questions

- You can see your leave balance in {{leave_system}}. We keep leave records as the law requires.
- We review this policy every year. If you have a question, write to {{hr_contact}}.
