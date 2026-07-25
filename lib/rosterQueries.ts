import { dbAll, dbGet, dbRun, type Card, type CardPosition } from "./db";
import { applyEnhancement } from "./enhancementRules";
import { validateRoster } from "./rosterValidation";

export type RosterSlotWithCard = {
  position: CardPosition;
  user_card_id: number;
  card: Card;
};

// Inner-joins through user_cards so a slot pointing at a card the user no longer owns
// (e.g. burned in a fusion) simply drops out instead of erroring — the position just
// reads as empty until the player picks a replacement.
export async function loadRosterForUser(userId: number): Promise<RosterSlotWithCard[]> {
  const rows = await dbAll<Card & { slot_position: string; user_card_id: number; enhancement_level: number }>(
    `SELECT rs.position AS slot_position, rs.user_card_id, uc.enhancement_level AS enhancement_level, c.*
     FROM roster_slots rs
     JOIN user_cards uc ON uc.id = rs.user_card_id AND uc.user_id = rs.user_id
     JOIN cards c ON c.id = uc.card_id
     WHERE rs.user_id = ?`,
    [userId]
  );
  return rows.map((row) => ({
    position: row.slot_position as CardPosition,
    user_card_id: row.user_card_id,
    card: applyEnhancement(row, row.enhancement_level),
  }));
}

export async function validateAndSaveRoster(
  userId: number,
  slotsInput: { position: CardPosition; userCardId: number }[]
) {
  const resolvedSlots: { position: CardPosition; card: Card; userCardId: number }[] = [];
  for (const slot of slotsInput) {
    const row = await dbGet<Card & { user_card_owner: number }>(
      `SELECT c.*, uc.user_id AS user_card_owner
       FROM user_cards uc
       JOIN cards c ON c.id = uc.card_id
       WHERE uc.id = ?`,
      [slot.userCardId]
    );
    if (!row || row.user_card_owner !== userId) {
      return { error: "본인이 보유하지 않은 카드가 포함되어 있습니다." } as const;
    }
    resolvedSlots.push({ position: slot.position, card: row, userCardId: slot.userCardId });
  }

  const validation = validateRoster(resolvedSlots.map((s) => ({ position: s.position, card: s.card })));
  if (!validation.valid) {
    return { validation } as const;
  }

  await dbRun("DELETE FROM roster_slots WHERE user_id = ?", [userId]);
  for (const slot of resolvedSlots) {
    await dbRun("INSERT INTO roster_slots (user_id, position, user_card_id) VALUES (?, ?, ?)", [
      userId,
      slot.position,
      slot.userCardId,
    ]);
  }

  return { validation, resolvedSlots } as const;
}
