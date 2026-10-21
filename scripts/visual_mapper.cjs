const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1800 });

  const pathA = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-A/VIII-A.webp';
  const pathB = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-B/VIII-B.webp';

  const b64A = fs.readFileSync(pathA).toString('base64');
  const b64B = fs.readFileSync(pathB).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 20px; }
        .room-box { margin-bottom: 30px; background: #1e293b; padding: 15px; border-radius: 8px; }
        canvas { border: 1px solid #475569; display: block; margin: 10px 0; border-radius: 4px; }
        pre { background: #020617; padding: 10px; border-radius: 4px; font-size: 13px; color: #38bdf8; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h2>Pemetikan Pixel & Penentuan Koridor Bebas Tabrakan</h2>
      <div id="container"></div>

      <script>
        const rooms = [
          { id: 'VIII-A', name: 'Ruang VIII-A (Bu Rina)', b64: '${b64A}', curX: 685, curY: 350 },
          { id: 'VIII-B', name: 'Ruang VIII-B (Pak Setiawan)', b64: '${b64B}', curX: 515, curY: 345 }
        ];

        const container = document.getElementById('container');

        rooms.forEach(r => {
          const box = document.createElement('div');
          box.className = 'room-box';
          box.innerHTML = '<h3>' + r.name + '</h3><div id=\"data-' + r.id + '\"></div>';
          container.appendChild(box);

          const img = new Image();
          img.src = 'data:image/webp;base64,' + r.b64;
          img.onload = () => {
            const W = 1235;
            const H = 650;
            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, W, H);

            const imgData = ctx.getImageData(0, 0, W, H).data;
            const getPixel = (x, y) => {
              const i = (Math.floor(y) * W + Math.floor(x)) * 4;
              return [imgData[i], imgData[i+1], imgData[i+2]];
            };

            // Let's create a heatmap of obstacles between y=260 and y=370
            // Draw horizontal strip of obstacle analysis
            const xScores = [];
            for (let x = 0; x < W; x++) {
              let score = 0;
              for (let y = 260; y <= 370; y++) {
                const [red, green, blue] = getPixel(x, y);
                // Floor is typically lighter, warm or cool grey
                // Detect desks: wood (red > 95, red > green + 15, red > blue + 30)
                // Detect navy pants / dark chairs: brightness < 70
                const isWood = (red > 95 && red > green + 15 && red > blue + 25);
                const isDark = ((red + green + blue)/3 < 65);
                if (isWood || isDark) score++;
              }
              xScores.push(score);
            }

            // Find local minimums (aisles / clear corridors)
            // Let's draw obstacle density chart on bottom of image
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, H - 90, W, 90);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = 0; x < W; x++) {
              const py = H - 10 - (xScores[x] / 110) * 70;
              if (x === 0) ctx.moveTo(x, py);
              else ctx.lineTo(x, py);
            }
            ctx.stroke();

            // Label axes
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px monospace';
            ctx.fillText('Densitas Halangan Meja/Kursi (y:260-370)', 10, H - 75);
            for (let x = 100; x < W; x += 100) {
              ctx.fillText(x + '', x - 10, H - 15);
            }

            // Mark current teacher position (Red line)
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(r.curX, 0);
            ctx.lineTo(r.curX, H);
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('Posisi Lama x=' + r.curX, r.curX + 6, 80);

            box.appendChild(canvas);
          };
        });
      </script>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  await new Promise(r => setTimeout(r, 2000));

  const outPath = path.join(ARTIFACTS_DIR, 'cv_obstacle_heatmap.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved obstacle heatmap to:', outPath);
  await browser.close();
})();
