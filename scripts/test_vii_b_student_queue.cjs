const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({
      id: 'test-alif',
      username: 'alif',
      displayName: 'ALIF'
    }));
  });

  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2' });
  
  // Wait for GamePreloader to completely finish and unmount
  await page.waitForFunction(() => !document.body.innerText.includes('MEMUAT INVESTIGASI'), { timeout: 25000 });
  console.log('GamePreloader finished!');
  await new Promise(r => setTimeout(r, 1000));
  
  // Wait until NPath is fully mounted and has attached dev helpers
  await page.waitForFunction(() => typeof (window).__DEV_OPEN_WALI__ === 'function', { timeout: 20000 });
  console.log('NPath dev functions ready!');

  // Open A2 (Kelas VII-B)
  await page.evaluate(() => {
    (window).__DEV_OPEN_WALI__('A2');
  });

  await page.waitForSelector('[data-testid="wali-kelas-modal-content"]', { timeout: 15000 });
  console.log('WaliKelasModal is open for A2!');
  // Wait for any preloader exit fade animation to finish completely
  await new Promise(r => setTimeout(r, 2500));

  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

  // 1. Initial screenshot
  await page.screenshot({ path: path.join(artifactDir, 'vii_b_queue_initial.png') });
  console.log('Saved vii_b_queue_initial.png');

  // 2. Toggle simulation
  await page.waitForSelector('[data-testid="btn-simulasi-antrean"]', { timeout: 5000 });
  await page.$eval('[data-testid="btn-simulasi-antrean"]', el => el.click());
  console.log('Clicked simulation toggle button via eval click!');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'vii_b_queue_simulated.png') });
  console.log('Saved vii_b_queue_simulated.png');

  // 3. Click Option B (Kurang dari 160 cm)
  const buttons2 = await page.$$('button');
  for (const b of buttons2) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt && txt.includes('Kurang dari 160 cm')) {
      await b.click();
      console.log('Clicked Option B: Kurang dari 160 cm!');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 700));

  const collectBtn = await page.$('[data-testid="btn-collect-wali-data"]');
  const disabled = await page.evaluate(el => el ? el.disabled : null, collectBtn);
  console.log('Collect Data button enabled:', disabled === false ? 'YES (UNLOCKED)' : 'NO (DISABLED)');

  await page.screenshot({ path: path.join(artifactDir, 'vii_b_queue_solved.png') });
  console.log('Saved vii_b_queue_solved.png');

  await browser.close();
  console.log('All done successfully!');
})();
