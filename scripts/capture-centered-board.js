import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // 1. Desktop 1280 x 720
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  
  const btns = await page.$$('button');
  for (const b of btns) {
    const t = await page.evaluate(el => el.innerText, b);
    if (t.includes('Mulai')) await b.click();
  }
  await new Promise(r => setTimeout(r, 800));
  
  await page.keyboard.press('t');
  await new Promise(r => setTimeout(r, 1200));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1200));
  
  const shotDesktop = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/board_desktop_centered.png';
  await page.screenshot({ path: shotDesktop });
  console.log('Saved desktop screenshot:', shotDesktop);

  // 2. Mobile iPhone 14 Landscape: 844 x 390
  await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 600));
  const shotMobile = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/board_mobile_centered.png';
  await page.screenshot({ path: shotMobile });
  console.log('Saved mobile screenshot:', shotMobile);

  await browser.close();
})();
