import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { teamId, studentId, senderName, content } = body

    if (!teamId || !studentId || !senderName || !content) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const message = await prisma.teamMessage.create({
      data: {
        teamId,
        studentId,
        senderName,
        content,
      },
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
