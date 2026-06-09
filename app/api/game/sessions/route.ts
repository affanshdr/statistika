import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      studentId, levelId, cognitiveStyle,
      xpEarned, livesRemaining, timeTaken,
      verdictAnswer, isCorrect,
    } = body

    if (!studentId || levelId === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const session = await prisma.gameSession.create({
      data: {
        studentId, levelId, cognitiveStyle,
        xpEarned, livesRemaining, timeTaken,
        verdictAnswer: verdictAnswer ?? '',
        isCorrect: isCorrect ?? false,
      },
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan sesi game' }, { status: 500 })
  }
}
