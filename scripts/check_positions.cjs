const fs = require('fs');
const s = fs.readFileSync('diagrams/stat_casecode_flowchart.svg', 'utf8');
const r = /<g class="node[^"]*" id="flowchart-([a-zA-Z0-9_]+)-[0-9]+"[^>]*transform="translate\(([^,]+),\s*([^)]+)\)"/g;
let m;
while ((m = r.exec(s)) !== null) {
  console.log(m[1].padEnd(20), 'x =', Math.round(parseFloat(m[2])), 'y =', Math.round(parseFloat(m[3])));
}
