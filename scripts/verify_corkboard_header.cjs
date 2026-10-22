const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2', timeout: 25000 });
  await new Promise(r => setTimeout(r, 2000));

  // Directly set React state or trigger Pak Sutrisno report modal if possible,
  // or test rendering the PakReportModal component in a mock test
  const hasDevSkip = await page.$('[data-testid="btn-dev-tools-toggle"]');
  console.log('Dev tools toggle check:', hasDevSkip ? 'Found' : 'Clean (Not in DOM)');

  await browser.close();
})();
