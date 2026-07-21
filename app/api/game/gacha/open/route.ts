import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { GachaError, PACK_TYPES, openPack, type PackType } from "@/lib/gacha";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const packType = body?.packType as PackType | undefined;
  if (!packType || !(packType in PACK_TYPES)) {
    return NextResponse.json({ error: "잘못된 팩 종류입니다." }, { status: 400 });
  }

  try {
    const result = await openPack(session.userId, packType);
    return NextResponse.json({ card: result.card, rarity: result.rarity });
  } catch (err) {
    if (err instanceof GachaError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
