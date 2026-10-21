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

  console.log('--- Step 1: Enter A2 ---');
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A2'));
  await new Promise(r => setTimeout(r, 800));

  console.log('--- Step 2: Exit A2 ---');
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Keluar Ruang'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Check if Mother Cat modal appeared
  const catModalBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Mochi') || el.innerText.includes('Bantu'));
    if (b) {
      const text = b.innerText;
      b.click();
      return text;
    }
    return null;
  });
  console.log('Mother Cat modal button clicked:', catModalBtn);

  await new Promise(r => setTimeout(r, 500));

  console.log('State after accepting cat quest:', await page.evaluate(() => window.__DEV_GET_STATE__()));

  console.log('--- Step 3: Test movement after A2 exit ---');
  const startPos = await page.evaluate(() => window.__DEV_GET_STATE__().pos);

  await page.keyboard.down('ArrowDown');
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.up('ArrowDown');

  const afterDown = await page.evaluate(() => window.__DEV_GET_STATE__().pos);
  console.log(`Move ArrowDown: initial y=${startPos.y.toFixed(1)} -> y=${afterDown.y.toFixed(1)} (Δy = ${(afterDown.y - startPos.y).toFixed(1)})`);

  await page.keyboard.down('ArrowRight');
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.up('ArrowRight');

  const afterRight = await page.evaluate(() => window.__DEV_GET_STATE__().pos);
  console.log(`Move ArrowRight: initial x=${afterDown.x.toFixed(1)} -> x=${afterRight.x.toFixed(1)} (Δx = ${(afterRight.x - afterDown.x).toFixed(1)})`);

  await browser.close();
})();
