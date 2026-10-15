import puppeteer from 'puppeteer';

(async () => {
  console.log('--- STARTING GATE INTRO & TRANSITION E2E TEST ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Gate') || text.includes('Cinematic') || text.includes('Zone') || text.includes('Audio')) {
      console.log('BROWSER LOG:', text);
    }
  });

  const url = 'http://localhost:3000/siswa/game/level/1?demoMode=true&zone=gate';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  console.log('Waiting for asset preloader...');
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify Zone Pill is Zona 0: Depan Gerbang
  const zonePillText = await page.evaluate(() => {
    const btn = document.querySelector('button[title="Klik untuk berpindah area sekolah"]');
    return btn ? btn.textContent : '';
  });
  console.log('Zone Pill Text:', zonePillText);
  if (!zonePillText.includes('Depan Gerbang')) {
    console.error('ERROR: Zone Pill does not indicate Depan Gerbang! Text:', zonePillText);
    process.exit(1);
  }
  console.log('SUCCESS: Player is correctly in Zona 0: Depan Gerbang.');

  // 2. Check Monologue Speech Bubble
  const bubbleText = await page.evaluate(() => {
    const bubble = document.getElementById('gate-intro-bubble');
    return bubble ? bubble.textContent : '';
  });
  console.log('Initial Monologue Bubble Text:', bubbleText);
  if (!bubbleText.includes('Waduh, gawat!')) {
    console.error('ERROR: Initial monologue bubble missing or unexpected! Text:', bubbleText);
    process.exit(1);
  }
  console.log('SUCCESS: Stevunt monologue speech bubble step 0 rendered correctly.');

  // Take screenshot 1: Front Gate Spawn
  await page.screenshot({ path: 'scripts/screenshots/test-gate-1-spawn.png' });
  console.log('Saved screenshot: test-gate-1-spawn.png');

  // 3. Advance Monologue Speech Bubble by clicking it
  console.log('Clicking monologue speech bubble to advance...');
  await page.evaluate(() => {
    const bubble = document.getElementById('gate-intro-bubble');
    if (bubble) bubble.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 800));

  const bubbleTextStep1 = await page.evaluate(() => {
    const bubble = document.getElementById('gate-intro-bubble');
    return bubble ? bubble.textContent : '';
  });
  console.log('Advanced Monologue Bubble Text:', bubbleTextStep1);
  if (!bubbleTextStep1.includes('sebelum gerbang dikunci')) {
    console.error('ERROR: Advanced monologue bubble step 1 missing! Text:', bubbleTextStep1);
    process.exit(1);
  }
  console.log('SUCCESS: Stevunt monologue advanced to step 1.');

  // Take screenshot 2: Advanced Monologue
  await page.screenshot({ path: 'scripts/screenshots/test-gate-2-monologue-advanced.png' });
  console.log('Saved screenshot: test-gate-2-monologue-advanced.png');

  // 4. Test Satpam Modal Interaction
  console.log('Clicking Pos Satpam hotspot...');
  await page.evaluate(() => {
    const allG = Array.from(document.querySelectorAll('svg g'));
    const satpamG = allG.find(g => g.textContent && g.textContent.includes('Pos Satpam'));
    if (satpamG) satpamG.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 1000));

  const satpamModalVisible = await page.evaluate(() => {
    const modal = document.body.textContent;
    return modal.includes('Pak Joko (Satpam Sekolah)') && modal.includes('Kok baru sampai jam segini');
  });
  console.log('Satpam Modal Opened:', satpamModalVisible);
  if (!satpamModalVisible) {
    console.error('ERROR: Satpam modal failed to open!');
    process.exit(1);
  }
  console.log('SUCCESS: Pak Joko Satpam modal opened with authentic warning dialogue.');

  // Take screenshot 3: Satpam Modal
  await page.screenshot({ path: 'scripts/screenshots/test-gate-3-satpam-modal.png' });
  console.log('Saved screenshot: test-gate-3-satpam-modal.png');

  // 5. Enter School Courtyard via button in Satpam Modal
  console.log('Clicking "Lari Masuk Gerbang Sekarang!" button in Satpam Modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const enterBtn = buttons.find(b => b.textContent && b.textContent.includes('Lari Masuk Gerbang'));
    if (enterBtn) enterBtn.click();
  });
  // Wait for zone change and camera pan to Pak Sutrisno
  await new Promise(r => setTimeout(r, 3000));

  // 6. Verify transition to main zone and Pak Sutrisno shouting cutscene
  const mainZonePillText = await page.evaluate(() => {
    const btn = document.querySelector('button[title="Klik untuk berpindah area sekolah"]');
    return btn ? btn.textContent : '';
  });
  console.log('Zone Pill After Gate Entry:', mainZonePillText);
  if (!mainZonePillText.includes('Halaman Kelas')) {
    console.error('ERROR: Did not transition to Halaman Kelas! Text:', mainZonePillText);
    process.exit(1);
  }
  console.log('SUCCESS: Seamlessly transitioned into Zona 1: Halaman Kelas.');

  const shoutingBubbleText = await page.evaluate(() => {
    const allText = Array.from(document.querySelectorAll('svg text, svg div'));
    const shout = allText.find(el => el.textContent && (el.textContent.includes('Hey kamu') || el.textContent.includes('Baru jam segini')));
    return shout ? shout.textContent : '';
  });
  console.log('Pak Sutrisno Shouting Bubble:', shoutingBubbleText);
  if (!shoutingBubbleText.includes('Baru jam segini')) {
    console.error('ERROR: Pak Sutrisno shouting cutscene did not trigger! Text:', shoutingBubbleText);
    process.exit(1);
  }
  console.log('SUCCESS: Pak Sutrisno shouting cutscene triggered successfully!');

  // Take screenshot 4: Courtyard with Pak Sutrisno
  await page.screenshot({ path: 'scripts/screenshots/test-gate-4-pak-sutrisno-shout.png' });
  console.log('Saved screenshot: test-gate-4-pak-sutrisno-shout.png');

  console.log('--- ALL GATE INTRO TESTS PASSED WITH 100% SUCCESS ---');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
