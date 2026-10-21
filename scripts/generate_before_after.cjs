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

  const newImgA = path.join(ARTIFACTS_DIR, 'verifikasi_viii_a_optimal.png');
  const newImgB = path.join(ARTIFACTS_DIR, 'verifikasi_viii_b_optimal.png');

  const b64UserA = fs.readFileSync(userImgA).toString('base64');
  const b64UserB = fs.readFileSync(userImgB).toString('base64');
  const b64NewA = fs.readFileSync(newImgA).toString('base64');
  const b64NewB = fs.readFileSync(newImgB).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; margin: 0; }
        h1 { margin-top: 0; color: #38bdf8; font-size: 24px; }
        .section { background: #18181b; padding: 20px; border-radius: 12px; margin-bottom: 28px; border: 1px solid #27272a; }
        h2 { margin-top: 0; color: #fbbf24; font-size: 18px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
        .panel { background: #000; border-radius: 8px; overflow: hidden; border: 1px solid #3f3f46; }
        .title { padding: 10px 14px; font-weight: bold; font-size: 13px; font-family: monospace; display: flex; align-items: center; gap: 8px; }
        .title-red { background: #7f1d1d; color: #fecaca; }
        .title-green { background: #14532d; color: #bbf7d0; }
        img { display: block; width: 100%; height: auto; }
        .caption { padding: 10px 14px; font-size: 12px; color: #a1a1aa; background: #121215; line-height: 1.5; }
      </style>
    </head>
    <body>
      <h1>Perbandingan Hasil Analisis Computer Vision & Penyelarasan Posisi Guru</h1>
      
      <!-- RUANG VIII-A -->
      <div class="section">
        <h2>1. Ruang Kelas VIII-A (Bu Rina)</h2>
        <div class="grid">
          <div class="panel">
            <div class="title title-red">&#10060; SEBELUM (x: 685, y: 350) - Terlalu Geser Kanan</div>
            <img src="data:image/png;base64,${b64UserA}" />
            <div class="caption">
              <strong>Masalah:</strong> Posisi Bu Rina berada di x: 685, menyebabkan rok dan tubuhnya menabrak/tumpang tindih langsung dengan meja siswa berhijab di baris kanan.
            </div>
          </div>
          <div class="panel">
            <div class="title title-green">&#9989; SESUDAH CV (x: 620, y: 348) - Tepat di Garis Sumbu Lorong</div>
            <img src="data:image/png;base64,${b64NewA}" />
            <div class="caption">
              <strong>Solusi:</strong> Bu Rina dipindahkan ke x: 620, y: 348. Berdiri tegak tepat di tengah lorong jalan antara kelompok meja kiri dan kanan, bebas tumpang tindih 100%.
            </div>
          </div>
        </div>
      </div>

      <!-- RUANG VIII-B -->
      <div class="section">
        <h2>2. Ruang Kelas VIII-B (Pak Setiawan)</h2>
        <div class="grid">
          <div class="panel">
            <div class="title title-red">&#10060; SEBELUM (x: 515, y: 345) - Terlalu Geser Kiri</div>
            <img src="data:image/png;base64,${b64UserB}" />
            <div class="caption">
              <strong>Masalah:</strong> Posisi Pak Setiawan berada di x: 515, menabrak dan menutupi meja siswa laki-laki di barisan sebelah kiri.
            </div>
          </div>
          <div class="panel">
            <div class="title title-green">&#9989; SESUDAH CV (x: 615, y: 345) - Tepat di Garis Sumbu Lorong</div>
            <img src="data:image/png;base64,${b64NewB}" />
            <div class="caption">
              <strong>Solusi:</strong> Pak Setiawan digeser ke x: 615, y: 345. Berdiri simetris di tengah koridor lorong jalan utama, bebas dari tabrakan meja murid di sisi kiri maupun kanan.
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  await new Promise(r => setTimeout(r, 2000));

  const outPath = path.join(ARTIFACTS_DIR, 'perbandingan_posisi_guru_sebelum_sesudah.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved before/after comparison to:', outPath);

  await browser.close();
})();
