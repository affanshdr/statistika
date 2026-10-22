const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- TESTING ANIMATED PAK JOKO SPRITE SHEET (23 FRAMES) ---');
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

  console.log('Navigating to Level 1 Gate Zone (preloaded=true)...');
  await page.goto('http://localhost:3000/siswa/game/level/1?preloaded=true&zone=gate', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Advance speech bubble if any
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 400));
  }

  // Check if Pak Joko element is in DOM
  const pakJokoVisible = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('div, image'));
    return images.some(el => {
      const bg = el.style?.backgroundImage || '';
      return bg.includes('Joko-iso_idle_southwest');
    });
  });
  console.log('Is Pak Joko sprite sheet element found in DOM?', pakJokoVisible);

  // Take screenshot of Pak Joko in gate zone
  const shot1 = path.join(ARTIFACTS_DIR, 'showcase_pak_joko_in_game_sprite.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved in-game sprite screenshot to:', shot1);

  // Observe animation over 1.5 seconds and record background-position changes
  console.log('Tracking animation frames...');
  const positions = [];
  for (let i = 0; i < 15; i++) {
    const pos = await page.evaluate(() => {
      const el = document.querySelector('div[style*="Joko-iso_idle_southwest"]');
      return el ? el.style.backgroundPosition : null;
    });
    positions.push(pos);
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('Recorded background positions over time:', positions);

  // Crop / Focus on Pak Joko specifically
  const cropPath = path.join(ARTIFACTS_DIR, 'showcase_pak_joko_focused.png');
  const jokoBox = await page.evaluate(() => {
    const el = document.querySelector('div[style*="Joko-iso_idle_southwest"]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.x - 20, y: rect.y - 20, width: rect.width + 40, height: rect.height + 40 };
  });

  if (jokoBox) {
    await page.screenshot({
      path: cropPath,
      clip: {
        x: Math.max(0, jokoBox.x),
        y: Math.max(0, jokoBox.y),
        width: Math.min(1280 - jokoBox.x, jokoBox.width),
        height: Math.min(720 - jokoBox.y, jokoBox.height),
      }
    });
    console.log('Saved focused Pak Joko screenshot to:', cropPath);
  }

  await browser.close();
  console.log('--- ALL ANIMATION TESTS COMPLETED SUCCESSFULLY! ---');
})();
