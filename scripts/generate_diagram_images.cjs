const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const diagrams = [
  {
    id: '01_game_progression_flowchart',
    title: 'DIAGRAM 1: GAME PROGRESSION FLOWCHART',
    subtitle: 'Alur Progresi Pemain Stat-Casecode (2 Kasus Investigasi Utama & Evaluasi)',
    code: `flowchart TD
    Start(["Mulai Permainan (Root Page)"]) --> Preloader["Splash Screen & Preload Aset"]
    Preloader --> AuthCheck{"Cek Status Pemain"}
    
    AuthCheck -->|"Pemain Terdaftar"| CloudSync["Sinkronisasi Progres Cloud (Supabase)"]
    AuthCheck -->|"Pemain Baru / Tamu"| ModalLogin["Modal Masuk: Input Nama Detektif & NISN"]
    ModalLogin --> CloudSync
    
    CloudSync --> Hub["Papan Kasus Detektif (Siswa Hub)"]
    
    subgraph DashboardFeatures ["Fitur Pendukung & Edukasi di Dashboard"]
        Hub --> Booklet["Buku Modul Detektif (Materi Statistika)"]
        Hub --> AboutModal["Tentang Game & Peta Konsep Kurikulum"]
        Hub --> SelectCase{"Pilih Kasus Investigasi"}
    end
    
    SelectCase -->|"CASE #01"| Case1["KASUS 1: MISTERI JAM LAYAR\\n(Ukuran Pemusatan Data)"]
    SelectCase -->|"CASE #02"| Case2["KASUS 2: PENGUKURAN LEMPARAN\\n(Ukuran Penyebaran Data)"]
    
    subgraph Case1Summary ["Siklus Investigasi Kasus 1"]
        Case1 --> C1Gate["1. Gerbang Sekolah & Kuis Waktu Satpam"]
        C1Gate --> C1Gather["2. Eksplorasi 4 Kelas & Fasilitas (Kumpul 24 Data)"]
        C1Gather --> C1CatQuest["Side-Quest Opsional: Selamatkan Anak Kucing"]
        C1Gather --> C1Analyze["3. Meja Detektif: Mean, Median, Modus & Outlier"]
        C1Analyze --> C1Verdict["4. Putusan Hoaks: Cap 'MYTH BUSTED!'"]
        C1Verdict --> C1Report["5. Lapor Pak Sutrisno & Raih Bintang (1-3)"]
    end
    
    subgraph Case2Summary ["Siklus Investigasi Kasus 2"]
        Case2 --> C2Brief["1. Briefing Lapangan Olahraga bersama Pak Bambang"]
        C2Brief --> C2Throw["2. Bidik & Lempar Bola: Catat 15 Data Lemparan"]
        C2Throw --> C2Missions["3. Selesaikan 3 Misi: Jangkauan, Kuartil (Q1-Q3), & IQR/Qd"]
        C2Missions --> C2CoachReport["4. Rekomendasi Seleksi & Laporan Guru Olahraga"]
        C2CoachReport --> C2Complete["5. Raih Bintang (1-3) & Badge Ahli Lapangan"]
    end
    
    C1Report --> CheckPostTest1{"Buka Evaluasi Kasus 1?"}
    C2Complete --> CheckPostTest2{"Buka Evaluasi Kasus 2?"}
    
    CheckPostTest1 -->|"Ya"| PostTest1["Post-Test Kasus 1: 5 Soal Penalaran Pemusatan Data"]
    CheckPostTest1 -->|"Nanti"| Hub
    
    CheckPostTest2 -->|"Ya"| PostTest2["Post-Test Kasus 2: 5 Soal Penalaran Penyebaran Data"]
    CheckPostTest2 -->|"Nanti"| Hub
    
    PostTest1 --> FinalScore["Layar Hasil Akhir, XP, Bintang & Badges"]
    PostTest2 --> FinalScore
    
    FinalScore --> SaveCloud["Simpan Permanen ke Supabase & LocalStorage"]
    SaveCloud --> Hub`
  },
  {
    id: '02_case1_jam_layar_logic_flowchart',
    title: 'DIAGRAM 2: LOGIC FLOWCHART KASUS 1 (MISTERI JAM LAYAR)',
    subtitle: 'Mesin Status & Alur Interaksi Eksplorasi Sekolah, Pengumpulan 24 Responden, & Meja Analisis',
    code: `flowchart TD
    L1Start(["Pemain Memulai Kasus 1"]) --> GateZone["Area Gerbang Sekolah"]
    
    GateZone --> SatpamTrigger{"Interaksi dengan Satpam Pak Joko?"}
    SatpamTrigger -->|"Belum"| Barrier["Barier Gerbang Tertutup"]
    SatpamTrigger -->|"Ya"| SatpamDialogue["Dialog & Kuis Waktu Satpam"]
    
    SatpamDialogue --> SatpamAnswer{"Jawaban Kuis Satpam?"}
    SatpamAnswer -->|"Salah"| SatpamWrong["Teguran Satpam (+1 Mistake)"]
    SatpamWrong --> SatpamDialogue
    SatpamAnswer -->|"Benar"| GateOpen["Pintu Gerbang Terbuka (Akses Masuk)"]
    
    GateOpen --> MeetTeacher["Pertemuan Awal dengan Pak Sutrisno"]
    MeetTeacher --> QuestAssign["Diberi Misi: Buktikan Klaim Viral Jam Layar Siswa"]
    
    QuestAssign --> SchoolHallway["Selasar Kelas & Area Fasilitas Sekolah"]
    
    subgraph ExplorationZone ["Loop Pengumpulan Data Responden (N = 24)"]
        SchoolHallway --> SelectZone{"Pilih Area Kunjungan"}
        SelectZone -->|"Ruang Kelas VII-A / VII-B"| Class7["Kelas 7: Wawancara Siswa & Kuis Mini"]
        SelectZone -->|"Ruang Kelas VIII-A / VIII-B"| Class8["Kelas 8: Wawancara Siswa & Kuis Mini"]
        SelectZone -->|"Perpustakaan & Lab Komputer"| Facility["Fasilitas: Wawancara Pengunjung & Terminal"]
        
        Class7 --> CollectResp["Catat Jam Layar Siswa ke Buku Detektif"]
        Class8 --> CollectResp
        Facility --> CollectResp
        
        Facility --> CatSpawn{"Melihat Anak Kucing Terpisah?"}
        CatSpawn -->|"Ya"| RescuingCat["Selamatkan Anak Kucing ke Induknya (+Bonus XP)"]
        CatSpawn -->|"Tidak"| CollectResp
    end
    
    CollectResp --> CountCheck{"Data Responden Lengkap (N == 24)?"}
    CountCheck -->|"Belum (N < 24)"| SchoolHallway
    CountCheck -->|"Lengkap (N = 24)"| UnlockDesk["Meja Analisis Detektif (Corkboard) Terbuka"]
    
    UnlockDesk --> CorkboardDesk["Papan Analisis Bukti Kasus"]
    
    subgraph DataAnalysisPhase ["Analisis Pemusatan Data di Meja Detektif"]
        CorkboardDesk --> CalcMinMax["1. Tentukan Nilai Min (Terendah) & Max (Tertinggi)"]
        CalcMinMax --> CalcMeasures["2. Hitung Modus, Median, dan Rata-rata (Mean)"]
        CalcMeasures --> OutlierSim["3. Jalankan Simulator Outlier (Pencilan)"]
        OutlierSim --> CompareDistortion["4. Amati: Nilai Mean Terdistorsi Ekstrem, Median Stabil"]
    end
    
    CompareDistortion --> VerdictScreen["Layar Putusan Klaim Viral"]
    VerdictScreen --> VerdictChoice{"Apakah Klaim 'Rata-rata 7 Jam' Valid?"}
    
    VerdictChoice -->|"Valid (Keliru)"| PenaltyMistake["Peringatan: Analisis Terkecoh Outlier! (+1 Kesalahan)"]
    PenaltyMistake --> VerdictChoice
    VerdictChoice -->|"Misleading / Hoaks (Benar)"| MythBustStamp["Cap Stempel 'MYTH BUSTED!' & Buka Badge"]
    
    MythBustStamp --> ReportToPak["Serahkan Laporan Lengkap ke Pak Sutrisno"]
    ReportToPak --> StarCalculation["Kalkulasi Skor, Penalti Waktu & Bintang (1-3)"]
    StarCalculation --> L1Finish(["Kasus 1 Selesai"])`
  },
  {
    id: '03_case2_pengukuran_lemparan_logic_flowchart',
    title: 'DIAGRAM 3: LOGIC FLOWCHART KASUS 2 (PENGUKURAN LEMPARAN)',
    subtitle: 'Mekanik Bidik Lemparan Bola Lapangan, Pengumpulan 15 Sampel, & 3 Misi Penyebaran Data',
    code: `flowchart TD
    L2Start(["Pemain Memulai Kasus 2"]) --> FieldBriefing["Briefing Lapangan bersama Pak Bambang & DiRA"]
    FieldBriefing --> InitCourt["Inisialisasi Lapangan & Posisi Melempar Bola"]
    
    subgraph ThrowSimulationPhase ["Simulasi Lemparan & Pengumpulan 15 Data Atletik"]
        InitCourt --> AimMechanic["Mekanik Bidik Sudut & Bar Tenaga (BallThrowBowAim)"]
        AimMechanic --> ReleaseBall["Lepas Bola: Simulasi Parabola Lemparan"]
        ReleaseBall --> BallLanded["Bola Jatuh di Lapangan Olahraga"]
        BallLanded --> FlagMeasure["Tancapkan Bendera Pengukur Jarak (Meter)"]
        FlagMeasure --> RecordThrow["Catat Jarak Lemparan ke Papan Atlet"]
        RecordThrow --> Check15{"Jumlah Data Lemparan == 15?"}
        Check15 -->|"Kurang dari 15"| CallNextStudent["Panggil Siswa Berikutnya"]
        CallNextStudent --> AimMechanic
        Check15 -->|"Tepat 15 Data"| SortDataAsc["Urutkan 15 Data secara Asending (Terkecil ke Terbesar)"]
    end
    
    SortDataAsc --> Mission1["MISI 1: Menghitung Jangkauan (Range)"]
    
    subgraph ThreeStatisticalMissions ["Tiga Misi Ukuran Penyebaran Data"]
        Mission1 --> InputRange["Hitung: Jangkauan = Nilai Maksimum - Nilai Minimum"]
        InputRange --> ValidateRange{"Apakah Nilai Jangkauan Tepat?"}
        ValidateRange -->|"Salah"| ScaffoldingM1["Petunjuk Bimbingan DiRA (+1 Kesalahan)"]
        ScaffoldingM1 --> InputRange
        ValidateRange -->|"Benar"| Mission2["MISI 2: Menentukan Tiga Kuartil (Q1, Q2, Q3)"]
        
        Mission2 --> CalcQ2["Tentukan Kuartil Tengah (Q2 / Median dari 15 Data)"]
        CalcQ2 --> CalcQ1Q3["Tentukan Kuartil Bawah (Q1) & Kuartil Atas (Q3)"]
        CalcQ1Q3 --> ValidateQuartiles{"Apakah Posisi Q1, Q2, Q3 Tepat?"}
        ValidateQuartiles -->|"Salah"| ScaffoldingM2["Visualisasi Pemotongan 4 Bagian DiRA (+1 Kesalahan)"]
        ScaffoldingM2 --> CalcQ1Q3
        ValidateQuartiles -->|"Benar"| Mission3["MISI 3: Jangkauan Interkuartil (IQR) & Simpangan Kuartil (Qd)"]
        
        Mission3 --> CalcIQR["Hitung IQR = Q3 - Q1"]
        CalcIQR --> CalcQd["Hitung Simpangan Kuartil: Qd = 0.5 * IQR"]
        CalcQd --> ValidateQd{"Apakah Nilai Qd Tepat?"}
        ValidateQd -->|"Salah"| ScaffoldingM3["Panduan Rumus Interkuartil DiRA (+1 Kesalahan)"]
        ScaffoldingM3 --> CalcQd
        ValidateQd -->|"Benar"| InterpretSpread["Interpretasi: Analisis Sebaran Kemampuan Lemparan Siswa"]
    end
    
    InterpretSpread --> FinalReport["Penyusunan Laporan Seleksi Olahraga Pak Bambang"]
    FinalReport --> AwardFieldBadge["Buka Badge 'Ahli Lapangan' & Perolehan Bintang (1-3)"]
    AwardFieldBadge --> SyncCloud2["Sinkronisasi Progres ke Supabase Cloud"]
    SyncCloud2 --> L2Finish(["Kasus 2 Selesai"])`
  },
  {
    id: '04_system_architecture_diagram',
    title: 'DIAGRAM 4: SYSTEM ARCHITECTURE & DATA FLOW',
    subtitle: 'Arsitektur Pengembangan Perangkat Lunak, State Terpusat, & Sinkronisasi Offline-First',
    code: `graph TB
    subgraph ClientPresentation ["1. PRESENTATION & CLIENT RUNTIME (Browser)"]
        direction TB
        NextApp["Next.js 16 App Router & React 19 Engine"]
        Canvas2D["HTML5 Canvas 2D Collision & World Coordinates Engine"]
        ThreeWebGL["Three.js & React Three Fiber (Visualisasi Lapangan 3D)"]
        AudioSynth["Web Audio API & Synthesizer (BGM & Dynamic SFX)"]
        UIAnim["Tailwind CSS v4 & Framer Motion 12 (Retro Pixel-Art UI)"]
    end

    subgraph StateManagement ["2. CENTRALIZED GAME STORE (Zustand 5)"]
        direction TB
        Store["useGameStore (lib/store/gameStore.ts)"]
        StateVars["- Nyawa Pemain (Lives)\\n- Akumulasi XP & Perolehan Bintang\\n- Pencatat Kesalahan (mistakeCount)\\n- Dataset Aktif: N=24 (Kasus 1) & N=15 (Kasus 2)\\n- Status Buka Kunci Badge\\n- Durasi Waktu Sesi (sessionStartTime)"]
    end

    subgraph AIAndScaffolding ["3. PEDAGOGICAL & DIALOG ENGINE"]
        direction TB
        DiRAAgent["DiRA (Digital Research Assistant)"]
        KB["Statistika Knowledge Base (lib/chatbot/knowledge.json)"]
        DiagnosticEngine["Sistem Umpan Balik Bertahap & Penilaian Reflektif"]
    end

    subgraph OfflineSyncPipeline ["4. OFFLINE-FIRST RESILIENCE PIPELINE"]
        direction TB
        SyncManager["Player Sync Engine (lib/utils/playerSync.ts)"]
        LocalCache["Browser LocalStorage (player_progress & active_player)"]
        MutexQueue["Antrean Mutex Sinkronisasi (Auto-flush saat Terkoneksi)"]
        NetDetector["NetworkStatusBanner (Deteksi Real-time Status Jaringan)"]
    end

    subgraph CloudBackend ["5. CLOUD BACKEND & DATABASE (Supabase)"]
        direction TB
        APIEndpoints["Next.js API Route Handlers (/api/player/progress, /api/auth/play)"]
        PrismaClient["Prisma ORM 5 (Type-Safe Database Client)"]
        SupabasePostgres[("PostgreSQL Database (Supabase Cloud)\\n- Player & Student Profiles\\n- Gameplay Session Records\\n- Level Stars & Badges Earned\\n- Post-Test Answers & Diagnostic Scores")]
    end

    %% Hubungan Aliran Data
    NextApp --> Store
    Canvas2D --> Store
    ThreeWebGL --> Store
    DiRAAgent --> KB
    DiRAAgent --> Store
    
    Store --> SyncManager
    SyncManager --> LocalCache
    SyncManager --> MutexQueue
    NetDetector --> SyncManager
    
    MutexQueue --> APIEndpoints
    APIEndpoints --> PrismaClient
    PrismaClient --> SupabasePostgres`
  }
];

const mermaidJsCode = fs.readFileSync(path.resolve(__dirname, 'mermaid.min.js'), 'utf-8');

function generateHTML(title, subtitle, mermaidCode) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 40px;
      display: flex;
      justifyContent: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06);
      padding: 36px 44px;
      width: fit-content;
      max-width: 1400px;
      border-top: 6px solid #0E8388;
    }
    .header {
      margin-bottom: 28px;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 20px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #E0F2FE;
      color: #0369A1;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
      border: 1px solid #BAE6FD;
    }
    .title {
      font-size: 26px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
      line-height: 1.25;
    }
    .subtitle {
      font-size: 14px;
      color: #64748B;
      font-weight: 600;
      margin-top: 6px;
    }
    .diagram-container {
      display: flex;
      justifyContent: center;
      padding: 20px 10px;
      overflow: visible;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dashed #CBD5E1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      color: #94A3B8;
      font-weight: 600;
    }
    .footer strong {
      color: #475569;
    }
    /* Mermaid styling adjustments */
    .node rect, .node circle, .node polygon {
      stroke-width: 2px !important;
    }
    .node .label {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-weight: 700 !important;
      font-size: 12.5px !important;
    }
    .edgePath path {
      stroke: #64748B !important;
      stroke-width: 2px !important;
    }
    .edgeLabel {
      background-color: #FFFFFF !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      color: #334155 !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
    }
    .cluster rect {
      stroke: #CBD5E1 !important;
      stroke-width: 1.5px !important;
      stroke-dasharray: 4 4 !important;
      rx: 16px !important;
    }
    .cluster text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-weight: 800 !important;
      font-size: 13px !important;
      fill: #1E293B !important;
    }
  </style>
  <script>
    ${mermaidJsCode}
  </script>
</head>
<body>
  <div class="card" id="diagram-card">
    <div class="header">
      <div class="badge">🎮 STAT-CASECODE • SPESIFIKASI ARSITEKTUR GAME</div>
      <h1 class="title">${title}</h1>
      <p class="subtitle">${subtitle}</p>
    </div>
    
    <div class="diagram-container">
      <pre class="mermaid">
${mermaidCode}
      </pre>
    </div>
    
    <div class="footer">
      <div>Project: <strong>Stat-Casecode (AR-CogniStats)</strong> • SMP Mathematics Educational Game</div>
      <div>Tech: <strong>Next.js 16 + React 19 + Canvas 2D + Zustand + Supabase</strong></div>
    </div>
  </div>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        primaryColor: '#F0F9FF',
        primaryBorderColor: '#0284C7',
        primaryTextColor: '#0F172A',
        secondaryColor: '#FEF3C7',
        secondaryBorderColor: '#D97706',
        secondaryTextColor: '#451A03',
        tertiaryColor: '#ECFDF5',
        tertiaryBorderColor: '#059669',
        tertiaryTextColor: '#064E3B',
        lineColor: '#64748B',
        textColor: '#0F172A',
        edgeLabelBackground: '#FFFFFF',
        clusterBkg: '#F8FAFC',
        clusterBorder: '#CBD5E1',
        titleColor: '#0F172A',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 45,
        rankSpacing: 45,
      }
    });
  </script>
</body>
</html>`;
}

(async () => {
  console.log('Launching browser to render high-res flowchart images...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2.5 // Crisp high-definition 2.5x rendering!
    }
  });

  const outDir = path.resolve(__dirname, '../diagrams');
  const publicDir = path.resolve(__dirname, '../public/diagrams');
  const brainDir = 'C:\\\\Users\\\\Asus_i7\\\\.gemini\\\\antigravity\\\\brain\\\\9e46d28e-6ca4-4cce-abee-c3fcf25e659e';

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const page = await browser.newPage();

  for (const diag of diagrams) {
    console.log('Rendering: ' + diag.title + '...');
    const htmlContent = generateHTML(diag.title, diag.subtitle, diag.code);
    
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for Mermaid SVG to render
    await page.waitForSelector('.mermaid svg', { timeout: 30000 });
    
    // Give extra 800ms for layout and rendering stability
    await new Promise(r => setTimeout(r, 800));

    const cardHandle = await page.$('#diagram-card');
    const filename = diag.id + '.png';
    const targetPath = path.join(outDir, filename);
    const publicPath = path.join(publicDir, filename);
    const brainPath = path.join(brainDir, filename);

    if (cardHandle) {
      const imgBuffer = await cardHandle.screenshot({ type: 'png' });
      fs.writeFileSync(targetPath, imgBuffer);
      fs.writeFileSync(publicPath, imgBuffer);
      try {
        fs.writeFileSync(brainPath, imgBuffer);
      } catch (err) {
        // brain path optional fallback
      }
      console.log('  -> Saved to ' + targetPath);
    } else {
      console.error('Failed to locate card handle for ' + diag.id);
    }
  }

  await browser.close();
  console.log('All flowchart images rendered successfully in high definition!');
})();
