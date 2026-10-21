const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const pathA = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-A/VIII-A.webp';
  const pathB = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/public/Assets/Building/Ruang VIII-B/VIII-B.webp';

  const b64A = fs.readFileSync(pathA).toString('base64');
  const b64B = fs.readFileSync(pathB).toString('base64');

  await page.setContent(`
    <img id="imgA" src="data:image/webp;base64,${b64A}" />
    <img id="imgB" src="data:image/webp;base64,${b64B}" />
  `);
  await new Promise(r => setTimeout(r, 600));

  const result = await page.evaluate(() => {
    const analyze = (id) => {
      const img = document.getElementById(id);
      const canvas = document.createElement('canvas');
      canvas.width = 1235;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1235, 650);
      const data = ctx.getImageData(0, 0, 1235, 650).data;

      const getPixel = (x, y) => {
        const i = (Math.floor(y) * 1235 + Math.floor(x)) * 4;
        return [data[i], data[i+1], data[i+2]];
      };

      // Let's compute obstacle density between y=270 and y=370
      const scores = [];
      for (let x = 0; x < 1235; x++) {
        let count = 0;
        for (let y = 270; y <= 370; y++) {
          const [r, g, b] = getPixel(x, y);
          const isWood = (r > 95 && r > g + 15 && r > b + 25);
          const isDark = ((r + g + b) / 3 < 65);
          if (isWood || isDark) count++;
        }
        scores.push({ x, count });
      }

      // Smooth scores with moving average window 15
      const smoothed = [];
      for (let x = 7; x < 1235 - 7; x++) {
        let sum = 0;
        for (let dx = -7; dx <= 7; dx++) sum += scores[x + dx].count;
        smoothed.push({ x, val: sum / 15 });
      }

      // Find local minima between x=400 and x=850
      const valleys = [];
      for (let i = 1; i < smoothed.length - 1; i++) {
        const cur = smoothed[i];
        if (cur.x >= 400 && cur.x <= 850) {
          if (cur.val <= smoothed[i-1].val && cur.val <= smoothed[i+1].val && cur.val < 25) {
            valleys.push(cur);
          }
        }
      }

      // Also find the chalkboard bounds
      let cbMinX = 1235, cbMaxX = 0, cbMinY = 650, cbMaxY = 0;
      for (let y = 60; y < 320; y++) {
        for (let x = 150; x < 1100; x++) {
          const [r, g, b] = getPixel(x, y);
          if (g > r + 15 && g > b + 15 && g >= 50 && g <= 150 && r <= 110 && b <= 110) {
            if (x < cbMinX) cbMinX = x;
            if (x > cbMaxX) cbMaxX = x;
            if (y < cbMinY) cbMinY = y;
            if (y > cbMaxY) cbMaxY = y;
          }
        }
      }

      return {
        chalkboard: { minX: cbMinX, maxX: cbMaxX, centerX: Math.round((cbMinX + cbMaxX) / 2), minY: cbMinY, maxY: cbMaxY },
        valleys: valleys.slice(0, 10),
        lowest10: [...smoothed].filter(s => s.x >= 400 && s.x <= 850).sort((a,b) => a.val - b.val).slice(0, 15)
      };
    };

    return {
      VIII_A: analyze('imgA'),
      VIII_B: analyze('imgB')
    };
  });

  console.log('=== RUANG VIII-A ===');
  console.log('Chalkboard:', result.VIII_A.chalkboard);
  console.log('Lowest Obstacle Columns (Center Walking Corridors):');
  result.VIII_A.lowest10.forEach(s => console.log(`  x=${s.x}: obstacle_val=${s.val.toFixed(1)}`));

  console.log('\n=== RUANG VIII-B ===');
  console.log('Chalkboard:', result.VIII_B.chalkboard);
  console.log('Lowest Obstacle Columns (Center Walking Corridors):');
  result.VIII_B.lowest10.forEach(s => console.log(`  x=${s.x}: obstacle_val=${s.val.toFixed(1)}`));

  await browser.close();
})();
