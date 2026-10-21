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
    // 1. Enter room
    await page.evaluate(id => window.__DEV_ENTER_ROOM__(id), room.id);
    await new Promise(r => setTimeout(r, 1400));

    // Screenshot 1: Teacher Ask
    const shot1 = path.join(ARTIFACTS_DIR, `anchored_bubble_${room.slug}_ask.png`);
    await page.screenshot({ path: shot1 });
    console.log(`Saved -> ${shot1}`);

    // If room is VII-B, let's also capture player_explain and teacher_reply!
    if (room.id === 'A2') {
      // Click teacher speech bubble to trigger next dialogue step
      const speechBubble = await page.$('g[style*="cursor: pointer"]');
      if (speechBubble) {
        await speechBubble.click();
        await new Promise(r => setTimeout(r, 800));
        const shotPlayer = path.join(ARTIFACTS_DIR, `anchored_bubble_vii_b_player.png`);
        await page.screenshot({ path: shotPlayer });
        console.log(`Saved -> ${shotPlayer}`);

        // Click again to trigger reply
        const nextBubble = await page.$('g[style*="cursor: pointer"]');
        if (nextBubble) {
          await nextBubble.click();
          await new Promise(r => setTimeout(r, 800));
          const shotReply = path.join(ARTIFACTS_DIR, `anchored_bubble_vii_b_reply.png`);
          await page.screenshot({ path: shotReply });
          console.log(`Saved -> ${shotReply}`);
        }
      }
    }

    // Exit room
    await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    await new Promise(r => setTimeout(r, 800));
  }

  await browser.close();
  console.log('ALL ANCHORED BUBBLE VERIFICATIONS COMPLETE!');
})();
