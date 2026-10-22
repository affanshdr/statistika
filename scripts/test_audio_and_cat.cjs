const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('--- TEST 1: Homepage Audio Check ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Click on the page to trigger user interaction
  await page.mouse.click(640, 360);
  await new Promise(r => setTimeout(r, 800));

  const homeAudioStatus = await page.evaluate(() => {
    const ga = (window).gameAudio;
    const bgm = ga?.getBgmAudio();
    return {
      hasGameAudio: !!ga,
      track: ga?.getCurrentTrack(),
      isMuted: ga?.getMuted(),
      bgmPaused: bgm?.paused,
      bgmCurrentTime: bgm?.currentTime,
      bgmSrc: bgm?.src,
    };
  });
  console.log('Home Audio Status:', homeAudioStatus);

  console.log('--- TEST 2: Level 1 Game Audio Check ---');
  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click on the game viewport
  await page.mouse.click(640, 360);
  await new Promise(r => setTimeout(r, 800));

  const levelAudioStatus = await page.evaluate(() => {
    const ga = (window).gameAudio;
    const bgm = ga?.getBgmAudio();
    return {
      hasGameAudio: !!ga,
      track: ga?.getCurrentTrack(),
      isMuted: ga?.getMuted(),
      bgmPaused: bgm?.paused,
      bgmCurrentTime: bgm?.currentTime,
      bgmSrc: bgm?.src,
    };
  });
  console.log('Level 1 Audio Status:', levelAudioStatus);

  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
  await page.screenshot({ path: path.join(artifactDir, 'level1_audio_and_hud.png') });
  console.log('Level 1 HUD screenshot saved to level1_audio_and_hud.png');

  await browser.close();
  console.log('Audio test finished successfully!');
})();
