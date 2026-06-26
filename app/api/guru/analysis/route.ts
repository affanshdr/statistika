import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Label per level ID (sesuaikan dengan level investigasi game)
const LEVEL_LABELS: Record<number, string> = {
  1: 'Identifikasi Masalah',
  2: 'Pengumpulan Data',
  3: 'Frekuensi Relatif',
  4: 'Histogram & Distribusi',
  5: 'Ukuran Pemusatan',
  6: 'Ukuran Penyebaran',
  7: 'Interpretasi Grafik',
  8: 'Klaim & Bukti',
  9: 'Kesimpulan Akhir',
}

const XP_TO_SCORE = (xp: number) => Math.min(100, Math.round(xp / 10))

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const classroomId = searchParams.get('classroomId')
    const stuckDays = parseInt(searchParams.get('stuckDays') || '3', 10)

    // ── 1. Fetch all students with sessions ──
    const students = await prisma.student.findMany({
      where: classroomId ? { classroomId } : {},
      include: {
        classroom: true,
        geftResult: true,
        leaderboard: true,
        gameSessions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // ── 2. Pre vs Post per student ──
    const preVsPost = students.map(s => {
      const totalXp = s.leaderboard?.totalXp ?? 0
      const postScore = XP_TO_SCORE(totalXp)
      const lastSession = s.gameSessions.length > 0
        ? s.gameSessions[s.gameSessions.length - 1]
        : null
      return {
        id: s.id,
        name: s.name,
        classroomName: s.classroom?.name ?? '-',
        classroomId: s.classroomId,
        cognitiveStyle: s.geftResult?.cognitiveStyle ?? null,
        preScore: s.diagnosticScore ?? null,
        postScore: postScore > 0 ? postScore : null,
        gain: (s.diagnosticScore !== null && s.diagnosticScore !== undefined && postScore > 0)
          ? postScore - s.diagnosticScore
          : null,
        totalSessions: s.gameSessions.length,
        lastActivityAt: lastSession?.createdAt ?? s.createdAt,
      }
    })

    // ── 3. Level error analysis ──
    // Get all sessions across filtered students
    const allSessions = students.flatMap(s => s.gameSessions)

    type LevelStat = {
      levelId: number
      label: string
      total: number
      correct: number
      incorrect: number
      errorRate: number
      avgTimeSec: number
      topWrongAnswers: { answer: string; count: number }[]
    }

    const levelMap: Record<number, { total: number; correct: number; timeTaken: number[]; wrongAnswers: string[] }> = {}

    for (const session of allSessions) {
      if (!levelMap[session.levelId]) {
        levelMap[session.levelId] = { total: 0, correct: 0, timeTaken: [], wrongAnswers: [] }
      }
      levelMap[session.levelId].total++
      levelMap[session.levelId].timeTaken.push(session.timeTaken)
      if (session.isCorrect) {
        levelMap[session.levelId].correct++
      } else if (session.verdictAnswer && session.verdictAnswer.trim()) {
        levelMap[session.levelId].wrongAnswers.push(session.verdictAnswer.trim())
      }
    }

    const levelAnalysis: LevelStat[] = Object.entries(levelMap).map(([levelIdStr, stat]) => {
      const levelId = parseInt(levelIdStr)
      const errorRate = stat.total > 0 ? Math.round(((stat.total - stat.correct) / stat.total) * 100) : 0
      const avgTimeSec = stat.timeTaken.length > 0
        ? Math.round(stat.timeTaken.reduce((a, b) => a + b, 0) / stat.timeTaken.length)
        : 0

      // Count wrong answers frequency
      const wrongFreq: Record<string, number> = {}
      for (const ans of stat.wrongAnswers) {
        wrongFreq[ans] = (wrongFreq[ans] || 0) + 1
      }
      const topWrongAnswers = Object.entries(wrongFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([answer, count]) => ({ answer, count }))

      return {
        levelId,
        label: LEVEL_LABELS[levelId] ?? `Level ${levelId}`,
        total: stat.total,
        correct: stat.correct,
        incorrect: stat.total - stat.correct,
        errorRate,
        avgTimeSec,
        topWrongAnswers,
      }
    }).sort((a, b) => b.errorRate - a.errorRate) // Urutkan dari error terbesar

    // ── 4. Stuck students ──
    const now = Date.now()

    const stuckStudents = preVsPost
      .filter(s => {
        // Belum selesai investigasi (xp < threshold)
        const hasStarted = s.totalSessions > 0
        const lastMs = s.lastActivityAt ? new Date(s.lastActivityAt).getTime() : 0
        const daysSinceActivity = (now - lastMs) / (24 * 60 * 60 * 1000)
        return daysSinceActivity >= stuckDays && !hasStarted || (hasStarted && daysSinceActivity >= stuckDays && (s.postScore ?? 0) < 80)
      })
      .map(s => {
        const lastMs = s.lastActivityAt ? new Date(s.lastActivityAt).getTime() : 0
        const daysSince = Math.round((now - lastMs) / (24 * 60 * 60 * 1000))
        return { ...s, daysSinceActivity: daysSince }
      })
      .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity)

    return NextResponse.json({
      preVsPost,
      levelAnalysis,
      stuckStudents,
      stuckDays,
      totalStudents: students.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[guru/analysis]', error)
    return NextResponse.json({ error: 'Gagal mengambil data analisis' }, { status: 500 })
  }
}
