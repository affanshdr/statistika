import puppeteer from 'puppeteer';

(async () => {
  console.log('--- TESTING WALKING THROUGH GATE ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const url = 'http://localhost:3000/siswa/game/level/1?demoMode=true&zone=gate';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Holding ArrowUp key to walk up through the gate...');
  await page.keyboard.down('ArrowUp');
  // Walk for 2.5 seconds
  await new Promise(r => setTimeout(r, 2500));
  await page.keyboard.up('ArrowUp');

  await new Promise(r => setTimeout(r, 1500));

  const currentZone = await page.evaluate(() => {
    const btn = document.querySelector('button[title="Klik untuk berpindah area sekolah"]');
    return btn ? btn.textContent : '';
  });
  console.log('Current Zone after walking through gate:', currentZone);

  if (currentZone.includes('Halaman Kelas')) {
    console.log('SUCCESS: Auto-transitioned to Halaman Kelas by walking through gate!');
  } else {
    console.error('ERROR: Failed to walk through gate! Zone:', currentZone);
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('WALK TEST ERROR:', err);
  process.exit(1);
});
