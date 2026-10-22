const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Capturing gate bubble with player name...');
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

  await page.goto('http://localhost:3000/siswa/game/level/1?preloaded=true&zone=gate', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.waitForSelector('#gate-intro-bubble', { timeout: 10000 });
  console.log('Gate bubble found!');

  const outPath = path.join(ARTIFACTS_DIR, 'showcase_gate_cloud_chat_username_clean.png');
  await page.screenshot({ path: outPath });
  console.log('Saved to:', outPath);

  await browser.close();
  console.log('Done!');
})();
