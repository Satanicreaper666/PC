/**
 * The 14 scenes (docs/ART-DIRECTION.md, "Scenes"): one HR moment each, as a
 * paper diorama on a 320 × 180 board.
 *
 *   wall    pale indigo paper, the back of the box
 *   cloth   a strip of plain weave along the bottom: the people stand on cloth
 *   p1      things glued flat to the wall (a board, a door frame, a calendar)
 *   p2      figures and furniture, lifted off the wall
 *   p3      the turmeric subject, floating highest, so its shadow is the deepest
 * At most four shadowed groups each. Every person is the one `figure`
 * primitive at one scale, posed by joint angles or by sending a hand or foot
 * to a point, so the people in every scene are one family.
 */
import { P, g, fill, strip, circle, rect, poly, rupee, n, lit, litCircle, sheet, tilt } from "./paper.ts";
import { figure, POSES, type Pose, type FigureOptions, type Pt } from "./figure.ts";

export const SCENE_W = 320;
export const SCENE_H = 180;
/** Top of the woven floor. */
const FY = 150;
/** Feet press a hair into the cloth so nobody floats. */
const GROUND = FY + 1.2;
/** One limb-thickness for every person in every scene. */
const U = 6;

const person = (pose: Pose, x: number, o: Partial<FigureOptions> = {}) => figure({ x, ground: GROUND, u: U, pose, ...o });

const wall = () => rect(P.pale, 0, 0, SCENE_W, SCENE_H, 4);

/**
 * The cloth underfoot: white handloom, woven the way the logo is. Weft rows
 * go down first, the warp over them as one dashed stroke, then every other
 * crossing is laid back over the warp; each layer is edged with a hair of the
 * wall's pale paper, which is what shows the over and under. Five elements at
 * any width. The warp ends stand a little proud of the first and last rows,
 * so the cloth reads as a cut piece laid down, not a hemmed edge, and a strip
 * of wall closes the picture at the bottom on any page colour.
 */
const cloth = () => {
  const y = FY;
  const cell = 10;
  const t = 7.4;
  const pitch = 9;
  const edge = 1.1;
  const off = (cell - t) / 2;
  const rows = [0, 1, 2].map((r) => y + 4 + r * pitch);
  const warpTop = y - 2;
  const warpBottom = rows[2] + t / 2 + 2.2;
  const warpMid = (warpTop + warpBottom) / 2;
  const warpH = warpBottom - warpTop;
  const float = t + 2 * edge + 1.2;
  const from = (r: number) => (r % 2 ? cell : 0) + off - edge - 0.6;
  const d = (dx: number) => rows.map((cy, r) => `M${n(from(r) + dx)} ${n(cy)}H320`).join("");
  const dash = (a: number, per: number) => `stroke-dasharray="${n(a)} ${n(per - a)}"`;
  return (
    `<g fill="none" stroke-linecap="butt">` +
    `<path stroke="${P.white}" stroke-width="${t}" d="${rows.map((cy) => `M0 ${n(cy)}H320`).join("")}"/>` +
    `<path stroke="${P.pale}" stroke-width="${n(warpH)}" ${dash(t + 2 * edge, cell)} d="M${n(off - edge)} ${n(warpMid)}H320"/>` +
    `<path stroke="${P.white}" stroke-width="${n(warpH)}" ${dash(t, cell)} d="M${n(off)} ${n(warpMid)}H320"/>` +
    `<path stroke="${P.pale}" stroke-width="${n(t + 2 * edge)}" ${dash(float + 2 * edge, 2 * cell)} d="${d(-edge)}"/>` +
    `<path stroke="${P.white}" stroke-width="${t}" ${dash(float, 2 * cell)} d="${d(0)}"/>` +
    `</g>`
  );
};

/** A chair seen side on, for someone sitting at `hip` and facing `f`. */
const chair = (hip: Pt, f: 1 | -1, color: string = P.mid) => {
  const seat = hip.y + U * 0.5 + 2;
  const back = hip.x - f * 8;
  const front = hip.x + f * 9;
  return strip(color, 3.6, `M${n(back)} ${n(seat - 30)}V${n(GROUND)}M${n(back)} ${n(seat)}H${n(front)}V${n(GROUND)}`);
};

/** A table: a slab on two legs. */
const table = (x1: number, x2: number, top: number, color: string = P.mid) =>
  rect(color, x1, top, x2 - x1, 6, 1.2) + strip(color, 4.4, `M${n(x1 + 9)} ${n(top + 5)}V${n(GROUND)}M${n(x2 - 9)} ${n(top + 5)}V${n(GROUND)}`);

/** A doorway in the wall: mid frame, white light beyond. */
const doorway = (x: number, w: number, top: number) =>
  fill(P.mid, `M${n(x)} ${FY}V${n(top)}H${n(x + w)}V${FY}H${n(x + w - 7)}V${n(top + 7)}H${n(x + 7)}V${FY}Z`) + rect(P.white, x + 7, top + 7, w - 14, FY - top - 7);

/** Printed rules on a sheet. */
const ruled = (d: string, w = 2.4) => strip(P.mid, w, d);

export const SCENES: Record<string, () => string> = {
  /* ── Stages ─────────────────────────────────────────────── */

  // Two people across the interview table; the interviewer reads the turmeric CV.
  recruit() {
    const cand = person({ lean: 5, arms: [[0, 0], [0, 0]], legs: [[88, 86], [83, 84]] }, 92, { paper: "white", reach: { hands: [{ x: 125, y: 107.5 }, { x: 119, y: 108.5 }] } });
    const boss = person({ lean: 2, nod: 16, arms: [[0, 0], [0, 0]], legs: [[88, 86], [83, 84]] }, 230, { face: -1, reach: { hands: [{ x: 198, y: 98 }, { x: 204, y: 92 }] } });
    return (
      wall() +
      cloth() +
      g("p1", strip(P.deep, 1.4, "M160 0V31") + fill(P.mid, "M148 30H172L180 46H140Z") + fill(P.white, "M153 46A7 7 0 0 0 167 46Z") + circle(P.mid, 268, 46, 15.5) + circle(P.white, 268, 46, 12.5) + strip(P.deep, 2.2, "M268 38.5V46L273.5 49.5")) +
      g("p2", chair(cand.hip, 1) + chair(boss.hip, -1) + cand.svg + boss.svg) +
      g("p2", table(114, 206, 110)) +
      g("p3", tilt(-9, 197, 90, lit("M184 74H210V106H184Z") + ruled("M189 82H202M189 88H205M189 94H199", 2)))
    );
  },

  // Day one: through the door, and the turmeric badge held out in welcome.
  onboard() {
    const nu = person(POSES.walk, 112);
    const host = person({ arms: [[0, 0], [-8, 12]], legs: [[5, 2], [-5, 0]] }, 214, { face: -1, paper: "mid", reach: { hands: [{ x: 178, y: 96 }] } });
    const h = host.hands[0];
    const flags = [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const x = 178 + i * 21;
        const y = 20 + Math.sin((i + 0.5) / 6 * Math.PI) * 9;
        return fill(i % 2 ? P.mid : P.white, poly(x - 7, y - 1, x + 7, y + 1, x - 0.6, y + 13));
      })
      .join("");
    return (
      wall() +
      cloth() +
      g("p1", doorway(60, 76, 40) + strip(P.deep, 1.2, "M166 14Q228 42 300 20") + flags) +
      g("p2", fill(P.ink, "M67 47L46 55V157L67 150Z") + nu.svg + host.svg) +
      g("p3", strip(P.deep, 1.2, `M${n(h.x)} ${n(h.y)}L${n(h.x - 6)} ${n(h.y + 13)}M${n(h.x)} ${n(h.y)}L${n(h.x + 6)} ${n(h.y + 13)}`) + lit(`M${n(h.x - 10)} ${n(h.y + 12)}h20v25h-20Z`) + rect(P.white, h.x - 6, h.y + 16, 12, 9, 1) + ruled(`M${n(h.x - 5)} ${n(h.y + 29.5)}H${n(h.x + 5)}`, 2))
    );
  },

  // Climbing the steps towards the turmeric flag.
  grow() {
    const f = person({ lean: 12, arms: [[-34, 26], [42, 44]], legs: [[0, 0], [0, 0]] }, 118, { y: 92, reach: { feet: [{ x: 134, y: 103.2 }, { x: 104, y: 125.2 }] } });
    return (
      wall() +
      cloth() +
      g("p2", fill(P.mid, "M66 150V128H112V106H158V84H204V62H250V150Z") + fill(P.white, "M66 128h46v3H66ZM112 106h46v3h-46ZM158 84h46v3h-46ZM204 62h46v3h-46Z") + f.svg + strip(P.deep, 2.4, "M236 62V18")) +
      g("p3", lit("M237.5 18.5C246 15 254 23.5 266 18.5V38C254 43 246 34.5 237.5 38Z"))
    );
  },

  // Payday: the payslip handed over, a rupee on top.
  pay() {
    const giver = person({ arms: [[0, 0], [-10, 14]], legs: [[5, 2], [-5, 0]] }, 120, { paper: "mid", reach: { hands: [{ x: 150, y: 104 }] } });
    const taker = person({ arms: [[0, 0], [150, 34]], legs: [[5, 2], [-5, 0]] }, 206, { face: -1, reach: { hands: [{ x: 176, y: 100 }] } });
    const cells = [0, 1, 2]
      .flatMap((r) => [0, 1, 2, 3].map((c) => rect(P.pale, 45 + c * 9.5, 44 + r * 8.5, 6.5, 5.5, 0.8)))
      .join("");
    return (
      wall() +
      cloth() +
      g("p1", rect(P.white, 40, 26, 44, 52, 1.5) + fill(P.ink, "M40 27.5C40 26.7 40.7 26 41.5 26H82.5C83.3 26 84 26.7 84 27.5V38H40Z") + strip(P.deep, 2.4, "M51 21V31M73 21V31") + cells + `<circle fill="none" stroke="${P.deep}" stroke-width="1.6" cx="77.3" cy="63.7" r="5.4"/>`) +
      g("p2", giver.svg + taker.svg) +
      g("p3", tilt(5, 163, 98, lit("M150 80H176V116H150Z") + ruled("M154.5 88H171.5M154.5 95H163M166 95H171.5M154.5 101H163M166 101H171.5", 2)) + circle(P.lite, 176, 113, 9.5) + strip(P.deep, 1.8, rupee(172.4, 107.2, 11.6)))
    );
  },

  // Leaving with the box, waving back; the turmeric relieving letter rides on top.
  exit() {
    const leaver = person({ lean: 3, arms: [[0, 0], [150, 62]], legs: [[22, 8], [-16, 22]] }, 172, { reach: { hands: [{ x: 196, y: 112 }] } });
    const friend = person({ arms: [[128, 52], [-8, 12]], legs: [[5, 2], [-5, 0]] }, 76, { paper: "white" });
    return (
      wall() +
      cloth() +
      g("p1", doorway(236, 62, 40)) +
      g("p2", friend.svg + leaver.svg + fill(P.deep, "M190 100H224L221 104H193Z")) +
      g("p3", tilt(8, 210, 92, lit("M200 76H220V104H200Z") + ruled("M204 84H215M204 90H213", 2))) +
      g("p2", fill(P.ink, "M197 89C195 81 199 75 205 73C206 80 203 86 197 89Z") + rect(P.mid, 188, 100, 38, 28, 1.5) + fill(P.ink, "M188 100H226L222 106H192Z"))
    );
  },

  // At the board: the org chart, and the turmeric node it all hangs from.
  lead() {
    const lead = person({ lean: -2, arms: [[0, 0], [-10, 14]], legs: [[6, 2], [-6, 0]] }, 128, { reach: { hands: [{ x: 156, y: 70 }] } });
    const seen = person({ lean: -4, arms: [[34, 66], [26, 74]], legs: [[88, 86], [83, 84]] }, 46, { paper: "white" });
    const h = lead.hands[0];
    return (
      wall() +
      cloth() +
      g("p1", rect(P.mid, 152, 20, 138, 88, 2) + rect(P.white, 157, 25, 128, 78, 1) + strip(P.mid, 4.4, "M168 106L163 150M274 106L279 150") + strip(P.ink, 2.6, "M221 50V61M183 61H259M183 61V70M221 61V70M259 61V70M183 84V90M171 90H195M171 90V92M195 90V92") + circle(P.ink, 183, 77, 7.5) + circle(P.ink, 221, 77, 7.5) + circle(P.ink, 259, 77, 7.5) + circle(P.mid, 171, 96, 5) + circle(P.mid, 195, 96, 5)) +
      g("p2", strip(P.mid, 3.6, `M${n(seen.hip.x - 9)} ${n(seen.hip.y + 5)}H${n(seen.hip.x + 9)}M${n(seen.hip.x - 6)} ${n(seen.hip.y + 5)}L${n(seen.hip.x - 8)} ${GROUND}M${n(seen.hip.x + 6)} ${n(seen.hip.y + 5)}L${n(seen.hip.x + 8)} ${GROUND}`) + seen.svg + lead.svg + strip(P.deep, 2, `M${n(h.x - 2)} ${n(h.y + 1)}L${n(206)} ${n(46)}`)) +
      g("p3", litCircle(221, 41, 9.5))
    );
  },

  /* ── Who it's for ───────────────────────────────────────── */

  // HR in the middle with the turmeric clipboard, listening to one, the other waiting.
  hr() {
    const left = person({ arms: [[64, 46], [-6, 12]], legs: [[6, 2], [-6, 0]] }, 84, { paper: "mid" });
    const mid = person({ lean: 3, nod: 12, arms: [[0, 0], [0, 0]], legs: [[5, 2], [-5, 0]] }, 164, { face: -1, reach: { hands: [{ x: 146, y: 104 }, { x: 152, y: 98 }] } });
    const right = person({ arms: [[-22, 40], [-16, 46]], legs: [[5, 2], [-5, 0]] }, 238, { face: -1, paper: "white" });
    const pin = (x: number, y: number, a: number, w: number) => tilt(a, x + w / 2, y + 8, rect(P.white, x, y, w, 17, 0.6) + ruled(`M${n(x + 3)} ${n(y + 6)}H${n(x + w - 3)}M${n(x + 3)} ${n(y + 11)}H${n(x + w - 6)}`, 1.6)) + circle(P.deep, x + w / 2, y + 2.4, 1.7);
    return (
      wall() +
      cloth() +
      g("p1", rect(P.mid, 122, 22, 78, 46, 2) + pin(129, 29, -5, 18) + pin(153, 33, 3, 16) + pin(175, 28, -2, 18)) +
      g("p2", left.svg + mid.svg + right.svg) +
      g("p3", tilt(-8, 146, 96, lit("M134 80H158V112H134Z") + rect(P.white, 137.5, 85.5, 17, 23, 0.6) + rect(P.deep, 140.5, 77, 11, 5, 1.6) + ruled("M141 92H151M141 97.5H151M141 103H147", 1.8)))
    );
  },

  // A founder watering a turmeric plant outside their tiny shop.
  founders() {
    const f = person({ lean: 6, arms: [[0, 0], [-6, 16]], legs: [[6, 2], [-6, 0]] }, 98, { reach: { hands: [{ x: 126, y: 96 }] } });
    const h = f.hands[0];
    const stripe = (i: number) => `M${n(194 + i * 11)} 64h11v12a5.5 5.5 0 0 1-11 0Z`;
    const awning = (odd: number) => [0, 1, 2, 3, 4].map((k) => stripe(k * 2 + odd)).filter((_, k) => k * 2 + odd < 10).join("");
    const leaf = (d: string) => lit(d, 1);
    return (
      wall() +
      cloth() +
      g("p1", rect(P.mid, 198, 60, 102, 90) + rect(P.ink, 192, 46, 114, 15, 1.5) + rect(P.white, 210, 94, 36, 30, 1) + strip(P.mid, 2.4, "M228 94V124M210 109H246") + rect(P.white, 258, 90, 30, 60, 1) + circle(P.ink, 282, 122, 2.2) + fill(P.white, awning(0)) + fill(P.pale, awning(1))) +
      g("p2", f.svg + tilt(24, h.x + 8, h.y, strip(P.deep, 2.6, `M${n(h.x + 1)} ${n(h.y - 6)}C${n(h.x - 2)} ${n(h.y - 15)} ${n(h.x + 12)} ${n(h.y - 15)} ${n(h.x + 9)} ${n(h.y - 6)}`) + rect(P.mid, h.x, h.y - 6, 17, 14, 2) + strip(P.mid, 3, `M${n(h.x + 16)} ${n(h.y - 3)}L${n(h.x + 27)} ${n(h.y - 9)}`)) + circle(P.mid, 152.5, 105, 2) + circle(P.mid, 155.5, 112, 2) + circle(P.mid, 152, 118.5, 2) + fill(P.white, "M144 132H172L168 150H148Z")) +
      g("p3", strip(P.deep, 1.8, "M158 132V114") + leaf("M158 124C148 122 142 115 141 106C151 107 157 114 158 124Z") + leaf("M158 118C166 114 172 107 172 98C163 100 158 108 158 118Z") + leaf("M158 115C155 108 155 100 159 93C163 99 162 108 158 115Z"))
    );
  },

  // Sitting down to read the turmeric payslip.
  employees() {
    const f = person({ lean: -6, nod: 18, arms: [[0, 0], [0, 0]], legs: [[86, 84], [80, 82]] }, 166, { face: -1, reach: { hands: [{ x: 136, y: 98 }, { x: 140, y: 92 }] } });
    return (
      wall() +
      cloth() +
      g("p1", rect(P.white, 36, 26, 54, 46, 1.5) + strip(P.mid, 3, "M63 26V72M36 49H90") + rect(P.mid, 30, 70, 66, 5, 1.5)) +
      g("p2", table(206, 300, 108) + rect(P.ink, 236, 80, 42, 27, 2) + rect(P.white, 239.5, 83.5, 35, 20, 0.8) + rect(P.mid, 230, 104, 54, 4, 1.5) + rect(P.white, 214, 94, 11, 14, 2) + strip(P.white, 2.4, "M225 98.5C230 98.5 230 104 225 104") + chair(f.hip, -1) + f.svg) +
      g("p3", tilt(-10, 134, 94, lit("M122 76H148V112H122Z") + ruled("M126.5 84H142.5M126.5 91H136M138.5 91H142.5M126.5 97H136M138.5 97H142.5", 2)))
    );
  },

  // Cap on, CV up, the road ahead.
  students() {
    const f = person({ lean: -2, arms: [[0, 0], [-14, 18]], legs: [[7, 3], [-7, 0]] }, 150, { reach: { hands: [{ x: 178, y: 72 }] } });
    const t = f.head;
    const h = f.hands[0];
    return (
      wall() +
      cloth() +
      g("p1", strip(P.deep, 4, "M262 150V56") + fill(P.white, "M238 58H284L293 67L284 76H238Z") + fill(P.mid, "M286 84H240L231 93L240 102H286Z")) +
      g("p2", rect(P.ink, 52, 136, 60, 14, 2) + rect(P.white, 57, 123, 52, 13, 2) + rect(P.mid, 54, 111, 56, 12, 2) + strip(P.pale, 1.6, "M58 143H106M60 117H104") + strip(P.mid, 1.6, "M62 129.5H104") + f.svg + fill(P.deep, `M${n(t.x - 16)} ${n(t.y - 7)}L${n(t.x + 1)} ${n(t.y - 14)}L${n(t.x + 17)} ${n(t.y - 7.5)}L${n(t.x)} ${n(t.y - 1)}Z`) + rect(P.deep, t.x - 7, t.y - 7.5, 14, 6.5, 2) + strip(P.lite, 2, `M${n(t.x + 14)} ${n(t.y - 8)}V${n(t.y + 6)}`)) +
      g("p3", tilt(6, h.x + 12, h.y - 14, lit(`M${n(h.x - 2)} ${n(h.y - 32)}H${n(h.x + 24)}V${n(h.y + 2)}H${n(h.x - 2)}Z`) + ruled(`M${n(h.x + 3)} ${n(h.y - 24)}H${n(h.x + 19)}M${n(h.x + 3)} ${n(h.y - 17)}H${n(h.x + 17)}M${n(h.x + 3)} ${n(h.y - 10)}H${n(h.x + 13)}`, 2)))
    );
  },

  /* ── Empty states ───────────────────────────────────────── */

  // Page not found: a magnifier over a sheet with nothing on it.
  "not-found"() {
    const f = person({ lean: 12, nod: 10, arms: [[0, 0], [-10, 20]], legs: [[8, 2], [-8, 0]] }, 104, { reach: { hands: [{ x: 146, y: 96 }] } });
    const h = f.hands[0];
    return (
      wall() +
      cloth() +
      g("p2", sheet(156, 24, 98, 112, 20) + circle(P.deep, 205, 30, 2.6) + f.svg + strip(P.deep, 6, `M${n(h.x)} ${n(h.y)}L${n(h.x + 15)} ${n(h.y - 15)}`)) +
      g("p3", `<circle fill="${P.pale}" fill-opacity=".55" stroke="${P.lite}" stroke-width="7" cx="${n(h.x + 31.2)}" cy="${n(h.y - 31.2)}" r="20"/>` + `<circle fill="none" stroke="${P.haldi}" stroke-width="7" cx="${n(h.x + 32)}" cy="${n(h.y - 30.4)}" r="20"/>`)
    );
  },

  // No results: looking into an empty box.
  "no-results"() {
    const f = person({ lean: 34, nod: 22, arms: [[0, 0], [0, 0]], legs: [[10, 4], [-12, 0]] }, 118, { reach: { hands: [{ x: 151, y: 104 }, { x: 160, y: 101 }] } });
    return (
      wall() +
      cloth() +
      g("p1", strip(P.mid, 4, "M218 58H296") + strip(P.mid, 3.6, "M228 58V68M286 58V68")) +
      g("p2", f.svg) +
      g("p3", fill(P.deep, "M156 100H224L230 112H150Z") + fill(P.lite, "M150 112L156 100L136 90L128 103Z") + fill(P.lite, "M230 112L224 100L246 90L252 103Z") + lit("M150 112H230V150H150Z") + strip(P.lite, 2.4, "M162 124H218", `stroke-linecap="butt"`))
    );
  },

  // Offline: the laptop is dark and its plug lies short of the socket, but the turmeric copy reads fine.
  offline() {
    const f = person({ lean: -6, nod: 18, arms: [[0, 0], [0, 0]], legs: [[86, 84], [80, 82]] }, 232, { face: -1, reach: { hands: [{ x: 202, y: 98 }, { x: 206, y: 92 }] } });
    const pinned = (x: number, a: number) => tilt(a, x + 10, 52, rect(P.white, x, 37, 20, 26, 1) + ruled(`M${x + 3.5} 44H${x + 16.5}M${x + 3.5} 50H${x + 14}M${x + 3.5} 56H${x + 16.5}`, 1.8));
    return (
      wall() +
      cloth() +
      g(
        "p1",
        rect(P.white, 22, 110, 16, 22, 2) +
          circle(P.deep, 27, 118, 1.7) +
          circle(P.deep, 33, 118, 1.7) +
          rect(P.mid, 250, 30, 58, 46, 2) +
          pinned(256, -4) +
          pinned(281, 5) +
          circle(P.deep, 266, 38, 2.2) +
          litCircle(291, 39, 2.8)
      ) +
      g(
        "p2",
        table(62, 156, 108) +
          rect(P.ink, 92, 80, 42, 27, 2) +
          rect(P.deep, 95.5, 83.5, 35, 20, 0.8) +
          rect(P.mid, 86, 104, 54, 4, 1.5) +
          strip(P.deep, 2.2, "M88 106C72 106 62 107.5 59 115C55.5 125 60 145 52 148.5", `fill="none"`) +
          rect(P.deep, 43, 144.5, 10, 8, 1.6) +
          strip(P.deep, 1.6, "M43 146.6H38.5M43 150.4H38.5", `stroke-linecap="butt"`) +
          chair(f.hip, -1) +
          f.svg
      ) +
      g("p3", tilt(-10, 200, 94, lit("M188 76H214V112H188Z") + ruled("M192.5 84H208.5M192.5 91H202M204.5 91H208.5M192.5 97H202M204.5 97H208.5", 2)))
    );
  },

  /* ── About ──────────────────────────────────────────────── */

  // At the loom, weaving the turmeric thread into the cloth.
  about() {
    const f = person({ lean: 8, arms: [[0, 0], [0, 0]], legs: [[88, 86], [83, 84]] }, 132, { reach: { hands: [{ x: 172, y: 106 }, { x: 166, y: 112 }] } });
    const warps = Array.from({ length: 12 }, (_, i) => `M${186 + i * 8} 54V120`).join("");
    // Where the turmeric weft passes under a warp, the warp is laid back over it.
    const unders = Array.from({ length: 6 }, (_, i) => `M${186 + i * 16} 108.6V113.4`).join("");
    return (
      wall() +
      cloth() +
      g("p2", circle(P.mid, 64, 139, 11.5) + strip(P.white, 1.6, "M54 136Q63 129 74 134M53.5 142Q64 133 75.5 140M56 147Q66 139 75 146") + circle(P.white, 90, 143.5, 8) + strip(P.mid, 1.4, "M83 141Q90 136 97 140M83 146Q90 141 97.5 145") + strip(P.mid, 1.4, "M75 145Q98 152 118 141", `fill="none"`)) +
      g("p2", strip(P.mid, 3.6, `M${n(f.hip.x - 9)} ${n(f.hip.y + 5)}H${n(f.hip.x + 9)}M${n(f.hip.x - 6)} ${n(f.hip.y + 5)}L${n(f.hip.x - 9)} ${GROUND}M${n(f.hip.x + 6)} ${n(f.hip.y + 5)}L${n(f.hip.x + 9)} ${GROUND}`) + strip(P.mid, 6, "M178 150V48M282 150V48") + rect(P.mid, 172, 44, 116, 9, 2) + strip(P.white, 2.6, warps, `stroke-linecap="butt"`) + rect(P.ink, 180, 117, 100, 17) + strip(P.mid, 3, "M182 120.5H280M186 125.5H280M182 130.5H280", `stroke-dasharray="4 4" stroke-linecap="butt"`) + rect(P.mid, 172, 134, 116, 8, 2) + f.svg) +
      g("p3", strip(P.haldi, 3.4, `M${n(f.hands[0].x)} ${n(f.hands[0].y)}C176 108 178 111 186 111H278`, `stroke-linecap="butt"`) + strip(P.white, 2.6, unders, `stroke-linecap="butt"`) + fill(P.lite, "M160 101C165 99 174 99 178 102C174 105 165 105 160 101Z"))
    );
  }
};

export const SCENE_NAMES = Object.keys(SCENES);

export function sceneSvg(name: string): string {
  const draw = SCENES[name] ?? SCENES["not-found"];
  return draw();
}
