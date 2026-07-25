import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { loadRosterForUser } from "@/lib/rosterQueries";
import { simulateBattle, type BattlePlayer, type TeamSynergy } from "@/lib/battleSim";
import { BOT_DECKS, type BotDeckId } from "@/lib/botDecks";
import { computeSynergies, type DeckCard, type SynergyBonus } from "@/lib/synergy";

function synergyToTeamSynergy(bonuses: SynergyBonus[]): TeamSynergy {
  return {
    offMultiplier: bonuses.reduce((m, b) => m * (b.offMultiplier ?? 1), 1),
    defMultiplier: bonuses.reduce((m, b) => m * (b.defMultiplier ?? 1), 1),
    opponentPaintPenalty: bonuses.reduce((s, b) => s + (b.opponentPaintPenalty ?? 0), 0),
  };
}

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

  const userPlayers: BattlePlayer[] = slots.map((s) => ({
    name: s.card.name,
    position: s.card.position,
    offRating: s.card.off_rating,
    defRating: s.card.def_rating,
  }));

  const opponentPlayers: BattlePlayer[] = BOT_DECKS[opponentBot].cards.map((c) => ({
    name: c.name,
    position: c.position,
    offRating: c.offRating,
    defRating: c.defRating,
  }));

  const userDeckCards: DeckCard[] = slots.map((s) => ({
    position: s.card.position,
    teamSlug: s.card.team_slug,
    offRating: s.card.off_rating,
    defRating: s.card.def_rating,
    playerKey: s.card.name,
  }));

  const botDeckCards: DeckCard[] = BOT_DECKS[opponentBot].cards.map((c) => ({
    position: c.position,
    teamSlug: c.teamSlug,
    offRating: c.offRating,
    defRating: c.defRating,
    playerKey: c.name,
  }));

  const userBonuses = computeSynergies(userDeckCards);
  const botBonuses = computeSynergies(botDeckCards);
  const userOwn = synergyToTeamSynergy(userBonuses);
  const botOwn = synergyToTeamSynergy(botBonuses);
  // A side's own bonuses can inflict a paint penalty on whoever is guarding it, so the
  // penalty a team's DEFENSE suffers comes from the OTHER team's bonuses (see synergy.ts).
  const userSynergy: TeamSynergy = { ...userOwn, opponentPaintPenalty: botOwn.opponentPaintPenalty };
  const opponentSynergy: TeamSynergy = { ...botOwn, opponentPaintPenalty: userOwn.opponentPaintPenalty };

  const battle = simulateBattle(userPlayers, userSynergy, opponentPlayers, opponentSynergy);

  return NextResponse.json({
    ...battle,
    userLineup: userPlayers,
    opponentLineup: opponentPlayers,
    userBonuses,
    botBonuses,
  });
}
