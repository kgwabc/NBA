import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbAll, dbGet, dbRun, type Card } from "@/lib/db";
import { FUSION_TARGETS } from "@/lib/cardData";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const cardId = typeof body?.cardId === "number" ? body.cardId : null;
  if (!cardId) return NextResponse.json({ error: "cardId가 필요합니다." }, { status: 400 });

  const card = await dbGet<Card>("SELECT * FROM cards WHERE id = ?", [cardId]);
  if (!card || card.rarity !== "BRONZE") {
    return NextResponse.json({ error: "브론즈 카드만 합성할 수 있습니다." }, { status: 400 });
  }

  const targetName = FUSION_TARGETS[card.name];
  if (!targetName) {
    return NextResponse.json({ error: "이 카드는 합성 대상이 아닙니다." }, { status: 400 });
  }

  const owned = await dbAll<{ id: number }>(
    "SELECT id FROM user_cards WHERE user_id = ? AND card_id = ? ORDER BY id LIMIT 3",
    [session.userId, cardId]
  );
  if (owned.length < 3) {
    return NextResponse.json({ error: "합성하려면 동일한 브론즈 카드가 3장 이상 필요합니다." }, { status: 400 });
  }

  const targetCard = await dbGet<Card>("SELECT * FROM cards WHERE name = ?", [targetName]);
  if (!targetCard) {
    return NextResponse.json({ error: "합성 대상 카드를 찾을 수 없습니다." }, { status: 500 });
  }

  for (const row of owned) {
    await dbRun("DELETE FROM user_cards WHERE id = ?", [row.id]);
  }
  await dbRun("INSERT INTO user_cards (user_id, card_id, acquired_via) VALUES (?, ?, 'fusion')", [
    session.userId,
    targetCard.id,
  ]);

  return NextResponse.json({ resultCard: targetCard });
}
