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

  console.log('--- Initial state before entering room ---');
  console.log(await page.evaluate(() => window.__DEV_GET_STATE__()));

  // Test moving before entering room
  await page.keyboard.down('ArrowDown');
  await new Promise(r => setTimeout(r, 400));
  await page.keyboard.up('ArrowDown');
  console.log('--- State after initial ArrowDown ---');
  console.log(await page.evaluate(() => window.__DEV_GET_STATE__()));

  console.log('--- Enter A1 ---');
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('A1'));
  await new Promise(r => setTimeout(r, 800));
  console.log('--- In A1 ---');
  console.log(await page.evaluate(() => window.__DEV_GET_STATE__()));

  console.log('--- Exit A1 ---');
  await page.evaluate(() => window.__DEV_EXIT_ROOM__());
  await new Promise(r => setTimeout(r, 800));
  console.log('--- After exit A1 ---');
  console.log(await page.evaluate(() => window.__DEV_GET_STATE__()));

  console.log('--- Pressing ArrowDown ---');
  await page.keyboard.down('ArrowDown');
  await new Promise(r => setTimeout(r, 400));
  console.log('--- While holding ArrowDown ---');
  console.log(await page.evaluate(() => window.__DEV_GET_STATE__()));
  await page.keyboard.up('ArrowDown');

  console.log('--- Checking active modals / overlays in DOM ---');
  const domInfo = await page.evaluate(() => {
    return {
      activeModals: Array.from(document.querySelectorAll('[role="dialog"], .modal, div[style*="fixed"]')).map(el => ({
        tag: el.tagName,
        text: el.innerText.slice(0, 100),
        zIndex: window.getComputedStyle(el).zIndex,
      })),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean),
    };
  });
  console.log('DOM info:', JSON.stringify(domInfo, null, 2));

  await browser.close();
})();
