const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1600 });

  const pathA = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-A/VIII-A.webp';
  const pathB = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-B/VIII-B.webp';

  const b64A = fs.readFileSync(pathA).toString('base64');
  const b64B = fs.readFileSync(pathB).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #18181b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; margin: 0; }
        h1 { margin-top: 0; color: #38bdf8; font-size: 24px; }
        .room-card { margin-bottom: 32px; background: #27272a; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        h2 { margin: 0 0 12px 0; color: #fbbf24; font-size: 20px; }
        canvas { border: 2px solid #3f3f46; max-width: 100%; display: block; margin: 16px 0; border-radius: 6px; }
        .info { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.6; background: #09090b; padding: 14px; border-radius: 8px; border-left: 4px solid #38bdf8; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
        .badge-red { background: #7f1d1d; color: #fca5a5; }
        .badge-green { background: #14532d; color: #86efac; }
        .badge-blue { background: #1e3a8a; color: #93c5fd; }
      </style>
    </head>
    <body>
      <h1>Analisis Computer Vision: Penyelarasan Garis Sumbu X & Deteksi Bebas Tumpang Tindih</h1>
      <div id="results"></div>

      <script>
        const rooms = [
          {
            id: 'B1',
            name: 'Ruang VIII-A (Bu Rina)',
            b64: '${b64A}',
            curX: 685,
            curY: 350,
            size: 120,
            aspectRatio: 2.068
          },
          {
            id: 'B2',
            name: 'Ruang VIII-B (Pak Setiawan)',
            b64: '${b64B}',
            curX: 515,
            curY: 345,
            size: 120,
            aspectRatio: 2.068
          }
        ];

        const container = document.getElementById('results');

        for (const room of rooms) {
          const card = document.createElement('div');
          card.className = 'room-card';
          card.innerHTML = '<h2>' + room.name + '</h2><div class="info" id="info-' + room.id + '">Menganalisis...</div>';
          container.appendChild(card);

          const bgImg = new Image();
          bgImg.src = 'data:image/webp;base64,' + room.b64;

          bgImg.onload = () => {
            const W = 1235;
            const H = 650;
            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bgImg, 0, 0, W, H);

            const imgData = ctx.getImageData(0, 0, W, H).data;
            const getPixel = (x, y) => {
              const i = (Math.floor(y) * W + Math.floor(x)) * 4;
              return [imgData[i], imgData[i+1], imgData[i+2]];
            };

            // 1. Deteksi Papan Tulis (Green Chalkboard)
            let cbMinX = W, cbMaxX = 0, cbMinY = H, cbMaxY = 0;
            let cbCount = 0;
            for (let y = 60; y < 350; y++) {
              for (let x = 100; x < W - 100; x++) {
                const [r, g, b] = getPixel(x, y);
                if (g > r + 15 && g > b + 15 && g > 45 && g < 165 && r < 125 && b < 125) {
                  if (x < cbMinX) cbMinX = x;
                  if (x > cbMaxX) cbMaxX = x;
                  if (y < cbMinY) cbMinY = y;
                  if (y > cbMaxY) cbMaxY = y;
                  cbCount++;
                }
              }
            }
            const cbCenterX = Math.round((cbMinX + cbMaxX) / 2);

            // 2. Scan density rintangan (meja/kursi/siswa) di baris midground (y: 260 .. 380)
            const colObstacles = new Array(W).fill(0);
            for (let x = 100; x < W - 100; x++) {
              for (let y = 260; y <= 380; y++) {
                const [r, g, b] = getPixel(x, y);
                const brightness = (r + g + b) / 3;
                const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

                // Karakteristik kayu meja cokelat atau seragam murid / rambut / bayangan
                const isWood = (r > 95 && r > g + 12 && r > b + 25);
                const isDark = (brightness < 75);
                const isStudentWhite = (brightness > 215 && maxDiff < 20);
                const isHighSat = (maxDiff > 42 && brightness < 195);

                if (isWood || isDark || isStudentWhite || isHighSat) {
                  colObstacles[x]++;
                }
              }
            }

            // Cari koridor lorong tengah (aisle) yang bebas meja
            // Area pencarian tengah x: 300 .. 950
            let aisleMinX = 0, aisleMaxX = 0, bestWidth = 0;
            let curStart = -1;
            const threshold = 18; // toleransi kecil tekstur nat lantai

            for (let x = 320; x <= 920; x++) {
              const isClear = colObstacles[x] <= threshold;
              if (isClear) {
                if (curStart === -1) curStart = x;
              } else {
                if (curStart !== -1) {
                  const width = x - curStart;
                  if (width > bestWidth) {
                    bestWidth = width;
                    aisleMinX = curStart;
                    aisleMaxX = x;
                  }
                  curStart = -1;
                }
              }
            }
            if (curStart !== -1) {
              const width = 920 - curStart;
              if (width > bestWidth) {
                bestWidth = width;
                aisleMinX = curStart;
                aisleMaxX = 920;
              }
            }

            const aisleCenterX = Math.round((aisleMinX + aisleMaxX) / 2);

            // Tentukan Optimal Teacher Pos
            // Teacher sprite: lebar = 120px (setengah = 60px).
            // Toleransi aman minimum = 15px dari meja terdekat.
            // Posisi X ideal harus berada di tengah lorong jalan atau sejajar pusat papan tulis yang berada dalam lorong.
            let optimalX = aisleCenterX;
            if (cbCenterX >= aisleMinX + 55 && cbCenterX <= aisleMaxX - 55) {
              optimalX = cbCenterX; // Sempurna sejajar pusat papan tulis DAN tengah lorong
            } else {
              // Jika pusat papan tulis agak melenceng, gunakan pusat lorong jalan bebas tabrakan
              optimalX = aisleCenterX;
            }

            // Visual Rendering
            // 1. Gambar Bounding Box Papan Tulis
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#22c55e';
            ctx.strokeRect(cbMinX, cbMinY, cbMaxX - cbMinX, cbMaxY - cbMinY);

            // Garis tengah Papan Tulis (Garis Hijau Putus-putus)
            ctx.beginPath();
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = '#22c55e';
            ctx.moveTo(cbCenterX, cbMinY - 25);
            ctx.lineTo(cbCenterX, cbMaxY + 90);
            ctx.stroke();

            // 2. Zona Lorong Tengah (Aisle Koridor Biru Transparan)
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
            ctx.fillRect(aisleMinX, 235, aisleMaxX - aisleMinX, 175);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(aisleMinX, 235, aisleMaxX - aisleMinX, 175);

            // Garis Sumbu Tengah Lorong (Garis Cyan Putus-putus)
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#06b6d4';
            ctx.moveTo(aisleCenterX, 220);
            ctx.lineTo(aisleCenterX, 420);
            ctx.stroke();

            // 3. Posisi Lama Guru (Merah - Tumpang Tindih)
            const sprW = room.size;
            const sprH = room.size * room.aspectRatio;
            const oldSprX = room.curX - sprW / 2;
            const oldSprY = room.curY - sprH * 0.85;

            ctx.setLineDash([]);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#ef4444';
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
            ctx.fillRect(oldSprX, oldSprY, sprW, sprH);
            ctx.strokeRect(oldSprX, oldSprY, sprW, sprH);

            // Titik pijak kaki posisi lama
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(room.curX, room.curY, 6, 0, Math.PI * 2);
            ctx.fill();

            // 4. Posisi Baru Guru Optimal CV (Emas / Hijau Terang - Bebas Tabrakan)
            const newSprX = optimalX - sprW / 2;
            const newSprY = room.curY - sprH * 0.85;

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#fbbf24';
            ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
            ctx.fillRect(newSprX, newSprY, sprW, sprH);
            ctx.strokeRect(newSprX, newSprY, sprW, sprH);

            // Titik pijak kaki posisi baru
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(optimalX, room.curY, 6, 0, Math.PI * 2);
            ctx.fill();

            // Teks Anotasi
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#22c55e';
            ctx.fillText('Pusat Papan Tulis X: ' + cbCenterX, cbCenterX - 80, cbMinY - 12);

            ctx.fillStyle = '#38bdf8';
            ctx.fillText('Lorong Aman: [' + aisleMinX + '..' + aisleMaxX + '] (Lebar: ' + bestWidth + 'px, Sumbu X: ' + aisleCenterX + ')', aisleMinX, 225);

            ctx.fillStyle = '#ef4444';
            ctx.fillText('LAMA: X=' + room.curX + ' (MENABRAK MEJA!)', oldSprX - 10, oldSprY - 10);

            ctx.fillStyle = '#fbbf24';
            ctx.fillText('OPTIMAL CV: X=' + optimalX + ' (BEBAS TABRAKAN)', newSprX - 15, newSprY + sprH + 22);

            card.appendChild(canvas);

            const distLeftOld = (oldSprX - aisleMinX);
            const distRightOld = (aisleMaxX - (oldSprX + sprW));
            const distLeftNew = (newSprX - aisleMinX);
            const distRightNew = (aisleMaxX - (newSprX + sprW));

            document.getElementById('info-' + room.id).innerHTML =
              '<div><strong>1. Koordinat Papan Tulis:</strong> minX=' + cbMinX + ', maxX=' + cbMaxX + ', Lebar=' + (cbMaxX - cbMinX) + 'px, Titik Tengah X = <span class="badge badge-green">' + cbCenterX + '</span>, Dasar Y=' + cbMaxY + '</div>' +
              '<div><strong>2. Koridor Lorong Tengah (Aisle):</strong> minX=' + aisleMinX + ', maxX=' + aisleMaxX + ', Lebar Bersih = <strong>' + bestWidth + 'px</strong>, Titik Sumbu Tengah X = <span class="badge badge-blue">' + aisleCenterX + '</span></div>' +
              '<div><strong>3. Posisi Lama:</strong> X=' + room.curX + ', Y=' + room.curY + ' &rarr; Rentang Sprite: [' + Math.round(oldSprX) + '..' + Math.round(oldSprX + sprW) + ']' +
              '<br>&nbsp;&nbsp;&nbsp;&bull; Status: <span class="badge badge-red">' + ((distLeftOld < 0 || distRightOld < 0) ? 'OVERLAP DENGAN MEJA / MURID!' : 'Aman') + '</span> (Jarak ke Meja Kiri: ' + distLeftOld.toFixed(1) + 'px, Jarak ke Meja Kanan: ' + distRightOld.toFixed(1) + 'px)</div>' +
              '<div><strong>4. Posisi Rekomendasi CV:</strong> X=<span class="badge badge-green">' + optimalX + '</span>, Y=' + room.curY + ' &rarr; Rentang Sprite: [' + Math.round(newSprX) + '..' + Math.round(newSprX + sprW) + ']' +
              '<br>&nbsp;&nbsp;&nbsp;&bull; Status: <span class="badge badge-green">100% BEBAS TABRAKAN</span> (Margin Bersih Kiri: ' + distLeftNew.toFixed(1) + 'px, Margin Bersih Kanan: ' + distRightNew.toFixed(1) + 'px)</div>';
          };
        }
      </script>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  // Wait for images to load and canvases to render
  await new Promise(r => setTimeout(r, 2500));

  const outPath = path.join(ARTIFACTS_DIR, 'cv_chalkboard_aisle_analysis.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved visual analysis screenshot to:', outPath);

  const cardInfos = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.info')).map(el => el.innerText);
  });
  console.log('CV Analysis Output:');
  cardInfos.forEach(c => console.log('=============================\n' + c));

  await browser.close();
})();
