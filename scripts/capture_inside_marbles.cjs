const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- CAPTURING MARBLES NESTLED INSIDE BOWL CAVITY ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({
      id: 'test-player-budi',
      username: 'BUDI',
      displayName: 'Budi Santoso'
    }));
    localStorage.setItem('student', JSON.stringify({
      id: 'test-player-budi',
      name: 'BUDI',
      username: 'BUDI'
    }));
  });

  await page.goto('http://localhost:3000/siswa/game/level/1?preloaded=true&demo=true&phase=exploration&zone=gate', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  await page.waitForFunction(() => typeof window.__DEV_ENTER_ROOM__ === 'function', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    window.__DEV_ENTER_ROOM__('A1');
  });
  await new Promise(r => setTimeout(r, 1200));

  // Advance teacher cutscene if any
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
  }

  await page.waitForSelector('[data-testid="bowl-container-A"]', { timeout: 10000 });
  console.log('Modal is open!');

  // Take screenshot of modal with marbles inside bowls
  const shot = path.join(ARTIFACTS_DIR, 'showcase_marbles_deep_inside_bowls.png');
  await page.screenshot({ path: shot });
  console.log('Saved to:', shot);

  // Focus crop on 4 bowls
  const bowlsCrop = path.join(ARTIFACTS_DIR, 'showcase_marbles_bowls_close_up.png');
  const modalEl = await page.$('[data-testid="wali-kelas-modal-content"]');
  if (modalEl) {
    const box = await modalEl.boundingBox();
    await page.screenshot({
      path: bowlsCrop,
      clip: {
        x: box.x + 10,
        y: box.y + 110,
        width: box.width - 20,
        height: 170,
      }
    });
    console.log('Saved close-up to:', bowlsCrop);
  }

  await browser.close();
  console.log('Done!');
})();
