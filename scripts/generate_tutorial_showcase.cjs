const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1600 });

  const b64_1 = fs.readFileSync(path.join(ARTIFACTS_DIR, 'tutorial_panel_1_sort.png')).toString('base64');
  const b64_2 = fs.readFileSync(path.join(ARTIFACTS_DIR, 'tutorial_panel_2_modus.png')).toString('base64');
  const b64_3 = fs.readFileSync(path.join(ARTIFACTS_DIR, 'tutorial_panel_3_median.png')).toString('base64');
  const b64_4 = fs.readFileSync(path.join(ARTIFACTS_DIR, 'tutorial_panel_4_mean.png')).toString('base64');

  const pageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; margin: 0; }
        h1 { margin-top: 0; color: #38bdf8; font-size: 24px; }
        p.subtitle { color: #a1a1aa; font-size: 14px; margin-top: -6px; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { background: #18181b; border: 1.5px solid #27272a; border-radius: 12px; overflow: hidden; }
        .header { padding: 12px 16px; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .header-green { background: #064e3b; color: #a7f3d0; }
        .header-blue { background: #0c4a6e; color: #bae6fd; }
        .header-amber { background: #78350f; color: #fde68a; }
        .header-emerald { background: #065f46; color: #a7f3d0; }
        img { display: block; width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <h1>Showcase Panel Tutorial Edukatif Lengkap: Deskripsi + Rumus + Contoh Langsung</h1>
      <p class="subtitle">Setiap tahap kini dilengkapi Definisi Konseptual, Rumus Resmi Matematika, Contoh Langsung Perhitungan Sampel Sederhana, Langkah di Game, dan Tips Statistik.</p>
      
      <div class="grid">
        <div class="card">
          <div class="header header-green">🔢 Tahap 1: Mengurutkan Data (Ascending Order)</div>
          <img src="data:image/png;base64,${b64_1}" />
        </div>
        <div class="card">
          <div class="header header-blue">📊 Tahap 2: Menentukan Modus (Nilai Terbanyak)</div>
          <img src="data:image/png;base64,${b64_2}" />
        </div>
        <div class="card">
          <div class="header header-amber">⚖️ Tahap 3: Menentukan Median (Nilai Tengah Data Genap n=24)</div>
          <img src="data:image/png;base64,${b64_3}" />
        </div>
        <div class="card">
          <div class="header header-emerald">🧮 Tahap 4: Menghitung Rata-Rata (Mean x̄ = Σx ÷ n)</div>
          <img src="data:image/png;base64,${b64_4}" />
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(pageHtml);
  await new Promise(r => setTimeout(r, 1500));

  const outPath = path.join(ARTIFACTS_DIR, 'showcase_semua_tutorial_panel.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved tutorial showcase to:', outPath);

  await browser.close();
})();
