import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { loadRosterForUser } from "@/lib/rosterQueries";
import { simulateBattle, type AggregateStats } from "@/lib/battleSim";
import { BOT_DECKS, type BotDeckId } from "@/lib/botDecks";
import { computeSynergies, applySynergies, type DeckCard } from "@/lib/synergy";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const opponentBot = body?.opponentBot as BotDeckId | undefined;
  if (!opponentBot || !(opponentBot in BOT_DECKS)) {
    return NextResponse.json({ error: "잘못된 상대입니다." }, { status: 400 });
  }

  const slots = await loadRosterForUser(session.userId);
  if (slots.length !== 5) {
    return NextResponse.json({ error: "로스터가 완성되지 않았습니다. 로스터 화면에서 5개 포지션을 모두 채워주세요." }, { status: 400 });
  }

  const userRosterCards: DeckCard[] = slots.map((s) => ({
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

  const userBonuses = computeSynergies(userRosterCards);
  const botBonuses = computeSynergies(botDeckCards);
  const userApplied = applySynergies(userRosterCards, userBonuses);
  const botApplied = applySynergies(botDeckCards, botBonuses);

  const userStats: AggregateStats = { off: userApplied.aggregateOff, def: userApplied.aggregateDef, paintPenalty: botApplied.paintPenalty };
  const opponentStats: AggregateStats = { off: botApplied.aggregateOff, def: botApplied.aggregateDef, paintPenalty: userApplied.paintPenalty };

  const battle = simulateBattle(userStats, opponentStats);

  return NextResponse.json({
    ...battle,
    userBonuses,
    botBonuses,
  });
}
