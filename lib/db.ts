import { createClient, type Client } from "@libsql/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __db: Client | undefined;
  // eslint-disable-next-line no-var
  var __dbInit: Promise<void> | undefined;
}

function createConnection(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Falls back to a local file DB when Turso env vars aren't set (local dev only —
  // this path is ephemeral on Render, so production must use TURSO_DATABASE_URL).
  if (url) {
    return createClient({ url, authToken });
  }
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return createClient({ url: `file:${path.join(dataDir, "app.db")}` });
}

// Reuse the connection (and bootstrap) across hot reloads in dev instead of redoing it per request.
const db = global.__db ?? (global.__db = createConnection());

function ensureReady(): Promise<void> {
  if (!global.__dbInit) {
    global.__dbInit = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    })();
  }
  return global.__dbInit;
}

export async function dbGet<T>(sql: string, args: unknown[] = []): Promise<T | undefined> {
  await ensureReady();
  const result = await db.execute({ sql, args: args as never[] });
  return result.rows[0] as T | undefined;
}

export async function dbAll<T>(sql: string, args: unknown[] = []): Promise<T[]> {
  await ensureReady();
  const result = await db.execute({ sql, args: args as never[] });
  return result.rows as T[];
}

export async function dbRun(sql: string, args: unknown[] = []): Promise<{ lastInsertRowid: number }> {
  await ensureReady();
  const result = await db.execute({ sql, args: args as never[] });
  return { lastInsertRowid: Number(result.lastInsertRowid ?? 0) };
}

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
