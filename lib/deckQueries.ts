import { dbAll, dbGet, type Card, type CardPosition, type Deck, type DeckSlot } from "./db";
import { validateDeck } from "./deckValidation";

export type DeckWithSlots = Deck & {
  slots: (DeckSlot & { card: Card })[];
};

export async function loadDecksForUser(userId: number): Promise<DeckWithSlots[]> {
  const decks = await dbAll<Deck>("SELECT * FROM decks WHERE user_id = ? ORDER BY id DESC", [userId]);
  const result: DeckWithSlots[] = [];
  for (const deck of decks) {
    result.push({ ...deck, slots: await loadSlotsForDeck(deck.id) });
  }
  return result;
}

export async function loadSlotsForDeck(deckId: number): Promise<(DeckSlot & { card: Card })[]> {
  const rows = await dbAll<Card & { slot_id: number; deck_id: number; user_card_id: number; slot_position: string }>(
    `SELECT ds.id AS slot_id, ds.deck_id, ds.position AS slot_position, ds.user_card_id, c.*
     FROM deck_slots ds
     JOIN user_cards uc ON uc.id = ds.user_card_id
     JOIN cards c ON c.id = uc.card_id
     WHERE ds.deck_id = ?`,
    [deckId]
  );
  return rows.map((row) => ({
    id: row.slot_id,
    deck_id: row.deck_id,
    position: row.slot_position as CardPosition,
    user_card_id: row.user_card_id,
    card: row,
  }));
}

export async function validateAndFetchSlots(
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

  const validation = validateDeck(resolvedSlots.map((s) => ({ position: s.position, card: s.card })));
  return { resolvedSlots, validation } as const;
}
