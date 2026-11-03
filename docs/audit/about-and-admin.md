# Audit: About page (`about.html`) and admin panel (`admin.html`)

Source: a snapshot of the live site, peoplecraft.vercel.app, taken 2 November 2026.

## Summary of the most important findings

- **The About page made a promise the site didn't keep.** It said "No login. No tracking. No data collection", but every page loaded Vercel Analytics (`/_vercel/insights/script.js`), Google Fonts and, on the JD library and org chart, scripts from public CDNs. The rebuild keeps the promise: no analytics, no third-party requests and no login. The privacy page says exactly what stays on the device.
- **The personal story is the strongest trust signal on the site.** Specific experience across healthcare, aerospace, retail and tech, NABH, DGCA and AS9100D audits, 255+ hires, and a plain reason for making it free. It is kept and moved up: the About page now leads with the author, photo, credentials and contact routes, and the footer credits him on every page.
- **Counts disagreed:**
  - the About page said "8 modules. 50+ chapters. 42+ tools";
  - the home page said "9 Modules Live" and "55+ Chapters";
  - the handbooks said 41 chapters.

  The rebuild computes every count from the content at build time.
- **Emoji did the work of icons and labels** (🔒 🇮🇳 💰 🧠, ◑ for the theme switch), and the page had a single `aria-label`. The rebuild uses the site's drawn icon set and labelled controls.
- **The admin panel served a model that no longer exists.** `admin.html` used Firebase Auth and Firestore to manage "which users have access to each PeopleCraft module", a leftover from the paid tiers. Public pages no longer used the gate. The rebuild removes the panel and its scripts, and the old URL redirects to the home page.

## Header and navigation

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| "← Home" plus 8 module links | Different from the home page's navigation; no search | UX | Med | One shared header on every page: Handbooks, Toolkit, JD library, People analytics, Glossary, search, Start here |
| ◑ theme toggle | Glyph-only button | Accessibility | Med | Removed; one tested light theme with print styles |

## Content

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| "Built by a Practitioner. Not a SaaS Company." | Strong positioning, worded as a slogan | Copy | Low | Kept as the substance of the story; the page leads with who built it and why |
| Bio: 5+ years, four industries, NABH, DGCA, AS9100D, 255+ hires | Specific and credible | Trust | (kept) | Kept, in plain third person beside the photo |
| Credentials: "CIPD Certified", "SHRM Member", "NHRDN Member", "Heriot-Watt MSc" | Owners' wording; "certified" may not match the body's own term for the level held | Accuracy | Low | Shown as given; flagged in the README to confirm wording |
| "Pair-programmed with Claude Code by Anthropic" | Honest disclosure of AI use | Trust | (kept) | Kept as "How it's made", with how facts are checked |
| Tech stack list (Chart.js, Recharts, PptxGenJS, SheetJS, Vercel) | Internal detail that readers don't need; some listed libraries came from CDNs | Copy | Low | Replaced by what readers care about: privacy and how facts are checked |
| Principles with emoji | Emoji as icons | Accessibility, visual | Low | Four principles with drawn icons and plain headings |
| "8 modules. 50+ chapters. 42+ tools." | Disagrees with the home page | Accuracy | Med | Live counts from the content |

## Meta and scripts

| Element | Issue | Lens | Severity | What the rebuild does |
|---|---|---|---|---|
| `og:url` …/about.html, shared `og-image.png` | No canonical, one share image for all pages | SEO | Low | Canonical per page, OG image per section, AboutPage JSON-LD with the founder |
| Vercel Insights script | Tracking on a page that promises none | Privacy, legal | High | Removed |
| Google Fonts | Third-party request | Privacy, performance | Med | Self-hosted font |
| `js/auth.js`, `auth-gate.js`, `firebase-config.js` (admin only) | Unused by public pages; Firebase web config shipped publicly | Security hygiene | Low | Removed; README suggests deleting or restricting the Firebase web app |

## What was good and kept

- The personal reason the site exists, and the decision to make everything free.
- The contact routes: WhatsApp, email and LinkedIn.
- The honest note that AI helped build it.
