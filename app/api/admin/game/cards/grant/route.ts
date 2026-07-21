import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbGet, dbRun, type Card } from "@/lib/db";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "number" ? body.userId : null;
  const cardId = typeof body?.cardId === "number" ? body.cardId : null;
  if (!userId || !cardId) return NextResponse.json({ error: "userId와 cardId가 필요합니다." }, { status: 400 });

  const card = await dbGet<Card>("SELECT * FROM cards WHERE id = ?", [cardId]);
  if (!card) return NextResponse.json({ error: "존재하지 않는 카드입니다." }, { status: 404 });

  await dbRun("INSERT INTO user_cards (user_id, card_id, acquired_via) VALUES (?, ?, 'admin')", [userId, cardId]);

  return NextResponse.json({ success: true });
}
