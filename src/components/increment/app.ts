/**
 * The increment cycle page: read an employee file, apply the rules, show the
 * cycle and export it. Nothing is uploaded; the file stays in this tab, and is
 * shared with other tools only if the reader ticks the box (src/scripts/roster.ts).
 */
import { RATINGS, readPeople, revisionLetterRows, runCycle, type Cell, type CycleResult, type CycleSettings, type Outcome, type RatingScale } from "../../lib/increment/cycle.ts";
import { downloadCsv } from "../../scripts/csv.ts";
import { forgetRoster, shareRoster, sharedRoster } from "../../scripts/roster.ts";

const root = document.querySelector<HTMLElement>("[data-ic]");
if (root) init(root);

function init(root: HTMLElement) {
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const status = q("[data-ic-status]");
  const form = q<HTMLFormElement>("[data-ic-form]");
  const rules = q("[data-ic-rules]");
  const results = q("[data-ic-results]");
  const shareBox = q<HTMLInputElement>("[data-ic-share]");
  const sharedBtn = q<HTMLButtonElement>("[data-ic-shared]");
  const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(n));
  const pct = (n: number, d = 1) => `${(Math.round(n * 10 ** d) / 10 ** d).toFixed(d)}%`;
  let table: Cell[][] | null = null;
  let fileName = "";
  let last: CycleResult | null = null;
  let filter = "";

  const shared = sharedRoster();
  if (shared) {
    sharedBtn.hidden = false;
    q("[data-ic-shared-label]").textContent = `Use ${shared.fileName} (loaded in another tool)`;
  }

  function settings(): CycleSettings {
    const f = (n: string) => Number(String((form.elements.namedItem(n) as HTMLInputElement).value).replace(/[%,\s]/g, ""));
    const s = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value;
    const b = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).checked;
    return {
      budgetPct: Math.max(0, f("budget") || 0),
      matrix: RATINGS.map((_, r) => [0, 1, 2].map((z) => Math.max(0, f(`m${r}_${z}`) || 0))),
      effectiveDate: s("effective") || "2027-04-01",
      cutoffDate: s("cutoff") || s("effective") || "2027-04-01",
      prorate: b("prorate"),
      fit: b("fit"),
      promotionPct: Math.max(0, f("promo") || 0),
      promotionBudgetPct: Math.max(0, f("promobudget") || 0)
    };
  }

  function load(rows: Cell[][], name: string) {
    table = rows;
    fileName = name;
    const scale = (form.elements.namedItem("scale") as HTMLSelectElement).value as RatingScale;
    const { people, cols } = readPeople(rows, scale);
    const found = Object.keys(cols);
    const label: Record<string, string> = { id: "ID", name: "name", dept: "department", designation: "designation", grade: "grade", manager: "manager", salary: "salary", rating: "rating", midpoint: "band midpoint", max: "band maximum", doj: "date of joining", promote: "promotion", newDesignation: "new designation" };
    if (cols.salary === undefined || (cols.rating === undefined && cols.promote === undefined)) {
      status.textContent = `${name}: no ${cols.salary === undefined ? "salary" : "rating"} column was found. Name the columns as in the blank template (for example "Annual CTC" and "Final rating") and try again.`;
      rules.hidden = true;
      results.hidden = true;
      return;
    }
    q("[data-ic-cols]").textContent = `Columns used: ${found.map((k) => label[k]).join(", ")}.`;
    status.textContent = `Read ${people.length} people from ${name}.`;
    if (shareBox.checked) share();
    rules.hidden = false;
    run();
    results.hidden = false;
  }

  function share() {
    if (!table) return;
    status.textContent += shareRoster(fileName, table) ? " Other tools in this tab can use it until you close the tab." : " The file is too large to share with other tools; it still works here.";
  }

  function cell(text: string, cls?: string, tag: "td" | "th" = "td") {
    const c = document.createElement(tag);
    c.textContent = text;
    if (cls) c.className = cls;
    if (tag === "th") c.scope = "row";
    return c;
  }
  function fill(t: HTMLTableElement, head: string[], rows: (string | [string, string])[][], numeric: number[]) {
    const thead = document.createElement("thead");
    const htr = document.createElement("tr");
    head.forEach((h, i) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = h;
      if (numeric.includes(i)) th.className = "n";
      htr.append(th);
    });
    thead.append(htr);
    const tbody = document.createElement("tbody");
    for (const r of rows) {
      const tr = document.createElement("tr");
      r.forEach((c, i) => {
        const [text, cls] = Array.isArray(c) ? c : [c, ""];
        tr.append(cell(text, [numeric.includes(i) ? "n" : "", cls].filter(Boolean).join(" "), i === 0 ? "th" : "td"));
      });
      tbody.append(tr);
    }
    t.replaceChildren(thead, tbody);
  }

  function run() {
    if (!table) return;
    const scale = (form.elements.namedItem("scale") as HTMLSelectElement).value as RatingScale;
    const s = settings();
    const r = runCycle(readPeople(table, scale).people, s);
    last = r;
    const meritOver = r.meritCost - r.meritBudget;
    const promoOver = r.promotionCost - r.promotionBudget;
    const kpi = (label: string, value: string, bad = false) => {
      const d = document.createElement("div");
      d.className = `kpi${bad ? " bad" : ""}`;
      d.append(Object.assign(document.createElement("strong"), { textContent: value }), label);
      return d;
    };
    q("[data-ic-kpis]").replaceChildren(
      kpi("people in the cycle", String(r.eligible)),
      kpi("payroll", inr(r.payroll)),
      kpi(`merit budget (${pct(s.budgetPct)})`, inr(r.meritBudget)),
      kpi(meritOver > 1 ? `merit cost, ${inr(meritOver)} over` : "merit cost", inr(r.meritCost), meritOver > 1),
      kpi(`promotions (${r.promotions})`, inr(r.promotionCost), promoOver > 1),
      kpi("average increase", r.payroll > 0 ? pct(((r.meritCost + r.promotionCost) / r.payroll) * 100, 2) : "0%"),
      kpi("new payroll", inr(r.newPayroll))
    );
    const warn: string[] = [];
    if (r.excluded) warn.push(`${r.excluded} ${r.excluded === 1 ? "person is" : "people are"} left out (no salary, no rating, or joined after the cut-off): they are listed at the end of the table.`);
    if (!s.fit && Math.abs(meritOver) > 1) warn.push(`Merit is ${inr(Math.abs(meritOver))} ${meritOver > 0 ? "over" : "under"} budget. Tick "Scale the matrix" to spend it exactly (every cell × ${(r.meritCostUnscaled > 0 ? r.meritBudget / r.meritCostUnscaled : 1).toFixed(3)}), or change the matrix.`);
    if (promoOver > 1) warn.push(`Promotions cost ${inr(promoOver)} more than the promotion budget.`);
    if (r.aboveMax) warn.push(`${r.aboveMax} ${r.aboveMax === 1 ? "person goes" : "people go"} above the band maximum: consider a lump sum instead of a base increase.`);
    if (r.midFromGrade) warn.push(`${r.midFromGrade} people have no band midpoint, so the grade's median salary is used for their compa-ratio.`);
    const warnEl = q("[data-ic-warn]");
    warnEl.replaceChildren(...warn.map((w) => Object.assign(document.createElement("li"), { textContent: w })));
    warnEl.hidden = !warn.length;

    fill(q("[data-ic-rating]"), ["Rating", "People", "Average merit"], r.byRating.map((x) => [x.rating, String(x.people), x.people ? pct(x.avgPct) : "–"]), [1, 2]);
    const groupRows = (list: CycleResult["byDept"]) => list.map((g) => [g.name, String(g.people), inr(g.payroll), inr(g.meritCost), inr(g.promotionCost), pct(g.avgPct)]);
    fill(q("[data-ic-dept]"), ["Department", "People", "Payroll", "Merit", "Promotions", "Average"], groupRows(r.byDept), [1, 2, 3, 4, 5]);
    fill(q("[data-ic-mgr]"), ["Manager", "People", "Payroll", "Merit", "Promotions", "Average"], groupRows(r.byManager), [1, 2, 3, 4, 5]);
    renderPeople();
  }

  function renderPeople() {
    if (!last) return;
    const f = filter.trim().toLowerCase();
    const list = last.outcomes
      .filter((o) => !f || [o.name, o.id, o.dept, o.manager, o.designation].some((x) => x.toLowerCase().includes(f)))
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "ok" ? -1 : 1));
    const shown = list.slice(0, 300);
    const row = (o: Outcome): (string | [string, string])[] =>
      o.status === "ok"
        ? [
            o.name || o.id || `Row ${o.row}`,
            o.dept,
            RATINGS[o.rating] ?? (o.promote ? "Promotion only" : ""),
            o.compa === null ? "–" : o.compa.toFixed(2),
            o.proration < 1 ? `${Math.round(o.proration * 100)}%` : "",
            pct(o.meritPct),
            o.promote ? pct(o.promotionPct) : "",
            inr(o.salary),
            o.aboveMax ? [inr(o.newSalary), "flag"] : inr(o.newSalary)
          ]
        : [o.name || o.id || `Row ${o.row}`, o.dept, ["Left out: " + (o.reason ?? ""), "flag"], "", "", "", "", Number.isFinite(o.salary) ? inr(o.salary) : "", ""];
    fill(q("[data-ic-people]"), ["Person", "Department", "Rating", "Compa-ratio", "Prorated", "Merit", "Promotion", "Salary", "New salary"], shown.map(row), [3, 4, 5, 6, 7, 8]);
    q("[data-ic-more]").textContent = list.length > shown.length ? `Showing ${shown.length} of ${list.length}. The CSV has everyone.` : "";
  }

  form.addEventListener("input", run);
  form.addEventListener("change", run);
  q<HTMLInputElement>("[data-ic-filter]").addEventListener("input", (e) => {
    filter = (e.target as HTMLInputElement).value;
    renderPeople();
  });

  q<HTMLInputElement>("[data-ic-file]").addEventListener("change", async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    status.textContent = "Reading the file…";
    const { readEmployeeFile, bestSheet, LoadError } = await import("../analytics/load.ts");
    try {
      const loaded = await readEmployeeFile(file);
      load(loaded.sheets[bestSheet(loaded.sheets)].rows as Cell[][], file.name);
    } catch (err) {
      status.textContent = err instanceof LoadError ? err.message : "That file couldn't be read. Save it as CSV or Excel (.xlsx) and try again.";
    }
  });

  sharedBtn.addEventListener("click", () => {
    const r = sharedRoster();
    if (r) load(r.rows, r.fileName);
  });

  shareBox.addEventListener("change", () => {
    if (shareBox.checked) share();
    else {
      forgetRoster();
      status.textContent = "The file is no longer shared with other tools.";
    }
  });

  q("[data-ic-sample]").addEventListener("click", () => load(sample(), "sample data"));

  q("[data-ic-template]").addEventListener("click", () =>
    downloadCsv("increment-cycle-template.csv", [
      ["Employee ID", "Employee name", "Department", "Designation", "Grade", "Reporting manager", "Annual CTC", "Final rating", "Band midpoint", "Band maximum", "Date of joining", "Promotion", "New designation"],
      ["E101", "Asha Pudina", "Sales", "Sales executive", "G3", "Kabir Dalchini", "800000", "4", "1000000", "1200000", "01/04/2021", "No", ""]
    ])
  );

  q("[data-ic-csv]").addEventListener("click", () => {
    if (!last) return;
    const rows = [
      ["Employee ID", "Name", "Department", "Manager", "Designation", "Grade", "Rating", "Compa-ratio", "Proration", "Merit %", "Promotion %", "Total %", "Salary", "New salary", "Above band max", "Status"],
      ...last.outcomes.map((o) => [
        o.id,
        o.name,
        o.dept,
        o.manager,
        o.designation,
        o.grade,
        RATINGS[o.rating] ?? "",
        o.compa === null ? "" : o.compa.toFixed(3),
        o.status === "ok" ? o.proration.toFixed(3) : "",
        o.status === "ok" ? o.meritPct.toFixed(2) : "",
        o.status === "ok" ? o.promotionPct.toFixed(2) : "",
        o.status === "ok" ? o.totalPct.toFixed(2) : "",
        Number.isFinite(o.salary) ? Math.round(o.salary) : "",
        o.status === "ok" ? o.newSalary : "",
        o.aboveMax ? "yes" : "",
        o.status === "ok" ? "In the cycle" : `Left out: ${o.reason}`
      ])
    ];
    downloadCsv("increment-cycle.csv", rows);
  });

  q("[data-ic-letters]").addEventListener("click", () => {
    if (!last) return;
    downloadCsv("salary-revision-letters.csv", revisionLetterRows(last, settings().effectiveDate));
  });
}

/** 40 made-up people for "Try with sample data". */
function sample(): Cell[][] {
  const depts = ["Sales", "Engineering", "Finance", "Operations"];
  const managers = ["Kabir Dalchini", "Pooja Jaiphal", "Vikram Saunf", "Mira Palash"];
  const names = ["Asha", "Rohit", "Meghna", "Yusuf", "Diya", "Arjun", "Nisha", "Farhan", "Lata", "Sameer"];
  const surnames = ["Pudina", "Javitri", "Anardana", "Kalonji", "Hing"];
  const grades: [string, number][] = [
    ["G2", 600000],
    ["G3", 900000],
    ["G4", 1400000],
    ["G5", 2200000]
  ];
  const ratings = ["3", "4", "3", "5", "3", "2", "4", "3", "1", "4"];
  const rows: Cell[][] = [["Employee ID", "Employee name", "Department", "Designation", "Grade", "Reporting manager", "Annual CTC", "Final rating", "Band midpoint", "Band maximum", "Date of joining", "Promotion", "New designation"]];
  for (let i = 0; i < 40; i++) {
    const [g, mid] = grades[i % 4];
    const salary = Math.round((mid * (0.78 + ((i * 37) % 45) / 100)) / 1000) * 1000;
    const year = 2018 + (i % 9);
    const doj = year === 2026 ? `01/${String(1 + (i % 12)).padStart(2, "0")}/2026` : `15/${String(1 + (i % 12)).padStart(2, "0")}/${year}`;
    rows.push([
      `E${101 + i}`,
      `${names[i % 10]} ${surnames[i % 5]}`,
      depts[i % 4],
      ["Executive", "Engineer", "Analyst", "Supervisor"][i % 4],
      g,
      managers[i % 4],
      String(salary),
      ratings[i % 10],
      String(mid),
      String(Math.round(mid * 1.2)),
      doj,
      i % 9 === 3 ? "Yes" : "",
      i % 9 === 3 ? "Senior " + ["executive", "engineer", "analyst", "supervisor"][i % 4] : ""
    ]);
  }
  return rows;
}
