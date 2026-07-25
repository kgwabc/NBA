// Thin DB helpers for arcade match persistence, mirroring lib/gacha.ts style
// (small functions over dbRun/dbAll). Only one write happens per match (at game end).

import { dbAll, dbRun, type ArcadeMatchMode, type ArcadeMatchResult, type ArcadeMatchRow } from "@/lib/db";

export type RecordArcadeMatchInput = {
  userId: number;
  mode: ArcadeMatchMode;
  homeCardIds: number[];
  awayCardIds: number[];
  homeScore: number;
  awayScore: number;
  result: ArcadeMatchResult;
};

export async function recordArcadeMatch(input: RecordArcadeMatchInput): Promise<number> {
  const { lastInsertRowid } = await dbRun(
    `INSERT INTO arcade_matches (user_id, mode, home_card_ids, away_card_ids, home_score, away_score, result)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.userId,
      input.mode,
      JSON.stringify(input.homeCardIds),
      JSON.stringify(input.awayCardIds),
      input.homeScore,
      input.awayScore,
      input.result,
    ]
  );
  return lastInsertRowid;
}

export async function getRecentArcadeMatches(userId: number, limit = 20): Promise<ArcadeMatchRow[]> {
  return dbAll<ArcadeMatchRow>(
    `SELECT * FROM arcade_matches WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?`,
    [userId, limit]
  );
}
