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

  const stats = await page.evaluate(() => {
    const getStats = (id) => {
      const img = document.getElementById(id);
      const canvas = document.createElement('canvas');
      canvas.width = 1235;
      canvas.height = 650;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1235, 650);
      const data = ctx.getImageData(0, 0, 1235, 650).data;

      const samples = [];
      for (let y = 520; y <= 620; y += 20) {
        for (let x = 500; x <= 700; x += 40) {
          const i = (y * 1235 + x) * 4;
          samples.push(`rgb(${data[i]},${data[i+1]},${data[i+2]})`);
        }
      }
      return samples;
    };
    return { A: getStats('imgA'), B: getStats('imgB') };
  });

  console.log('Floor samples VIII-A (y:520-620):', stats.A);
  console.log('\nFloor samples VIII-B (y:520-620):', stats.B);
  await browser.close();
})();
