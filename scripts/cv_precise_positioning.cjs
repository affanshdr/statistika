const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const rooms = [
    { id: 'B1', name: 'Ruang VIII-A', bg: 'Ruang VIII-A/VIII-A.webp', curX: 685, curY: 350 },
    { id: 'B2', name: 'Ruang VIII-B', bg: 'Ruang VIII-B/VIII-B.webp', curX: 515, curY: 345 }
  ];

  for (const r of rooms) {
    const url = 'http://localhost:3000/Assets/Building/' + encodeURI(r.bg);
    await page.goto(url, { waitUntil: 'load' });

    const cvData = await page.evaluate((curX, curY) => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = 1235;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1235, 650);
      const imgData = ctx.getImageData(0, 0, 1235, 650).data;

      const getPixel = (x, y) => {
        const i = (Math.floor(y) * 1235 + Math.floor(x)) * 4;
        return [imgData[i], imgData[i+1], imgData[i+2], imgData[i+3]];
      };

      // 1. CHALKBOARD DETECTION
      // Detect green chalkboard pixels
      let cbMinX = 1235, cbMaxX = 0, cbMinY = 650, cbMaxY = 0;
      let cbPixels = 0;

      for (let y = 60; y < 350; y++) {
        for (let x = 150; x < 1100; x++) {
          const [red, green, blue] = getPixel(x, y);
          // Green chalkboard characteristics:
          if (green > red + 10 && green > blue + 10 && green >= 45 && green <= 160 && red <= 120 && blue <= 120) {
            if (x < cbMinX) cbMinX = x;
            if (x > cbMaxX) cbMaxX = x;
            if (y < cbMinY) cbMinY = y;
            if (y > cbMaxY) cbMaxY = y;
            cbPixels++;
          }
        }
      }

      // 2. Scan every column between x=300 and x=950 for obstacles between y=240 and y=380
      // Obstacles: wood desk (brownish), students (navy blue or white clothes, hair), etc.
      // Floor in classroom: light gray or beige tiles
      const rows = [];
      for (let y = 260; y <= 370; y += 10) {
        const rowObstacles = [];
        for (let x = 300; x <= 950; x += 5) {
          const [red, green, blue] = getPixel(x, y);
          const maxDiff = Math.max(Math.abs(red - green), Math.abs(green - blue), Math.abs(red - blue));
          const brightness = (red + green + blue) / 3;
          
          // Is it obstacle (desk, chair, student)?
          // Wood desk: red > 100, red > blue + 30, green > blue + 10
          const isDeskWood = (red > 90 && red > green + 10 && red > blue + 25);
          // Dark clothing / hair / shadow: brightness < 70
          const isDark = (brightness < 75);
          // High saturation colored object (student bag, books)
          const isSaturated = (maxDiff > 45 && brightness < 200);

          if (isDeskWood || isDark || isSaturated) {
            rowObstacles.push(x);
          }
        }
        rows.push({ y, obstacles: rowObstacles });
      }

      return {
        chalkboard: {
          minX: cbMinX,
          maxX: cbMaxX,
          centerX: Math.round((cbMinX + cbMaxX) / 2),
          minY: cbMinY,
          maxY: cbMaxY,
          width: cbMaxX - cbMinX,
          height: cbMaxY - cbMinY,
          pixelCount: cbPixels
        },
        curConfig: { x: curX, y: curY },
        obstacleRows: rows
      };
    }, r.curX, r.curY);

    console.log('=== ' + r.name + ' ===');
    console.log('Chalkboard:', JSON.stringify(cvData.chalkboard));
    console.log('Current Teacher Pos:', JSON.stringify(cvData.curConfig));
    console.log('Obstacles by Y row:');
    cvData.obstacleRows.forEach(row => {
      if (row.obstacles.length > 0) {
        const minObs = Math.min(...row.obstacles);
        const maxObs = Math.max(...row.obstacles);
        console.log(`  y=${row.y}: count=${row.obstacles.length}, range=[${minObs}..${maxObs}]`);
      } else {
        console.log(`  y=${row.y}: CLEAR`);
      }
    });
  }

  await browser.close();
})();
