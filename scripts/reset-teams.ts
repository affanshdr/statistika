import { prisma } from '../lib/prisma'
async function run() {
  const updated = await prisma.team.updateMany({
    where: { status: 'PLAYING' },
    data: { status: 'WAITING', readyVotes: {} }
  })
  console.log('Reset', updated.count, 'tim ke WAITING')
  await prisma.$disconnect()
}
run()
