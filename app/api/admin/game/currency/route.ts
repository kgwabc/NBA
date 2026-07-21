import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbRun } from "@/lib/db";
import { ensureUserCurrency } from "@/lib/gacha";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "number" ? body.userId : null;
  const delta = typeof body?.delta === "number" ? body.delta : null;
  if (!userId || delta === null || !Number.isFinite(delta)) {
    return NextResponse.json({ error: "userId와 delta가 필요합니다." }, { status: 400 });
  }

  const wallet = await ensureUserCurrency(userId);
  const newBalance = Math.max(0, wallet.balance + delta);
  await dbRun("UPDATE user_currency SET balance = ?, updated_at = datetime('now') WHERE user_id = ?", [
    newBalance,
    userId,
  ]);

  return NextResponse.json({ balance: newBalance });
}
