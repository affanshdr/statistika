const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

const mermaidJs = fs.readFileSync(path.resolve(__dirname, 'mermaid.min.js'), 'utf-8');

async function testCycle(title, codeSnippet) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const html = `<!DOCTYPE html><html><head><script>${mermaidJs}</script></head><body><div class="mermaid">${codeSnippet}</div><script>mermaid.initialize({startOnLoad:true});</script></body></html>`;
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.mermaid svg');

  const svg = await page.$eval('.mermaid svg', el => el.outerHTML);
  const r = /<g class="node[^"]*" id="flowchart-([a-zA-Z0-9_]+)-[0-9]+"[^>]*transform="translate\(([^,]+),\s*([^)]+)\)"/g;
  let m;
  const pos = {};
  while ((m = r.exec(svg)) !== null) {
    pos[m[1]] = Math.round(parseFloat(m[3]));
  }
  console.log(title.padEnd(30), 'Start y:', pos['Start'], 'C1_1 y:', pos['C1_1'], 'C2_1 y:', pos['C2_1']);
  await browser.close();
}

(async () => {
  // Option 1: Both Case1 and Case2 combined in a single subgraph
  const code1 = `flowchart TD
    Start(["Mulai"]) --> Login["Login"] --> AuthCheck{"Cek"}
    AuthCheck --> Old["Lama"] & New["Baru"] --> Hub["Hub"] --> SelectCase{"Pilih Kasus"}
    
    subgraph Cases ["Kasus Investigasi"]
      SelectCase --> Case1["Kasus 1"] & Case2["Kasus 2"]
      Case1 --> C1_1["C1"] --> C1_6["C1 End"]
      Case2 --> C2_1["C2"] --> C2_6["C2 End"]
    end
    
    C1_6 --> Post1["P1"]
    C2_6 --> Post2["P2"]
    Post1 & Post2 --> Results["Hasil"] --> Save["Save"]
    Save --> NextChoice{"Lanjut?"}
    NextChoice -->|"Ya"| SelectCase
    NextChoice -->|"Tidak"| Finish(["Keluar"])`;

  await testCycle('Option 1 (Single subgraph for both)', code1);

  // Option 2: Wrap whole game loop in a container subgraph
  const code2 = `flowchart TD
    Start(["Mulai"]) --> Login["Login"] --> AuthCheck{"Cek"}
    AuthCheck --> Old["Lama"] & New["Baru"] --> Hub["Hub"]
    
    subgraph GameLoop ["Loop Permainan"]
      SelectCase{"Pilih Kasus"}
      SelectCase --> Case1["Kasus 1"] & Case2["Kasus 2"]
      Case1 --> C1_1["C1"] --> C1_6["C1 End"]
      Case2 --> C2_1["C2"] --> C2_6["C2 End"]
      C1_6 --> Post1["P1"]
      C2_6 --> Post2["P2"]
      Post1 & Post2 --> Results["Hasil"] --> Save["Save"]
      Save --> NextChoice{"Lanjut?"}
    end
    
    Hub --> SelectCase
    NextChoice -->|"Ya"| SelectCase
    NextChoice -->|"Tidak"| Finish(["Keluar"])`;

  await testCycle('Option 2 (Loop subgraph)', code2);
})();
