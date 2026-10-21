const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1500 });

  const pathA = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-A/VIII-A.webp';
  const pathB = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-B/VIII-B.webp';

  const b64A = fs.readFileSync(pathA).toString('base64');
  const b64B = fs.readFileSync(pathB).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #0f172a; color: white; font-family: sans-serif; padding: 20px; }
        .box { margin-bottom: 25px; background: #1e293b; padding: 15px; border-radius: 8px; }
        canvas { border: 1px solid #38bdf8; display: block; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h2>Visualisasi Papan Tulis & Zona Berdiri Guru</h2>
      <div id="views"></div>

      <script>
        const rooms = [
          { id: 'VIII-A', name: 'Ruang VIII-A (Bu Rina)', b64: '${b64A}', curX: 685, curY: 350 },
          { id: 'VIII-B', name: 'Ruang VIII-B (Pak Setiawan)', b64: '${b64B}', curX: 515, curY: 345 }
        ];

        const container = document.getElementById('views');

        rooms.forEach(r => {
          const div = document.createElement('div');
          div.className = 'box';
          div.innerHTML = '<h3>' + r.name + '</h3>';
          
          const canvas = document.createElement('canvas');
          canvas.width = 1235;
          canvas.height = 650;
          const ctx = canvas.getContext('2d');

          const img = new Image();
          img.src = 'data:image/webp;base64,' + r.b64;
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 1235, 650);

            // Draw horizontal rulers every 50px
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            for (let x = 0; x <= 1235; x += 50) {
              ctx.beginPath();
              ctx.moveTo(x, 0); ctx.lineTo(x, 650); ctx.stroke();
            }
            for (let y = 0; y <= 650; y += 50) {
              ctx.beginPath();
              ctx.moveTo(0, y); ctx.lineTo(1235, y); ctx.stroke();
            }

            // Bold coordinate labels every 100px
            ctx.fillStyle = '#38bdf8';
            ctx.font = '12px monospace';
            for (let x = 0; x <= 1235; x += 100) {
              ctx.fillText(x + 'px', x + 2, 20);
            }
            for (let y = 0; y <= 650; y += 50) {
              ctx.fillText(y + 'px', 4, y - 4);
            }

            // Draw current teacher position in red
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(r.curX - 60, r.curY - 211, 120, 248);
            ctx.fillStyle = 'rgba(239,68,68,0.3)';
            ctx.fillRect(r.curX - 60, r.curY - 211, 120, 248);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('POSISI SEKARANG: x=' + r.curX + ', y=' + r.curY, r.curX - 80, r.curY - 220);
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

  const outPath = path.join(ARTIFACTS_DIR, 'classroom_ruler_overlay.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved ruler overlay to:', outPath);

  await browser.close();
})();
