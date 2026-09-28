'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PlayerCharacter from '@/app/siswa/game/_components/PlayerCharacter'
import NPCCharacter from '@/app/siswa/game/_components/NPCCharacter'
import {
  LEVEL1_MAPS,
  WORLD_VW,
  WORLD_VH,
  RED_LINE_POINTS,
  PAK_SUTRISNO_POS,
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

// ─── Pak Sutrisno Sanction Modal ───────────────────────────────────────────────
function PakSanctionModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          maxWidth: 460,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.96)',
          border: '2px solid #38BDF8',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.35)',
          borderRadius: 24,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', border: '2px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url("/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png")`,
              backgroundSize: '450% 380%',
              backgroundPosition: '10% 5%',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1) scale(1.35)',
              imageRendering: 'pixelated'
            }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#38BDF8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>👨‍🏫 GURU KEDISIPLINAN SEKOLAH</div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>Pak Sutrisno</h3>
          </div>
        </div>

        <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1.5px solid rgba(56, 189, 248, 0.25)', borderRadius: 16, padding: '16px 14px' }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#E2E8F0', fontWeight: 600, lineHeight: 1.65 }}>
            "Kamu terlambat lagi! Bel sekolah sudah lama berbunyi dan kamu baru saja melangkah di lapangan ini.<br /><br />
            Sebagai sanksi kedisiplinan, kamu <strong style={{ color: '#F87171' }}>TIDAK BOLEH masuk kelas</strong> sebelum menyelesaikan tugas ini:<br />
            <strong style={{ color: '#38BDF8' }}>Kelilingi lorong sekolah dan kumpulkan 35 sampel data screen time dari 5 kelas (VII-A, VII-B, VIII-A, VIII-B, IX)!</strong>"
          </p>
        </div>

        <button
          className="game-btn game-btn-primary"
          style={{ padding: '12px 18px', fontSize: 14, fontWeight: 900, width: '100%', borderRadius: 14, background: 'linear-gradient(135deg, #00ADB5 0%, #38BDF8 100%)', boxShadow: '0 0 15px rgba(0, 173, 181, 0.4)', cursor: 'pointer' }}
          onClick={onAccept}
        >
          SAYA SIAP TERIMA SANKSI & INVESTIGASI DATA →
        </button>
      </motion.div>
    </div>
  )
}

// ─── Pak Sutrisno Report Modal ───────────────────────────────────────────────
function PakReportModal({ onProceed }: { onProceed: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(4, 7, 10, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'rgba(15, 35, 56, 0.96)',
          border: '2px solid #10B981',
          boxShadow: '0 0 35px rgba(16, 185, 129, 0.35)',
          borderRadius: 24,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url("/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png")`,
              backgroundSize: '450% 380%',
              backgroundPosition: '10% 5%',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1) scale(1.35)',
              imageRendering: 'pixelated'
            }} />
          </motion.div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#10B981', letterSpacing: '1.5px', textTransform: 'uppercase' }}>👨‍🏫 LAPOR SANKSI TERPENUHI</div>
            <h3 style={{ margin: 0, fontSize: 17, color: '#FFFFFF', fontWeight: 900 }}>Pak Sutrisno</h3>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: -7,
            left: 24,
            width: 12,
            height: 12,
            background: 'rgba(15, 35, 56, 0.96)',
            borderTop: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderLeft: '1.5px solid rgba(16, 185, 129, 0.35)',
            transform: 'rotate(45deg)',
            zIndex: 2,
          }} />
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1.5px solid rgba(16, 185, 129, 0.25)', borderRadius: 16, padding: '16px 14px', position: 'relative', zIndex: 1 }}>
            <p style={{ margin: 0, fontSize: 13.5, color: '#E2E8F0', fontWeight: 600, lineHeight: 1.65 }}>
              "Bagus sekali! Kamu sudah berhasil mengumpulkan <strong style={{ color: '#10B981' }}>35 sampel data screen time</strong> dari 5 ruang kelas.<br /><br />
              Namun sanksimu belum selesai! Data mentah ini harus dianalisis secara statistik.<br />
              <strong style={{ color: '#38BDF8' }}>Mari mulai dengan menghitung Rentang Data (R) untuk mengukur sebaran penggunaan gadget siswa!</strong>"
            </p>
          </div>
        </div>

        <button
          className="game-btn game-btn-primary"
          style={{ padding: '12px 18px', fontSize: 14, fontWeight: 900, width: '100%', borderRadius: 14, background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)', cursor: 'pointer' }}
          onClick={onProceed}
        >
          MULAI ANALISIS DATA & HITUNG RENTANG (R) →
        </button>
      </motion.div>
    </div>
  )
}

export default function NPath({ onComplete, isFD = true, demoMode = false }: { onComplete: () => void; isFD?: boolean; demoMode?: boolean }) {
  const [charPos, setCharPos] = useState({ x: 180, y: 585 })
  const [cinematicStage, setCinematicStage] = useState<'player_intro' | 'panning_to_pak' | 'pak_shouting' | 'pak_shouting_2' | 'panning_to_player' | 'quest_meet_pak' | 'pak_sanction_1' | 'pak_sanction_2' | 'pak_sanction_3' | 'player_reply_pak' | 'sanction_received'>(() => {
    return demoMode ? 'sanction_received' : 'player_intro'
  })
  const cinematicStageRef = useRef(cinematicStage)
  cinematicStageRef.current = cinematicStage

  const [showPakSanctionModal, setShowPakSanctionModal] = useState(false)
  const [showPakReportModal, setShowPakReportModal] = useState(false)
  const smoothCamPos = useRef({ x: 180, y: 585 })
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    return demoMode ? new Set(['A', 'B', 'C', 'A1', 'A2', 'A3', 'B1']) : new Set(['A', 'B', 'C'])
  })
  const [savedClasses, setSavedClasses] = useState<Set<string>>(() => new Set())
  const [justCompletedClassId, setJustCompletedClassId] = useState<string | null>(null)
  const [activeDoor, setActiveDoor] = useState<typeof DOORS[number] | null>(null)
  const [nearDoor, setNearDoor] = useState<typeof DOORS[number] | null>(null)
  const [activeClass, setActiveClass] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [nearClass, setNearClass] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [insideRoom, setInsideRoom] = useState<typeof CLASS_DOORS[number] | null>(null)
  const insideRoomR = useRef(insideRoom); insideRoomR.current = insideRoom
  const lastHallwayPosRef = useRef<{ x: number; y: number }>({ x: 650, y: 550 })
  const [visitedRooms, setVisitedRooms] = useState<Set<DoorId>>(new Set())
  const [showWaliKelasPopup, setShowWaliKelasPopup] = useState<typeof CLASS_DOORS[number] | null>(null)
  const [teacherCutsceneStage, setTeacherCutsceneStage] = useState<'anim_wait' | 'teacher_ask' | 'player_explain' | 'teacher_reply' | null>(null)
  const teacherCutsceneStageRef = useRef(teacherCutsceneStage)
  teacherCutsceneStageRef.current = teacherCutsceneStage
  const teacherTimerRef = useRef<NodeJS.Timeout | null>(null)
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
  const [showStudentDetails, setShowStudentDetails] = useState(false)
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
  const savedClassesR = useRef(savedClasses); savedClassesR.current = savedClasses
  const activeDoorR = useRef(activeDoor); activeDoorR.current = activeDoor
  const nearDoorR = useRef(nearDoor); nearDoorR.current = nearDoor
  const activeClassR = useRef(activeClass); activeClassR.current = activeClass
  const nearClassR = useRef(nearClass); nearClassR.current = nearClass
  const showWaliKelasPopupR = useRef(showWaliKelasPopup); showWaliKelasPopupR.current = showWaliKelasPopup

  // Sync charPosRef with charPos
  useEffect(() => {
    charPosRef.current = charPos
  }, [charPos])

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
    if (collected.size >= TOTAL_N && !showCounter && !showPakReportModal) {
      // Waypoint arrow points to Pak Sutrisno to report back
    }
  }, [collected.size, showCounter, showPakReportModal])

  // Auto-clamp player Y position if ever above RED_LINE_POINTS
  useEffect(() => {
    if (insideRoom) return
    const redLineY = getRedLineY(charPos.x)
    if (charPos.y < redLineY - 1) {
      setCharPos(prev => (prev.y < redLineY - 1 ? { ...prev, y: redLineY } : prev))
    }
  }, [charPos.x, charPos.y, insideRoom])

  const lastTimeRef = useRef<number>(0)

  // Main game tick: movement animation loop with delta-time smoothing & camera lerp
  useEffect(() => {
    lastTimeRef.current = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      const isInside = !!insideRoomR.current
      let targetFocusX = isInside ? 600 : charPosRef.current.x
      let targetFocusY = isInside ? 580 : charPosRef.current.y

      if (!isInside && (cinematicStageRef.current === 'panning_to_pak' || cinematicStageRef.current === 'pak_shouting' || cinematicStageRef.current === 'pak_shouting_2')) {
        targetFocusX = PAK_SUTRISNO_POS.x
        targetFocusY = PAK_SUTRISNO_POS.y
      }

      // Smooth camera lerp
      smoothCamPos.current.x += (targetFocusX - smoothCamPos.current.x) * 0.075
      smoothCamPos.current.y += (targetFocusY - smoothCamPos.current.y) * 0.075

      // Automatic transitions for camera pan
      if (cinematicStageRef.current === 'panning_to_pak') {
        const distToPak = Math.hypot(smoothCamPos.current.x - PAK_SUTRISNO_POS.x, smoothCamPos.current.y - PAK_SUTRISNO_POS.y)
        if (distToPak < 35) {
          setCinematicStage('pak_shouting')
        }
      } else if (cinematicStageRef.current === 'panning_to_player') {
        const distToPlayer = Math.hypot(smoothCamPos.current.x - charPosRef.current.x, smoothCamPos.current.y - charPosRef.current.y)
        if (distToPlayer < 35) {
          setCinematicStage('quest_meet_pak')
        }
      } else if (cinematicStageRef.current === 'quest_meet_pak') {
        const distToPak = Math.hypot(charPosRef.current.x - PAK_SUTRISNO_POS.x, charPosRef.current.y - PAK_SUTRISNO_POS.y)
        if (distToPak < 110) {
          setCinematicStage('pak_sanction_1')
        }
      }

      const isCinematicActive = cinematicStageRef.current === 'player_intro' ||
                                cinematicStageRef.current === 'panning_to_pak' || 
                                cinematicStageRef.current === 'pak_shouting' || 
                                cinematicStageRef.current === 'pak_shouting_2' || 
                                cinematicStageRef.current === 'panning_to_player' ||
                                cinematicStageRef.current === 'pak_sanction_1' ||
                                cinematicStageRef.current === 'pak_sanction_2' ||
                                cinematicStageRef.current === 'pak_sanction_3' ||
                                cinematicStageRef.current === 'player_reply_pak'

      if (!activeDoor && !activeClass && !showWaliKelasPopup && !isCinematicActive) {
        const { x: dx, y: dy } = dirRef.current
        if (dx || dy) {
          const currentMapKey = insideRoomR.current?.id || 'hallway'
          const activeMap = LEVEL1_MAPS[currentMapKey] || LEVEL1_MAPS['hallway']
          const moveSpeed = activeMap.character.speed * 40
          const dist = moveSpeed * dt

          setCharPos(p => {
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
  }, [activeDoor, activeClass, showWaliKelasPopup])

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

      if (activeDoorVal || activeClassVal || showWaliKelasPopupR.current) {
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
        if (savedClassesR.current.has(nearClassVal.id)) {
          return
        }
        if (unlockedR.current.has(nearClassVal.id)) {
          enterClassroom(nearClassVal)
        } else {
          setActiveClass(nearClassVal)
        }
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && insideRoomR.current) {
        const currentMap = LEVEL1_MAPS[insideRoomR.current.id]
        const teacherX = currentMap?.teacher?.x ?? 617
        const teacherY = currentMap?.teacher?.y ?? 415
        const distToTeacher = Math.hypot(charPosRef.current.x - teacherX, charPosRef.current.y - teacherY)
        if (distToTeacher < 350 || teacherCutsceneStageRef.current) {
          e.preventDefault()
          handleInteractTeacher(insideRoomR.current)
        }
      } else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') && !insideRoomR.current) {
        const pakX = PAK_SUTRISNO_POS.x
        const pakY = PAK_SUTRISNO_POS.y
        const distToPak = Math.hypot(charPosRef.current.x - pakX, charPosRef.current.y - pakY)
        if (distToPak < 135) {
          e.preventDefault()
          if (collected.size >= TOTAL_N) {
            setShowPakReportModal(true)
          } else if (cinematicStageRef.current === 'player_intro') {
            setCinematicStage('panning_to_pak')
          } else if (cinematicStageRef.current === 'quest_meet_pak') {
            setCinematicStage('pak_sanction_1')
          } else if (cinematicStageRef.current === 'pak_sanction_1') {
            setCinematicStage('pak_sanction_2')
          } else if (cinematicStageRef.current === 'pak_sanction_2') {
            setCinematicStage('pak_sanction_3')
          } else if (cinematicStageRef.current === 'pak_sanction_3') {
            setCinematicStage('player_reply_pak')
          } else if (cinematicStageRef.current === 'player_reply_pak') {
            setCinematicStage('sanction_received')
          }
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
  }, [])

  const handleCorrect = useCallback(() => {
    if (!activeDoor) return
    setUnlocked(p => new Set([...p, activeDoor.id]))
    setActiveDoor(null)
  }, [activeDoor])

  const handleExitClassroom = useCallback(() => {
    if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
    setTeacherCutsceneStage(null)
    setInsideRoom(null)
    setCharPos(lastHallwayPosRef.current || { x: 650, y: 550 })
  }, [])

  const enterClassroom = useCallback((room: typeof CLASS_DOORS[number]) => {
    if (savedClassesR.current.has(room.id)) return
    lastHallwayPosRef.current = { x: room.x, y: room.y + 20 }
    setInsideRoom(room)
    setCharPos(LEVEL1_MAPS[room.id]?.spawn || { x: 1050, y: 510 })

    const mapConfig = LEVEL1_MAPS[room.id]
    if (mapConfig?.teacher?.spriteUrl) {
      if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
      setTeacherCutsceneStage('anim_wait')
      const animDuration = (mapConfig.teacher.totalFrames || 24) * (mapConfig.teacher.speedMs || 90)
      teacherTimerRef.current = setTimeout(() => {
        setTeacherCutsceneStage('teacher_ask')
      }, animDuration)
    } else {
      if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
      setTeacherCutsceneStage(null)
    }
  }, [])

  const handleClassCorrect = useCallback(() => {
    if (!activeClass) return
    const roomToEnter = activeClass
    setUnlocked(p => new Set([...p, roomToEnter.id]))
    setActiveClass(null)
    enterClassroom(roomToEnter)
  }, [activeClass, enterClassroom])

  const handleInteractTeacher = useCallback((room: typeof CLASS_DOORS[number]) => {
    const mapConfig = LEVEL1_MAPS[room.id]
    const hasTeacherSprite = !!mapConfig?.teacher?.spriteUrl

    if (!hasTeacherSprite) {
      setShowWaliKelasPopup(room)
      return
    }

    const currentStage = teacherCutsceneStageRef.current
    if (!currentStage) {
      if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
      setTeacherCutsceneStage('anim_wait')
      const animDuration = (mapConfig.teacher?.totalFrames || 24) * (mapConfig.teacher?.speedMs || 90)
      teacherTimerRef.current = setTimeout(() => {
        setTeacherCutsceneStage('teacher_ask')
      }, animDuration)
    } else if (currentStage === 'anim_wait') {
      if (teacherTimerRef.current) clearTimeout(teacherTimerRef.current)
      setTeacherCutsceneStage('teacher_ask')
    } else if (currentStage === 'teacher_ask') {
      setTeacherCutsceneStage('player_explain')
    } else if (currentStage === 'player_explain') {
      setTeacherCutsceneStage('teacher_reply')
    } else if (currentStage === 'teacher_reply') {
      setTeacherCutsceneStage(null)
      setShowWaliKelasPopup(room)
    }
  }, [])

  const handleCloseWaliKelas = useCallback(() => {
    if (!showWaliKelasPopup) return
    const cid = showWaliKelasPopup.id
    const roomId = showWaliKelasPopup.roomId

    setSavedClasses(prev => new Set([...prev, cid]))

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
    handleExitClassroom()
  }, [showWaliKelasPopup, handleExitClassroom])

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
            border: n >= TOTAL_N ? '1.5px solid #10B981' : '1.5px solid rgba(0, 173, 181, 0.35)',
            borderRadius: 12,
            padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1vw, 10px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'auto'
          }}>
            <div style={{ fontSize: 'clamp(13px, 1.5vw, 15px)' }}>📜</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 8px)' }}>
              <span style={{ fontSize: 'clamp(10.5px, 1.1vw, 12.5px)', fontWeight: 900, color: '#F8FAFC', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                {n >= TOTAL_N ? 'Misi: Laporkan Pak Sutrisno!' : (cinematicStage === 'sanction_received' || demoMode) ? 'Misi: Kumpulkan Data' : 'Misi: Jumpai Pak Sutrisno'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ fontSize: 'clamp(9.5px, 1vw, 11.5px)', fontWeight: 800, color: n >= TOTAL_N ? '#10B981' : '#00ADB5', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                DATA: <span style={{ color: '#FFFFFF' }}>{n} / {TOTAL_N}</span>
              </span>
            </div>
          </div>

          {/* Right: Step Indicator & Debug Area Toggle Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowDebug(prev => !prev)}
              style={{
                background: showDebug ? 'rgba(16, 185, 129, 0.25)' : 'rgba(11, 30, 44, 0.85)',
                backdropFilter: 'blur(12px)',
                border: showDebug ? '1.5px solid #10b981' : '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 12,
                padding: 'clamp(4px, 0.7vw, 6px) clamp(8px, 1vw, 12px)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: showDebug ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.45)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                color: showDebug ? '#10b981' : '#F8FAFC',
                fontWeight: 800,
                fontSize: 'clamp(9.5px, 1vw, 11.5px)',
                transition: 'all 0.2s'
              }}
              title="Klik untuk tampilkan/sembunyikan area berjalan hijau"
            >
              <span>🟩</span>
              <span>{showDebug ? 'Area Hijau: ON' : 'Area Hijau: OFF'}</span>
            </button>

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
        </div>

        {/* Floating Vertical RPG Quest Button (Right Side) */}
        <motion.button
          whileHover={{ scale: 1.08, boxShadow: n >= TOTAL_N ? '0 0 25px rgba(16, 185, 129, 0.65)' : '0 0 25px rgba(0, 173, 181, 0.55)' }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsInventoryOpen(true)}
          style={{
            position: 'absolute',
            right: 'clamp(8px, 1.2vw, 14px)',
            top: '42%',
            transform: 'translateY(-50%)',
            zIndex: 45,
            background: n >= TOTAL_N 
              ? 'linear-gradient(180deg, rgba(6, 78, 59, 0.95) 0%, rgba(11, 30, 44, 0.95) 100%)' 
              : 'linear-gradient(180deg, rgba(15, 35, 56, 0.92) 0%, rgba(11, 30, 44, 0.95) 100%)',
            backdropFilter: 'blur(12px)',
            border: n >= TOTAL_N ? '2px solid #10B981' : '1.5px solid #00ADB5',
            borderRadius: 16,
            padding: 'clamp(6px, 1vw, 10px) clamp(4px, 0.8vw, 8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: 'clamp(48px, 5.2vw, 60px)',
            cursor: 'pointer',
            boxShadow: n >= TOTAL_N ? '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)' : '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 173, 181, 0.3)',
            pointerEvents: 'auto',
            transition: 'all 0.2s',
          }}
        >
          {/* Icon Container with Floating Badge */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>📜</span>
            {/* Counter Mini Badge */}
            <span style={{
              position: 'absolute',
              top: -6,
              right: -12,
              background: n >= TOTAL_N ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' : 'linear-gradient(135deg, #00ADB5 0%, #38BDF8 100%)',
              color: '#04070a',
              borderRadius: 10,
              padding: '1px 5px',
              fontSize: 'clamp(8px, 0.8vw, 9px)',
              fontWeight: 900,
              fontFamily: 'var(--font-data)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}>
              {n >= TOTAL_N ? '⚡ 35/35' : (cinematicStage === 'sanction_received' || demoMode) ? `${n}/${TOTAL_N}` : 'Temui Pak'}
            </span>
          </div>
          {/* Vertical Label */}
          <span style={{
            fontSize: 'clamp(8px, 0.85vw, 9.5px)',
            fontWeight: 900,
            color: n >= TOTAL_N ? '#34D399' : '#F8FAFC',
            marginTop: 2
          }}>
            Misi
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
              camX = Math.max(0, Math.min(WORLD_VW - viewVW, smoothCamPos.current.x - viewVW / 2))
              camY = Math.max(0, Math.min(WORLD_VH - viewVH, smoothCamPos.current.y - viewVH * 0.65))
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

                {/* Main Classroom / Map Background Image */}
                <image
                  href={encodeURI(
                    insideRoom 
                      ? (LEVEL1_MAPS[insideRoom.id]?.bgImage || (insideRoom as any).image || CLASS_STUDENTS[insideRoom.id]?.image || '/Assets/Building/Kelas.jpg')
                      : (LEVEL1_MAPS['hallway']?.bgImage || '/Assets/Building/Kelas.jpg')
                  )}
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
                    {insideRoom ? (
                      /* ── Inside Classroom Walkable Area Highlight (Green) ── */
                      <g>
                        <rect
                          x={50}
                          y={380}
                          width={WORLD_VW - 100}
                          height={WORLD_VH - 420}
                          fill="rgba(16, 185, 129, 0.35)"
                          stroke="#10b981"
                          strokeWidth={3}
                          strokeDasharray="6,6"
                        />
                        <rect
                          x={WORLD_VW / 2 - 180}
                          y={390}
                          width={360}
                          height={28}
                          rx={8}
                          fill="rgba(15, 23, 42, 0.9)"
                          stroke="#10b981"
                          strokeWidth={1.5}
                        />
                        <text
                          x={WORLD_VW / 2}
                          y={409}
                          textAnchor="middle"
                          fill="#34d399"
                          fontSize={12}
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          🟢 AREA BERJALAN KELAS ({insideRoom.label || insideRoom.id})
                        </text>
                      </g>
                    ) : (
                      /* ── Outdoor / Hallway Walkable Area Highlight (Green) ── */
                      <g>
                        {/* 1. Walkable Area Polygon */}
                        <polygon
                          points={[
                            ...RED_LINE_POINTS.map(p => `${p.x},${p.y}`),
                            `${RED_LINE_POINTS[RED_LINE_POINTS.length - 1].x},640`,
                            `${RED_LINE_POINTS[0].x},640`
                          ].join(' ')}
                          fill="rgba(16, 185, 129, 0.32)"
                          stroke="#10b981"
                          strokeWidth={2.5}
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
                        <text x={200} y={560} textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight="bold">⛔ TEMBOK BANGKU & POT</text>

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

                    {/* Player Feet Ground Collision Base Line */}
                    <ellipse cx={charPos.x} cy={charPos.y} rx={22} ry={6} fill="rgba(244, 63, 94, 0.4)" stroke="#f43f5e" strokeWidth={2} />
                    <line x1={charPos.x - 24} y1={charPos.y} x2={charPos.x + 24} y2={charPos.y} stroke="#f43f5e" strokeWidth={2.5} />
                    <text x={charPos.x} y={charPos.y + 18} textAnchor="middle" fill="#f43f5e" fontSize={9} fontWeight="bold">
                      ({Math.round(charPos.x)}, {Math.round(charPos.y)})
                    </text>
                  </g>
                )}

                {/* Map Hotspots: Render Teacher NPC inside room OR Class Doors in hallway */}
                {insideRoom ? (() => {
                  const info = CLASS_STUDENTS[insideRoom.id]
                  const teacherName = info?.teacher || 'Wali Kelas'
                  const currentMap = LEVEL1_MAPS[insideRoom.id]
                  const teacherConfig = currentMap?.teacher
                  const teacherX = teacherConfig?.x ?? 617
                  const teacherY = teacherConfig?.y ?? 415
                  const hotspotW = teacherConfig?.hotspotW || 140
                  const hotspotH = teacherConfig?.hotspotH || 220
                  const isCompleted = unlocked.has(insideRoom.id)
                  const bubbleY = teacherY - (teacherConfig?.spriteUrl ? 220 : 50)

                  return (
                    <g
                      key={`teacher-${insideRoom.id}`}
                      style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        handleInteractTeacher(insideRoom)
                      }}
                    >
                      {teacherConfig?.spriteUrl ? (
                        <NPCCharacter
                          key={`teacher-sprite-${insideRoom.id}`}
                          x={teacherX}
                          y={teacherY}
                          size={teacherConfig.size || 250}
                          label=""
                          spriteUrl={teacherConfig.spriteUrl}
                          cols={teacherConfig.cols || 5}
                          rows={teacherConfig.rows || 5}
                          totalFrames={teacherConfig.totalFrames || 24}
                          pingPong={teacherConfig.pingPong ?? false}
                          speedMs={teacherConfig.speedMs || 90}
                          glowColor={isCompleted ? "#10B981" : "#F59E0B"}
                          showGlow={teacherConfig.showGlow ?? true}
                          loop={false}
                          onClick={() => handleInteractTeacher(insideRoom)}
                        />
                      ) : (
                        <rect
                          x={teacherX - hotspotW / 2}
                          y={teacherY - hotspotH / 2}
                          width={hotspotW}
                          height={hotspotH}
                          fill="transparent"
                          stroke={showDebug ? '#ff0' : 'none'}
                          strokeWidth={showDebug ? 2 : 0}
                        />
                      )}

                      {/* 1. Default Hover/Interaction Prompt (when no cutscene is active) */}
                      {!teacherCutsceneStage && (
                        <g>
                          <motion.g
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: [0, -4, 0] }}
                            transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
                          >
                            <rect
                              x={teacherX - 90}
                              y={bubbleY - 48}
                              width={180}
                              height={38}
                              rx={6}
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke={isCompleted ? '#10B981' : insideRoom.color}
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}
                            />
                            <polygon
                              points={`${teacherX - 7},${bubbleY - 10} ${teacherX + 7},${bubbleY - 10} ${teacherX},${bubbleY}`}
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke={isCompleted ? '#10B981' : insideRoom.color}
                              strokeWidth={2}
                              strokeLinejoin="round"
                            />
                            <rect
                              x={teacherX - 8}
                              y={bubbleY - 12}
                              width={16}
                              height={4}
                              fill="rgba(15, 23, 42, 0.92)"
                            />
                            <text
                              x={teacherX}
                              y={bubbleY - 34}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize={11}
                              fontWeight="800"
                              fontFamily="var(--font-ui)"
                              style={{ letterSpacing: '0.3px' }}
                            >
                              👩‍🏫 {teacherName}
                            </text>
                            <text
                              x={teacherX}
                              y={bubbleY - 19}
                              textAnchor="middle"
                              fill={isCompleted ? '#6EE7B7' : '#FCD34D'}
                              fontSize={9}
                              fontWeight="700"
                              fontFamily="var(--font-ui)"
                            >
                              {isCompleted ? '✓ Data Screen Time Saved' : '💬 Klik / Tekan E untuk Bicara'}
                            </text>
                          </motion.g>
                        </g>
                      )}

                      {/* 2. Teacher Animation Waiting Stage ('anim_wait') */}
                      {teacherCutsceneStage === 'anim_wait' && (
                        <g>
                          <motion.g
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: [1, 1.04, 1], y: 0 }}
                            transition={{ scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' } }}
                          >
                            <rect
                              x={teacherX - 110}
                              y={bubbleY - 48}
                              width={220}
                              height={40}
                              rx={10}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.7))' }}
                            />
                            <polygon
                              points={`${teacherX - 8},${bubbleY - 8} ${teacherX + 8},${bubbleY - 8} ${teacherX},${bubbleY + 2}`}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#F59E0B"
                              strokeWidth={1}
                            />
                            <text x={teacherX} y={bubbleY - 24} textAnchor="middle" fill="#FCD34D" fontSize={11} fontWeight="900" fontFamily="var(--font-ui)">
                              👩‍🏫 Bu Sari sedang menyapa...
                            </text>
                          </motion.g>
                        </g>
                      )}

                      {/* 3. Teacher Question Speech Bubble ('teacher_ask') */}
                      {teacherCutsceneStage === 'teacher_ask' && (
                        <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                          <rect
                            x={teacherX - 150}
                            y={bubbleY - 78}
                            width={300}
                            height={68}
                            rx={14}
                            fill="rgba(15, 35, 56, 0.96)"
                            stroke="#38BDF8"
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.75))' }}
                          />
                          <polygon
                            points={`${teacherX - 8},${bubbleY - 10} ${teacherX + 8},${bubbleY - 10} ${teacherX},${bubbleY + 2}`}
                            fill="rgba(15, 35, 56, 0.96)"
                            stroke="#38BDF8"
                            strokeWidth={1}
                          />
                          <text x={teacherX - 138} y={bubbleY - 60} textAnchor="start" fill="#38BDF8" fontSize={10.5} fontWeight="900" fontFamily="var(--font-ui)">
                            {teacherName}
                          </text>
                          <text x={teacherX} y={bubbleY - 38} textAnchor="middle" fill="#FFFFFF" fontSize={11} fontWeight="800" fontFamily="var(--font-ui)">
                            "Halo! Ada perlu apa kamu datang ke Ruang {insideRoom.label.replace('Kelas ', '')}?"
                          </text>
                          <text x={teacherX + 138} y={bubbleY - 20} textAnchor="end" fill="#38BDF8" fontSize={9.5} fontWeight="900" fontFamily="var(--font-ui)">
                            [ Klik / Tap ▶ ]
                          </text>
                        </g>
                      )}

                      {/* 4. Player Explanation Speech Bubble ('player_explain') */}
                      {teacherCutsceneStage === 'player_explain' && (() => {
                        const pW = 340
                        const pLeft = Math.max(20, Math.min(WORLD_VW - pW - 170, charPos.x - pW * 0.75))
                        const pTextX = pLeft + pW / 2
                        const headTopY = charPos.y - 250 * 0.85
                        const pY = headTopY - 100
                        const pointerX = Math.max(pLeft + 30, Math.min(pLeft + pW - 30, charPos.x))

                        return (
                          <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                            <rect
                              x={pLeft}
                              y={pY}
                              width={pW}
                              height={68}
                              rx={14}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#38BDF8"
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.75))' }}
                            />
                            <polygon
                              points={`${pointerX - 10},${pY + 68} ${pointerX + 10},${pY + 68} ${Math.min(charPos.x, pointerX + 15)},${headTopY + 25}`}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#38BDF8"
                              strokeWidth={1}
                            />
                            <text x={pLeft + 14} y={pY + 18} textAnchor="start" fill="#38BDF8" fontSize={10.5} fontWeight="900" fontFamily="var(--font-ui)">
                              Kamu
                            </text>
                            <text x={pTextX} y={pY + 38} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                              "Saya sedang menjalankan sanksi Pak Sutrisno untuk"
                            </text>
                            <text x={pTextX} y={pY + 52} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                              mengumpulkan sampel data screen time 7 siswa di kelas ini, Bu!"
                            </text>
                            <text x={pLeft + pW - 14} y={pY + 58} textAnchor="end" fill="#38BDF8" fontSize={9.5} fontWeight="900" fontFamily="var(--font-ui)">
                              [ Klik / Tap ▶ ]
                            </text>
                          </g>
                        )
                      })()}

                      {/* 5. Teacher Reply Speech Bubble ('teacher_reply') */}
                      {teacherCutsceneStage === 'teacher_reply' && (
                        <g style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleInteractTeacher(insideRoom); }}>
                          <rect
                            x={teacherX - 160}
                            y={bubbleY - 78}
                            width={320}
                            height={68}
                            rx={14}
                            fill="rgba(15, 35, 56, 0.96)"
                            stroke="#10B981"
                            strokeWidth={2}
                            style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.75))' }}
                          />
                          <polygon
                            points={`${teacherX - 8},${bubbleY - 10} ${teacherX + 8},${bubbleY - 10} ${teacherX},${bubbleY + 2}`}
                            fill="rgba(15, 35, 56, 0.96)"
                            stroke="#10B981"
                            strokeWidth={1}
                          />
                          <text x={teacherX - 148} y={bubbleY - 60} textAnchor="start" fill="#10B981" fontSize={10.5} fontWeight="900" fontFamily="var(--font-ui)">
                            {teacherName}
                          </text>
                          <text x={teacherX} y={bubbleY - 40} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                            "Oh begitu! Baiklah, ini sampel data"
                          </text>
                          <text x={teacherX} y={bubbleY - 26} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                            screen time 7 siswa dari Ruang {insideRoom.label.replace('Kelas ', '')}."
                          </text>
                          <text x={teacherX + 148} y={bubbleY - 20} textAnchor="end" fill="#10B981" fontSize={9.5} fontWeight="900" fontFamily="var(--font-ui)">
                            [ Ambil Data ▶ ]
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })() : ((cinematicStage === 'sanction_received' || demoMode) ? CLASS_DOORS.map(door => {
                  const isSaved = savedClasses.has(door.id)
                  const open = unlocked.has(door.id)
                  const near = nearClass?.id === door.id
                  const isJustCompleted = justCompletedClassId === door.id

                  return (
                    <g
                      key={door.id}
                      style={{ cursor: isSaved ? 'default' : 'pointer' }}
                      onClick={e => {
                        e.stopPropagation()
                        if (isSaved) return
                        if (open) {
                          enterClassroom(door)
                        } else if (!activeClass && !activeDoor) {
                          setActiveClass(door)
                        }
                      }}
                    >
                      {/* Interactive Pulse Radar Glow */}
                      {!isSaved && (!open || isJustCompleted) ? (
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
                        fill={isSaved ? '#10b981' : open ? '#00ADB5' : 'rgba(15, 23, 42, 0.88)'}
                        stroke={near ? '#FFFFFF' : isSaved ? '#10b981' : door.color}
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
                        {isSaved ? '✓' : open ? '🔓' : '📍'}
                      </text>

                      {/* Hotspot Title Card */}
                      <rect
                        x={door.x - 45}
                        y={door.y - 36}
                        width={90}
                        height={20}
                        rx={6}
                        fill="rgba(15, 23, 42, 0.9)"
                        stroke={near ? '#FFFFFF' : isSaved ? '#10b981' : open ? '#00ADB5' : `${door.color}88`}
                        strokeWidth={near ? 1.5 : 1}
                      />
                      <text
                        x={door.x}
                        y={door.y - 23}
                        textAnchor="middle"
                        fill={isSaved ? '#10b981' : '#FFFFFF'}
                        fontSize={9.5}
                        fontWeight="bold"
                        fontFamily="var(--font-ui)"
                      >
                        {isSaved ? `${door.label} (Selesai)` : door.label}
                      </text>
                    </g>
                  )
                }) : null)}

                {/* Dynamic Perspective Depth Scaling Calculation */}
                {(() => {
                  const depthRatio = Math.max(0, Math.min(1, (charPos.y - 410) / (650 - 410)))
                  // Proper proportioned character size when inside classroom (2x size inside room)
                  const baseCharSize = insideRoom ? (170 + depthRatio * 60) * 2 : 145 + depthRatio * 65
                  const charSize = baseCharSize
                  const btnY = charPos.y - charSize * 0.95
                  const btnTextY = btnY + 14

                  return (
                    <>
                      {/* Pak Sutrisno NPC (Only in Hallway / Lapangan) */}
                      {!insideRoom && (() => {
                        const pakX = PAK_SUTRISNO_POS.x
                        const pakY = PAK_SUTRISNO_POS.y
                        const pakDepth = Math.max(0, Math.min(1, (pakY - 410) / (650 - 410)))
                        const pakSize = 145 + pakDepth * 65
                        const distToPak = Math.hypot(charPos.x - pakX, charPos.y - pakY)
                        const isNearPak = distToPak < 135

                        const isAllCollected = collected.size >= TOTAL_N

                        const handleTalkToPak = (e?: React.MouseEvent) => {
                          if (e) e.stopPropagation()
                          if (cinematicStage === 'player_intro') {
                            setCinematicStage('panning_to_pak')
                          } else if (cinematicStage === 'pak_shouting') {
                            setCinematicStage('pak_shouting_2')
                          } else if (cinematicStage === 'pak_shouting_2') {
                            setCinematicStage('panning_to_player')
                          } else if (cinematicStage === 'quest_meet_pak' || cinematicStage === 'pak_sanction_1') {
                            setCinematicStage('pak_sanction_2')
                          } else if (cinematicStage === 'pak_sanction_2') {
                            setCinematicStage('pak_sanction_3')
                          } else if (cinematicStage === 'pak_sanction_3') {
                            setCinematicStage('player_reply_pak')
                          } else if (cinematicStage === 'player_reply_pak') {
                            setCinematicStage('sanction_received')
                          } else if (isAllCollected) {
                            setShowPakReportModal(true)
                          }
                        }

                        const renderPak = (
                          <NPCCharacter
                            key="pak-sutrisno-npc"
                            x={pakX}
                            y={pakY}
                            size={pakSize}
                            label=""
                            spriteUrl="/Assets/Character/pak Sutrisno-iso_idle_right-trimmed.png"
                            cols={5}
                            rows={4}
                            flipX={true}
                            glowColor={isAllCollected ? "#10B981" : "#38BDF8"}
                            onClick={handleTalkToPak}
                          />
                        )

                        const isSpeechActive = ['pak_shouting', 'pak_shouting_2', 'pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3', 'player_reply_pak'].includes(cinematicStage)
                        const isSanctionStage = ['pak_sanction_1', 'pak_sanction_2', 'pak_sanction_3'].includes(cinematicStage)

                        {/* Speech bubble for Pak Sutrisno */}
                        const renderShoutBubble = isSpeechActive && cinematicStage !== 'player_reply_pak' && (
                          <g
                            key="pak-shout-bubble"
                            style={{ cursor: 'pointer' }}
                            onClick={handleTalkToPak}
                          >
                            {/* Dialogue Card Container */}
                            <rect
                              x={pakX - (isSanctionStage ? 165 : 130)}
                              y={pakY - (isSanctionStage ? 198 : 180)}
                              width={isSanctionStage ? 330 : 260}
                              height={isSanctionStage ? 76 : 58}
                              rx={14}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#38BDF8"
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.7))' }}
                            />
                            {/* Pointer Triangle */}
                            <polygon
                              points={`${pakX - 8},${pakY - 122} ${pakX + 8},${pakY - 122} ${pakX},${pakY - 110}`}
                              fill="rgba(15, 35, 56, 0.96)"
                              stroke="#38BDF8"
                              strokeWidth={1}
                            />

                            {/* Speaker Name in Top-Left Corner */}
                            <text
                              x={pakX - (isSanctionStage ? 152 : 118)}
                              y={pakY - (isSanctionStage ? 182 : 164)}
                              textAnchor="start"
                              fill="#38BDF8"
                              fontSize={10.5}
                              fontWeight="900"
                              fontFamily="var(--font-ui)"
                              style={{ letterSpacing: '0.3px' }}
                            >
                              Pak Sutrisno
                            </text>

                            {/* Dialogue Lines */}
                            {cinematicStage === 'pak_shouting' && (
                              <text x={pakX} y={pakY - 143} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                "Hey kamu! Baru jam segini sampai sekolah?!"
                              </text>
                            )}
                            {cinematicStage === 'pak_shouting_2' && (
                              <text x={pakX} y={pakY - 143} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                "Kamu kesini!"
                              </text>
                            )}
                            {cinematicStage === 'pak_sanction_1' && (
                              <g>
                                <text x={pakX} y={pakY - 162} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                  "Kamu terlambat lagi! Bel sekolah sudah lama berbunyi
                                </text>
                                <text x={pakX} y={pakY - 146} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                  dan kamu baru saja melangkah di lapangan ini."
                                </text>
                              </g>
                            )}
                            {cinematicStage === 'pak_sanction_2' && (
                              <g>
                                <text x={pakX} y={pakY - 162} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                  "Sebagai sanksi kedisiplinan, kamu <tspan fill="#EF4444" fontWeight="900">TIDAK BOLEH</tspan>"
                                </text>
                                <text x={pakX} y={pakY - 146} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                  masuk kelas sebelum menyelesaikan tugas ini!"
                                </text>
                              </g>
                            )}
                            {cinematicStage === 'pak_sanction_3' && (
                              <g>
                                <text x={pakX} y={pakY - 162} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                  "Kelilingi lorong sekolah dan kumpulkan <tspan fill="#38BDF8" fontWeight="900">35 sampel data</tspan>"
                                </text>
                                <text x={pakX} y={pakY - 146} textAnchor="middle" fill="#FFFFFF" fontSize={10.5} fontWeight="800" fontFamily="var(--font-ui)">
                                  screen time dari 5 kelas (VII-A, VII-B, VIII-A, VIII-B, IX)!"
                                </text>
                              </g>
                            )}

                            {/* Action Prompt Line */}
                            <text
                              x={pakX + (isSanctionStage ? 152 : 118)}
                              y={pakY - 128}
                              textAnchor="end"
                              fill="#38BDF8"
                              fontSize={9.5}
                              fontWeight="900"
                              fontFamily="var(--font-ui)"
                            >
                              [ Klik / Tap ▶ ]
                            </text>
                          </g>
                        )

                        {/* Player Opening Monologue Speech Bubble */}
                        const renderPlayerIntroBubble = cinematicStage === 'player_intro' && (() => {
                          const pW = 240
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const pTextX = pLeft + pW / 2
                          return (
                            <g
                              key="player-intro-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              {/* Dialogue Card Container above Player */}
                              <rect
                                x={pLeft}
                                y={btnY - 32}
                                width={pW}
                                height={54}
                                rx={14}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#38BDF8"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.7))' }}
                              />
                              {/* Pointer Triangle */}
                              <polygon
                                points={`${charPos.x - 8},${btnY + 22} ${charPos.x + 8},${btnY + 22} ${charPos.x},${btnY + 32}`}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#38BDF8"
                                strokeWidth={1}
                              />

                              {/* Speaker Name: Kamu */}
                              <text
                                x={pLeft + 14}
                                y={btnY - 16}
                                textAnchor="start"
                                fill="#38BDF8"
                                fontSize={10.5}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                                style={{ letterSpacing: '0.3px' }}
                              >
                                Kamu
                              </text>

                              {/* Dialogue Line */}
                              <text
                                x={pTextX}
                                y={btnY + 1}
                                textAnchor="middle"
                                fill="#FFFFFF"
                                fontSize={11}
                                fontWeight="800"
                                fontFamily="var(--font-ui)"
                              >
                                "Duh... aku terlambat lagi ke sekolah!"
                              </text>

                              {/* Action Prompt Line */}
                              <text
                                x={pLeft + pW - 12}
                                y={btnY + 15}
                                textAnchor="end"
                                fill="#38BDF8"
                                fontSize={9}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                              >
                                [ Klik / Tap ▶ ]
                              </text>
                            </g>
                          )
                        })()

                        {/* Player Reply Speech Bubble */}
                        const renderPlayerReplyBubble = cinematicStage === 'player_reply_pak' && (() => {
                          const pW = 210
                          const pLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - pW - 10, charPos.x - pW / 2))
                          const pTextX = pLeft + pW / 2
                          return (
                            <g
                              key="player-reply-bubble"
                              style={{ cursor: 'pointer' }}
                              onClick={handleTalkToPak}
                            >
                              {/* Dialogue Card Container above Player */}
                              <rect
                                x={pLeft}
                                y={btnY - 32}
                                width={pW}
                                height={54}
                                rx={14}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#10B981"
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.7))' }}
                              />
                              {/* Pointer Triangle */}
                              <polygon
                                points={`${charPos.x - 8},${btnY + 22} ${charPos.x + 8},${btnY + 22} ${charPos.x},${btnY + 32}`}
                                fill="rgba(15, 35, 56, 0.96)"
                                stroke="#10B981"
                                strokeWidth={1}
                              />

                              {/* Speaker Name: Kamu */}
                              <text
                                x={pLeft + 14}
                                y={btnY - 16}
                                textAnchor="start"
                                fill="#10B981"
                                fontSize={10.5}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                                style={{ letterSpacing: '0.3px' }}
                              >
                                Kamu
                              </text>

                              {/* Dialogue Line */}
                              <text
                                x={pTextX}
                                y={btnY + 1}
                                textAnchor="middle"
                                fill="#FFFFFF"
                                fontSize={11}
                                fontWeight="800"
                                fontFamily="var(--font-ui)"
                              >
                                "Baik Pak!"
                              </text>

                              {/* Action Prompt Line */}
                              <text
                                x={pLeft + pW - 12}
                                y={btnY + 15}
                                textAnchor="end"
                                fill="#10B981"
                                fontSize={9}
                                fontWeight="900"
                                fontFamily="var(--font-ui)"
                              >
                                [ 📝 Mulai Investigasi ▶ ]
                              </text>
                            </g>
                          )
                        })()

                        {/* Glowing Waypoint Arrow towards Pak Sutrisno when player needs to meet him */}
                        const renderWaypointArrow = ((cinematicStage === 'quest_meet_pak' || isAllCollected) && !isNearPak) && (
                          <g key="waypoint-arrow" style={{ pointerEvents: 'none' }}>
                            <circle cx={pakX} cy={pakY - 120} r={16} fill={isAllCollected ? "rgba(16, 185, 129, 0.2)" : "rgba(56, 189, 248, 0.2)"} stroke={isAllCollected ? "#10B981" : "#38BDF8"} strokeWidth={2} />
                            <text x={pakX} y={pakY - 115} textAnchor="middle" fill={isAllCollected ? "#10B981" : "#38BDF8"} fontSize={18} fontWeight="900">
                              ↓
                            </text>
                          </g>
                        )

                        const buttonW = 220
                        const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                        const textX = buttonLeft + buttonW / 2

                        const renderPrompt = isNearPak && !isSpeechActive && (
                          <motion.g
                            key="btn-talk-pak-sutrisno"
                            initial={{ opacity: 0, scale: 0.8, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 5 }}
                            onClick={handleTalkToPak}
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
                              stroke={isAllCollected ? "#10B981" : "#38BDF8"}
                              strokeWidth={2}
                              style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))' }}
                            />
                            <text
                              x={textX}
                              y={btnTextY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="#ffffff"
                              fontSize={10}
                              fontWeight="bold"
                              fontFamily="var(--font-ui)"
                            >
                              {isAllCollected ? "📋 Lapor 35 Data ke Pak Sutrisno" : "💬 Bicara dengan Pak Sutrisno"}
                            </text>
                          </motion.g>
                        )

                        return (
                          <g key="pak-sutrisno-group">
                            {renderPak}
                            {renderShoutBubble}
                            {renderPlayerIntroBubble}
                            {renderPlayerReplyBubble}
                            {renderWaypointArrow}
                            {renderPrompt}
                          </g>
                        )
                      })()}

                      {/* Player Character */}
                      <PlayerCharacter
                        x={charPos.x}
                        y={charPos.y}
                        dir={moveDir}
                        size={charSize}
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

                        {/* 2. Hallway Door Interaction Prompt (Locked door -> Kuis; Unlocked door -> Masuk Kelas; Saved -> Completed) */}
                        {!insideRoom && nearClass && !activeClass && !nearDoor && (cinematicStage === 'sanction_received' || demoMode) && (() => {
                          const isSaved = savedClasses.has(nearClass.id)
                          const isUnlocked = unlocked.has(nearClass.id)
                          const buttonW = isSaved ? 180 : 160
                          const buttonLeft = Math.max(camX + 10, Math.min(camX + VIEW_VW - buttonW - 10, charPos.x - buttonW / 2))
                          const textX = buttonLeft + buttonW / 2
                          return (
                            <motion.g
                              key={`btn-class-${nearClass.id}`}
                              initial={{ opacity: 0, scale: 0.8, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 5 }}
                              onClick={() => {
                                if (isSaved) return
                                if (isUnlocked) {
                                  enterClassroom(nearClass)
                                } else {
                                  setActiveClass(nearClass)
                                }
                              }}
                              whileHover={{ scale: isSaved ? 1 : 1.05 }}
                              whileTap={{ scale: isSaved ? 1 : 0.95 }}
                              style={{ cursor: isSaved ? 'default' : 'pointer' }}
                            >
                              <rect
                                x={buttonLeft - 10}
                                y={btnY}
                                width={buttonW + 20}
                                height={28}
                                rx={6}
                                fill="#0B1726"
                                stroke={isSaved ? '#10B981' : isUnlocked ? '#38BDF8' : '#F59E0B'}
                                strokeWidth={2}
                                style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85))' }}
                              />
                              <text
                                x={textX}
                                y={btnTextY + 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isSaved ? '#10B981' : '#FFFFFF'}
                                fontSize={10.5}
                                fontWeight="900"
                                style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0.4px' }}
                              >
                                {isSaved ? `✓ Data ${nearClass.label} Saved` : isUnlocked ? `[ E ] 🚪 Masuk ${nearClass.label} ►` : `[ E ] 📍 Periksa ${nearClass.label} ►`}
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

      {/* Pak Sutrisno Report Modal */}
      <AnimatePresence>
        {showPakReportModal && (
          <PakReportModal
            onProceed={() => {
              setShowPakReportModal(false)
              setShowCounter(true)
            }}
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

      {/* Inventory Side Drawer Modal Overlay (Misi & Target Tugas) */}
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
                    📜 QUEST LOG • LEVEL 1
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span>📜</span> Misi Investigasi
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

              {/* Dynamic Quest Status Card */}
              {(() => {
                const isTaskGiven = cinematicStage === 'sanction_received' || demoMode
                const isAllCollected = n >= TOTAL_N

                let badgeColor = '#38BDF8'
                let badgeText = '📍 MISI UTAMA'
                let questTitle = 'Jumpai Pak Sutrisno'
                let questDesc = 'Kamu datang terlambat ke sekolah! Cari dan bicara dengan Pak Sutrisno di depan Ruang Guru Lorong Utama untuk melapor.'

                if (isAllCollected) {
                  badgeColor = '#10B981'
                  badgeText = '⚡ SELESAI — SIAP DILAPORKAN'
                  questTitle = 'Laporkan 35 Data ke Pak Sutrisno'
                  questDesc = 'Semua 35 sampel data screen time siswa telah berhasil terkumpul dari 5 kelas! Kembalilah ke Pak Sutrisno di Lorong Utama untuk menyerahkan data.'
                } else if (isTaskGiven) {
                  badgeColor = '#00ADB5'
                  badgeText = '🟢 SEDANG BERLANGSUNG'
                  questTitle = 'Kumpulkan 35 Data Screen Time Siswa'
                  questDesc = 'Kunjungi Wali-Wali Kelas di Ruang VII, VIII, dan IX. Bicara dengan guru di setiap kelas untuk mengumpulkan sampel data screen time.'
                }

                return (
                  <div style={{
                    background: `linear-gradient(135deg, ${badgeColor}18 0%, rgba(15, 23, 42, 0.6) 100%)`,
                    border: `1.5px solid ${badgeColor}55`,
                    borderRadius: 16,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.3)`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: badgeColor,
                        background: `${badgeColor}22`,
                        border: `1px solid ${badgeColor}44`,
                        borderRadius: 20,
                        padding: '3px 10px',
                        letterSpacing: '0.8px'
                      }}>
                        {badgeText}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8' }}>
                        Target: 35 Sampel Data
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                        {questTitle}
                      </h4>
                      <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                        {questDesc}
                      </p>
                    </div>

                    {/* Progress Bar Component */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#CBD5E1' }}>Progress Pengumpulkan Data</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: badgeColor, fontFamily: 'var(--font-data)' }}>
                          {n} / {TOTAL_N} Siswa ({Math.round((n / TOTAL_N) * 100)}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: 14,
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: 2
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (n / TOTAL_N) * 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: isAllCollected
                              ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                              : 'linear-gradient(90deg, #00ADB5 0%, #38BDF8 100%)',
                            borderRadius: 8,
                            boxShadow: `0 0 10px ${badgeColor}88`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}



              {/* Collapsible Student Data Details Button */}
              {collectedStudents.length > 0 && (
                <div style={{ marginTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14 }}>
                  <button
                    onClick={() => setShowStudentDetails(prev => !prev)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: showStudentDetails ? 'rgba(0, 173, 181, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(0, 173, 181, 0.3)',
                      color: '#00ADB5',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{showStudentDetails ? '🔼 Sembunyikan' : '👁️ Tampilkan'} Detail Catatan Data Siswa ({collectedStudents.length})</span>
                  </button>

                  {showStudentDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      {/* Class Filter Tabs */}
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
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setInventoryTab(tab.id as any)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 8,
                                fontSize: 10.5,
                                fontWeight: 800,
                                border: active ? `1.5px solid ${tab.color || '#00ADB5'}` : '1px solid rgba(255,255,255,0.1)',
                                background: active ? (tab.color ? `${tab.color}33` : 'rgba(0, 173, 181, 0.25)') : 'rgba(255,255,255,0.04)',
                                color: active ? (tab.color || '#00ADB5') : '#94A3B8',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {tab.label}
                            </button>
                          )
                        })}
                      </div>

                      {/* Student Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                        {collectedStudents
                          .filter(st => inventoryTab === 'ALL' || st.classId === inventoryTab)
                          .map((st, idx) => {
                            const doorMeta = CLASS_DOORS.find(cd => cd.id === st.classId)
                            const themeColor = doorMeta?.color || '#00ADB5'
                            return (
                              <div
                                key={`${st.classId}-${st.name}-${idx}`}
                                style={{
                                  background: 'rgba(11, 30, 44, 0.6)',
                                  border: `1px solid ${themeColor}44`,
                                  borderRadius: 10,
                                  padding: '8px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <div style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  background: `${themeColor}22`,
                                  border: `1px solid ${themeColor}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  flexShrink: 0
                                }}>
                                  👤
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {st.name}
                                  </div>
                                  <div style={{ fontSize: 9.5, color: themeColor, fontWeight: 700, marginTop: 1 }}>
                                    ⏱️ {st.time} Jam/hari
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </motion.div>
                  )}
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
