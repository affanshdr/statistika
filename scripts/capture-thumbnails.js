import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/siswa/game/level/1?demoMode=true`;

const steps = [
  { name: 'exploration', url: `${BASE_URL}&demoStep=exploration` },
  { name: 'rentang', url: `${BASE_URL}&demoStep=rentang` },
  { name: 'interval', url: `${BASE_URL}&demoStep=interval` },
  { name: 'histogram', url: `${BASE_URL}&demoStep=histogram` }
];

async function capture() {
  // Check if server is running
  try {
    const checkRes = await fetch(`http://localhost:${PORT}/`);
    if (!checkRes.ok && checkRes.status !== 404 && checkRes.status !== 307) {
      throw new Error(`Status ${checkRes.status}`);
    }
  } catch (e) {
    console.error(`\n❌ [ERROR] Server Next.js tidak berjalan di http://localhost:${PORT}.\nSilakan jalankan "npm run dev" terlebih dahulu di terminal lain!\n`);
    process.exit(1);
  }

  const dir = path.join(__dirname, '../public/thumbnails');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log('🤖 Menjalankan headless browser Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport to 640x360 (16:9 ratio, seragam, ringan)
  await page.setViewport({ width: 640, height: 360 });

  for (const step of steps) {
    console.log(`📸 Menavigasi ke step [${step.name}]...`);
    try {
      await page.goto(step.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Tunggu animasi masuk/stabilisasi render SVG dan Framer Motion selesai
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const filePath = path.join(dir, `${step.name}.webp`);
      await page.screenshot({ path: filePath, type: 'webp', quality: 80 });
      console.log(`   ✅ Tersimpan: /public/thumbnails/${step.name}.webp`);
    } catch (err) {
      console.error(`   ❌ Gagal mengambil screenshot ${step.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\n✨ Proses pengambilan screenshot selesai dengan sukses!');
}

capture().catch(err => {
  console.error('Unhandled error during capture:', err);
  process.exit(1);
});
