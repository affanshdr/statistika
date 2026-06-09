import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET top 5 leaderboard
export async function GET() {
  try {
    // Check if Leaderboard model is available
    const prismaAny = prisma as unknown as Record<string, { findMany?: (...args: unknown[]) => unknown }>
    if (!prismaAny.leaderboard?.findMany) {
      return NextResponse.json([])
    }
    const top5 = await prisma.leaderboard.findMany({
      orderBy: { totalXp: 'desc' },
      take: 5,
      select: { username: true, totalXp: true, badges: true, studentId: true },
    })
    return NextResponse.json(top5)
  } catch {
    // Table not yet migrated or client stale — return empty
    return NextResponse.json([])
  }
}

// PATCH upsert leaderboard for a student
export async function PATCH(req: NextRequest) {
  try {
    const { studentId, username, xpToAdd, newBadges } = await req.json()

    if (!studentId || !username) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const existing = await prisma.leaderboard.findUnique({ where: { studentId } })

    if (existing) {
      const mergedBadges = Array.from(new Set([...existing.badges, ...(newBadges ?? [])]))
      const updated = await prisma.leaderboard.update({
        where: { studentId },
        data: { totalXp: existing.totalXp + (xpToAdd ?? 0), badges: mergedBadges },
      })
      return NextResponse.json(updated)
    } else {
      const created = await prisma.leaderboard.create({
        data: { studentId, username, totalXp: xpToAdd ?? 0, badges: newBadges ?? [] },
      })
      return NextResponse.json(created)
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal update leaderboard' }, { status: 500 })
  }
}
