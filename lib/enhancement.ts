import { dbGet, dbRun, ensureUserCurrency, type Card, type CardRarity } from "./db";
import {
  applyEnhancement,
  enhancementCost,
  enhancementFailureOutcomeShares,
  enhancementSuccessChance,
  MAX_ENHANCEMENT_LEVEL,
} from "./enhancementRules";

export class EnhancementError extends Error {}

type OwnedCardRow = Card & { user_card_owner: number; enhancement_level: number };

export type EnhanceOutcome = "success" | "stay" | "downgrade" | "destroy";

function rollFailureOutcome(level: number): "stay" | "downgrade" | "destroy" {
  const shares = enhancementFailureOutcomeShares(level);
  const roll = Math.random();
  if (roll < shares.stay) return "stay";
  if (roll < shares.stay + shares.downgrade) return "downgrade";
  return "destroy";
}

export async function enhanceCard(
  userId: number,
  userCardId: number
): Promise<{ outcome: EnhanceOutcome; newLevel: number | null; cost: number; card: Card | null }> {
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
  if (success) {
    const newLevel = currentLevel + 1;
    await dbRun("UPDATE user_cards SET enhancement_level = ? WHERE id = ?", [newLevel, userCardId]);
    return { outcome: "success", newLevel, cost, card: applyEnhancement(row, newLevel) };
  }

  const outcome = rollFailureOutcome(currentLevel);
  if (outcome === "destroy") {
    // Clear any roster slot pointing at this card first — user_cards has no ON DELETE
    // clause for roster_slots.user_card_id, so deleting an equipped card without this
    // would violate the foreign key and silently fail the whole request. deck_slots is
    // a retired table from the old deck feature that never got dropped — leftover rows
    // there carry the same kind of FK and block the delete just as silently.
    await dbRun("DELETE FROM roster_slots WHERE user_card_id = ?", [userCardId]);
    await dbRun("DELETE FROM deck_slots WHERE user_card_id = ?", [userCardId]);
    await dbRun("DELETE FROM user_cards WHERE id = ?", [userCardId]);
    return { outcome, newLevel: null, cost, card: null };
  }

  const newLevel = outcome === "downgrade" ? Math.max(0, currentLevel - 1) : currentLevel;
  await dbRun("UPDATE user_cards SET enhancement_level = ? WHERE id = ?", [newLevel, userCardId]);
  return { outcome, newLevel, cost, card: applyEnhancement(row, newLevel) };
}
