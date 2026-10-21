const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Rendering Pedagogical Corkboard Showcase...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1600 });

  // Read images as base64
  const modusImg = fs.readFileSync(path.join(ARTIFACTS_DIR, 'corkboard_modus_order_labels.png')).toString('base64');
  const medianUnrevealedImg = fs.readFileSync(path.join(ARTIFACTS_DIR, 'corkboard_median_unrevealed.png')).toString('base64');
  const medianWrongImg = fs.readFileSync(path.join(ARTIFACTS_DIR, 'corkboard_median_wrong_hint.png')).toString('base64');
  const ruangGuruImg = fs.readFileSync(path.join(ARTIFACTS_DIR, 'ruang_guru_live_idle.png')).toString('base64');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      body { background: #0F172A; color: #F8FAFC; padding: 32px; }
      .header { text-align: center; margin-bottom: 28px; }
      .header h1 { font-size: 26px; font-weight: 900; color: #F59E0B; margin-bottom: 8px; letter-spacing: -0.5px; }
      .header p { font-size: 14px; color: #94A3B8; max-width: 850px; margin: 0 auto; line-height: 1.5; }
      .badge { display: inline-block; background: #059669; color: white; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
      
      .grid { display: flex; flex-direction: column; gap: 24px; max-width: 1300px; margin: 0 auto; }
      .card { background: #1E293B; border-radius: 14px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
      .card-header { padding: 14px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
      .card-title { font-size: 16px; font-weight: 800; color: #F1F5F9; display: flex; align-items: center; gap: 8px; }
      .card-tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
      .tag-green { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
      .tag-amber { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); }
      .tag-blue { background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); }
      
      .card-body { padding: 16px; }
      .card-img { width: 100%; border-radius: 8px; display: block; border: 1px solid #334155; }
      .card-desc { margin-top: 12px; font-size: 13px; color: #CBD5E1; line-height: 1.5; padding: 0 4px; }
      .card-desc strong { color: #F59E0B; }
      
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    </style>
  </head>
  <body>
    <div class="header">
      <span class="badge">EVALUASI & PENERAPAN REKOMENDASI PEDAGOGIS</span>
      <h1>Pembaruan Corkboard Papan Analisis Data & Proporsi Karakter</h1>
      <p>Sesuai saran pedagogis: Nilai tengah tidak lagi dibocorkan / disorot otomatis sebelum dijawab, 24 bulatan data kini dilengkapi label nomor urut urutan (#1 s/d #24), dan pertanyaan menuntut siswa aktif mencari data ke-12 dan ke-13 secara mandiri.</p>
    </div>

    <div class="grid">
      <!-- Section 1: Corkboard Modus -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>🎯</span> Tahap 2: Modus — Dilengkapi Label Urutan (#1 s.d. #24)
          </div>
          <span class="card-tag tag-blue">Membantu Menghitung Rentang Frekuensi</span>
        </div>
        <div class="card-body">
          <img class="card-img" src="data:image/png;base64,${modusImg}" />
          <p class="card-desc">
            <strong>Keunggulan Pedagogis:</strong> Seluruh 24 data yang telah terurut kini memiliki badge nomor urut kayu gelap (<code>#1</code> sampai <code>#24</code>). Siswa dapat dengan mudah menghitung kelompok frekuensi (contoh: angka <strong>4</strong> berjajar dari <code>#8</code> hingga <code>#12</code> = 5 data) tanpa perlu menghitung manual satu per satu dari pojok kiri atas.
          </p>
        </div>
      </div>

      <!-- Section 2: Corkboard Median -->
      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>⚖️</span> Tahap 3: Median — Nilai Tengah Tidak Dibocorkan
            </div>
            <span class="card-tag tag-amber">Tantangan Kognitif Mandiri</span>
          </div>
          <div class="card-body">
            <img class="card-img" src="data:image/png;base64,${medianUnrevealedImg}" />
            <p class="card-desc">
              <strong>Sebelumnya:</strong> Bulatan ke-12 dan ke-13 langsung menyala emas terang dan teks soal langsung menyebutkan angkanya <em>"(4) dan (4)"</em> sehingga siswa tidak berpikir.<br/>
              <strong>Sekarang:</strong> Bulatan tampil seragam. Soal hanya memandu siswa mencari bulatan berlabel <code>#12</code> dan <code>#13</code> lalu menghitung rata-ratanya sendiri!
            </p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>💡</span> Scaffolding Bertahap (Bila Siswa Salah)
            </div>
            <span class="card-tag tag-green">Bimbingan Tanpa Spoiler</span>
          </div>
          <div class="card-body">
            <img class="card-img" src="data:image/png;base64,${medianWrongImg}" />
            <p class="card-desc">
              <strong>Umpan Balik Cerdas:</strong> Jika siswa keliru memilih opsi, kartu tips berwarna merah muda memberikan petunjuk konseptual: <em>"Cek angka pada bulatan berlabel urutan #12 dan #13, lalu jumlahkan kedua angka tersebut dan bagi 2"</em> tanpa membocorkan angka hasilnya.
            </p>
          </div>
        </div>
      </div>

      <!-- Section 3: Ruang Guru Natural Scale -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>🏫</span> Ruang Guru: Proporsi Realistis Stevunt & Pak Sutrisno (Bebas Tabrakan)
          </div>
          <span class="card-tag tag-green">Presisi Computer Vision</span>
        </div>
        <div class="card-body">
          <img class="card-img" src="data:image/png;base64,${ruangGuruImg}" />
          <p class="card-desc">
            <strong>Proporsi Karakter:</strong> Ukuran Stevunt telah disesuaikan menjadi ~222px (sekitar 85% tinggi Pak Sutrisno yang berukuran 260px) sehingga tampak natural sebagai siswa SMP di hadapan guru dewasa. Keduanya berdiri di lantai bersih tanpa menyentuh meja kerja, dispenser, atau tas ransel.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const shotShowcase = path.join(ARTIFACTS_DIR, 'showcase_corkboard_pedagogis.png');
  await page.screenshot({ path: shotShowcase, fullPage: true });
  console.log('Showcase rendered successfully ->', shotShowcase);

  await browser.close();
})();
