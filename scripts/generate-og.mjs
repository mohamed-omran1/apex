import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/**
 * One off generator for public/images/og.png (1200x630), the single static
 * social card referenced by lib/seo/metadata.ts. Run: node scripts/generate-og.mjs
 * The palette mirrors the design tokens in app/globals.css: cedar, paper,
 * sage, copper, dust and mist are the exact token values.
 */

const WIDTH = 1200;
const HEIGHT = 630;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  .card {
    position: relative;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: #1c4a3c;
    color: #fbf8f3;
    padding: 74px 84px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: "Instrument Sans", Arial, sans-serif;
    overflow: hidden;
  }
  .glow {
    position: absolute;
    right: -180px;
    bottom: -240px;
    width: 560px;
    height: 560px;
    border-radius: 50%;
    background: rgba(227, 238, 232, 0.09);
  }
  .top {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .wordmark {
    font-family: "Fraunces", Georgia, serif;
    font-size: 78px;
    font-weight: 600;
    line-height: 1;
  }
  .sub {
    margin-top: 12px;
    font-size: 19px;
    font-weight: 600;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #e3eee8;
  }
  .pill {
    background: #e3eee8;
    color: #1c4a3c;
    border-radius: 999px;
    padding: 17px 30px;
    font-size: 27px;
    font-weight: 600;
  }
  .middle { position: relative; max-width: 940px; }
  .rule {
    width: 96px;
    height: 6px;
    border-radius: 3px;
    background: #c4622d;
    margin-bottom: 30px;
  }
  h1 {
    font-family: "Fraunces", Georgia, serif;
    font-size: 66px;
    line-height: 1.1;
    font-weight: 600;
  }
  .lede {
    margin-top: 24px;
    font-size: 27px;
    line-height: 1.4;
    color: #e3eee8;
    max-width: 900px;
  }
  .bottom {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 19px;
    color: #c9c2b6;
  }
  .demo { color: #8fb3a4; }
</style>
</head>
<body>
  <div class="card">
    <div class="glow"></div>
    <div class="top">
      <div>
        <div class="wordmark">Apex</div>
        <div class="sub">Climate Solutions</div>
      </div>
      <div class="pill">(214) 555-0148</div>
    </div>
    <div class="middle">
      <div class="rule"></div>
      <h1>When the AC quits, we pick up.</h1>
      <p class="lede">Dallas HVAC repair, replacement and tune-ups. The written price comes before any work.</p>
    </div>
    <div class="bottom">
      <span>Serving Dallas &nbsp;·&nbsp; Plano &nbsp;·&nbsp; Irving &nbsp;·&nbsp; Garland &nbsp;·&nbsp; Richardson &nbsp;·&nbsp; Frisco</span>
      <span class="demo">Fictional demo company &nbsp;·&nbsp; TACLB000000C</span>
    </div>
  </div>
</body>
</html>`;

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "public", "images", "og.png");

await mkdir(dirname(outPath), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: outPath });
  console.log(`og image written to ${outPath}`);
} finally {
  await browser.close();
}
