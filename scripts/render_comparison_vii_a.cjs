const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
const beforeImg = path.join(ARTIFACTS_DIR, '.user_uploaded/media_1792476513143_e43e9d5b.png');
const afterImg = path.join(ARTIFACTS_DIR, 'new_ruang_vii_a_in_game_1.png');
const outPath = path.join(ARTIFACTS_DIR, 'perbandingan_kelas_vii_a_realistis.png');

(async () => {
  const beforeB64 = fs.readFileSync(beforeImg).toString('base64');
  const afterB64 = fs.readFileSync(afterImg).toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body {
      background: #0F172A;
      color: #F8FAFC;
      padding: 30px;
      width: 1400px;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 800;
      color: #F59E0B;
      letter-spacing: 0.5px;
    }
    .header p {
      font-size: 14px;
      color: #94A3B8;
      margin-top: 6px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .card {
      background: #1E293B;
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid #334155;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    .card.before { border-color: #EF4444; }
    .card.after { border-color: #10B981; }
    .card-header {
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
      font-size: 15px;
    }
    .card.before .card-header {
      background: rgba(239, 68, 68, 0.2);
      color: #FCA5A5;
      border-bottom: 1.5px solid rgba(239, 68, 68, 0.4);
    }
    .card.after .card-header {
      background: rgba(16, 185, 129, 0.2);
      color: #6EE7B7;
      border-bottom: 1.5px solid rgba(16, 185, 129, 0.4);
    }
    .img-wrap {
      padding: 12px;
      background: #020617;
      display: flex;
      justify-content: center;
    }
    .img-wrap img {
      width: 100%;
      height: auto;
      border-radius: 10px;
      display: block;
    }
    .desc {
      padding: 16px 18px;
      font-size: 13px;
      line-height: 1.55;
      color: #CBD5E1;
    }
    .desc ul {
      margin-left: 20px;
      margin-top: 6px;
    }
    .desc li { margin-bottom: 4px; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Perbandingan Evaluasi Visual: Ruang Kelas VII-A</h1>
    <p>Penyesuaian orientasi posisi siswa, penambahan meja & siswa kelas, serta pemeliharaan data survei 5 sampel</p>
  </div>

  <div class="grid">
    <div class="card before">
      <div class="card-header">
        <span>❌ SEBELUM (Siswa Duduk Menghadap Belakang & Kelas Sepi)</span>
        <span class="badge" style="background:#EF4444; color:#fff">KURANG REALISTIS</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${beforeB64}" />
      </div>
      <div class="desc">
        <strong>Kelemahan Tata Letak Sebelumnya:</strong>
        <ul>
          <li><strong>Siswa Menghadap Belakang:</strong> 2 siswa di meja kiri depan duduk membelakangi papan tulis dan guru (menghadap ke arah kamera/pemain).</li>
          <li><strong>Meja Sedikit & Ruangan Kosong:</strong> Hanya ada 4 meja kayu di seluruh kelas, terasa sangat sepi dan kurang merepresentasikan ruang kelas SMP sesungguhnya.</li>
        </ul>
      </div>
    </div>

    <div class="card after">
      <div class="card-header">
        <span>✅ SESUDAH (Semua Siswa Menghadap Papan Tulis & Kelas Terisi Rapi)</span>
        <span class="badge" style="background:#10B981; color:#fff">REALISTIS & SESUAI</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${afterB64}" />
      </div>
      <div class="desc">
        <strong>Penyempurnaan Tata Letak Baru:</strong>
        <ul>
          <li><strong>100% Menghadap Papan Tulis:</strong> Seluruh siswa kini duduk menghadap ke depan/papan tulis dan memperhatikan Bu Sari secara natural.</li>
          <li><strong>Ruangan Penuh & Teratur:</strong> Meja dan siswa bertambah menjadi jajaran 2 baris rapi di sisi kiri dan kanan (total 10 siswa aktif belajar).</li>
          <li><strong>Data Screen Time Tidak Berubah:</strong> Data sampel survei 5 siswa (Adit, Budi, Cici, Deni, Evi) untuk misi statistik tetap utuh 100% sesuai instruksi.</li>
          <li><strong>Lorong Tengah & Navigasi Lega:</strong> Bu Sari berdiri leluasa di tengah tanpa overlap perabot, dan Stevunt dapat bergerak bebas.</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 800, deviceScaleFactor: 1.5 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const body = await page.$('body');
  const box = await body.boundingBox();
  await page.screenshot({
    path: outPath,
    clip: { x: 0, y: 0, width: 1400, height: Math.ceil(box.height) }
  });
  await browser.close();
  console.log(`Saved comparison: ${outPath}`);
})();
