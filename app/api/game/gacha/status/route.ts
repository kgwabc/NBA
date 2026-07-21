import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { PACK_TYPES, ensureUserCurrency, nextFreePackAt } from "@/lib/gacha";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const wallet = await ensureUserCurrency(session.userId);

  return NextResponse.json({
    balance: wallet.balance,
    nextFreePackAt: nextFreePackAt(wallet),
    packTypes: PACK_TYPES,
  });
}
