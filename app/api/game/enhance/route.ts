import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { EnhancementError, enhanceCard } from "@/lib/enhancement";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const userCardId = body?.userCardId as number | undefined;
  if (!userCardId) {
    return NextResponse.json({ error: "잘못된 카드입니다." }, { status: 400 });
  }

  try {
    const result = await enhanceCard(session.userId, userCardId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof EnhancementError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
