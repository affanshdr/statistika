const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

const mermaidJs = fs.readFileSync(path.resolve(__dirname, 'mermaid.min.js'), 'utf-8');

function testMermaid(mermaidCode) {
  return `<!DOCTYPE html>
<html>
<head>
  <script>${mermaidJs}</script>
</head>
<body>
  <div class="mermaid">
${mermaidCode}
  </div>
  <script>
    mermaid.initialize({ startOnLoad: true, flowchart: { htmlLabels: true, curve: 'basis' } });
  </script>
</body>
</html>`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const code = `flowchart TD
    Start(["Mulai Permainan (Root Page)"]) --> Login["Input Username & PIN 4-Digit"]
    Login --> AuthCheck{"Cek Akun di Database\\n(/api/auth/play)"}
    
    AuthCheck -->|"User Terdaftar"| OldUser["Verifikasi PIN & Muat Progres Lama"]
    AuthCheck -->|"User Baru"| NewUser["Registrasi Otomatis & Akun Baru"]
    
    OldUser --> Hub["Papan Kasus Detektif (Dashboard Siswa /siswa)"]
    NewUser --> Hub
    
    Hub --> SelectCase{"Pilih Kasus Investigasi"}
    
    SelectCase -->|"CASE #01"| Case1["KASUS 1: MISTERI JAM LAYAR\\n(Ukuran Pemusatan Data)"]
    SelectCase -->|"CASE #02"| Case2["KASUS 2: PENGUKURAN LEMPARAN\\n(Ukuran Penyebaran Data)"]
    
    subgraph Case1Play ["Gameplay Kasus 1: Misteri Jam Layar"]
        direction TB
        C1_1["1. Gerbang Sekolah & Kuis Waktu Satpam Pak Joko"]
        C1_2["2. Eksplorasi 4 Kelas & Fasilitas: Kumpul 24 Data Siswa"]
        C1_3["3. Meja Detektif: Hitung Mean, Median, dan Modus"]
        C1_4["4. Simulasi Outlier: Buktikan Distorsi Nilai Pencilan"]
        C1_5["5. Putusan: Klaim Viral MISLEADING (Cap 'MYTH BUSTED!')"]
        C1_6["6. Lapor Hasil Investigasi Lengkap ke Pak Sutrisno"]
        
        C1_1 --> C1_2 --> C1_3 --> C1_4 --> C1_5 --> C1_6
    end
    
    subgraph Case2Play ["Gameplay Kasus 2: Pengukuran Lemparan"]
        direction TB
        C2_1["1. Briefing Lapangan bersama Pak Bambang & DiRA"]
        C2_2["2. Mekanik Bidik Lempar Bola: Catat 15 Jarak Lemparan"]
        C2_3["3. Misi 1: Hitung Jangkauan (Range = Xmax - Xmin)"]
        C2_4["4. Misi 2: Tentukan Titik Kuartil (Q1, Q2/Median, Q3)"]
        C2_5["5. Misi 3: Hitung Simpangan Kuartil (IQR & Qd)"]
        C2_6["6. Laporan Rekomendasi Seleksi Atletik Guru Olahraga"]
        
        C2_1 --> C2_2 --> C2_3 --> C2_4 --> C2_5 --> C2_6
    end
    
    Case1 --> C1_1
    Case2 --> C2_1
    
    C1_6 --> PostTest1["Post-Test Kasus 1\\n(5 Soal Pemusatan Data)"]
    C2_6 --> PostTest2["Post-Test Kasus 2\\n(5 Soal Penyebaran Data)"]
    
    PostTest1 --> Results["Evaluasi Hasil: Bintang (1-3 Stars), XP & Badges"]
    PostTest2 --> Results
    
    Results --> SaveCloud["Simpan Permanen ke Supabase Cloud (playerSync)"]
    
    SaveCloud --> NextChoice{"Lanjut Kasus Berikutnya?"}
    NextChoice -->|"Ya / Kasus Lain"| SelectCase
    NextChoice -->|"Selesai / Keluar"| Finish(["Keluar Permainan"])`;

  await page.setContent(testMermaid(code), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.mermaid svg');

  const svg = await page.$eval('.mermaid svg', el => el.outerHTML);
  const r = /<g class="node[^"]*" id="flowchart-([a-zA-Z0-9_]+)-[0-9]+"[^>]*transform="translate\(([^,]+),\s*([^)]+)\)"/g;
  let m;
  console.log('--- NODE POSITIONS ---');
  while ((m = r.exec(svg)) !== null) {
    console.log(m[1].padEnd(20), 'x =', Math.round(parseFloat(m[2])), 'y =', Math.round(parseFloat(m[3])));
  }

  await browser.close();
})();
