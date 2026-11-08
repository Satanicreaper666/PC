/** The talent review page: read a file, show the grid and the calibration checks. Nothing is uploaded. */
import { BOXES } from "../../lib/calc/nine-box-talent-mapper.ts";
import { GUIDE, MIN_GROUP, readTalent, review, type Cell, type Review } from "../../lib/talent/review.ts";
import { downloadCsv } from "../../scripts/csv.ts";
import { sharedRoster } from "../../scripts/roster.ts";

const root = document.querySelector<HTMLElement>("[data-tr]");
if (root) init(root);

function init(root: HTMLElement) {
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const status = q("[data-tr-status]");
  const out = q("[data-tr-out]");
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  let table: Cell[][] | null = null;
  let name = "";
  let last: Review | null = null;

  const shared = sharedRoster();
  if (shared) {
    q("[data-tr-shared]").hidden = false;
    q("[data-tr-shared-label]").textContent = `Use ${shared.fileName} (loaded in another tool)`;
  }

  const li = (text: string, flag = false) => {
    const el = document.createElement("li");
    if (flag) {
      const s = document.createElement("span");
      s.className = "flag";
      s.textContent = "Check: ";
      el.append(s);
    }
    el.append(text);
    return el;
  };
  function fill(t: HTMLTableElement, head: string[], rows: string[][], num: number[], flagCol = -1) {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    head.forEach((h) => tr.append(Object.assign(document.createElement("th"), { textContent: h, scope: "col" })));
    thead.append(tr);
    const tbody = document.createElement("tbody");
    for (const r of rows) {
      const row = document.createElement("tr");
      r.forEach((c, i) => {
        const td = document.createElement(i === 0 ? "th" : "td");
        td.textContent = c;
        if (num.includes(i)) td.className = "n";
        if (i === flagCol && c) td.className = "flag";
        row.append(td);
      });
      tbody.append(row);
    }
    t.replaceChildren(thead, tbody);
  }

  function render() {
    if (!table) return;
    const perf = Number(q<HTMLSelectElement>("[data-tr-perf]").value) as 3 | 5;
    const pot = Number(q<HTMLSelectElement>("[data-tr-pot]").value) as 3 | 5;
    const { people, cols } = readTalent(table, perf, pot);
    if (cols.performance === undefined || cols.potential === undefined) {
      status.textContent = `${name}: no ${cols.performance === undefined ? "performance rating" : "potential"} column was found. Use the column names in the blank template.`;
      out.hidden = true;
      return;
    }
    const r = review(people);
    last = r;
    status.textContent = `Read ${people.length} people from ${name}.${r.missing.length ? ` ${r.missing.length} without both ratings are left off the grid.` : ""}`;
    q("[data-tr-summary]").textContent = `${r.placed} people placed. Average performance level ${r.avgPerformance.toFixed(2)} out of 3.`;

    for (const b of r.boxes) {
      const cell = q(`[data-tr-box="${b.performance}-${b.potential}"]`);
      cell.querySelector("[data-n]")!.textContent = b.people.length ? `${b.people.length} · ${pct(b.share)}` : "No one";
      const names = b.people.slice(0, 6).map((p) => Object.assign(document.createElement("li"), { textContent: p.name }));
      if (b.people.length > 6) names.push(Object.assign(document.createElement("li"), { textContent: `and ${b.people.length - 6} more` }));
      cell.querySelector("[data-names]")!.replaceChildren(...names);
    }

    const tr = r.boxes.find((b) => b.performance === 3 && b.potential === 3)!;
    const bl = r.boxes.find((b) => b.performance === 1 && b.potential === 1)!;
    const mid = r.boxes.find((b) => b.performance === 2 && b.potential === 2)!;
    q("[data-tr-dist]").replaceChildren(
      li(`Future leaders (top right): ${pct(tr.share)}. A guide range is ${pct(GUIDE.topRight[0])} to ${pct(GUIDE.topRight[1])}.`, tr.share > GUIDE.topRight[1] || (r.placed >= 20 && tr.share < GUIDE.topRight[0])),
      li(`Under-performers (bottom left): ${pct(bl.share)}. More than ${pct(GUIDE.bottomLeft[1])} usually needs a plan, not just a rating.`, bl.share > GUIDE.bottomLeft[1]),
      li(`Core players (centre): ${pct(mid.share)}. Most organisations have their largest group here.`),
      li("Use these ranges to start the calibration conversation, never as a forced distribution.")
    );

    fill(
      q("[data-tr-mgr]"),
      ["Manager", "People", "Average performance", "Rated high", "Against company", "Check"],
      r.managers.map((m) => [m.manager, String(m.people), m.avgPerformance.toFixed(2), pct(m.highShare), `${m.diff > 0 ? "+" : ""}${m.diff.toFixed(2)}`, m.flag === "high" ? "Generous?" : m.flag === "low" ? "Strict?" : m.people < MIN_GROUP ? "Too few to judge" : ""]),
      [1, 2, 3, 4],
      5
    );

    const fair = q("[data-tr-fair]");
    if (r.womenOverall === null) fair.replaceChildren(li(`Add a gender column (with at least ${MIN_GROUP} people) to compare women's share of the top boxes with their share of everyone reviewed.`));
    else
      fair.replaceChildren(
        li(`Women are ${pct(r.womenOverall)} of the people reviewed (where gender is known).`),
        ...r.fairness.map((f) => li(`${f.group}: ${f.total ? `${pct(f.share)} women (${f.women} of ${f.total})` : "no one"}${f.flag ? `, ${Math.round(-f.gap * 100)} points below their overall share. Look at how potential was judged.` : "."}`, f.flag)),
        ...r.tenureByRow.filter((t) => t.years !== null).map((t) => li(`Average tenure, ${t.potential === 3 ? "high" : t.potential === 2 ? "moderate" : "low"} potential: ${t.years!.toFixed(1)} years.`))
      );

    fill(
      q("[data-tr-succ]"),
      ["Person", "Box", "Designation", "Department", "Manager", "Flight risk"],
      r.succession.slice(0, 50).map((p) => [p.name, BOXES.find((b) => b.performance === p.performance && b.potential === p.potential)!.title, p.designation, p.dept, p.manager, p.risk]),
      []
    );
    q("[data-tr-risk]").replaceChildren(
      ...(r.atRiskTalent.length ? [li(`${r.atRiskTalent.length} of these people are marked as a flight risk: ${r.atRiskTalent.map((p) => p.name).join(", ")}. Plan a stay conversation this month.`, true)] : []),
      ...(r.criticalWithoutSuccessor.length ? [li(`Critical roles with no possible successor in the same department: ${r.criticalWithoutSuccessor.join("; ")}.`, true)] : []),
      li("A box is a starting point for a development conversation, not a label. Share each person's development plan with them, not their box.")
    );
    out.hidden = false;
  }

  function load(rows: Cell[][], n: string) {
    table = rows;
    name = n;
    render();
    if (!out.hidden) out.focus();
  }

  q<HTMLSelectElement>("[data-tr-perf]").addEventListener("change", render);
  q<HTMLSelectElement>("[data-tr-pot]").addEventListener("change", render);
  q<HTMLInputElement>("[data-tr-file]").addEventListener("change", async (e) => {
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
  q("[data-tr-shared]").addEventListener("click", () => {
    const s = sharedRoster();
    if (s) load(s.rows, s.fileName);
  });
  q("[data-tr-sample]").addEventListener("click", () => load(sample(), "sample data"));
  q("[data-tr-template]").addEventListener("click", () =>
    downloadCsv("talent-review-template.csv", [
      ["Employee ID", "Employee name", "Department", "Designation", "Reporting manager", "Gender", "Date of joining", "Final rating", "Potential", "Critical role", "Flight risk"],
      ["E101", "Asha Pudina", "Sales", "Sales manager", "Kabir Dalchini", "Woman", "01/04/2021", "4", "High", "Yes", "Low"]
    ])
  );
  q("[data-tr-csv]").addEventListener("click", () => {
    if (!last) return;
    const rows = [["Name", "Box", "Performance", "Potential", "Manager", "Suggested action"]];
    for (const b of last.boxes) for (const p of b.people) rows.push([p.name, b.title, String(p.performance), String(p.potential), p.manager, b.action]);
    downloadCsv("talent-review.csv", rows);
  });
}

function sample(): Cell[][] {
  const rows: Cell[][] = [["Employee ID", "Employee name", "Department", "Designation", "Reporting manager", "Gender", "Date of joining", "Final rating", "Potential", "Critical role", "Flight risk"]];
  const first = ["Asha", "Rohit", "Meghna", "Yusuf", "Diya", "Arjun", "Nisha", "Farhan", "Lata", "Sameer", "Kiran", "Zoya"];
  const last = ["Pudina", "Javitri", "Anardana", "Kalonji", "Hing"];
  const mgrs = ["Kabir Dalchini", "Pooja Jaiphal", "Vikram Saunf", "Mira Palash"];
  const depts = ["Sales", "Engineering", "Finance", "Operations"];
  const perf = ["3", "4", "3", "5", "2", "3", "4", "3", "1", "4", "3", "5"];
  const pot = ["Moderate", "High", "Moderate", "High", "Low", "Moderate", "High", "Low", "Low", "Moderate", "Moderate", "High"];
  for (let i = 0; i < 48; i++) {
    const m = i % 4;
    rows.push([
      `E${101 + i}`,
      `${first[i % 12]} ${last[i % 5]}`,
      depts[m],
      ["Executive", "Engineer", "Analyst", "Supervisor"][m],
      mgrs[m],
      i % 3 === 0 ? "Woman" : "Man",
      `01/${String(1 + (i % 12)).padStart(2, "0")}/${2016 + (i % 9)}`,
      m === 1 && i % 2 ? "5" : perf[i % 12],
      i % 3 === 0 && pot[i % 12] === "High" ? "Moderate" : pot[i % 12],
      i % 11 === 0 ? "Yes" : "",
      i % 7 === 0 ? "High" : "Low"
    ]);
  }
  return rows;
}
