import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── Gate → phase advancement map ────────────────────────────────────────────
const GATE_PHASE_MAP: Record<string, string> = {
  gate_cutscene_next: 'cutscene_mentor',
  gate_cutscene_start: 'formula',
  gate_formula_done: 'lobby',
}
const READY_THRESHOLD = 2

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json({ error: 'teamId wajib disertakan' }, { status: 400 })
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
          updateData.status = 'PLAYING'
        } else if (GATE_PHASE_MAP[gate]) {
          updateData.gamePhase = GATE_PHASE_MAP[gate]
        }
        if (gate === 'gate_step1_done') {
          updateData.currentStep = 1.5
        }
        // Clear gate votes after advancing
        votes[gate] = []
        updateData.readyVotes = votes
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
