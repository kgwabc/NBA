import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbAll, type Card } from "@/lib/db";

export type CollectionEntry = Card & { owned_count: number; sample_user_card_id: number };

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const cards = await dbAll<CollectionEntry>(
    `SELECT c.*, COUNT(uc.id) AS owned_count, MIN(uc.id) AS sample_user_card_id
     FROM user_cards uc
     JOIN cards c ON c.id = uc.card_id
     WHERE uc.user_id = ?
     GROUP BY c.id
     ORDER BY c.rarity DESC, c.name ASC`,
    [session.userId]
  );

  return NextResponse.json({ cards });
}
