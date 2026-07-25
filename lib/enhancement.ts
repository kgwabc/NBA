import { dbGet, dbRun, ensureUserCurrency, type Card, type CardRarity } from "./db";
import { applyEnhancement, enhancementCost, enhancementSuccessChance, MAX_ENHANCEMENT_LEVEL } from "./enhancementRules";

export class EnhancementError extends Error {}

type OwnedCardRow = Card & { user_card_owner: number; enhancement_level: number };

export async function enhanceCard(
  userId: number,
  userCardId: number
): Promise<{ success: boolean; newLevel: number; cost: number; card: Card }> {
  const row = await dbGet<OwnedCardRow>(
    `SELECT c.*, uc.user_id AS user_card_owner, uc.enhancement_level AS enhancement_level
     FROM user_cards uc
     JOIN cards c ON c.id = uc.card_id
     WHERE uc.id = ?`,
    [userCardId]
  );
  if (!row || row.user_card_owner !== userId) {
    throw new EnhancementError("본인이 보유하지 않은 카드입니다.");
  }

  const currentLevel = row.enhancement_level;
  if (currentLevel >= MAX_ENHANCEMENT_LEVEL) {
    throw new EnhancementError("이미 최대 레벨입니다.");
  }

  const rarity = row.rarity as CardRarity;
  const cost = enhancementCost(rarity, currentLevel);
  const wallet = await ensureUserCurrency(userId);
  if (wallet.balance < cost) {
    throw new EnhancementError("재화가 부족합니다.");
  }

  await dbRun("UPDATE user_currency SET balance = balance - ?, updated_at = datetime('now') WHERE user_id = ?", [
    cost,
    userId,
  ]);

  const success = Math.random() < enhancementSuccessChance(currentLevel);
  const newLevel = success ? currentLevel + 1 : Math.max(0, currentLevel - 1);
  await dbRun("UPDATE user_cards SET enhancement_level = ? WHERE id = ?", [newLevel, userCardId]);

  return { success, newLevel, cost, card: applyEnhancement(row, newLevel) };
}
