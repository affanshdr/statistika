const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

const mermaidCode = `flowchart TD
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
    SaveCloud --> Finish(["Kembali ke Papan Kasus / Selesai"])`;

const mermaidJs = fs.readFileSync(path.resolve(__dirname, 'mermaid.min.js'), 'utf-8');

function generateHTML() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Stat-Casecode Flowchart</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #141416;
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      display: flex;
      justifyContent: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background: #18181B;
      border: 1px solid #27272A;
      border-radius: 20px;
      padding: 36px 40px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
      width: fit-content;
      max-width: 1400px;
    }
    .header {
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 1px solid #27272A;
    }
    .tag {
      display: inline-block;
      background: rgba(14, 131, 136, 0.2);
      color: #2DD4BF;
      border: 1px solid rgba(45, 212, 191, 0.3);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #FAFAFA;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 13.5px;
      color: #A1A1AA;
      margin-top: 4px;
    }
    .diagram-box {
      display: flex;
      justifyContent: center;
      padding: 20px 10px;
    }
    .footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px dashed #27272A;
      display: flex;
      justify-content: space-between;
      color: #71717A;
      font-size: 11px;
      font-weight: 600;
    }

    /* Mermaid Dark Theme Tweaks */
    .node rect, .node circle, .node polygon {
      stroke-width: 1.8px !important;
    }
    .node .label {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-weight: 700 !important;
      font-size: 12.5px !important;
      fill: #F4F4F5 !important;
    }
    .edgePath path {
      stroke: #38BDF8 !important;
      stroke-width: 1.8px !important;
    }
    .edgeLabel {
      background-color: #27272A !important;
      color: #E4E4E7 !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      padding: 3px 8px !important;
      border-radius: 4px !important;
      border: 1px solid #3F3F46 !important;
    }
    .cluster rect {
      stroke: #52525B !important;
      stroke-width: 1.5px !important;
      rx: 12px !important;
      fill: #18181B !important;
    }
    .cluster text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-weight: 800 !important;
      font-size: 13px !important;
      fill: #E4E4E7 !important;
    }
  </style>
  <script>
    ${mermaidJs}
  </script>
</head>
<body>
  <div class="container" id="flowchart-card">
    <div class="header">
      <div class="tag">🎮 STAT-CASECODE • ALUR GAMEPLAY & AUTENTIKASI LENGKAP</div>
      <h1>Ringkasan Alur Gameplay 2 Kasus & Mekanisme Login/Register</h1>
      <p>Struktur diagram simetris lurus dari atas ke bawah: Mulai &rarr; Cek Akun &rarr; Papan Kasus &rarr; Kasus 1 & 2 &rarr; Evaluasi</p>
    </div>

    <div class="diagram-box">
      <pre class="mermaid">
${mermaidCode}
      </pre>
    </div>

    <div class="footer">
      <span>Project: <strong>Stat-Casecode (AR-CogniStats)</strong></span>
      <span>Arsitektur: <strong>Next.js 16 • React 19 • Canvas 2D • Supabase PostgreSQL</strong></span>
    </div>
  </div>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        darkMode: true,
        background: '#18181B',
        mainBkg: '#27272A',
        nodeBorder: '#52525B',
        textColor: '#F4F4F5',
        lineColor: '#38BDF8',
        edgeLabelBackground: '#27272A',
        clusterBkg: '#18181B',
        clusterBorder: '#52525B',
        titleColor: '#FAFAFA',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 45,
        rankSpacing: 50,
      }
    });
  </script>
</body>
</html>`;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1600, deviceScaleFactor: 2.5 }
  });

  const page = await browser.newPage();
  await page.setContent(generateHTML(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.mermaid svg', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));

  const outDir = path.resolve(__dirname, '../diagrams');
  const publicDir = path.resolve(__dirname, '../public/diagrams');
  const brainDir = 'C:\\\\Users\\\\Asus_i7\\\\.gemini\\\\antigravity\\\\brain\\\\9e46d28e-6ca4-4cce-abee-c3fcf25e659e';

  // 1. Extract raw SVG
  const svgData = await page.$eval('.mermaid svg', el => el.outerHTML);
  const svgFilename = 'stat_casecode_flowchart.svg';
  fs.writeFileSync(path.join(outDir, svgFilename), svgData);
  fs.writeFileSync(path.join(publicDir, svgFilename), svgData);
  try { fs.writeFileSync(path.join(brainDir, svgFilename), svgData); } catch (e) {}

  // 2. Extract high-res PNG
  const card = await page.$('#flowchart-card');
  const pngFilename = 'stat_casecode_flowchart.png';
  const imgBuffer = await card.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(outDir, pngFilename), imgBuffer);
  fs.writeFileSync(path.join(publicDir, pngFilename), imgBuffer);
  try { fs.writeFileSync(path.join(brainDir, pngFilename), imgBuffer); } catch (e) {}

  await browser.close();
  console.log('Top-to-bottom flowchart generated successfully!');
})();
