const fs = require('fs');
const path = require('path');

const filePath = 'd:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/corkboard/PakReportModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Comment out handleKeyDown
const keydownTarget = `  // Keyboard Shortcuts: [1-4] untuk lompat tahap, [U] auto-sort, [0] atau [W] auto-complete all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') return

      if (e.key === 'u' || e.key === 'U') {
        if (stage === 'sort') handleAutoSort()
      } else if (e.key === '1') {
        handleSkipToStage('sort')
      } else if (e.key === '2') {
        handleSkipToStage('modus')
      } else if (e.key === '3') {
        handleSkipToStage('median')
      } else if (e.key === '4') {
        handleSkipToStage('mean')
      } else if (e.key === '0' || e.key.toLowerCase() === 'w') {
        handleAutoCompleteAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage, handleAutoSort, handleSkipToStage, handleAutoCompleteAll])`;

const keydownReplacement = `  // Keyboard Shortcuts (Dev tools commented out for players)
  /*
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') return

      if (e.key === 'u' || e.key === 'U') {
        if (stage === 'sort') handleAutoSort()
      } else if (e.key === '1') {
        handleSkipToStage('sort')
      } else if (e.key === '2') {
        handleSkipToStage('modus')
      } else if (e.key === '3') {
        handleSkipToStage('median')
      } else if (e.key === '4') {
        handleSkipToStage('mean')
      } else if (e.key === '0' || e.key.toLowerCase() === 'w') {
        handleAutoCompleteAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage, handleAutoSort, handleSkipToStage, handleAutoCompleteAll])
  */`;

if (content.includes(keydownTarget)) {
  content = content.replace(keydownTarget, keydownReplacement);
  console.log('1. Keydown dev shortcuts successfully commented out');
} else {
  console.log('Warning: keydownTarget not found');
}

// 2. Comment out left DEV SKIP button
const leftDevButtonTarget = `        {/* Kiri: Tombol Toggle Dev Tool Skip Step */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button
            data-testid="btn-dev-tools-toggle"
            onClick={() => {
              setShowDevTools(prev => !prev)
              gameAudio.playClick()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: showDevTools ? '1.5px solid #F59E0B' : '1.5px solid rgba(245, 158, 11, 0.45)',
              background: showDevTools
                ? 'linear-gradient(180deg, #92400E 0%, #78350F 100%)'
                : 'linear-gradient(180deg, rgba(60, 25, 5, 0.85) 0%, rgba(30, 12, 2, 0.95) 100%)',
              color: '#FDE68A',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Buka / Tutup Dev Tool Skip Step untuk kemudahan debugging"
          >
            <span>🛠️</span>
            <span>DEV SKIP</span>
            <span style={{ fontSize: '9px', opacity: 0.85 }}>{showDevTools ? '▲' : '▼'}</span>
          </button>
        </div>`;

const leftDevButtonReplacement = `        {/* Kiri: Spacer penyeimbang layout header (Dev Tool Skip Step commented out for player) */}
        <div style={{ width: 'clamp(80px, 9vw, 120px)', flexShrink: 0 }} />
        {/*
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button
            data-testid="btn-dev-tools-toggle"
            onClick={() => {
              setShowDevTools(prev => !prev)
              gameAudio.playClick()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: showDevTools ? '1.5px solid #F59E0B' : '1.5px solid rgba(245, 158, 11, 0.45)',
              background: showDevTools
                ? 'linear-gradient(180deg, #92400E 0%, #78350F 100%)'
                : 'linear-gradient(180deg, rgba(60, 25, 5, 0.85) 0%, rgba(30, 12, 2, 0.95) 100%)',
              color: '#FDE68A',
              boxShadow: '0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Buka / Tutup Dev Tool Skip Step untuk kemudahan debugging"
          >
            <span>🛠️</span>
            <span>DEV SKIP</span>
            <span style={{ fontSize: '9px', opacity: 0.85 }}>{showDevTools ? '▲' : '▼'}</span>
          </button>
        </div>
        */}`;

if (content.includes(leftDevButtonTarget)) {
  content = content.replace(leftDevButtonTarget, leftDevButtonReplacement);
  console.log('2. Left DEV SKIP button successfully commented out');
} else {
  console.log('Warning: leftDevButtonTarget not found');
}

// 3. Comment out right Auto Win button
const autoWinTarget = `          <button
            data-testid="btn-dev-instant-win"
            onClick={handleAutoCompleteAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: '1.5px solid #10B981',
              background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Selesaikan semua 4 tahap secara instan (Auto Win / Dev)"
          >
            <span>⚡</span>
            <span>Auto Win</span>
          </button>`;

const autoWinReplacement = `          {/* Auto Win Dev Button (Commented out for player) */}
          {/*
          <button
            data-testid="btn-dev-instant-win"
            onClick={handleAutoCompleteAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(2.5px, 0.4vh, 5px) clamp(6px, 0.8vw, 11px)',
              borderRadius: '999px',
              fontSize: 'clamp(8px, 1vw, 10.5px)',
              fontWeight: 900,
              cursor: 'pointer',
              border: '1.5px solid #10B981',
              background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title="Selesaikan semua 4 tahap secara instan (Auto Win / Dev)"
          >
            <span>⚡</span>
            <span>Auto Win</span>
          </button>
          */}`;

if (content.includes(autoWinTarget)) {
  content = content.replace(autoWinTarget, autoWinReplacement);
  console.log('3. Right Auto Win button successfully commented out');
} else {
  console.log('Warning: autoWinTarget not found');
}

// 4. Stepper tab onClick: allow review of completed stages only, not dev skipping uncompleted
const stepperTabTarget = `                <div
                  data-testid={\`stepper-tab-\${st.id}\`}
                  onClick={() => handleSkipToStage(st.id as any)}
                  style={{
                    padding: 'clamp(2px, 0.4vh, 4px) clamp(6px, 0.9vw, 11px)',
                    borderRadius: '999px',
                    fontSize: 'clamp(8.5px, 1.1vw, 11px)',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: st.done
                      ? '#059669'
                      : isActive
                      ? '#5a3825'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: st.done || isActive ? '#FFFDF9' : '#D1B89D',
                    border: isActive
                      ? '2px solid #FDE68A'
                      : st.done
                      ? '1.5px solid #34D399'
                      : '1.5px solid rgba(180, 140, 80, 0.35)',
                    boxShadow: isActive ? '0 0 8px rgba(253, 230, 138, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  title={\`Klik untuk langsung lompat ke \${st.label} (Dev Skip)\`}
                >`;

const stepperTabReplacement = `                <div
                  data-testid={\`stepper-tab-\${st.id}\`}
                  onClick={() => {
                    // Hanya izinkan navigasi untuk tahap yang sudah diselesaikan (review)
                    if (st.done) {
                      setStage(st.id as any)
                      gameAudio.playClick()
                    }
                  }}
                  style={{
                    padding: 'clamp(2px, 0.4vh, 4px) clamp(6px, 0.9vw, 11px)',
                    borderRadius: '999px',
                    fontSize: 'clamp(8.5px, 1.1vw, 11px)',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    cursor: st.done ? 'pointer' : 'default',
                    background: st.done
                      ? '#059669'
                      : isActive
                      ? '#5a3825'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: st.done || isActive ? '#FFFDF9' : '#D1B89D',
                    border: isActive
                      ? '2px solid #FDE68A'
                      : st.done
                      ? '1.5px solid #34D399'
                      : '1.5px solid rgba(180, 140, 80, 0.35)',
                    boxShadow: isActive ? '0 0 8px rgba(253, 230, 138, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    opacity: !st.done && !isActive ? 0.65 : 1,
                  }}
                  title={st.done ? \`Buka kembali \${st.label}\` : st.label}
                >`;

if (content.includes(stepperTabTarget)) {
  content = content.replace(stepperTabTarget, stepperTabReplacement);
  console.log('4. Stepper dev skip successfully converted to normal review navigation');
} else {
  console.log('Warning: stepperTabTarget not found');
}

// 5. Comment out collapsible dev toolbar
const toolbarStart = `{/* ── COLLAPSIBLE DEV TOOLBAR (EXPANDED KETIKA showDevTools === TRUE) ── */}`;
const toolbarEnd = `      </AnimatePresence>`;

const startIndex = content.indexOf(toolbarStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(toolbarEnd, startIndex);
  if (endIndex !== -1) {
    const fullBlock = content.substring(startIndex, endIndex + toolbarEnd.length);
    const commentedBlock = `{/* Collapsible Dev Toolbar commented out for players\n` + fullBlock + `\n*/}`;
    content = content.replace(fullBlock, commentedBlock);
    console.log('5. Collapsible dev toolbar successfully commented out');
  } else {
    console.log('Warning: toolbarEnd not found');
  }
} else {
  console.log('Warning: toolbarStart not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('All updates successfully written to PakReportModal.tsx');
