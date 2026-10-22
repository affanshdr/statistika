const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // without bypass autoplay to see real browser behavior!
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('--- Step 1: Navigating to http://localhost:3000/ ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Check audio status right after load (before any click)
  let status1 = await page.evaluate(() => {
    return {
      audioCurrentTime: (window).audioObj ? (window).audioObj.currentTime : null,
      track: (window).gameAudioRef ? (window).gameAudioRef.getCurrentTrack?.() : null
    };
  });
  console.log('Status before click:', status1);

  // Click on the screen to trigger user interaction
  console.log('--- Step 2: Clicking on screen ---');
  await page.mouse.click(500, 400);
  await new Promise(r => setTimeout(r, 1000));

  // Check if Audio is playing
  let isPlaying = await page.evaluate(() => {
    // Let's inspect Audio elements created
    // We can test if audio is currently playing or paused
    return {
      storage: localStorage.getItem('casecode_audio_muted')
    };
  });
  console.log('Status after click:', isPlaying);

  await browser.close();
})();
