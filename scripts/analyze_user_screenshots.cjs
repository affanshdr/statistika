const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const userImgA = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567050788_1d1d468e.png';
  const userImgB = 'C:/Users/Asus_i7/.gemini/antigravity/brain/fa4932e4-58a9-4892-9eb7-cf6716c2899c/.user_uploaded/media_1792567061478_9511d57c.png';

  const base64A = fs.readFileSync(userImgA).toString('base64');
  const base64B = fs.readFileSync(userImgB).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:black;">
        <img id="imgA" src="data:image/png;base64,${base64A}" />
        <img id="imgB" src="data:image/png;base64,${base64B}" />
      </body>
    </html>
  `);

  const info = await page.evaluate(() => {
    const a = document.getElementById('imgA');
    const b = document.getElementById('imgB');
    return {
      a: { w: a.naturalWidth, h: a.naturalHeight },
      b: { w: b.naturalWidth, h: b.naturalHeight }
    };
  });

  console.log('User image natural sizes:', info);
  await browser.close();
})();
