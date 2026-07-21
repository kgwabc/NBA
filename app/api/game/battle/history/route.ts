import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbAll, type BattleHistoryRow } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const history = await dbAll<BattleHistoryRow>(
    "SELECT * FROM battle_history WHERE user_id = ? ORDER BY id DESC LIMIT 20",
    [session.userId]
  );

  return NextResponse.json({ history });
}
