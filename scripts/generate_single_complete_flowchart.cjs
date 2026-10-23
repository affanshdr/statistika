const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const mermaidCode = `flowchart TD
    Start(["Mulai Permainan (Root Page)"]) --> Splash["Splash Screen & Preloader Aset"]
    Splash --> InputAuth["Form Masuk / Daftar: Input Username & PIN (4 Digit)"]
    
    subgraph AuthPipeline ["Mekanisme Autentikasi & Registrasi User (/api/auth/play)"]
        InputAuth --> CheckUser{"Cek Username di Database"}
        
        CheckUser -->|"Username Terdaftar"| VerifyPIN{"Verifikasi PIN"}
        VerifyPIN -->|"PIN Salah"| AuthError["Tampilkan Pesan Error: PIN Salah"]
        AuthError --> InputAuth
        VerifyPIN -->|"PIN Cocok"| LoadProgress["Ambil Data Pemain & Progres dari Cloud"]
        
        CheckUser -->|"Username Baru"| AutoRegister["Registrasi Otomatis: Buat Akun & Progress Awal (Level 1, XP 0)"]
        
        LoadProgress --> InitSession["Simpan Session ke LocalStorage & Hydrate Zustand Store"]
        AutoRegister --> InitSession
    end
    
    InitSession --> Dashboard["Papan Kasus Detektif (Dashboard Siswa /siswa)"]
    
    subgraph DashboardHub ["Papan Kasus & Fitur Pendukung"]
        Dashboard --> Booklet["Buku Modul Detektif (Materi Statistika)"]
        Dashboard --> AboutGame["Tentang Game & Peta Konsep Kurikulum"]
        Dashboard --> SelectCase{"Pilih Kasus Investigasi"}
    end
    
    SelectCase -->|"CASE #01"| Case1["KASUS 1: MISTERI JAM LAYAR\\n(Ukuran Pemusatan Data)"]
    SelectCase -->|"CASE #02"| Case2["KASUS 2: PENGUKURAN LEMPARAN\\n(Ukuran Penyebaran Data)"]
    
    subgraph Case1Play ["Gameplay Kasus 1: Misteri Jam Layar"]
        Case1 --> C1Gate["Gerbang Sekolah & Kuis Waktu Satpam Pak Joko"]
        C1Gate --> C1Explore["Eksplorasi Kelas VII, VIII & Fasilitas Sekolah"]
        C1Explore --> C1Gather["Wawancara Siswa & Kuis: Kumpulkan 24 Data Responden"]
        C1Gather --> C1Desk["Meja Detektif: Hitung Nilai Min, Max, Mean, Median, Modus"]
        C1Desk --> C1Outlier["Simulator Outlier: Uji Distorsi Nilai Pencilan Ekstrem"]
        C1Outlier --> C1Verdict["Putusan: Klaim Viral MISLEADING (Cap 'MYTH BUSTED!')"]
        C1Verdict --> C1Report["Serahkan Laporan Investigasi ke Pak Sutrisno"]
    end
    
    subgraph Case2Play ["Gameplay Kasus 2: Pengukuran Lemparan"]
        Case2 --> C2Brief["Briefing Lapangan Olahraga bersama Pak Bambang & DiRA"]
        C2Brief --> C2Aim["Mekanik Bidik Sudut & Bar Tenaga (BallThrowBowAim)"]
        C2Aim --> C2Throw["Simulasi Lempar & Pasang Bendera Ukur (15 Data Lemparan)"]
        C2Throw --> C2M1["Misi 1: Hitung Jangkauan (Range = Xmax - Xmin)"]
        C2M1 --> C2M2["Misi 2: Tentukan Tiga Titik Kuartil (Q1, Q2/Median, Q3)"]
        C2M2 --> C2M3["Misi 3: Hitung Jangkauan Interkuartil (IQR) & Simpangan Kuartil (Qd)"]
        C2M3 --> C2Coach["Penyusunan Laporan Seleksi Atletik bersama Pak Bambang"]
    end
    
    C1Report --> PostTest1["Post-Test Kasus 1 (5 Soal Penalaran Pemusatan Data)"]
    C2Coach --> PostTest2["Post-Test Kasus 2 (5 Soal Penalaran Penyebaran Data)"]
    
    PostTest1 --> Results["Evaluasi Hasil: Bintang (1-3 Stars), XP & Buka Kunci Badges"]
    PostTest2 --> Results
    
    Results --> SaveCloud["Simpan Permanen ke Supabase Cloud (playerSync)"]
    SaveCloud --> Dashboard`;

const mermaidJs = fs.readFileSync(path.resolve(__dirname, 'mermaid.min.js'), 'utf-8');

function generateHTML() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Stat-Casecode Complete Flowchart</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #121212;
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
      max-width: 1550px;
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

    /* Mermaid Dark Theme Custom Tweaks matching user's uploaded screenshot */
    .node rect, .node circle, .node polygon {
      stroke-width: 1.8px !important;
    }
    .node .label {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-weight: 700 !important;
      font-size: 12px !important;
      fill: #F4F4F5 !important;
    }
    .edgePath path {
      stroke: #38BDF8 !important;
      stroke-width: 1.8px !important;
    }
    .edgeLabel {
      background-color: #27272A !important;
      color: #E4E4E7 !important;
      font-size: 10.5px !important;
      font-weight: 700 !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      border: 1px solid #3F3F46 !important;
    }
    .cluster rect {
      stroke: #3F3F46 !important;
      stroke-width: 1.5px !important;
      rx: 12px !important;
      fill: #18181B !important;
    }
    .cluster text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-weight: 800 !important;
      font-size: 12.5px !important;
      fill: #A1A1AA !important;
    }
  </style>
  <script>
    ${mermaidJs}
  </script>
</head>
<body>
  <div class="container" id="flowchart-card">
    <div class="header">
      <div class="tag">🎮 STAT-CASECODE • FULL GAMEPLAY & AUTH FLOWCHART</div>
      <h1>Ringkasan Alur Lengkap Permainan (Autentikasi, Kasus 1, & Kasus 2)</h1>
      <p>Diagram terpadu memuat mekanisme Login/Registrasi User, Papan Kasus Detektif, Investigasi Kasus 1 & 2, hingga Post-Test</p>
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
        clusterBorder: '#3F3F46',
        titleColor: '#FAFAFA',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 40,
        rankSpacing: 45,
      }
    });
  </script>
</body>
</html>`;
}

(async () => {
  console.log('Rendering unified full flowchart (PNG & SVG)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1920,
      height: 1400,
      deviceScaleFactor: 2.5
    }
  });

  const page = await browser.newPage();
  const html = generateHTML();
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.mermaid svg', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  const outDir = path.resolve(__dirname, '../diagrams');
  const publicDir = path.resolve(__dirname, '../public/diagrams');
  const brainDir = 'C:\\\\Users\\\\Asus_i7\\\\.gemini\\\\antigravity\\\\brain\\\\9e46d28e-6ca4-4cce-abee-c3fcf25e659e';

  // 1. Extract raw SVG
  const svgData = await page.$eval('.mermaid svg', el => el.outerHTML);
  const svgFilename = 'stat_casecode_complete_gameplay_flowchart.svg';
  fs.writeFileSync(path.join(outDir, svgFilename), svgData);
  fs.writeFileSync(path.join(publicDir, svgFilename), svgData);
  try { fs.writeFileSync(path.join(brainDir, svgFilename), svgData); } catch (e) {}
  console.log('Saved SVG to:', path.join(outDir, svgFilename));

  // 2. Extract high-res PNG
  const card = await page.$('#flowchart-card');
  const pngFilename = 'stat_casecode_complete_gameplay_flowchart.png';
  const imgBuffer = await card.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(outDir, pngFilename), imgBuffer);
  fs.writeFileSync(path.join(publicDir, pngFilename), imgBuffer);
  try { fs.writeFileSync(path.join(brainDir, pngFilename), imgBuffer); } catch (e) {}
  console.log('Saved PNG to:', path.join(outDir, pngFilename));

  await browser.close();
  console.log('Finished generating complete unified flowchart!');
})();
