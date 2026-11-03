/**
 * The letters and forms the mail merge can fill. Built at build time from the
 * toolkit collection with the same renderer as the single-letter pages
 * (src/lib/template.ts), so a merged letter reads exactly like one filled in
 * by hand on the letter's own page.
 */
import { renderTemplate } from "../template.ts";

export type FieldType = "text" | "textarea" | "date" | "number" | "email" | "tel" | "select" | "money";
export type MergeField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  default?: string;
  placeholder?: string;
  help?: string;
  group?: string;
};
/** employer = letters HR sends; form = forms pre-filled for several people; employee = letters an employee writes. */
export type TemplateGroup = "employer" | "form" | "employee";
export type MergeTemplate = {
  id: string;
  title: string;
  kind: "letter" | "form";
  stage: string;
  group: TemplateGroup;
  /** Only the fields the body uses, in the order the letter's page lists them. */
  fields: MergeField[];
  /** The body as HTML, with each {{field}} as a <span class="ph" data-f="…">. */
  html: string;
};

/**
 * Forms that make sense to pre-fill for a list of people: appraisal forms for
 * a review cycle and evaluation forms for an interview day. Forms that
 * collect sensitive details from one person (joining, medical, POSH
 * complaint) stay one at a time on their own pages.
 */
export const MERGE_FORMS = ["annual-performance-appraisal", "interview-evaluation-form"];

export type ToolEntry = {
  id: string;
  body?: string;
  data: {
    title: string;
    description: string;
    kind: string;
    stage: string;
    fields: { id: string; label: string; type: string; required: boolean; options?: string[]; default?: string; placeholder?: string; help?: string; group?: string }[];
  };
};

const GROUP_ORDER: Record<TemplateGroup, number> = { employer: 0, form: 1, employee: 2 };
const STAGE_ORDER = ["recruit", "onboard", "grow", "pay", "exit", "lead"];
export const GROUP_LABEL: Record<TemplateGroup, string> = {
  employer: "Letters from the employer",
  form: "Forms to pre-fill",
  employee: "Letters an employee writes"
};

/** {{field}} ids used in a template body, in order of first use. */
export function usedFields(body: string): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(/\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

export function buildLibrary(entries: ToolEntry[]): MergeTemplate[] {
  return entries
    .filter((e) => e.data.kind === "letter" || (e.data.kind === "form" && MERGE_FORMS.includes(e.id)))
    .map((e): MergeTemplate => {
      const body = e.body ?? "";
      const used = new Set(usedFields(body));
      const fields = e.data.fields
        .filter((f) => used.has(f.id))
        .map((f) => ({ ...f, type: f.type as FieldType }));
      const kind = e.data.kind as "letter" | "form";
      // Letters written in the first person ("Your full name") are the employee's own.
      const group: TemplateGroup = kind === "form" ? "form" : fields.some((f) => f.id === "your_name") ? "employee" : "employer";
      return { id: e.id, title: e.data.title, kind, stage: e.data.stage, group, fields, html: renderTemplate(body, fields) };
    })
    .sort((a, b) => GROUP_ORDER[a.group] - GROUP_ORDER[b.group] || STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage) || a.title.localeCompare(b.title));
}

/** JSON that is safe inside a <script type="application/json"> element. */
export const jsonForScript = (v: unknown) =>
  JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .split(String.fromCharCode(0x2028))
    .join("\\u2028")
    .split(String.fromCharCode(0x2029))
    .join("\\u2029");
