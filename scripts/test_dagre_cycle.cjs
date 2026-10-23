const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

const mermaidJs = fs.readFileSync(path.resolve(__dirname, 'mermaid.min.js'), 'utf-8');

async function testLayout(name, edgeSyntax) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const code = `flowchart TD
    subgraph TopSection [" "]
      Start(["Mulai Permainan"]) --> Login["Input Username & PIN"]
      Login --> AuthCheck{"Cek Akun"}
      AuthCheck --> OldUser["User Terdaftar"]
      AuthCheck --> NewUser["User Baru"]
      OldUser --> Hub["Papan Kasus Detektif"]
      NewUser --> Hub
      Hub --> SelectCase{"Pilih Kasus Investigasi"}
    end
    
    SelectCase --> Case1["Kasus 1"]
    SelectCase --> Case2["Kasus 2"]
    
    Case1 --> C1_End["Lapor Kasus 1"]
    Case2 --> C2_End["Lapor Kasus 2"]
    
    C1_End --> Post1["Post-Test 1"]
    C2_End --> Post2["Post-Test 2"]
    
    Post1 --> Results["Evaluasi Hasil"]
    Post2 --> Results
    Results --> SaveCloud["Simpan Cloud"]
    
    SaveCloud --> NextChoice{"Lanjut Kasus Lain?"}
    NextChoice -->|"Selesai"| Finish(["Keluar"])
    ${edgeSyntax}`;

  const html = `<!DOCTYPE html><html><head><script>${mermaidJs}</script></head><body><div class="mermaid">${code}</div><script>mermaid.initialize({startOnLoad:true});</script></body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.mermaid svg');

  const svg = await page.$eval('.mermaid svg', el => el.outerHTML);
  const r = /<g class="node[^"]*" id="flowchart-([a-zA-Z0-9_]+)-[0-9]+"[^>]*transform="translate\(([^,]+),\s*([^)]+)\)"/g;
  let m;
  const pos = {};
  while ((m = r.exec(svg)) !== null) {
    pos[m[1]] = Math.round(parseFloat(m[3]));
  }
  console.log(name, '-> Start y:', pos['Start'], 'SelectCase y:', pos['SelectCase'], 'Finish y:', pos['Finish']);
  await browser.close();
}

(async () => {
  await testLayout('Standard arrow', 'NextChoice -->|"Lanjut"| SelectCase');
  await testLayout('Dotted arrow', 'NextChoice -.->|"Lanjut"| SelectCase');
  await testLayout('To Hub instead of SelectCase', 'NextChoice -.->|"Lanjut"| Hub');
  await testLayout('Return node connector', 'NextChoice -->|"Lanjut"| ReturnLoop["Kembali ke Pilih Kasus"]\\nReturnLoop -.-> SelectCase');
})();
