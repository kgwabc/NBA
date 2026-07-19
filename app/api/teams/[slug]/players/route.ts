import { NextRequest, NextResponse } from "next/server";
import { getTeamBySlug } from "@/lib/nbaTeams";
import { getPlayersByAbbreviation, NbaApiError } from "@/lib/nbaApi";

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
  } catch (error) {
    if (error instanceof NbaApiError && error.status === 429) {
      return NextResponse.json(
        { error: "요청이 많아 선수 정보를 잠시 불러올 수 없습니다. 1분 후 다시 시도해주세요." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "선수 정보를 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}
