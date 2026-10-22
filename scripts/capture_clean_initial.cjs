const puppeteer = require('puppeteer');
const path = require('path');
const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&phase=exploration&zone=main', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1200));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }

  await page.evaluate(() => { if (window.__DEV_ENTER_ROOM__) window.__DEV_ENTER_ROOM__('A1'); });
  await new Promise(r => setTimeout(r, 1200));

  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));
  }

  await page.waitForSelector('[data-testid="bowl-container-A"]', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 500));
  const outPath = path.join(ARTIFACTS_DIR, 'showcase_vii_a_drag_drop_initial_clean.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('Clean initial screenshot captured ->', outPath);
})();
