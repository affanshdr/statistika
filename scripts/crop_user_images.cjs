const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });

  const userImgA = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567050788_1d1d468e.png';
  const userImgB = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567061478_9511d57c.png';

  const b64A = fs.readFileSync(userImgA).toString('base64');
  const b64B = fs.readFileSync(userImgB).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #18181b; color: white; font-family: monospace; padding: 20px; }
        .crop-row { display: flex; gap: 20px; margin-bottom: 20px; }
        .crop-card { background: #27272a; padding: 10px; border-radius: 8px; border: 1px solid #52525b; }
        canvas { display: block; border: 1px solid #38bdf8; }
      </style>
    </head>
    <body>
      <h2>Detailed Crops of Teacher & Desk Layout in User Screenshots</h2>
      <div id="crops"></div>

      <script>
        const crops = [
          { name: 'Ruang VIII-A (Bu Rina Area)', b64: '${b64A}', sx: 350, sy: 120, sw: 550, sh: 350 },
          { name: 'Ruang VIII-B (Pak Setiawan Area)', b64: '${b64B}', sx: 300, sy: 120, sw: 550, sh: 350 }
        ];

        const container = document.getElementById('crops');
        crops.forEach(c => {
          const card = document.createElement('div');
          card.className = 'crop-card';
          card.innerHTML = '<h3>' + c.name + ' [x: ' + c.sx + '..' + (c.sx + c.sw) + ', y: ' + c.sy + '..' + (c.sy + c.sh) + ']</h3>';
          
          const canvas = document.createElement('canvas');
          canvas.width = c.sw;
          canvas.height = c.sh;
          const ctx = canvas.getContext('2d');

          const img = new Image();
          img.src = 'data:image/png;base64,' + c.b64;
          img.onload = () => {
            // Draw scaled to match 1235x650
            const temp = document.createElement('canvas');
            temp.width = 1235;
            temp.height = 650;
            const tctx = temp.getContext('2d');
            tctx.drawImage(img, 0, 0, 1235, 650);

            ctx.drawImage(temp, c.sx, c.sy, c.sw, c.sh, 0, 0, c.sw, c.sh);

            // Draw grid every 50px
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.fillStyle = '#38bdf8';
            ctx.font = '11px monospace';
            for (let x = 0; x <= c.sw; x += 50) {
              const worldX = c.sx + x;
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, c.sh);
              ctx.stroke();
              ctx.fillText(worldX + '', x + 2, 15);
            }
            for (let y = 0; y <= c.sh; y += 50) {
              const worldY = c.sy + y;
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(c.sw, y);
              ctx.stroke();
              ctx.fillText(worldY + '', 2, y - 2);
            }
          };

          card.appendChild(canvas);
          container.appendChild(card);
        });
      </script>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  await new Promise(r => setTimeout(r, 1500));

  const outPath = path.join(ARTIFACTS_DIR, 'user_detailed_crops.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved detailed crops to:', outPath);

  await browser.close();
})();
