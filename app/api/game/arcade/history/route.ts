import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getRecentArcadeMatches } from "@/lib/arcade/matchQueries";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const matches = await getRecentArcadeMatches(session.userId, 20);
  return NextResponse.json({ matches });
}
