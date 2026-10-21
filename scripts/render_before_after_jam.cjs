const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 420 });

  const beforeBase64 = fs.readFileSync('C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792566644457_66b4f3c1.png').toString('base64');
  const fullScreenBase64 = fs.readFileSync('C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/verifikasi_satuan_jam_survei.png').toString('base64');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #090D16;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #F8FAFC;
          padding: 24px;
        }
        .header { margin-bottom: 20px; }
        .header h1 { font-size: 20px; font-weight: 800; color: #F1F5F9; }
        .header p { font-size: 13px; color: #94A3B8; margin-top: 4px; }
        .grid { display: flex; gap: 20px; }
        .card {
          flex: 1;
          border-radius: 16px;
          padding: 16px;
          background: #18110B;
        }
        .card.before { border: 2px solid #EF4444; }
        .card.after { border: 2px solid #10B981; }
        .tag {
          display: inline-block;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 12px;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .tag.before { background: rgba(239, 68, 68, 0.18); color: #F87171; }
        .tag.after { background: rgba(16, 185, 129, 0.18); color: #34D399; }
        .img-wrap {
          border-radius: 12px;
          overflow: hidden;
          background: #23120C;
          border: 1px solid rgba(245, 158, 11, 0.3);
          height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .img-wrap img { width: 100%; height: auto; object-fit: contain; }
        .crop-wrap {
          border-radius: 12px;
          overflow: hidden;
          background: #23120C;
          border: 1px solid rgba(245, 158, 11, 0.3);
          height: 190px;
          position: relative;
        }
        .crop-wrap img {
          position: absolute;
          width: 250%;
          left: -76%;
          top: -85%;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔍 Perbandingan Penulisan Satuan Waktu Layar Siswa</h1>
        <p>Mengubah singkatan <code>"h"</code> menjadi <code>"jam"</code> agar lebih jelas, ramah siswa SMP, dan tidak ambigu.</p>
      </div>
      <div class="grid">
        <div class="card before">
          <div class="tag before">❌ SEBELUM: Menggunakan "h" (Ambigu)</div>
          <div class="img-wrap">
            <img src="data:image/png;base64,${beforeBase64}" />
          </div>
        </div>
        <div class="card after">
          <div class="tag after">✅ SESUDAH: Menggunakan "jam" (Jelas & Baku)</div>
          <div class="crop-wrap">
            <img src="data:image/png;base64,${fullScreenBase64}" />
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 600));

  const out = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/perbandingan_satuan_jam.png';
  await page.screenshot({ path: out });
  console.log('Saved comparison to:', out);

  await browser.close();
})();
