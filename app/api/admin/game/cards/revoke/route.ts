import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbGet, dbRun } from "@/lib/db";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "number" ? body.userId : null;
  const cardId = typeof body?.cardId === "number" ? body.cardId : null;
  if (!userId || !cardId) return NextResponse.json({ error: "userId와 cardId가 필요합니다." }, { status: 400 });

  const owned = await dbGet<{ id: number }>(
    "SELECT id FROM user_cards WHERE user_id = ? AND card_id = ? LIMIT 1",
    [userId, cardId]
  );
  if (!owned) return NextResponse.json({ error: "해당 유저가 그 카드를 보유하고 있지 않습니다." }, { status: 400 });

  await dbRun("DELETE FROM user_cards WHERE id = ?", [owned.id]);

  return NextResponse.json({ success: true });
}
