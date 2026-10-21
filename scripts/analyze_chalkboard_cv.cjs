const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const images = [
    { id: 'A1', name: 'Ruang VII-A', path: 'http://localhost:3000/Assets/Building/Ruang%20VII-A/VII-A.webp' },
    { id: 'A2', name: 'Ruang VII-B', path: 'http://localhost:3000/Assets/Building/Ruang%20VII-B/VII-B.webp' },
    { id: 'B1', name: 'Ruang VIII-A', path: 'http://localhost:3000/Assets/Building/Ruang%20VIII-A/VIII-A.webp' },
    { id: 'B2', name: 'Ruang VIII-B', path: 'http://localhost:3000/Assets/Building/Ruang%20VIII-B/VIII-B.webp' },
  ];

  for (const img of images) {
    const analysis = await page.evaluate(async (img) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = img.path;
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const W = 1235;
          const H = 650;
          canvas.width = W;
          canvas.height = H;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, W, H);
          const data = ctx.getImageData(0, 0, W, H).data;

          // Find green chalkboard pixels:
          // In standard color space, the green chalkboard has:
          // Green dominant over Red and Blue (G > R * 1.15 and G > B * 1.15) and moderate brightness (G between 40 and 160)
          let minX = W, maxX = 0, minY = H, maxY = 0;
          let greenCount = 0;

          // Let's also sample horizontal slices to find blackboard extent
          const slices = [];
          for (let y = 150; y < 450; y += 5) {
            let rowGreen = 0;
            let firstX = -1, lastX = -1;
            for (let x = 200; x < 1000; x++) {
              const idx = (y * W + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              // Chalkboard green filter
              if (g > 50 && g < 155 && g > r * 1.1 && g > b * 1.1 && Math.abs(r - b) < 50) {
                rowGreen++;
                if (firstX === -1) firstX = x;
                lastX = x;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                greenCount++;
              }
            }
            if (rowGreen > 50) {
              slices.push({ y, count: rowGreen, firstX, lastX });
            }
          }

          resolve({
            id: img.id,
            name: img.name,
            greenCount,
            chalkboardBox: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
            slices: slices.slice(0, 10)
          });
        };
      });
    }, img);

    console.log('Analysis for', img.name, JSON.stringify(analysis, null, 2));
  }

  await browser.close();
})();
