import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { recordArcadeMatch } from "@/lib/arcade/matchQueries";
import type { ArcadeMatchMode, ArcadeMatchResult } from "@/lib/db";

const VALID_MODES: ArcadeMatchMode[] = ["vs_ai", "local_2p"];
const VALID_RESULTS: ArcadeMatchResult[] = ["win", "loss", "draw", "p1_win", "p2_win"];

function toIdArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const ids = value.map((v) => Number(v));
  if (ids.some((n) => !Number.isFinite(n))) return null;
  return ids;
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const mode = body.mode as ArcadeMatchMode;
  const result = body.result as ArcadeMatchResult;
  const homeCardIds = toIdArray(body.homeCardIds);
  const awayCardIds = toIdArray(body.awayCardIds);
  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);

  if (
    !VALID_MODES.includes(mode) ||
    !VALID_RESULTS.includes(result) ||
    !homeCardIds ||
    !awayCardIds ||
    !Number.isFinite(homeScore) ||
    !Number.isFinite(awayScore)
  ) {
    return NextResponse.json({ error: "매치 데이터가 올바르지 않습니다." }, { status: 400 });
  }

  const id = await recordArcadeMatch({
    userId: session.userId,
    mode,
    homeCardIds,
    awayCardIds,
    homeScore: Math.round(homeScore),
    awayScore: Math.round(awayScore),
    result,
  });

  return NextResponse.json({ id });
}
