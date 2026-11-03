/**
 * PeopleCraft Learn: facts about XLRI, CIPD and SHRM that change from year to year
 * (fees, windows, item counts, pass rates, study hours, membership fees).
 * One source of truth for /learn/credentials/, /learn/how-this-course-works/,
 * /learn/shrm-exam-prep/ and /learn/cipd-assignments-and-capstone/.
 *
 * Use in MDX:  import { CRED } from "../../data/credentials";  then  {CRED.shrmFeeStdNon.display}
 *
 * Every entry says where it comes from (`source`), the date it was true (`asAt`) and how sure we
 * are (`confidence`): high = stated by the body itself and re-read; medium = official but older,
 * or a careful reading of several sources; low = reported, not confirmed for the current year.
 * Facts the research marks Unverified are left out, or the label says "not confirmed".
 *
 * Rupee conversions use one assumption, so pages never disagree:
 *   US$1 = ₹95 and £1 = ₹127. Federal Reserve H.10 rates on FRED: ₹94.94 per US$ on 23 Oct 2026,
 *   and US$1.3398 per £ on 30 Oct 2026 (cross rate ₹127.2). Card, forex and tax charges are extra.
 * Checked 4 November 2026. Update the asAt date whenever you change an entry.
 */
export type CredFact = {
  value: number | string | number[];
  display: string;
  label: string;
  source: { title: string; url: string };
  asAt: string;
  confidence: "high" | "medium" | "low";
};

const SRC = {
  fredUsd: { title: "Federal Reserve H.10: Indian rupees to US dollar (DEXINUS), via FRED", url: "https://fred.stlouisfed.org/series/DEXINUS" },
  fredGbp: { title: "Federal Reserve H.10: US dollars to UK pound (DEXUSUK), via FRED", url: "https://fred.stlouisfed.org/series/DEXUSUK" },
  shrmFees: { title: "SHRM India: exam options and fees", url: "https://www.shrm.org/in/credentials/certification/exam-options-fees" },
  shrmHandbook: { title: "SHRM: 2026 SHRM Certification Handbook (revised May 2026)", url: "https://www.shrm.org/content/dam/en/shrm/credentials/shrm-certification/2026_shrm_certification-handbook.pdf" },
  shrmMyths: { title: "SHRM: New study tips for a new year, part 1: certification exam myths (March 2024)", url: "https://www.shrm.org/in/topics-tools/news/organizational-employee-development/new-study-tips-for-a-new-year--part-1--certification-exam-myths-" },
  shrmRecert: { title: "SHRM India: recertification", url: "https://shrm.org/in/credentials/certification/recertification" },
  shrmPrep: { title: "SHRM: Certification Prep System", url: "https://www.shrm.org/credentials/certification/exam-preparation/shrm-learning-system" },
  cipdRegInfo: { title: "CIPD: qualifications regulatory information (2026 specifications)", url: "https://www.cipd.org/en/learning/qualifications/regulatory-information/" },
  cipdL5Spec: { title: "CIPD Level 5 Associate Diploma in People Management, specification v2.6", url: "https://www.cipd.org/globalassets/media/marketing/quals/2026/l5-associate-diploma-in-people-management-2.6.pdf" },
  cipdL7Spec: { title: "CIPD Level 7 Advanced Diploma in Strategic People Management, specification v1.7", url: "https://www.cipd.org/globalassets/media/marketing/quals/2026/l7-advanced-diploma-in-strategic-people-management-1.7.pdf" },
  cipdCentreFees: { title: "CIPD: fees for study centres, July 2026 to June 2027", url: "https://www.cipd.org/globalassets/media/marketing/quals/2026/cipd-qualifications-fees-for-study-centres---july-2026-to-june-2027-v1.0.pdf" },
  cipdMemberFees: { title: "CIPD: membership fees", url: "https://www.cipd.org/asia/membership/membership-fees/" },
  cipdExperience: { title: "CIPD: Experience Assessment", url: "https://www.cipd.org/en/membership/become-a-member/experience-assessment" },
  cipdUpgrade: { title: "CIPD: upgrade to Chartered Member", url: "https://www.cipd.org/en/membership/Chartered-status-upgrading/upgrade-chartered-member-how/" },
  cipdCpd: { title: "CIPD: CPD policy 2026", url: "https://www.cipd.org/globalassets/media/marketing/learning/cpd/cpd-policy/8661-cpd-policy-2026.pdf" },
  cipdL5Page: { title: "CIPD: Associate Diploma in People Management", url: "https://www.cipd.org/en/learning/qualifications/associate/associate-diploma-in-people-management/" },
  cipdL7Page: { title: "CIPD: Advanced Diploma in Strategic People Management", url: "https://www.cipd.org/en/learning/qualifications/advanced/advanced-diploma-in-strategic-people-management/" },
  icsLearn: { title: "ICS Learn: everything you need to know about CIPD qualifications in 2026", url: "https://www.icslearn.co.uk/blog/human-resources/everything-you-need-to-know-about-cipd-qualifications/" },
  xlriProspectus: { title: "XLRI Admission Prospectus 2027", url: "https://cloud-server.xlri.ac.in/file/6ae1febe65cd3e58180bb565" },
  xlriPgchrm: { title: "XLRI: Postgraduate Certificate in HRM (PGCHRM)", url: "https://xlri.ac.in/executive-education/vil/long-term-courses/postgraduate-certificate-in-human-resource-management" },
  xlriEdhrm: { title: "XLRI: Executive Diploma in HRM (EDHRM)", url: "https://xlri.ac.in/executive-education/edhrm-xlri" },
  xlriLabourCodes: { title: "XLRI: EDP in Leading People Strategy under India's New Labour Codes", url: "https://xlri.ac.in/executive-education/vil/short-term-courses/executive-development-programme-in-leading-people-strategy-under-indias-new-labour-codes" },
  xlriShortCourses: { title: "XLRI VIL: short-term courses", url: "https://xlri.ac.in/executive-education/vil/short-term-courses" },
  xlriBlended: { title: "XLRI opens admissions for blended PGDM programmes 2026–28 (UNI/PNN)", url: "https://www.uniindia.com/no-pause-required-xlri-opens-admissions-for-blended-pgdm-programs-in-business-management-human-resource-management-and-finance/pnn/news/3769765.html" }
} as const;

export const CRED = {
  /* ---------- Exchange-rate assumption ---------- */
  fxUsd: {
    value: 95,
    display: "₹95 per US dollar",
    label: "Rate used for every US-dollar fee on these pages: ₹94.94 on 23 Oct 2026, rounded",
    source: SRC.fredUsd,
    asAt: "2026-10-23",
    confidence: "high"
  },
  fxGbp: {
    value: 127,
    display: "₹127 per pound",
    label: "Rate used for every sterling fee: US$1.3398 per £ on 30 Oct 2026 × ₹94.94 per US$, rounded",
    source: SRC.fredGbp,
    asAt: "2026-10-30",
    confidence: "medium"
  },

  /* ---------- SHRM: the exam ---------- */
  shrmItems: {
    value: 134,
    display: "134 questions",
    label: "on each SHRM-CP or SHRM-SCP exam, all multiple choice",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmScored: {
    value: 110,
    display: "110 scored",
    label: "the other 24 are unscored field-test questions, mixed in at random",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmTime: {
    value: 220,
    display: "3 h 40 min",
    label: "of testing in two sections of up to 110 minutes each; allow about 4 hours at the centre",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmPassMark: {
    value: 200,
    display: "200",
    label: "the pass mark on a scaled score of 120–200; everyone who passes is reported at 200",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmMix: {
    value: [40, 10, 50],
    display: "40% / 10% / 50%",
    label: "situational judgement, foundational knowledge and HR-specific knowledge items",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmScoredSplit: {
    value: [44, 11, 55],
    display: "44 / 11 / 55",
    label: "scored items by type: situational judgement, foundational knowledge, HR knowledge",
    source: SRC.shrmMyths,
    asAt: "2026-11-02",
    confidence: "medium"
  },
  shrmSections: {
    value: 2,
    display: "2 timed sections",
    label: "unused time does not carry over, and you cannot go back to section 1",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },

  /* ---------- SHRM: 2026 BASK exam weights (same for CP and SCP) ---------- */
  wLeadership: { value: 19, display: "19%", label: "Leadership cluster: Leadership & Navigation, Ethical Practice, Inclusive Mindset", source: SRC.shrmHandbook, asAt: "2026-11-02", confidence: "high" },
  wInterpersonal: { value: 13.5, display: "13.5%", label: "Interpersonal cluster: Relationship Management, Communication", source: SRC.shrmHandbook, asAt: "2026-11-02", confidence: "high" },
  wBusiness: { value: 17.5, display: "17.5%", label: "Business cluster: Business Acumen, Consultation, Analytical Aptitude", source: SRC.shrmHandbook, asAt: "2026-11-02", confidence: "high" },
  wPeople: { value: 19, display: "19%", label: "People domain: 5 functional areas", source: SRC.shrmHandbook, asAt: "2026-11-02", confidence: "high" },
  wOrganization: { value: 18, display: "18%", label: "Organization domain: 5 functional areas", source: SRC.shrmHandbook, asAt: "2026-11-02", confidence: "high" },
  wWorkplace: { value: 13, display: "13%", label: "Workplace domain: 4 functional areas", source: SRC.shrmHandbook, asAt: "2026-11-02", confidence: "high" },

  /* ---------- SHRM: fees (US dollars; ₹ at fxUsd) ---------- */
  shrmFeeEarlyMember: { value: 350, display: "$350 (about ₹33,000)", label: "early-bird exam fee, SHRM member", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmFeeEarlyNon: { value: 450, display: "$450 (about ₹43,000)", label: "early-bird exam fee, non-member", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmFeeStdMember: { value: 399, display: "$399 (about ₹38,000)", label: "standard exam fee, SHRM member", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmFeeStdNon: { value: 499, display: "$499 (about ₹47,000)", label: "standard exam fee, non-member", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmAppFee: {
    value: 50,
    display: "$50",
    label: "non-refundable application fee inside every exam fee; standard fees also include a $49 standard-deadline fee",
    source: SRC.shrmFees,
    asAt: "2026-11-04",
    confidence: "high"
  },
  shrmReschedule: {
    value: [35, 53],
    display: "$35 or $53",
    label: "Prometric rescheduling fee: $35 more than 30 days ahead, $53 within 30 days; no changes within 5 days",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmPrep: {
    value: [1130, 1330],
    display: "$1,130–$1,330 (about ₹1.1–1.3 lakh)",
    label: "list price of SHRM's own Certification Prep System; members save up to $310",
    source: SRC.shrmPrep,
    asAt: "2026-11-02",
    confidence: "medium"
  },

  /* ---------- SHRM: windows ---------- */
  shrmW1Early: { value: "2026-01-05/2026-04-30", display: "5 Jan – 30 Apr 2026", label: "early-bird applications, first 2026 window", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmW1Std: { value: "2026-05-01/2026-05-29", display: "1–29 May 2026", label: "standard applications, first 2026 window (the Handbook says 26 May)", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "medium" },
  shrmW1Test: { value: "2026-05-01/2026-07-15", display: "1 May – 15 Jul 2026", label: "testing, first 2026 window", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmW2Early: { value: "2026-06-03/2026-08-31", display: "3 Jun – 31 Aug 2026", label: "early-bird applications, second 2026 window (closed)", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmW2Std: { value: "2026-09-01/2026-12-24", display: "1 Sep – 24 Dec 2026", label: "standard applications, second 2026 window; closes 11:59 pm US Eastern time", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmW2Test: { value: "2026-12-01/2027-02-15", display: "1 Dec 2026 – 15 Feb 2027", label: "testing, second 2026 window", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrm2027: {
    value: "not published",
    display: "not yet published",
    label: "SHRM's fees page listed no 2027 window on 4 Nov 2026; check shrm.org before you plan",
    source: SRC.shrmFees,
    asAt: "2026-11-04",
    confidence: "high"
  },

  /* ---------- SHRM: results, eligibility, recertification ---------- */
  shrmPassCp: { value: 69, display: "69%", label: "SHRM-CP global pass rate, May–July 2026 window", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmPassScp: { value: 56, display: "56%", label: "SHRM-SCP global pass rate, May–July 2026 window", source: SRC.shrmFees, asAt: "2026-11-04", confidence: "high" },
  shrmPassRange: {
    value: "CP 67–71; SCP 50–56",
    display: "CP 67–71%, SCP 50–56%",
    label: "range of global pass rates over the seven windows from May 2023 to July 2026",
    source: SRC.shrmFees,
    asAt: "2026-11-04",
    confidence: "high"
  },
  shrmScpYears: {
    value: 3,
    display: "3 years",
    label: "of strategic-level HR work at 1,000+ hours a year, or 3 years holding SHRM-CP, to sit SHRM-SCP",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmRecertPdc: { value: 60, display: "60 PDCs every 3 years", label: "professional development credits to recertify, or retake the exam", source: SRC.shrmRecert, asAt: "2026-11-02", confidence: "high" },
  shrmRecertFee: {
    value: [165, 210],
    display: "$165 member, $210 non-member (about ₹16,000–20,000)",
    label: "recertification fee every 3 years",
    source: SRC.shrmRecert,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmResults: {
    value: "2–3 weeks",
    display: "2–3 weeks",
    label: "for the official result, after a provisional pass or fail at the test centre",
    source: SRC.shrmHandbook,
    asAt: "2026-11-02",
    confidence: "high"
  },
  shrmSjiWriters: {
    value: 85,
    display: "about 85",
    label: "HR professionals who write, review and validate each situational judgement item",
    source: { title: "SHRM: Knowledge vs situational judgment exam questions (April 2023)", url: "https://www.shrm.org/mena/topics-tools/news/organizational-employee-development/knowledge-vs-situational-judgment-exam-questions" },
    asAt: "2026-11-02",
    confidence: "medium"
  },
  shrmUsLaw: {
    value: "excluded outside the US (2024)",
    display: "SHRM said in 2024 that US-law items are not shown to candidates testing outside the US",
    label: "not restated in the 2026 Handbook; confirm with SHRM India for your window",
    source: SRC.shrmMyths,
    asAt: "2026-11-02",
    confidence: "low"
  },

  /* ---------- CIPD: size and time ---------- */
  cipdL5Tqt: { value: 420, display: "420 hours", label: "total qualification time, Level 5 Associate Diploma (42 credits)", source: SRC.cipdL5Spec, asAt: "2026-11-02", confidence: "high" },
  cipdL7Tqt: { value: 1200, display: "1,200 hours", label: "total qualification time, Level 7 Advanced Diploma (120 credits)", source: SRC.cipdL7Spec, asAt: "2026-11-02", confidence: "high" },
  cipdL5Glh: { value: 175, display: "175 hours", label: "guided learning hours at Level 5 (with a tutor); the rest is your own study", source: SRC.cipdL5Spec, asAt: "2026-11-02", confidence: "high" },
  cipdL7Glh: { value: 240, display: "240 hours", label: "guided learning hours at Level 7", source: SRC.cipdL7Spec, asAt: "2026-11-02", confidence: "high" },
  cipdL5Units: { value: 7, display: "7 units", label: "Level 5: 3 core, 3 pathway and 1 optional unit", source: SRC.cipdL5Spec, asAt: "2026-11-02", confidence: "high" },
  cipdL7Units: { value: 8, display: "8 units", label: "Level 7: 4 core (including the 7CO04 research project), 3 pathway and 1 optional", source: SRC.cipdL7Spec, asAt: "2026-11-02", confidence: "high" },
  cipdL5Months: { value: "12–16", display: "12–16 months", label: "CIPD's typical time to complete Level 5", source: SRC.cipdL5Page, asAt: "2026-11-02", confidence: "high" },
  cipdL7Months: { value: "16–24", display: "16–24 months", label: "CIPD's typical time to complete Level 7", source: SRC.cipdL7Page, asAt: "2026-11-02", confidence: "high" },
  cipdL7Weekly: {
    value: "8–10",
    display: "8–10 hours a week",
    label: "what online providers advise for Level 7",
    source: SRC.icsLearn,
    asAt: "2026-11-02",
    confidence: "medium"
  },
  cipdWords: {
    value: 3000,
    display: "about 3,000 words",
    label: "or more per assessment, as providers describe a typical brief; briefs set their own guided word counts",
    source: SRC.icsLearn,
    asAt: "2026-11-02",
    confidence: "medium"
  },
  cipdCritically: {
    value: [18, 64],
    display: "18 of 64",
    label: "criteria in four Level 7 units (7CO01, 7CO02, 7HR01, 7HR02) that begin 'critically'; none of 39 in four Level 5 units do",
    source: SRC.cipdL7Spec,
    asAt: "2026-11-02",
    confidence: "medium"
  },

  /* ---------- CIPD: money (sterling; ₹ at fxGbp) ---------- */
  cipdL5Tuition: { value: [1600, 3600], display: "£1,600–£3,600 (about ₹2.0–4.6 lakh)", label: "typical Level 5 tuition at a UK study centre", source: SRC.cipdL5Page, asAt: "2026-11-02", confidence: "high" },
  cipdL7Tuition: { value: [3000, 7000], display: "£3,000–£7,000 (about ₹3.8–8.9 lakh)", label: "typical Level 7 tuition at a UK study centre", source: SRC.cipdL7Page, asAt: "2026-11-02", confidence: "high" },
  cipdRegL5: { value: 167, display: "£167 (about ₹21,000)", label: "CIPD learner registration, Associate (Level 5), 2026/27; often inside the centre's price", source: SRC.cipdCentreFees, asAt: "2026-11-02", confidence: "high" },
  cipdRegL7: { value: 229, display: "£229 (about ₹29,000)", label: "CIPD learner registration, Advanced (Level 7), 2026/27", source: SRC.cipdCentreFees, asAt: "2026-11-02", confidence: "high" },
  cipdStudentFee: { value: 118, display: "£118 a year (about ₹15,000)", label: "student membership, compulsory while you study (1 Jul 2026 – 30 Jun 2027)", source: SRC.cipdMemberFees, asAt: "2026-11-02", confidence: "high" },
  cipdJoinFee: { value: 40, display: "£40 (about ₹5,000)", label: "one-off joining fee for new members", source: SRC.cipdMemberFees, asAt: "2026-11-02", confidence: "high" },
  cipdAssocFee: { value: 199, display: "£199 a year (about ₹25,000)", label: "Associate membership (Assoc CIPD), 2026/27", source: SRC.cipdMemberFees, asAt: "2026-11-02", confidence: "high" },
  cipdCharteredFee: { value: 231, display: "£231 a year (about ₹29,000)", label: "Chartered Member membership (Chartered MCIPD), 2026/27", source: SRC.cipdMemberFees, asAt: "2026-11-02", confidence: "high" },
  cipdUpgradeFee: { value: 125, display: "£125 (about ₹16,000)", label: "Upgrade Assessment from Associate to Chartered Member, by video conversation or in writing", source: SRC.cipdUpgrade, asAt: "2026-11-02", confidence: "high" },
  cipdEaAssoc: { value: 2065, display: "£2,065 (about ₹2.6 lakh)", label: "Experience Assessment at Associate level, plus membership", source: SRC.cipdExperience, asAt: "2026-11-02", confidence: "high" },
  cipdEaChartered: { value: 2115, display: "£2,115 (about ₹2.7 lakh)", label: "Experience Assessment at Chartered Member level, plus membership", source: SRC.cipdExperience, asAt: "2026-11-02", confidence: "high" },
  cipdEaFellow: { value: 2460, display: "£2,460 (about ₹3.1 lakh)", label: "Experience Assessment at Chartered Fellow level, plus membership", source: SRC.cipdExperience, asAt: "2026-11-02", confidence: "high" },
  cipdEaTime: {
    value: "about 4 weeks",
    display: "about 4 weeks",
    label: "online, roughly three days of effort, then a 1.5-hour professional discussion; outcome within 4 weeks",
    source: SRC.cipdExperience,
    asAt: "2026-11-02",
    confidence: "high"
  },
  cipdIndiaCentres: {
    value: 0,
    display: "none",
    label: "CIPD study centres or accredited university programmes in India in CIPD's centre finder, checked 2 Nov 2026",
    source: { title: "CIPD: centre finder", url: "https://findacentre.cipd.org/" },
    asAt: "2026-11-02",
    confidence: "high"
  },
  cipdCpd: {
    value: 30,
    display: "about 30 hours",
    label: "of planned learning a year that CIPD recommends; members submit at least 3 CPD records a year",
    source: SRC.cipdCpd,
    asAt: "2026-11-02",
    confidence: "high"
  },

  /* ---------- XLRI ---------- */
  xlriPgdmFee: { value: 1530000, display: "about ₹15.3 lakh a year", label: "PGDM (HRM) fee at Jamshedpur, subject to revision", source: SRC.xlriProspectus, asAt: "2026-11-02", confidence: "high" },
  xlriPgdmCredits: { value: [115, 121], display: "115–121 credits", label: "PGDM (HRM): 2 years, 6 terms; core about 69.5 credits; 6-credit summer internship; the 4.5-credit capstone is over and above the 115–121; village immersion carries no credit", source: SRC.xlriProspectus, asAt: "2026-11-04", confidence: "high" },
  xlriPgchrmFee: { value: 400000, display: "₹4,00,000", label: "Postgraduate Certificate in HRM (PGCHRM): 12 months, 300 hours, live online plus a 5-day campus module", source: SRC.xlriPgchrm, asAt: "2026-11-02", confidence: "high" },
  xlriPgchrmStart: { value: "2026-12-20", display: "20 Dec 2026", label: "PGCHRM Batch 40 start date", source: SRC.xlriPgchrm, asAt: "2026-11-02", confidence: "high" },
  xlriEdhrmFee: { value: 495000, display: "₹4.95 lakh + GST", label: "Executive Diploma in HRM (EDHRM), 16 months with residential contact sessions, Batch 20", source: SRC.xlriEdhrm, asAt: "2026-11-02", confidence: "medium" },
  xlriEdpFees: {
    value: [150000, 420000],
    display: "₹1.5–4.2 lakh + tax",
    label: "fees for XLRI's 6–10-month HR executive development programmes (EDPs) open in 2026–27",
    source: SRC.xlriShortCourses,
    asAt: "2026-11-02",
    confidence: "medium"
  },
  xlriLabourCodesEdp: { value: 150000, display: "₹1,50,000 + tax", label: "EDP in Leading People Strategy under India's New Labour Codes: 6 months, 90 hours; Batch 1 starts 17 Jan 2027", source: SRC.xlriLabourCodes, asAt: "2026-11-02", confidence: "high" }
} satisfies Record<string, CredFact>;

export type CredId = keyof typeof CRED;
