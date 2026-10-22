const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('Navigating directly to Stevunt standing beside Mimi...');
  await page.goto('http://localhost:3000/siswa/game/level/1?zone=main&cinematic=sanction_received&catStage=cat_spawned&x=380&y=530', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 2000));

  const promptStatus = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('text'));
    for (const t of texts) {
      if (t.textContent && t.textContent.includes('Meoow')) {
        const bbox = t.getBoundingClientRect();
        return {
          found: true,
          text: t.textContent,
          fill: t.getAttribute('fill'),
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height
        };
      }
    }
    return { found: false, allTexts: texts.map(t => t.textContent).filter(Boolean) };
  });

  console.log('Prompt status:', promptStatus);

  const screenshotPath = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/showcase_cat_prompt_fixed.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Full screenshot saved to:', screenshotPath);

  if (promptStatus.found) {
    const clipX = Math.max(0, promptStatus.x - 40);
    const clipY = Math.max(0, promptStatus.y - 30);
    const clipW = promptStatus.width + 80;
    const clipH = promptStatus.height + 60;
    const closeUpPath = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/showcase_cat_prompt_close_up.png';
    await page.screenshot({
      path: closeUpPath,
      clip: { x: clipX, y: clipY, width: clipW, height: clipH }
    });
    console.log('Close-up saved to:', closeUpPath);
  }

  await browser.close();
})();
