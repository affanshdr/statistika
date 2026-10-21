const fs = require('fs');
const rep = JSON.parse(fs.readFileSync('deep_audit_report.json', 'utf8'));

rep.forEach(item => {
  if (item.cellClipping && item.cellClipping.length > 0) {
    console.log(`\n=== CELL CLIPPING DETAIL: ${item.file} ===`);
    let horizontalBleeds = 0;
    let topCuts = 0;
    let bottomGroundTouches = 0;

    item.cellClipping.forEach(c => {
      const { left, right, top, bottom } = c.touches;
      if (left > 0 || right > 0) {
        horizontalBleeds++;
        console.log(`  Frame ${c.frame} (col ${c.col}, row ${c.row}): HORIZONTAL BLEED -> Left: ${left}, Right: ${right}`);
      }
      if (top > 0) {
        topCuts++;
        console.log(`  Frame ${c.frame} (col ${c.col}, row ${c.row}): TOP CUT (HEAD) -> Top: ${top}`);
      }
      if (bottom > 0) {
        bottomGroundTouches++;
        // console.log(`  Frame ${c.frame} (col ${c.col}, row ${c.row}): Bottom (Feet/Ground): ${bottom}`);
      }
    });

    console.log(`Summary: ${horizontalBleeds} horizontal bleeds, ${topCuts} top cuts, ${bottomGroundTouches} bottom ground touches.`);
  }
});
