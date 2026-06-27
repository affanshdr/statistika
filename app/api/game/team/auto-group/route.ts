import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/game/team/auto-group
 * Groups ALL FD students in the same classroom into teams of 3,
 * regardless of whether they're currently online.
 * Returns the team of the requesting student.
 */
export async function POST(req: NextRequest) {
  try {
    const { studentId, levelId = 1 } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: 'studentId wajib' }, { status: 400 })
    }

    // Get requesting student's classroom
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classroomId: true, name: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    const { classroomId } = student

    // Get ALL FD students in this classroom
    const allFdStudents = await prisma.student.findMany({
      where: {
        classroomId,
        geftResult: { cognitiveStyle: 'FD' },
      },
      select: { id: true, name: true },
    })

    if (allFdStudents.length === 0) {
      return NextResponse.json({ error: 'Tidak ada siswa FD di kelas ini' }, { status: 404 })
    }

    // Get IDs of students already in an active team (WAITING or PLAYING)
    const activeMemberships = await prisma.teamMember.findMany({
      where: {
        studentId: { in: allFdStudents.map((s) => s.id) },
        team: {
          classroomId,
          levelId,
          status: { in: ['WAITING', 'PLAYING'] },
        },
      },
      select: { studentId: true },
    })
    const alreadyGrouped = new Set(activeMemberships.map((m) => m.studentId))

    // Students that still need to be grouped
    const ungrouped = allFdStudents.filter((s) => !alreadyGrouped.has(s.id))

    // Assign ungrouped students to existing WAITING teams (< 3 members) or create new ones
    for (const s of ungrouped) {
      // Re-check in case they were just added inside this loop
      const existingMembership = await prisma.teamMember.findFirst({
        where: {
          studentId: s.id,
          team: { classroomId, levelId, status: { in: ['WAITING', 'PLAYING'] } },
        },
      })
      if (existingMembership) continue

      // Find a WAITING team with fewer than 3 members
      const availableTeam = await prisma.team.findFirst({
        where: { classroomId, levelId, status: 'WAITING' },
        include: { members: true },
        orderBy: { createdAt: 'asc' },
      })

      if (availableTeam && availableTeam.members.length < 3) {
        await prisma.teamMember.create({
          data: { teamId: availableTeam.id, studentId: s.id },
        })
        // Status stays WAITING — game starts via lobby_ready votes
      } else {
        // Create a new team with this student as the first member
        await prisma.team.create({
          data: {
            classroomId,
            levelId,
            status: 'WAITING',
            currentStep: 0,
            members: { create: { studentId: s.id } },
          },
        })
      }
    }

    // Return the requesting student's team
    const membership = await prisma.teamMember.findFirst({
      where: {
        studentId,
        team: { classroomId, levelId, status: { in: ['WAITING', 'PLAYING'] } },
      },
      include: {
        team: {
          include: {
            classroom: { select: { name: true } },
            members: {
              include: {
                student: {
                  select: { id: true, name: true, lastSeenAt: true },
                },
              },
              orderBy: { joinedAt: 'asc' },
            },
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Gagal membuat tim' }, { status: 500 })
    }

    const team = membership.team
    const ONLINE_THRESHOLD_MS = 2 * 60 * 1000 // 2 minutes

    return NextResponse.json({
      team: {
        teamId: team.id,
        levelId: team.levelId,
        status: team.status,
        classroomName: team.classroom.name,
        members: team.members.map((m) => ({
          id: m.student.id,
          name: m.student.name,
          isOnline: m.student.lastSeenAt
            ? Date.now() - new Date(m.student.lastSeenAt).getTime() < ONLINE_THRESHOLD_MS
            : false,
        })),
      },
    })
  } catch (error) {
    console.error('Auto-group error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
