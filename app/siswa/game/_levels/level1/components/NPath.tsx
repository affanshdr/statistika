'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import {
  LEVEL1_MAPS,
  WORLD_VW,
  WORLD_VH,
  RED_LINE_POINTS,
  getRedLineY,
  checkHallwayWalkable,
  checkClassroomWalkable
} from '@/app/siswa/game/_levels/level1/config/level1MapConfig'
import Level1HUD from '@/app/siswa/game/_levels/level1/components/Level1HUD'
import QuizModal from '@/app/siswa/game/_levels/level1/components/modals/QuizModal'
import WaliKelasModal from '@/app/siswa/game/_levels/level1/components/modals/WaliKelasModal'
const VIEW_VW = 640
const VIEW_VH = 360
const SPEED = 1.0
const TOTAL_N = 35

import {
  CLASS_DOORS,
  CLASS_STUDENTS,
  DATA_CIRCLES,
  AMBIENT_PARTICLES,
  QuizDoor
} from '@/app/siswa/game/_levels/level1/data/level1Data'

import { DoorId } from '@/app/siswa/game/_levels/level1/data/level1Data'

const DOORS: readonly QuizDoor[] = []

// ─── Joystick ─────────────────────────────────────────────────────────────────
function Joystick({ onDir }: { onDir: (x: number, y: number) => void }) {
  const outer = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const on = useRef(false)

  const compute = (cx: number, cy: number) => {
    const el = outer.current; if (!el) return
    const b = el.getBoundingClientRect()
    const R = b.width / 2
    const dx = cx - (b.left + R)
    const dy = cy - (b.top + R)
    const d = Math.sqrt(dx * dx + dy * dy)
    onDir(Math.max(-1, Math.min(1, d > 0 ? dx / Math.max(d, R) : 0)), Math.max(-1, Math.min(1, d > 0 ? dy / Math.max(d, R) : 0)))
    if (knob.current) knob.current.style.transform =
      `translate(calc(-50% + ${(dx / Math.max(d, 1)) * Math.min(d, R)}px),calc(-50% + ${(dy / Math.max(d, 1)) * Math.min(d, R)}px))`
  }

  const reset = () => { on.current = false; onDir(0, 0); if (knob.current) knob.current.style.transform = 'translate(-50%,-50%)' }

  return (
    <div
      style={{
        width: 'clamp(60px, 9vw, 84px)',
        height: 'clamp(60px, 9vw, 84px)',
        borderRadius: '50%',
        background: 'rgba(14, 131, 136, 0.22)',
        border: '2.5px solid rgba(0, 173, 181, 0.45)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 173, 181, 0.2)',
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.3s, transform 0.2s',
      }}
      ref={outer}
      onPointerDown={e => { on.current = true; outer.current?.setPointerCapture(e.pointerId); compute(e.clientX, e.clientY) }}
      onPointerMove={e => { if (on.current) compute(e.clientX, e.clientY) }}
      onPointerUp={reset} onPointerCancel={reset}>
      <div ref={knob} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '36%', height: '36%', borderRadius: '50%', background: 'linear-gradient(135deg,#00ADB5 0%,#818cf8 100%)', boxShadow: '0 0 12px #00ADB5', pointerEvents: 'none' }} />
    </div>
  )
}

// Helper to generate choice pool for answers
function generateAnswerPool(correctAnswer: number): number[] {
  const pool = new Set<number>()
  pool.add(correctAnswer)

  // Distractors must be within range ±2 to ±3 from correctAnswer
  const candidates: number[] = []
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue
    if (Math.abs(offset) < 2) continue // Only allow ±2 and ±3
    const val = correctAnswer + offset
    if (val > 0) { // must be positive (greater than 0)
      candidates.push(val)
    }
  }

  // If we don't have enough candidates (e.g. correctAnswer is very small like 1 or 2), let's expand candidate range to ±1, +4, +5 but always positive.
  if (candidates.length < 3) {
    for (let offset = -3; offset <= 5; offset++) {
      if (offset === 0) continue
      const val = correctAnswer + offset
      if (val > 0 && val !== correctAnswer && !candidates.includes(val)) {
        candidates.push(val)
      }
    }
  }

  // Shuffle candidates and pick 3 distractors so that total pool size is 4
  const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5)
  const numDistractors = Math.min(3, shuffledCandidates.length)
  for (let i = 0; i < numDistractors; i++) {
    pool.add(shuffledCandidates[i])
  }

  // Fallback: if we still don't have 4 choices, add more positive numbers close by
  let offset = 4
  while (pool.size < 4) {
    const val = correctAnswer + offset
    if (val > 0 && !pool.has(val)) {
      pool.add(val)
    }
    const val2 = correctAnswer - offset
    if (val2 > 0 && !pool.has(val2)) {
      pool.add(val2)
    }
    offset++
  }

  // Convert to array and shuffle
  return Array.from(pool).sort(() => Math.random() - 0.5)
}

// Helper to get dynamic hint focusing on process
function getProcessHint(quizQ: string): string {
  const isWordProblem = /[a-zA-Z]{3,}/.test(quizQ) && quizQ.length > 15;

  if (isWordProblem) {
    return "Baca ulang soalnya pelan-pelan, angka mana yang perlu dihitung? 🤔";
  }

  const hasMult = quizQ.includes('×') || quizQ.includes('*');
  const hasAddSub = quizQ.includes('+') || quizQ.includes('-');
  if (hasMult && hasAddSub) {
    return "Selesaikan perkalian/pembagian terlebih dahulu, baru lakukan penjumlahan/pengurangan 🤔";
  }

  if (hasMult) {
    return "Ingat, a × b berarti a dijumlahkan sebanyak b kali 🤔";
  }
  if (quizQ.includes('-')) {
    return "Bayangkan kamu punya sejumlah sesuatu, lalu dikurangi 🤔";
  }
  if (quizQ.includes('+')) {
    return "Coba jumlahkan kedua angka satu per satu 🤔";
  }

  return "Coba hitung kembali dengan teliti ya 🤔";
}

interface VisualHintModalProps {
  door: QuizDoor
  onClose: () => void
}

function VisualHintModal({ door, onClose }: VisualHintModalProps) {
  const [hintStep, setHintStep] = useState<1 | 2 | 3>(1)

  const renderIllustration = () => {
    switch (door.id) {
      case 'A': // Room A door (3 × 3 = 9)
      case 'B': // Room B door (3 × 5 = 15)
        {
          const rows = door.id === 'A' ? 3 : 5
          const cols = 3
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              {Array.from({ length: rows }).map((_, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const idx = rIdx * cols + cIdx + 1
                    return (
                      <div key={cIdx} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: hintStep >= 2 ? 'rgba(0, 173, 181, 0.2)' : 'rgba(0, 173, 181, 0.05)',
                        border: '1.5px solid #00ADB5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FFFFFF', fontWeight: 900, fontSize: 13,
                        boxShadow: hintStep >= 2 ? '0 0 8px rgba(0, 173, 181, 0.4)' : 'none',
                        transition: 'all 0.3s'
                      }}>
                        {hintStep >= 2 ? idx : ''}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, textAlign: 'center', fontWeight: 600 }}>
                {hintStep === 1 ? `${rows} baris, masing-masing berisi ${cols} objek.` : 'Hitung jumlah seluruh objek satu per satu:'}
              </div>
            </div>
          )
        }

      case 'C': // Room C door (8 + 3 = 11)
        {
          const leftCount = 8
          const rightCount = 3
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {/* Left Group */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 120, justifyContent: 'center' }}>
                  {Array.from({ length: leftCount }).map((_, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: hintStep >= 2 ? 'rgba(129, 140, 248, 0.25)' : 'rgba(129, 140, 248, 0.08)',
                      border: '1.5px solid #818cf8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 900, fontSize: 11,
                      boxShadow: hintStep >= 2 ? '0 0 6px rgba(129, 140, 248, 0.4)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {hintStep >= 2 ? i + 1 : ''}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: door.color }}>+</div>
                {/* Right Group */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 120, justifyContent: 'center' }}>
                  {Array.from({ length: rightCount }).map((_, i) => (
                    <div key={i} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: hintStep >= 2 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.08)',
                      border: '1.5px solid #10b981',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 900, fontSize: 11,
                      boxShadow: hintStep >= 2 ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {hintStep >= 2 ? leftCount + i + 1 : ''}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', fontWeight: 600 }}>
                {hintStep === 1 ? `Gabungkan grup kiri (${leftCount} objek) dan grup kanan (${rightCount} objek).` : 'Hitung total gabungan objek:'}
              </div>
            </div>
          )
        }

      case 'A1': // VII-1: Rentang dari data [2, 4, 3, 8, 1] (Jwb: 7)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, marginBottom: 4 }}>TERKECIL</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>1</div>
              </div>
              <div style={{ fontSize: 20, color: '#94A3B8', fontWeight: 'bold' }}>sampai</div>
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 800, marginBottom: 4 }}>TERBESAR</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>8</div>
              </div>
            </div>
            {hintStep >= 2 && (
              <div style={{ fontSize: 16, fontWeight: 800, color: '#00ADB5', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, width: '100%', textAlign: 'center' }}>
                Rentang = 8 − 1 = 7
              </div>
            )}
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Rentang dihitung dengan mencari selisih antara nilai terbesar (8) dan terkecil (1).' : 'Kurangkan nilai terbesar dengan nilai terkecil.'}
            </div>
          </div>
        )

      case 'A2': // VII-2: Tepi bawah dari kelas 4-6? (Jwb: 3.5)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 800, marginBottom: 4 }}>BATAS BAWAH</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>4</div>
              </div>
              <div style={{ fontSize: 20, color: '#00ADB5', fontWeight: 'bold' }}>− 0.5</div>
              {hintStep >= 2 && (
                <div style={{ padding: '10px 14px', background: 'rgba(0,173,181,0.1)', border: '1.5px solid #00ADB5', borderRadius: 12, textAlign: 'center', boxShadow: '0 0 10px rgba(0,173,181,0.3)' }}>
                  <div style={{ fontSize: 10, color: '#00ADB5', fontWeight: 800, marginBottom: 4 }}>TEPI BAWAH</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#00ADB5' }}>3.5</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Tepi bawah diperoleh dengan mengurangkan batas bawah kelas dengan 0.5.' : 'Kurangkan batas bawah (4) dengan 0.5 untuk memperoleh tepi bawah: 4 − 0.5 = 3.5.'}
            </div>
          </div>
        )

      case 'A3': // VII-3: Rentang = 17, banyak kelas = 6. Panjang kelas dibulatkan ke atas? (Jwb: 3)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(0,173,181,0.06)', border: '1px solid rgba(0,173,181,0.2)', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 800, marginBottom: 6 }}>RUMUS PANJANG KELAS</div>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'monospace' }}>
                Panjang Kelas = Rentang ÷ Banyak Kelas
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 15, fontWeight: 'bold', color: '#00ADB5', fontFamily: 'monospace', marginTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 8 }}>
                  17 ÷ 6 = 2.83... → Bulatkan ke atas = 3
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Bagi rentang data dengan banyak kelas sesuai rumus.' : 'Hasil pembagian adalah 2.83. Dibulatkan ke atas menjadi bilangan bulat terdekat yaitu 3.'}
            </div>
          </div>
        )

      case 'B1': // VIII-1: Tindakan paling etis atas berita belum terverifikasi (Jwb: Verifikasi dulu)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#E2E8F0' }}>Penerimaan Berita Baru 📰</span>
              </div>
              {hintStep >= 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, fontSize: 11, color: '#EF4444' }}>
                    ❌ Langsung Share / Sebar ➡️ Potensi hoax & fitnah!
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 8, fontSize: 11, color: '#10B981', fontWeight: 'bold', boxShadow: '0 0 6px rgba(16, 185, 129, 0.2)' }}>
                    ✅ Verifikasi ➡️ Cek fakta agar aman & bermanfaat!
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Mendapat berita viral membutuhkan penyaringan yang ketat sebelum dibagikan.' : 'Prioritaskan tindakan yang memverifikasi kebenaran berita terlebih dahulu.'}
            </div>
          </div>
        )

      case 'B2': // VIII-2: Posting foto tanpa izin (Jwb: Kedua-duanya)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', width: '90%' }}>
              <div style={{ flex: 1, padding: 10, background: 'rgba(0,173,181,0.05)', border: '1px solid #00ADB5', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🔒</div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 }}>Hak Privasi</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Kebebasan individu</div>
              </div>
              <div style={{ flex: 1, padding: 10, background: 'rgba(0,173,181,0.05)', border: '1px solid #00ADB5', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🎨</div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 }}>Hak Cipta</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Kepemilikan karya</div>
              </div>
            </div>
            {hintStep >= 2 && (
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981', borderRadius: 8, width: '90%', textAlign: 'center', fontSize: 12, color: '#10B981', fontWeight: 'bold' }}>
                Kedua hak tersebut dilanggar sekaligus!
              </div>
            )}
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Mempublikasikan foto potret seseorang menyangkut ranah pribadi dan kepemilikan visual.' : 'Karena melanggar kebebasan pribadi dan kepemilikan karya, maka pilihan yang tepat adalah kedua-duanya.'}
            </div>
          </div>
        )

      case 'B3': // VIII-3: Konten memancing emosi negatif (Jwb: Clickbait)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(217, 119, 6, 0.06)', border: '1px solid #d97706', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#ffb060', fontWeight: 800, marginBottom: 4, letterSpacing: '1px' }}>DEFINISI KUNCI</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }}>
                "Umpan klik" / Clickbait 🎣
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
                  Konten provokatif sengaja didesain untuk memicu amarah/emosi instan pembaca agar mengeklik tautan tersebut.
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Istilah ini menggambarkan pancingan judul atau umpan visual yang memicu respons emosional.' : 'Pancingan semacam ini dikenal secara umum dengan sebutan Clickbait.'}
            </div>
          </div>
        )

      case 'C1': // IX-1: Ciri hoax yang paling umum (Jwb: Sumber tidak jelas)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, width: '90%' }}>
              <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, marginBottom: 4 }}>CHECKLIST HOAX:</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
                <li>Informasi bombastis & berlebihan</li>
                <li style={{ color: hintStep >= 2 ? '#EF4444' : '#E2E8F0', fontWeight: hintStep >= 2 ? 'bold' : 'normal' }}>
                  Tidak memiliki sumber rujukan yang jelas/kredibel
                </li>
                <li>Meminta informasi disebarkan secara instan</li>
              </ul>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Ciri utama berita palsu yang paling mencolok terletak pada asal-usul kredibilitas beritanya.' : 'Ciri paling umum adalah sumber informasinya tidak jelas atau tidak dapat dipertanggungjawabkan.'}
            </div>
          </div>
        )

      case 'C2': // IX-2: Langkah pertama saat menemukan info mencurigakan (Jwb: Cek sumber asli)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
              <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 'bold' }}>🔎 Menemukan Info Mencurigakan</span>
              </div>
              {hintStep >= 2 && (
                <div style={{ padding: '10px 12px', background: 'rgba(0,173,181,0.08)', border: '1.5px solid #00ADB5', borderRadius: 8, textAlign: 'center', fontSize: 12, color: '#00ADB5', fontWeight: 'bold' }}>
                  Langkah 1: Menelusuri & Cek Sumber Aslinya!
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Sebelum mempercayai atau membagikan, langkah pertama adalah melakukan penelusuran fakta.' : 'Tindakan awal yang benar adalah memverifikasi langsung ke sumber rujukan orisinalnya.'}
            </div>
          </div>
        )

      case 'C3': // IX-3: Platform verifikasi berita di Indonesia (Jwb: TurnBackHoax)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(0,173,181,0.06)', border: '1px solid rgba(0,173,181,0.2)', borderRadius: 12, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#00ADB5', fontWeight: 800, marginBottom: 4 }}>DATABASE RUJUKAN CEK FAKTA</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'monospace' }}>
                🌐 Mafindo (TurnBackHoax)
              </div>
              {hintStep >= 2 && (
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
                  Situs independen cek fakta yang mengarsipkan berbagai klarifikasi hoaks secara resmi di Indonesia.
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', fontWeight: 600 }}>
              {hintStep === 1 ? 'Pilihlah portal cek fakta komunitas anti-fitnah resmi yang terdaftar di Indonesia.' : 'Platform cek fakta Indonesia yang terpopuler dan terakreditasi adalah TurnBackHoax.'}
            </div>
          </div>
        )

      default:
        return <div style={{ color: '#E2E8F0', fontSize: 13 }}>Ilustrasi bantuan tidak tersedia 🤔</div>
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        background: 'rgba(4, 7, 10, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        style={{
          maxWidth: 400,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.98)',
          border: '2px solid #00ADB5',
          boxShadow: '0 0 25px rgba(0, 173, 181, 0.35)',
          borderRadius: 24,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#00ADB5', letterSpacing: '2px', marginBottom: 4 }}>🧠 BANTUAN VISUAL STEP-BY-STEP</div>
          <h3 style={{ margin: 0, fontSize: 16, color: '#FFFFFF', fontWeight: 800 }}>Teka-teki: {door.label}</h3>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[1, 2, 3].map(st => (
            <div key={st} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: hintStep === st ? '#00ADB5' : hintStep > st ? 'rgba(0,173,181,0.3)' : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {/* Teks Soal Aktif */}
        <div style={{
          background: 'rgba(0, 173, 181, 0.06)',
          border: '1.5px solid rgba(0, 173, 181, 0.25)',
          borderRadius: 14,
          padding: '10px 14px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            SOAL AKTIF
          </div>
          <div style={{
            fontSize: door.quizQ.length > 30 ? '13px' : '16px',
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: 'var(--font-data)',
            lineHeight: 1.4
          }}>
            {door.quizQ}
          </div>
        </div>

        {/* Illustration Canvas Area */}
        <div style={{
          minHeight: 180,
          background: 'rgba(4, 7, 10, 0.4)',
          border: '1px solid rgba(14, 131, 136, 0.15)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {hintStep === 3 ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤔</div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.5 }}>
                Jadi totalnya berapa?<br />
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Tutup bantuan ini lalu seret jawaban yang tepat!</span>
              </p>
            </div>
          ) : (
            renderIllustration()
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="game-btn game-btn-secondary" style={{ flex: 1, padding: '10px 14px', fontSize: 13, background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', color: '#EF4444' }} onClick={onClose}>Tutup</button>
          {hintStep < 3 && (
            <button className="game-btn game-btn-primary" style={{ flex: 1.5, padding: '10px 14px', fontSize: 13 }} onClick={() => setHintStep(curr => (curr + 1) as any)}>
              Lanjut →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Quiz popup ───────────────────────────────────────────────────────────────
function QuizPopup({ door, isFD, onCorrect, onClose }:
  { door: QuizDoor; isFD: boolean; onCorrect: () => void; onClose: () => void }) {
  const [shake, setShake] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [openVisualModal, setOpenVisualModal] = useState(false)
  const [choices, setChoices] = useState<(number | string)[]>([])
  const [placedChoice, setPlacedChoice] = useState<number | string | null>(null)
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({})
  const [isCorrect, setIsCorrect] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  useEffect(() => {
    if (door.choices) {
      setChoices([...door.choices].sort(() => Math.random() - 0.5))
    } else {
      setChoices(generateAnswerPool(Number(door.quizA)))
    }
    setPlacedChoice(null)
    setIsCorrect(false)
    setIsWrong(false)
    setWrongCount(0)
    setOpenVisualModal(false)
  }, [door])

  // Automatically open the visual modal when the threshold is hit
  useEffect(() => {
    const needsVisual = isFD ? (wrongCount >= 2) : (wrongCount >= 3)
    if (needsVisual) {
      setOpenVisualModal(true)
    }
  }, [wrongCount, isFD])

  const handlePlaceAnswer = (val: number | string) => {
    if (val === door.quizA) {
      setPlacedChoice(val)
      setIsCorrect(true)
      setIsWrong(false)
    } else {
      setPlacedChoice(val)
      setIsWrong(true)
      setIsCorrect(false)
      setShake(k => k + 1)
      setWrongCount(prev => prev + 1)
      // Snap it back after a short red animation
      setTimeout(() => {
        setPlacedChoice(null)
        setIsWrong(false)
        setResetKeys(prev => ({ ...prev, [val]: (prev[val] ?? 0) + 1 }))
      }, 800)
    }
  }

  const submit = () => {
    if (isCorrect) {
      onCorrect()
    }
  }

  const showTextHint = isFD ? (wrongCount >= 1) : (wrongCount >= 2)
  const showVisualHint = isFD ? (wrongCount >= 2) : (wrongCount >= 3)

  const isTextQuestion = typeof door.quizA === 'string'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(11, 30, 44, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.88, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 18 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          style={{
            maxWidth: 420,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(15, 35, 56, 0.95)',
            border: `2.5px solid ${door.color}66`,
            borderRadius: 24,
            padding: '24px 20px',
            boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: door.color, marginBottom: 8 }}>🔐 {door.label} — Jawab untuk membuka!</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.6 }}>Di dalam pintu ini tersimpan data screen time. Jawab soal berikut untuk membuka pintu:</p>
          </div>

          {(door.image || CLASS_STUDENTS[door.id]?.image) && (
            <div style={{
              width: '100%',
              height: 130,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              border: `1.5px solid ${door.color}66`,
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
            }}>
              <img
                src={door.image || CLASS_STUDENTS[door.id]?.image}
                alt={door.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 20%, rgba(15, 35, 56, 0.9) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '8px 12px'
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🏫 Ruangan {door.label}
                </span>
              </div>
            </div>
          )}
          <div style={{ background: `${door.color}11`, border: `1.5px solid ${door.color}33`, borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: door.quizQ.length > 20 ? (door.quizQ.length > 50 ? 14 : 16) : 22, fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-data)', lineHeight: 1.4 }}>{door.quizQ}</div>

            {/* FD Context Hint */}
            {isFD && door.fdContext && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#ffb060', fontWeight: 600, lineHeight: 1.5, background: 'rgba(217, 119, 6, 0.08)', border: '1px dashed rgba(217, 119, 6, 0.3)', borderRadius: '8px', padding: '6px 8px' }}>
                {door.fdContext}
              </div>
            )}
          </div>

          {/* Target Answer Slot */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Drop Jawaban di Sini
            </div>
            <div
              data-answer-slot="true"
              style={{
                width: isTextQuestion ? '85%' : 72,
                height: isTextQuestion ? 46 : 72,
                borderRadius: isTextQuestion ? 12 : 16,
                border: isCorrect
                  ? '2px solid #00ADB5'
                  : isWrong
                    ? '2px dashed #EF4444'
                    : '2px dashed rgba(14, 131, 136, 0.4)',
                background: isCorrect
                  ? 'rgba(0, 173, 181, 0.15)'
                  : isWrong
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(14, 131, 136, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: isCorrect ? '0 0 15px rgba(0, 173, 181, 0.25)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {placedChoice !== null ? (
                <div
                  style={{
                    width: isTextQuestion ? '90%' : 48,
                    height: isTextQuestion ? 32 : 48,
                    borderRadius: isTextQuestion ? 8 : '50%',
                    background: isCorrect
                      ? 'linear-gradient(135deg, #00ADB5 0%, #008891 100%)'
                      : 'linear-gradient(135deg, #EF4444 0%, #C53030 100%)',
                    border: '1.5px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isTextQuestion ? '12px' : (placedChoice.toString().length > 2 ? '14px' : '18px'),
                    fontFamily: isTextQuestion ? 'var(--font-ui)' : 'var(--font-data)',
                    padding: isTextQuestion ? '0 8px' : '0',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {placedChoice}
                </div>
              ) : (
                <span style={{ fontSize: 22, opacity: 0.2, color: door.color, fontFamily: 'monospace' }}>?</span>
              )}
            </div>
          </div>

          {/* Choices Pool */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '10px 0', flexWrap: 'wrap', minHeight: '60px', alignItems: 'center' }}>
            {choices.map((val) => {
              const isPlaced = placedChoice === val && isCorrect
              if (isPlaced) {
                return (
                  <div
                    key={`placeholder-${val}`}
                    style={{
                      width: isTextQuestion ? undefined : 48,
                      height: isTextQuestion ? 34 : 48,
                      padding: isTextQuestion ? '8px 14px' : undefined,
                      minWidth: isTextQuestion ? 80 : undefined,
                      borderRadius: isTextQuestion ? 10 : '50%',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed rgba(255, 255, 255, 0.08)',
                    }}
                  />
                )
              }

              const key = `${val}-${resetKeys[val] ?? 0}`
              return (
                <motion.div
                  key={key}
                  id={`choice-${val}`}
                  drag
                  dragMomentum={false}
                  dragElastic={0.08}
                  onDragStart={() => {
                    setIsWrong(false)
                  }}
                  onDragEnd={(event) => {
                    let clientX: number, clientY: number
                    if ('changedTouches' in event && event.changedTouches.length > 0) {
                      clientX = event.changedTouches[0].clientX
                      clientY = event.changedTouches[0].clientY
                    } else {
                      clientX = (event as MouseEvent | PointerEvent).clientX
                      clientY = (event as MouseEvent | PointerEvent).clientY
                    }

                    const dragEl = document.getElementById(`choice-${val}`)
                    const savedPE = dragEl?.style.pointerEvents ?? ''
                    if (dragEl) dragEl.style.pointerEvents = 'none'
                    const elem = document.elementFromPoint(clientX, clientY)
                    if (dragEl) dragEl.style.pointerEvents = savedPE

                    let placed = false
                    if (elem) {
                      const slotEl = elem.closest('[data-answer-slot]')
                      if (slotEl) {
                        placed = true
                        handlePlaceAnswer(val)
                      }
                    }

                    if (!placed) {
                      setResetKeys(prev => ({ ...prev, [val]: (prev[val] ?? 0) + 1 }))
                    }
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileDrag={{ scale: 1.15, zIndex: 9999, cursor: 'grabbing', boxShadow: `0 8px 24px ${door.color}66, 0 0 0 2px ${door.color}` }}
                  style={{
                    width: isTextQuestion ? undefined : 48,
                    height: isTextQuestion ? 34 : 48,
                    borderRadius: isTextQuestion ? 10 : '50%',
                    background: `linear-gradient(135deg, ${door.color}dd 0%, ${door.color}88 100%)`,
                    border: `1.5px solid ${door.color}55`,
                    boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isTextQuestion ? '12px' : (val.toString().length > 2 ? '14px' : '18px'),
                    fontFamily: isTextQuestion ? 'var(--font-ui)' : 'var(--font-data)',
                    padding: isTextQuestion ? '8px 14px' : '0',
                    cursor: 'grab',
                    userSelect: 'none',
                    touchAction: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {val}
                </motion.div>
              )
            })}
          </div>

          <motion.div key={shake} animate={shake > 0 ? { x: [-8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.35 }}>
            <AnimatePresence>
              {showTextHint && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', fontSize: 15, fontWeight: 600, color: '#ffb060', lineHeight: 1.6 }}>
                💡 {door.hint}
              </motion.div>}
            </AnimatePresence>
          </motion.div>

          {/* Bantuan Visual Button */}
          {showVisualHint && (
            <button
              className="game-btn game-btn-secondary"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 12px',
                alignSelf: 'center',
                color: '#00ADB5',
                borderColor: 'rgba(0, 173, 181, 0.3)',
                background: 'rgba(0, 173, 181, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '4px auto 0 auto',
                borderRadius: '8px'
              }}
              onClick={() => setOpenVisualModal(true)}
            >
              💡 Buka Bantuan Visual Step-by-Step
            </button>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="game-btn game-btn-secondary" style={{ flex: 1, fontSize: 15, fontWeight: 800, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1.5px solid #EF4444', color: '#EF4444' }} onClick={onClose}>Kembali</button>
            <button
              className="game-btn game-btn-primary"
              style={{
                flex: 2,
                fontSize: 15,
                fontWeight: 800,
                padding: '10px 14px',
                opacity: isCorrect ? 1 : 0.45,
                cursor: isCorrect ? 'pointer' : 'not-allowed'
              }}
              onClick={submit}
              disabled={!isCorrect}
            >
              Buka Pintu →
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {openVisualModal && (
          <VisualHintModal
            door={door}
            onClose={() => setOpenVisualModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Counter overlay ──────────────────────────────────────────────────────────
function CounterResult({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [btn, setBtn] = useState(false)

  useEffect(() => {
    let c = 0
    const id = setInterval(() => {
      c++
      setCount(c)
      if (c >= TOTAL_N) {
        clearInterval(id)
        setTimeout(() => setDone(true), 300)
        setTimeout(() => setBtn(true), 1100)
      }
    }, 45)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(11, 30, 44, 0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            maxWidth: 460,
            width: '100%',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            background: 'rgba(15, 35, 56, 0.95)',
            border: '2px solid rgba(14, 131, 136, 0.5)',
            borderRadius: 26,
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 10px 35px rgba(14, 131, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '2px', color: '#00ADB5', marginBottom: 8 }}>⚙️ MESIN PENGHITUNG DATA</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#FFFFFF' }}>Mengagregasikan total sampel...</h3>
          </div>
          <div style={{ background: 'rgba(14, 131, 136, 0.06)', border: '2px solid rgba(14, 131, 136, 0.3)', borderRadius: 20, padding: '28px 20px' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 800, marginBottom: 10, letterSpacing: '0.8px' }}>JUMLAH SAMPEL (n)</div>
            <motion.div style={{ fontSize: 84, fontWeight: 900, color: '#00ADB5', fontFamily: 'var(--font-data)', lineHeight: 1 }}
              animate={done ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6 }}>{count}</motion.div>
          </div>
          <AnimatePresence>{done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(14, 131, 136, 0.04)', border: '1px solid rgba(14, 131, 136, 0.2)', fontSize: 15, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.7, textAlign: 'left' }}>
                Kamu telah mengumpulkan seluruh data dari 3 ruangan.<br />
                Ukuran sampel yang terkumpul adalah <strong style={{ color: '#00ADB5', fontSize: 19 }}>n = {TOTAL_N}</strong>.
              </div>
              {btn && <button className="game-btn game-btn-primary" style={{ width: '100%', fontSize: 16, fontWeight: 800, padding: '12px 18px' }} onClick={onDone}>Lanjut ke Perhitungan Rentang (R) →</button>}
            </motion.div>
          )}</AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default function NPath({ onComplete, isFD = true, demoMode = false }: { onComplete: () => void; isFD?: boolean; demoMode?: boolean }) {
  const [charPos, setCharPos] = useState({ x: 650, y: 550 })
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    return demoMode ? new Set(['A', 'B', 'C', 'A1', 'A2', 'A3', 'B1']) : new Set(['A', 'B', 'C'])
  })
  const [justCompletedClassId, setJustCompletedClassId] = useState<string | null>(null)
  const [activeDoor, setActiveDoor] = useState<typeof DOORS[number] | null>(null)
  const [nearDoor, setNearDoor] = useState<typeof DOORS[number] | null>(null)
  const [activeClass, setActiveClass] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [nearClass, setNearClass] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [insideRoom, setInsideRoom] = useState<typeof CLASS_DOORS[number] | null>(null)
  const insideRoomR = useRef(insideRoom); insideRoomR.current = insideRoom
  const lastHallwayPosRef = useRef<{ x: number; y: number }>({ x: 650, y: 550 })
  const [visitedRooms, setVisitedRooms] = useState<Set<DoorId>>(new Set())
  const [diraMessageText, setDiraMessageText] = useState<string | null>(null)
  const [showWaliKelasPopup, setShowWaliKelasPopup] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [collected, setCollected] = useState<Set<string>>(() => {
    if (demoMode) {
      const initialSet = new Set<string>()
      const demoClassIds = ['A1', 'A2', 'A3', 'B1']
      const classCircles = DATA_CIRCLES.filter(c => demoClassIds.includes(c.classId))
      classCircles.forEach(c => initialSet.add(c.id))
      return initialSet
    }
    return new Set()
  })
  const [showCounter, setShowCounter] = useState(demoMode ? true : false)
  const [roomMilestoneText, setRoomMilestoneText] = useState<string | null>(null)
  const [milestoneGlow, setMilestoneGlow] = useState<'50%' | '100%' | null>(null)
  const [moveDir, setMoveDir] = useState({ x: 0, y: 0 })
  const [showDebug, setShowDebug] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [inventoryTab, setInventoryTab] = useState<'ALL' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('ALL')

  const charPosRef = useRef({ x: 650, y: 550 })

  // Dynamic Container ResizeObserver for 100% Edge-to-Edge Responsive Viewport
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDim, setContainerDim] = useState({ w: 640, h: 360 })

  useEffect(() => {
    if (!containerRef.current) return
    const updateDim = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerDim(prev => (prev.w === clientWidth && prev.h === clientHeight ? prev : { w: clientWidth, h: clientHeight }))
        }
      }
    }
    updateDim()
    const ro = new ResizeObserver(updateDim)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const dirRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)
  const unlockedR = useRef(unlocked); unlockedR.current = unlocked
  const activeDoorR = useRef(activeDoor); activeDoorR.current = activeDoor
  const nearDoorR = useRef(nearDoor); nearDoorR.current = nearDoor
  const activeClassR = useRef(activeClass); activeClassR.current = activeClass
  const nearClassR = useRef(nearClass); nearClassR.current = nearClass
  const showWaliKelasPopupR = useRef(showWaliKelasPopup); showWaliKelasPopupR.current = showWaliKelasPopup

  // Sync charPosRef with charPos
  useEffect(() => {
    charPosRef.current = charPos
  }, [charPos])

  // Compute current room based on position reactively
  let currentRoomId: DoorId | null = null
  if (charPos.x < 500) currentRoomId = 'A'
  else if (charPos.x <= 800) currentRoomId = 'B'
  else currentRoomId = 'C'

  // Trigger Dira dialog popup when entering a room for the first time
  useEffect(() => {
    if (currentRoomId && !visitedRooms.has(currentRoomId)) {
      setVisitedRooms(prev => new Set([...prev, currentRoomId!]))
      if (currentRoomId === 'A') {
        setDiraMessageText("Halo Detektif! Di Zona VII ini terdapat beberapa kelompok meja yang menyimpan data screen time. Datangi & periksa tiap titik data untuk mengumpulkan datanya! 🕵️‍♂️")
      } else if (currentRoomId === 'B') {
        setDiraMessageText("Keren! Di Zona VIII, datamu tersimpan di papan tulis & meja belajar. Jawab tantangannya untuk membuka seluruh data!")
      } else if (currentRoomId === 'C') {
        setDiraMessageText("Hampir lengkap! Di Zona IX, periksa meja & mading kelas untuk melengkapi seluruh data screen time siswa!")
      }
    }
  }, [currentRoomId, visitedRooms])

  // Proximity to doors (calculated smoothly from player position)
  useEffect(() => {
    const { x: cx, y: cy } = charPos
    let closest: typeof DOORS[number] | null = null
    let minDist = Infinity
    for (const d of DOORS) {
      if (unlockedR.current.has(d.id)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      if (dist < 50 && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearDoor(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos])

  // Proximity to class doors (calculated smoothly from player position)
  useEffect(() => {
    const { x: cx, y: cy } = charPos
    let closest: typeof CLASS_DOORS[number] | null = null
    let minDist = Infinity
    for (const d of CLASS_DOORS) {
      if (!unlockedR.current.has(d.roomId)) continue
      if (unlockedR.current.has(d.id)) continue
      const dist = Math.hypot(d.x - cx, d.y - cy)
      if (dist < 50 && dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    setNearClass(prev => (prev?.id === closest?.id ? prev : closest))
  }, [charPos])

  // Finish trigger once all 35 data points are collected
  useEffect(() => {
    if (collected.size >= TOTAL_N && !showCounter) {
      setTimeout(() => setShowCounter(true), 600)
    }
  }, [collected.size, showCounter])

  // Auto-clamp player Y position if ever above RED_LINE_POINTS
  useEffect(() => {
    if (insideRoom) return
    const redLineY = getRedLineY(charPos.x)
    if (charPos.y < redLineY - 1) {
      setCharPos(prev => (prev.y < redLineY - 1 ? { ...prev, y: redLineY } : prev))
    }
  }, [charPos.x, charPos.y, insideRoom])

  const lastTimeRef = useRef<number>(0)

  // Main game tick: movement animation loop with delta-time smoothing
  useEffect(() => {
    lastTimeRef.current = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      if (!activeDoor && !activeClass && !diraMessageText && !showWaliKelasPopup) {
        const { x: dx, y: dy } = dirRef.current
        if (dx || dy) {
          const currentMapKey = insideRoomR.current?.id || 'hallway'
          const activeMap = LEVEL1_MAPS[currentMapKey] || LEVEL1_MAPS['hallway']
          const moveSpeed = activeMap.character.speed * 40 // Scaled responsive pixels per second per map
          const dist = moveSpeed * dt

          setCharPos(p => {
            const isInside = !!insideRoomR.current
            const currentRedLineY = isInside ? 380 : getRedLineY(p.x)
            const safeY = Math.max(p.y, currentRedLineY)

            const nx = Math.max(10, Math.min(WORLD_VW - 10, p.x + dx * dist))
            const ny = Math.max(10, Math.min(WORLD_VH - 10, safeY + dy * dist))

            if (activeMap.isWalkable(nx, ny, unlockedR.current)) {
              if (nx === p.x && ny === p.y) return p
              return { x: nx, y: ny }
            }
            if (activeMap.isWalkable(nx, safeY, unlockedR.current)) {
              if (nx === p.x && safeY === p.y) return p
              return { x: nx, y: safeY }
            }
            if (activeMap.isWalkable(p.x, ny, unlockedR.current)) {
              if (p.x === p.x && ny === p.y) return p
              return { x: p.x, y: ny }
            }
            if (p.x === p.x && safeY === p.y) return p
            return { x: p.x, y: safeY }
          })
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [activeDoor, activeClass, diraMessageText, showWaliKelasPopup])

  // Keyboard navigation listeners
  useEffect(() => {
    const KEY_MAP: Record<string, { x: number; y: number }> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    }
    const pressedKeys = new Set<string>()

    const updateDir = () => {
      let nx = 0, ny = 0
      pressedKeys.forEach(k => {
        const d = KEY_MAP[k]
        if (d) { nx += d.x; ny += d.y }
      })
      const len = Math.sqrt(nx * nx + ny * ny)
      const nextDir = len > 0 ? { x: nx / len, y: ny / len } : { x: 0, y: 0 }
      dirRef.current = nextDir
      setMoveDir(nextDir)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const activeDoorVal = activeDoorR.current
      const activeClassVal = activeClassR.current
      const nearDoorVal = nearDoorR.current
      const nearClassVal = nearClassR.current

      if (activeDoorVal || activeClassVal || diraMessageText || showWaliKelasPopupR.current) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setActiveDoor(null)
          setActiveClass(null)
        }
        return
      }
      if (insideRoomR.current && e.key === 'Escape') {
        e.preventDefault()
        setInsideRoom(null)
        setCharPos(lastHallwayPosRef.current || { x: 650, y: 550 })
        return
      }
      if (KEY_MAP[e.key]) {
        e.preventDefault()
        pressedKeys.add(e.key)
        updateDir()
      }
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && nearDoorVal && !unlockedR.current.has(nearDoorVal.id)) {
        e.preventDefault()
        setUnlocked(p => new Set([...p, nearDoorVal.id]))
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && nearClassVal) {
        e.preventDefault()
        if (unlockedR.current.has(nearClassVal.id)) {
          lastHallwayPosRef.current = { x: nearClassVal.x, y: nearClassVal.y + 20 }
          setInsideRoom(nearClassVal)
          setCharPos({ x: 1000, y: 620 })
        } else {
          setActiveClass(nearClassVal)
        }
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && insideRoomR.current) {
        const teacherX = 710
        const teacherY = 420
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (distToTeacher < 350) {
          e.preventDefault()
          setShowWaliKelasPopup(insideRoomR.current)
        }
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key)
      updateDir()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      dirRef.current = { x: 0, y: 0 }
      setMoveDir({ x: 0, y: 0 })
    }
  }, [diraMessageText])

  const handleCorrect = useCallback(() => {
    if (!activeDoor) return
    setUnlocked(p => new Set([...p, activeDoor.id]))
    setActiveDoor(null)
  }, [activeDoor])

  const handleClassCorrect = useCallback(() => {
    if (!activeClass) return
    const roomToEnter = activeClass
    setActiveClass(null)
    lastHallwayPosRef.current = { x: roomToEnter.x, y: roomToEnter.y + 20 }
    setInsideRoom(roomToEnter)
    setCharPos({ x: 600, y: 580 })
  }, [activeClass])

  const handleExitClassroom = useCallback(() => {
    if (!insideRoom) return
    setInsideRoom(null)
    setCharPos(lastHallwayPosRef.current || { x: 650, y: 550 })
  }, [insideRoom])

  const handleCloseWaliKelas = useCallback(() => {
    if (!showWaliKelasPopup) return
    const cid = showWaliKelasPopup.id
    const roomId = showWaliKelasPopup.roomId

    // 1. Add class ID to unlocked & check room completion
    setUnlocked(prev => {
      const next = new Set(prev)
      next.add(cid)

      const roomClasses = CLASS_DOORS.filter(cd => cd.roomId === roomId)
      const completed = roomClasses.every(cd => next.has(cd.id))
      if (completed) {
        setRoomMilestoneText(`RUANG ${roomId} SELESAI! 🚀`)
        setTimeout(() => {
          setRoomMilestoneText(null)
        }, 2200)
      }

      return next
    })

    // 2. Add class data circles to collected & check total milestones
    const classCircles = DATA_CIRCLES.filter(c => c.classId === cid)
    setCollected(prev => {
      const next = new Set(prev)
      classCircles.forEach(c => next.add(c.id))

      const oldSize = prev.size
      const newSize = next.size

      if (oldSize < 18 && newSize >= 18) {
        setMilestoneGlow('50%')
        setTimeout(() => setMilestoneGlow(null), 1800)
      } else if (oldSize < 35 && newSize >= 35) {
        setMilestoneGlow('100%')
        setTimeout(() => setMilestoneGlow(null), 2500)
      }

      return next
    })

    setJustCompletedClassId(cid)
    setTimeout(() => {
      setJustCompletedClassId(null)
    }, 1500)

    setShowWaliKelasPopup(null)
  }, [showWaliKelasPopup])

  const n = collected.size
  const isRoomACompleted = CLASS_DOORS.filter(cd => cd.roomId === 'A').every(cd => unlocked.has(cd.id))
  const isRoomBCompleted = CLASS_DOORS.filter(cd => cd.roomId === 'B').every(cd => unlocked.has(cd.id))
  const isRoomCCompleted = CLASS_DOORS.filter(cd => cd.roomId === 'C').every(cd => unlocked.has(cd.id))

  const collectedStudents = CLASS_DOORS
    .filter(cd => unlocked.has(cd.id))
    .flatMap(cd => {
      const info = CLASS_STUDENTS[cd.id]
      return info ? info.students.map(s => ({ classId: cd.id, name: s.name, time: s.time })) : []
    })

  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth'
      })
    }
  }, [unlocked, collectedStudents.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Main Game Viewport Container */}
      <div
        ref={containerRef}
        style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 0, overflow: 'hidden', background: '#04070a', border: 'none' }}
      >

        {/* Floating Glassmorphism Game HUD Overlay inside Viewport */}
        <div style={{
          position: 'absolute',
          top: 'clamp(6px, 1.5vh, 12px)',
          left: 'clamp(95px, 12vw, 120px)',
          right: 'clamp(8px, 1.5vw, 14px)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'clamp(4px, 1vw, 10px)',
          pointerEvents: 'none'
        }}>
          {/* Left: Quest Title & Data Counter Card */}
          <div style={{
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(0, 173, 181, 0.35)',
            borderRadius: 12,
            padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1vw, 10px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'auto'
          }}>
            <div style={{ fontSize: 'clamp(13px, 1.5vw, 15px)' }}>🕵️‍♂️</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 8px)' }}>
              <span style={{ fontSize: 'clamp(10.5px, 1.1vw, 12.5px)', fontWeight: 900, color: '#F8FAFC', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>Eksplorasi Ruangan</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ fontSize: 'clamp(9.5px, 1vw, 11.5px)', fontWeight: 800, color: '#00ADB5', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                DATA: <span style={{ color: '#FFFFFF' }}>{n} / {TOTAL_N}</span>
              </span>
            </div>
          </div>

          {/* Right: Step Indicator */}
          <div style={{
            background: 'rgba(11, 30, 44, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 12,
            padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1.1vw, 14px)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'auto'
          }}>
            <span style={{ fontSize: 'clamp(10px, 1vw, 11.5px)', color: '#00ADB5', fontWeight: 800 }}>📌</span>
            <span style={{ fontSize: 'clamp(9.5px, 1vw, 11.5px)', color: '#F8FAFC', fontWeight: 800, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Langkah 1 dari 3</span>
          </div>
        </div>

        {/* Floating Vertical RPG Inventory Button (Right Side) */}
        <motion.button
          whileHover={{ scale: 1.08, boxShadow: '0 0 25px rgba(0, 173, 181, 0.55)' }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsInventoryOpen(true)}
          style={{
            position: 'absolute',
            right: 'clamp(8px, 1.2vw, 14px)',
            top: '42%',
            transform: 'translateY(-50%)',
            zIndex: 45,
            background: 'linear-gradient(180deg, rgba(15, 35, 56, 0.92) 0%, rgba(11, 30, 44, 0.95) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #00ADB5',
            borderRadius: 16,
            padding: 'clamp(6px, 1vw, 10px) clamp(4px, 0.8vw, 8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: 'clamp(48px, 5.2vw, 60px)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 173, 181, 0.3)',
            pointerEvents: 'auto',
            transition: 'all 0.2s',
          }}
        >
          {/* Icon Container with Floating Badge */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>📓</span>
            {/* Counter Mini Badge */}
            <span style={{
              position: 'absolute',
              top: -6,
              right: -10,
              background: 'linear-gradient(135deg, #00ADB5 0%, #38BDF8 100%)',
              color: '#04070a',
              borderRadius: 10,
              padding: '1px 4px',
              fontSize: 'clamp(8px, 0.8vw, 9px)',
              fontWeight: 900,
              fontFamily: 'var(--font-data)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              lineHeight: 1.2
            }}>
              {n}/{TOTAL_N}
            </span>
          </div>
          {/* Vertical Label */}
          <span style={{
            fontSize: 'clamp(7.5px, 0.85vw, 9px)',
            fontWeight: 900,
            color: '#F8FAFC',
            marginTop: 2
          }}>
            Jurnal<br />Bukti
          </span>
        </motion.button>

        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {(() => {
            const aspect = containerDim.w / Math.max(containerDim.h, 1)
            let viewVH: number, viewVW: number, camX: number, camY: number

            if (insideRoom) {
              // Full-screen fixed camera for classroom view
              viewVW = WORLD_VW
              viewVH = WORLD_VH
              camX = 0
              camY = 0
            } else {
              // Scrolling follow-camera for hallway
              viewVH = 380
              viewVW = 380 * aspect
              if (viewVW > WORLD_VW) {
                viewVW = WORLD_VW
                viewVH = WORLD_VW / aspect
              }
              camX = Math.max(0, Math.min(WORLD_VW - viewVW, charPos.x - viewVW / 2))
              camY = Math.max(0, Math.min(WORLD_VH - viewVH, charPos.y - viewVH * 0.65))
            }
            return (
              <svg viewBox={`${camX} ${camY} ${viewVW} ${viewVH}`} preserveAspectRatio={insideRoom ? "xMidYMid meet" : "none"} style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <filter id="avatar-super-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComponentTransfer in="blur" result="boost">
                      <feFuncA type="linear" slope="1.5" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="boost" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Main Classroom Background Image */}
                <image
                  href={insideRoom ? ((insideRoom as any).image || CLASS_STUDENTS[insideRoom.id]?.image || '/Assets/Building/Kelas.jpg') : '/Assets/Building/Kelas.jpg'}
                  x={0}
                  y={0}
                  width={WORLD_VW}
                  height={WORLD_VH}
                  preserveAspectRatio="none"
                  opacity={showDebug ? 0.45 : 1}
                />

                {/* Atmospheric Classroom Overlay */}
                {insideRoom && (
                  <g style={{ pointerEvents: 'none' }}>
                    {/* Warm ambient tint */}
                    <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(255, 200, 100, 0.04)" />

                    {/* Cinematic vignette effect */}
                    <defs>
                      <radialGradient id="classroom-vignette" cx="50%" cy="45%" r="65%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="85%" stopColor="rgba(10, 5, 2, 0.15)" />
                        <stop offset="100%" stopColor="rgba(10, 5, 2, 0.35)" />
                      </radialGradient>
                      <linearGradient id="light-ray-1" x1="0.2" y1="0" x2="0.35" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 240, 200, 0.12)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="url(#classroom-vignette)" />

                    {/* Subtle window light ray */}
                    <polygon
                      points="0,0 280,0 420,750 100,750"
                      fill="url(#light-ray-1)"
                      opacity={0.6}
                    />
                  </g>
                )}

                {/* Dark Vignette Tint Overlay for Hallway */}
                {!insideRoom && <rect x={0} y={0} width={WORLD_VW} height={WORLD_VH} fill="rgba(4, 7, 10, 0.15)" />}

                {/* ─── VISUAL COLLISION DEBUGGER OVERLAY (Only visible when showDebug === true) ─── */}
                {showDebug && (
                  <g style={{ pointerEvents: 'none' }}>
                    {/* 1. Walkable Area Polygon */}
                    <polygon
                      points={[
                        ...RED_LINE_POINTS.map(p => `${p.x},${p.y}`),
                        `${RED_LINE_POINTS[RED_LINE_POINTS.length - 1].x},640`,
                        `${RED_LINE_POINTS[0].x},640`
                      ].join(' ')}
                      fill="rgba(16, 185, 129, 0.18)"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="6,6"
                    />

                    {/* 2. Red Line Wall Base Boundary */}
                    <polyline
                      points={RED_LINE_POINTS.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={3.5}
                    />

                    {/* 3. Obstacle Collision: Bangku & Pot Tanaman Kiri */}
                    <rect x={120} y={510} width={160} height={100} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth={1.5} />
                    <text x={200} y={560} textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight="bold">⛔ TEMBOK BANGBKU & POT</text>

                    {/* 4. Player Feet Ground Collision Base Line */}
                    <ellipse cx={charPos.x} cy={charPos.y} rx={22} ry={6} fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" strokeWidth={2} />
                    <line x1={charPos.x - 24} y1={charPos.y} x2={charPos.x + 24} y2={charPos.y} stroke="#f43f5e" strokeWidth={2.5} />
                    <text x={charPos.x} y={charPos.y + 18} textAnchor="middle" fill="#f43f5e" fontSize={9} fontWeight="bold">
                      ({Math.round(charPos.x)}, {Math.round(charPos.y)})
                    </text>

                    {/* 5. VISUAL NODE DECORATORS FOR RED_LINE_POINTS */}
                    {RED_LINE_POINTS.map((pt, idx) => (
                      <g key={`red-node-${idx}`}>
                        <circle cx={pt.x} cy={pt.y} r={7} fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth={1.5} />
                        <circle cx={pt.x} cy={pt.y} r={3} fill="#ffffff" />
                        <rect
                          x={pt.x - 30}
                          y={pt.y - 23}
                          width={60}
                          height={15}
                          rx={4}
                          fill="rgba(15, 23, 42, 0.92)"
                          stroke="#ef4444"
                          strokeWidth={1}
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 12}
                          textAnchor="middle"
                          fill="#f87171"
                          fontSize={8.5}
                          fontWeight="900"
                          fontFamily="monospace"
                        >
                          P{idx + 1}: {pt.x},{pt.y}
                        </text>
                      </g>
                    ))}

                    {/* Zone Boundary Grid Lines */}
                    <line x1={450} y1={410} x2={450} y2={680} stroke="rgba(129, 140, 248, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />
                    <line x1={800} y1={410} x2={800} y2={680} stroke="rgba(0, 173, 181, 0.25)" strokeWidth={1.5} strokeDasharray="6,6" />
                  </g>
                )}

                {/* Map Hotspots: Render Teacher NPC inside room OR Class Doors in hallway */}
                {insideRoom ? (() => {
                  const info = CLASS_STUDENTS[insideRoom.id]
                  const teacherName = info?.teacher || 'Wali Kelas'
                  // Position aligned precisely over the teacher drawn in the background image
                  const teacherX = 710
                  const teacherY = 220
                  const hotspotW = 140
                  const hotspotH = 220
                  const isCompleted = unlocked.has(insideRoom.id)
                  const distToTeacher = Math.hypot(charPos.x - teacherX, charPos.y - (teacherY + 180))
                  const nearTeacher = distToTeacher < 350

                  return (
                    <g
                      key={`teacher-${insideRoom.id}`}
                      style={{ cursor: 'pointer' }}
                      onClick={e => { e.stopPropagation(); setShowWaliKelasPopup(insideRoom) }}
                    >
                      {/* Invisible clickable hotspot over the pixel art teacher */}
                      <rect
                        x={teacherX - hotspotW / 2}
                        y={teacherY}
                        width={hotspotW}
                        height={hotspotH}
                        fill="transparent"
                        stroke={showDebug ? '#ff0' : 'none'}
                        strokeWidth={showDebug ? 2 : 0}
                      />

                      {/* RPG-style speech bubble indicator floating over teacher */}
                      <g>
                        <motion.g
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: [0, -4, 0] }}
                          transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
                        >
                          {/* Bubble body */}
                          <rect
                            x={teacherX - 90}
                            y={teacherY - 48}
                            width={180}
                            height={38}
                            rx={6}
                            fill="rgba(15, 23, 42, 0.92)"
                            stroke={isCompleted ? '#10B981' : insideRoom.color}
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}
                          />
                          {/* Bubble triangle pointer */}
                          <polygon
                            points={`${teacherX - 7},${teacherY - 10} ${teacherX + 7},${teacherY - 10} ${teacherX},${teacherY}`}
                            fill="rgba(15, 23, 42, 0.92)"
                            stroke={isCompleted ? '#10B981' : insideRoom.color}
                            strokeWidth={2}
                            strokeLinejoin="round"
                          />
                          <rect
                            x={teacherX - 8}
                            y={teacherY - 12}
                            width={16}
                            height={4}
                            fill="rgba(15, 23, 42, 0.92)"
                          />
                          {/* Name text */}
                          <text
                            x={teacherX}
                            y={teacherY - 34}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize={11}
                            fontWeight="800"
                            fontFamily="var(--font-ui)"
                            style={{ letterSpacing: '0.3px' }}
                          >
                            👩‍🏫 {teacherName}
                          </text>
                          {/* Action prompt text */}
                          <text
                            x={teacherX}
                            y={teacherY - 19}
                            textAnchor="middle"
                            fill={isCompleted ? '#6EE7B7' : '#FCD34D'}
                            fontSize={9}
                            fontWeight="700"
                            fontFamily="var(--font-ui)"
                          >
                            {isCompleted ? '✓ Data Screen Time Saved' : '💬 Klik / Tekan E untuk Minta Data'}
                          </text>
                        </motion.g>
                      </g>
                    </g>
                  )
                })() : CLASS_DOORS.map(door => {
                  const open = unlocked.has(door.id)
                  const near = nearClass?.id === door.id
                  const isJustCompleted = justCompletedClassId === door.id

                  return (
                    <g
                      key={door.id}
                      style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        if (open) {
                          lastHallwayPosRef.current = { x: door.x, y: door.y + 20 }
                          setInsideRoom(door)
                          setCharPos({ x: 600, y: 580 })
                        } else if (!activeClass && !activeDoor) {
                          setActiveClass(door)
                        }
                      }}
                    >
                      {/* Interactive Pulse Radar Glow */}
                      {!open || isJustCompleted ? (
                        <motion.circle
                          cx={door.x}
                          cy={door.y}
                          r={20}
                          fill={`${door.color}22`}
                          animate={isJustCompleted
                            ? { scale: [1, 1.8, 1], fill: [`${door.color}33`, '#10B981', `${door.color}22`] }
                            : near
                              ? { scale: [1, 1.4, 1], fill: [`${door.color}33`, `${door.color}77`, `${door.color}33`] }
                              : { scale: [0.95, 1.15, 0.95] }
                          }
                          transition={{ duration: isJustCompleted ? 1.2 : 1.5, repeat: isJustCompleted ? 0 : Infinity, ease: 'easeInOut' }}
                        />
                      ) : (
                        <circle cx={door.x} cy={door.y} r={12} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth={1} />
                      )}

                      {/* Hotspot Icon Badge */}
                      <circle
                        cx={door.x}
                        cy={door.y}
                        r={12}
                        fill={open ? '#10b981' : 'rgba(15, 23, 42, 0.88)'}
                        stroke={near ? '#FFFFFF' : door.color}
                        strokeWidth={near ? 2 : 1.5}
                      />
                      <text
                        x={door.x}
                        y={door.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={10}
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        {open ? '✓' : '📍'}
                      </text>

                      {/* Hotspot Title Card */}
                      <rect
                        x={door.x - 45}
                        y={door.y - 36}
                        width={90}
                        height={20}
                        rx={6}
                        fill="rgba(15, 23, 42, 0.9)"
                        stroke={near ? '#FFFFFF' : open ? '#10b981' : `${door.color}88`}
                        strokeWidth={near ? 1.5 : 1}
                      />
                      <text
                        x={door.x}
                        y={door.y - 23}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={9.5}
                        fontWeight="bold"
                        fontFamily="var(--font-ui)"
                      >
                        {door.label}
                      </text>
                    </g>
                  )
                })}

                {/* Dynamic Perspective Depth Scaling Calculation */}
                {(() => {
                  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 410) / (650 - 410)))
                  // Proper proportioned character size when inside classroom
                  const baseCharSize = insideRoom ? 170 + depthRatio * 60 : 145 + depthRatio * 65
                  const charSize = baseCharSize
                  const btnY = charPos.y - charSize * 0.95
                  const btnTextY = btnY + 14

                  return (
                    <>
                      {/* Player Character */}
                      <PlayerCharacter
                        x={charPos.x}
                        y={charPos.y}
                        dir={moveDir}
                        size={charSize}
                        label="Kamu"
                      />

                      {/* Floating Interactive Prompt Buttons */}
                      <AnimatePresence>
                        {/* 1. Inside Room Teacher Interaction Prompt */}
                        {insideRoom && (() => {
                          const teacherX = 580
                          const teacherY = 490
                          const distToTeacher = Math.hypot(charPos.x - teacherX, charPos.y - teacherY)
                          if (distToTeacher >= 150 || showWaliKelasPopup) return null

                          const buttonW = 170
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2

                          return (
                            <motion.g
                              key={`btn-talk-${insideRoom.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => setShowWaliKelasPopup(insideRoom)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft}
                                y={btnY}
                                width={buttonW}
                                height={26}
                                rx={13}
                                fill="rgba(15, 23, 42, 0.95)"
                                stroke={insideRoom.color}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#ffffff"
                                fontSize={10.5}
                                fontWeight="bold"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)' }}
                              >
                                🗣️ Bicara & Minta Data
                              </text>
                            </motion.g>
                          )
                        })()}

                        {/* 2. Hallway Door Interaction Prompt (Locked door -> Kuis; Unlocked door -> Masuk Kelas) */}
                        {!insideRoom && nearClass && !activeClass && !nearDoor && (() => {
                          const isUnlocked = unlocked.has(nearClass.id)
                          const buttonW = isUnlocked ? 150 : 150
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key={`btn-class-${nearClass.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (isUnlocked) {
                                  lastHallwayPosRef.current = { x: nearClass.x, y: nearClass.y + 20 }
                                  setInsideRoom(nearClass)
                                  setCharPos({ x: 1000, y: 620 })
                                } else {
                                  setActiveClass(nearClass)
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ cursor: 'pointer' }}
                            >
                              <rect
                                x={buttonLeft}
                                y={btnY}
                                width={buttonW}
                                height={26}
                                rx={13}
                                fill="rgba(15, 23, 42, 0.95)"
                                stroke={isUnlocked ? '#10B981' : '#f59e0b'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#ffffff"
                                fontSize={11}
                                fontWeight="bold"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)' }}
                              >
                                {isUnlocked ? `🚪 Masuk ${nearClass.label}` : `📍 Periksa ${nearClass.label}`}
                              </text>
                            </motion.g>
                          )
                        })()}
                      </AnimatePresence>
                    </>
                  )
                })()}
              </svg>
            )
          })()}

          {/* Vignette Overlay (Revisi 5) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.82)',
            borderRadius: 0,
            zIndex: 30,
          }} />

          {/* Floating Exit Button at Bottom Right inside Room */}
          <AnimatePresence>
            {insideRoom && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                whileHover={{ scale: 1.06, boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)' }}
                whileTap={{ scale: 0.94 }}
                onClick={handleExitClassroom}
                style={{
                  position: 'absolute',
                  bottom: 'clamp(14px, 3vh, 22px)',
                  right: 'clamp(14px, 3vw, 22px)',
                  zIndex: 55,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.98) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: 14,
                  padding: 'clamp(8px, 1vw, 10px) clamp(14px, 1.5vw, 18px)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 'clamp(11.5px, 1.1vw, 13px)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  pointerEvents: 'auto',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '16px' }}>🚪</span>
                <span>Keluar Ruang {insideRoom.label}</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Joystick */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 50, touchAction: 'none' }}>
            <Joystick onDir={(x, y) => { const nextDir = { x, y }; dirRef.current = nextDir; setMoveDir(nextDir); }} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeDoor && (
          <QuizModal
            door={activeDoor}
            isFD={isFD}
            onCorrect={handleCorrect}
            onClose={() => setActiveDoor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeClass && (
          <QuizModal
            door={activeClass}
            isFD={isFD}
            onCorrect={handleClassCorrect}
            onClose={() => setActiveClass(null)}
          />
        )}
      </AnimatePresence>

      {/* Wali Kelas Data Dialogue Modal */}
      <AnimatePresence>
        {showWaliKelasPopup && (
          <WaliKelasModal
            door={showWaliKelasPopup}
            onCollectData={handleCloseWaliKelas}
            onClose={() => setShowWaliKelasPopup(null)}
          />
        )}
      </AnimatePresence>

      {/* Dira Guide Overlay */}
      <AnimatePresence>
        {diraMessageText && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 30, 44, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 650,
            padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                maxWidth: 420,
                width: '100%',
                background: 'rgba(15, 35, 56, 0.95)',
                border: '2px solid rgba(14, 131, 136, 0.5)',
                borderRadius: 24,
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start'
              }}
            >
              <img src="/dira-avatar.png" alt="Dira" style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#00ADB5', letterSpacing: '1px' }}>🗣️ ASISTEN DIRA</div>
                <p style={{ margin: 0, fontSize: 14, color: '#F8FAFC', lineHeight: 1.6, fontWeight: 600 }}>{diraMessageText}</p>
                <button
                  className="game-btn game-btn-primary"
                  style={{ alignSelf: 'flex-end', fontSize: 12, padding: '8px 16px', fontWeight: 800, borderRadius: 8 }}
                  onClick={() => setDiraMessageText('')}
                >
                  Siap, Dira!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Room Milestone Overlay */}
      <AnimatePresence>
        {roomMilestoneText && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              style={{
                maxWidth: 360,
                width: '100%',
                background: 'rgba(4, 7, 10, 0.9)',
                border: '2px solid #00ADB5',
                boxShadow: '0 0 25px rgba(0, 173, 181, 0.5)',
                borderRadius: 20,
                padding: '24px 20px',
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '20px', fontWeight: 900, color: '#00ADB5', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: 8 }}
              >
                {roomMilestoneText}
              </motion.div>
              <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                Semua kelas di ruangan ini telah dibuka!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory Side Drawer Modal Overlay (Jurnal Bukti Detektif) */}
      <AnimatePresence>
        {isInventoryOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 600,
              background: 'rgba(4, 7, 10, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={() => setIsInventoryOpen(false)}
          >
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                width: '100%',
                maxWidth: 450,
                height: '100%',
                background: 'rgba(15, 35, 56, 0.98)',
                borderLeft: '2px solid #00ADB5',
                boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 173, 181, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 20px',
                gap: 16,
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#00ADB5', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    🔍 CATATAN EKSPLORASI DETEKTIF
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span>📓</span> Jurnal Bukti Screen Time
                  </h3>
                </div>
                <button
                  onClick={() => setIsInventoryOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#94A3B8',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 16
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Progress Counter Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 173, 181, 0.12) 0%, rgba(129, 140, 248, 0.08) 100%)',
                border: '1.5px solid rgba(0, 173, 181, 0.3)',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>Total Sampel Data Terkumpul</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-data)', marginTop: 2 }}>
                    {n} <span style={{ fontSize: 13, color: '#00ADB5', fontWeight: 700 }}>/ {TOTAL_N} Siswa</span>
                  </div>
                </div>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(0, 173, 181, 0.2)',
                  border: '2px solid #00ADB5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#FFFFFF'
                }}>
                  {Math.round((n / TOTAL_N) * 100)}%
                </div>
              </div>

              {/* Class Tabs Filter */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-hidden">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'A1', label: 'VII-A', color: '#818cf8' },
                  { id: 'A2', label: 'VII-B', color: '#6366f1' },
                  { id: 'B1', label: 'VIII-A', color: '#00ADB5' },
                  { id: 'B2', label: 'VIII-B', color: '#0e8388' },
                  { id: 'C1', label: 'IX', color: '#f472b6' },
                ].map(tab => {
                  const active = inventoryTab === tab.id
                  const isUnlocked = tab.id === 'ALL' || unlocked.has(tab.id)
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInventoryTab(tab.id as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 800,
                        border: active ? `1.5px solid ${tab.color || '#00ADB5'}` : '1px solid rgba(255,255,255,0.1)',
                        background: active ? (tab.color ? `${tab.color}33` : 'rgba(0, 173, 181, 0.25)') : 'rgba(255,255,255,0.04)',
                        color: active ? (tab.color || '#00ADB5') : (isUnlocked ? '#94A3B8' : '#475569'),
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tab.label} {tab.id !== 'ALL' && (unlocked.has(tab.id) ? '✓' : '🔒')}
                    </button>
                  )
                })}
              </div>

              {/* Student Cards Grid */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}>
                {inventoryTab !== 'ALL' && CLASS_STUDENTS[inventoryTab]?.image && (
                  <div style={{
                    width: '100%',
                    height: 110,
                    borderRadius: 14,
                    overflow: 'hidden',
                    position: 'relative',
                    border: `1.5px solid ${CLASS_DOORS.find(cd => cd.id === inventoryTab)?.color || '#00ADB5'}44`,
                    flexShrink: 0
                  }}>
                    <img
                      src={CLASS_STUDENTS[inventoryTab].image}
                      alt={inventoryTab}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 10%, rgba(11, 30, 44, 0.85) 100%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '8px 12px'
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>
                        📸 Foto Ruangan {CLASS_DOORS.find(cd => cd.id === inventoryTab)?.label || inventoryTab}
                      </span>
                    </div>
                  </div>
                )}
                {collectedStudents.filter(st => inventoryTab === 'ALL' || st.classId === inventoryTab).length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', background: 'rgba(11, 30, 44, 0.4)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>Belum ada data terkumpul di kategori ini</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Eksplorasi kelas dan selesaikan tantangan wali kelas untuk membuka data!</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {collectedStudents
                      .filter(st => inventoryTab === 'ALL' || st.classId === inventoryTab)
                      .map((st, idx) => {
                        const doorMeta = CLASS_DOORS.find(cd => cd.id === st.classId)
                        const themeColor = doorMeta?.color || '#00ADB5'
                        return (
                          <motion.div
                            key={`${st.classId}-${st.name}-${idx}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            style={{
                              background: 'rgba(11, 30, 44, 0.6)',
                              border: `1.5px solid ${themeColor}44`,
                              borderRadius: 14,
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`
                            }}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: `${themeColor}22`,
                              border: `1.5px solid ${themeColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 15,
                              flexShrink: 0
                            }}>
                              👤
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {st.name}
                              </div>
                              <div style={{ fontSize: 10, color: themeColor, fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>⏱️ {st.time} Jam/hari</span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Footer Summary Info */}
              {collectedStudents.length > 0 && (
                <div style={{
                  background: 'rgba(11, 30, 44, 0.8)',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px',
                  borderRadius: 14,
                  display: 'flex',
                  justifyContent: 'space-around',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>MIN SCREEN TIME</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-data)' }}>
                      {Math.min(...collectedStudents.map(s => s.time))} Jam
                    </div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <div>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>MAX SCREEN TIME</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#F43F5E', fontFamily: 'var(--font-data)' }}>
                      {Math.max(...collectedStudents.map(s => s.time))} Jam
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showCounter && <CounterResult onDone={onComplete} />}
    </div>
  )
}
