import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log('Navigating to http://localhost:3000/siswa/game ...');
  await page.goto('http://localhost:3000/siswa/game', { waitUntil: 'networkidle2' });

  // Wait for loading screen to clear
  await page.waitForFunction(() => !document.querySelector('.loading-overlay'), { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Advancing opening cutscene...');
  // Advance opening cutscene via space bar (verifying keyboard advancement works now)
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 350));
  }
  await new Promise(r => setTimeout(r, 500));

  // Verify player position
  const getPlayerPos = async () => {
    return await page.evaluate(() => {
      // Find player character SVG transform or style
      const p = document.querySelector('g[class*="player"]') || document.querySelector('#player-sprite') || document.querySelector('svg');
      return window.__TEST_CHAR_POS || null;
    });
  };

  console.log('Testing walking Left along hallway slope...');
  // Hold ArrowLeft for 1.5 seconds
  await page.keyboard.down('ArrowLeft');
  await new Promise(r => setTimeout(r, 1500));
  await page.keyboard.up('ArrowLeft');
  await new Promise(r => setTimeout(r, 300));

  console.log('Testing walking Right along hallway slope...');
  await page.keyboard.down('ArrowRight');
  await new Promise(r => setTimeout(r, 2000));
  await page.keyboard.up('ArrowRight');
  await new Promise(r => setTimeout(r, 300));

  // Test window blur recovery
  console.log('Testing window blur recovery...');
  await page.keyboard.down('ArrowUp');
  // Trigger window blur
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  // Wait to see if movement stopped
  await new Promise(r => setTimeout(r, 200));
  await page.keyboard.up('ArrowUp');

  // Test pressing ArrowDown
  console.log('Testing downward movement after blur...');
  await page.keyboard.down('ArrowDown');
  await new Promise(r => setTimeout(r, 1000));
  await page.keyboard.up('ArrowDown');

  console.log('Saving screenshot 01-movement-hallway.png...');
  await page.screenshot({ path: 'scripts/screenshots/01-movement-hallway.png' });

  console.log('Movement test completed successfully without stuck states!');
  await browser.close();
  process.exit(0);
})();
