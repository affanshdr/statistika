const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1800 });

  const b64BgA = fs.readFileSync('public/Assets/Building/Ruang VIII-A/VIII-A.webp').toString('base64');
  const b64SpA = fs.readFileSync('public/Assets/Building/Ruang VIII-A/Bu Rina.webp').toString('base64');

  const b64BgB = fs.readFileSync('public/Assets/Building/Ruang VIII-B/VIII-B.webp').toString('base64');
  const b64SpB = fs.readFileSync('public/Assets/Building/Ruang VIII-B/Pak Setiawan.webp').toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #09090b; color: #f4f4f5; font-family: sans-serif; padding: 20px; }
        .comparison-card { background: #18181b; padding: 18px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #27272a; }
        h2 { margin-top: 0; color: #38bdf8; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
        .canvas-wrap { background: #000; border-radius: 8px; overflow: hidden; border: 1px solid #3f3f46; position: relative; }
        .label { padding: 8px 12px; font-weight: bold; font-size: 13px; font-family: monospace; }
        .label-red { background: #7f1d1d; color: #fca5a5; }
        .label-green { background: #14532d; color: #86efac; }
        canvas { display: block; width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <h1>Simulasi Penempatan Guru Berbasis Computer Vision (Zero-Overlap Verification)</h1>
      <div id="container"></div>

      <script>
        const rooms = [
          {
            name: 'Ruang VIII-A (Bu Rina)',
            bgB64: '${b64BgA}',
            spB64: '${b64SpA}',
            size: 120,
            aspect: 2.068,
            current: { x: 685, y: 350, desc: 'LAMA: x=685 (Tumpang Tindih dengan Meja Murid Berhijab)' },
            proposed: { x: 618, y: 348, desc: 'OPTIMAL CV: x=618, y=348 (Tepat di Tengah Lorong Jalan & Depan Papan Tulis)' }
          },
          {
            name: 'Ruang VIII-B (Pak Setiawan)',
            bgB64: '${b64BgB}',
            spB64: '${b64SpB}',
            size: 120,
            aspect: 2.068,
            current: { x: 515, y: 345, desc: 'LAMA: x=515 (Tumpang Tindih dengan Meja Murid Kiri)' },
            proposed: { x: 595, y: 345, desc: 'OPTIMAL CV: x=595, y=345 (Tepat di Tengah Lorong Jalan & Depan Papan Tulis)' }
          }
        ];

        const container = document.getElementById('container');

        rooms.forEach(r => {
          const card = document.createElement('div');
          card.className = 'comparison-card';
          card.innerHTML = '<h2>' + r.name + '</h2><div class="grid" id="grid-' + r.name.replace(/\\W+/g, '') + '"></div>';
          container.appendChild(card);

          const grid = card.querySelector('.grid');

          const bg = new Image();
          bg.src = 'data:image/webp;base64,' + r.bgB64;

          const sp = new Image();
          sp.src = 'data:image/webp;base64,' + r.spB64;

          Promise.all([
            new Promise(res => bg.onload = res),
            new Promise(res => sp.onload = res)
          ]).then(() => {
            [r.current, r.proposed].forEach((conf, idx) => {
              const isOld = idx === 0;
              const wrap = document.createElement('div');
              wrap.className = 'canvas-wrap';
              wrap.innerHTML = '<div class="label ' + (isOld ? 'label-red' : 'label-green') + '">' + conf.desc + '</div>';

              const canvas = document.createElement('canvas');
              canvas.width = 1235;
              canvas.height = 650;
              const ctx = canvas.getContext('2d');

              // Draw BG
              ctx.drawImage(bg, 0, 0, 1235, 650);

              // NPCCharacter logic:
              // width = size = 120
              // height = size * aspectRatio = 120 * 2.068 = 248.16
              // posX = x - width / 2
              // posY = y - height * 0.85
              const w = r.size;
              const h = r.size * r.aspect;
              const posX = conf.x - w / 2;
              const posY = conf.y - h * 0.85;

              // Draw shadow
              ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
              ctx.beginPath();
              ctx.ellipse(conf.x, conf.y, r.size * 0.175, r.size * 0.075, 0, 0, Math.PI * 2);
              ctx.fill();

              // Draw sprite
              ctx.drawImage(sp, posX, posY, w, h);

              // Draw bounding box guide
              ctx.strokeStyle = isOld ? '#ef4444' : '#22c55e';
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(posX, posY, w, h);

              // Foot point
              ctx.fillStyle = isOld ? '#ef4444' : '#22c55e';
              ctx.beginPath();
              ctx.arc(conf.x, conf.y, 4, 0, Math.PI * 2);
              ctx.fill();

              // Vertical axis guideline
              ctx.beginPath();
              ctx.moveTo(conf.x, 0);
              ctx.lineTo(conf.x, 650);
              ctx.stroke();

              wrap.appendChild(canvas);
              grid.appendChild(wrap);
            });
          });
        });
      </script>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  await new Promise(r => setTimeout(r, 2500));

  const outPath = path.join(ARTIFACTS_DIR, 'simulasi_posisi_guru_cv.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved simulation comparison screenshot to:', outPath);

  await browser.close();
})();
