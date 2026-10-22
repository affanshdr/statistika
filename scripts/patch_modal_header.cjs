const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');
let c = fs.readFileSync(targetFile, 'utf-8');

const headerMarker = '{/* Header: Teacher Badge & Class Label + Dev Pass */}';
const devPassMarker = '{/* Discreet Dev Pass Button */}';

const startIdx = c.indexOf(headerMarker);
const endIdx = c.indexOf(devPassMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const newHeader = `{/* Header: Class Label + Dev Pass (Tulisan Bu Sari dihilangkan di Kelas VII-A) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {door.id !== 'A1' ? (
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid #F59E0B',
                borderRadius: '999px',
                padding: '3px 12px',
                fontSize: 'clamp(11.5px, 1.3vw, 13.5px)',
                fontWeight: 900,
                color: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              }}>
                <span>👩‍🏫</span>
                <span>{info.teacher}</span>
              </span>
            ) : (
              <span style={{
                fontSize: 'clamp(11.5px, 1.3vw, 13px)',
                fontWeight: 900,
                color: '#FDE047',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid #F59E0B',
                padding: '4px 14px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>🏫</span>
                <span>{door.label}</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {door.id !== 'A1' && (
              <span style={{
                fontSize: 'clamp(10px, 1.2vw, 11.5px)',
                fontWeight: 800,
                color: '#0369A1',
                background: 'rgba(2, 132, 199, 0.12)',
                border: '1.5px solid rgba(2, 132, 199, 0.35)',
                padding: '3px 10px',
                borderRadius: '8px',
              }}>
                {door.label}
              </span>
            )}

            `;
  c = c.slice(0, startIdx) + newHeader + c.slice(endIdx);
  fs.writeFileSync(targetFile, c, 'utf-8');
  console.log('Successfully patched header in WaliKelasModal.tsx!');
} else {
  console.error('Markers not found!');
}
