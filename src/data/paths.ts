import type { Audience } from "./taxonomy";

/**
 * "Start here" reading paths, one per reader. Each step is a library ref
 * (see lib/library.ts resolveRefs). Missing refs are skipped automatically,
 * so a path never shows a broken link while content is being written.
 */
export const PATHS: Record<Audience, { intro: string; groups: { title: string; why: string; refs: string[] }[] }> = {
  hr: {
    intro:
      "Start with the rules you apply every month, keep the forms and calculators close, then use the HR professional handbook to grow beyond operations.",
    groups: [
      {
        title: "Know the law you apply every month",
        why: "Pay, leave and contracts changed with the Labour Codes. These chapters cover what to check first.",
        refs: [
          "handbooks/labour-law/01-the-four-labour-codes",
          "handbooks/labour-law/02-wages-and-pay",
          "handbooks/labour-law/03-leave-and-working-hours",
          "handbooks/labour-law/09-compliance-checklists",
          "handbooks/tds/01-what-hr-must-know"
        ]
      },
      {
        title: "Run payroll and exits without errors",
        why: "The numbers employees ask about most, worked out the same way every time.",
        refs: [
          "toolkit/take-home-salary-calculator",
          "toolkit/full-and-final-settlement-calculator",
          "toolkit/gratuity-calculator",
          "toolkit/epf-calculator",
          "toolkit/esi-calculator",
          "toolkit/professional-tax-calculator"
        ]
      },
      {
        title: "Documents you send every week",
        why: "Fill in, download as Word, and adapt to your policy.",
        refs: ["toolkit/offer-letter", "toolkit/appointment-letter", "toolkit/mail-merge", "toolkit/onboarding-checklist", "toolkit/offboarding-checklist", "toolkit/experience-letter"]
      },
      {
        title: "Grow into a strategic role",
        why: "Business acumen, analytics and partnering skills, with self-assessments to see where you stand.",
        refs: [
          "handbooks/hr-professional/01-the-competency-model",
          "handbooks/hr-professional/03-business-acumen",
          "toolkit/competency-self-assessment",
          "toolkit/people-analytics",
          "toolkit/org-chart-builder",
          "handbooks/hr-professional/11-the-path-to-chro"
        ]
      }
    ]
  },
  founders: {
    intro: "You don't need an HR team to treat people fairly and stay compliant. Do these in order as you hire your first ten people.",
    groups: [
      {
        title: "Before you hire",
        why: "Check the role is needed, write a clear job description and know what an offer must say.",
        refs: ["handbooks/recruitment/01-do-you-need-this-role", "handbooks/recruitment/02-writing-job-descriptions", "jds/blank-job-description", "toolkit/salary-band-designer", "toolkit/offer-letter", "toolkit/appointment-letter"]
      },
      {
        title: "Set up the basics",
        why: "The policies and registrations small teams most often miss.",
        refs: ["handbooks/labour-law/01-the-four-labour-codes", "toolkit/leave-policy", "toolkit/hr-compliance-audit-checklist", "toolkit/posh-ic-constitution-checklist", "toolkit/annual-hr-calendar"]
      },
      {
        title: "Pay people correctly",
        why: "Work out salary structures, statutory contributions and what lands in the bank.",
        refs: ["toolkit/take-home-salary-calculator", "toolkit/epf-calculator", "toolkit/esi-calculator", "handbooks/tds/03-ctc-design-and-perquisites"]
      },
      {
        title: "When someone leaves",
        why: "Settle dues on time and part well.",
        refs: ["toolkit/full-and-final-settlement-calculator", "toolkit/offboarding-checklist", "toolkit/relieving-letter", "handbooks/labour-law/06-termination-grievance-and-disputes"]
      }
    ]
  },
  employees: {
    intro: "Understand what you're paid, the leave you're owed and your rights at work, and leave a job the right way when it's time.",
    groups: [
      {
        title: "Your pay",
        why: "From CTC to the amount in your bank, and what each deduction is for.",
        refs: ["toolkit/take-home-salary-calculator", "handbooks/tds/02-salary-tds", "toolkit/epf-calculator", "glossary/ctc"]
      },
      {
        title: "Your time off",
        why: "How leave works, how to plan it and how to ask for it.",
        refs: ["handbooks/labour-law/03-leave-and-working-hours", "toolkit/working-days-calculator", "toolkit/leave-application"]
      },
      {
        title: "Your rights",
        why: "A safe workplace, fair treatment and what to do when something goes wrong.",
        refs: ["handbooks/labour-law/07-posh-compliance", "toolkit/posh-complaint-form", "handbooks/labour-law/06-termination-grievance-and-disputes"]
      },
      {
        title: "Moving on",
        why: "Resign in writing, serve your notice and get every rupee you're owed.",
        refs: ["toolkit/resignation-letter", "toolkit/notice-period-calculator", "toolkit/full-and-final-settlement-calculator", "toolkit/gratuity-calculator", "toolkit/experience-letter"]
      }
    ]
  },
  students: {
    intro: "Read an offer properly, understand what CTC really means and start your first job knowing how things work.",
    groups: [
      {
        title: "Reading an offer",
        why: "What an offer and an appointment letter should say, and how to compare two offers.",
        refs: ["toolkit/offer-letter", "toolkit/appointment-letter", "toolkit/take-home-salary-calculator", "glossary/ctc"]
      },
      {
        title: "Your first months",
        why: "Joining formalities, probation and how performance is judged.",
        refs: ["toolkit/employee-joining-form", "handbooks/recruitment/08-onboarding-day-1-to-90", "glossary/probation", "toolkit/annual-performance-appraisal"]
      },
      {
        title: "If HR is your career",
        why: "The skills that matter and the path from HR executive to CHRO.",
        refs: ["handbooks/hr-professional/01-the-competency-model", "handbooks/hr-professional/11-the-path-to-chro", "toolkit/competency-self-assessment"]
      }
    ]
  }
};
