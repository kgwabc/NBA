import { dbAll, dbRun } from "../lib/db";
import { cardSeeds } from "../lib/cardData";

async function main() {
  const existing = await dbAll<{ name: string; team_slug: string }>(
    "SELECT name, team_slug FROM cards"
  );
  const existingKeys = new Set(existing.map((c) => `${c.name}|${c.team_slug}`));

  let inserted = 0;
  for (const card of cardSeeds) {
    const key = `${card.name}|${card.teamSlug}`;
    if (existingKeys.has(key)) continue;
    await dbRun(
      `INSERT INTO cards (name, team_slug, position, rarity, off_rating, def_rating, salary, synergy_tags, flavor_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.name,
        card.teamSlug,
        card.position,
        card.rarity,
        card.off,
        card.def,
        card.salary,
        JSON.stringify(card.synergyTags),
        card.flavorText,
      ]
    );
    inserted++;
  }

  console.log(`시드 완료: 신규 ${inserted}장 삽입, 기존 ${existingKeys.size}장 스킵 (총 ${cardSeeds.length}장 정의됨).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("카드 시드 실패:", err);
  process.exit(1);
});
