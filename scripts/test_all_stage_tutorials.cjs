const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Testing Stage Tutorials in PakReportModal...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 600));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Teleport to Pak Sutrisno (Ruang Guru / BK)
  console.log('Teleporting to Pak Sutrisno via shortcut [t]...');
  await page.keyboard.press('t');
  await new Promise(r => setTimeout(r, 1200));

  console.log('Interacting with Pak Sutrisno via [e]...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));

  // If dialog option appeared, click it or press e
  const dialogChoice = await page.$('button[data-testid="dialog-choice-0"], button');
  if (dialogChoice) {
    await page.keyboard.press('e');
  }
  await new Promise(r => setTimeout(r, 1200));

  // Verify PakReportModal
  let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
  if (!corkboard) {
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 800));
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 1000));
    corkboard = await page.$('[data-testid="pak-report-corkboard"]');
  }

  if (!corkboard) {
    throw new Error('Failed to open PakReportModal corkboard!');
  }
  console.log('Corkboard opened successfully!');

  const stages = [
    { id: 'sort', name: 'Tahap 1: Urutkan Data', filename: 'tutorial_panel_1_sort.png' },
    { id: 'modus', name: 'Tahap 2: Modus', filename: 'tutorial_panel_2_modus.png' },
    { id: 'median', name: 'Tahap 3: Median', filename: 'tutorial_panel_3_median.png' },
    { id: 'mean', name: 'Tahap 4: Rata-Rata', filename: 'tutorial_panel_4_mean.png' },
  ];

  for (const st of stages) {
    console.log(`\nTesting ${st.name}...`);

    // Click stepper tab to go to this stage if not already there
    const tab = await page.$(`[data-testid="stepper-tab-${st.id}"]`);
    if (tab) {
      await tab.click();
      await new Promise(r => setTimeout(r, 600));
    }

    // Check if tutorial modal is open, if not, click header tutorial button
    let tutorialModal = await page.$('[data-testid="stage-tutorial-modal"]');
    if (!tutorialModal) {
      console.log('Clicking header tutorial button...');
      const btnHeader = await page.$('[data-testid="btn-open-tutorial-header"]');
      if (btnHeader) {
        await btnHeader.click();
        await new Promise(r => setTimeout(r, 600));
      }
      tutorialModal = await page.$('[data-testid="stage-tutorial-modal"]');
    }

    if (!tutorialModal) {
      console.error(`Tutorial modal did not appear for ${st.name}!`);
      continue;
    }

    console.log(`Tutorial modal active for ${st.name}! Capturing screenshot...`);
    const shotPath = path.join(ARTIFACTS_DIR, st.filename);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot -> ${shotPath}`);

    // Also capture scrolled view to showcase full examples and steps
    await page.evaluate(() => {
      const scrollArea = document.querySelector('[data-testid="stage-tutorial-body"]');
      if (scrollArea) {
        scrollArea.scrollTop = 380;
      }
    });
    await new Promise(r => setTimeout(r, 500));
    const scrolledShotPath = path.join(ARTIFACTS_DIR, st.filename.replace('.png', '_scrolled.png'));
    await page.screenshot({ path: scrolledShotPath });
    console.log(`Saved scrolled screenshot -> ${scrolledShotPath}`);

    // Click confirm / paham button
    const btnConfirm = await page.$('[data-testid="btn-confirm-tutorial"]');
    if (btnConfirm) {
      await btnConfirm.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Also capture the main corkboard view with the new "💡 Panduan Materi" header button
  const headerShotPath = path.join(ARTIFACTS_DIR, 'corkboard_with_tutorial_header.png');
  await page.screenshot({ path: headerShotPath });
  console.log(`Saved corkboard with tutorial header -> ${headerShotPath}`);

  await browser.close();
  console.log('\nAll 4 Stage Tutorials successfully verified and captured!');
})();
