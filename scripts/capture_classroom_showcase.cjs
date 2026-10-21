const puppeteer = require('puppeteer');
const path = require('path');
const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
    
    // Wait until loading overlay is gone
    await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    // Dismiss start button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 1200));

    // Enter Ruang VII-A
    await page.evaluate(() => window.__DEV_ENTER_ROOM__('A1'));
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showcase_conv_mode_vii_a.png') });
    console.log('Ruang VII-A captured!');

    // Enter Ruang VIII-A
    await page.evaluate(() => window.__DEV_ENTER_ROOM__('B1'));
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showcase_conv_mode_viii_a.png') });
    console.log('Ruang VIII-A captured!');

    // Enter Ruang VIII-B
    await page.evaluate(() => window.__DEV_ENTER_ROOM__('B2'));
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'showcase_conv_mode_viii_b.png') });
    console.log('Ruang VIII-B captured!');
  } finally {
    await browser.close();
  }
})();
