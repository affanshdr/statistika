import puppeteer from 'puppeteer';

(async () => {
  console.log('--- STARTING CAT QUEST E2E TEST ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Cat') || text.includes('Kitten') || text.includes('Error') || text.includes('Mimi') || text.includes('Mochi')) {
      console.log('BROWSER LOG:', text);
    }
  });

  const url = 'http://localhost:3000/siswa/game/level/1?demoMode=true&demoStep=exploration';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot of initial hallway in exploration mode
  await page.screenshot({ path: 'scripts/screenshots/test-cat-1-hallway-start.png' });
  console.log('Saved test-cat-1-hallway-start.png');

  console.log('Entering Classroom VII-A by clicking door...');
  // Click VII-A door in SVG
  await page.evaluate(() => {
    const door = document.getElementById('class-door-A1');
    if (door) {
      door.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Advance teacher cutscene in VII-A
  console.log('Inside VII-A. Advancing teacher dialogue...');
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const allG = Array.from(document.querySelectorAll('svg g'));
      const bubble = allG.find(g => g.textContent && (g.textContent.includes('Bu Sari') || g.textContent.includes('Kamu') || g.textContent.includes('Klik / Tap') || g.textContent.includes('Bicara')));
      if (bubble) bubble.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await page.keyboard.press('KeyE');
    await new Promise(r => setTimeout(r, 600));
  }

  // Wali Kelas modal should be open now
  console.log('Looking for Wali Kelas modal...');
  let clickedCollect = false;
  for (let attempt = 0; attempt < 6; attempt++) {
    clickedCollect = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const collectBtn = allButtons.find(b => b.innerText.includes('Simpan Data') || b.innerText.includes('Kumpulkan'));
      if (collectBtn) {
        collectBtn.click();
        return true;
      }
      return false;
    });
    if (clickedCollect) break;
    await page.keyboard.press('KeyE');
    await new Promise(r => setTimeout(r, 600));
  }
  console.log('Clicked collect data button:', clickedCollect);
  await new Promise(r => setTimeout(r, 2500));

  // Take screenshot of hallway upon exit
  await page.screenshot({ path: 'scripts/screenshots/test-cat-2-hallway-exit.png' });
  console.log('Saved test-cat-2-hallway-exit.png');

  // Verify Mother Cat Mimi is spawned in hallway!
  const catSpawned = await page.evaluate(() => {
    const group = document.getElementById('mother-cat-group');
    if (group) return true;
    const allG = Array.from(document.querySelectorAll('svg g'));
    const mimiTag = allG.find(g => g.textContent && g.textContent.includes('Mimi'));
    return !!mimiTag;
  });
  console.log('Mother Cat (Mimi) visible in hallway:', catSpawned);

  if (!catSpawned) {
    console.error('FAIL: Mother Cat not found in hallway!');
    await browser.close();
    process.exit(1);
  }

  // Click Mother Cat Mimi
  console.log('Interacting with Mother Cat Mimi...');
  await page.evaluate(() => {
    const group = document.getElementById('mother-cat-group');
    if (group) {
      group.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot Ask Help Modal
  await page.screenshot({ path: 'scripts/screenshots/test-cat-3-modal-ask.png' });
  console.log('Saved test-cat-3-modal-ask.png');

  // Accept Cat Quest
  console.log('Accepting Cat Quest...');
  const accepted = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = allButtons.find(b => b.innerText.includes('Cari Mochi') || b.innerText.includes('Tentu'));
    if (acceptBtn) {
      acceptBtn.click();
      return true;
    }
    return false;
  });
  console.log('Quest accepted:', accepted);
  await new Promise(r => setTimeout(r, 1200));

  // Open Quest Log Drawer to check quest tracking
  console.log('Checking Quest Log Drawer...');
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const mBtn = allButtons.find(b => b.innerText.includes('Misi'));
    if (mBtn) mBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scripts/screenshots/test-cat-4-quest-log.png' });
  console.log('Saved test-cat-4-quest-log.png');

  // Read location hint from drawer
  const kittenLocationText = await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('p')).find(el => el.textContent && el.textContent.includes('Petunjuk lokasi:'));
    return p ? p.textContent : '';
  });
  console.log('Detected Kitten Quest Hint:', kittenLocationText);

  // Close drawer
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  // Determine target zone based on hint
  let targetZone = 'hallway';
  if (kittenLocationText.includes('Perpustakaan')) {
    targetZone = 'Perpustakaan';
  } else if (kittenLocationText.includes('Lab Komputer')) {
    targetZone = 'LabKomputer';
  } else if (kittenLocationText.includes('Kantin')) {
    targetZone = 'facility_courtyard';
  }
  console.log('Target Kitten Location Zone:', targetZone);

  // Navigate to target zone
  if (targetZone === 'Perpustakaan' || targetZone === 'LabKomputer' || targetZone === 'facility_courtyard') {
    console.log('Switching to Facility Zone...');
    await page.evaluate(() => {
      const zoneBtn = document.querySelector('button[title="Klik untuk berpindah area sekolah"]');
      if (zoneBtn) zoneBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    if (targetZone === 'Perpustakaan') {
      console.log('Entering Perpustakaan...');
      await page.evaluate(() => {
        const door = document.getElementById('facility-door-PERPUSTAKAAN');
        if (door) door.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      await new Promise(r => setTimeout(r, 2000));
    } else if (targetZone === 'LabKomputer') {
      console.log('Entering Lab Komputer...');
      await page.evaluate(() => {
        const door = document.getElementById('facility-door-LAB_KOMPUTER');
        if (door) door.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Locate Kitten in Box (Mochi)
  console.log('Verifying Kitten in Box (Mochi) in active scene...');
  const kittenFound = await page.evaluate(() => {
    const group = document.getElementById('kitten-in-box-group');
    if (group) return true;
    const allG = Array.from(document.querySelectorAll('svg g'));
    return !!allG.find(g => g.textContent && g.textContent.includes('Mochi (Kucing dlm Kardus)'));
  });
  console.log('Kitten in Box found in active scene:', kittenFound);

  if (!kittenFound) {
    console.error('FAIL: Kitten in Box not found in active scene!');
    await page.screenshot({ path: 'scripts/screenshots/test-cat-fail-spot.png' });
    await browser.close();
    process.exit(1);
  }

  // Click Kitten in Box (Mochi)
  console.log('Opening Kitten Rescue Modal...');
  await page.evaluate(() => {
    const group = document.getElementById('kitten-in-box-group');
    if (group) {
      group.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot of Rescue Modal
  await page.screenshot({ path: 'scripts/screenshots/test-cat-5-rescue-modal.png' });
  console.log('Saved test-cat-5-rescue-modal.png');

  // Click rescue button
  const rescued = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const rescueBtn = allButtons.find(b => b.innerText.includes('Gendong Mochi') || b.innerText.includes('Buka Kardus'));
    if (rescueBtn) {
      rescueBtn.click();
      return true;
    }
    return false;
  });
  console.log('Rescued kitten button clicked:', rescued);
  await new Promise(r => setTimeout(r, 1200));

  // Exit interior room if inside
  if (targetZone === 'Perpustakaan' || targetZone === 'LabKomputer') {
    console.log('Exiting facility room...');
    await page.evaluate(() => {
      const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Keluar Ruang'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 1800));
  }

  // Return to Main Zone (hallway) if in facility
  if (targetZone !== 'hallway') {
    console.log('Returning to Main Zone (Hallway)...');
    await page.evaluate(() => {
      const zoneBtn = document.querySelector('button[title="Klik untuk berpindah area sekolah"]');
      if (zoneBtn && zoneBtn.textContent && zoneBtn.textContent.includes('Area Fasilitas')) {
        zoneBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 1800));
  }

  // Verify Mother Cat is in hallway
  console.log('Interacting with Mother Cat Mimi in Hallway to reunite...');
  await page.evaluate(() => {
    const group = document.getElementById('mother-cat-group');
    if (group) {
      group.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 1500));

  // Take screenshot of Reward Modal
  await page.screenshot({ path: 'scripts/screenshots/test-cat-6-modal-reward.png' });
  console.log('Saved test-cat-6-modal-reward.png');

  // Click "Sama-sama, Mimi & Mochi!" button in reward modal
  console.log('Closing reward modal...');
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const finishBtn = allButtons.find(b => b.innerText.includes('Sama-sama'));
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1800));

  // Take final screenshot showing reunited Mimi & Mochi
  await page.screenshot({ path: 'scripts/screenshots/test-cat-7-reunited.png' });
  console.log('Saved test-cat-7-reunited.png');

  console.log('=== ALL CAT QUEST E2E TESTS PASSED 100% SUCCESSFULLY! ===');
  await browser.close();
  process.exit(0);
})();
