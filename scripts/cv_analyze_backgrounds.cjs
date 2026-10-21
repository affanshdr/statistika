const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const rooms = [
    { id: 'A1', name: 'Ruang VII-A', file: 'Ruang%20VII-A/VII-A.webp' },
    { id: 'A2', name: 'Ruang VII-B', file: 'Ruang%20VII-B/VII-B.webp' },
    { id: 'B1', name: 'Ruang VIII-A', file: 'Ruang%20VIII-A/VIII-A.webp' },
    { id: 'B2', name: 'Ruang VIII-B', file: 'Ruang%20VIII-B/VIII-B.webp' },
  ];

  for (const r of rooms) {
    await page.goto(`http://localhost:3000/Assets/Building/${r.file}`, { waitUntil: 'load' });
    const result = await page.evaluate((roomId) => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = 1235;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1235, 650);

      const idata = ctx.getImageData(0, 0, 1235, 650).data;

      // Find chalkboard: green pixels with G > R + 15, G > B + 15, G in [45..150]
      let boardMinX = 1235, boardMaxX = 0, boardMinY = 650, boardMaxY = 0;
      let count = 0;

      for (let y = 100; y < 450; y++) {
        for (let x = 150; x < 1050; x++) {
          const idx = (y * 1235 + x) * 4;
          const red = idata[idx];
          const green = idata[idx + 1];
          const blue = idata[idx + 2];
          if (green > 40 && green < 140 && green > red + 10 && green > blue + 10) {
            count++;
            if (x < boardMinX) boardMinX = x;
            if (x > boardMaxX) boardMaxX = x;
            if (y < boardMinY) boardMinY = y;
            if (y > boardMaxY) boardMaxY = y;
          }
        }
      }

      return {
        id: roomId,
        boardCount: count,
        board: {
          minX: boardMinX,
          maxX: boardMaxX,
          minY: boardMinY,
          maxY: boardMaxY,
          centerX: Math.round((boardMinX + boardMaxX) / 2),
          width: boardMaxX - boardMinX,
          height: boardMaxY - boardMinY
        }
      };
    }, r.id);

    console.log(r.name, result);
  }

  await browser.close();
})();
