import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { setUserFavoriteTeam } from "@/lib/db";
import { getTeamBySlug } from "@/lib/nbaTeams";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const teamSlug = typeof body?.teamSlug === "string" ? body.teamSlug : "";
  const team = getTeamBySlug(teamSlug);
  if (!team) {
    return NextResponse.json({ error: "올바르지 않은 팀입니다." }, { status: 400 });
  }

  await setUserFavoriteTeam(session.userId, team.slug);
  return NextResponse.json({ favoriteTeamSlug: team.slug });
}
