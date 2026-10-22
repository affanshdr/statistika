const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Click on the page
  await page.click('body');
  await new Promise(r => setTimeout(r, 500));

  const page1State = await page.evaluate(() => {
    // Check if any audio is playing
    const w = window;
    return {
      storageMuted: localStorage.getItem('casecode_audio_muted'),
      bgmAudioExists: !!(w.gameAudio && w.gameAudio.bgmAudio),
    };
  });
  console.log('Page 1 (Home) state:', page1State);

  // Now go to /siswa/game/level/1
  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.click('body');

  const page2State = await page.evaluate(() => {
    return {
      storageMuted: localStorage.getItem('casecode_audio_muted'),
    };
  });
  console.log('Page 2 (Level 1) state:', page2State);

  await browser.close();
})();
