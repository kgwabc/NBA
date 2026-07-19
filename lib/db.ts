import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function createConnection() {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "app.db");
  const db = new Database(dbPath);
  // Next.js build spawns several worker processes that open this file concurrently;
  // wait for the lock instead of throwing SQLITE_BUSY when the file doesn't exist yet.
  db.pragma("busy_timeout = 5000");
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

// Reuse the connection across hot reloads in dev instead of opening a new one per request.
export const db = global.__db ?? (global.__db = createConnection());

export type User = {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
};

export type ChatMessage = {
  id: number;
  username: string;
  content: string;
  created_at: string;
};
