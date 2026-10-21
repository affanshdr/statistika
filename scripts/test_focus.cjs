const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on('console', msg => console.log('PAGE:', msg.text()));

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1000));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }

  // Enter room A1
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A1'));
  await new Promise(r => setTimeout(r, 800));

  console.log('--- Inside room A1 ---');
  console.log('Active element before click:', await page.evaluate(() => document.activeElement.tagName));

  // Click exit button
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Keluar Ruang'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('--- After clicking exit button ---');
  console.log('Active element after exit:', await page.evaluate(() => document.activeElement.tagName));

  // Check if keydown fires
  await page.evaluate(() => {
    window.__KEY_LOG__ = [];
    window.addEventListener('keydown', (e) => window.__KEY_LOG__.push(e.key));
  });

  await page.keyboard.down('ArrowDown');
  await new Promise(r => setTimeout(r, 300));
  const keysCaught = await page.evaluate(() => window.__KEY_LOG__);
  console.log('Keys caught by window listener:', keysCaught);
  console.log('Game state holding ArrowDown:', await page.evaluate(() => window.__DEV_GET_STATE__()));
  await page.keyboard.up('ArrowDown');

  await browser.close();
})();
