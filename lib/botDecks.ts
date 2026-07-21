import type { CardPosition } from "./db";

export type BotCard = {
  name: string;
  teamSlug: string;
  position: CardPosition;
  offRating: number;
  defRating: number;
  synergyTags: string[];
};

export type BotDeckId = "easybot" | "allstarbot" | "legendbot";

export const BOT_DECKS: Record<BotDeckId, { label: string; cards: BotCard[] }> = {
  easybot: {
    label: "이지봇",
    cards: [
      { name: "이지봇 PG", teamSlug: "bot-easy-pg", position: "PG", offRating: 62, defRating: 64, synergyTags: [] },
      { name: "이지봇 SG", teamSlug: "bot-easy-sg", position: "SG", offRating: 61, defRating: 63, synergyTags: [] },
      { name: "이지봇 SF", teamSlug: "bot-easy-sf", position: "SF", offRating: 63, defRating: 62, synergyTags: [] },
      { name: "이지봇 PF", teamSlug: "bot-easy-pf", position: "PF", offRating: 60, defRating: 66, synergyTags: [] },
      { name: "이지봇 C", teamSlug: "bot-easy-c", position: "C", offRating: 59, defRating: 68, synergyTags: [] },
    ],
  },
  allstarbot: {
    label: "올스타봇",
    cards: [
      { name: "올스타봇 PG", teamSlug: "bot-allstar-pg", position: "PG", offRating: 78, defRating: 73, synergyTags: [] },
      { name: "올스타봇 SG", teamSlug: "bot-allstar-sg", position: "SG", offRating: 77, defRating: 74, synergyTags: [] },
      { name: "올스타봇 SF", teamSlug: "bot-allstar-sf", position: "SF", offRating: 76, defRating: 75, synergyTags: [] },
      { name: "올스타봇 PF", teamSlug: "bot-allstar-pf", position: "PF", offRating: 74, defRating: 78, synergyTags: [] },
      { name: "올스타봇 C", teamSlug: "bot-allstar-c", position: "C", offRating: 73, defRating: 80, synergyTags: [] },
    ],
  },
  legendbot: {
    label: "레전드봇",
    cards: [
      { name: "레전드봇 PG", teamSlug: "bot-legend-pg", position: "PG", offRating: 92, defRating: 85, synergyTags: [] },
      { name: "레전드봇 SG", teamSlug: "bot-legend-sg", position: "SG", offRating: 91, defRating: 86, synergyTags: [] },
      { name: "레전드봇 SF", teamSlug: "bot-legend-sf", position: "SF", offRating: 90, defRating: 87, synergyTags: [] },
      { name: "레전드봇 PF", teamSlug: "bot-legend-pf", position: "PF", offRating: 89, defRating: 90, synergyTags: [] },
      { name: "레전드봇 C", teamSlug: "bot-legend-c", position: "C", offRating: 88, defRating: 92, synergyTags: [] },
    ],
  },
};
