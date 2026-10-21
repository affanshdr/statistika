const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1600 });

  const shotCooldown = fs.readFileSync(path.join(ARTIFACTS_DIR, 'quiz_antispam_cooldown_vii_a.png')).toString('base64');
  const shotViiA = fs.readFileSync(path.join(ARTIFACTS_DIR, 'quiz_unique_vii_a.png')).toString('base64');
  const shotViiB = fs.readFileSync(path.join(ARTIFACTS_DIR, 'quiz_unique_vii_b.png')).toString('base64');
  const shotViiiA = fs.readFileSync(path.join(ARTIFACTS_DIR, 'quiz_unique_viii_a.png')).toString('base64');
  const shotViiiB = fs.readFileSync(path.join(ARTIFACTS_DIR, 'quiz_unique_viii_b.png')).toString('base64');

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
      .card {
        background: #1E293B;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 20px;
        border: 1px solid #334155;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .card-header h2 {
        font-size: 18px;
        color: #F1F5F9;
      }
      .badge {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
        background: #0284C7;
        color: white;
        font-weight: bold;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .img-box {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #334155;
      }
      .img-box img {
        width: 100%;
        display: block;
      }
      .feature-box {
        background: #0B1120;
        border-radius: 8px;
        padding: 12px 16px;
        border-left: 4px solid #10B981;
        margin-top: 10px;
        font-size: 13px;
        line-height: 1.5;
        color: #CBD5E1;
      }
      .cooldown-feature {
        border-left-color: #EF4444;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🎯 Sistem Kuis Unik Berbasis Data & Proteksi Anti-Spam</h1>
      <p>Setiap kelas kini memiliki misi statistik spesifik berdasarkan data riil siswa + sistem penalti cooldown 2 detik & pengacakan ulang untuk mencegah klik asal.</p>
    </div>

    <!-- Fitur Anti-Spam Cooldown -->
    <div class="card">
      <div class="card-header">
        <h2>🛡️ Mekanisme Anti-Spam (Anti Brute-Force Guessing)</h2>
        <span class="badge" style="background: #EF4444;">Anti-Spam Active</span>
      </div>
      <div class="grid-2">
        <div class="img-box">
          <img src="data:image/png;base64,${shotCooldown}" />
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; gap: 10px;">
          <div class="feature-box cooldown-feature">
            <strong style="color: #F87171; font-size: 14px;">1. Jeda Waktu Berpikir (2 Detik Cooldown):</strong><br>
            Saat siswa salah memilih opsi, seluruh tombol terkunci otomatis selama 2 detik dengan indikator: <em>"⏳ Waktu berpikir: 2s • Perhatikan data dengan cermat sebelum menjawab!"</em>.
          </div>
          <div class="feature-box cooldown-feature">
            <strong style="color: #F87171; font-size: 14px;">2. Pengacakan Ulang Opsi (Auto-Reshuffle):</strong><br>
            Setelah cooldown berakhir, urutan posisi 4 tombol pilihan otomatis teracak ulang sehingga siswa tidak bisa sekadar mengklik urut kiri-ke-kanan.
          </div>
          <div class="feature-box">
            <strong style="color: #34D399; font-size: 14px;">3. Petunjuk Edukatif (Scaffolding Hint):</strong><br>
            Memberikan rumus/cara hitung spesifik untuk kelas tersebut (bukan sekadar "salah") agar siswa terbimbing menemukan jawaban yang benar.
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Kuis Unik Tiap Kelas -->
    <div class="card">
      <div class="card-header">
        <h2>📚 4 Pertanyaan Unik Berbasis Kasus Data Kelas</h2>
        <span class="badge" style="background: #10B981;">100% Data-Driven</span>
      </div>
      <div class="grid-2">
        <div>
          <h3 style="font-size: 14px; margin-bottom: 6px; color: #38BDF8;">🏫 VII-A: Jangkauan Data (Range = Max − Min)</h3>
          <div class="img-box"><img src="data:image/png;base64,${shotViiA}" /></div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 6px;">Menghitung selisih jam antara siswa terlama dan tersingkat dari 5 sampel.</p>
        </div>
        <div>
          <h3 style="font-size: 14px; margin-bottom: 6px; color: #38BDF8;">🏫 VII-B: Menghitung Frekuensi Data (f &gt; 4 Jam)</h3>
          <div class="img-box"><img src="data:image/png;base64,${shotViiB}" /></div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 6px;">Menghitung banyak siswa yang memenuhi ambang batas &gt; 4 jam dari 7 sampel.</p>
        </div>
        <div style="margin-top: 14px;">
          <h3 style="font-size: 14px; margin-bottom: 6px; color: #38BDF8;">🏫 VIII-A: Jumlah Seluruh Data (Sigma / Σx)</h3>
          <div class="img-box"><img src="data:image/png;base64,${shotViiiA}" /></div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 6px;">Menjumlahkan seluruh jam 4 siswa (modal menghitung rata-rata / Mean).</p>
        </div>
        <div style="margin-top: 14px;">
          <h3 style="font-size: 14px; margin-bottom: 6px; color: #38BDF8;">🏫 VIII-B: Deteksi Pencilan Ekstrem (Outlier)</h3>
          <div class="img-box"><img src="data:image/png;base64,${shotViiiB}" /></div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 6px;">Menemukan data ekstrem (18 jam) dan menghitung selisihnya terhadap kelompok data.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'load' });
  await new Promise(res => setTimeout(res, 1000));

  const outPath = path.join(ARTIFACTS_DIR, 'showcase_unique_quiz_antispam.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved showcase ->', outPath);

  await browser.close();
})();
