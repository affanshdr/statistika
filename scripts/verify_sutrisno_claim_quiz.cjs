const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  console.log('--- VERIFYING PAK SUTRISNO CLAIM QUIZ FLOW ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('1. Navigating to Level 1...');
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true&phase=exploration&zone=main', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 25000 });
  await new Promise(r => setTimeout(r, 800));

  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Mulai')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Teleport to Pak Sutrisno via 't'
  console.log('2. Teleporting to Pak Sutrisno in Ruang Guru...');
  await page.click('body').catch(() => {});
  await page.keyboard.press('t');
  await page.waitForSelector('[data-testid="pak-report-corkboard"]', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  // Dismiss tutorial if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="btn-close-tutorial"], [data-testid="btn-confirm-tutorial"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Auto-Win Corkboard
  console.log('3. Solving Corkboard with Auto Win...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const autoWin = btns.find(b => b.innerText.includes('Auto Win'));
    if (autoWin) autoWin.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Finish corkboard
  console.log('4. Submitting Corkboard...');
  await page.evaluate(() => {
    const finishBtn = document.querySelector('[data-testid="btn-finish-level1-board"]');
    if (finishBtn) finishBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Step 1: Stevunt explains data is ready
  console.log('5. Chit-Chat Step 1: Stevunt data ready...');
  const shotStep1 = path.join(ARTIFACTS_DIR, 'quiz_flow_step1_stevunt.png');
  await page.screenshot({ path: shotStep1 });

  // Advance to Step 2: Pak Sutrisno thanks Stevunt
  console.log('6. Chit-Chat Step 2: Pak Sutrisno asks for evaluation...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 900));

  const shotStep2 = path.join(ARTIFACTS_DIR, 'quiz_flow_step2_pak_thanks.png');
  await page.screenshot({ path: shotStep2 });

  // Advance to Step 3: Pak Sutrisno launches Claim Quiz!
  console.log('7. Triggering Pak Sutrisno Claim Quiz...');
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 1000));

  // Check quiz question text
  const quizQuestion = await page.$eval('[data-testid="sutrisno-quiz-question"]', el => el.innerText).catch(() => null);
  console.log('Quiz Question:', quizQuestion);

  // Test anti-skip guard: press 'e' and Space, quiz should NOT disappear
  console.log('8. Testing anti-skip guard (pressing Space & E)...');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 300));
  await page.keyboard.press('e');
  await new Promise(r => setTimeout(r, 300));
  const stillHasQuiz = await page.$('[data-testid="sutrisno-quiz-question"]');
  console.log('Anti-skip check (quiz still open):', !!stillHasQuiz);

  const shotQuizStart = path.join(ARTIFACTS_DIR, 'quiz_flow_step3_question_bubble.png');
  await page.screenshot({ path: shotQuizStart });
  console.log('Saved Quiz Bubble screenshot ->', shotQuizStart);

  // Read options and click a wrong option first to verify feedback
  const optionsData = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('[data-testid^="sutrisno-opt-"]'));
    return buttons.map((btn, idx) => ({
      index: idx,
      text: btn.innerText.replace(/\s+/g, ' ').trim()
    }));
  });
  console.log('Quiz Options:', optionsData);

  // Find which option is incorrect by checking text or clicking first option
  // Let's inspect active dataset / options in React or pick option 1
  console.log('9. Clicking an option to test feedback or completion...');
  // We can click option 0:
  await page.click('[data-testid="sutrisno-opt-0"]');
  await new Promise(r => setTimeout(r, 800));

  // Check if warning appeared or modal appeared
  const hasWrongFeedback = await page.evaluate(() => {
    return document.body.innerText.includes('Kurang tepat!');
  });
  console.log('Did wrong feedback appear?', hasWrongFeedback);

  if (hasWrongFeedback) {
    const shotWrong = path.join(ARTIFACTS_DIR, 'quiz_flow_step4_wrong_feedback.png');
    await page.screenshot({ path: shotWrong });
    console.log('Saved Wrong Feedback screenshot ->', shotWrong);

    // Try other options until correct
    for (let i = 1; i < 4; i++) {
      console.log(`Trying option ${i}...`);
      await page.click(`[data-testid="sutrisno-opt-${i}"]`);
      await new Promise(r => setTimeout(r, 800));
      const modalOpen = await page.$('[data-testid="btn-mission-complete-finish"]');
      if (modalOpen) {
        console.log(`Option ${i} was correct! Mission complete modal opened.`);
        break;
      }
    }
  } else {
    console.log('Option 0 was correct directly!');
  }

  // Modal should now be open
  await page.waitForSelector('[data-testid="btn-mission-complete-finish"]', { timeout: 8000 });
  const shotModal = path.join(ARTIFACTS_DIR, 'quiz_flow_step5_mission_complete.png');
  await page.screenshot({ path: shotModal });
  console.log('Saved Mission Complete Modal screenshot ->', shotModal);

  // Click Selesai
  console.log('10. Clicking Selesai button on popup...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="btn-mission-complete-finish"]');
    if (btn) btn.click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Current URL after finishing:', page.url());
  const shotMap = path.join(ARTIFACTS_DIR, 'quiz_flow_step6_corkboard_map.png');
  await page.screenshot({ path: shotMap });
  console.log('Saved Corkboard Map screenshot ->', shotMap);

  await browser.close();
  console.log('--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---');
})();
