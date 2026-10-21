const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1600 });

  const userImgA = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567050788_1d1d468e.png';
  const userImgB = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567061478_9511d57c.png';

  const b64A = fs.readFileSync(userImgA).toString('base64');
  const b64B = fs.readFileSync(userImgB).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #0f172a; color: white; font-family: sans-serif; padding: 20px; }
        .row { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; }
        .card { background: #1e293b; padding: 15px; border-radius: 8px; }
        img { max-width: 100%; border: 1px solid #334155; border-radius: 4px; }
        canvas { max-width: 100%; border: 1px solid #38bdf8; display: block; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>User Screenshot Analysis with Coordinate Grid (1235 x 650 equivalent)</h1>
      <div class="row">
        <div class="card">
          <h2>User Image 1 (Ruang VIII-A)</h2>
          <canvas id="cvsA"></canvas>
        </div>
        <div class="card">
          <h2>User Image 2 (Ruang VIII-B)</h2>
          <canvas id="cvsB"></canvas>
        </div>
      </div>

      <script>
        function drawRulers(canvasId, b64) {
          const canvas = document.getElementById(canvasId);
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = 'data:image/png;base64,' + b64;
          img.onload = () => {
            canvas.width = 1235;
            canvas.height = 650;
            ctx.drawImage(img, 0, 0, 1235, 650);

            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= 1235; x += 50) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, 650);
              ctx.stroke();
            }
            for (let y = 0; y <= 650; y += 50) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(1235, y);
              ctx.stroke();
            }

            // Bold lines every 100px with text
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.fillStyle = '#38bdf8';
            ctx.font = '12px monospace';
            for (let x = 0; x <= 1235; x += 100) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, 650);
              ctx.stroke();
              ctx.fillText(x + 'px', x + 3, 20);
            }
            for (let y = 0; y <= 650; y += 100) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(1235, y);
              ctx.stroke();
              ctx.fillText(y + 'px', 5, y - 5);
            }
          };
        }

        drawRulers('cvsA', '${b64A}');
        drawRulers('cvsB', '${b64B}');
      </script>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  await new Promise(r => setTimeout(r, 2000));

  const outPath = path.join(ARTIFACTS_DIR, 'user_screenshots_grid_analyzed.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved grid analyzed screenshots to:', outPath);

  await browser.close();
})();
