import puppeteer from 'puppeteer';

const OUT = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 722, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  for (const b of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, b);
    if (t.includes('Mulai')) await b.click();
  }
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.press('t');
  await new Promise(r => setTimeout(r, 1200));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1500));

  const sizes = [
    ['fit_1024x722', 1024, 722, 1],
    ['fit_1280x720', 1280, 720, 1],
    ['fit_hp_844x390', 844, 390, 2],
  ];
  for (const [name, w, h, dpr] of sizes) {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
    await new Promise(r => setTimeout(r, 700));
    const info = await page.evaluate(() => {
      const t = document.querySelector('[data-testid="pool-token-0"]');
      const cols = t?.parentElement ? getComputedStyle(t.parentElement).gridTemplateColumns.split(' ').length : 0;
      return { size: t?.getBoundingClientRect().width, cols };
    });
    console.log(name, '-> token size:', info.size, 'px, columns:', info.cols);
    await page.screenshot({ path: `${OUT}/${name}.png` });
  }

  // Sorted state at user's viewport
  await page.setViewport({ width: 1024, height: 722, deviceScaleFactor: 1 });
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.press('u');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: `${OUT}/fit_1024x722_sorted.png` });
  console.log('Saved sorted screenshot');

  await browser.close();
})();
