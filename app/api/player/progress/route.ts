import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json({ error: 'playerId wajib disertakan' }, { status: 400 })
    }

    const progress = await prisma.playerProgress.findUnique({
      where: { playerId },
      include: {
        player: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarId: true,
          },
        },
      },
    })

    if (!progress) {
      return NextResponse.json({ error: 'Progress pemain tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching player progress:', error)
    return NextResponse.json({ error: 'Gagal mengambil progress pemain' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      playerId,
      levelId,
      xpEarned,
      stars,
      durationSeconds,
      livesRemaining,
      mistakeCount,
      verdictAnswer,
      isCorrect,
      details,
    } = body

    if (!playerId) {
      return NextResponse.json({ error: 'playerId wajib disertakan' }, { status: 400 })
    }

    // 1. Simpan riwayat sesi bermain (GameSession)
    if (levelId !== undefined) {
      await prisma.gameSession.create({
        data: {
          playerId,
          levelId: Number(levelId),
          xpEarned: xpEarned ?? 0,
          score: (stars ?? 0) * 100 + (xpEarned ?? 0),
          durationSeconds: durationSeconds ?? 0,
          livesRemaining: livesRemaining ?? 3,
          mistakeCount: mistakeCount ?? 0,
          verdictAnswer: verdictAnswer ?? null,
          isCorrect: isCorrect ?? false,
          details: details ?? null,
        },
      })
    }

    // 2. Ambil progress yang sudah ada
    const existing = await prisma.playerProgress.findUnique({
      where: { playerId },
    })

    const currentStars = (existing?.levelStars as Record<string, number>) || {}
    if (levelId !== undefined && stars !== undefined) {
      const prevStars = currentStars[String(levelId)] || 0
      currentStars[String(levelId)] = Math.max(prevStars, Number(stars))
    }

    const currentUnlocked = new Set(existing?.unlockedLevels || [1])
    if (levelId !== undefined) {
      currentUnlocked.add(Number(levelId))
      // Jika berhasil menyelesaikan level ini dengan benar, buka level berikutnya
      if (isCorrect) {
        currentUnlocked.add(Number(levelId) + 1)
      }
    }

    const updatedProgress = await prisma.playerProgress.upsert({
      where: { playerId },
      create: {
        playerId,
        totalXp: xpEarned ?? 0,
        playerLevel: Math.floor((xpEarned ?? 0) / 100) + 1,
        unlockedLevels: Array.from(currentUnlocked).sort((a, b) => a - b),
        levelStars: currentStars,
      },
      update: {
        totalXp: { increment: xpEarned ?? 0 },
        unlockedLevels: Array.from(currentUnlocked).sort((a, b) => a - b),
        levelStars: currentStars,
      },
    })

    return NextResponse.json({ success: true, progress: updatedProgress })
  } catch (error) {
    console.error('Error updating player progress:', error)
    return NextResponse.json({ error: 'Gagal memperbarui progress pemain' }, { status: 500 })
  }
}
