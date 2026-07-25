import { dbGet, dbRun, ensureUserCurrency, type Card } from "./db";
import { duplicateRefund } from "./cardValue";

export type GrantResult = { duplicate: boolean; currencyAwarded: number };

// Enforces the one-copy-per-player rule: if the user already owns this card, credit
// half its rarity value as currency instead of handing out a second copy.
export async function grantOrRefund(
  userId: number,
  card: Card,
  acquiredVia: "pack" | "fusion" | "admin"
): Promise<GrantResult> {
  const owned = await dbGet<{ id: number }>("SELECT id FROM user_cards WHERE user_id = ? AND card_id = ?", [
    userId,
    card.id,
  ]);

  if (owned) {
    const refund = duplicateRefund(card.rarity);
    await ensureUserCurrency(userId);
    await dbRun("UPDATE user_currency SET balance = balance + ?, updated_at = datetime('now') WHERE user_id = ?", [
      refund,
      userId,
    ]);
    return { duplicate: true, currencyAwarded: refund };
  }

  await dbRun("INSERT INTO user_cards (user_id, card_id, acquired_via) VALUES (?, ?, ?)", [
    userId,
    card.id,
    acquiredVia,
  ]);
  return { duplicate: false, currencyAwarded: 0 };
}
