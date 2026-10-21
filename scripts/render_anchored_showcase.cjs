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
      teacher: 'Bu Sari (Wali Kelas VII-A)',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_vii_a.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'anchored_bubble_vii_a_ask.png')).toString('base64'),
      specs: 'Anchor: x:620, headY:200 | Bubble: y:104..186 | Ekor Pointer: [610,185 -> 620,200]',
      desc: 'Balon chat diturunkan dari plafon (sebelumnya menutupi Garuda) menjadi menempel presisi di atas kepala Bu Sari. Ekor balon menyentuh rambut Bu Sari secara mulus.'
    },
    {
      id: 'A2',
      name: 'Ruang VII-B',
      teacher: 'Pak Bambang (Wali Kelas VII-B)',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_vii_b.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'anchored_bubble_vii_b_ask.png')).toString('base64'),
      specs: 'Anchor: x:680, headY:141 | Bubble: y:45..127 | Ekor Pointer: [670,126 -> 680,141]',
      desc: 'Balon chat digeser dan diikat langsung ke koordinat Pak Bambang (x:680). Ekor segitiga menyambung langsung ke kepala Pak Bambang tanpa celah kosong.'
    },
    {
      id: 'B1',
      name: 'Ruang VIII-A',
      teacher: 'Bu Rina (Wali Kelas VIII-A)',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_viii_a.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'anchored_bubble_viii_a_ask.png')).toString('base64'),
      specs: 'Anchor: x:685, headY:141 | Bubble: y:45..127 | Ekor Pointer: [675,126 -> 685,141]',
      desc: 'Balon chat berpusat tepat di atas Bu Rina (x:685). Ekor menyambung ke kepala Bu Rina, memberikan kesan dialog hidup khas RPG retro.'
    },
    {
      id: 'B2',
      name: 'Ruang VIII-B',
      teacher: 'Pak Setiawan (Wali Kelas VIII-B)',
      beforeImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'cv_test_viii_b.png')).toString('base64'),
      afterImg: fs.readFileSync(path.join(ARTIFACTS_DIR, 'anchored_bubble_viii_b_ask.png')).toString('base64'),
      specs: 'Anchor: x:515, headY:136 | Bubble: y:40..122 | Ekor Pointer: [505,121 -> 515,136]',
      desc: 'Balon chat diikat langsung ke kepala Pak Setiawan (x:515), bebas dari tabrakan meja dan papan tulis di sekitarnya.'
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
        background: #10B981;
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
      .after-title { color: #38BDF8; }
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
      <h1>💬 Solusi 1: Anchored Cloud Chat (Menyatu Pas di Atas Kepala Karakter)</h1>
      <p>Balon percakapan kini diikat secara dinamis ke koordinat kepala guru & karakter, dengan ekor lancip yang menyambung langsung tanpa celah mengambang</p>
    </div>

    ${rooms.map(r => `
      <div class="room-card">
        <div class="room-title">
          <h2>🏫 ${r.name} — ${r.teacher}</h2>
          <span class="badge">Anchored & Verified</span>
        </div>
        <div class="comparison-grid">
          <div class="col">
            <div class="col-header before-title">❌ SEBELUM: Mengambang di Plafon / Terpisah Jauh</div>
            <div class="img-wrapper">
              <img src="data:image/png;base64,${r.beforeImg}" />
            </div>
          </div>
          <div class="col">
            <div class="col-header after-title">✅ SESUDAH: Menyatu Pas di Atas Kepala Guru</div>
            <div class="img-wrapper">
              <img src="data:image/png;base64,${r.afterImg}" />
            </div>
          </div>
        </div>
        <div class="meta">
          <div><strong>Hasil Penerapan:</strong> ${r.desc}</div>
          <div style="margin-top: 4px;"><strong>Koordinat Anchor:</strong> <span class="cv-spec">${r.specs}</span></div>
        </div>
      </div>
    `).join('')}
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'load' });
  await new Promise(res => setTimeout(res, 1000));

  const outPath = path.join(ARTIFACTS_DIR, 'perbandingan_cloud_chat_anchored.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved showcase ->', outPath);

  await browser.close();
})();
