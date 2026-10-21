const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1235, height: 650 });

  const userImgA = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567050788_1d1d468e.png';
  const userImgB = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567061478_9511d57c.png';

  const b64A = fs.readFileSync(userImgA).toString('base64');
  const b64B = fs.readFileSync(userImgB).toString('base64');

  await page.setContent(`
    <img id="imgA" src="data:image/png;base64,${b64A}" />
    <img id="imgB" src="data:image/png;base64,${b64B}" />
  `);
  await new Promise(r => setTimeout(r, 600));

  const result = await page.evaluate(() => {
    const findTeacherSprite = (id) => {
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

      // Let's locate the floating name tag or interaction bubble
      // In the game, the speech bubble or name tag has distinct yellow or dark blue badge or yellow star or speech bubble text
      // Also look for character shadow or character silhouette between y=200 and y=420
      // Let's scan y=320..360 for character feet/legs:
      // In VIII-A, current teacher is around x=685, y=350.
      // In VIII-B, current teacher is around x=515, y=345.
      
      // Let's analyze a 200x200 patch around x=685 in A, and around x=515 in B
      return true;
    };

    return { ok: true };
  });

  await browser.close();
})();
