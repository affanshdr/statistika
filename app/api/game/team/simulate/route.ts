import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { teamId } = body

    if (!teamId) {
      return NextResponse.json({ error: 'teamId wajib disertakan' }, { status: 400 })
    }

    // 1. Fetch team and classroom
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    })

    if (!team) {
      return NextResponse.json({ error: 'Tim tidak ditemukan' }, { status: 404 })
    }

    const currentMemberIds = team.members.map((m) => m.studentId)
    const needed = 3 - team.members.length

    if (needed <= 0) {
      return NextResponse.json({ success: true, message: 'Tim sudah lengkap' })
    }

    // 2. Find other students in the same classroom who are not already in the team
    let otherStudents = await prisma.student.findMany({
      where: {
        classroomId: team.classroomId,
        id: { notIn: currentMemberIds },
      },
      take: needed,
    })

    // 3. If there are not enough students, create dummy ones
    const missingCount = needed - otherStudents.length
    if (missingCount > 0) {
      const dummyNames = ['Rian (Simulasi)', 'Siti (Simulasi)']
      for (let i = 0; i < missingCount; i++) {
        const name = dummyNames[i] || `Teammate ${i + 1} (Simulasi)`
        const randomNisn = Math.floor(1000000000 + Math.random() * 9000000000).toString()

        const newDummy = await prisma.student.create({
          data: {
            name,
            nisn: randomNisn,
            classroomId: team.classroomId,
            geftStatus: 'completed',
          },
        })
        otherStudents.push(newDummy)
      }
    }

    // 4. Add the students to the team
    for (const student of otherStudents) {
      await prisma.teamMember.create({
        data: {
          teamId,
          studentId: student.id,
        },
      })
    }

    // 5. Update team status to PLAYING
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
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

    return NextResponse.json({
      success: true,
      status: updatedTeam.status,
      members: updatedTeam.members.map((m) => ({
        id: m.studentId,
        name: m.student.name,
      })),
    })
  } catch (error) {
    console.error('Simulate teammates error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
