import { initDatabase, closeDatabase } from '../config/database.js';
import { runMigrations } from './migrations.js';
import { seedDatabase } from './seed.js';

async function main() {
  await initDatabase();
  runMigrations();
  seedDatabase();
  closeDatabase();
  console.log('✓ Database reset complete');
}

main().catch((err) => {
  console.error('Database reset failed:', err);
  process.exit(1);
});
