const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 600));

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Enter RG
  console.log('Entering RG...');
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('RG'));
  await new Promise(r => setTimeout(r, 1500));

  const isCorkboard = await page.evaluate(() => !!document.querySelector('[data-testid="pak-report-corkboard"]'));
  console.log('Is corkboard open?', isCorkboard);

  // If not open, click whatever teacher interaction is there
  if (!isCorkboard) {
    console.log('Clicking teacher interaction in RG...');
    await page.evaluate(() => {
      // Find teacher or speech bubble or click SVG
      const el = document.querySelector('[data-testid*="speech-bubble"]') || document.querySelector('svg foreignObject');
      if (el) el.click();
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  const isCorkboard2 = await page.evaluate(() => !!document.querySelector('[data-testid="pak-report-corkboard"]'));
  console.log('Is corkboard open now?', isCorkboard2);

  const shotPath = path.join(ARTIFACTS_DIR, 'corkboard_live_view.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved to:', shotPath);
  await browser.close();
})();
