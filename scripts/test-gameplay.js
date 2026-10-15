import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.toString()));

  console.log('Navigating to http://localhost:3000/siswa/game?demo=true ...');
  await page.goto('http://localhost:3000/siswa/game?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click start button
  const startButton = await page.$('button.game-btn-start, button');
  if (startButton) {
    await startButton.click();
    console.log('Clicked start button!');
  }

  await new Promise(r => setTimeout(r, 1000));

  // Check if "Mulai Penyelidikan" popup is present and click it
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai Penyelidikan')) {
      console.log('Clicking Mulai Penyelidikan...');
      await btn.click();
      break;
    }
  }

  // Click "Investigasi →" for Level 1
  await new Promise(r => setTimeout(r, 1000));
  const levelButtons = await page.$$('button');
  for (const btn of levelButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Investigasi')) {
      console.log('Clicking Investigasi Level 1...');
      await btn.click();
      break;
    }
  }

  // Wait for Level 1 preloader & asset load
  await new Promise(r => setTimeout(r, 3000));

  console.log('Checking errors after entering game world:', errors);
  await page.screenshot({ path: 'scripts/screenshots/01-hallway.png' });
  console.log('Saved 01-hallway.png');

  // Switch to facility zone using the Zone Location Pill
  console.log('Switching to Facility Zone via Zone Location Pill...');
  const zoneBtn = await page.$('button[title="Klik untuk berpindah area sekolah"]');
  if (zoneBtn) {
    await zoneBtn.click();
    console.log('Clicked Zone Switcher button!');
  }
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'scripts/screenshots/02-facility-courtyard.png' });
  console.log('Saved 02-facility-courtyard.png');

  // In facility courtyard, player spawns at { x: 625, y: 550 }.
  // First, walk UP toward Lab Komputer door (x: 620, y: 390):
  console.log('Walking UP toward Lab Komputer door...');
  await page.keyboard.down('ArrowUp');
  await new Promise(r => setTimeout(r, 1600));
  await page.keyboard.up('ArrowUp');
  await new Promise(r => setTimeout(r, 600));

  // Press E to enter Lab Komputer
  console.log('Entering Lab Komputer with [E]...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'scripts/screenshots/03-inside-lab.png' });
  console.log('Saved 03-inside-lab.png');

  // Walk left toward Terminal station in Lab (from spawn 1050, 510 to 300, 440)
  console.log('Walking left toward Terminal in Lab...');
  await page.keyboard.down('ArrowLeft');
  await new Promise(r => setTimeout(r, 2600));
  await page.keyboard.up('ArrowLeft');
  await new Promise(r => setTimeout(r, 600));

  // Open Lab Terminal modal
  console.log('Opening Lab Terminal Modal with [E]...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'scripts/screenshots/04-lab-terminal-modal.png' });
  console.log('Saved 04-lab-terminal-modal.png');

  // Close modal with Escape
  console.log('Closing modal with [Escape]...');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 600));

  // Exit Lab back to facility courtyard
  console.log('Exiting Lab Komputer with [Escape]...');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'scripts/screenshots/05-back-to-facility.png' });
  console.log('Saved 05-back-to-facility.png');

  // Now walk right toward Perpustakaan (door is at 985, 395)
  console.log('Walking right toward Perpustakaan door...');
  await page.keyboard.down('ArrowRight');
  await new Promise(r => setTimeout(r, 2600));
  await page.keyboard.up('ArrowRight');
  await new Promise(r => setTimeout(r, 600));

  // Enter Perpustakaan with [E]
  console.log('Entering Perpustakaan with [E]...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'scripts/screenshots/06-inside-perpustakaan.png' });
  console.log('Saved 06-inside-perpustakaan.png');

  // Walk left toward Bookshelf in Perpustakaan (from spawn 1050, 510 to 280, 440)
  console.log('Walking toward Bookshelf in Perpustakaan...');
  await page.keyboard.down('ArrowLeft');
  await new Promise(r => setTimeout(r, 2600));
  await page.keyboard.up('ArrowLeft');
  await new Promise(r => setTimeout(r, 600));

  // Open Bookshelf modal with [E]
  console.log('Opening Bookshelf Modal with [E]...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'scripts/screenshots/07-library-book-modal.png' });
  console.log('Saved 07-library-book-modal.png');

  console.log('All tests completed successfully! Total errors encountered:', errors.length);
  if (errors.length > 0) console.log('Errors:', errors);

  await browser.close();
})();
