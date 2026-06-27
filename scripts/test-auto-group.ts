import { prisma } from '../lib/prisma'

async function main() {
  const studentId = '9274e5a4-d100-4835-a0f9-7ed381d1c8d0' // fefef
  const levelId = 1

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classroomId: true, name: true },
  })
  if (!student) { console.log('Student not found'); return }

  const { classroomId } = student

  // Get ALL FD students
  const allFdStudents = await prisma.student.findMany({
    where: { classroomId, geftResult: { cognitiveStyle: 'FD' } },
    select: { id: true, name: true },
  })
  console.log(`\n🔍 ${allFdStudents.length} siswa FD di kelas:`, allFdStudents.map(s => s.name))

  // Get already-grouped students
  const activeMemberships = await prisma.teamMember.findMany({
    where: {
      studentId: { in: allFdStudents.map(s => s.id) },
      team: { classroomId, levelId, status: { in: ['WAITING', 'PLAYING'] } },
    },
    select: { studentId: true },
  })
  const alreadyGrouped = new Set(activeMemberships.map(m => m.studentId))
  const ungrouped = allFdStudents.filter(s => !alreadyGrouped.has(s.id))
  console.log(`\n✅ Sudah di tim:`, allFdStudents.filter(s => alreadyGrouped.has(s.id)).map(s => s.name))
  console.log(`⏳ Belum di tim:`, ungrouped.map(s => s.name))

  // Group the ungrouped ones
  for (const s of ungrouped) {
    const existingMembership = await prisma.teamMember.findFirst({
      where: { studentId: s.id, team: { classroomId, levelId, status: { in: ['WAITING', 'PLAYING'] } } },
    })
    if (existingMembership) continue

    const availableTeam = await prisma.team.findFirst({
      where: { classroomId, levelId, status: 'WAITING' },
      include: { members: true },
      orderBy: { createdAt: 'asc' },
    })

    if (availableTeam && availableTeam.members.length < 3) {
      await prisma.teamMember.create({ data: { teamId: availableTeam.id, studentId: s.id } })
      const updatedCount = availableTeam.members.length + 1
      if (updatedCount >= 3) {
        await prisma.team.update({ where: { id: availableTeam.id }, data: { status: 'PLAYING' } })
        console.log(`🎮 Tim ${availableTeam.id.slice(0,8)} → PLAYING (${updatedCount} anggota)`)
      } else {
        console.log(`➕ ${s.name} → bergabung ke tim ${availableTeam.id.slice(0,8)} (${updatedCount}/3)`)
      }
    } else {
      const newTeam = await prisma.team.create({
        data: {
          classroomId, levelId, status: 'WAITING', currentStep: 0,
          members: { create: { studentId: s.id } },
        },
      })
      console.log(`🆕 Tim baru ${newTeam.id.slice(0,8)} untuk ${s.name}`)
    }
  }

  console.log('\n--- HASIL AKHIR ---')
  const teams = await prisma.team.findMany({
    where: { classroomId, levelId },
    include: { members: { include: { student: { select: { name: true } } } } }
  })
  for (const t of teams) {
    console.log(`Tim ${t.id.slice(0,8)} [${t.status}] — ${t.members.map(m => m.student.name).join(', ')}`)
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
