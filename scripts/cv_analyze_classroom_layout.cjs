const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const rooms = [
    { id: 'A1', name: 'Ruang VII-A', file: 'Ruang%20VII-A/VII-A.webp', boardBottom: 250, boardCenter: 617 },
    { id: 'A2', name: 'Ruang VII-B', file: 'Ruang%20VII-B/VII-B.webp', boardBottom: 301, boardCenter: 686 },
    { id: 'B1', name: 'Ruang VIII-A', file: 'Ruang%20VIII-A/VIII-A.webp', boardBottom: 283, boardCenter: 694 },
    { id: 'B2', name: 'Ruang VIII-B', file: 'Ruang%20VIII-B/VIII-B.webp', boardBottom: 274, boardCenter: 506 },
  ];

  for (const r of rooms) {
    await page.goto(`http://localhost:3000/Assets/Building/${r.file}`, { waitUntil: 'load' });
    const analysis = await page.evaluate((room) => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = 1235;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1235, 650);

      const idata = ctx.getImageData(0, 0, 1235, 650).data;

      // Let's sample colors in front of the board from boardBottom to boardBottom + 160
      // Detect where the floor is (floor tiles are usually light cream / grey / beige)
      // vs student desks / chairs (dark brown wood) or students (white shirt, dark blue)
      const rows = [];
      for (let y = room.boardBottom - 20; y <= room.boardBottom + 160; y += 10) {
        let emptySpans = [];
        let curSpan = null;
        for (let x = 200; x <= 1000; x += 5) {
          const idx = (y * 1235 + x) * 4;
          const red = idata[idx];
          const green = idata[idx + 1];
          const blue = idata[idx + 2];
          // Floor tile color check (typical light tile: R,G,B > 140 or brightness > 150)
          const brightness = (red + green + blue) / 3;
          const isFloor = brightness > 150 && Math.abs(red - green) < 40 && Math.abs(green - blue) < 40;
          if (isFloor) {
            if (!curSpan) curSpan = { startX: x, endX: x };
            else curSpan.endX = x;
          } else {
            if (curSpan) {
              if (curSpan.endX - curSpan.startX >= 40) emptySpans.push(curSpan);
              curSpan = null;
            }
          }
        }
        if (curSpan && curSpan.endX - curSpan.startX >= 40) emptySpans.push(curSpan);
        rows.push({ y, emptySpans });
      }

      return { room: room.name, rows: rows.filter(r => r.emptySpans.length > 0) };
    }, r);

    console.log(r.name, JSON.stringify(analysis, null, 2));
  }

  await browser.close();
})();
