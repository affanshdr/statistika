import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, pin, displayName } = body

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username wajib diisi' }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase()
    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: 'Username minimal 3 karakter' }, { status: 400 })
    }

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN harus berupa 4 digit angka (0-9)' }, { status: 400 })
    }

    // 1. Cari pemain berdasarkan username
    const existingPlayer = await prisma.player.findUnique({
      where: { username: cleanUsername },
      include: {
        progress: true,
      },
    })

    if (existingPlayer) {
      // Pemain sudah ada, verifikasi PIN
      if (existingPlayer.pin !== pin) {
        return NextResponse.json(
          { error: 'PIN salah untuk username ini. Gunakan PIN yang Anda buat sebelumnya.' },
          { status: 401 }
        )
      }

      // Pastikan ada progress jika belum terbuat
      let progress = existingPlayer.progress
      if (!progress) {
        progress = await prisma.playerProgress.create({
          data: {
            playerId: existingPlayer.id,
            totalXp: 0,
            playerLevel: 1,
            unlockedLevels: [1],
            levelStars: {},
            badges: [],
          },
        })
      }

      return NextResponse.json({
        player: {
          id: existingPlayer.id,
          username: existingPlayer.username,
          displayName: existingPlayer.displayName,
          avatarId: existingPlayer.avatarId,
        },
        progress,
        isNew: false,
      })
    }

    // 2. Pemain baru, buat profil dan progress awal
    const newPlayer = await prisma.player.create({
      data: {
        username: cleanUsername,
        displayName: displayName?.trim() || username.trim(),
        pin,
        progress: {
          create: {
            totalXp: 0,
            playerLevel: 1,
            unlockedLevels: [1],
            levelStars: {},
            badges: [],
          },
        },
      },
      include: {
        progress: true,
      },
    })

    return NextResponse.json(
      {
        player: {
          id: newPlayer.id,
          username: newPlayer.username,
          displayName: newPlayer.displayName,
          avatarId: newPlayer.avatarId,
        },
        progress: newPlayer.progress,
        isNew: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/auth/play:', error)
    return NextResponse.json({ error: 'Gagal memproses data pemain' }, { status: 500 })
  }
}
