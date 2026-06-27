import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── Gate → phase advancement map ────────────────────────────────────────────
const GATE_PHASE_MAP: Record<string, string> = {
  gate_cutscene_next: 'cutscene_mentor',
  gate_cutscene_start: 'formula',
  gate_formula_done: 'lobby',
}

// ── Gate → currentStep advancement map (in-game step gates) ─────────────────
const GATE_STEP_MAP: Record<string, Record<string, unknown>> = {
  gate_step0_done:   { currentStep: 1 },
  gate_step1_done:   { currentStep: 1.5 },
  gate_verdict_done: { currentStep: 2, verdictAnswer: 'MISLEADING', isCorrect: true },
}

const READY_THRESHOLD = 2

// Map memori global untuk mencatat timestamp keaktifan siswa (studentId -> timestamp)
const lastActiveMap = new Map<string, number>()
const INACTIVE_THRESHOLD_MS = 15000 // 15 detik tanpa polling = tidak aktif

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const teamId = searchParams.get('teamId')
    const studentId = searchParams.get('studentId')

    if (!teamId) {
      return NextResponse.json({ error: 'teamId wajib disertakan' }, { status: 400 })
    }

    if (studentId) {
      // 1. Cari tim dan anggota-anggotanya terlebih dahulu
      const checkTeam = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
          members: {
            select: { studentId: true }
          }
        }
      })

      if (checkTeam) {
        const memberIds = checkTeam.members.map(m => m.studentId)
        // Periksa apakah ada anggota tim LAIN yang masih aktif dalam 15 detik terakhir
        const hasActiveMembers = memberIds.some(id => {
          if (id === studentId) return false // Jangan hitung diri sendiri yang baru masuk
          const lastActive = lastActiveMap.get(id)
          return lastActive && (Date.now() - lastActive < INACTIVE_THRESHOLD_MS)
        })

        // Jika tidak ada satu pun anggota yang aktif (semua sudah keluar/offline), reset progress tim
        if (!hasActiveMembers) {
          console.log(`[Sync API] Seluruh anggota tim ${teamId} telah keluar. Meriset kemajuan tim ke default.`)
          await prisma.team.update({
            where: { id: teamId },
            data: {
              status: 'WAITING',
              currentStep: 0,
              histogramState: [],
              verdictAnswer: '',
              isCorrect: false,
              gamePhase: 'cutscene_comments',
              readyVotes: {},
              formulaState: {}
            }
          })
          // Hapus sisa-sisa map aktif lama untuk members ini agar bersih
          memberIds.forEach(id => lastActiveMap.delete(id))
        }
      }

      // Catat keaktifan siswa ini sekarang
      lastActiveMap.set(studentId, Date.now())
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            student: {
              select: { name: true },
            },
          },
        },
        chatMessages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: 'Tim tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      teamId: team.id,
      status: team.status,
      currentStep: team.currentStep,
      histogramState: team.histogramState,
      verdictAnswer: team.verdictAnswer,
      isCorrect: team.isCorrect,
      gamePhase: team.gamePhase,
      readyVotes: team.readyVotes ?? {},
      formulaState: team.formulaState ?? {},
      members: team.members.map((m) => ({
        id: m.studentId,
        name: m.student.name,
      })),
      chatMessages: team.chatMessages.map((msg) => ({
        id: msg.id,
        studentId: msg.studentId,
        senderName: msg.senderName,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    })
  } catch (error) {
    console.error('Fetch team sync error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      teamId,
      currentStep,
      histogramState,
      verdictAnswer,
      isCorrect,
      status,
      gamePhase,
      // castVote: { gate, studentId } — cast a ready vote for a gate
      castVote,
      // formulaStateUpdate: partial formulaState to deep-merge (positions, mazeMax, mazeMin, sub)
      formulaStateUpdate,
    } = body

    if (!teamId) {
      return NextResponse.json({ error: 'teamId wajib disertakan' }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    if (currentStep !== undefined) updateData.currentStep = currentStep
    if (histogramState !== undefined) updateData.histogramState = histogramState
    if (verdictAnswer !== undefined) updateData.verdictAnswer = verdictAnswer
    if (isCorrect !== undefined) updateData.isCorrect = isCorrect
    if (status !== undefined) updateData.status = status
    if (gamePhase !== undefined) updateData.gamePhase = gamePhase

    if (isCorrect === true) {
      updateData.status = 'COMPLETED'
    }

    // ── Handle ready vote (2/3 gate) ────────────────────────────────────────
    if (castVote) {
      const { gate, studentId: voterId } = castVote as { gate: string; studentId: string }

      // Read current team to merge votes
      const currentTeam = await prisma.team.findUnique({
        where: { id: teamId },
        select: { readyVotes: true, members: { select: { studentId: true } } },
      })
      if (!currentTeam) {
        return NextResponse.json({ error: 'Tim tidak ditemukan' }, { status: 404 })
      }

      const votes = (currentTeam.readyVotes as Record<string, string[]> | null) ?? {}
      const gateVotes: string[] = votes[gate] ?? []

      // Add voter if not already voted
      if (!gateVotes.includes(voterId)) {
        gateVotes.push(voterId)
      }
      votes[gate] = gateVotes
      updateData.readyVotes = votes

      // Auto-advance if threshold met
      if (gateVotes.length >= READY_THRESHOLD) {
        if (gate === 'lobby_ready') {
          // Special: mark team as PLAYING so all clients start countdown
          // Keep lobby_ready votes intact so UI can display who is ready during countdown
          updateData.status = 'PLAYING'
        } else if (GATE_PHASE_MAP[gate]) {
          // Phase gates (cutscene, formula, lobby) — advance gamePhase
          updateData.gamePhase = GATE_PHASE_MAP[gate]
          votes[gate] = []
          updateData.readyVotes = votes
        } else if (GATE_STEP_MAP[gate]) {
          // Step gates (in-game) — advance currentStep (and optionally isCorrect/verdictAnswer)
          const stepData = GATE_STEP_MAP[gate]
          Object.assign(updateData, stepData)
          if (stepData.isCorrect) updateData.status = 'COMPLETED'
          votes[gate] = []
          updateData.readyVotes = votes
        }
      }
    }

    // ── Handle formulaState deep-merge ───────────────────────────────────────
    if (formulaStateUpdate) {
      const currentTeam = await prisma.team.findUnique({
        where: { id: teamId },
        select: { formulaState: true },
      })
      const current = (currentTeam?.formulaState as Record<string, any> | null) ?? {}

      const merged: Record<string, any> = { ...current }

      // Merge top-level fields (sub, mazeMax, mazeMin)
      for (const [key, val] of Object.entries(formulaStateUpdate as Record<string, any>)) {
        if (key === 'positions') {
          // Deep-merge positions: { [studentId]: { x, y } }
          merged.positions = {
            ...(current.positions ?? {}),
            ...(val as Record<string, { x: number; y: number }>),
          }
        } else {
          merged[key] = val
        }
      }

      updateData.formulaState = merged
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
    })

    return NextResponse.json({ success: true, team: updatedTeam })
  } catch (error) {
    console.error('Update team sync error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
