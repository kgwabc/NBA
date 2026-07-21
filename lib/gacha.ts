import { dbGet, dbRun, type Card, type CardRarity, type UserCurrency } from "./db";

export type PackType = "free" | "basic" | "premium" | "legend";

export const PACK_TYPES: Record<PackType, { cost: number; dropRates: Record<CardRarity, number> }> = {
  free: { cost: 0, dropRates: { BRONZE: 0.7, SILVER: 0.25, GOLD: 0.045, LEGEND: 0.005 } },
  basic: { cost: 100, dropRates: { BRONZE: 0.55, SILVER: 0.32, GOLD: 0.11, LEGEND: 0.02 } },
  premium: { cost: 300, dropRates: { BRONZE: 0.3, SILVER: 0.4, GOLD: 0.25, LEGEND: 0.05 } },
  legend: { cost: 800, dropRates: { BRONZE: 0.05, SILVER: 0.25, GOLD: 0.5, LEGEND: 0.2 } },
};

const FREE_PACK_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function rollRarity(dropRates: Record<CardRarity, number>): CardRarity {
  const roll = Math.random();
  let cumulative = 0;
  const entries = Object.entries(dropRates) as [CardRarity, number][];
  for (const [rarity, rate] of entries) {
    cumulative += rate;
    if (roll < cumulative) return rarity;
  }
  return entries[entries.length - 1][0];
}

async function pickCardOfRarity(rarity: CardRarity): Promise<Card> {
  const card = await dbGet<Card>("SELECT * FROM cards WHERE rarity = ? ORDER BY RANDOM() LIMIT 1", [rarity]);
  if (!card) throw new Error(`해당 등급의 카드가 없습니다: ${rarity}`);
  return card;
}

export async function ensureUserCurrency(userId: number): Promise<UserCurrency> {
  let wallet = await dbGet<UserCurrency>("SELECT * FROM user_currency WHERE user_id = ?", [userId]);
  if (!wallet) {
    await dbRun("INSERT INTO user_currency (user_id, balance) VALUES (?, 0)", [userId]);
    wallet = await dbGet<UserCurrency>("SELECT * FROM user_currency WHERE user_id = ?", [userId]);
  }
  return wallet!;
}

export function nextFreePackAt(wallet: UserCurrency): number | null {
  if (!wallet.last_free_pack_at) return null;
  const last = new Date(wallet.last_free_pack_at.replace(" ", "T") + "Z").getTime();
  return last + FREE_PACK_COOLDOWN_MS;
}

export class GachaError extends Error {}

export async function openPack(userId: number, packType: PackType): Promise<{ card: Card; rarity: CardRarity }> {
  const pack = PACK_TYPES[packType];
  if (!pack) throw new GachaError("잘못된 팩 종류입니다.");

  const wallet = await ensureUserCurrency(userId);

  if (packType === "free") {
    const nextAt = nextFreePackAt(wallet);
    if (nextAt !== null && Date.now() < nextAt) {
      throw new GachaError("무료 팩은 아직 준비 중입니다.");
    }
    await dbRun("UPDATE user_currency SET last_free_pack_at = datetime('now'), updated_at = datetime('now') WHERE user_id = ?", [
      userId,
    ]);
  } else {
    if (wallet.balance < pack.cost) {
      throw new GachaError("재화가 부족합니다.");
    }
    await dbRun("UPDATE user_currency SET balance = balance - ?, updated_at = datetime('now') WHERE user_id = ?", [
      pack.cost,
      userId,
    ]);
  }

  const rarity = rollRarity(pack.dropRates);
  const card = await pickCardOfRarity(rarity);

  await dbRun("INSERT INTO user_cards (user_id, card_id, acquired_via) VALUES (?, ?, 'pack')", [userId, card.id]);
  await dbRun(
    "INSERT INTO pack_openings (user_id, pack_type, cost, result_card_id, result_rarity) VALUES (?, ?, ?, ?, ?)",
    [userId, packType, packType === "free" ? 0 : pack.cost, card.id, rarity]
  );

  return { card, rarity };
}
