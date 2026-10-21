const fs = require('fs');
const path = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/lobby/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Normalize line endings for replacement
content = content.replace(/\r\n/g, '\n');

// 1. Update LobbyPage state
content = content.replace(
  'const { completedLevels } = useGameStore()',
  'const { completedLevels, levelStars: storeStars } = useGameStore()\n  const [localStars, setLocalStars] = useState<Record<number, number>>({})'
);

// 2. Load localStars in useEffect
content = content.replace(
  "const data = localStorage.getItem('student')",
  "try {\n      const saved = localStorage.getItem('stat_casecode_level_stars')\n      if (saved) setLocalStars(JSON.parse(saved))\n    } catch (e) { console.error(e) }\n\n    const data = localStorage.getItem('student')"
);

// 3. Add effectiveStars
content = content.replace(
  'const handlePlayLevel = (levelId: number) => {',
  'const effectiveStars: Record<number, number> = { ...(localStars || {}), ...(storeStars || {}) }\n\n  const handlePlayLevel = (levelId: number) => {'
);

// 4. Update header row with star display
const oldHeader = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>LEVEL {level.id}</div>
                        {isUnlocked && level.xpMax > 0 && <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>Max {level.xpMax} XP</div>}
                      </div>`;

const newHeader = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>LEVEL {level.id}</div>
                          {completedLevels.includes(level.id) && (
                            <span style={{ fontSize: '9.5px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', padding: '1px 6px', fontWeight: 800 }}>
                              ✓ Selesai
                            </span>
                          )}
                        </div>
                        {(effectiveStars[level.id] || 0) > 0 ? (
                          <div
                            data-testid={\`level-\${level.id}-stars\`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(180, 83, 9, 0.25))',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              borderRadius: '20px',
                              padding: '2px 8px',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                            }}
                          >
                            {[1, 2, 3].map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: '13px',
                                  color: s <= (effectiveStars[level.id] || 0) ? '#F59E0B' : 'rgba(255, 255, 255, 0.2)',
                                  filter: s <= (effectiveStars[level.id] || 0) ? 'drop-shadow(0 1px 2px rgba(245, 158, 11, 0.6))' : 'none',
                                }}
                              >
                                ★
                              </span>
                            ))}
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#FCD34D', marginLeft: '3px' }}>
                              {effectiveStars[level.id]}/3
                            </span>
                          </div>
                        ) : (
                          isUnlocked && level.xpMax > 0 && <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>Max {level.xpMax} XP</div>
                        )}
                      </div>`;

content = content.replace(oldHeader, newHeader);

// 5. Button text update
content = content.replace(
  '🔍 Mulai Penyelidikan →',
  "{completedLevels.includes(level.id) ? '🔄 Main Ulang Kasus →' : '🔍 Mulai Penyelidikan →'}"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated lobby/page.tsx');
