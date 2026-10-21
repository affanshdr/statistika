import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

const ROOMS_TO_TEST = [
  { id: 'A1', name: 'Ruang VII-A' },
  { id: 'A2', name: 'Ruang VII-B' },
  { id: 'B1', name: 'Ruang VIII-A' },
  { id: 'B2', name: 'Ruang VIII-B' },
  { id: 'RG', name: 'Ruang Guru' },
  { id: 'Perpustakaan', name: 'Perpustakaan' },
  { id: 'LabKomputer', name: 'Lab Komputer' },
];

(async () => {
  console.log('🔍 Starting Classroom Spawn Inspection with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    page.on('console', msg => {
      if (msg.type() === 'error') console.log('[Browser Error]:', msg.text());
    });

    console.log('Navigating to Level 1 in demo mode...');
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss any start/welcome buttons
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Ensure __DEV_ENTER_ROOM__ is available
    const hasHook = await page.evaluate(() => typeof window.__DEV_ENTER_ROOM__ === 'function');
    console.log('Dev hook available:', hasHook);
    if (!hasHook) {
      throw new Error('window.__DEV_ENTER_ROOM__ not found!');
    }

    const reportData = [];

    for (const room of ROOMS_TO_TEST) {
      console.log(`\n🚪 Testing spawn in: ${room.name} (${room.id})...`);
      await page.evaluate((id) => window.__DEV_ENTER_ROOM__(id), room.id);
      await new Promise(r => setTimeout(r, 800));

      // Capture screenshot
      const filename = `spawn_fixed_${room.id}.png`;
      const screenshotPath = path.join(ARTIFACTS_DIR, filename);
      await page.screenshot({ path: screenshotPath });
      console.log(`📸 Saved screenshot: ${filename}`);

      // Gather geometry info
      const roomInfo = await page.evaluate(() => {
        const svg = document.querySelector('svg');
        const playerSvgG = document.querySelector('svg g foreignObject div[style*="Stevunt"]');
        const exitBtn = document.querySelector('button[style*="Keluar Ruang"]');
        
        let playerBox = null;
        if (playerSvgG) {
          const rect = playerSvgG.getBoundingClientRect();
          playerBox = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }

        let exitBtnBox = null;
        if (exitBtn) {
          const rect = exitBtn.getBoundingClientRect();
          exitBtnBox = { x: rect.x, y: rect.y, width: rect.width, height: rect.height, text: exitBtn.innerText };
        }

        return {
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          playerBox,
          exitBtnBox
        };
      });

      reportData.push({ room, roomInfo, filename });

      // Exit room back to hallway/courtyard
      await page.evaluate(() => window.__DEV_EXIT_ROOM__());
      await new Promise(r => setTimeout(r, 600));
    }

    console.log('\n📊 Detailed Geometry Summary:');
    console.log(JSON.stringify(reportData, null, 2));

  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    await browser.close();
    console.log('✅ Browser closed.');
  }
})();
