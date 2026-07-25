import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbAll, type Card } from "@/lib/db";
import { applyEnhancement } from "@/lib/enhancementRules";

export type CollectionEntry = Card & { owned_count: number; sample_user_card_id: number; enhancement_level: number };

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rows = await dbAll<Card & { owned_count: number; sample_user_card_id: number; enhancement_level: number }>(
    `SELECT c.*, COUNT(uc.id) AS owned_count, MIN(uc.id) AS sample_user_card_id, MAX(uc.enhancement_level) AS enhancement_level
     FROM user_cards uc
     JOIN cards c ON c.id = uc.card_id
     WHERE uc.user_id = ?
     GROUP BY c.id
     ORDER BY c.rarity DESC, c.name ASC`,
    [session.userId]
  );

  const cards: CollectionEntry[] = rows.map((row) => ({
    ...applyEnhancement(row, row.enhancement_level),
    owned_count: row.owned_count,
    sample_user_card_id: row.sample_user_card_id,
    enhancement_level: row.enhancement_level,
  }));

  return NextResponse.json({ cards });
}
