const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- TESTING CLICK & HOLD MARBLE LIFTING (CLEAN SCREENSHOT) ---');
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

  console.log('Navigating to Level 1 with preloaded=true...');
  await page.goto('http://localhost:3000/siswa/game/level/1?preloaded=true&demo=true&phase=exploration&zone=gate', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log('Waiting for __DEV_ENTER_ROOM__...');
  await page.waitForFunction(() => typeof window.__DEV_ENTER_ROOM__ === 'function', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  console.log('Entering Ruang VII-A modal...');
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
  console.log('Chalkboard Modal is open!');

  const bowlA = await page.$('[data-testid="bowl-container-A"]');
  const bowlB = await page.$('[data-testid="bowl-container-B"]');

  const boxA = await bowlA.boundingBox();
  const boxB = await bowlB.boundingBox();

  // Test Click & Hold Lifting:
  console.log('Clicking & Holding on Mangkuk A to lift marble...');
  await page.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2);
  await page.mouse.down();
  await new Promise(r => setTimeout(r, 150));

  // Move halfway between Bowl A and Bowl B
  const midX = (boxA.x + boxB.x) / 2 + boxA.width / 4;
  const midY = boxA.y + boxA.height / 2 - 25;
  await page.mouse.move(midX, midY, { steps: 8 });
  await new Promise(r => setTimeout(r, 300));

  // Screenshot while holding/lifting marble
  const shotLift = path.join(ARTIFACTS_DIR, 'showcase_click_and_hold_lifting.png');
  await page.screenshot({ path: shotLift });
  console.log('Saved Click & Hold Lifting screenshot to:', shotLift);

  // Drop onto Bowl B
  await page.mouse.move(boxB.x + boxB.width / 2, boxB.y + boxB.height / 2, { steps: 8 });
  await new Promise(r => setTimeout(r, 150));
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 500));

  await browser.close();
  console.log('Done capturing lifting screenshot!');
})();
