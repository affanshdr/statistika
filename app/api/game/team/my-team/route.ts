import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'studentId wajib disertakan' }, { status: 400 })
    }

    // Find an active team membership for this student (WAITING or PLAYING)
    const membership = await prisma.teamMember.findFirst({
      where: {
        studentId,
        team: {
          status: { in: ['WAITING', 'PLAYING'] },
        },
      },
      include: {
        team: {
          include: {
            classroom: {
              select: { name: true },
            },
            members: {
              include: {
                student: {
                  select: { id: true, name: true },
                },
              },
              orderBy: { joinedAt: 'asc' },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    if (!membership) {
      return NextResponse.json({ team: null })
    }

    const team = membership.team

    return NextResponse.json({
      team: {
        teamId: team.id,
        levelId: team.levelId,
        status: team.status,
        classroomName: team.classroom.name,
        members: team.members.map((m) => ({
          id: m.student.id,
          name: m.student.name,
        })),
      },
    })
  } catch (error) {
    console.error('Fetch my-team error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
