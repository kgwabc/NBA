import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbAll, type Card } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const userId = Number(request.nextUrl.searchParams.get("userId"));
  if (!userId) return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });

  const cards = await dbAll<Card & { owned_count: number }>(
    `SELECT c.*, COUNT(uc.id) AS owned_count
     FROM user_cards uc
     JOIN cards c ON c.id = uc.card_id
     WHERE uc.user_id = ?
     GROUP BY c.id
     ORDER BY c.rarity DESC, c.name ASC`,
    [userId]
  );

  return NextResponse.json({ cards });
}
