const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });

  const pathA = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-A/VIII-A.webp';
  const pathB = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-B/VIII-B.webp';

  const b64A = fs.readFileSync(pathA).toString('base64');
  const b64B = fs.readFileSync(pathB).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #020617; color: white; font-family: monospace; padding: 20px; }
        .row { margin-bottom: 25px; background: #0f172a; padding: 15px; border-radius: 8px; }
        canvas { border: 2px solid #38bdf8; display: block; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h2>Detailed 1:1 Pixel Crop of Chalkboard & Walking Aisle (x: 350..950, y: 60..400)</h2>
      <div id="crops"></div>

      <script>
        const rooms = [
          { name: 'Ruang VIII-A', b64: '${b64A}', curX: 685, curY: 350 },
          { name: 'Ruang VIII-B', b64: '${b64B}', curX: 515, curY: 345 }
        ];

        const container = document.getElementById('crops');
        rooms.forEach(r => {
          const div = document.createElement('div');
          div.className = 'row';
          div.innerHTML = '<h3>' + r.name + ' (Crop x:350..950, y:60..400)</h3>';

          const canvas = document.createElement('canvas');
          canvas.width = 600;
          canvas.height = 340;
          const ctx = canvas.getContext('2d');

          const img = new Image();
          img.src = 'data:image/webp;base64,' + r.b64;
          img.onload = () => {
            const temp = document.createElement('canvas');
            temp.width = 1235;
            temp.height = 650;
            const tctx = temp.getContext('2d');
            tctx.drawImage(img, 0, 0, 1235, 650);

            // Draw crop 350..950, 60..400
            ctx.drawImage(temp, 350, 60, 600, 340, 0, 0, 600, 340);

            // Draw coordinate grid every 25px
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fillStyle = '#38bdf8';
            ctx.font = '10px monospace';
            for (let x = 0; x <= 600; x += 25) {
              const wx = 350 + x;
              ctx.beginPath();
              ctx.moveTo(x, 0); ctx.lineTo(x, 340); ctx.stroke();
              if (wx % 50 === 0) {
                ctx.fillText(wx + '', x + 2, 12);
              }
            }
            for (let y = 0; y <= 340; y += 25) {
              const wy = 60 + y;
              ctx.beginPath();
              ctx.moveTo(0, y); ctx.lineTo(600, y); ctx.stroke();
              if (wy % 50 === 0) {
                ctx.fillText(wy + '', 2, y - 2);
              }
            }

            // Draw current teacher box in Red
            const cx = r.curX - 350;
            const cy = r.curY - 60;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - 60, cy - 211, 120, 248);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.fillRect(cx - 60, cy - 211, 120, 248);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Posisi Sekarang X=' + r.curX, cx - 50, cy - 216);
          };

          div.appendChild(canvas);
          container.appendChild(div);
        });
      </script>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  await new Promise(r => setTimeout(r, 2000));

  const outPath = path.join(ARTIFACTS_DIR, 'classroom_detailed_crops.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved detailed center crops to:', outPath);

  await browser.close();
})();
