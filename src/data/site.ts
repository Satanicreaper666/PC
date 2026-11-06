/** Site-wide facts. Edit contact details here once they exist. */
export const SITE = {
  name: "PeopleCraft",
  tagline: "The free HR library for India",
  description:
    "Free, plain-English HR guides, templates and calculators for India: leave, salary, PF, gratuity, notice period and more. No sign-up, no cookies.",
  /** Leave empty until a real inbox exists; the "Suggest an edit" links hide themselves. */
  contactEmail: "akashmukund1996@gmail.com",
  /** Review cadence promised on the editorial-standards page. */
  reviewCadence: "every quarter, and whenever a law or rule changes",
  /** The day this version of the library went live (first production deploy on Vercel). */
  published: "2026-11-03",
  year: new Date().getFullYear()
};

export const NAV = [
  { href: "/handbooks/", label: "Handbooks" },
  { href: "/toolkit/", label: "Toolkit" },
  { href: "/jd-library/", label: "JD library" },
  { href: "/toolkit/people-analytics/", label: "People analytics" },
  { href: "/glossary/", label: "Glossary" }
] as const;
