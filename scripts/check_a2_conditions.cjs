const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1000));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }

  // Expose deep condition inspector
  await page.evaluate(() => {
    window.__DEBUG_CONDITIONS__ = () => {
      const state = window.__DEV_GET_STATE__();
      return state;
    };
  });

  // Enter A1 and Exit A1
  console.log('--- A1 ---');
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A1'));
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Keluar Ruang'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));
  console.log('After exit A1:', await page.evaluate(() => window.__DEBUG_CONDITIONS__()));

  // Now Enter A2 and Exit A2
  console.log('--- A2 ---');
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A2'));
  await new Promise(r => setTimeout(r, 800));
  console.log('Inside A2:', await page.evaluate(() => window.__DEBUG_CONDITIONS__()));

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Keluar Ruang'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));
  console.log('After exit A2:', await page.evaluate(() => window.__DEBUG_CONDITIONS__()));

  // Try moving in A2
  await page.keyboard.down('ArrowDown');
  await new Promise(r => setTimeout(r, 300));
  console.log('Holding ArrowDown in A2:', await page.evaluate(() => window.__DEBUG_CONDITIONS__()));
  await page.keyboard.up('ArrowDown');

  await browser.close();
})();
