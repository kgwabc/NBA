import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbGet, dbAll, dbRun, type Card, type CardPosition, type CardRarity } from "@/lib/db";
import { nbaTeams } from "@/lib/nbaTeams";

const VALID_RARITIES: CardRarity[] = ["BRONZE", "SILVER", "GOLD", "LEGEND"];
const VALID_POSITIONS: CardPosition[] = ["PG", "SG", "SF", "PF", "C"];

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const cards = await dbAll<Card>("SELECT * FROM cards ORDER BY rarity DESC, name ASC");
  return NextResponse.json({ cards });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });

  const body = await request.json().catch(() => null);
  const name = body?.name;
  const teamSlug = body?.teamSlug;
  const position = body?.position;
  const rarity = body?.rarity;
  const offRating = body?.offRating;
  const defRating = body?.defRating;
  const salary = body?.salary;
  const synergyTags = body?.synergyTags;
  const flavorText = body?.flavorText ?? null;
  const imageUrl = body?.imageUrl ?? null;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "카드 이름을 입력해주세요." }, { status: 400 });
  }
  if (typeof teamSlug !== "string" || !nbaTeams.some((t) => t.slug === teamSlug)) {
    return NextResponse.json({ error: "존재하지 않는 팀입니다." }, { status: 400 });
  }
  if (!VALID_POSITIONS.includes(position)) {
    return NextResponse.json({ error: "잘못된 포지션입니다." }, { status: 400 });
  }
  if (!VALID_RARITIES.includes(rarity)) {
    return NextResponse.json({ error: "잘못된 등급입니다." }, { status: 400 });
  }
  if (!Number.isInteger(offRating) || offRating < 0 || offRating > 99) {
    return NextResponse.json({ error: "OFF는 0~99 사이의 정수여야 합니다." }, { status: 400 });
  }
  if (!Number.isInteger(defRating) || defRating < 0 || defRating > 99) {
    return NextResponse.json({ error: "DEF는 0~99 사이의 정수여야 합니다." }, { status: 400 });
  }
  if (!Number.isInteger(salary) || salary < 0) {
    return NextResponse.json({ error: "연봉은 0 이상의 정수여야 합니다." }, { status: 400 });
  }
  if (synergyTags !== undefined && !Array.isArray(synergyTags)) {
    return NextResponse.json({ error: "시너지 태그 형식이 잘못되었습니다." }, { status: 400 });
  }

  const trimmedName = name.trim();
  const existing = await dbGet<{ id: number }>("SELECT id FROM cards WHERE name = ?", [trimmedName]);
  if (existing) {
    return NextResponse.json({ error: "동일한 이름의 카드가 이미 존재합니다." }, { status: 400 });
  }

  const { lastInsertRowid } = await dbRun(
    `INSERT INTO cards (name, team_slug, position, rarity, off_rating, def_rating, salary, synergy_tags, flavor_text, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trimmedName,
      teamSlug,
      position,
      rarity,
      offRating,
      defRating,
      salary,
      JSON.stringify(synergyTags ?? []),
      flavorText,
      imageUrl,
    ]
  );

  const card = await dbGet<Card>("SELECT * FROM cards WHERE id = ?", [lastInsertRowid]);
  return NextResponse.json({ card });
}
