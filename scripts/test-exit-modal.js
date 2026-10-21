import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  console.log('Navigating to level 1...');
  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click Kembali button
  console.log('Clicking Kembali...');
  const buttons = await page.$$('button');
  let backBtn = null;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Kembali')) {
      backBtn = b;
      break;
    }
  }

  if (backBtn) {
    await backBtn.click();
    await new Promise(r => setTimeout(r, 800));
    const outPath = path.join(ARTIFACTS_DIR, 'exit_confirm_modal_parchment.png');
    await page.screenshot({ path: outPath });
    console.log('Screenshot saved to:', outPath);
  } else {
    console.log('Kembali button not found');
  }

  await browser.close();
})();
