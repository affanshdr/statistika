import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { studentId, score, totalQuestions } = await req.json()
    if (!studentId || score === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // FI jika skor >= 10 dari 18 (sesuai cutoff dari PDF)
    const cognitiveStyle = score >= 10 ? 'FI' : 'FD'

    await prisma.$transaction([
      prisma.geftResult.create({ data: { studentId, score, cognitiveStyle } }),
      prisma.student.update({ where: { id: studentId }, data: { geftStatus: 'completed' } }),
    ])

    return NextResponse.json({ cognitiveStyle, score })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan hasil GEFT' }, { status: 500 })
  }
}