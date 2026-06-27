import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/students/heartbeat
 * Updates the student's lastSeenAt timestamp.
 * Call this every 30s from the client while the student is active.
 */
export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: 'studentId wajib' }, { status: 400 })
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { lastSeenAt: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json({ error: 'Gagal update heartbeat' }, { status: 500 })
  }
}
