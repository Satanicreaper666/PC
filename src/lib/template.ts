import { marked } from "marked";
import { resolveFacts } from "../data/statutory";

type Field = { id: string; label: string; required: boolean; type: string };

/**
 * Turn a template body (Markdown with {{field}} placeholders) into HTML where
 * each placeholder is a live <span> the template engine fills in.
 * {{today}} is built in. Unknown placeholders are left visible so mistakes show.
 * {{fact:id}} tokens are replaced first with the figure from src/data/statutory.ts.
 */
export function renderTemplate(body: string, fields: Field[]): string {
  const byId = new Map(fields.map((f) => [f.id, f]));
  const tokens: string[] = [];
  const marked1 = resolveFacts(body).replace(/\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g, (_m, id: string) => {
    tokens.push(id);
    return `⟦${tokens.length - 1}⟧`;
  });
  let html = marked.parse(marked1, { gfm: true, breaks: true, async: false }) as string;
  html = html.replace(/⟦(\d+)⟧/g, (_m, n: string) => {
    const id = tokens[Number(n)];
    if (id === "today") return `<span class="ph" data-f="today" data-type="date">today's date</span>`;
    const f = byId.get(id);
    if (!f) return `<span class="ph unknown">{{${id}}}</span>`;
    const label = escapeHtml(f.label);
    return `<span class="ph${f.required ? "" : " opt"}" data-f="${id}" data-type="${f.type}" data-label="${label}">${label}</span>`;
  });
  return html;
}

/** Checklist bodies use GitHub task lists: "- [ ] item". */
export function renderChecklist(body: string): string {
  return marked.parse(resolveFacts(body), { gfm: true, async: false }) as string;
}

export function renderMarkdown(md: string): string {
  return marked.parse(resolveFacts(md), { gfm: true, async: false }) as string;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
