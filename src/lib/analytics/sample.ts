/**
 * Sample data: a fictional Indian company of about 120 people, with everyone
 * who has left since it started. Generated in code from a fixed seed and
 * anchored to today, so recent periods always have joiners and leavers.
 *
 * It includes a few deliberate mistakes (a rehire on the same ID, a leaver
 * with no last working day, a blank gender, a manager who has left) so the
 * data checks have something to show.
 */
import { ymd, type DayNum } from "./dates.ts";
import { MONTHS } from "./format.ts";

export const SAMPLE_HEADERS = [
  "Emp Code", "Employee Name", "Gender", "Date of Birth", "Date of Joining", "Last Working Day",
  "Status", "Department", "Designation", "Grade", "Location", "Reporting Manager", "Annual CTC"
];

type DeptKey = "lead" | "eng" | "sales" | "support" | "ops" | "mkt" | "fin" | "hr";
const DEPTS: Record<DeptKey, { name: string; leave: number; women: number; pay: number }> = {
  lead: { name: "Leadership", leave: 0, women: 0.3, pay: 1 },
  eng: { name: "Engineering", leave: 0.15, women: 0.3, pay: 1.35 },
  sales: { name: "Sales", leave: 0.19, women: 0.24, pay: 0.95 },
  support: { name: "Customer support", leave: 0.3, women: 0.45, pay: 0.62 },
  ops: { name: "Operations", leave: 0.14, women: 0.32, pay: 0.8 },
  mkt: { name: "Marketing", leave: 0.1, women: 0.5, pay: 0.9 },
  fin: { name: "Finance", leave: 0.06, women: 0.45, pay: 0.95 },
  hr: { name: "HR and admin", leave: 0.08, women: 0.62, pay: 0.85 }
};
const GRADE_PAY = [0, 500_000, 800_000, 1_400_000, 2_400_000, 4_000_000, 6_000_000];
const GRADE_AGE: [number, number][] = [[0, 0], [21, 26], [24, 31], [27, 36], [31, 42], [35, 48], [42, 52]];

const WOMEN = [
  "Aanya", "Aditi", "Aishwarya", "Akshata", "Ananya", "Anjali", "Aparna", "Asha", "Ayesha", "Bhavana", "Deepa", "Divya", "Farah", "Gayatri",
  "Harpreet", "Ishita", "Jasleen", "Kavya", "Keerthana", "Kriti", "Lakshmi", "Leela", "Mahima", "Mary", "Meera", "Megha", "Nandini", "Neha",
  "Nikita", "Pallavi", "Pooja", "Prachi", "Priya", "Radhika", "Rashmi", "Ritu", "Riya", "Roshni", "Sana", "Shalini", "Shreya", "Simran",
  "Sneha", "Sonal", "Swati", "Tanvi", "Trisha", "Vaishnavi", "Vidya", "Zoya"
];
const MEN = [
  "Aarav", "Abhishek", "Aditya", "Ajay", "Akash", "Amit", "Anand", "Arjun", "Arvind", "Ashwin", "Deepak", "Dev", "Farhan", "Gurpreet",
  "Harish", "Hemant", "Imran", "Irfan", "Joseph", "Karan", "Karthik", "Kiran", "Kunal", "Manish", "Mohit", "Naveen", "Nikhil", "Pranav",
  "Prakash", "Rahul", "Rajesh", "Rakesh", "Ravi", "Ritesh", "Rohan", "Sachin", "Sameer", "Sandeep", "Sanjay", "Shiv", "Siddharth", "Suresh",
  "Tarun", "Thomas", "Varun", "Vikram", "Vinay", "Vivek", "Yash", "Zubin"
];
const SURNAMES = [
  "Agarwal", "Banerjee", "Bansal", "Bhat", "Bose", "Chatterjee", "Chauhan", "Das", "Desai", "Deshpande", "D'Souza", "Dubey", "Fernandes",
  "George", "Ghosh", "Gill", "Gowda", "Gupta", "Hegde", "Iyer", "Jain", "Joshi", "Kamath", "Kapoor", "Kaur", "Khan", "Krishnan", "Kulkarni",
  "Malhotra", "Mathew", "Mehta", "Menon", "Mishra", "Mukherjee", "Naidu", "Nair", "Pandey", "Patel", "Patil", "Pereira", "Pillai", "Qureshi",
  "Raman", "Rao", "Rathore", "Reddy", "Sandhu", "Sen", "Shah", "Shaikh", "Sharma", "Shetty", "Siddiqui", "Singh", "Subramanian", "Thomas",
  "Tiwari", "Venkatesh", "Yadav"
];

type Position = { dept: DeptKey; grade: number; title: string; manager: number; locations: string[]; opened: number };
type Person = {
  pos: number; first: string; last: string; female: boolean; dob: DayNum; doj: DayNum; doe: DayNum | null;
  status: string; location: string; salary: number; code: string; managerCode: string; blankGender?: boolean; blankExit?: boolean;
};

/** Small seeded random generator (mulberry32), so the sample is the same every time for the same day. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** The organisation: who reports to whom, and how many months ago each role was created. */
function organisation(): Position[] {
  const p: Position[] = [];
  const add = (dept: DeptKey, grade: number, title: string, manager: number, locations: string[], opened: number, count = 1) => {
    for (let i = 0; i < count; i++) p.push({ dept, grade, title, manager, locations, opened: opened - i * 3 });
    return p.length - 1;
  };
  const BLR = ["Bengaluru"];
  const ceo = add("lead", 6, "Chief executive officer", -1, BLR, 84);

  const eh = add("eng", 5, "Head of engineering", ceo, BLR, 84);
  const em1 = add("eng", 4, "Engineering manager", eh, BLR, 80);
  const em2 = add("eng", 4, "Engineering manager", eh, BLR, 60);
  const em3 = add("eng", 4, "Engineering manager", eh, ["Pune"], 40);
  const tl1 = add("eng", 3, "Tech lead", em1, BLR, 78);
  const tl2 = add("eng", 3, "Tech lead", em1, BLR, 64);
  const tl3 = add("eng", 3, "Tech lead", em2, BLR, 56);
  const tl4 = add("eng", 3, "Tech lead", em3, ["Pune"], 36);
  add("eng", 2, "Senior software engineer", tl1, BLR, 78, 3);
  add("eng", 1, "Software engineer", tl1, BLR, 70, 3);
  add("eng", 2, "Senior software engineer", tl2, BLR, 62, 2);
  add("eng", 1, "Software engineer", tl2, BLR, 50, 3);
  add("eng", 2, "Senior software engineer", tl3, BLR, 54, 2);
  add("eng", 1, "Software engineer", tl3, BLR, 44, 4);
  add("eng", 2, "Senior software engineer", tl4, ["Pune"], 35, 2);
  add("eng", 1, "Software engineer", tl4, ["Pune"], 30, 4);
  add("eng", 2, "QA engineer", em2, BLR, 48);
  add("eng", 2, "Data analyst", em1, BLR, 26);

  const sh = add("sales", 5, "Head of sales", ceo, ["Mumbai"], 84);
  const rmW = add("sales", 4, "Regional sales manager", sh, ["Mumbai"], 80);
  const rmN = add("sales", 4, "Regional sales manager", sh, ["Gurugram"], 66);
  const rmS = add("sales", 4, "Regional sales manager", sh, BLR, 52);
  add("sales", 1, "Sales executive", rmW, ["Mumbai"], 78, 5);
  add("sales", 2, "Senior sales executive", rmW, ["Mumbai", "Pune"], 70, 3);
  add("sales", 1, "Sales executive", rmN, ["Gurugram"], 64, 5);
  add("sales", 2, "Senior sales executive", rmN, ["Gurugram"], 58, 2);
  add("sales", 1, "Sales executive", rmS, ["Bengaluru", "Chennai", "Hyderabad"], 50, 5);
  add("sales", 2, "Senior sales executive", rmS, ["Chennai", "Hyderabad"], 46, 2);
  add("sales", 2, "Sales operations analyst", sh, ["Mumbai"], 40);

  const oh = add("ops", 5, "Head of operations", ceo, BLR, 84);
  const om1 = add("ops", 4, "Operations manager", oh, ["Pune"], 70);
  const om2 = add("ops", 3, "Operations manager", oh, BLR, 50);
  add("ops", 1, "Operations executive", om1, ["Pune"], 68, 5);
  add("ops", 2, "Senior operations executive", om1, ["Pune"], 60, 2);
  add("ops", 1, "Operations executive", om2, BLR, 48, 4);
  add("ops", 2, "Senior operations executive", om2, BLR, 44, 2);

  const sm = add("support", 4, "Customer support manager", oh, ["Chennai"], 72);
  const tlA = add("support", 3, "Team lead, customer support", sm, ["Chennai"], 70);
  const tlB = add("support", 3, "Team lead, customer support", sm, BLR, 40);
  add("support", 1, "Customer support associate", tlA, ["Chennai"], 69, 10);
  add("support", 2, "Senior customer support associate", tlA, ["Chennai"], 60, 4);
  add("support", 1, "Customer support associate", tlB, BLR, 39, 7);
  add("support", 2, "Senior customer support associate", tlB, BLR, 30, 2);
  add("support", 2, "Quality analyst", sm, ["Chennai"], 34);

  const mh = add("mkt", 4, "Head of marketing", ceo, BLR, 76);
  const mm = add("mkt", 3, "Marketing manager", mh, BLR, 60);
  add("mkt", 1, "Marketing executive", mm, BLR, 58, 3);
  add("mkt", 2, "Senior marketing executive", mm, BLR, 50, 3);

  const cfo = add("fin", 5, "Chief financial officer", ceo, BLR, 84);
  const fm = add("fin", 3, "Finance manager", cfo, BLR, 78);
  add("fin", 1, "Accounts executive", fm, BLR, 76, 2);
  add("fin", 2, "Senior accountant", fm, BLR, 70, 2);
  add("fin", 3, "Company secretary", cfo, BLR, 60);

  const hrh = add("hr", 4, "Head of HR", ceo, BLR, 80);
  const hrm = add("hr", 3, "HR manager", hrh, BLR, 66);
  add("hr", 1, "HR executive", hrm, BLR, 64);
  add("hr", 2, "Recruiter", hrm, BLR, 56, 2);
  add("hr", 2, "HR business partner", hrh, ["Pune"], 44);
  add("hr", 1, "Admin executive", hrh, BLR, 80);
  return p;
}

const MS_PER_MONTH = 30.44;

function dateText(n: DayNum): string {
  const { y, m, d } = ymd(n);
  return `${String(d).padStart(2, "0")}-${MONTHS[m - 1]}-${y}`;
}

export function sampleTable(todayN: DayNum, seed = 20_261_102): { headers: string[]; rows: string[][] } {
  const r = rng(seed);
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const pick = <T>(list: T[]) => list[Math.floor(r() * list.length)];
  const org = organisation();
  const names = new Set<string>();
  const people: Person[] = [];

  const newPerson = (pos: number, doj: DayNum): Person => {
    const P = org[pos];
    const female = r() < DEPTS[P.dept].women;
    let first = "";
    let last = "";
    do {
      first = pick(female ? WOMEN : MEN);
      last = pick(SURNAMES);
    } while (names.has(`${first} ${last}`));
    names.add(`${first} ${last}`);
    const [a0, a1] = GRADE_AGE[P.grade];
    const dob = doj - Math.round(int(a0, a1) * 365.25) - int(0, 364);
    return { pos, first, last, female, dob, doj, doe: null, status: "Active", location: pick(P.locations), salary: 0, code: "", managerCode: "" };
  };

  // Fill each role from the month it was created; when someone leaves, backfill after a gap.
  org.forEach((P, pos) => {
    let start = todayN - Math.round(P.opened * MS_PER_MONTH) + int(0, 45);
    while (start <= todayN) {
      const person = newPerson(pos, start);
      const yearly = DEPTS[P.dept].leave * (P.grade >= 4 ? 0.5 : 1);
      let cursor = start;
      while (yearly > 0) {
        cursor += 30;
        if (cursor > todayN) break;
        const firstYear = cursor - start < 365;
        const monthly = 1 - Math.pow(1 - Math.min(0.9, yearly * (firstYear ? 1.6 : 1)), 1 / 12);
        if (r() < monthly) {
          person.doe = cursor - int(0, 29);
          break;
        }
      }
      const served = ((person.doe ?? todayN) - start) / 365.25;
      const base = GRADE_PAY[P.grade] * DEPTS[P.dept].pay * (0.86 + r() * 0.3) * (1 + 0.05 * Math.min(6, served));
      person.salary = Math.round(base / 10_000) * 10_000;
      if (person.doe !== null) {
        const x = r();
        person.status = x < 0.86 ? "Resigned" : x < 0.96 ? "Terminated" : "Absconding";
      }
      people.push(person);
      if (person.doe === null) break;
      start = person.doe + int(25, 100);
    }
  });

  // Codes in joining order, like most HR systems.
  people.sort((a, b) => a.doj - b.doj || a.pos - b.pos);
  people.forEach((p, i) => (p.code = `E${1001 + i}`));

  // Reporting manager: whoever held the manager's role on the person's last day (or today).
  const holderOn = (pos: number, day: DayNum): Person | null => {
    for (let q = pos; q >= 0; q = org[q].manager) {
      const h = people.find((x) => x.pos === q && x.doj <= day && (x.doe === null || x.doe >= day) && x.doj <= todayN);
      if (h) return h;
      if (org[q].manager < 0) return null;
    }
    return null;
  };
  for (const p of people) {
    const mPos = org[p.pos].manager;
    p.managerCode = mPos < 0 ? "" : (holderOn(mPos, Math.min(p.doe ?? todayN, todayN))?.code ?? "");
  }

  /* ---- Deliberate, realistic mistakes and edge cases ---- */
  const active = people.filter((p) => p.doe === null && org[p.pos].grade <= 2);
  // Three people serving notice.
  active
    .filter((_, i) => i % 23 === 5)
    .slice(0, 3)
    .forEach((p, i) => {
      p.doe = todayN + 6 + i * 11 + int(0, 8);
      p.status = "Notice period";
    });
  // Someone who has accepted an offer and joins in two weeks.
  const newcomer = newPerson(org.findIndex((P) => P.title === "Data analyst"), todayN + 14);
  newcomer.salary = 1_080_000;
  newcomer.status = "Yet to join";
  newcomer.code = `E${1001 + people.length}`;
  newcomer.managerCode = holderOn(org[newcomer.pos].manager, todayN)?.code ?? "";
  people.push(newcomer);
  // A rehire on their old employee code: same person, two stints.
  const recent = people.find((p) => p.doe === null && p.doj > todayN - 300 && p.doj <= todayN && org[p.pos].grade === 2);
  const former = people.find((p) => p.doe !== null && p.doe < todayN - 700 && org[p.pos].dept === (recent ? org[recent.pos].dept : "eng"));
  if (recent && former) Object.assign(recent, { code: former.code, first: former.first, last: former.last, female: former.female, dob: former.dob });
  // A leaver whose last working day was never entered.
  const noDate = people.find((p) => p.doe !== null && p.doe > todayN - 200 && p.doe < todayN - 60 && p.status === "Resigned");
  if (noDate) noDate.blankExit = true;
  // A blank gender.
  const blank = people.find((p) => p.doe === null && org[p.pos].dept === "ops" && org[p.pos].grade === 1);
  if (blank) blank.blankGender = true;
  // Someone still shown as reporting to a manager who has left (the most recent lead or manager to leave).
  const oldBoss = people
    .filter((p) => p.doe !== null && p.doe < todayN - 45 && org[p.pos].grade >= 3 && !p.blankExit)
    .sort((a, b) => b.doe! - a.doe!)[0];
  const stale = oldBoss && people.find((p) => p.doe === null && p.doj <= todayN && org[p.pos].dept === org[oldBoss.pos].dept && org[p.pos].grade <= 2);
  if (oldBoss && stale) stale.managerCode = oldBoss.code;

  const rows = people.map((p) => {
    const P = org[p.pos];
    return [
      p.code,
      `${p.first} ${p.last}`,
      p.blankGender ? "" : p.female ? "Female" : "Male",
      dateText(p.dob),
      dateText(p.doj),
      p.doe === null || p.blankExit ? "" : dateText(p.doe),
      p.status,
      DEPTS[P.dept].name,
      P.title,
      `G${P.grade}`,
      p.location,
      p.managerCode,
      String(p.salary)
    ];
  });
  return { headers: SAMPLE_HEADERS, rows };
}
