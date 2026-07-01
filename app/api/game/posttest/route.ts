import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, levelId, score } = body

    if (!studentId || levelId === undefined || score === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // 1. Cari sesi game terbaru untuk siswa dan level ini
    const latestSession = await prisma.gameSession.findFirst({
      where: {
        studentId,
        levelId: Number(levelId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!latestSession) {
      return NextResponse.json(
        { error: 'Sesi game tidak ditemukan. Silakan selesaikan game terlebih dahulu.' },
        { status: 404 }
      )
    }

    // 2. Update sesi game dengan nilai post-test
    const updatedSession = await prisma.gameSession.update({
      where: {
        id: latestSession.id,
      },
      data: {
        postTestCompleted: true,
        postTestScore: Number(score),
      },
    })

    // 3. Tambahkan XP ke leaderboard berdasarkan skor post-test (misal: 10 XP per jawaban benar)
    const xpToAdd = Number(score) * 10
    if (xpToAdd > 0) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { name: true },
      })

      if (student) {
        await prisma.leaderboard.upsert({
          where: { studentId },
          update: {
            totalXp: { increment: xpToAdd },
          },
          create: {
            studentId,
            username: student.name,
            totalXp: xpToAdd,
            badges: [],
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Post test berhasil disimpan',
      session: updatedSession,
      xpAdded: xpToAdd,
    })
  } catch (error) {
    console.error('Error saving post test:', error)
    return NextResponse.json({ error: 'Gagal memproses post test' }, { status: 500 })
  }
}
