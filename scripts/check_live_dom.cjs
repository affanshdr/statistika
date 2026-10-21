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

  for (const r of ['A1', 'A2', 'B1', 'B2']) {
    await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), r);
    await new Promise(res => setTimeout(res, 1200));

    const domInfo = await page.evaluate(() => {
      const polygons = Array.from(document.querySelectorAll('polygon')).map(p => ({
        points: p.getAttribute('points'),
        fill: p.getAttribute('fill'),
        stroke: p.getAttribute('stroke')
      }));
      const foreignObjects = Array.from(document.querySelectorAll('foreignObject')).map(fo => ({
        x: fo.getAttribute('x'),
        y: fo.getAttribute('y'),
        w: fo.getAttribute('width'),
        h: fo.getAttribute('height'),
        text: (fo.textContent || '').slice(0, 50)
      }));
      return { polygons, foreignObjects };
    });

    console.log(`DOM Info in ${r}:`, JSON.stringify(domInfo, null, 2));
    await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    await new Promise(res => setTimeout(res, 600));
  }
  await browser.close();
})();
