import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, levelId } = body

    if (!studentId || levelId === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // 1. Get student classroom
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classroomId: true, name: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    const classroomId = student.classroomId

    // 2. Look for an active WAITING team in this classroom for this level
    let team = await prisma.team.findFirst({
      where: {
        classroomId,
        levelId,
        status: 'WAITING',
      },
      include: {
        members: {
          include: {
            student: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (team) {
      // Check if student is already in the team
      const isAlreadyMember = team.members.some((m) => m.studentId === studentId)

      if (!isAlreadyMember) {
        // Add to team
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            studentId,
          },
        })

        // Fetch team again with updated members
        team = await prisma.team.findUnique({
          where: { id: team.id },
          include: {
            members: {
              include: {
                student: {
                  select: { name: true },
                },
              },
            },
          },
        })
      }
    } else {
      // Create new team
      team = await prisma.team.create({
        data: {
          classroomId,
          levelId,
          status: 'WAITING',
          currentStep: 0,
          members: {
            create: {
              studentId,
            },
          },
        },
        include: {
          members: {
            include: {
              student: {
                select: { name: true },
              },
            },
          },
        },
      })
    }

    if (!team) {
      return NextResponse.json({ error: 'Gagal membuat/mencari tim' }, { status: 500 })
    }

    // 3. If team has reached 3 members, set status to PLAYING
    if (team.members.length >= 3 && team.status === 'WAITING') {
      const updatedTeam = await prisma.team.update({
        where: { id: team.id },
        data: { status: 'PLAYING' },
        include: {
          members: {
            include: {
              student: {
                select: { name: true },
              },
            },
          },
        },
      })
      team = updatedTeam
    }

    return NextResponse.json({
      teamId: team.id,
      status: team.status,
      members: team.members.map((m) => ({
        id: m.studentId,
        name: m.student.name,
      })),
    })
  } catch (error) {
    console.error('Matchmaking error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
