import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST: Save student's LKPD answers for a specific level.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, levelId, answers } = body

    if (!studentId || levelId === undefined || !answers) {
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

    // 2. Update sesi game dengan jawaban LKPD
    const updatedSession = await prisma.gameSession.update({
      where: {
        id: latestSession.id,
      },
      data: {
        lkpdCompleted: true,
        lkpdAnswers: answers, // Stores the complete JSON object containing all pages' inputs
      },
    })

    // 3. Tambahkan bonus XP ke leaderboard (+20 XP untuk pengisian LKPD secara lengkap)
    const xpToAdd = 20
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

    return NextResponse.json({
      success: true,
      message: 'LKPD berhasil disimpan',
      session: updatedSession,
      xpAdded: xpToAdd,
    })
  } catch (error) {
    console.error('Error saving LKPD:', error)
    return NextResponse.json({ error: 'Gagal memproses pengiriman LKPD' }, { status: 500 })
  }
}

/**
 * GET: Retrieve student's LKPD answers for a specific level.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const levelId = searchParams.get('levelId')

    if (!studentId || !levelId) {
      return NextResponse.json({ error: 'studentId dan levelId diperlukan' }, { status: 400 })
    }

    const session = await prisma.gameSession.findFirst({
      where: {
        studentId,
        levelId: Number(levelId),
        lkpdCompleted: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'LKPD belum diisi atau sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      lkpdCompleted: session.lkpdCompleted,
      lkpdAnswers: session.lkpdAnswers,
      updatedAt: session.createdAt,
    })
  } catch (error) {
    console.error('Error fetching LKPD:', error)
    return NextResponse.json({ error: 'Gagal mengambil data LKPD' }, { status: 500 })
  }
}
