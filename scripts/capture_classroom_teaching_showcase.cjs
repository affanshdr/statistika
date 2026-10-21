const puppeteer = require('puppeteer');
const path = require('path');
const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

const ROOMS = [
  { id: 'A1', slug: 'vii_a', label: 'Ruang VII-A (Bu Sari)' },
  { id: 'A2', slug: 'vii_b', label: 'Ruang VII-B (Pak Bambang)' },
  { id: 'B1', slug: 'viii_a', label: 'Ruang VIII-A (Bu Rina)' },
  { id: 'B2', slug: 'viii_b', label: 'Ruang VIII-B (Pak Setiawan)' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
    await page.setViewport({ width: 1280, height: 720 });

    // 1. Capture with live cutscene/teaching dialogue (standard demo mode without pre-saved classes)
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    for (const btn of await page.$$('button')) {
      const t = await page.evaluate(el => el.innerText, btn);
      if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
    }
    await new Promise(r => setTimeout(r, 800));

    for (const room of ROOMS) {
      await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), room.id);
      await new Promise(r => setTimeout(r, 1600));

      const shotPath = path.join(ARTIFACTS_DIR, `teaching_mode_${room.slug}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved ${room.label} -> ${shotPath}`);

      // Exit back
      await page.evaluate(() => window.__DEV_EXIT_ROOM__());
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log('ALL TEACHING CLASSROOM SHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
})();
