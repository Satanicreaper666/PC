/**
 * Turn the on-screen document into a real Word file. Loaded only when someone
 * clicks "Download Word", so the docx library never slows normal pages.
 */
import {
  AlignmentType,
  Document,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";

/** A letterhead logo, already sized in pixels (96 to the inch). SVGs carry a PNG copy for older Word. */
export type DocxLogo = {
  type: "png" | "jpg" | "svg";
  data: Uint8Array;
  fallback?: Uint8Array;
  width: number;
  height: number;
  alt: string;
};
export type DocxOptions = {
  /** Printed at the top of the first page of each document, as a letterhead is. */
  logo?: DocxLogo;
};

type Run = TextRun;

function runs(node: Node, style: { bold?: boolean; italics?: boolean } = {}): Run[] {
  const out: Run[] = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = (child.textContent ?? "").replace(/\s+/g, " ");
      if (text) out.push(new TextRun({ text, bold: style.bold, italics: style.italics }));
    } else if (child instanceof HTMLElement) {
      if (child.hidden) return;
      if (child.tagName === "BR") out.push(new TextRun({ break: 1 }));
      else if (child.tagName === "STRONG" || child.tagName === "B") out.push(...runs(child, { ...style, bold: true }));
      else if (child.tagName === "EM" || child.tagName === "I") out.push(...runs(child, { ...style, italics: true }));
      else out.push(...runs(child, style));
    }
  });
  return out;
}

function blocks(el: HTMLElement): Array<Paragraph | Table> {
  const out: Array<Paragraph | Table> = [];
  el.childNodes.forEach((node) => {
    if (!(node instanceof HTMLElement) || node.hidden) return;
    const tag = node.tagName;
    if (tag === "H1") out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs(node) }));
    else if (tag === "H2") out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(node), spacing: { before: 240 } }));
    else if (tag === "H3" || tag === "H4") out.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(node), spacing: { before: 200 } }));
    else if (tag === "P") out.push(new Paragraph({ children: runs(node), spacing: { after: 160 } }));
    else if (tag === "UL" || tag === "OL") {
      node.querySelectorAll(":scope > li").forEach((li) => {
        if ((li as HTMLElement).hidden) return;
        out.push(
          new Paragraph({
            children: runs(li),
            numbering: { reference: tag === "OL" ? "pc-numbers" : "pc-bullets", level: 0 },
            spacing: { after: 80 }
          })
        );
      });
    } else if (tag === "TABLE") {
      const rows = Array.from(node.querySelectorAll("tr")).filter((tr) => !(tr as HTMLElement).hidden);
      out.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: rows.map(
            (tr) =>
              new TableRow({
                children: Array.from(tr.children).map(
                  (cell) => new TableCell({ children: [new Paragraph({ children: runs(cell, { bold: cell.tagName === "TH" }) })] })
                )
              })
          )
        })
      );
    } else if (tag === "HR") out.push(new Paragraph({ children: [], border: { bottom: { color: "C9CEE0", space: 1, style: "single", size: 6 } } }));
    else if (tag === "DIV" || tag === "SECTION") out.push(...blocks(node));
  });
  return out;
}

/** The letterhead: the logo in the first page's header, with a hairline under it. */
function letterhead(logo: DocxLogo): Header {
  const common = {
    transformation: { width: logo.width, height: logo.height },
    altText: { name: "Logo", description: logo.alt, title: logo.alt }
  };
  const image =
    logo.type === "svg"
      ? new ImageRun({ ...common, type: "svg", data: logo.data, fallback: { type: "png", data: logo.fallback ?? new Uint8Array() } })
      : new ImageRun({ ...common, type: logo.type, data: logo.data });
  return new Header({
    children: [
      new Paragraph({
        children: [image],
        spacing: { after: 120 },
        border: { bottom: { color: "C9CEE0", space: 6, style: "single", size: 6 } }
      })
    ]
  });
}

/**
 * One element becomes one document. A list of elements (the mail merge's
 * letters) becomes one document with each element in its own section, and
 * each section starts on a new page. With a logo, every section's first page
 * carries the letterhead.
 */
export async function toDocx(doc: HTMLElement | HTMLElement[], title: string, opts: DocxOptions = {}): Promise<Blob> {
  const parts = Array.isArray(doc) ? doc : [doc];
  const logo = opts.logo && (opts.logo.type !== "svg" || opts.logo.fallback?.length) ? opts.logo : undefined;
  const document_ = new Document({
    title,
    creator: "PeopleCraft",
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } }
    },
    numbering: {
      config: [
        { reference: "pc-bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT }] },
        { reference: "pc-numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT }] }
      ]
    },
    sections: parts.map((part) => ({
      properties: {
        page: { margin: { top: 1134, bottom: 1134, left: 1247, right: 1247, ...(logo ? { header: 567 } : {}) } },
        // The logo heads the first page only; continuation pages stay plain, as on printed letterhead.
        ...(logo ? { titlePage: true } : {})
      },
      ...(logo ? { headers: { first: letterhead(logo) } } : {}),
      children: blocks(part)
    }))
  });
  return Packer.toBlob(document_);
}
