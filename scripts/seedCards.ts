import { dbAll, dbRun } from "../lib/db";
import { cardSeeds } from "../lib/cardData";

async function main() {
  const existing = await dbAll<{ name: string }>("SELECT name FROM cards");
  // 이름만으로 매칭한다 — 관리자 패널에서 소속팀 등을 수정할 수 있게 되어 있어
  // (name, team_slug) 조합으로 매칭하면 팀이 바뀐 카드가 중복 삽입될 수 있다.
  const existingNames = new Set(existing.map((c) => c.name));

  let inserted = 0;
  let updated = 0;
  for (const card of cardSeeds) {
    if (existingNames.has(card.name)) {
      // 이미 존재하는 카드는 스탯을 건드리지 않고 image_url만 최신화한다 (재배포 시 사진만 채워넣기 위함).
      if (card.imageUrl) {
        await dbRun("UPDATE cards SET image_url = ? WHERE name = ?", [card.imageUrl, card.name]);
        updated++;
      }
      continue;
    }
    await dbRun(
      `INSERT INTO cards (name, team_slug, position, rarity, off_rating, def_rating, salary, synergy_tags, flavor_text, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        card.imageUrl ?? null,
      ]
    );
    inserted++;
  }

  console.log(
    `시드 완료: 신규 ${inserted}장 삽입, 기존 카드 중 ${updated}장 image_url 갱신 (총 ${cardSeeds.length}장 정의됨).`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("카드 시드 실패:", err);
  process.exit(1);
});
