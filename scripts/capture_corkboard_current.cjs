const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 800));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Open the corkboard / analysis modal:
  // Let's trigger the corkboard modal in the page
  await page.evaluate(() => {
    // Check if there is dev trigger or talk to Pak Sutrisno or set state
    if (window.__DEV_ENTER_ROOM__) {
      window.__DEV_ENTER_ROOM__('BK');
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Let's see if we are in Ruang BK or can open corkboard
  const state = await page.evaluate(() => {
    // If there is an NPC or button to talk to Pak Sutrisno or open corkboard
    const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText);
    return { btns, bodyText: document.body.innerText.slice(0, 300) };
  });
  console.log('Room state:', state);

  // Take screenshot
  const shotPath = path.join(ARTIFACTS_DIR, 'corkboard_current_view.png');
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved to:', shotPath);

  await browser.close();
})();
