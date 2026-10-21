const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1800 });

  const rooms = [
    {
      id: 'A1',
      name: 'Ruang VII-A',
      teacher: 'Bu Sari',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'teaching_mode_vii_a.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_vii_a.png')).toString('base64'),
      cvData: 'Papan Tulis: [469..765], Center: 617 | Posisi: x:620, y:380 | Size: 280 (Tinggi Efektif 155px)',
      desc: 'Ukuran Bu Sari ditingkatkan dari 210 ke 280 agar proporsional dengan siswa yang duduk, dan berdiri tepat di depan papan tulis tengah lorong.'
    },
    {
      id: 'A2',
      name: 'Ruang VII-B',
      teacher: 'Pak Bambang',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'teaching_mode_vii_b.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_vii_b.png')).toString('base64'),
      cvData: 'Papan Tulis: [365..1015], Y: 141..301 | Posisi: x:680, y:350 | Size: 120 (Tinggi 248px)',
      desc: 'Pak Bambang dipindahkan dari tengah kelas (y:430) maju tepat ke depan papan tulis (y:350, x:680) di samping teks soal, size dinaikkan 100 -> 120.'
    },
    {
      id: 'B1',
      name: 'Ruang VIII-A',
      teacher: 'Bu Rina',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'teaching_mode_viii_a.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_viii_a.png')).toString('base64'),
      cvData: 'Papan Tulis: [484..1096], Y: 85..281 | Posisi: x:685, y:350 | Size: 120 (Tinggi 248px)',
      desc: 'Bu Rina dipindahkan dari tengah lorong (y:440) ke depan papan tulis (y:350, x:685) dengan buffer lantai bersih 30px dari meja terdekat, size dinaikkan 100 -> 120.'
    },
    {
      id: 'B2',
      name: 'Ruang VIII-B',
      teacher: 'Pak Setiawan',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'teaching_mode_viii_b.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_viii_b.png')).toString('base64'),
      cvData: 'Papan Tulis: [208..799], Y: 89..274 | Posisi: x:515, y:345 | Size: 120 (Tinggi 248px)',
      desc: 'Pak Setiawan dipindahkan dari lorong tengah (y:445) ke depan papan tulis persis di celah lorong bersih (x:515, y:345), size dinaikkan 100 -> 120.'
    }
  ];

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #0F172A;
        color: #F8FAFC;
        padding: 30px;
      }
      .header {
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #334155;
      }
      .header h1 {
        font-size: 26px;
        color: #38BDF8;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .header p {
        font-size: 14px;
        color: #94A3B8;
        margin-top: 6px;
      }
      .room-card {
        background: #1E293B;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 22px;
        border: 1px solid #334155;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }
      .room-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .room-title h2 {
        font-size: 18px;
        color: #F1F5F9;
      }
      .badge {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
        background: #0284C7;
        color: white;
        font-weight: bold;
      }
      .comparison-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .col {
        background: #0B1120;
        border-radius: 8px;
        padding: 10px;
        border: 1px solid #1E293B;
      }
      .col-header {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .before-title { color: #EF4444; }
      .after-title { color: #10B981; }
      .img-wrapper {
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #334155;
      }
      .img-wrapper img {
        width: 100%;
        display: block;
      }
      .meta {
        margin-top: 10px;
        font-size: 12px;
        color: #CBD5E1;
        background: #0F172A;
        padding: 8px 12px;
        border-radius: 6px;
        border-left: 3px solid #38BDF8;
      }
      .cv-spec {
        font-family: monospace;
        color: #38BDF8;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>👁️ Computer Vision Tuning: Posisi & Proporsi Guru di Depan Papan Tulis</h1>
      <p>Analisis piksel batas papan tulis (Bounding Box) & zona lantai bebas hambatan untuk Ruang VII-A, VII-B, VIII-A, dan VIII-B</p>
    </div>

    ${rooms.map(r => `
      <div class="room-card">
        <div class="room-title">
          <h2>🏫 ${r.name} — ${r.teacher}</h2>
          <span class="badge">CV Verified</span>
        </div>
        <div class="comparison-grid">
          <div class="col">
            <div class="col-header before-title">❌ SEBELUM: Di Tengah Kelas / Terlalu Kecil</div>
            <div class="img-wrapper">
              <img src="data:image/png;base64,${r.beforeImg}" />
            </div>
          </div>
          <div class="col">
            <div class="col-header after-title">✅ SESUDAH: Di Depan Papan Tulis & Proporsional</div>
            <div class="img-wrapper">
              <img src="data:image/png;base64,${r.afterImg}" />
            </div>
          </div>
        </div>
        <div class="meta">
          <div><strong>Hasil Penerapan CV:</strong> ${r.desc}</div>
          <div style="margin-top: 4px;"><strong>Metrik CV:</strong> <span class="cv-spec">${r.cvData}</span></div>
        </div>
      </div>
    `).join('')}
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'load' });
  await new Promise(res => setTimeout(res, 1200));

  const outPath = path.join(ARTIFACTS_DIR, 'perbandingan_cv_guru_lengkap.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved composite comparison image ->', outPath);

  await browser.close();
})();
