import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dbGet, dbRun, type Deck } from "@/lib/db";
import { loadSlotsForDeck } from "@/lib/deckQueries";
import { simulateBattle, type AggregateStats } from "@/lib/battleSim";
import { BOT_DECKS, type BotDeckId } from "@/lib/botDecks";
import { ensureUserCurrency } from "@/lib/gacha";
import { computeSynergies, applySynergies, type DeckCard } from "@/lib/synergy";

const REWARD: Record<"win" | "loss" | "draw", number> = { win: 50, draw: 20, loss: 10 };

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const opponentBot = body?.opponentBot as BotDeckId | undefined;
  if (!opponentBot || !(opponentBot in BOT_DECKS)) {
    return NextResponse.json({ error: "잘못된 상대입니다." }, { status: 400 });
  }

  const activeDeck = await dbGet<Deck>("SELECT * FROM decks WHERE user_id = ? AND is_active = 1", [session.userId]);
  if (!activeDeck) {
    return NextResponse.json({ error: "활성화된 덱이 없습니다. 덱 빌더에서 덱을 활성화해주세요." }, { status: 400 });
  }

  const slots = await loadSlotsForDeck(activeDeck.id);
  if (slots.length !== 5) {
    return NextResponse.json({ error: "덱이 완성되지 않았습니다." }, { status: 400 });
  }

  const userDeckCards: DeckCard[] = slots.map((s) => ({
    position: s.card.position,
    teamSlug: s.card.team_slug,
    offRating: s.card.off_rating,
    defRating: s.card.def_rating,
    synergyTags: JSON.parse(s.card.synergy_tags) as string[],
    playerKey: s.card.name,
  }));

  const botDeckCards: DeckCard[] = BOT_DECKS[opponentBot].cards.map((c) => ({
    position: c.position,
    teamSlug: c.teamSlug,
    offRating: c.offRating,
    defRating: c.defRating,
    synergyTags: c.synergyTags,
    playerKey: c.name,
  }));

  const userBonuses = computeSynergies(userDeckCards);
  const botBonuses = computeSynergies(botDeckCards);
  const userApplied = applySynergies(userDeckCards, userBonuses);
  const botApplied = applySynergies(botDeckCards, botBonuses);

  const userStats: AggregateStats = { off: userApplied.aggregateOff, def: userApplied.aggregateDef, paintPenalty: botApplied.paintPenalty };
  const opponentStats: AggregateStats = { off: botApplied.aggregateOff, def: botApplied.aggregateDef, paintPenalty: userApplied.paintPenalty };

  const battle = simulateBattle(userStats, opponentStats);
  const reward = REWARD[battle.result];

  await dbRun(
    `INSERT INTO battle_history (user_id, deck_id, opponent_bot, user_score, opponent_score, result, reward_currency, events_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [session.userId, activeDeck.id, opponentBot, battle.userScore, battle.opponentScore, battle.result, reward, JSON.stringify(battle.events)]
  );

  await ensureUserCurrency(session.userId);
  await dbRun("UPDATE user_currency SET balance = balance + ?, updated_at = datetime('now') WHERE user_id = ?", [
    reward,
    session.userId,
  ]);

  return NextResponse.json({
    ...battle,
    reward,
    userBonuses,
    botBonuses,
  });
}
