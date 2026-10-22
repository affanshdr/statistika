const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const audioDetails = await page.evaluate(async () => {
    // Check if any audio element is playing
    const audios = Array.from(document.querySelectorAll('audio'));
    const videos = Array.from(document.querySelectorAll('video'));

    return {
      audioCount: audios.length,
      audios: audios.map(a => ({ src: a.src, paused: a.paused, volume: a.volume, currentTime: a.currentTime })),
      videos: videos.map(v => ({ src: v.currentSrc, paused: v.paused, muted: v.muted })),
    };
  });
  console.log('DOM media elements:', audioDetails);

  // Now let's see why new Audio('/audio/game_bgm.mp3') might or might not play:
  const testBgm = await page.evaluate(async () => {
    const a = new Audio('/audio/game_bgm.mp3');
    a.volume = 0.5;
    try {
      await a.play();
      return { success: true, paused: a.paused, duration: a.duration };
    } catch (err) {
      return { success: false, error: err.toString() };
    }
  });
  console.log('Test playing game_bgm.mp3:', testBgm);

  await browser.close();
})();
