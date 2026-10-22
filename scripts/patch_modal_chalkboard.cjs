const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/siswa/game/_levels/level1/components/modals/WaliKelasModal.tsx');
let c = fs.readFileSync(targetFile, 'utf-8');

// 1. Update modal container styling for chalkboard green in A1
const oldContainerStyle = `background: 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',
          border: '2.5px solid #F59E0B',
          borderRadius: 'clamp(14px, 2vw, 22px)',
          padding: 'clamp(14px, 2vh, 22px) clamp(16px, 2.5vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 1.4vh, 14px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',`;

const newContainerStyle = `background: door.id === 'A1'
            ? 'linear-gradient(160deg, #143522 0%, #0F271A 60%, #091A11 100%)'
            : 'linear-gradient(145deg, #2D1A12 0%, #170E08 100%)',
          border: door.id === 'A1'
            ? '3px solid #8D5428'
            : '2.5px solid #F59E0B',
          borderRadius: 'clamp(14px, 2vw, 22px)',
          padding: 'clamp(14px, 2vh, 22px) clamp(16px, 2.5vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 1.4vh, 14px)',
          boxShadow: door.id === 'A1'
            ? '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 0 35px rgba(0, 0, 0, 0.7), inset 0 0 0 2px rgba(141, 84, 40, 0.35)'
            : '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 25px rgba(180, 140, 80, 0.25)',`;

if (c.includes(oldContainerStyle)) {
  c = c.replace(oldContainerStyle, newContainerStyle);
  console.log('1. Updated container background to chalkboard green for A1');
} else {
  console.error('Could not find oldContainerStyle');
}

// 2. Remove Bu Sari badge for A1, display clean class badge
const oldHeaderSnippet = `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <span>dY\`c??dY?</span>
              <span>{info.teacher}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            </span>`;

const newHeaderSnippet = `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Tulisan Bu Sari dihilangkan di Kelas VII-A sesuai permintaan user */}
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
            )}`;

if (c.includes(oldHeaderSnippet)) {
  c = c.replace(oldHeaderSnippet, newHeaderSnippet);
  console.log('2. Removed Bu Sari badge for A1 and updated header');
} else {
  console.error('Could not find oldHeaderSnippet');
}

// 3. Update inner card background to chalkboard slate in A1
const oldCardBg = `background: 'linear-gradient(145deg, rgba(35, 18, 12, 0.95) 0%, rgba(20, 10, 5, 0.98) 100%)',
          border: '1.8px solid #F59E0B',`;

const newCardBg = `background: door.id === 'A1'
            ? 'linear-gradient(160deg, rgba(14, 38, 26, 0.92) 0%, rgba(8, 22, 15, 0.96) 100%)'
            : 'linear-gradient(145deg, rgba(35, 18, 12, 0.95) 0%, rgba(20, 10, 5, 0.98) 100%)',
          border: '1.8px solid #F59E0B',`;

if (c.includes(oldCardBg)) {
  c = c.replace(oldCardBg, newCardBg);
  console.log('3. Updated inner card background to chalkboard slate for A1');
} else {
  console.error('Could not find oldCardBg');
}

fs.writeFileSync(targetFile, c, 'utf-8');
console.log('WaliKelasModal.tsx chalkboard update complete!');
