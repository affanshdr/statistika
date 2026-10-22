const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('--- 1. Testing Homepage (/) ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const homeAudioState = await page.evaluate(() => {
    // Check localStorage
    const mutedStorage = localStorage.getItem('stat_casecode_sound_muted') || localStorage.getItem('casecode_audio_muted');
    return {
      mutedStorage,
    };
  });
  console.log('Homepage storage:', homeAudioState);

  // Click on the page to trigger user interaction
  await page.click('body');
  await new Promise(r => setTimeout(r, 1000));

  console.log('--- 2. Testing Level 1 (/siswa/game/level/1) ---');
  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.click('body');

  await browser.close();
})();
