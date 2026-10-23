const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('student', JSON.stringify({ id: 'test-01', name: 'Stevunt', nisn: '1234', classroom: { name: 'VII-A' } }));
  });
  await page.goto('http://localhost:3000/siswa/game/level/1?demoData=full&zone=main&cinematic=sanction_received&preloaded=true', { waitUntil: 'networkidle2', timeout: 25000 });
  await new Promise(r => setTimeout(r, 4000));
  // Enter Ruang Guru - find and click it
  const rgBtn = await page.$('[data-testid="zone-ruangguru"]');
  if (rgBtn) {
    await rgBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }
  await page.screenshot({ path: 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/mean_tutorial_check.png' });
  console.log('Done');
  await browser.close();
})();
