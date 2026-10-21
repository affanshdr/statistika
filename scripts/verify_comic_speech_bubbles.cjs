const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1000));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }

  const rooms = [
    { id: 'A1', slug: 'vii_a', label: 'Ruang VII-A (Bu Sari)' },
    { id: 'A2', slug: 'vii_b', label: 'Ruang VII-B (Pak Bambang)' },
    { id: 'B1', slug: 'viii_a', label: 'Ruang VIII-A (Bu Rina)' },
    { id: 'B2', slug: 'viii_b', label: 'Ruang VIII-B (Pak Setiawan)' },
  ];

  for (const room of rooms) {
    console.log(`\n=== Testing ${room.label} ===`);
    // 1. Enter room
    await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), room.id);
    await new Promise(r => setTimeout(r, 1500));

    // Step A: Teacher Ask
    const shotAsk = path.join(ARTIFACTS_DIR, `unified_bubble_${room.slug}_ask.png`);
    await page.screenshot({ path: shotAsk });
    console.log(`Saved Teacher Ask -> ${shotAsk}`);

    // Check DOM order & positioning
    const askAudit = await page.evaluate(() => {
      const bubble = document.querySelector('#room-cutscene-bubble-teacher_ask');
      const player = document.querySelector('g[style*="pointer-events: none"] foreignObject');
      if (!bubble) return { error: 'Bubble not found' };
      const bubbleRect = bubble.getBoundingClientRect();
      const pathEl = bubble.querySelector('path');
      return {
        hasBubble: true,
        pathD: pathEl ? pathEl.getAttribute('d').slice(0, 60) + '...' : null,
        bubbleRect: { x: bubbleRect.x, y: bubbleRect.y, w: bubbleRect.width, h: bubbleRect.height },
      };
    });
    console.log('Ask Audit:', askAudit);

    // Step B: Player Explain
    // Click bubble or press Space
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 600));

    const shotPlayer = path.join(ARTIFACTS_DIR, `unified_bubble_${room.slug}_player.png`);
    await page.screenshot({ path: shotPlayer });
    console.log(`Saved Player Explain -> ${shotPlayer}`);

    const playerAudit = await page.evaluate(() => {
      const bubble = document.querySelector('#room-cutscene-bubble-player_explain');
      if (!bubble) return { error: 'Player bubble not found' };
      const bubbleRect = bubble.getBoundingClientRect();
      const pathEl = bubble.querySelector('path');
      
      // Check DOM hierarchy (is bubble rendered AFTER player in SVG?)
      const svg = document.querySelector('svg');
      const allElements = Array.from(svg.querySelectorAll('*'));
      const playerIndex = allElements.findIndex(el => el.querySelector && el.querySelector('div[style*="Stevunt"]'));
      const bubbleIndex = allElements.indexOf(bubble);
      
      return {
        hasBubble: true,
        pathD: pathEl ? pathEl.getAttribute('d').slice(0, 60) + '...' : null,
        bubbleRect: { x: bubbleRect.x, y: bubbleRect.y, w: bubbleRect.width, h: bubbleRect.height },
        isBubbleAfterPlayer: bubbleIndex > playerIndex,
      };
    });
    console.log('Player Audit:', playerAudit);

    // Step C: Teacher Reply
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 600));

    const shotReply = path.join(ARTIFACTS_DIR, `unified_bubble_${room.slug}_reply.png`);
    await page.screenshot({ path: shotReply });
    console.log(`Saved Teacher Reply -> ${shotReply}`);

    // Exit room
    await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    await new Promise(r => setTimeout(r, 800));
  }

  await browser.close();
  console.log('\n>>> ALL SPEECH BUBBLE TESTS AND AUDITS COMPLETE! <<<');
})();
