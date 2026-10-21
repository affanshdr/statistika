const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 800));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // 1. Ruang VIII-A
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('B1'));
  await new Promise(r => setTimeout(r, 1200));

  const teacherPosA = await page.evaluate(() => {
    const fos = Array.from(document.querySelectorAll('foreignObject'));
    const t = fos.find(fo => fo.innerHTML.includes('Bu Rina') || fo.innerHTML.includes('Bu%20Rina'));
    if (!t) return null;
    return {
      x: t.getAttribute('x'),
      y: t.getAttribute('y'),
      width: t.getAttribute('width'),
      height: t.getAttribute('height')
    };
  });
  console.log('DOM Bu Rina in Ruang VIII-A:', teacherPosA);

  // 2. Ruang VIII-B
  await page.evaluate(() => window.__DEV_EXIT_ROOM__());
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => window.__DEV_ENTER_ROOM__('B2'));
  await new Promise(r => setTimeout(r, 1200));

  const teacherPosB = await page.evaluate(() => {
    const fos = Array.from(document.querySelectorAll('foreignObject'));
    const t = fos.find(fo => fo.innerHTML.includes('Pak Setiawan') || fo.innerHTML.includes('Pak%20Setiawan'));
    if (!t) return null;
    return {
      x: t.getAttribute('x'),
      y: t.getAttribute('y'),
      width: t.getAttribute('width'),
      height: t.getAttribute('height')
    };
  });
  console.log('DOM Pak Setiawan in Ruang VIII-B:', teacherPosB);

  await browser.close();
})();
