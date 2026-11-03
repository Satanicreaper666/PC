/**
 * Highlights the facts in a short HTML string the way a careful reader would:
 * pink for a deadline, yellow for the numbers to remember. Only text between tags
 * is touched, at most one deadline and two numbers per item, so a summary never
 * turns into a rainbow. See docs/ART-DIRECTION.md, "Marks and stationery".
 */
const NUM = "(?:\\d+(?:\\.\\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|thirty|forty-five|sixty|ninety)";
const UNIT = "(?:working\\s+|calendar\\s+)?(?:days?|weeks?|months?|years?|hours?)";
const DEADLINE = new RegExp(
  [
    `\\b(?:within|by|before|no later than)\\s+(?:the\\s+)?${NUM}(?:st|nd|rd|th)?\\s+${UNIT}\\b`,
    `\\b(?:by|before)\\s+the\\s+\\d+(?:st|nd|rd|th)\\b(?:\\s+of\\s+(?:the\\s+)?(?:next\\s+|following\\s+)?month)?`
  ].join("|"),
  "i"
);
const FIGURE = new RegExp(
  [
    "₹\\s?\\d[\\d,]*(?:\\.\\d+)?(?:\\s?(?:lakh|crore))?",
    "\\b\\d+(?:\\.\\d+)?%",
    `\\b\\d+(?:\\.\\d+)?\\s+${UNIT}\\b`,
    "\\b\\d+\\s+or\\s+more\\s+(?:employees|workers|people)\\b"
  ].join("|"),
  "i"
);

function wrapFirst(text: string, re: RegExp, open: string, limit: number): { out: string; used: number } {
  let out = "";
  let rest = text;
  let used = 0;
  while (used < limit) {
    const m = re.exec(rest);
    if (!m) break;
    out += rest.slice(0, m.index) + open + m[0] + "</mark>";
    rest = rest.slice(m.index + m[0].length);
    used++;
  }
  return { out: out + rest, used };
}

export function markFacts(html: string, opts: { deadlines?: number; figures?: number } = {}): string {
  let deadlines = opts.deadlines ?? 1;
  let figures = opts.figures ?? 2;
  const parts = html.split(/(<[^>]+>)/);
  let insideMark = 0;
  return parts
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<mark\b/i.test(part)) insideMark++;
        if (/^<\/mark>/i.test(part)) insideMark = Math.max(0, insideMark - 1);
        return part;
      }
      if (insideMark || !part.trim()) return part;
      // Deadlines first, then figures in the text that is left.
      const pieces = part.split(DEADLINE.source ? new RegExp(`(${DEADLINE.source})`, "i") : /$^/);
      return pieces
        .map((piece, i) => {
          if (i % 2 === 1) {
            if (deadlines > 0) {
              deadlines--;
              return `<mark class="hl hl-pink" data-mark>${piece}</mark>`;
            }
            return piece;
          }
          if (figures <= 0) return piece;
          const r = wrapFirst(piece, FIGURE, '<mark class="hl" data-mark>', figures);
          figures -= r.used;
          return r.out;
        })
        .join("");
    })
    .join("");
}
