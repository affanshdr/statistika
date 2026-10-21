const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function renderComparison() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750 });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 30px;
      background: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #F3F4F6;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 26px;
      color: #F59E0B;
    }
    .header p {
      margin: 0;
      font-size: 15px;
      color: #9CA3AF;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .col {
      background: #1F2937;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .col-title {
      font-size: 18px;
      font-weight: 800;
      padding-bottom: 12px;
      border-bottom: 1px solid #374151;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-bad {
      background: #7F1D1D;
      color: #FCA5A5;
      font-size: 12px;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .badge-good {
      background: #065F46;
      color: #6EE7B7;
      font-size: 12px;
      padding: 3px 8px;
      border-radius: 6px;
    }

    /* --- STYLE A: CURRENT (White inside, brown outside) --- */
    .bubble-a {
      background: linear-gradient(135deg, #FFFDF7 0%, #FEF3C7 100%);
      border: 3px solid #8C6239;
      border-radius: 18px;
      padding: 16px 20px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
      position: relative;
    }
    .bubble-a-name {
      color: #0D9488;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .bubble-a-text {
      color: #362014;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.4;
      margin: 0;
    }
    .bubble-a-prompt {
      color: #0D9488;
      font-size: 12px;
      font-weight: 800;
      text-align: right;
      margin-top: 8px;
    }

    .pill-a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFDF7;
      border: 2px solid #8C6239;
      border-radius: 20px;
      padding: 6px 16px;
      color: #362014;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 3px 8px rgba(0,0,0,0.25);
    }

    .quest-a {
      background: #FFFDF7;
      border: 2px solid #8C6239;
      border-radius: 12px;
      padding: 14px;
      width: 140px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .quest-a-badge {
      background: #D97706;
      color: #FFF;
      font-size: 10px;
      font-weight: 800;
      border-radius: 12px;
      padding: 2px 8px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .quest-a-title {
      color: #362014;
      font-size: 14px;
      font-weight: 900;
      margin-top: 6px;
    }

    /* --- STYLE B: PROPOSED (Rich Dark Brown inside, Golden Yellow outside) --- */
    .bubble-b {
      background: linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%);
      border: 2.5px solid #F59E0B;
      border-radius: 18px;
      padding: 16px 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 2px rgba(251,191,36,0.3);
      position: relative;
    }
    .bubble-b-name {
      color: #FDE047;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.6);
    }
    .bubble-b-text {
      color: #FEF3C7;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.4;
      margin: 0;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    .bubble-b-prompt {
      color: #FBBF24;
      font-size: 12px;
      font-weight: 800;
      text-align: right;
      margin-top: 8px;
    }

    .pill-b {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #2D1A12 0%, #1A0D08 100%);
      border: 2px solid #F59E0B;
      border-radius: 20px;
      padding: 6px 16px;
      color: #FEF3C7;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 0 1px 2px rgba(251,191,36,0.25);
    }

    .quest-b {
      background: linear-gradient(145deg, #2D1A12 0%, #1A0D08 100%);
      border: 2px solid #F59E0B;
      border-radius: 12px;
      padding: 14px;
      width: 140px;
      text-align: center;
      box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 2px rgba(251,191,36,0.25);
    }
    .quest-b-badge {
      background: #F59E0B;
      color: #1F130B;
      font-size: 10px;
      font-weight: 900;
      border-radius: 12px;
      padding: 3px 8px;
      display: inline-block;
      margin-bottom: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .quest-b-title {
      color: #FDE047;
      font-size: 14px;
      font-weight: 900;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Perbandingan Desain UI Dialog & HUD</h1>
    <p>Evaluasi ergonomi visual & kenyamanan mata (Eye Strain / Visual Hierarchy)</p>
  </div>

  <div class="grid">
    <!-- SEBELUM -->
    <div class="col">
      <div class="col-title">
        <span>Gaya Saat Ini</span>
        <span class="badge-bad">Silau & Kontras Terbalik</span>
      </div>
      <p style="font-size: 13px; color: #9CA3AF; margin: 0;">Latar putih/krem pucat di dalam dengan garis tepi cokelat gelap tebal di luar.</p>
      
      <!-- Dialogue Bubble A -->
      <div class="bubble-a">
        <div class="bubble-a-name">STEVUNT</div>
        <p class="bubble-a-text">"Waduh, gawat! Bel sekolah udah bunyi dari tadi, aku telat nih!"</p>
        <div class="bubble-a-prompt">[ Klik / Spasi ▶ ]</div>
      </div>

      <!-- Nametag Pill A -->
      <div>
        <div class="pill-a">
          <span>👮</span>
          <span>Pak Joko (Satpam)</span>
        </div>
      </div>

      <!-- Quest Card A -->
      <div>
        <div class="quest-a">
          <div class="quest-a-badge">Temui Pak</div>
          <div style="font-size: 28px;">📜</div>
          <div class="quest-a-title">Misi</div>
        </div>
      </div>
    </div>

    <!-- SESUDAH / SARAN USER -->
    <div class="col">
      <div class="col-title">
        <span>Saran Pengguna (Rekomendasi)</span>
        <span class="badge-good">Nyaman di Mata & Otentik RPG</span>
      </div>
      <p style="font-size: 13px; color: #9CA3AF; margin: 0;">Latar cokelat kayu hangat (*warm dark wood*) di dalam dengan garis tepi emas/kuning (*golden amber*) di luar.</p>

      <!-- Dialogue Bubble B -->
      <div class="bubble-b">
        <div class="bubble-b-name">STEVUNT</div>
        <p class="bubble-b-text">"Waduh, gawat! Bel sekolah udah bunyi dari tadi, aku telat nih!"</p>
        <div class="bubble-b-prompt">[ Klik / Spasi ▶ ]</div>
      </div>

      <!-- Nametag Pill B -->
      <div>
        <div class="pill-b">
          <span>👮</span>
          <span>Pak Joko (Satpam)</span>
        </div>
      </div>

      <!-- Quest Card B -->
      <div>
        <div class="quest-b">
          <div class="quest-b-badge">Temui Pak</div>
          <div style="font-size: 28px;">📜</div>
          <div class="quest-b-title">Misi</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const outPath = path.join(artifactDir, 'ui_theme_comparison_brown_vs_yellow.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved comparison to:', outPath);

  await browser.close();
}

renderComparison().catch(console.error);
