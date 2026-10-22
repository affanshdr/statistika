const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- TESTING MINIMALIST NOISE-FREE CHALKBOARD MODAL ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({
      id: 'test-player-budi',
      username: 'BUDI',
      displayName: 'Budi Santoso'
    }));
    localStorage.setItem('student', JSON.stringify({
      id: 'test-player-budi',
      name: 'BUDI',
      username: 'BUDI'
    }));
  });

  console.log('Navigating to Level 1...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&phase=exploration&zone=gate', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 25000 });
  await new Promise(r => setTimeout(r, 1000));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log('Waiting for game world and __DEV_ENTER_ROOM__...');
  await page.waitForFunction(() => typeof window.__DEV_ENTER_ROOM__ === 'function', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Entering Ruang VII-A modal...');
  await page.evaluate(() => {
    window.__DEV_ENTER_ROOM__('A1');
  });
  await new Promise(r => setTimeout(r, 1500));

  // Advance teacher cutscene if any
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));
  }

  await page.waitForSelector('[data-testid="bowl-container-A"]', { timeout: 10000 });
  console.log('Chalkboard Modal is open!');

  // Capture initial state
  const shotInitial = path.join(ARTIFACTS_DIR, 'showcase_clean_minimalist_initial.png');
  await page.screenshot({ path: shotInitial });
  console.log('Saved initial clean modal to:', shotInitial);

  const bowlA = await page.$('[data-testid="bowl-container-A"]');
  const bowlB = await page.$('[data-testid="bowl-container-B"]');
  const bowlC = await page.$('[data-testid="bowl-container-C"]');
  const bowlD = await page.$('[data-testid="bowl-container-D"]');

  // Helper to read count of a bowl
  const getCount = async (bowl) => {
    return await page.evaluate(el => {
      const match = el.innerText.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }, bowl);
  };

  console.log('Initial counts:');
  console.log('A:', await getCount(bowlA), 'B:', await getCount(bowlB), 'C:', await getCount(bowlC), 'D:', await getCount(bowlD));

  // Transfer from A to B until A reaches 11
  console.log('Transferring from A to B until A = 11...');
  while ((await getCount(bowlA)) > 11) {
    await bowlA.click();
    await new Promise(r => setTimeout(r, 300));
    await bowlB.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // Transfer from C to D until C reaches 11
  console.log('Transferring from C to D until C = 11...');
  while ((await getCount(bowlC)) > 11) {
    await bowlC.click();
    await new Promise(r => setTimeout(r, 300));
    await bowlD.click();
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('Final counts:');
  console.log('A:', await getCount(bowlA), 'B:', await getCount(bowlB), 'C:', await getCount(bowlC), 'D:', await getCount(bowlD));

  await new Promise(r => setTimeout(r, 800));

  // Capture solved state
  const shotSolved = path.join(ARTIFACTS_DIR, 'showcase_clean_minimalist_solved.png');
  await page.screenshot({ path: shotSolved });
  console.log('Saved solved clean modal to:', shotSolved);

  // Verify collect button status
  const collectBtn = await page.$('[data-testid="btn-collect-wali-data"]');
  const isDisabled = await page.evaluate(el => el.disabled, collectBtn);
  const btnText = await page.evaluate(el => el.innerText, collectBtn);
  console.log('Button text:', btnText.replace(/\n/g, ' '), '| Disabled status:', isDisabled);

  if (!isDisabled) {
    console.log('SUCCESS: Collect button unlocked!');
  } else {
    throw new Error('Collect button is still disabled after solving!');
  }

  await browser.close();
  console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
})();
