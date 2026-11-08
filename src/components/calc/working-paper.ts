/**
 * "Working paper": every calculator's result as a document an auditor, inspector
 * or tribunal can read. It has the company, who prepared it, the date, a reference,
 * the result, the inputs, the working, the notes, the rates and limits used (with
 * the date they were checked) and a Prepared / Reviewed / Approved block.
 *
 * In statement mode (the full and final calculator) it also names the employee and
 * adds their acknowledgement, so it can be given to them as the settlement statement.
 *
 * Nothing typed here is saved or put in the link: names and IDs stay in the page.
 * Word export loads the docx library only when asked for.
 */
import type { CalcResult } from "../../scripts/calc-kit";
import { downloadBlob, fileStem } from "../../scripts/csv.ts";
import { fieldInfos, pageTitle, type ScenarioHost } from "./scenario-ui";

export type PaperField = { label: string; value: string };
export type PaperSpec = {
  title: string;
  company?: string;
  meta: PaperField[];
  result: CalcResult;
  inputs: PaperField[];
  /** Rows of the "Rates and limits" table on the page: value, what it is, law and source. */
  rates: string[][];
  ratesWhen?: string;
  link: string;
  signoff: { role: string; name?: string }[];
  /** Statement mode: a sentence for the employee to sign. */
  acknowledgement?: string;
};

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] => {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
};

function table(head: string[] | null, rows: string[][]): HTMLTableElement {
  const t = el("table");
  t.className = "wp-table";
  const body = el("tbody");
  if (head) {
    const tr = el("tr");
    head.forEach((h) => tr.append(el("th", h)));
    body.append(tr);
  }
  for (const r of rows) {
    const tr = el("tr");
    r.forEach((c, i) => tr.append(i === 0 && head === null ? el("th", c) : el("td", c)));
    body.append(tr);
  }
  t.append(body);
  return t;
}

/** The working paper as plain HTML (headings, paragraphs, tables, lists), which docx-export and print both read. */
export function buildPaper(spec: PaperSpec): HTMLElement {
  const root = el("div");
  root.className = "wp-doc";
  root.append(el("h1", spec.title));
  if (spec.company) {
    const p = el("p");
    p.append(el("strong", spec.company));
    root.append(p);
  }
  root.append(table(null, spec.meta.filter((m) => m.value).map((m) => [m.label, m.value])));

  const r = spec.result;
  root.append(el("h2", "Result"));
  const lines = (r.lines ?? []).map((l) => [l.label, l.value, l.note ?? ""]);
  root.append(table(["Item", "Amount or date", "Note"], lines));

  if (r.warnings?.length) {
    root.append(el("h2", "Points to check"));
    const ul = el("ul");
    r.warnings.forEach((w) => ul.append(el("li", w)));
    root.append(ul);
  }

  root.append(el("h2", "Inputs"));
  root.append(table(["Input", "Value"], spec.inputs.filter((f) => f.value).map((f) => [f.label, f.value])));

  if (r.working?.length) {
    root.append(el("h2", "How it was worked out"));
    root.append(table(["Step", "Working", "Result"], r.working.map((s) => [s.label + (s.note ? ` (${s.note})` : ""), s.formula, s.result])));
  }

  if (r.notes?.length) {
    root.append(el("h2", "Notes and assumptions"));
    const ul = el("ul");
    r.notes.forEach((n) => ul.append(el("li", n)));
    root.append(ul);
  }

  if (spec.rates.length) {
    root.append(el("h2", spec.ratesWhen ? `Rates and limits used, ${spec.ratesWhen}` : "Rates and limits used"));
    root.append(table(["Value", "What it is", "Law and source"], spec.rates));
  }

  root.append(el("h2", "Sign-off"));
  root.append(table(["", "Name", "Signature", "Date"], spec.signoff.map((s) => [s.role, s.name ?? "", "", ""])));
  if (spec.acknowledgement) {
    root.append(el("p", spec.acknowledgement));
    root.append(table(["", "Name", "Signature", "Date"], [["Employee", spec.meta.find((m) => m.label === "Employee")?.value ?? "", "", ""]]));
  }

  root.append(el("p", `Worked out with PeopleCraft's free calculator. Link to these numbers: ${spec.link}`));
  root.append(el("p", "A working paper to check against payroll and the employment contract. It is not legal or tax advice."));
  return root;
}

/** Print only the working paper, then put the page back. */
export function printPaper(doc: HTMLElement, title: string): void {
  const holder = el("div");
  holder.className = "wp-print-root";
  holder.append(doc);
  document.body.append(holder);
  document.documentElement.classList.add("wp-printing");
  const old = document.title;
  document.title = title;
  const done = () => {
    document.documentElement.classList.remove("wp-printing");
    holder.remove();
    document.title = old;
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
  // Browsers that print synchronously have already fired afterprint; this is a safety net.
  setTimeout(() => {
    if (document.documentElement.classList.contains("wp-printing")) done();
  }, 1500);
}

export async function downloadPaper(doc: HTMLElement, title: string, fileStem: string, company?: string): Promise<void> {
  const [{ toDocx }, profile] = await Promise.all([import("../../scripts/docx-export"), import("../../scripts/profile")]);
  const lh = profile.loadLetterhead();
  const logo = lh ? await profile.logoForDocx(lh, company) : null;
  const blob = await toDocx(doc, title, logo ? { logo } : undefined);
  downloadBlob(`${fileStem}.docx`, blob);
}

const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = (d = new Date()) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Wire the "Working paper" (or "Settlement statement") button and its small form in a CalcShell. */
export function setupPaper(host: ScenarioHost): void {
  const { root } = host;
  const open = root.querySelector<HTMLButtonElement>("[data-wp-open]");
  const form = root.querySelector<HTMLFormElement>("[data-wp-form]");
  if (!open || !form) return;
  const statement = form.dataset.wpMode === "statement";
  const status = form.querySelector<HTMLElement>("[data-wp-status]");
  const val = (k: string) => clean(form.querySelector<HTMLInputElement>(`[data-wp="${k}"]`)?.value);

  const close = () => {
    form.hidden = true;
    open.setAttribute("aria-expanded", "false");
    open.focus();
  };
  open.addEventListener("click", async () => {
    const show = form.hidden;
    form.hidden = !show;
    open.setAttribute("aria-expanded", String(show));
    if (!show) return;
    const company = form.querySelector<HTMLInputElement>('[data-wp="company"]');
    if (company && !company.value) {
      try {
        const { loadProfile } = await import("../../scripts/profile");
        company.value = loadProfile()?.company ?? "";
      } catch {
        /* storage blocked */
      }
    }
    (company && !company.value ? company : form.querySelector<HTMLInputElement>("input"))?.focus();
  });
  form.querySelector("[data-wp-cancel]")?.addEventListener("click", close);
  form.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  });

  function spec(): PaperSpec | null {
    const r = host.last();
    if (!r || r.message) return null;
    const state = host.fieldState();
    const inputs = fieldInfos(host.form)
      .filter((f) => !f.isHidden())
      .map((f) => ({ label: f.label, value: f.display(state[f.name]) }));
    const asat = document.querySelector(".asat");
    const rates = Array.from(asat?.querySelectorAll("tbody tr") ?? []).map((tr) => Array.from(tr.children).map((td) => clean(td.textContent)));
    const when = /\bas at\s+(.+)$/.exec(clean(asat?.querySelector(".when")?.textContent))?.[1];
    const base = pageTitle(host).replace(/ calculator$/i, "");
    const title = statement ? `${base} statement` : `${base}: working paper`;
    const prepared = val("prepared");
    const meta: PaperField[] = [
      ...(statement
        ? [
            { label: "Employee", value: val("employee") },
            { label: "Employee ID", value: val("empid") },
            { label: "Designation and department", value: val("role") }
          ]
        : [{ label: "For", value: val("for") }]),
      { label: "Prepared by", value: prepared },
      { label: "Date", value: today() },
      { label: "Reference", value: val("ref") }
    ];
    return {
      title,
      company: val("company") || undefined,
      meta,
      result: r,
      inputs,
      rates,
      ratesWhen: when ? `as at ${when}` : undefined,
      link: location.href,
      signoff: statement
        ? [{ role: "Prepared by (HR)", name: prepared }, { role: "Checked by (Finance)" }, { role: "Approved by" }]
        : [{ role: "Prepared by", name: prepared }, { role: "Reviewed by" }, { role: "Approved by" }],
      acknowledgement: statement ? "I have received a copy of this statement, showing what is paid to me, what is deducted and why." : undefined
    };
  }

  const fileName = (s: PaperSpec) => fileStem([s.title, s.meta.find((m) => m.label === "Employee" || m.label === "For")?.value].filter(Boolean).join(" "));
  const say = (t: string) => {
    if (status) status.textContent = t;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const s = spec();
    if (!s) return say("Complete the calculator first: the result has a message to fix.");
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;
    say("Preparing the Word file…");
    try {
      await downloadPaper(buildPaper(s), s.title, fileName(s), s.company);
      say(`Downloaded ${fileName(s)}.docx.`);
    } catch (err) {
      console.error(err);
      say("The Word file couldn't be made. Try Print instead.");
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  form.querySelector("[data-wp-print]")?.addEventListener("click", () => {
    const s = spec();
    if (!s) return say("Complete the calculator first: the result has a message to fix.");
    printPaper(buildPaper(s), s.title);
  });
}
