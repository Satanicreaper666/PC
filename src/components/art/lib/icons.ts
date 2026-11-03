/**
 * The 24 spot icons, cut on one 48 × 48 board (docs/ART-DIRECTION.md, "Icons").
 *
 * Every icon is two or three layers of paper:
 *   p1   a coloured base piece, glued flat, that gives the silhouette its mass
 *   p2   white paper and figures, lifted
 *   p2 s the turmeric subject, lifted again so it throws its own shadow
 *        (class "s" lets SpotIcon lift it a hair more on hover)
 * Turmeric is the one thing that matters; light turmeric is its lit edge.
 * Content sits in a 36-unit box, nudged up and left of centre so the shadow,
 * which falls down and right, balances it. White paper always lies on or
 * against coloured paper, because these icons live on white tiles.
 */
import { P, g, fill, strip, circle, rect, poly, rupee, n, lit, litCircle, sheet, tilt } from "./paper.ts";
import { figure, type Pose } from "./figure.ts";

/** Limb thickness for people in icons: one family with the scenes, sized to read at 40px. */
const U = 2.5;
/** Printed detail on paper: text lines, rules. */
const ruled = (d: string, w = 1.8) => strip(P.mid, w, d);
const who = (pose: Pose, x: number, ground: number, extra: Partial<Parameters<typeof figure>[0]> = {}) =>
  figure({ x, ground, u: U, pose, ...extra });

/** The floor a standing figure needs: a strip of mid paper, glued flat. */
const floor = (x1 = 6, x2 = 42, y = 42) => rect(P.mid, x1, y, x2 - x1, 3.2, 1.6);

export const ICONS: Record<string, () => string> = {
  /* ── Stages ─────────────────────────────────────────────── */

  // Two people across a table; one slides the turmeric sheet over.
  recruit() {
    const l = who({ lean: 6, arms: [[64, 30], [52, 38]], legs: [[88, 86], [84, 84]] }, 11.5, 47, { u: 2.2, paper: "mid" });
    const r = who({ lean: 3, nod: 10, arms: [[38, 62], [28, 72]], legs: [[88, 86], [84, 84]] }, 37, 47, { u: 2.2, face: -1 });
    return (
      g("p2", l.svg + r.svg) +
      g("p2", fill(P.mid, "M4.5 30H43.5V33.5H40.5V43H37.5V33.5H10.5V43H7.5V33.5H4.5Z")) +
      g("p2 s", lit(poly(17.4, 20.2, 29.4, 18.4, 30.6, 27.6, 18.6, 29.4)) + ruled("M20.8 23.1L26.6 22.2M21.3 26.1L25.2 25.5", 1.3))
    );
  },

  // Stepping through the door on day one, the turmeric badge on the chest.
  onboard() {
    const f = who({ lean: 3, arms: [[-30, 20], [34, 36]], legs: [[24, 8], [-14, 20]] }, 25, 43.5);
    const c = { x: f.shoulder.x + 0.7, y: f.shoulder.y + 4.8 };
    return (
      g("p1", fill(P.mid, "M8 43V6.5H28V43H24.5V10H11.5V43Z") + rect(P.white, 11.5, 10, 13, 33)) +
      g("p2", fill(P.ink, "M11.5 10L5 13.2V43.6L11.5 43Z") + f.svg) +
      g("p2 s", strip(P.deep, 0.9, `M${n(c.x - 2.1)} ${n(c.y - 4.4)}L${n(c.x)} ${n(c.y - 0.6)}L${n(c.x + 2.2)} ${n(c.y - 4.2)}`) + lit(`M${n(c.x - 2.7)} ${n(c.y - 0.8)}h5.4v6.8h-5.4Z`))
    );
  },

  // Up the steps towards the turmeric flag.
  grow() {
    const f = who({ lean: 10, arms: [[-22, 24], [40, 40]], legs: [[62, 64], [-8, 18]] }, 15.5, 36, { u: 2.1 });
    return (
      g("p1", fill(P.mid, "M4 43V35.5H16V28H28V20.5H40V43Z")) +
      g("p2", f.svg + strip(P.deep, 1.3, "M35 20.5V4.5")) +
      g("p2 s", lit("M35.6 4.8L44 7.9L35.6 11Z"))
    );
  },

  // Payday: the payslip, and the turmeric rupee on top of it.
  pay() {
    return (
      g("p1", fill(P.ink, poly(8.5, 9.6, 30.6, 7.4, 33.2, 34.2, 11.1, 36.4))) +
      g("p2", tilt(3, 23, 21, rect(P.white, 12, 6, 23, 30.5, 0.6) + rect(P.pale, 12, 6, 23, 6, 0.6) + ruled("M15.5 17H22.5M26 17H31.5M15.5 21.5H22.5M26 21.5H30M15.5 26H22.5M26 26H31.5"))) +
      g("p2 s", litCircle(31.5, 34, 9) + strip(P.deep, 1.5, rupee(28.5, 29, 10)))
    );
  },

  // Leaving with the box, waving back; the relieving letter rides on top.
  exit() {
    const f = who({ lean: 3, arms: [[22, 86], [146, 64]], legs: [[22, 8], [-15, 20]] }, 15.5, 42);
    const h = f.hands[0];
    const bx = h.x - 2.5, by = h.y - 6.5;
    return (
      g("p1", floor()) +
      g("p2", f.svg) +
      g("p2 s", lit(poly(bx + 3.4, by - 7.4, bx + 12.2, by - 6.2, bx + 11.4, by + 3, bx + 2.6, by + 1.8)) + ruled(`M${n(bx + 5.6)} ${n(by - 3.6)}L${n(bx + 9.8)} ${n(by - 3)}`, 1.3) + rect(P.mid, bx, by, 16, 12.5, 0.8) + fill(P.ink, `M${n(bx)} ${n(by)}h16l-2 3.2h-12Z`))
    );
  },

  // At the board: the org chart, with the turmeric node at the top.
  lead() {
    const f = who({ lean: -3, arms: [[128, 6], [-10, 16]], legs: [[6, 0], [-6, 0]] }, 11, 42);
    return (
      g("p1", floor() + rect(P.ink, 18.5, 5.5, 25, 23, 1.5) + rect(P.white, 21, 8, 20, 18, 0.6) + strip(P.ink, 1.8, "M23.5 28.5L21.5 41M38.5 28.5L40.5 41")) +
      g("p2", ruled("M31 14.5V18.5M25.5 22.5V18.5H36.5V22.5", 1.4) + circle(P.mid, 25.5, 23, 2.5) + circle(P.mid, 36.5, 23, 2.5) + f.svg) +
      g("p2 s", litCircle(31, 12.8, 3.5))
    );
  },

  /* ── Kinds of tool ──────────────────────────────────────── */

  // Keys to press, and the turmeric equals.
  calculator() {
    const keys = [0, 1, 2]
      .flatMap((r) => [0, 1, 2].map((c) => rect(P.white, 15.2 + c * 5.4, 19.4 + r * 5.4, 4, 4, 0.8)))
      .join("");
    return (
      g("p1", tilt(-5, 24, 24, rect(P.ink, 11.5, 6, 25, 36, 3))) +
      g("p2", tilt(-5, 24, 24, rect(P.white, 15.2, 9.5, 17.6, 6.8, 1) + strip(P.mid, 1.6, "M24.5 13H29.6") + keys + rect(P.pale, 15.2, 35.6, 9.4, 4, 0.8))) +
      g("p2 s", tilt(-5, 24, 24, lit("M31.4 19.4h4.2v20.2h-4.2Z")))
    );
  },

  // The letter coming out of its envelope, under a turmeric seal.
  letter() {
    return (
      g("p1", rect(P.mid, 6, 20, 36, 22, 1.5)) +
      g("p2", tilt(-4, 24, 20, rect(P.white, 10.5, 7, 27, 26, 0.6) + ruled("M15 13.5H28M15 18H33M15 22.5H31"))) +
      g("p2 s", fill(P.ink, "M6 21.5L24 33.5L42 21.5V40.5C42 41.3 41.3 42 40.5 42H7.5C6.7 42 6 41.3 6 40.5Z") + litCircle(24, 33, 4.4))
    );
  },

  // Fields to fill, and the turmeric pencil to fill them.
  form() {
    const pencil =
      lit("M6 -2.3H25V2.3H6Z") + fill(P.lite, "M6 -2.3L1 0L6 2.3Z") + fill(P.deep, "M2.9 -.9L1 0L2.9 .9Z") + fill(P.mid, "M25 -2.3H28.6V2.3H25Z");
    return (
      g("p1", fill(P.mid, poly(7.5, 11.3, 27.3, 8.9, 30.6, 36.5, 10.8, 38.9))) +
      g("p2", tilt(2, 23, 21, sheet(12, 6, 23, 31) + ruled("M16 12.5H23", 1.6) + rect(P.pale, 16, 15, 15, 4.6, 1) + ruled("M16 23.5H21.5", 1.6) + rect(P.pale, 16, 26, 15, 4.6, 1))) +
      g("p2 s", g("", pencil, `transform="translate(21.5 36.5) rotate(-38)"`))
    );
  },

  // The rules, kept under a turmeric shield folded down its middle.
  policy() {
    return (
      g("p1", fill(P.ink, poly(7.6, 9.4, 28.4, 6.9, 31.6, 34.6, 10.8, 37.1))) +
      g("p2", tilt(-2, 23, 20, sheet(12, 5, 22, 30) + ruled("M15.5 12H25M15.5 16.5H30M15.5 21H28M15.5 25.5H23"))) +
      g("p2 s", fill(P.haldi, "M31 21.5L40 24.5V31.5C40 36.6 36.2 40.2 31 42C25.8 40.2 22 36.6 22 31.5V24.5Z") + fill(P.lite, "M31 21.5V42C25.8 40.2 22 36.6 22 31.5V24.5Z"))
    );
  },

  // A clipboard of things to do, the first one ticked in turmeric.
  checklist() {
    const row = (y: number) => rect(P.pale, 15.5, y, 4.6, 4.6, 1) + ruled(`M23.5 ${n(y + 2.3)}H31`);
    return (
      g("p1", tilt(3, 24, 25, rect(P.ink, 9.5, 7.5, 29, 35, 2.2))) +
      g("p2", tilt(3, 24, 25, rect(P.white, 12.5, 11.5, 23, 28, 0.6) + rect(P.mid, 18, 5.5, 12, 5, 1.6) + ruled("M23.5 19.3H33") + row(24) + row(31))) +
      g("p2 s", tilt(3, 24, 25, lit("M15 16.5h5.6v5.6H15Z") + strip(P.white, 1.3, "M16.4 19.4L17.6 20.6L19.4 18.3")))
    );
  },

  // Asked how it's going: a scale of knots on a thread, one picked.
  survey() {
    const knots = [11.5, 17, 22.5, 33.5].map((x) => circle(P.mid, x, 27, 2.3)).join("");
    return (
      g("p1", rect(P.ink, 16.5, 4.5, 28, 19, 4.2) + fill(P.ink, "M37 22.5L42.5 28.5L32.5 22.5Z")) +
      g("p2", rect(P.white, 3.5, 12.5, 37, 24, 5) + fill(P.white, "M10 35.5L7.5 44L17.5 35.5Z") + ruled("M10.5 19.5H25", 1.6) + strip(P.pale, 1.6, "M11.5 27H33.5") + knots) +
      g("p2 s", litCircle(28, 27, 3.9))
    );
  },

  // The calendar page, the date that matters ringed in turmeric.
  plan() {
    const cells = [0, 1, 2]
      .flatMap((r) => [0, 1, 2, 3].map((c) => (r === 1 && c === 2 ? "" : rect(P.pale, 12.4 + c * 6, 21 + r * 5.6, 4, 3.6, 0.6))))
      .join("");
    return (
      g("p1", fill(P.mid, poly(9.6, 11.8, 37.7, 9.6, 39.8, 39.8, 11.7, 42))) +
      g("p2", tilt(-3, 23.5, 24, rect(P.white, 8.5, 9, 30, 30, 1.2) + fill(P.ink, "M8.5 10.2C8.5 9.5 9 9 9.7 9H37.3C38 9 38.5 9.5 38.5 10.2V16.5H8.5Z") + strip(P.deep, 2, "M15.5 6V12M31.5 6V12") + cells)) +
      g("p2 s", tilt(-3, 23.5, 24, litCircle(26.4, 28.4, 3.9)))
    );
  },

  // A tool on screen: the laptop with its chart, one bar in turmeric.
  app() {
    return (
      g("p1", rect(P.ink, 7, 6.5, 34, 26, 2.2) + fill(P.mid, "M2.5 33.5H45.5V35.2C45.5 36.7 44.4 37.8 42.9 37.8H5.1C3.6 37.8 2.5 36.7 2.5 35.2Z") + rect(P.pale, 19.5, 33.5, 9, 1.7, 0.8)) +
      g("p2", rect(P.white, 10, 9.5, 28, 20, 0.8) + strip(P.mid, 3.2, "M14.8 26V21.5M20.2 26V18M31.4 26V20.5")) +
      g("p2 s", lit("M24.1 12.4h3.6v15.2h-3.6Z"))
    );
  },

  /* ── Who it's for ───────────────────────────────────────── */

  // The HR person with the turmeric clipboard, between two colleagues.
  hr() {
    const a = who({ arms: [[12, 10], [-8, 8]], legs: [[5, 2], [-4, 0]] }, 9, 42, { paper: "mid" });
    const b = who({ arms: [[12, 10], [-8, 8]], legs: [[5, 2], [-4, 0]] }, 39, 42, { paper: "mid", face: -1 });
    const c = who({ arms: [[38, 74], [28, 86]], legs: [[5, 2], [-5, 0]] }, 23, 42);
    const h = c.hands[0];
    return (
      g("p1", floor() + a.svg + b.svg) +
      g("p2", c.svg) +
      g("p2 s", lit(`M${n(h.x - 2.6)} ${n(h.y - 8)}h9.4v12.4h-9.4Z`) + rect(P.white, h.x - 0.8, h.y - 5.6, 5.8, 7.6, 0.4) + rect(P.deep, h.x + 0.4, h.y - 9.3, 3.4, 2.2, 0.6))
    );
  },

  // A tiny shop under a turmeric awning.
  founders() {
    const stripe = (i: number) => `M${n(6.6 + i * 4.2)} 14.5h4.2v7.1a2.1 2.1 0 0 1-4.2 0Z`;
    const awning = (odd: number) => [0, 1, 2, 3].map((k) => stripe(k * 2 + odd)).join("");
    return (
      g("p1", rect(P.mid, 9, 15, 30, 27) + rect(P.ink, 7, 8.5, 34, 6.5, 1.2) + rect(P.white, 12.5, 25.5, 10, 8.5, 0.6) + rect(P.white, 26, 25.5, 8.5, 16.5, 0.6) + circle(P.ink, 32.3, 34.6, 0.9)) +
      g("p2 s", fill(P.haldi, awning(0)) + fill(P.lite, awning(1)))
    );
  },

  // Payday at the desk: sitting down to read the payslip.
  employees() {
    const f = who({ lean: 8, nod: 26, arms: [[50, 84], [42, 94]], legs: [[86, 84], [80, 80]] }, 17.5, 42);
    const h = f.hands[0];
    const s = f.hip.y + 1.6;
    return (
      g("p1", floor() + strip(P.mid, 2.4, `M11.5 ${n(s - 13)}V42M11.5 ${n(s)}H22.5V42`)) +
      g("p2", f.svg) +
      g("p2 s", lit(poly(h.x - 1.6, h.y - 8.2, h.x + 9.6, h.y - 10, h.x + 11.4, h.y + 4.6, h.x + 0.2, h.y + 6.4)) + ruled(`M${n(h.x + 2)} ${n(h.y - 4.2)}L${n(h.x + 7.6)} ${n(h.y - 5.1)}M${n(h.x + 2.6)} ${n(h.y - 0.4)}L${n(h.x + 6.6)} ${n(h.y - 1)}`, 1.3))
    );
  },

  // Cap on, CV up.
  students() {
    const f = who({ lean: -2, arms: [[100, 34], [-12, 14]], legs: [[7, 3], [-7, 0]] }, 15.5, 42);
    const h = f.hands[0];
    const t = f.head;
    return (
      g("p1", floor()) +
      g("p2", f.svg + fill(P.deep, `M${n(t.x - 7.4)} ${n(t.y - 3.4)}L${n(t.x + 0.4)} ${n(t.y - 6.8)}L${n(t.x + 7.8)} ${n(t.y - 3.6)}L${n(t.x)} ${n(t.y - 0.2)}Z`) + rect(P.deep, t.x - 3.1, t.y - 3.4, 6.2, 3.2, 0.8) + strip(P.lite, 1.1, `M${n(t.x + 6)} ${n(t.y - 3.8)}V${n(t.y + 2.8)}`)) +
      g("p2 s", lit(poly(h.x - 1, h.y - 13, h.x + 10.4, h.y - 14, h.x + 11.4, h.y + 1, h.x, h.y + 2)) + ruled(`M${n(h.x + 2.2)} ${n(h.y - 9.2)}H${n(h.x + 7.8)}M${n(h.x + 2.4)} ${n(h.y - 5.4)}H${n(h.x + 8.2)}M${n(h.x + 2.6)} ${n(h.y - 1.6)}H${n(h.x + 6.4)}`, 1.3))
    );
  },

  /* ── Handbook emblems ───────────────────────────────────── */

  // Scales: the law weighs both sides.
  "labour-law"() {
    const pan = (x: number) => `M${n(x - 6.5)} 28.5H${n(x + 6.5)}C${n(x + 6.5)} 32 ${n(x + 3.6)} 34 ${n(x)} 34C${n(x - 3.6)} 34 ${n(x - 6.5)} 32 ${n(x - 6.5)} 28.5Z`;
    return (
      g("p1", fill(P.ink, "M15 42.5H33L30.5 38.5H17.5Z") + strip(P.ink, 2.6, "M24 38.5V12") + strip(P.deep, 0.8, "M11 14.5L5.5 28.5M11 14.5L16.5 28.5M37 14.5L31.5 28.5M37 14.5L42.5 28.5")) +
      g("p2", fill(P.mid, pan(11)) + fill(P.mid, pan(37)) + strip(P.ink, 2.4, "M9 14.5H39")) +
      g("p2 s", litCircle(24, 11.5, 3.6))
    );
  },

  // Tax off every rupee: a stack of coins and the turmeric one on top.
  tds() {
    const coin = (y: number, x: number, c: string) => rect(c, x, y, 21, 4.6, 2.3);
    return (
      g("p1", coin(37.5, 6.5, P.ink) + coin(32.9, 7.4, P.mid) + coin(28.3, 6, P.ink) + coin(23.7, 7, P.mid)) +
      g("p2 s", litCircle(30.5, 25.5, 11) + circle(P.lite, 30.5, 25.5, 8.4) + circle(P.haldi, 30.8, 25.8, 8.2) + strip(P.deep, 1.7, rupee(27, 20, 11.2)))
    );
  },

  // Finding the right person: a magnifier over one face in the crowd.
  recruitment() {
    const bust = (x: number, y: number, s: number) => `M${n(x - 6.2 * s)} ${n(y + 7 * s)}C${n(x - 6.2 * s)} ${n(y + 2.6 * s)} ${n(x - 3.2 * s)} ${n(y + 0.8 * s)} ${n(x)} ${n(y + 0.8 * s)}C${n(x + 3.2 * s)} ${n(y + 0.8 * s)} ${n(x + 6.2 * s)} ${n(y + 2.6 * s)} ${n(x + 6.2 * s)} ${n(y + 7 * s)}Z`;
    return (
      g("p1", circle(P.mid, 37, 24.5, 3) + fill(P.mid, bust(37, 28.5, 0.8)) + circle(P.mid, 9, 31.5, 3) + fill(P.mid, bust(9, 35.5, 0.8))) +
      g("p2", strip(P.ink, 5, "M29.5 28.5L39.5 39.5") + circle(P.ink, 21, 20, 13) + circle(P.white, 21, 20, 10)) +
      g("p2 s", litCircle(21, 16.5, 3.6) + fill(P.haldi, bust(21, 20.8, 1)))
    );
  },

  // The climb to the top of the profession: a ladder up to the turmeric flag.
  "hr-professional"() {
    return (
      g("p1", floor(7, 37)) +
      g("p2", strip(P.mid, 2, "M13.7 36.8H23.9M15.3 30.6H25.5M16.9 24.4H27.1M18.5 18.2H28.7M20.1 12H30.3") + strip(P.ink, 2.6, "M11 42L20.5 7M21.5 42L31 7")) +
      g("p2 s", strip(P.deep, 1.3, "M31 7.5L32.4 2.5") + lit("M32.6 2.9L41.4 5.6L31.4 9.8Z"))
    );
  },

  /* ── Other library items ────────────────────────────────── */

  // A job description: the role card with a turmeric person on it.
  jd() {
    return (
      g("p1", fill(P.ink, poly(9.4, 10, 31.3, 7.6, 34.2, 35, 12.3, 37.4))) +
      g("p2", tilt(-2, 24, 21, rect(P.white, 13, 6, 23, 31, 0.6) + ruled("M16.5 25.5H32.5M16.5 30H28") + ruled("M26 12H32.5M26 16.5H31", 1.6))) +
      g("p2 s", tilt(-2, 24, 21, circle(P.lite, 19.6, 11.6, 3.2) + circle(P.haldi, 20.3, 12.3, 3.2) + lit("M14.8 21.6C14.8 18.6 17.3 16.6 20.3 16.6C23.3 16.6 25.8 18.6 25.8 21.6Z")))
    );
  },

  // The glossary: an open word book with a turmeric ribbon.
  glossary() {
    return (
      g("p1", fill(P.ink, "M24 15.5C19 12.5 11.5 11.8 4.5 13V39.5C11.5 38.5 19 39.4 24 42C29 39.4 36.5 38.5 43.5 39.5V13C36.5 11.8 29 12.5 24 15.5Z")) +
      g("p2", fill(P.white, "M23.4 13.2C18.6 10 12.5 9.3 7 10.2V36.2C12.5 35.4 18.6 36.3 23.4 39.2Z") + fill(P.white, "M24.6 13.2C29.4 10 35.5 9.3 41 10.2V36.2C35.5 35.4 29.4 36.3 24.6 39.2Z") + ruled("M10.5 17C13.8 16.7 16.8 17.2 19.8 18.6M10.5 22C13.8 21.7 16.8 22.2 19.8 23.6M10.5 27C13.2 26.8 15.6 27.1 17.6 27.9M28.2 18.6C31.2 17.2 34.2 16.7 37.5 17M28.2 23.6C31.2 22.2 34.2 21.7 37.5 22", 1.5)) +
      g("p2 s", lit("M30.5 12.2H35V44.5L32.75 41.8L30.5 44.5Z"))
    );
  }
};

export const ICON_NAMES = Object.keys(ICONS);

/** The icon's inner SVG. Unknown names fall back to a plain sheet, so a typo shows as paper, not a hole. */
export function iconSvg(name: string): string {
  const draw = ICONS[name];
  if (draw) return draw();
  return g("p1", fill(P.mid, poly(9.4, 10, 31.3, 7.6, 34.2, 35, 12.3, 37.4))) + g("p2", sheet(13, 6, 23, 31) + ruled("M16.5 14H27M16.5 19H31M16.5 24H29"));
}
