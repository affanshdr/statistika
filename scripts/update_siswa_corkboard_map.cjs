const fs = require('fs');
const filePath = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/page.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
code = code.replace(/\r\n/g, '\n');

// 1. Add storeStars and localStars
const oldStoreVar = 'const { startLevel, resetLevel, completedLevels, completedPostTests = [] } = useGameStore()';
const newStoreVar = `const { startLevel, resetLevel, completedLevels, completedPostTests = [], levelStars: storeStars } = useGameStore()
  const [localStars, setLocalStars] = useState<Record<number, number>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stat_casecode_level_stars')
      if (saved) {
        setLocalStars(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const effectiveStars: Record<number, number> = { ...(localStars || {}), ...(storeStars || {}) }`;

code = code.replace(oldStoreVar, newStoreVar);

// 2. Add Star Badge on Photo (Top-Left)
const oldPhotoStamp = `{/* Completed Case Stamp */}
                            {isCompleted && (`;

const newPhotoStamp = `{/* Star Rating Badge on Photo (Top-Left) */}
                            {(effectiveStars[level.id] || 0) > 0 && (
                              <div
                                data-testid={\`card-stars-photo-\${level.id}\`}
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  left: '6px',
                                  background: 'rgba(15, 23, 42, 0.88)',
                                  border: '1.5px solid rgba(245, 158, 11, 0.65)',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
                                  zIndex: 3,
                                }}
                              >
                                {[1, 2, 3].map((s) => (
                                  <span
                                    key={s}
                                    style={{
                                      fontSize: isMobile ? '10px' : '12px',
                                      color: s <= (effectiveStars[level.id] || 0) ? '#F59E0B' : 'rgba(255,255,255,0.22)',
                                      lineHeight: 1,
                                      filter: s <= (effectiveStars[level.id] || 0) ? 'drop-shadow(0 1px 2px rgba(245, 158, 11, 0.6))' : 'none',
                                    }}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Completed Case Stamp */}
                            {isCompleted && (`;

code = code.replace(oldPhotoStamp, newPhotoStamp);

// 3. Add Star Rating Pill below tags and above action buttons
const oldActionButton = `{/* Action Button */}
                        <div style={{ width: '100%', marginTop: '2px' }}>`;

const newActionButton = `{/* Earned Star Rating Pill (If completed & has stars) */}
                        {(effectiveStars[level.id] || 0) > 0 && (
                          <div
                            data-testid={\`level-\${level.id}-stars\`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              margin: '3px 0',
                              padding: '2px 8px',
                              background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 230, 138, 0.85) 100%)',
                              border: '1px solid rgba(217, 119, 6, 0.45)',
                              borderRadius: '20px',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              {[1, 2, 3].map((s) => (
                                <span
                                  key={s}
                                  style={{
                                    fontSize: isMobile ? '12px' : '15px',
                                    color: s <= (effectiveStars[level.id] || 0) ? '#D97706' : '#D1D5DB',
                                    filter: s <= (effectiveStars[level.id] || 0) ? 'drop-shadow(0 1px 2px rgba(217, 119, 6, 0.5))' : 'none',
                                    lineHeight: 1,
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span style={{
                              fontSize: isMobile ? '8.5px' : '10px',
                              fontWeight: 900,
                              color: '#92400E',
                              marginLeft: '2px',
                              letterSpacing: '0.3px',
                            }}>
                              {effectiveStars[level.id] === 3
                                ? '⭐⭐⭐ Detektif Elit'
                                : effectiveStars[level.id] === 2
                                ? '⭐⭐ Detektif Terlatih'
                                : '⭐ Detektif Pemula'}
                            </span>
                          </div>
                        )}

                        {/* Action Button */}
                        <div style={{ width: '100%', marginTop: '2px' }}>`;

code = code.replace(oldActionButton, newActionButton);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated app/siswa/page.tsx with star badges on corkboard map!');
