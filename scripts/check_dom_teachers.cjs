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

  const rooms = ['A1', 'A2', 'B1', 'B2'];
  for (const r of rooms) {
    await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), r);
    await new Promise(res => setTimeout(res, 800));

    const info = await page.evaluate(() => {
      const g = document.querySelector('g[style*="cursor: pointer"]');
      const fo = g ? g.querySelector('foreignObject') : null;
      const el = g ? g.querySelector('ellipse') : null;
      const svg = document.querySelector('svg');
      const viewBox = svg ? svg.getAttribute('viewBox') : null;
      return {
        viewBox,
        foreignObject: fo ? { x: fo.getAttribute('x'), y: fo.getAttribute('y'), w: fo.getAttribute('width'), h: fo.getAttribute('height') } : null,
        ellipse: el ? { cx: el.getAttribute('cx'), cy: el.getAttribute('cy') } : null
      };
    });

    console.log(`Room ${r}:`, JSON.stringify(info));
    await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    await new Promise(res => setTimeout(res, 600));
  }

  await browser.close();
})();
