const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('🧪 Verifying new Ruang VII-A background in-game with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Dismiss start button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('Mulai Penyelidikan') || text.includes('Mulai') || text.includes('Investigasi')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 600));
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Enter Ruang VII-A (A1)
    console.log('Entering Ruang VII-A via __DEV_ENTER_ROOM__...');
    await page.evaluate(() => {
      window.__DEV_ENTER_ROOM__('A1');
    });
    await new Promise(r => setTimeout(r, 1200));

    // Capture screenshot inside Ruang VII-A (spawn and dialogue)
    const shotPath1 = path.join(ARTIFACTS_DIR, 'new_ruang_vii_a_in_game_1.png');
    await page.screenshot({ path: shotPath1 });
    console.log(`📸 Saved in-game screenshot: ${shotPath1}`);

    // Progress dialogue or dismiss bubble
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));

    const shotPath2 = path.join(ARTIFACTS_DIR, 'new_ruang_vii_a_in_game_2.png');
    await page.screenshot({ path: shotPath2 });
    console.log(`📸 Saved in-game screenshot 2: ${shotPath2}`);

    // Walk Stevunt toward center/teacher
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('ArrowLeft');
      await new Promise(r => setTimeout(r, 50));
    }
    await new Promise(r => setTimeout(r, 600));

    const shotPath3 = path.join(ARTIFACTS_DIR, 'new_ruang_vii_a_in_game_walking.png');
    await page.screenshot({ path: shotPath3 });
    console.log(`📸 Saved walking screenshot: ${shotPath3}`);

    console.log('✨ In-game verification complete!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
})();
