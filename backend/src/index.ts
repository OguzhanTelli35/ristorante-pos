import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { initDatabase, getDatabase, closeDatabase } from './config/database.js';
import { runMigrations } from './db/migrations.js';
import { seedDatabase } from './db/seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import menuRoutes from './routes/menu.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import tablesRoutes from './routes/tables.routes.js';
import authRoutes from './routes/auth.routes.js';

async function main() {
  // ── Initialize Database ──
  await initDatabase();
  runMigrations();

  // Check if menu needs seeding
  const db = getDatabase();
  const menuRow = db.prepare('SELECT COUNT(*) as count FROM menu_categories').get() as { count: number } | undefined;
  const userRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number } | undefined;
  
  if (!menuRow || menuRow.count === 0 || !userRow || userRow.count === 0) {
    seedDatabase();
  }

  // ── Create Express App ──
  const app = express();

  // ── Middleware ──
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // ── Health Check ──
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Routes ──
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/tables', tablesRoutes);
  app.use('/api/auth', authRoutes);

  // ── Error Handler ──
  app.use(errorHandler);

  // ── Start Server ──
  const server = app.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🍽️  Ristorante POS — Backend Server    ║
║                                          ║
║   Port:    ${String(env.PORT).padEnd(29)}║
║   Mode:    ${env.NODE_ENV.padEnd(29)}║
║   DB:      SQLite (sql.js WASM)          ║
║                                          ║
║   API:     http://localhost:${String(env.PORT).padEnd(14)}║
╚══════════════════════════════════════════╝
    `);
  });

  // ── Graceful Shutdown ──
  function shutdown() {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      closeDatabase();
      console.log('Server closed.');
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
