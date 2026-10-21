const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('Capturing Scrolled Tutorial Views for Modus and Median...');
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

  // Teleport to Pak Sutrisno via shortcut [t]
  await page.keyboard.press('t');
  await new Promise(r => setTimeout(r, 1200));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));

  const dialogChoice = await page.$('button[data-testid="dialog-choice-0"], button');
  if (dialogChoice) {
    await page.keyboard.press('e');
  }
  await new Promise(r => setTimeout(r, 1200));

  let corkboard = await page.$('[data-testid="pak-report-corkboard"]');
  if (!corkboard) {
    await page.keyboard.press('t');
    await new Promise(r => setTimeout(r, 800));
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 1000));
  }

  // Close initial tutorial modal if open
  let closeBtn = await page.$('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
  if (closeBtn) {
    await closeBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Stages to capture scrolled
  const targets = [
    { id: 'modus', name: 'Modus', filenameScrolled: 'tutorial_panel_2_modus_scrolled.png' },
    { id: 'median', name: 'Median', filenameScrolled: 'tutorial_panel_3_median_scrolled.png' }
  ];

  for (const t of targets) {
    console.log(`Processing stage: ${t.name}...`);
    const tab = await page.$(`[data-testid="stepper-tab-${t.id}"]`);
    if (tab) {
      await tab.click();
      await new Promise(r => setTimeout(r, 800));
    }

    // Open tutorial modal via header button
    const btnHeader = await page.$('[data-testid="btn-open-tutorial-header"]');
    if (btnHeader) {
      await btnHeader.click();
      await new Promise(r => setTimeout(r, 600));
    }

    const tutorialModal = await page.$('[data-testid="stage-tutorial-modal"]');
    if (!tutorialModal) {
      console.error(`Tutorial modal did not appear for ${t.name}`);
      continue;
    }

    // Scroll down the modal body
    await page.evaluate(() => {
      const scrollArea = document.querySelector('[data-testid="stage-tutorial-body"]');
      if (scrollArea) {
        scrollArea.scrollTop = 380;
      }
    });
    await new Promise(r => setTimeout(r, 600));

    const shotPath = path.join(ARTIFACTS_DIR, t.filenameScrolled);
    await page.screenshot({ path: shotPath });
    console.log(`Saved scrolled screenshot -> ${shotPath}`);

    // Click confirm / paham
    const btnConfirm = await page.$('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (btnConfirm) {
      await btnConfirm.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  await browser.close();
  console.log('Scrolled views captured successfully!');
})();
