import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, "../public/images/og/default.png");
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.setContent(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body { width: 1200px; height: 630px; margin: 0; }
          body {
            position: relative;
            overflow: hidden;
            background: #f5f5f1;
            color: #111111;
            font-family: Arial, Helvetica, sans-serif;
          }
          .frame {
            position: absolute;
            inset: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 1px solid rgb(0 0 0 / 10%);
            padding: 34px 38px;
          }
          .grid-line { position: absolute; background: rgb(0 0 0 / 10%); }
          .grid-line.vertical { top: 0; right: 174px; width: 1px; height: 100%; }
          .grid-line.horizontal { right: 0; bottom: 144px; width: 100%; height: 1px; }
          .orb {
            position: absolute;
            right: 98px;
            bottom: 78px;
            width: 238px;
            height: 238px;
            border: 1px solid #5B5CFF;
            border-radius: 50%;
          }
          .orbit {
            position: absolute;
            right: 32px;
            bottom: 156px;
            width: 356px;
            height: 1px;
            background: #5B5CFF;
            transform: rotate(-31deg);
            transform-origin: right center;
          }
          .eyebrow, .footer {
            margin: 0;
            color: #686868;
            font-family: "Courier New", monospace;
            font-size: 18px;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }
          h1 {
            max-width: 780px;
            margin: 0;
            font-size: 109px;
            font-weight: 600;
            letter-spacing: -0.085em;
            line-height: 0.83;
          }
          h1 span { color: #5B5CFF; }
          .footer { display: flex; justify-content: space-between; gap: 24px; }
        </style>
      </head>
      <body>
        <div class="grid-line vertical"></div>
        <div class="grid-line horizontal"></div>
        <div class="orb"></div>
        <div class="orbit"></div>
        <main class="frame">
          <p class="eyebrow">Bash AI Lab / Independent Research Practice</p>
          <h1>Systems for<br /><span>making software</span><br />with AI.</h1>
          <p class="footer"><span>Research / Product Systems / Native Software</span><span>Shenzhen · Global</span></p>
        </main>
      </body>
    </html>`);

  await mkdir(dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, type: "png" });
  await context.close();
} finally {
  await browser.close();
}
