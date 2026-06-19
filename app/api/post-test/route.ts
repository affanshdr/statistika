import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Cek status post test siswa
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'studentId required' }, { status: 400 })
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { postTestScore: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      hasTaken: student.postTestScore !== null,
      postTestScore: student.postTestScore,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Simpan hasil post test siswa
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

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        postTestScore: score,
      },
    })

    return NextResponse.json({
      postTestScore: updated.postTestScore,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save post test result' }, { status: 500 })
  }
}
