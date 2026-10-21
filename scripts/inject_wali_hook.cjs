const fs = require('fs');
const path = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let code = fs.readFileSync(path, 'utf8');
if (!code.includes('__DEV_OPEN_WALI__')) {
  code = code.replace(
    '(window as any).__DEV_EXIT_ROOM__ = () => {',
    `(window as any).__DEV_OPEN_WALI__ = (id) => {
        const r = doors.find(d => d.id === id);
        if (r) { insideRoomR.current = r; setInsideRoom(r); setShowWaliKelasPopup(r); }
      };
      (window as any).__DEV_EXIT_ROOM__ = () => {`
  );
  fs.writeFileSync(path, code, 'utf8');
  console.log('Successfully injected __DEV_OPEN_WALI__');
} else {
  console.log('Already present');
}
