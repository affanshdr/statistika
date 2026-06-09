import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get('studentId')

  if (!studentId) {
    return NextResponse.json({ error: 'studentId diperlukan' }, { status: 400 })
  }

  try {
    const result = await prisma.geftResult.findUnique({
      where: { studentId },
      select: { cognitiveStyle: true, score: true },
    })

    if (!result) {
      return NextResponse.json({ error: 'Hasil GEFT tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ cognitiveStyle: result.cognitiveStyle, score: result.score })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengambil gaya kognitif' }, { status: 500 })
  }
}
