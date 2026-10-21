const fs = require('fs');
const path = require('path');

const targetFile = 'D:/Karir/Competition/Lomba Game/Stat-Casecode/app/siswa/game/results/[id]/page.tsx';
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Update Header
code = code.replace(
  /<header style=\{\{[\s\S]*?<\/header>/,
  `<header style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid #8C6239', background: 'rgba(45, 26, 16, 0.95)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        color: '#FEF3C7',
      }}>
        <div style={{ fontWeight: 900, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.img
            src="/dira-avatar.webp"
            alt="DiRA"
            style={{ height: '32px', objectFit: 'contain' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          />
          <span style={{ color: '#FDE047', letterSpacing: '0.5px' }}>🏛️ RAPOR INVESTIGASI KASUS DETEKTIF</span>
        </div>
        <button
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1.5px solid #8C6239',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#FEF3C7',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          onClick={() => router.push('/siswa')}
        >
          ← Dashboard
        </button>
      </header>`
);

// 2. Update maxWidth
code = code.replace(
  `maxWidth: '680px', margin: '0 auto', padding: '32px 20px 48px'`,
  `maxWidth: '700px', margin: '0 auto', padding: '32px 20px 56px'`
);

// 3. Update Hero
code = code.replace(
  /<motion\.div\s+initial=\{\{ opacity: 0, y: -20 \}\}[\s\S]*?<\/motion\.div>\s+<AnimatePresence>/,
  `<motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <div style={{
            display: 'inline-block',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1.5px solid #10B981',
            color: '#34D399',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            ✓ KASUS TELAH SELESAI DISELIDIKI
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            style={{ fontSize: '68px', marginBottom: '8px', lineHeight: 1 }}
          >
            {isCorrect ? '🏆' : '📋'}
          </motion.div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 6px', color: '#FFFDF7', letterSpacing: '-0.5px' }}>
            {isCorrect ? 'Investigasi Selesai!' : 'Level Selesai'}
          </h1>
          <p style={{ color: '#D1B89D', fontSize: '14.5px', margin: '0 0 4px', fontWeight: 600 }}>
            {config.title}
          </p>
        </motion.div>

        <AnimatePresence>`
);

// 4. Update Badges Card
code = code.replace(
  /\{\/\* ── Badge yang diperoleh ── \*\/\}[\s\S]*?\{\/\* ── Analisis Verdict ── \*\/\}/,
  `{/* ── Badge yang diperoleh ── */}
              {newBadges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF3E0 100%)',
                    border: '2.5px solid #8C6239',
                    borderRadius: '18px',
                    padding: '22px 24px',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                    color: '#362014',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '14px' }}>
                    🏅 PENGHARGAAN & BADGE YANG DIPEROLEH
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {newBadges.map((badge, i) => badge && (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 300 }}
                        style={{
                          textAlign: 'center', padding: '16px 18px',
                          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                          border: '1.5px solid #D97706',
                          borderRadius: '14px', minWidth: '110px',
                          flex: '1 1 110px', maxWidth: '160px',
                          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                        }}
                      >
                        <div style={{ fontSize: '36px', marginBottom: '6px' }}>{badge.icon}</div>
                        <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#92400E' }}>{badge.name}</div>
                        <div style={{ fontSize: '10px', color: '#78350F', marginTop: '3px', lineHeight: 1.4, fontWeight: 700 }}>{badge.desc}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Analisis Verdict ── */}`
);

// 5. Update Verdict Card
code = code.replace(
  /\{\/\* ── Analisis Verdict ── \*\/\}[\s\S]*?\{\/\* ── Ringkasan Investigasi ── \*\/\}/,
  `{/* ── Analisis Verdict ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF3E0 100%)',
                  border: '2.5px solid #8C6239',
                  borderRadius: '18px',
                  padding: '22px 24px',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                  color: '#362014',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '4px' }}>
                  🔍 KESIMPULAN AKHIR (VERDICT)
                </div>
                <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#5C4033', lineHeight: 1.5 }}>
                  <strong style={{ color: '#362014' }}>Verdict</strong> adalah keputusan resmi hasil analisis data statistik — apakah klaim viral di media sosial terbukti faktual atau menyesatkan berdasarkan 24 sampel data yang kamu kumpulkan.
                </p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {/* Verdictmu */}
                  <div style={{
                    flex: 1, padding: '12px 16px',
                    background: isCorrect ? 'rgba(5, 150, 105, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: \`1.5px solid \${isCorrect ? '#059669' : '#DC2626'}\`,
                    borderRadius: '12px', minWidth: '130px',
                  }}>
                    <div style={{ fontSize: '10px', color: '#78350F', fontWeight: 900, letterSpacing: '1px', marginBottom: '4px' }}>VERDICTMU</div>
                    <div style={{ fontWeight: 900, fontSize: '16px', color: isCorrect ? '#065F46' : '#991B1B' }}>
                      {store.verdictAnswer ?? '—'} {isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                  {/* Verdict benar */}
                  <div style={{
                    flex: 1, padding: '12px 16px',
                    background: 'rgba(217, 119, 6, 0.08)',
                    border: '1.5px solid #D97706',
                    borderRadius: '12px', minWidth: '130px',
                  }}>
                    <div style={{ fontSize: '10px', color: '#78350F', fontWeight: 900, letterSpacing: '1px', marginBottom: '4px' }}>VERDICT RESMI</div>
                    <div style={{ fontWeight: 900, fontSize: '16px', color: '#B45309' }}>
                      {isLevel2 ? 'SERIOUS_PROBLEM ⚠️' : 'MISLEADING ⚠️'}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '14px 16px', background: 'rgba(217, 119, 6, 0.06)',
                  border: '1.5px solid #D1B89D', borderRadius: '10px',
                  fontSize: '13px', lineHeight: 1.7, color: '#362014',
                }}
                  dangerouslySetInnerHTML={{ __html: \`<strong>Penjelasan Pak Sutrisno:</strong> \${verdictExplanation}\` }}
                />
              </motion.div>

              {/* ── Ringkasan Investigasi ── */}`
);

// 6. Update Ringkasan Investigasi Card
code = code.replace(
  /\{\/\* ── Ringkasan Investigasi ── \*\/\}[\s\S]*?\{\/\* ── Download Buku Saku ── \*\/\}/,
  `{/* ── Ringkasan Investigasi ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF3E0 100%)',
                  border: '2.5px solid #8C6239',
                  borderRadius: '18px',
                  padding: '22px 24px',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                  color: '#362014',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '12px' }}>
                  📌 BERKAS RINGKASAN INVESTIGASI KASUS #01
                </div>
                {!isLevel2 ? (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#334155' }}>
                      Dalam investigasi ini, kamu mengumpulkan data <em>screen time</em> dari <strong>24 siswa</strong> di 4 kelas (VII-A, VII-B, VIII-A, dan VIII-B) untuk memverifikasi klaim viral:{' '}
                      <em>&quot;Remaja Indonesia rata-rata habiskan &gt;8 jam/hari di medsos.&quot;</em>
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#334155' }}>
                      Setelah mengolah data pada <strong>Papan Analisis Data</strong> dan menghitung ukuran pemusatan data (Modus, Median, dan Mean), ditemukan bahwa waktu layar siswa sebenarnya berkisar antara 4–5 jam per hari. Klaim viral tersebut resmi dinyatakan{' '}
                      <strong style={{ color: '#B45309', background: 'rgba(217, 119, 6, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>MISLEADING</strong> karena melebih-lebihkan fakta sebenarnya.
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.75, color: '#334155' }}>
                      Ini adalah contoh nyata <strong>sampling bias</strong> dan manipulasi statistik dalam berita online. Berkat pemikiran kritis dan analisis datamu bersama Pak Sutrisno, nama baik siswa sekolah berhasil terlindungi!
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#334155' }}>
                      Dalam investigasi ini, kamu mengumpulkan data kasus cyberbullying dari <strong>30 korban</strong> di berbagai lokasi sekolah untuk memahami penyebaran masalah perundungan siber.
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.75, color: '#334155' }}>
                      Setelah menghitung nilai Mean, Median, dan Modus, disimpulkan bahwa cyberbullying di sekolah adalah <strong style={{ color: '#B45309' }}>MASALAH SERIUS (SERIOUS PROBLEM)</strong> yang memerlukan perhatian segera.
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.75, color: '#334155' }}>
                      Penyelidikan ini memberikan bimbingan pentingnya etika media sosial serta literasi digital untuk menghentikan mata rantai perundungan di lingkungan sekolah.
                    </p>
                  </>
                )}
              </motion.div>

              {/* ── Download Buku Saku ── */}`
);

// 7. Update Buku Saku Card & Return button
code = code.replace(
  /\{\/\* ── Download Buku Saku ── \*\/\}[\s\S]*?\{\/\* Buku Saku Modal Overlay \*\/\}/,
  `{/* ── Download Buku Saku ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
                  border: '2px solid #D97706',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                  color: '#362014',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '6px' }}>
                      📖 BUKU SAKU DETEKTIF STATISTIKA
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#78350F', lineHeight: 1.5, fontWeight: 600 }}>
                      Simpan rangkuman materi konsep statistika, rumus Mean, Median, Modus, dan tips membaca data sebagai referensimu!
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setShowBukuSakuModal(true)
                        setHasViewedBukuSaku(true)
                      }}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '10px',
                        border: '1.5px solid #8C6239',
                        background: '#FFFDF7',
                        color: '#6B4226',
                        fontSize: '13px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      }}
                    >
                      👁️ Lihat
                    </motion.button>

                    <motion.button
                      whileHover={hasViewedBukuSaku ? { scale: 1.04 } : {}}
                      whileTap={hasViewedBukuSaku ? { scale: 0.96 } : {}}
                      onClick={hasViewedBukuSaku ? handleDownloadBukuSaku : undefined}
                      disabled={!hasViewedBukuSaku}
                      style={{
                        padding: '12px 22px',
                        borderRadius: '10px',
                        border: 'none',
                        background: hasViewedBukuSaku 
                          ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                          : 'rgba(0, 0, 0, 0.1)',
                        color: hasViewedBukuSaku ? '#FFFFFF' : '#A89F91',
                        fontSize: '13px',
                        fontWeight: 900,
                        cursor: hasViewedBukuSaku ? 'pointer' : 'not-allowed',
                        boxShadow: hasViewedBukuSaku ? '0 4px 16px rgba(5, 150, 105, 0.4)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: hasViewedBukuSaku ? 1 : 0.6,
                        transition: 'all 0.2s',
                      }}
                    >
                      ⬇️ Unduh PDF / PNG
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* ── Action — Kembali ke Lobby / Post Test ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingTop: '10px' }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/siswa')}
                  style={{
                    padding: '14px 44px',
                    fontSize: '15px',
                    fontWeight: 900,
                    borderRadius: '12px',
                    border: '2px solid #FDE047',
                    background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(180, 83, 9, 0.45)',
                  }}
                >
                  ← Kembali ke Dashboard Siswa
                </motion.button>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Buku Saku Modal Overlay */}`
);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('ResultsPage themed successfully!');
