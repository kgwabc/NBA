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
      await db.execute(`
        CREATE TABLE IF NOT EXISTS cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          team_slug TEXT NOT NULL,
          position TEXT NOT NULL,
          rarity TEXT NOT NULL,
          off_rating INTEGER NOT NULL,
          def_rating INTEGER NOT NULL,
          salary INTEGER NOT NULL,
          synergy_tags TEXT NOT NULL DEFAULT '[]',
          flavor_text TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS user_cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          card_id INTEGER NOT NULL REFERENCES cards(id),
          acquired_via TEXT NOT NULL DEFAULT 'pack',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS user_currency (
          user_id INTEGER PRIMARY KEY REFERENCES users(id),
          balance INTEGER NOT NULL DEFAULT 0,
          last_free_pack_at TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS decks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          name TEXT NOT NULL DEFAULT '내 덱',
          is_active INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS deck_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          deck_id INTEGER NOT NULL REFERENCES decks(id),
          position TEXT NOT NULL,
          user_card_id INTEGER NOT NULL REFERENCES user_cards(id)
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS pack_openings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          pack_type TEXT NOT NULL,
          cost INTEGER NOT NULL DEFAULT 0,
          result_card_id INTEGER NOT NULL REFERENCES cards(id),
          result_rarity TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS battle_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          deck_id INTEGER NOT NULL REFERENCES decks(id),
          opponent_bot TEXT NOT NULL,
          user_score INTEGER NOT NULL,
          opponent_score INTEGER NOT NULL,
          result TEXT NOT NULL,
          reward_currency INTEGER NOT NULL DEFAULT 0,
          events_json TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_user_cards_user ON user_cards(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_user_cards_card ON user_cards(card_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_deck_slots_deck ON deck_slots(deck_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_decks_user ON decks(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_pack_openings_user ON pack_openings(user_id, created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_battle_history_user ON battle_history(user_id, created_at);`);
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

export type CardRarity = "BRONZE" | "SILVER" | "GOLD" | "LEGEND";
export type CardPosition = "PG" | "SG" | "SF" | "PF" | "C";

export type Card = {
  id: number;
  name: string;
  team_slug: string;
  position: CardPosition;
  rarity: CardRarity;
  off_rating: number;
  def_rating: number;
  salary: number;
  synergy_tags: string;
  flavor_text: string | null;
  created_at: string;
};

export type UserCard = {
  id: number;
  user_id: number;
  card_id: number;
  acquired_via: "pack" | "fusion" | "admin";
  created_at: string;
};

export type UserCurrency = {
  user_id: number;
  balance: number;
  last_free_pack_at: string | null;
  updated_at: string;
};

export type Deck = {
  id: number;
  user_id: number;
  name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type DeckSlot = {
  id: number;
  deck_id: number;
  position: CardPosition;
  user_card_id: number;
};

export type PackOpening = {
  id: number;
  user_id: number;
  pack_type: string;
  cost: number;
  result_card_id: number;
  result_rarity: CardRarity;
  created_at: string;
};

export type BattleHistoryRow = {
  id: number;
  user_id: number;
  deck_id: number;
  opponent_bot: string;
  user_score: number;
  opponent_score: number;
  result: "win" | "loss" | "draw";
  reward_currency: number;
  events_json: string;
  created_at: string;
};
