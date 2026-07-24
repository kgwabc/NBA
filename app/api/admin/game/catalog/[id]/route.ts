import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbGet, dbRun, type Card, type CardRarity } from "@/lib/db";
import { nbaTeams } from "@/lib/nbaTeams";

const VALID_RARITIES: CardRarity[] = ["BRONZE", "SILVER", "GOLD", "LEGEND"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const { id } = await params;
  const cardId = Number(id);
  const existing = await dbGet<Card>("SELECT * FROM cards WHERE id = ?", [cardId]);
  if (!existing) return NextResponse.json({ error: "존재하지 않는 카드입니다." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const offRating = body?.offRating;
  const defRating = body?.defRating;
  const salary = body?.salary;
  const teamSlug = body?.teamSlug;
  const rarity = body?.rarity;

  if (offRating !== undefined && (!Number.isInteger(offRating) || offRating < 0 || offRating > 99)) {
    return NextResponse.json({ error: "OFF는 0~99 사이의 정수여야 합니다." }, { status: 400 });
  }
  if (defRating !== undefined && (!Number.isInteger(defRating) || defRating < 0 || defRating > 99)) {
    return NextResponse.json({ error: "DEF는 0~99 사이의 정수여야 합니다." }, { status: 400 });
  }
  if (salary !== undefined && (!Number.isInteger(salary) || salary < 0)) {
    return NextResponse.json({ error: "연봉은 0 이상의 정수여야 합니다." }, { status: 400 });
  }
  if (teamSlug !== undefined && !nbaTeams.some((t) => t.slug === teamSlug)) {
    return NextResponse.json({ error: "존재하지 않는 팀입니다." }, { status: 400 });
  }
  if (rarity !== undefined && !VALID_RARITIES.includes(rarity)) {
    return NextResponse.json({ error: "잘못된 등급입니다." }, { status: 400 });
  }

  const updated: Card = {
    ...existing,
    off_rating: offRating ?? existing.off_rating,
    def_rating: defRating ?? existing.def_rating,
    salary: salary ?? existing.salary,
    team_slug: teamSlug ?? existing.team_slug,
    rarity: rarity ?? existing.rarity,
  };

  await dbRun(
    "UPDATE cards SET off_rating = ?, def_rating = ?, salary = ?, team_slug = ?, rarity = ? WHERE id = ?",
    [updated.off_rating, updated.def_rating, updated.salary, updated.team_slug, updated.rarity, cardId]
  );

  return NextResponse.json({ card: updated });
}
