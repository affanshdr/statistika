const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
const beforeImgPath = path.join(ARTIFACTS_DIR, '.user_uploaded/media_1792476071345_a47b5cd1.png');
const afterImgPath = path.join(ARTIFACTS_DIR, 'wali_modal_A2_Pak_Bambang_VII-B.png');
const outPath = path.join(ARTIFACTS_DIR, 'perbandingan_kontras_wali_kelas.png');

(async () => {
  const beforeBase64 = fs.readFileSync(beforeImgPath).toString('base64');
  const afterBase64 = fs.readFileSync(afterImgPath).toString('base64');

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
    .card.before {
      border-color: #EF4444;
    }
    .card.after {
      border-color: #10B981;
    }
    .card-header {
      padding: 14px 18px;
      display: flex;
      justifyContent: space-between;
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
    .desc li {
      margin-bottom: 4px;
    }
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
    <h1>Perbandingan Evaluasi Visual: Modal Wali Kelas (Pak Bambang VII-B)</h1>
    <p>Penyelesaian masalah kontras teks kuning pada kartu kuning terang dan kotak putih yang silau</p>
  </div>

  <div class="grid">
    <div class="card before">
      <div class="card-header">
        <span>❌ SEBELUM (Kuning Terang & Kontras 0)</span>
        <span class="badge" style="background:#EF4444; color:#fff">SULIT DIBACA</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${beforeBase64}" />
      </div>
      <div class="desc">
        <strong>Penyebab Teks Kurang Kelihatan:</strong>
        <ul>
          <li><strong>Teks Soal Hilang Total:</strong> Teks warna krem muda (<code>#FEF3C7</code>) berada di atas background kuning krem muda (<code>#FEF3C7</code> / <code>#FFFBEB</code>) sehingga kontrasnya 0.</li>
          <li><strong>Tombol Batal Hilang:</strong> Teks krem di atas background krem.</li>
          <li><strong>Silau & Sakit Mata:</strong> Kotak pilihan jawaban dan sampel siswa berwarna putih solid murni yang kontras berlebihan / silau.</li>
        </ul>
      </div>
    </div>

    <div class="card after">
      <div class="card-header">
        <span>✅ SESUDAH (Dark Wood Interior + Golden Border)</span>
        <span class="badge" style="background:#10B981; color:#fff">100% KONTRAS TINGGI</span>
      </div>
      <div class="img-wrap">
        <img src="data:image/png;base64,${afterBase64}" />
      </div>
      <div class="desc">
        <strong>Hasil Perbaikan:</strong>
        <ul>
          <li><strong>Teks Soal Tajam & Jelas:</strong> Kartu interior kayu gelap (<code>#23120C</code>) dengan teks putih murni berbayang (<code>#FFFFFF</code> drop shadow).</li>
          <li><strong>Quote Guru Hangat & Elegan:</strong> Warna emas hangat (<code>#FDE68A</code>).</li>
          <li><strong>Harmonis & Tidak Silau:</strong> Kotak pilihan & sampel data bergaya kayu gelap tembus pandang dengan lis kuning amber (<code>#F59E0B</code>).</li>
          <li><strong>Tombol Batal Terlihat Jelas:</strong> Background cokelat tua kayu dengan lis emas.</li>
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
  const bodyHandle = await page.$('body');
  const boundingBox = await bodyHandle.boundingBox();
  await page.screenshot({
    path: outPath,
    clip: {
      x: 0,
      y: 0,
      width: 1400,
      height: Math.ceil(boundingBox.height)
    }
  });
  await browser.close();
  console.log(`Saved comparison image: ${outPath}`);
})();
