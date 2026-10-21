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

  const results = await page.evaluate(() => {
    const scanRoom = (id, label) => {
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

      // 1. CHALKBOARD
      // Find chalkboard green pixels
      let cbXMin = 1235, cbXMax = 0, cbYMin = 650, cbYMax = 0;
      for (let y = 50; y < 350; y++) {
        for (let x = 100; x < 1135; x++) {
          const [r, g, b] = getPixel(x, y);
          // Dark/medium green chalkboard
          if (g > r + 12 && g > b + 12 && g >= 40 && g <= 160 && r <= 120 && b <= 120) {
            if (x < cbXMin) cbXMin = x;
            if (x > cbXMax) cbXMax = x;
            if (y < cbYMin) cbYMin = y;
            if (y > cbYMax) cbYMax = y;
          }
        }
      }
      const cbCenterX = Math.round((cbXMin + cbXMax) / 2);

      // 2. SCAN HORIZONTAL SLICES FOR DESKS & CHAIRS
      // In SMP classroom pixel art, student desks have brown wood tops and dark chairs.
      // Let's scan y = 290, 310, 330, 350, 370
      const scanY = [290, 310, 330, 350];
      const sliceAnalysis = [];

      for (const y of scanY) {
        // Classify each pixel in x as "floor" vs "desk/student"
        // Let's sample left edge (x=50..150) and bottom (y=500..600) to find typical floor colors
        // Usually floor is light cream/beige or grey tiles
        const xMap = [];
        for (let x = 200; x <= 1000; x++) {
          const [r, g, b] = getPixel(x, y);
          const brightness = (r + g + b) / 3;
          // Desk wood: reddish-brown
          const isWood = (r > 80 && r > g + 12 && r > b + 25);
          // Dark object / chair:
          const isDark = (brightness < 60);
          // White shirt / paper:
          const isWhite = (r > 200 && g > 200 && b > 200);
          // Blue pants:
          const isNavy = (b > r + 15 && b > g && brightness < 110);

          const isObstacle = isWood || isDark || isWhite || isNavy;
          xMap.push({ x, isObstacle });
        }

        // Find contiguous obstacle spans and gaps
        const gaps = [];
        let curGap = null;
        for (const p of xMap) {
          if (!p.isObstacle) {
            if (!curGap) curGap = { start: p.x, end: p.x };
            else curGap.end = p.x;
          } else {
            if (curGap) {
              if (curGap.end - curGap.start >= 20) gaps.push(curGap);
              curGap = null;
            }
          }
        }
        if (curGap && curGap.end - curGap.start >= 20) gaps.push(curGap);

        sliceAnalysis.push({ y, gaps });
      }

      return {
        label,
        chalkboard: { xMin: cbXMin, xMax: cbXMax, centerX: cbCenterX, yMin: cbYMin, yMax: cbYMax, width: cbXMax - cbXMin, height: cbYMax - cbYMin },
        slices: sliceAnalysis
      };
    };

    return {
      VIII_A: scanRoom('imgA', 'Ruang VIII-A'),
      VIII_B: scanRoom('imgB', 'Ruang VIII-B')
    };
  });

  console.log('=== ' + results.VIII_A.label + ' ===');
  console.log('Chalkboard:', results.VIII_A.chalkboard);
  results.VIII_A.slices.forEach(s => {
    console.log(`  y=${s.y} clear spans: ` + s.gaps.map(g => `[${g.start}..${g.end}] (w:${g.end - g.start})`).join(', '));
  });

  console.log('\n=== ' + results.VIII_B.label + ' ===');
  console.log('Chalkboard:', results.VIII_B.chalkboard);
  results.VIII_B.slices.forEach(s => {
    console.log(`  y=${s.y} clear spans: ` + s.gaps.map(g => `[${g.start}..${g.end}] (w:${g.end - g.start})`).join(', '));
  });

  await browser.close();
})();
