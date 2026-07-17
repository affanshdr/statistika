import { prisma } from '../lib/prisma'

async function main() {
  // 1. Find the Testing classroom
  const classroom = await prisma.classroom.findFirst({
    where: { name: { contains: 'Testing', mode: 'insensitive' } },
    include: { students: true }
  })

  if (!classroom) {
    console.log('❌ Tidak ada kelas dengan nama "Testing"')
    return
  }

  console.log(`🧹 Memulai penghapusan siswa untuk kelas: ${classroom.name} (${classroom.id})`)
  const studentIds = classroom.students.map(s => s.id)
  console.log(`Siswa yang terpengaruh (${studentIds.length} siswa):`, classroom.students.map(s => s.name))

  if (studentIds.length > 0) {
    // Delete Game Sessions
    const deletedSessions = await prisma.gameSession.deleteMany({
      where: { studentId: { in: studentIds } }
    })
    console.log(`- Menghapus ${deletedSessions.count} game session`)

    // Delete Leaderboard entries
    const deletedLeaderboards = await prisma.leaderboard.deleteMany({
      where: { studentId: { in: studentIds } }
    })
    console.log(`- Menghapus ${deletedLeaderboards.count} entri leaderboard`)

    // Delete GEFT Results
    const deletedGeftResults = await prisma.geftResult.deleteMany({
      where: { studentId: { in: studentIds } }
    })
    console.log(`- Menghapus ${deletedGeftResults.count} hasil GEFT`)

    // Delete Team Members
    const deletedTeamMembers = await prisma.teamMember.deleteMany({
      where: { studentId: { in: studentIds } }
    })
    console.log(`- Menghapus ${deletedTeamMembers.count} keanggotaan tim`)

    // Delete Team Messages
    const deletedMessages = await prisma.teamMessage.deleteMany({
      where: { studentId: { in: studentIds } }
    })
    console.log(`- Menghapus ${deletedMessages.count} pesan tim`)

    // Delete the students
    const deletedStudents = await prisma.student.deleteMany({
      where: { id: { in: studentIds } }
    })
    console.log(`- Menghapus ${deletedStudents.count} siswa`)
  }

  // Delete all Teams in this classroom
  const deletedTeams = await prisma.team.deleteMany({
    where: { classroomId: classroom.id }
  })
  console.log(`- Menghapus ${deletedTeams.count} tim dari kelas ini`)

  console.log('✅ Penghapusan siswa kelas "Testing" berhasil diselesaikan!')
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
