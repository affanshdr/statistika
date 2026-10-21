const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Rendering Ending Showcase...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 2100 });

  const step1 = fs.readFileSync(path.join(ARTIFACTS_DIR, 'ending_chit_chat_step1_report.png')).toString('base64');
  const step2 = fs.readFileSync(path.join(ARTIFACTS_DIR, 'ending_chit_chat_step2_thanks.png')).toString('base64');
  const step3 = fs.readFileSync(path.join(ARTIFACTS_DIR, 'ending_chit_chat_step3_conclusion.png')).toString('base64');
  const results = fs.readFileSync(path.join(ARTIFACTS_DIR, 'results_page_warm_theme.png')).toString('base64');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      body { background: #0D0805; color: #FEF3C7; padding: 32px; }
      .header { text-align: center; margin-bottom: 28px; }
      .badge { display: inline-block; background: #059669; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; margin-bottom: 10px; }
      .header h1 { font-size: 26px; font-weight: 900; color: #F59E0B; margin-bottom: 8px; }
      .header p { font-size: 14px; color: #D1B89D; max-width: 860px; margin: 0 auto; line-height: 1.5; }
      
      .flow-grid { display: flex; flex-direction: column; gap: 24px; max-width: 1300px; margin: 0 auto; }
      .card { background: #1F140E; border: 1.5px solid #8C6239; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
      .card-header { padding: 12px 20px; background: #2A1810; border-bottom: 1.5px solid #8C6239; display: flex; justify-content: space-between; align-items: center; }
      .card-title { font-size: 15px; font-weight: 800; color: #FEF3C7; display: flex; align-items: center; gap: 8px; }
      .tag { font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 6px; }
      .tag-blue { background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); }
      .tag-green { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
      .tag-gold { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); }
      
      .card-body { padding: 14px; }
      .card-img { width: 100%; border-radius: 8px; display: block; border: 1px solid #4A2B18; }
      .desc { margin-top: 10px; font-size: 13px; color: #E2D5C1; line-height: 1.45; }
      .desc strong { color: #F59E0B; }
      
      .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
      .three-col .card-title { font-size: 13px; }
      .three-col .desc { font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <span class="badge">PEMBARUAN ALUR AKHIRAN & TEMA HASIL LEVEL 1</span>
      <h1>Alur Penutup: Chit-Chat dengan Pak Sutrisno & Desain Rapor Hangat</h1>
      <p>Setelah menyelesaikan Papan Analisis Data, game kini tidak langsung meloncat ke halaman hasil, melainkan kembali ke Ruang Guru untuk percakapan penutup emosional di mana Pak Sutrisno berterima kasih atas penyelamatan nama baik sekolah. Halaman hasil pun telah didesain ulang total dengan palet hangat kayu dan perkamen Indonesia.</p>
    </div>

    <div class="flow-grid">
      <!-- Row 1: 3-Step Concluding Dialogue -->
      <div class="three-col">
        <!-- Step 1 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">1. Stevunt Melapor Hasil</div>
            <span class="tag tag-blue">🎒 Laporan Siswa</span>
          </div>
          <div class="card-body">
            <img class="card-img" src="data:image/png;base64,${step1}" />
            <p class="desc">
              Stevunt melapor bahwa seluruh 24 data terbukti berkisar 4–5 jam/hari, membuktikan klaim viral >8 jam tidak benar.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">2. Apresiasi & Terima Kasih</div>
            <span class="tag tag-green">👨‍🏫 Pak Sutrisno</span>
          </div>
          <div class="card-body">
            <img class="card-img" src="data:image/png;base64,${step2}" />
            <p class="desc">
              Pak Sutrisno memuji ketelitian Stevunt yang membuktikan klaim tersebut <strong>MENYESATKAN (Misleading)</strong>.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">3. Kelulusan Kasus #01</div>
            <span class="tag tag-gold">🏆 Selesai Kasus</span>
          </div>
          <div class="card-body">
            <img class="card-img" src="data:image/png;base64,${step3}" />
            <p class="desc">
              Pak Sutrisno berterima kasih secara tulus dan mengumumkan kelulusan resmi Stevunt sebagai Detektif Statistika.
            </p>
          </div>
        </div>
      </div>

      <!-- Row 2: Warm Themed Results Page -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>🏛️</span> Rapor Hasil Investigasi: Redesain Total Tema Hangat Kayu & Perkamen (Bebas Template Gelap)
          </div>
          <span class="tag tag-gold">Tema Resmi Berkas Kasus</span>
        </div>
        <div class="card-body">
          <img class="card-img" src="data:image/png;base64,${results}" />
          <p class="desc" style="font-size: 13.5px; margin-top: 14px;">
            <strong>Kesesuaian Tema Visual:</strong> Template gelap biru dongker / cyan dari proyek lama telah digantikan 100% oleh kartu berkas perkamen hangat (<em>ivory parchment</em>) dengan lis kayu jati (<code>#8C6239</code>), lencana penghargaan emas, kartu perbandingan verdict resmi, berkas ringkasan naratif kasus, dan tombol kembali ke dashboard bernuansa amber yang mewah.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const shotShowcase = path.join(ARTIFACTS_DIR, 'showcase_alur_akhiran_level1.png');
  await page.screenshot({ path: shotShowcase, fullPage: true });
  console.log('Ending showcase rendered successfully ->', shotShowcase);

  await browser.close();
})();
