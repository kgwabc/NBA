import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { loadRosterForUser, validateAndSaveRoster } from "@/lib/rosterQueries";
import type { CardPosition } from "@/lib/db";
import { REQUIRED_POSITIONS } from "@/lib/rosterValidation";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const slots = await loadRosterForUser(session.userId);
  return NextResponse.json({ slots });
}

export async function PUT(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const slotsInput = body?.slots as { position: CardPosition; userCardId: number }[] | undefined;

  if (
    !Array.isArray(slotsInput) ||
    slotsInput.some(
      (s) => !REQUIRED_POSITIONS.includes(s.position) || typeof s.userCardId !== "number"
    )
  ) {
    return NextResponse.json({ error: "잘못된 로스터 데이터입니다." }, { status: 400 });
  }

  const result = await validateAndSaveRoster(session.userId, slotsInput);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  if (!result.validation.valid) {
    return NextResponse.json({ error: result.validation.errors.join(" "), errors: result.validation.errors }, { status: 400 });
  }

  const slots = await loadRosterForUser(session.userId);
  return NextResponse.json({ slots });
}
