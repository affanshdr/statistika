import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { studentId, score, totalQuestions } = await req.json()
    if (!studentId || score === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // FI jika skor >= 4 dari 6 (karena hanya 6 soal dinilai: 2 sesi × 3 soal)
    const cognitiveStyle = score >= 4 ? 'FI' : 'FD'

    // Gunakan upsert agar jika terjadi double submit / retake tidak memicu
    // error Unique Constraint P2002 pada kolom student_id
    await prisma.geftResult.upsert({
      where: { studentId },
      update: { score, cognitiveStyle },
      create: { studentId, score, cognitiveStyle },
    })
    await prisma.student.update({ where: { id: studentId }, data: { geftStatus: 'completed' } })

    return NextResponse.json({ cognitiveStyle, score })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan hasil GEFT' }, { status: 500 })
  }
}