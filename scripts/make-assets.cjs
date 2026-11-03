/**
 * Generates the brand files in /public from code, so they can be rebuilt
 * whenever the mark or a title changes:
 *   favicon.svg, icons/*.png, og/*.jpg (1200×630), site.webmanifest
 *
 * Social images are JPEGs of about 60–90 KB: WhatsApp and some other apps skip
 * preview images over about 300 KB, and the old PNGs were 295–316 KB. Each
 * calculator also gets its own card (og/tool-<id>.jpg) with its title.
 *
 * Run: node scripts/make-assets.cjs   (needs Playwright's Chromium)
 * Only some social images: node scripts/make-assets.cjs learn glossary
 * (names are og/<name>.jpg; the favicon, icons and manifest are then left as they are).
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
// The host printed on social images: the custom domain once there is one.
const host = new URL(process.env.SITE_URL || "https://peoplecraft.vercel.app").host;
const pub = path.join(root, "public");
const fontFile = path.join(root, "node_modules/@fontsource-variable/anek-latin/files/anek-latin-latin-standard-normal.woff2");
const fontUrl = `data:font/woff2;base64,${fs.readFileSync(fontFile).toString("base64")}`;

/* ---------- The mark: a 3 × 3 plain weave (same geometry as Logo.astro) ---------- */
function weave({ warp = "#2F3786", weft = "#949EE2", accent = "#EFAB22", gap = "#FFFFFF" } = {}) {
  const pos = [4.5, 13.5, 22.5];
  const w = 5;
  const ext = 1.4;
  const wefts = pos.map((y) => `<rect x="1" y="${y}" width="30" height="${w}" rx="2.5" fill="${weft}"/>`).join("");
  const warps = pos.map((x, j) => `<rect x="${x}" y="1" width="${w}" height="30" rx="2.5" fill="${j === 1 ? accent : warp}"/>`).join("");
  const over = pos
    .flatMap((y, i) => pos.map((x, j) => ((i + j) % 2 === 1 ? `<rect x="${x - ext}" y="${y}" width="${w + 2 * ext}" height="${w}" fill="${weft}"/>` : "")))
    .join("");
  return `<g stroke="${gap}" stroke-width="1.3" paint-order="stroke">${wefts}${warps}${over}</g>`;
}

/* Names given on the command line limit the run to those social images. */
const only = process.argv.slice(2);

/* Favicon: the mark on a white rounded tile so it reads in light and dark tab bars. */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#FFFFFF"/><g transform="translate(3 3) scale(0.8125)">${weave()}</g></svg>`;
if (!only.length) fs.writeFileSync(path.join(pub, "favicon.svg"), faviconSvg);

/* ---------- OG images ---------- */
const booksSrc = fs.readFileSync(path.join(root, "src/data/books.ts"), "utf8");
function book(id) {
  const m = booksSrc.match(new RegExp(`"?${id}"?: \\{\\s*title: "([^"]+)",\\s*short: "[^"]*",\\s*subtitle: "([^"]+)"`));
  if (!m) throw new Error(`Book ${id} not found in books.ts`);
  return { title: m[1], sub: m[2] };
}

const og = [
  { file: "default", kicker: "Free HR library for India", title: "HR answers in plain English", sub: "Handbooks, calculators, letters and a glossary for everyone who works in India. No sign-up." },
  { file: "handbooks", kicker: "Handbooks", title: "Four HR handbooks for India", sub: "Labour Codes, salary TDS, recruitment and the HR profession, chapter by chapter, with diagrams." },
  { file: "toolkit", kicker: "Toolkit", title: "HR tools that work in your browser", sub: "Calculators, letters, forms, policies and checklists, from hiring to exit. Nothing you type leaves your device." },
  { file: "jd-library", kicker: "JD library", title: "Job descriptions, ready to adapt", sub: "Fill in your company's details, download a Word file, and interview with questions that show what a strong answer looks like." },
  { file: "glossary", kicker: "Glossary", title: "Indian workplace terms, in one sentence each", sub: "CTC, F&F, LWP, UAN, gratuity, comp-off and more, each linked to the page that goes deeper." },
  { file: "learn", kicker: "PeopleCraft Learn", title: "Learn HR, one module at a time", sub: "A free course built from what XLRI, CIPD and SHRM teach, with Indian law and practice. Diagrams, practice and cases. No sign-up." },
  ...["labour-law", "tds", "recruitment", "hr-professional"].map((id) => ({ file: id, kicker: "Handbook", ...book(id) }))
];

/** One card per calculator, from its front matter ({{fact:…}} tokens resolved). */
async function calculatorCards() {
  const { resolveFacts } = await import(path.join(root, "src/data/statutory.ts"));
  const dir = path.join(root, "src/content/toolkit");
  return fs
    .readdirSync(dir)
    .map((f) => ({ id: f.replace(/\.mdx?$/, ""), text: fs.readFileSync(path.join(dir, f), "utf8") }))
    .filter(({ text }) => /^kind:\s*calculator\s*$/m.test(text))
    .map(({ id, text }) => {
      const field = (k) => {
        const m = new RegExp(`^${k}:\\s*(?:>-\\s*\\n\\s+)?["']?(.+?)["']?\\s*$`, "m").exec(text);
        return m ? resolveFacts(m[1]) : "";
      };
      return { file: `tool-${id}`, kicker: "Free calculator", title: field("title"), sub: field("description") };
    });
}

/* A large woven field that bleeds off the right edge: warp threads in neel,
   weft in a lighter neel, one turmeric warp. Alternating over/under. */
function field() {
  const cell = 66;
  const t = 30;
  const cols = 9;
  const rows = 10;
  const x0 = 760;
  const y0 = -30;
  let out = "";
  for (let r = 0; r < rows; r++) out += `<rect x="${x0 - 40}" y="${y0 + r * cell}" width="${cols * cell + 80}" height="${t}" rx="${t / 2}" fill="#3B44A6"/>`;
  for (let c = 0; c < cols; c++) {
    const fill = c === 2 ? "#EFAB22" : "#6B76D2";
    out += `<rect x="${x0 + c * cell}" y="${y0 - 40}" width="${t}" height="${rows * cell + 80}" rx="${t / 2}" fill="${fill}"/>`;
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if ((r + c) % 2 === 1) out += `<rect x="${x0 + c * cell - 6}" y="${y0 + r * cell}" width="${t + 12}" height="${t}" fill="#3B44A6"/>`;
  return `<svg class="field" viewBox="0 0 1200 630" width="1200" height="630" aria-hidden="true"><g stroke="#11143A" stroke-width="7" paint-order="stroke">${out}</g></svg>`;
}

function ogHtml({ kicker, title, sub }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: "Anek"; src: url(${fontUrl}) format("woff2"); font-weight: 100 800; font-stretch: 75% 125%; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; }
  body { position: relative; overflow: hidden; background: #11143A; font-family: "Anek", sans-serif; color: #fff; }
  .field { position: absolute; inset: 0; }
  .fade { position: absolute; inset: 0; background: linear-gradient(90deg, #11143A 0%, #11143A 56%, rgb(17 20 58 / 0.55) 74%, rgb(17 20 58 / 0) 100%); }
  .copy { position: absolute; left: 72px; top: 64px; bottom: 64px; width: 720px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; font-weight: 660; font-stretch: 106%; font-size: 30px; letter-spacing: -0.02em; }
  .kicker { margin-top: auto; font-size: 26px; font-weight: 600; color: #F7C24D; }
  h1 { margin-top: 14px; font-size: ${title.length > 34 ? 66 : 76}px; line-height: 1.02; font-weight: 720; font-stretch: 108%; letter-spacing: -0.025em; text-wrap: balance; }
  p { margin-top: 22px; font-size: 28px; line-height: 1.35; color: #BCC3EE; max-width: 640px; text-wrap: pretty; }
  .url { margin-top: 30px; font-size: 22px; font-weight: 600; color: #949EE2; }
  </style></head><body>
  ${field()}<div class="fade"></div>
  <div class="copy">
    <div class="brand"><svg width="40" height="40" viewBox="0 0 32 32">${weave({ warp: "#BCC3EE", weft: "#4C56BE", accent: "#EFAB22", gap: "#11143A" })}</svg>PeopleCraft</div>
    <div class="kicker">${kicker}</div>
    <h1>${title}</h1>
    <p>${sub}</p>
    <div class="url">${host}</div>
  </div>
  </body></html>`;
}

function iconHtml(size, { pad, radius, bg }) {
  const inner = size - pad * 2;
  return `<!doctype html><html><head><style>*{margin:0}html,body{width:${size}px;height:${size}px;background:transparent}
  .tile{width:${size}px;height:${size}px;border-radius:${radius}px;background:${bg};display:grid;place-items:center}</style></head>
  <body><div class="tile"><svg width="${inner}" height="${inner}" viewBox="0 0 32 32">${weave()}</svg></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  fs.mkdirSync(path.join(pub, "og"), { recursive: true });
  const cards = [...og, ...(await calculatorCards())];
  const unknown = only.filter((name) => !cards.some((o) => o.file === name));
  if (unknown.length) throw new Error(`No social image called ${unknown.join(", ")}`);
  for (const o of cards) {
    if (only.length && !only.includes(o.file)) continue;
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.setContent(ogHtml(o), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(pub, "og", `${o.file}.jpg`), type: "jpeg", quality: 82 });
    console.log("og/" + o.file + ".jpg");
  }
  if (only.length) {
    await browser.close();
    return;
  }

  fs.mkdirSync(path.join(pub, "icons"), { recursive: true });
  const icons = [
    { file: "favicon-32.png", size: 32, pad: 3, radius: 7, bg: "#FFFFFF", transparent: true },
    { file: "apple-touch-icon.png", size: 180, pad: 30, radius: 0, bg: "#FFFFFF" },
    { file: "icon-192.png", size: 192, pad: 26, radius: 42, bg: "#FFFFFF", transparent: true },
    { file: "icon-512.png", size: 512, pad: 68, radius: 112, bg: "#FFFFFF", transparent: true },
    { file: "icon-maskable-512.png", size: 512, pad: 116, radius: 0, bg: "#FFFFFF" }
  ];
  for (const i of icons) {
    await page.setViewportSize({ width: i.size, height: i.size });
    await page.setContent(iconHtml(i.size, i));
    await page.screenshot({ path: path.join(pub, "icons", i.file), omitBackground: !!i.transparent });
    console.log("icons/" + i.file);
  }
  await browser.close();

  const manifest = {
    name: "PeopleCraft: the free HR library for India",
    short_name: "PeopleCraft",
    description: "Free, plain-English HR handbooks, calculators, letters and a glossary for India.",
    start_url: "/",
    scope: "/",
    display: "minimal-ui",
    background_color: "#FFFFFF",
    theme_color: "#2F3786",
    lang: "en-IN",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
  fs.writeFileSync(path.join(pub, "site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
  console.log("site.webmanifest");
})();
