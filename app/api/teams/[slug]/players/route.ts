import { NextRequest, NextResponse } from "next/server";
import { getTeamBySlug } from "@/lib/nbaTeams";
import { getPlayersByAbbreviation } from "@/lib/nbaApi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);

  if (!team) {
    return NextResponse.json({ error: "존재하지 않는 팀입니다." }, { status: 404 });
  }

  try {
    const players = await getPlayersByAbbreviation(team.abbreviation);
    return NextResponse.json({ players });
  } catch {
    return NextResponse.json(
      { error: "선수 정보를 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}
