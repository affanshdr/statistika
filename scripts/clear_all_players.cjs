const path = require('path');
const fs = require('fs');

// Read .env manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  const players = await prisma.player.findMany({
    include: {
      progress: true,
      gameSessions: true,
      masteries: true,
    }
  });

  console.log(`Found ${players.length} player(s) in database:`);
  for (const p of players) {
    console.log(` - [${p.id}] Username: "${p.username}", Display: "${p.displayName}", Sessions: ${p.gameSessions.length}`);
  }

  if (players.length === 0) {
    console.log('Database is already clean! No players found.');
    return;
  }

  console.log('\nDeleting all players and cascading records (progress, sessions, masteries)...');
  const deleteResult = await prisma.player.deleteMany({});
  console.log(`Successfully deleted ${deleteResult.count} player(s)!`);

  // Verify
  const remaining = await prisma.player.count();
  console.log(`Remaining players in database: ${remaining}`);
}

main()
  .catch(err => {
    console.error('Error clearing players:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
