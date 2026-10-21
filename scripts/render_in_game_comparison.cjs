const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function renderInGameComparison() {
  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Read gate image as base64
  const gateBase64 = fs.readFileSync('public/Assets/Building/Gerbang.jpg').toString('base64');
  const gateDataUrl = `data:image/jpeg;base64,${gateBase64}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
      background: #000;
    }
    .screen {
      position: relative;
      width: 1280px;
      height: 720px;
      background-image: url('${gateDataUrl}');
      background-size: cover;
      background-position: center;
    }
    .split-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 4px;
      background: rgba(245, 158, 11, 0.8);
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.9);
      z-index: 100;
    }
    .side-label-left {
      position: absolute;
      top: 20px;
      left: 40px;
      background: rgba(0, 0, 0, 0.75);
      border: 1.5px solid #EF4444;
      color: #FCA5A5;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 14px;
      z-index: 90;
      backdrop-filter: blur(4px);
    }
    .side-label-right {
      position: absolute;
      top: 20px;
      right: 40px;
      background: rgba(0, 0, 0, 0.8);
      border: 1.5px solid #10B981;
      color: #6EE7B7;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 14px;
      z-index: 90;
      backdrop-filter: blur(4px);
    }

    /* --- LEFT SIDE: CURRENT UI (White inside, brown outside) --- */
    .left-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      padding: 90px 40px;
      display: flex;
      flex-direction: column;
      gap: 30px;
      clip-path: inset(0 0 0 0);
    }

    .bubble-old {
      background: linear-gradient(135deg, #FFFDF7 0%, #FEF3C7 100%);
      border: 3px solid #8C6239;
      border-radius: 20px;
      padding: 20px 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      width: 90%;
    }
    .bubble-old-name {
      color: #0D9488;
      font-weight: 900;
      font-size: 15px;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .bubble-old-text {
      color: #362014;
      font-size: 17px;
      font-weight: 800;
      line-height: 1.45;
      margin: 0;
    }
    .bubble-old-foot {
      color: #0D9488;
      font-size: 13px;
      font-weight: 800;
      text-align: right;
      margin-top: 10px;
    }

    .pill-old {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFDF7;
      border: 2px solid #8C6239;
      border-radius: 24px;
      padding: 8px 20px;
      color: #362014;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      width: fit-content;
    }

    .quest-old {
      background: #FFFDF7;
      border: 2px solid #8C6239;
      border-radius: 14px;
      padding: 14px 18px;
      width: 140px;
      text-align: center;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    .quest-old-badge {
      background: #D97706;
      color: #FFF;
      font-size: 10px;
      font-weight: 900;
      border-radius: 12px;
      padding: 3px 8px;
      display: inline-block;
      margin-bottom: 6px;
    }
    .quest-old-title {
      color: #362014;
      font-size: 15px;
      font-weight: 900;
      margin-top: 4px;
    }

    /* --- RIGHT SIDE: USER PROPOSED (Brown inside, golden yellow outside) --- */
    .right-container {
      position: absolute;
      top: 0;
      left: 50%;
      width: 50%;
      height: 100%;
      padding: 90px 40px;
      display: flex;
      flex-direction: column;
      gap: 30px;
      clip-path: inset(0 0 0 0);
    }

    .bubble-new {
      background: linear-gradient(145deg, rgba(45, 26, 18, 0.94) 0%, rgba(26, 13, 8, 0.97) 100%);
      border: 2.5px solid #F59E0B;
      border-radius: 20px;
      padding: 20px 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 1px 2px rgba(251,191,36,0.35);
      backdrop-filter: blur(8px);
      width: 90%;
    }
    .bubble-new-name {
      color: #FDE047;
      font-weight: 900;
      font-size: 15px;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    }
    .bubble-new-text {
      color: #FEF3C7;
      font-size: 17px;
      font-weight: 700;
      line-height: 1.45;
      margin: 0;
      text-shadow: 0 1px 3px rgba(0,0,0,0.9);
    }
    .bubble-new-foot {
      color: #FBBF24;
      font-size: 13px;
      font-weight: 800;
      text-align: right;
      margin-top: 10px;
    }

    .pill-new {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(45, 26, 18, 0.94) 0%, rgba(26, 13, 8, 0.97) 100%);
      border: 2px solid #F59E0B;
      border-radius: 24px;
      padding: 8px 20px;
      color: #FEF3C7;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 6px 14px rgba(0,0,0,0.5), inset 0 1px 2px rgba(251,191,36,0.25);
      backdrop-filter: blur(6px);
      width: fit-content;
    }

    .quest-new {
      background: linear-gradient(145deg, rgba(45, 26, 18, 0.94) 0%, rgba(26, 13, 8, 0.97) 100%);
      border: 2px solid #F59E0B;
      border-radius: 14px;
      padding: 14px 18px;
      width: 140px;
      text-align: center;
      box-shadow: 0 8px 20px rgba(0,0,0,0.5), inset 0 1px 2px rgba(251,191,36,0.3);
      backdrop-filter: blur(6px);
    }
    .quest-new-badge {
      background: #F59E0B;
      color: #1F130B;
      font-size: 10px;
      font-weight: 900;
      border-radius: 12px;
      padding: 3px 8px;
      display: inline-block;
      margin-bottom: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .quest-new-title {
      color: #FDE047;
      font-size: 15px;
      font-weight: 900;
      margin-top: 4px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.7);
    }
  </style>
</head>
<body>
  <div class="screen">
    <div class="split-line"></div>
    <div class="side-label-left">❌ SAAT INI: Putih di Dalam, Cokelat di Luar</div>
    <div class="side-label-right">✅ USULAN USER: Cokelat di Dalam, Kuning Emas di Luar</div>

    <!-- LEFT: OLD -->
    <div class="left-container">
      <div class="bubble-old">
        <div class="bubble-old-name">STEVUNT</div>
        <p class="bubble-old-text">"Waduh, gawat! Bel sekolah udah bunyi dari tadi, aku telat nih!"</p>
        <div class="bubble-old-foot">[ Klik / Spasi ▶ ]</div>
      </div>

      <div class="pill-old">
        <span>👮</span>
        <span>Pak Joko (Satpam)</span>
      </div>

      <div class="quest-old">
        <div class="quest-old-badge">Temui Pak</div>
        <div style="font-size: 32px;">📜</div>
        <div class="quest-old-title">Misi</div>
      </div>
    </div>

    <!-- RIGHT: NEW -->
    <div class="right-container">
      <div class="bubble-new">
        <div class="bubble-new-name">STEVUNT</div>
        <p class="bubble-new-text">"Waduh, gawat! Bel sekolah udah bunyi dari tadi, aku telat nih!"</p>
        <div class="bubble-new-foot">[ Klik / Spasi ▶ ]</div>
      </div>

      <div class="pill-new">
        <span>👮</span>
        <span>Pak Joko (Satpam)</span>
      </div>

      <div class="quest-new">
        <div class="quest-new-badge">Temui Pak</div>
        <div style="font-size: 32px;">📜</div>
        <div class="quest-new-title">Misi</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const outPath = path.join(artifactDir, 'in_game_ui_comparison_gate.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved in-game comparison to:', outPath);

  await browser.close();
}

renderInGameComparison().catch(console.error);
