const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('student', JSON.stringify({ id: 'test-01', name: 'Stevunt', nisn: '1234', classroom: { name: 'VII-A' } }));
  });

  // Navigate to Level 1
  await page.goto('http://localhost:3000/siswa/game/level/1?demoData=full&zone=main&cinematic=sanction_received&preloaded=true', { waitUntil: 'networkidle2', timeout: 25000 });
  await new Promise(r => setTimeout(r, 3500));

  // The stage tutorial modal might pop up automatically or we can open it from Panduan Materi button
  // Let's check if stage tutorial modal is currently visible
  let tutorialModal = await page.$('[data-testid="stage-tutorial-modal"]');
  if (tutorialModal) {
    console.log('Stage tutorial modal found, taking initial screenshot...');
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/tutorial_modal_top.png' });

    // Scroll down inside the tutorial body
    await page.evaluate(() => {
      const body = document.querySelector('[data-testid="stage-tutorial-body"]');
      if (body) {
        body.scrollTop = body.scrollHeight;
      }
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/tutorial_modal_scrolled.png' });
    console.log('Scrolled tutorial modal screenshot saved.');
  } else {
    console.log('Stage tutorial modal not currently open, screenshotting game state.');
    await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/game_state_check.png' });
  }

  await browser.close();
})();
