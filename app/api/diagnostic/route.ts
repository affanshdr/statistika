import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: cek status diagnostik siswa
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'studentId required' }, { status: 400 })
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { diagnosticScore: true, diagnosticLevel: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      hasTaken: student.diagnosticScore !== null,
      diagnosticScore: student.diagnosticScore,
      diagnosticLevel: student.diagnosticLevel,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: simpan hasil diagnostik
export async function POST(req: NextRequest) {
  try {
    const { studentId, score } = await req.json()

    if (!studentId || score === undefined) {
      return NextResponse.json({ error: 'studentId and score required' }, { status: 400 })
    }

    // Pastikan siswa ada di database
    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    // Tentukan level berdasarkan skor (dari total 5 soal)
    let diagnosticLevel: string
    if (score >= 4) {
      diagnosticLevel = 'tinggi'
    } else if (score >= 2) {
      diagnosticLevel = 'sedang'
    } else {
      diagnosticLevel = 'rendah'
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        diagnosticScore: score,
        diagnosticLevel,
      },
    })

    return NextResponse.json({
      diagnosticScore: updated.diagnosticScore,
      diagnosticLevel: updated.diagnosticLevel,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save diagnostic result' }, { status: 500 })
  }
}
