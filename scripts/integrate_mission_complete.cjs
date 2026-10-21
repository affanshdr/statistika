const fs = require('fs');
const filePath = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/_levels/level1/components/NPath.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Normalize line breaks
code = code.replace(/\r\n/g, '\n');

// 1. Definition of MissionCompleteModal component
const modalComponentCode = `
// ── MODAL POPUP MISI SELESAI (BINTANG 1-3 BERDASARKAN DURASI & PERFORMA) ──
function MissionCompleteModal({
  stars,
  elapsedSeconds,
  mistakeCount,
  onFinish,
}: {
  stars: number
  elapsedSeconds: number
  mistakeCount: number
  onFinish: () => void
}) {
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const formattedTime = \`\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`

  const ratingInfo = useMemo(() => {
    if (stars === 3) {
      return {
        title: '⭐⭐⭐ Detektif Elit!',
        subtitle: 'Luar biasa! Analisis statistik tuntas dalam < 6 menit dengan kecepatan & akurasi tinggi.',
        color: '#D97706',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeBorder: 'rgba(245, 158, 11, 0.4)',
      }
    }
    if (stars === 2) {
      return {
        title: '⭐⭐ Detektif Terlatih!',
        subtitle: 'Bagus sekali! Investigasi selesai dengan cermat & tepat sasaran (durasi 6 - 10 menit).',
        color: '#2563EB',
        badgeBg: 'rgba(37, 99, 235, 0.12)',
        badgeBorder: 'rgba(37, 99, 235, 0.35)',
      }
    }
    return {
      title: '⭐ Detektif Pemula!',
      subtitle: 'Misi terselesaikan! Terus berlatih untuk mempercepat analisis datamu (> 10 menit).',
      color: '#059669',
      badgeBg: 'rgba(5, 150, 105, 0.12)',
      badgeBorder: 'rgba(5, 150, 105, 0.35)',
    }
  }, [stars])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 20, 30, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FDF7EA 100%)',
          border: '2.5px solid #8C6239',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          padding: 'clamp(20px, 3vh, 28px) clamp(18px, 2.5vw, 26px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          color: '#2D1A12',
          fontFamily: 'var(--font-ui, sans-serif)',
        }}
      >
        {/* Ornate Brass Corners */}
        <div style={{ position: 'absolute', top: 6, left: 6, width: 14, height: 14, borderTop: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderTop: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 6, left: 6, width: 14, height: 14, borderBottom: '2.5px solid #8C6239', borderLeft: '2.5px solid #8C6239', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 6, right: 6, width: 14, height: 14, borderBottom: '2.5px solid #8C6239', borderRight: '2.5px solid #8C6239', pointerEvents: 'none' }} />

        {/* Top Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '50px', padding: '3px 14px', fontSize: '11px', fontWeight: 900, color: '#B45309', letterSpacing: '0.5px', marginBottom: '8px' }}>
          <span>🏆</span>
          <span>KASUS #01 TERPECAHKAN</span>
        </div>

        {/* Modal Title */}
        <h2 style={{ margin: '4px 0 2px', fontSize: 'clamp(24px, 3.5vh, 28px)', fontWeight: 900, color: '#3E2723', letterSpacing: '-0.5px' }}>
          Misi Selesai
        </h2>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#78350F', marginBottom: '14px' }}>
          Misteri Waktu Layar Remaja • SMP Negeri
        </div>

        {/* 3 Large Animated Stars Container */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          margin: '10px 0 12px',
          padding: '10px 0',
          background: 'radial-gradient(ellipse at center, rgba(254, 243, 199, 0.7) 0%, rgba(254, 243, 199, 0) 70%)',
        }}>
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15 + starIdx * 0.18,
                  type: 'spring',
                  stiffness: 450,
                  damping: 18,
                }}
                style={{
                  fontSize: starIdx === 2 ? 'clamp(52px, 7.5vh, 60px)' : 'clamp(42px, 6vh, 48px)',
                  lineHeight: 1,
                  filter: isEarned ? 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.6))' : 'none',
                  color: isEarned ? '#F59E0B' : 'rgba(140, 98, 57, 0.22)',
                  transition: 'all 0.2s ease',
                }}
              >
                ★
              </motion.div>
            )
          })}
        </div>

        {/* Star Rating Info Pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            background: ratingInfo.badgeBg,
            border: \`1.5px solid \${ratingInfo.badgeBorder}\`,
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 900, color: ratingInfo.color, marginBottom: '3px' }}>
            {ratingInfo.title}
          </div>
          <div style={{ fontSize: '11.5px', color: '#573016', lineHeight: 1.4, fontWeight: 600 }}>
            {ratingInfo.subtitle}
          </div>
        </motion.div>

        {/* Performance Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '14px',
        }}>
          {/* Stat 1: Durasi Waktu */}
          <div style={{ background: '#FFFDF9', border: '1px solid #D6C29E', borderRadius: '10px', padding: '8px 6px' }}>
            <div style={{ fontSize: '10px', color: '#8C6239', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
              ⏱️ Waktu
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#3E2723' }}>
              {formattedTime}
            </div>
            <div style={{ fontSize: '9px', color: '#92400E', fontWeight: 700 }}>
              {stars === 3 ? '< 06:00 (Maksimal)' : stars === 2 ? '06:00 - 10:00' : '> 10:00'}
            </div>
          </div>

          {/* Stat 2: Akurasi / Kesalahan */}
          <div style={{ background: '#FFFDF9', border: '1px solid #D6C29E', borderRadius: '10px', padding: '8px 6px' }}>
            <div style={{ fontSize: '10px', color: '#8C6239', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
              🎯 Akurasi
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: mistakeCount === 0 ? '#059669' : '#D97706' }}>
              {mistakeCount === 0 ? 'Sempurna' : \`\${mistakeCount} Keliru\`}
            </div>
            <div style={{ fontSize: '9px', color: '#6B7280', fontWeight: 700 }}>
              {mistakeCount === 0 ? '0 Kesalahan' : 'Papan Bukti'}
            </div>
          </div>

          {/* Stat 3: Total XP */}
          <div style={{ background: '#FFFDF9', border: '1px solid #D6C29E', borderRadius: '10px', padding: '8px 6px' }}>
            <div style={{ fontSize: '10px', color: '#8C6239', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
              ⚡ Hadiah XP
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#047857' }}>
              +80 XP
            </div>
            <div style={{ fontSize: '9px', color: '#059669', fontWeight: 700 }}>
              Tuntas Level 1
            </div>
          </div>
        </div>

        {/* Verdict Badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '14px', color: '#059669' }}>✓</span>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065F46' }}>
            HASIL: Berita Viral Terbukti <strong>MENYESATKAN (Misleading)</strong>
          </span>
        </div>

        {/* Primary Action Button: Selesai */}
        <button
          data-testid="btn-mission-complete-finish"
          onClick={() => {
            gameAudio.playClick()
            onFinish()
          }}
          style={{
            width: '100%',
            padding: '13px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <span>Selesai</span>
          <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </motion.div>
    </div>
  )
}
`;

// Insert component above `export default function NPath`
code = code.replace(
  'export default function NPath({ onComplete, isFD = true, demoMode = false, demoStep = null }: { onComplete: () => void; isFD?: boolean; demoMode?: boolean; demoStep?: string | null }) {',
  modalComponentCode + '\nexport default function NPath({ onComplete, isFD = true, demoMode = false, demoStep = null }: { onComplete: (starsEarned?: number) => void; isFD?: boolean; demoMode?: boolean; demoStep?: string | null }) {'
);

// 2. Add state hooks to NPath
code = code.replace(
  '  const level1Dataset = useGameStore(s => s.level1Dataset)',
  '  const level1Dataset = useGameStore(s => s.level1Dataset)\n  const sessionStartTime = useGameStore(s => s.sessionStartTime)\n  const mistakeCount = useGameStore(s => s.mistakeCount)\n  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false)\n  const [earnedStarsState, setEarnedStarsState] = useState(3)\n  const [elapsedSecondsState, setElapsedSecondsState] = useState(0)'
);

// 3. Update cutscene handler for post_conclusion
const oldCutsceneClick = `    } else if (currentStage === 'post_conclusion') {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      triggerFadeTransition(() => {}, onComplete)
    }`;

const newCutsceneClick = `    } else if (currentStage === 'post_conclusion') {
      gameAudio.playUnlockJingle()
      setTeacherCutsceneStage(null)
      const startTime = sessionStartTime || (Date.now() - 240000)
      const elapsed = Math.max(1, Math.floor((Date.now() - startTime) / 1000))
      const stars = elapsed <= 360 ? 3 : elapsed <= 600 ? 2 : 1
      setElapsedSecondsState(elapsed)
      setEarnedStarsState(stars)
      setShowMissionCompleteModal(true)
    }`;

code = code.replace(oldCutsceneClick, newCutsceneClick);

// 4. Update bubble action text
code = code.replace(
  "actionText = '[ Selesaikan Kasus #01 & Lihat Rapor 🏆 ]'",
  "actionText = '[ Buka Hasil Misi 🏆 ]'"
);

// 5. Insert Modal in JSX
const modalJsx = `
      {/* Misi Selesai Modal (Popup Bintang 1-3 & Hasil Investigasi) */}
      <AnimatePresence>
        {showMissionCompleteModal && (
          <MissionCompleteModal
            stars={earnedStarsState}
            elapsedSeconds={elapsedSecondsState}
            mistakeCount={mistakeCount}
            onFinish={() => {
              setShowMissionCompleteModal(false)
              if (onComplete) {
                onComplete(earnedStarsState)
              }
            }}
          />
        )}
      </AnimatePresence>
`;

code = code.replace(
  '{/* Wali Kelas Data Dialogue Modal */}',
  modalJsx + '\n      {/* Wali Kelas Data Dialogue Modal */}'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully integrated MissionCompleteModal into NPath.tsx!');
