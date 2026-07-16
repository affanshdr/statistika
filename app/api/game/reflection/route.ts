import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, levelId, content } = body

    if (!studentId || levelId === undefined || !content) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const submission = await prisma.reflectionSubmission.upsert({
      where: {
        studentId_levelId: {
          studentId,
          levelId: parseInt(levelId) || levelId,
        },
      },
      update: {
        content,
        createdAt: new Date(),
      },
      create: {
        studentId,
        levelId: parseInt(levelId) || levelId,
        content,
      },
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('[API] reflection POST error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan refleksi' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const levelIdStr = searchParams.get('levelId')

    if (!studentId || !levelIdStr) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    const levelId = parseInt(levelIdStr)

    const submission = await prisma.reflectionSubmission.findUnique({
      where: {
        studentId_levelId: {
          studentId,
          levelId,
        },
      },
    })

    if (!submission) {
      return NextResponse.json(null)
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('[API] reflection GET error:', error)
    return NextResponse.json({ error: 'Gagal mengambil refleksi' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, score, teacherFeedback } = body

    if (!id) {
      return NextResponse.json({ error: 'ID submission wajib disertakan' }, { status: 400 })
    }

    const submission = await prisma.reflectionSubmission.update({
      where: { id },
      data: {
        score: score !== undefined ? parseInt(score) : undefined,
        teacherFeedback: teacherFeedback ?? undefined,
      },
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('[API] reflection PUT error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui penilaian' }, { status: 500 })
  }
}
