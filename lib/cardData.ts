import type { CardPosition, CardRarity } from "./db";

export type CardSeed = {
  name: string;
  teamSlug: string;
  position: CardPosition;
  rarity: CardRarity;
  off: number;
  def: number;
  salary: number;
  flavorText: string;
  imageUrl?: string;
};

export const cardSeeds: CardSeed[] = [
  // LEGEND (3)
  {
    name: "스테판 커리",
    teamSlug: "warriors",
    position: "PG",
    rarity: "LEGEND",
    off: 98,
    def: 90,
    salary: 45,
    flavorText: "역대급 3점슛 능력으로 '스몰볼' 시대를 연 워리어스의 에이스.",
    imageUrl: "/players/stephen-curry.jpg",
  },
  {
    name: "마이클 조던",
    teamSlug: "bulls",
    position: "SG",
    rarity: "LEGEND",
    off: 99,
    def: 95,
    salary: 45,
    flavorText: "농구 역사상 최고의 선수로 꼽히는 불스의 전설.",
    imageUrl: "/players/michael-jordan.jpg",
  },
  {
    name: "르브론 제임스",
    teamSlug: "cavaliers",
    position: "SF",
    rarity: "LEGEND",
    off: 97,
    def: 93,
    salary: 44,
    flavorText: "오하이오 출신의 슈퍼스타, 클리블랜드에 첫 챔피언을 안긴 왕.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/60/Lebron_dunking_finals_2016.jpg",
  },

  // GOLD (7)
  {
    name: "클레이 탐슨",
    teamSlug: "warriors",
    position: "SG",
    rarity: "GOLD",
    off: 88,
    def: 78,
    salary: 30,
    flavorText: "커리와 함께 '스플래시 브라더스'를 이룬 정교한 슈터.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Klay_Thompson_vs._Jared_Dudley.jpg",
  },
  {
    name: "야니스 아데토쿤보",
    teamSlug: "bucks",
    position: "PF",
    rarity: "GOLD",
    off: 89,
    def: 88,
    salary: 31,
    flavorText: "벅스를 50년 만의 챔피언으로 이끈 압도적 신체능력의 포워드.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Giannis_Antetokounmpo_%2851916230730%29.jpg",
  },
  {
    name: "니콜라 요키치",
    teamSlug: "nuggets",
    position: "C",
    rarity: "GOLD",
    off: 90,
    def: 80,
    salary: 31,
    flavorText: "너기츠 구단 역사상 첫 챔피언을 이끈 패싱 센터.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Nikola_Jokic_%2840980299891%29.jpg",
  },
  {
    name: "루카 돈치치",
    teamSlug: "mavericks",
    position: "PG",
    rarity: "GOLD",
    off: 91,
    def: 75,
    salary: 30,
    flavorText: "매버릭스를 파이널까지 이끈 만능 플레이메이커.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5a/Luka_Doncic_vs_Dean_Wade%2C_Dallas_Mavericks_vs_Cleveland_Cavaliers_on_May_9%2C_2021.jpg",
  },
  {
    name: "조엘 엠비드",
    teamSlug: "76ers",
    position: "C",
    rarity: "GOLD",
    off: 88,
    def: 85,
    salary: 30,
    flavorText: "세븐티식서스의 프랜차이즈 센터, 압도적 골밑 지배력.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Joel_Embiid_layup_2019.jpg",
  },
  {
    name: "데빈 부커",
    teamSlug: "suns",
    position: "SG",
    rarity: "GOLD",
    off: 87,
    def: 76,
    salary: 29,
    flavorText: "선즈 구단 역사상 최다 득점자로 성장한 슈팅가드.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/70/Devin_Booker_%2830362063153%29.jpg",
  },
  {
    name: "앤서니 에드워즈",
    teamSlug: "timberwolves",
    position: "SG",
    rarity: "GOLD",
    off: 86,
    def: 79,
    salary: 29,
    flavorText: "폭발적인 운동능력으로 팀버울브스를 이끄는 차세대 에이스.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c4/Anthony_Edwards_Kentavious_Caldwell-Pope_%2851734745028%29_%28cropped%29.jpg",
  },

  // SILVER (12)
  {
    name: "크리스 폴",
    teamSlug: "clippers",
    position: "PG",
    rarity: "SILVER",
    off: 77,
    def: 74,
    salary: 16,
    flavorText: "뛰어난 코트 비전을 지닌 베테랑 포인트가드.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Chris_Paul_floater_20131118_Clippers_v_Grizzles.jpg",
  },
  {
    name: "트레이 영",
    teamSlug: "hawks",
    position: "PG",
    rarity: "SILVER",
    off: 79,
    def: 68,
    salary: 15,
    flavorText: "뛰어난 슈팅과 패스로 호크스를 이끄는 포인트가드.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/NBA_2021_-_Wizards_vs._Hawks%2C_Oct_29_2021_101_%2851637738135%29_%28cropped%29.jpg",
  },
  {
    name: "자 모란트",
    teamSlug: "grizzlies",
    position: "PG",
    rarity: "SILVER",
    off: 80,
    def: 70,
    salary: 17,
    flavorText: "폭발적인 덩크와 스피드로 그리즐리스를 끌어올린 가드.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Ja_Morant_%2851665800185%29.jpg",
  },
  {
    name: "제일런 브라운",
    teamSlug: "celtics",
    position: "SG",
    rarity: "SILVER",
    off: 77,
    def: 75,
    salary: 16,
    flavorText: "셀틱스의 균형 잡힌 공수겸비형 슈팅가드.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Celtics_at_Wizards_2024-12-035.jpg",
  },
  {
    name: "데자운테 머레이",
    teamSlug: "pelicans",
    position: "SG",
    rarity: "SILVER",
    off: 75,
    def: 72,
    salary: 15,
    flavorText: "펠리컨스의 다재다능한 콤보 가드.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Dejonte_Murray_%2851916456198%29.jpg/500px-Dejonte_Murray_%2851916456198%29.jpg",
  },
  {
    name: "폴 조지",
    teamSlug: "pacers",
    position: "SF",
    rarity: "SILVER",
    off: 78,
    def: 77,
    salary: 17,
    flavorText: "페이서스에서 4회 올스타에 선정된 균형잡힌 포워드.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Anthony_Tolliver_defending_Paul_George.jpg/500px-Anthony_Tolliver_defending_Paul_George.jpg",
  },
  {
    name: "브랜든 인그램",
    teamSlug: "pelicans",
    position: "SF",
    rarity: "SILVER",
    off: 76,
    def: 70,
    salary: 15,
    flavorText: "부드러운 슈팅 터치를 가진 펠리컨스의 스코어러.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Brandon_Ingram_2020.jpg/500px-Brandon_Ingram_2020.jpg",
  },
  {
    name: "파스칼 시아캄",
    teamSlug: "raptors",
    position: "PF",
    rarity: "SILVER",
    off: 74,
    def: 76,
    salary: 15,
    flavorText: "랩터스의 활동량 넘치는 파워포워드.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/1_pascal_siakam_2019_nba_finals.jpg/500px-1_pascal_siakam_2019_nba_finals.jpg",
  },
  {
    name: "줄리어스 랜들",
    teamSlug: "knicks",
    position: "PF",
    rarity: "SILVER",
    off: 75,
    def: 71,
    salary: 15,
    flavorText: "닉스의 힘과 스피드를 겸비한 파워포워드.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Julius_Randle_with_Lakers.jpg/500px-Julius_Randle_with_Lakers.jpg",
  },
  {
    name: "뱀 아데바요",
    teamSlug: "heat",
    position: "C",
    rarity: "SILVER",
    off: 72,
    def: 81,
    salary: 16,
    flavorText: "히트의 수비와 패스에 강점을 지닌 센터.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Adebayo_Hachimura_%28cropped%29.jpg/500px-Adebayo_Hachimura_%28cropped%29.jpg",
  },
  {
    name: "도만타스 사보니스",
    teamSlug: "kings",
    position: "C",
    rarity: "SILVER",
    off: 76,
    def: 77,
    salary: 17,
    flavorText: "킹스의 리바운드와 패스에 능한 빅맨.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Domantas_Sabonis_%2832768447291%29.jpg/500px-Domantas_Sabonis_%2832768447291%29.jpg",
  },
  {
    name: "카를-앤소니 타운스",
    teamSlug: "knicks",
    position: "C",
    rarity: "SILVER",
    off: 77,
    def: 73,
    salary: 16,
    flavorText: "슈팅 능력을 갖춘 현대적인 빅맨.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Towns-Gibson-20190120.jpg/500px-Towns-Gibson-20190120.jpg",
  },
];

// BRONZE는 현재 카드 없음 — 신규 브론즈 카드는 관리자 패널에서 생성 예정.
