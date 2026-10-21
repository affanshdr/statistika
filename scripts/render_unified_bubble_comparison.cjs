const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
const userImgPath = path.join(ARTIFACTS_DIR, '.user_uploaded', 'media_1792528975467_bf613672.png');
const fixedImgVIIAPath = path.join(ARTIFACTS_DIR, 'unified_bubble_vii_a_player.png');
const fixedImgVIIBPath = path.join(ARTIFACTS_DIR, 'unified_bubble_vii_b_player.png');
const fixedImgVIIBAskPath = path.join(ARTIFACTS_DIR, 'unified_bubble_vii_b_ask.png');

function toBase64(p) {
  if (!fs.existsSync(p)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
}

const userBase64 = toBase64(userImgPath);
const fixedVIIABase64 = toBase64(fixedImgVIIAPath);
const fixedVIIBBase64 = toBase64(fixedImgVIIBPath);
const fixedVIIBAskBase64 = toBase64(fixedImgVIIBAskPath);

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0f172a;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .header {
    text-align: center;
    margin-bottom: 24px;
  }
  .title {
    font-size: 26px;
    font-weight: 900;
    color: #38bdf8;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .subtitle {
    font-size: 14px;
    color: #94a3b8;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  .card {
    background: #1e293b;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    border: 2px solid #334155;
  }
  .card.error-card {
    border-color: #ef4444;
  }
  .card.success-card {
    border-color: #10b981;
  }
  .card-header {
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .error-header {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }
  .success-header {
    background: rgba(16, 185, 129, 0.2);
    color: #6ee7b7;
  }
  .badge {
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 900;
  }
  .badge-danger {
    background: #ef4444;
    color: #fff;
  }
  .badge-success {
    background: #10b981;
    color: #fff;
  }
  .img-container {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .img-container img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .desc {
    padding: 12px 16px;
    font-size: 12.5px;
    line-height: 1.45;
    color: #cbd5e1;
  }
  .desc b {
    color: #f1f5f9;
  }
  .footer-banner {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.15));
    border: 1.5px solid #10b981;
    border-radius: 12px;
    padding: 14px 20px;
    font-size: 13px;
    line-height: 1.5;
    color: #e2e8f0;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="title">SOLUSI CLOUD CHAT MENYATU (SPEECH BUBBLE &amp; Z-INDEX FIX)</div>
    <div class="subtitle">Perbandingan Visual Sebelum vs Sesudah Perbaikan Arsitektur Layer SVG &amp; Path Gelembung Komik</div>
  </div>

  <div class="grid">
    <!-- SEBELUM -->
    <div class="card error-card">
      <div class="card-header error-header">
        <span>❌ SEBELUM: Tumpang Tindih / Tertimpa Karakter</span>
        <span class="badge badge-danger">BUG LAPORAN USER</span>
      </div>
      <div class="img-container">
        <img src="${userBase64}" />
      </div>
      <div class="desc">
        <b>Masalah yang Terjadi:</b><br/>
        1. <i>SVG DOM Render Order:</i> Bubble dirender di dalam <code>room-objects</code> sebelum <code>&lt;PlayerCharacter&gt;</code>, sehingga sprite Stevunt digambar <b>menimpa teks dialog</b>.<br/>
        2. <i>Head Y Offset Mismatch:</i> Nilai kepala Stevunt di-hardcode <code>y - 170</code> padahal ukuran Stevunt di kelas adalah ~400px (kepala ada di <code>y - 315</code>), membuat kotak jatuh persis di badan/muka Stevunt.<br/>
        3. Ekor dan kotak terpisah elemennya sehingga tidak menyatu.
      </div>
    </div>

    <!-- SESUDAH VII-A -->
    <div class="card success-card">
      <div class="card-header success-header">
        <span>✅ SESUDAH: Menyatu Sempurna &amp; 100% Bebas Tertimpa</span>
        <span class="badge badge-success">PERBAIKAN AKTIF</span>
      </div>
      <div class="img-container">
        <img src="${fixedVIIABase64}" />
      </div>
      <div class="desc">
        <b>Solusi Arsitektur yang Diterapkan:</b><br/>
        1. <i>Top-Level Dialogue Overlay Layer:</i> Seluruh dialog cutscene dipindahkan ke layer teratas setelah <code>&lt;PlayerCharacter&gt;</code>. <b>Sprite karakter tidak akan pernah bisa menimpa dialog!</b><br/>
        2. <i>Dynamic Head Tracking:</i> Ketinggian kepala Stevunt dihitung dinamis <code>charPos.y - charSize * 0.78</code> sehingga bubble melayang rapi di atas kepala.<br/>
        3. <i>Single Seamless SVG Path:</i> Kotak bubble dan ekor digambar sebagai <b>1 garis path utuh</b> tanpa celah sambungan.
      </div>
    </div>
  </div>

  <div class="grid">
    <!-- SESUDAH VII-B GURU -->
    <div class="card success-card">
      <div class="card-header success-header">
        <span>✅ GURU BERBICARA: Ekor Menyatu ke Kepala Guru (Pak Bambang)</span>
        <span class="badge badge-success">RUANG VII-B</span>
      </div>
      <div class="img-container">
        <img src="${fixedVIIBAskBase64}" />
      </div>
      <div class="desc">
        <b>Guru Berbicara (Teacher Ask):</b><br/>
        Ekor gelembung terhubung presisi ke kepala guru di depan papan tulis. Teks dialog kontras tinggi dengan badge nama guru emas <code>#FDE047</code>.
      </div>
    </div>

    <!-- SESUDAH VII-B SISWA -->
    <div class="card success-card">
      <div class="card-header success-header">
        <span>✅ SISWA MENJAWAB: Ekor Menyatu ke Kepala Stevunt</span>
        <span class="badge badge-success">RUANG VII-B</span>
      </div>
      <div class="img-container">
        <img src="${fixedVIIBBase64}" />
      </div>
      <div class="desc">
        <b>Siswa Berbicara (Player Explain):</b><br/>
        Ekor gelembung berpindah otomatis dan menyatu ke kepala Stevunt dengan badge biru langit <code>#38BDF8</code>. Dialog 100% terbaca jelas tanpa tertutup karakter.
      </div>
    </div>
  </div>

  <div class="footer-banner">
    <b>Ringkasan Teknis:</b> Gelembung percakapan kini menggunakan generator <code>getSpeechBubblePath()</code> yang menghasilkan 1 single continuous SVG path dengan border emas <code>#F59E0B</code> (atau hijau <code>#10B981</code> saat konfirmasi), bayangan <code>drop-shadow(0 12px 30px rgba(0,0,0,0.75))</code>, dan urutan DOM z-index paling atas dalam SVG.
  </div>
</body>
</html>
`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 1100 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const outPath = path.join(ARTIFACTS_DIR, 'perbandingan_cloud_chat_unified.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved Comparison Showcase ->', outPath);
  await browser.close();
})();
