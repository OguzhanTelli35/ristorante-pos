import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { env } from './env.js';

// ── Compatibility wrapper ──
// Provides a better-sqlite3-like API over sql.js so service code stays clean.

export interface PreparedStatement {
  all(...params: unknown[]): Record<string, unknown>[];
  get(...params: unknown[]): Record<string, unknown> | undefined;
  run(...params: unknown[]): { changes: number };
}

export interface WrappedDatabase {
  prepare(sql: string): PreparedStatement;
  exec(sql: string): void;
  transaction<T>(fn: () => T): () => T;
  pragma(str: string): void;
  close(): void;
}

let db: WrappedDatabase | null = null;
let rawDb: SqlJsDatabase | null = null;
let dbPath: string = '';
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (rawDb && dbPath) {
      const data = rawDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    }
  }, 100);
}

function saveNow() {
  if (saveTimer) clearTimeout(saveTimer);
  if (rawDb && dbPath) {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function wrapDatabase(sqlDb: SqlJsDatabase, filePath: string): WrappedDatabase {
  rawDb = sqlDb;
  dbPath = filePath;

  return {
    prepare(sql: string): PreparedStatement {
      return {
        all(...params: unknown[]): Record<string, unknown>[] {
          const stmt = sqlDb.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
          }
          const results: Record<string, unknown>[] = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject() as Record<string, unknown>);
          }
          stmt.free();
          return results;
        },

        get(...params: unknown[]): Record<string, unknown> | undefined {
          const stmt = sqlDb.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
          }
          let result: Record<string, unknown> | undefined;
          if (stmt.step()) {
            result = stmt.getAsObject() as Record<string, unknown>;
          }
          stmt.free();
          return result;
        },

        run(...params: unknown[]): { changes: number } {
          sqlDb.run(sql, params.length === 1 && Array.isArray(params[0]) ? params[0] : params);
          scheduleSave();
          return { changes: sqlDb.getRowsModified() };
        },
      };
    },

    exec(sql: string): void {
      sqlDb.exec(sql);
      scheduleSave();
    },

    transaction<T>(fn: () => T): () => T {
      return () => {
        sqlDb.exec('BEGIN TRANSACTION');
        try {
          const result = fn();
          sqlDb.exec('COMMIT');
          saveNow();
          return result;
        } catch (err) {
          sqlDb.exec('ROLLBACK');
          throw err;
        }
      };
    },

    pragma(_str: string): void {
      // sql.js doesn't need WAL mode or foreign key pragmas in the same way
      // Foreign keys are enabled by default in sql.js
    },

    close(): void {
      saveNow();
      sqlDb.close();
    },
  };
}

let initPromise: Promise<WrappedDatabase> | null = null;

export async function initDatabase(): Promise<WrappedDatabase> {
  if (db) return db;

  if (!initPromise) {
    initPromise = (async () => {
      const SQL = await initSqlJs();
      const resolvedPath = path.resolve(env.DATABASE_URL);

      let sqlDb: SqlJsDatabase;
      if (fs.existsSync(resolvedPath)) {
        const buffer = fs.readFileSync(resolvedPath);
        sqlDb = new SQL.Database(buffer);
      } else {
        sqlDb = new SQL.Database();
        // Ensure directory exists
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      db = wrapDatabase(sqlDb, resolvedPath);
      return db;
    })();
  }

  return initPromise;
}

export function getDatabase(): WrappedDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    rawDb = null;
    initPromise = null;
  }
}
