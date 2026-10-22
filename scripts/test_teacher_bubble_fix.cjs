const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Set active player in localStorage to ALIFE10
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({
      id: 'test-player-alife10',
      username: 'alife10',
      displayName: 'ALIFE10'
    }));
  });

  // Navigate to Level 1
  await page.goto('http://localhost:3000/siswa/game/level/1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Trigger dev enter room A2 (Pak Bambang in Ruang VII-B)
  const dialogueResult = await page.evaluate(() => {
    if (typeof (window).__DEV_ENTER_ROOM__ === 'function') {
      (window).__DEV_ENTER_ROOM__('A2');
      return 'room_entered';
    }
    return 'dev_func_not_found';
  });
  console.log('DEV enter room result:', dialogueResult);

  await new Promise(r => setTimeout(r, 2000));

  // Click on teacher or interaction bubble if needed
  const bubbleText = await page.evaluate(() => {
    const bubbles = document.querySelectorAll('#teacher-cutscene-bubble, [id^="room-cutscene-bubble"]');
    return Array.from(bubbles).map(b => b.textContent?.trim());
  });
  console.log('Bubble texts found:', bubbleText);

  const artifactDir = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';
  await page.screenshot({ path: path.join(artifactDir, 'teacher_dialogue_fix_alife10.png') });
  console.log('Screenshot saved to teacher_dialogue_fix_alife10.png');

  await browser.close();
})();
