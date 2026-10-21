const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('Download the React DevTools') && !text.includes('[HMR]')) {
      console.log('PAGE LOG:', text);
    }
  });

  await page.goto('http://localhost:3000/siswa/game/level/1?demo=true', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => !document.body.innerText.includes('Memuat Investigasi'), { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1200));

  for (const btn of await page.$$('button')) {
    const t = await page.evaluate(el => el.innerText, btn);
    if (t.includes('Mulai')) { await btn.click(); await new Promise(r => setTimeout(r, 600)); }
  }

  const roomConfigs = [
    { id: 'A1', name: 'Ruang Kelas VII-A', x: 166 },
    { id: 'A2', name: 'Ruang Kelas VII-B', x: 390 },
    { id: 'B1', name: 'Ruang Kelas VIII-A', x: 839 },
    { id: 'B2', name: 'Ruang Kelas VIII-B', x: 1060 },
  ];

  let allPassed = true;

  for (const room of roomConfigs) {
    console.log(`\n======================================================`);
    console.log(`TESTING CLASSROOM: ${room.name} (${room.id})`);
    console.log(`======================================================`);

    // 1. Reset position in front of classroom at comfortable courtyard coordinate
    await page.evaluate((pos) => window.__DEV_SET_POS__(pos.x, 470), room);
    await new Promise(r => setTimeout(r, 300));

    // 2. Enter Classroom
    await page.evaluate((id) => window.__DEV_ENTER_ROOM__(id), room.id);
    await new Promise(r => setTimeout(r, 800));

    const stateIn = await page.evaluate(() => window.__DEV_GET_STATE__());
    console.log(`State inside ${room.id}:`, {
      insideRoom: stateIn.insideRoom ? stateIn.insideRoom.id : null,
      pos: stateIn.pos,
    });

    if (!stateIn.insideRoom || stateIn.insideRoom.id !== room.id) {
      console.error(`FAILED: Failed to enter room ${room.id}`);
      allPassed = false;
      continue;
    }

    // 3. Exit Classroom via "Keluar Ruang" UI button
    const exitClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.innerText.includes('Keluar Ruang'));
      if (b) {
        b.click();
        return true;
      }
      return false;
    });

    if (exitClicked) {
      console.log(`Clicked "Keluar Ruang ${room.id}" button in DOM.`);
    } else {
      console.log(`Fallback: using window.__DEV_EXIT_ROOM__()`);
      await page.evaluate(() => window.__DEV_EXIT_ROOM__());
    }

    // Allow exit transition and any modal popups (e.g. Cat Quest Mimi) to mount
    await new Promise(r => setTimeout(r, 900));

    // Dismiss Mother Cat quest modal if it spawned upon exiting this target class
    const dismissedModal = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el =>
        el.innerText.includes('Mochi') ||
        el.innerText.includes('Bantu') ||
        el.innerText.includes('Tentu') ||
        el.innerText.includes('Tutup') ||
        el.innerText.includes('Oke')
      );
      if (b) {
        const txt = b.innerText.trim().replace(/\n/g, ' ');
        b.click();
        return txt;
      }
      return null;
    });

    if (dismissedModal) {
      console.log(`Detected & accepted dialogue modal: "${dismissedModal}"`);
      await new Promise(r => setTimeout(r, 500));
    }

    const stateAfterExit = await page.evaluate(() => window.__DEV_GET_STATE__());
    console.log(`State after exiting ${room.id}:`, {
      insideRoom: stateAfterExit.insideRoom,
      pos: { x: Number(stateAfterExit.pos.x.toFixed(1)), y: Number(stateAfterExit.pos.y.toFixed(1)) },
      animFrameRunning: stateAfterExit.animFrameRunning,
    });

    const startPos = { ...stateAfterExit.pos };

    // 4. Test Movement: Down (ArrowDown)
    await page.keyboard.down('ArrowDown');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.up('ArrowDown');
    await new Promise(r => setTimeout(r, 100));

    const posAfterDown = await page.evaluate(() => window.__DEV_GET_STATE__().pos);
    const dY_down = posAfterDown.y - startPos.y;
    console.log(`  [↓] ArrowDown : y=${startPos.y.toFixed(1)} -> y=${posAfterDown.y.toFixed(1)} (Δy = +${dY_down.toFixed(1)})`);

    // 5. Test Movement: Right (ArrowRight)
    await page.keyboard.down('ArrowRight');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.up('ArrowRight');
    await new Promise(r => setTimeout(r, 100));

    const posAfterRight = await page.evaluate(() => window.__DEV_GET_STATE__().pos);
    const dX_right = posAfterRight.x - posAfterDown.x;
    console.log(`  [→] ArrowRight: x=${posAfterDown.x.toFixed(1)} -> x=${posAfterRight.x.toFixed(1)} (Δx = +${dX_right.toFixed(1)})`);

    // 6. Test Movement: Up (ArrowUp)
    await page.keyboard.down('ArrowUp');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.up('ArrowUp');
    await new Promise(r => setTimeout(r, 100));

    const posAfterUp = await page.evaluate(() => window.__DEV_GET_STATE__().pos);
    const dY_up = posAfterUp.y - posAfterRight.y;
    console.log(`  [↑] ArrowUp   : y=${posAfterRight.y.toFixed(1)} -> y=${posAfterUp.y.toFixed(1)} (Δy = ${dY_up.toFixed(1)})`);

    // 7. Test Movement: Left (ArrowLeft)
    await page.keyboard.down('ArrowLeft');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.up('ArrowLeft');
    await new Promise(r => setTimeout(r, 100));

    const posAfterLeft = await page.evaluate(() => window.__DEV_GET_STATE__().pos);
    const dX_left = posAfterLeft.x - posAfterUp.x;
    console.log(`  [←] ArrowLeft : x=${posAfterUp.x.toFixed(1)} -> x=${posAfterLeft.x.toFixed(1)} (Δx = ${dX_left.toFixed(1)})`);

    const movedDown = dY_down > 5;
    const movedRight = dX_right > 5;
    const movedUp = dY_up < -5;
    const movedLeft = dX_left < -5;

    if (movedDown && movedRight && movedUp && movedLeft) {
      console.log(`✅ VERIFIED: Character moves smoothly in ALL 4 DIRECTIONS after exiting ${room.name}!`);
    } else {
      console.error(`❌ FAILED: Movement impaired after exiting ${room.name}:`, { movedDown, movedRight, movedUp, movedLeft });
      allPassed = false;
    }
  }

  console.log(`\n======================================================`);
  if (allPassed) {
    console.log(`🎉 ALL 4 CLASSROOMS VERIFIED: ZERO STUCK BUGS!`);
  } else {
    console.error(`⚠️ SOME CLASSROOM EXITS FAILED.`);
  }
  console.log(`======================================================`);

  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
