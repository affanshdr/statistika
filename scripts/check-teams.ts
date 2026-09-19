import { prisma } from '../lib/prisma'

async function main() {
  // 1. Find the Testing classroom
  const classrooms = await prisma.classroom.findMany({
    where: { name: { contains: 'Testing', mode: 'insensitive' } },
    include: {
      students: {
        include: {
          teamMembers: {
            include: {
              team: {
                select: { id: true, status: true, levelId: true, currentStep: true }
              }
            }
          }
        }
      },
      teams: {
        include: {
          members: {
            include: {
              student: { select: { name: true, id: true } }
            }
          }
        }
      }
    }
  })

  if (classrooms.length === 0) {
    console.log('❌ Tidak ada kelas dengan nama "Testing"')
    // Show all classrooms
    const all = await prisma.classroom.findMany({ select: { id: true, name: true } })
    console.log('Daftar semua kelas:', all)
    return
  }

  for (const cls of classrooms) {
    console.log(`\n📚 Kelas: ${cls.name} (${cls.id})`)
    console.log(`  Total siswa: ${cls.students.length}`)

    console.log(`\n  👥 Siswa:`)
    for (const s of cls.students) {
      const teamInfo = s.teamMembers.map(tm => `Tim ${tm.team.id.slice(0,8)} [${tm.team.status}]`).join(', ')
      console.log(`    - ${s.name} → ${teamInfo || '(belum di tim mana pun)'}`)
    }

    console.log(`\n  🏗️  Tim di kelas ini (${cls.teams.length} tim):`)
    for (const t of cls.teams) {
      console.log(`    Tim ${t.id.slice(0,8)} | Level ${t.levelId} | ${t.status} | ${t.members.length} anggota`)
      for (const m of t.members) {
        console.log(`      - ${m.student.name} (${m.student.id.slice(0,8)})`)
      }
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
