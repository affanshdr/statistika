const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating to Splash Screen (http://localhost:3000)...');
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 2000));

  const status = await page.evaluate(() => {
    const video = document.querySelector('video');
    return {
      hasVideo: !!video,
      videoSrc: video ? video.currentSrc : null,
      videoPaused: video ? video.paused : null,
      videoReadyState: video ? video.readyState : null,
      videoDuration: video ? video.duration : null,
      videoCurrentTime: video ? video.currentTime : null,
      videoWidth: video ? video.videoWidth : null,
      videoHeight: video ? video.videoHeight : null
    };
  });

  console.log('Splash Screen Video Status:', status);

  // Take screenshot at 2s
  const ss1 = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/showcase_splash_screen_video_1.png';
  await page.screenshot({ path: ss1 });
  console.log('Saved screenshot 1 to:', ss1);

  // Wait 3 seconds to confirm video is animating and still playing
  await new Promise(r => setTimeout(r, 3000));

  const status2 = await page.evaluate(() => {
    const video = document.querySelector('video');
    return {
      currentTime: video ? video.currentTime : null,
      paused: video ? video.paused : null
    };
  });
  console.log('After 3s, Video Status:', status2);

  const ss2 = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/showcase_splash_screen_video_2.png';
  await page.screenshot({ path: ss2 });
  console.log('Saved screenshot 2 to:', ss2);

  await browser.close();
})();
