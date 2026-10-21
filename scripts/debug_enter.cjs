const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/siswa/game/level/1?zone=main&cinematic=pak_sanction_1');
  await new Promise(r => setTimeout(r, 2000));
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const txt = await page.evaluate(el => el.innerText, b);
    if (txt.includes('MULAI') || txt.includes('Mulai')) {
      console.log('Clicking button:', txt);
      await b.click();
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  const html = await page.evaluate(() => {
    return {
      svgExists: !!document.querySelector('svg'),
      svgCount: document.querySelectorAll('svg').length,
      bodyTextSlice: document.body.innerText.slice(0, 200),
      devState: window.__DEV_GET_STATE__ ? window.__DEV_GET_STATE__() : null
    };
  });
  console.log('After click:', html);
  await browser.close();
})();
