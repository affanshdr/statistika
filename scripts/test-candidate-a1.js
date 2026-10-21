import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  const btns = await page.$$('button');
  for (const b of btns) {
    const t = await page.evaluate(el => el.innerText, b);
    if (t.includes('Mulai') || t.includes('Investigasi')) await b.click();
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A1'));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/spawn_candidate_A1.png' });
  console.log('Candidate A1 screenshot saved!');
  await browser.close();
})();
