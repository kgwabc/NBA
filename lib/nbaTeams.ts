export type Conference = "동부" | "서부";

export type NbaTeam = {
  slug: string;
  name: string;
  abbreviation: string;
  conference: Conference;
  division: string;
  founded: number;
  arena: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
};

export const nbaTeams: NbaTeam[] = [
  // 동부 컨퍼런스 - 애틀랜틱 디비전
  {
    slug: "celtics",
    name: "보스턴 셀틱스",
    abbreviation: "BOS",
    conference: "동부",
    division: "애틀랜틱",
    founded: 1946,
    arena: "TD 가든",
    primaryColor: "#007A33",
    secondaryColor: "#BA9653",
    description:
      "NBA 최다 우승 기록을 보유한 명문 구단 중 하나로, 1950~60년대 빌 러셀을 앞세워 왕조를 이루며 리그 역사상 가장 성공적인 팀으로 자리잡았다. 클로버 로고와 초록색 유니폼은 보스턴을 상징하는 아이콘이다.",
  },
  {
    slug: "nets",
    name: "브루클린 네츠",
    abbreviation: "BKN",
    conference: "동부",
    division: "애틀랜틱",
    founded: 1967,
    arena: "바클레이스 센터",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    description:
      "ABA 시절 뉴저지에서 창단되어 이후 뉴저지 네츠를 거쳐 2012년 브루클린으로 연고를 옮겼다. 심플한 흑백 컬러와 도심형 홈구장으로 브랜드 이미지를 새롭게 구축한 팀이다.",
  },
  {
    slug: "knicks",
    name: "뉴욕 닉스",
    abbreviation: "NYK",
    conference: "동부",
    division: "애틀랜틱",
    founded: 1946,
    arena: "매디슨 스퀘어 가든",
    primaryColor: "#006BB6",
    secondaryColor: "#F58426",
    description:
      "세계에서 가장 유명한 경기장으로 꼽히는 매디슨 스퀘어 가든을 홈으로 쓰는 NBA 창립 멤버 구단으로, 뉴욕 특유의 팬덤과 스타 플레이어들의 각축장으로 유명하다.",
  },
  {
    slug: "76ers",
    name: "필라델피아 세븐티식서스",
    abbreviation: "PHI",
    conference: "동부",
    division: "애틀랜틱",
    founded: 1946,
    arena: "웰스 파고 센터",
    primaryColor: "#006BB6",
    secondaryColor: "#ED174C",
    description:
      "줄리어스 어빙과 앨런 아이버슨 등 시대를 대표하는 스타들이 거쳐간 팀으로, 팀명은 미국 독립선언(1776년)을 기념하는 의미를 담고 있다.",
  },
  {
    slug: "raptors",
    name: "토론토 랩터스",
    abbreviation: "TOR",
    conference: "동부",
    division: "애틀랜틱",
    founded: 1995,
    arena: "스코샤뱅크 아레나",
    primaryColor: "#CE1141",
    secondaryColor: "#000000",
    description:
      "캐나다를 연고로 하는 유일한 NBA 구단으로, 2019년 카와이 레너드를 앞세워 구단 역사상 첫 NBA 챔피언에 올랐다.",
  },

  // 동부 컨퍼런스 - 센트럴 디비전
  {
    slug: "bulls",
    name: "시카고 불스",
    abbreviation: "CHI",
    conference: "동부",
    division: "센트럴",
    founded: 1966,
    arena: "유나이티드 센터",
    primaryColor: "#CE1141",
    secondaryColor: "#000000",
    description:
      "마이클 조던과 함께 1990년대 두 차례의 3연패(쓰리핏)를 달성하며 NBA를 전 세계에 알린 전설적인 팀으로, 붉은 황소 로고는 농구 역사상 가장 상징적인 엠블럼 중 하나다.",
  },
  {
    slug: "cavaliers",
    name: "클리블랜드 캐벌리어스",
    abbreviation: "CLE",
    conference: "동부",
    division: "센트럴",
    founded: 1970,
    arena: "로켓 모기지 필드하우스",
    primaryColor: "#860038",
    secondaryColor: "#FDBB30",
    description:
      "오하이오 출신의 슈퍼스타 르브론 제임스와 함께 2016년 구단 역사상 첫 챔피언에 올랐으며, 3승 1패에서 역전한 파이널로 유명하다.",
  },
  {
    slug: "pistons",
    name: "디트로이트 피스톤스",
    abbreviation: "DET",
    conference: "동부",
    division: "센트럴",
    founded: 1941,
    arena: "리틀 시저스 아레나",
    primaryColor: "#C8102E",
    secondaryColor: "#1D42BA",
    description:
      "1980년대 말~90년대 초 거친 수비로 이름을 떨친 '배드 보이즈' 시절과 2004년 팀 중심의 농구로 우승을 차지한 역사로 잘 알려져 있다.",
  },
  {
    slug: "pacers",
    name: "인디애나 페이서스",
    abbreviation: "IND",
    conference: "동부",
    division: "센트럴",
    founded: 1967,
    arena: "게인브릿지 필드하우스",
    primaryColor: "#002D62",
    secondaryColor: "#FDBB30",
    description:
      "ABA 시절 강호로 군림했던 팀으로, 농구에 대한 애정이 유독 깊은 인디애나주를 연고로 빠른 속공 농구를 추구해왔다.",
  },
  {
    slug: "bucks",
    name: "밀워키 벅스",
    abbreviation: "MIL",
    conference: "동부",
    division: "센트럴",
    founded: 1968,
    arena: "피서브 포럼",
    primaryColor: "#00471B",
    secondaryColor: "#EEE1C6",
    description:
      "야니스 아데토쿤보를 앞세워 2021년 구단 역사상 두 번째 챔피언에 올랐으며, 사슴을 뜻하는 팀명은 위스콘신 지역 명명 공모전을 통해 정해졌다.",
  },

  // 동부 컨퍼런스 - 사우스이스트 디비전
  {
    slug: "hawks",
    name: "애틀랜타 호크스",
    abbreviation: "ATL",
    conference: "동부",
    division: "사우스이스트",
    founded: 1946,
    arena: "스테이트 팜 아레나",
    primaryColor: "#E03A3E",
    secondaryColor: "#C1D32F",
    description:
      "NBA에서 가장 오래된 프랜차이즈 중 하나로, 트리스탄틱시티·밀워키·세인트루이스를 거쳐 1968년 애틀랜타에 정착했다.",
  },
  {
    slug: "hornets",
    name: "샬럿 호네츠",
    abbreviation: "CHA",
    conference: "동부",
    division: "사우스이스트",
    founded: 1988,
    arena: "스펙트럼 센터",
    primaryColor: "#1D1160",
    secondaryColor: "#00788C",
    description:
      "1988년 확장 구단으로 창단되었으며, 전설적인 농구 선수 마이클 조던이 구단주로 있었던 팀으로도 잘 알려져 있다.",
  },
  {
    slug: "heat",
    name: "마이애미 히트",
    abbreviation: "MIA",
    conference: "동부",
    division: "사우스이스트",
    founded: 1988,
    arena: "카세야 센터",
    primaryColor: "#98002E",
    secondaryColor: "#F9A01B",
    description:
      "팻 라일리 감독 체제 아래 강한 수비 문화를 구축했으며, 드웨인 웨이드와 르브론 제임스 등을 앞세워 여러 차례 챔피언에 올랐다.",
  },
  {
    slug: "magic",
    name: "올랜도 매직",
    abbreviation: "ORL",
    conference: "동부",
    division: "사우스이스트",
    founded: 1989,
    arena: "키아 센터",
    primaryColor: "#0077C0",
    secondaryColor: "#000000",
    description:
      "1990년대 샤킬 오닐과 페니 하더웨이를 앞세워 파이널까지 올랐던 팀으로, 플로리다의 대표적인 관광도시 올랜도를 연고로 한다.",
  },
  {
    slug: "wizards",
    name: "워싱턴 위저즈",
    abbreviation: "WAS",
    conference: "동부",
    division: "사우스이스트",
    founded: 1961,
    arena: "캐피털 원 아레나",
    primaryColor: "#002B5C",
    secondaryColor: "#E31837",
    description:
      "시카고·볼티모어 등을 거쳐 워싱턴 D.C.에 정착했으며, 1978년 불릿츠 시절 구단 역사상 유일한 챔피언에 올랐다.",
  },

  // 서부 컨퍼런스 - 노스웨스트 디비전
  {
    slug: "nuggets",
    name: "덴버 너기츠",
    abbreviation: "DEN",
    conference: "서부",
    division: "노스웨스트",
    founded: 1967,
    arena: "볼 아레나",
    primaryColor: "#0E2240",
    secondaryColor: "#FEC524",
    description:
      "니콜라 요키치를 앞세워 2023년 구단 역사상 첫 NBA 챔피언에 올랐으며, 해발고도가 높은 '마일 하이 시티' 덴버를 연고로 한다.",
  },
  {
    slug: "timberwolves",
    name: "미네소타 팀버울브스",
    abbreviation: "MIN",
    conference: "서부",
    division: "노스웨스트",
    founded: 1989,
    arena: "타깃 센터",
    primaryColor: "#0C2340",
    secondaryColor: "#236192",
    description:
      "1989년 확장 구단으로 창단되었으며, 이름 그대로 늑대를 상징으로 삼아 미네소타의 자연환경을 팀 정체성에 담고 있다.",
  },
  {
    slug: "thunder",
    name: "오클라호마시티 썬더",
    abbreviation: "OKC",
    conference: "서부",
    division: "노스웨스트",
    founded: 1967,
    arena: "페이컴 센터",
    primaryColor: "#007AC1",
    secondaryColor: "#EF3B24",
    description:
      "시애틀 슈퍼소닉스로 출발해 2008년 오클라호마시티로 연고를 옮겼으며, 케빈 듀란트·러셀 웨스트브룩 등 젊은 스타들을 앞세워 빠르게 강팀으로 성장했다.",
  },
  {
    slug: "trail-blazers",
    name: "포틀랜드 트레일블레이저스",
    abbreviation: "POR",
    conference: "서부",
    division: "노스웨스트",
    founded: 1970,
    arena: "모다 센터",
    primaryColor: "#E03A3E",
    secondaryColor: "#000000",
    description:
      "1977년 빌 월튼을 앞세워 구단 역사상 첫 챔피언에 올랐으며, 도시 전체가 하나로 뭉치는 강력한 팬덤으로 유명한 팀이다.",
  },
  {
    slug: "jazz",
    name: "유타 재즈",
    abbreviation: "UTA",
    conference: "서부",
    division: "노스웨스트",
    founded: 1974,
    arena: "델타 센터",
    primaryColor: "#002B5C",
    secondaryColor: "#00471B",
    description:
      "뉴올리언스에서 창단되어 재즈라는 이름을 얻었지만 1979년 솔트레이크시티로 연고를 옮겼으며, 존 스탁턴과 칼 말론의 픽앤롤 콤비로 큰 사랑을 받았다.",
  },

  // 서부 컨퍼런스 - 퍼시픽 디비전
  {
    slug: "warriors",
    name: "골든스테이트 워리어스",
    abbreviation: "GSW",
    conference: "서부",
    division: "퍼시픽",
    founded: 1946,
    arena: "체이스 센터",
    primaryColor: "#1D428A",
    secondaryColor: "#FFC72C",
    description:
      "스테판 커리를 필두로 한 '스플래시 브라더스'의 3점슛 농구로 2010년대 리그를 지배하며 여러 차례 챔피언에 올랐다.",
  },
  {
    slug: "clippers",
    name: "로스앤젤레스 클리퍼스",
    abbreviation: "LAC",
    conference: "서부",
    division: "퍼시픽",
    founded: 1970,
    arena: "인튜이트 돔",
    primaryColor: "#C8102E",
    secondaryColor: "#1D428A",
    description:
      "버펄로에서 창단되어 샌디에이고를 거쳐 로스앤젤레스에 정착했으며, 최근 카와이 레너드 영입 등으로 우승 경쟁력을 키워왔다.",
  },
  {
    slug: "lakers",
    name: "로스앤젤레스 레이커스",
    abbreviation: "LAL",
    conference: "서부",
    division: "퍼시픽",
    founded: 1947,
    arena: "크립토닷컴 아레나",
    primaryColor: "#552583",
    secondaryColor: "#FDB927",
    description:
      "매직 존슨, 샤킬 오닐과 코비 브라이언트, 르브론 제임스 등 시대를 초월한 슈퍼스타들이 거쳐간 리그 최다 우승 팀 중 하나로, 미네소타 시절의 '레이커스(호수)'라는 이름을 그대로 유지하고 있다.",
  },
  {
    slug: "suns",
    name: "피닉스 선즈",
    abbreviation: "PHX",
    conference: "서부",
    division: "퍼시픽",
    founded: 1968,
    arena: "풋프린트 센터",
    primaryColor: "#1D1160",
    secondaryColor: "#E56020",
    description:
      "1993년과 2021년 두 차례 파이널에 올랐으나 아직 챔피언 트로피는 들지 못했으며, 태양이 뜨거운 애리조나를 연고로 빠른 템포의 농구를 지향해왔다.",
  },
  {
    slug: "kings",
    name: "새크라멘토 킹스",
    abbreviation: "SAC",
    conference: "서부",
    division: "퍼시픽",
    founded: 1923,
    arena: "골든 1 센터",
    primaryColor: "#5A2D81",
    secondaryColor: "#63727A",
    description:
      "로체스터에서 출발한 NBA 최고령 프랜차이즈 중 하나로, 2000년대 초반 크리스 웨버를 중심으로 한 화려한 팀 농구로 인기를 끌었다.",
  },

  // 서부 컨퍼런스 - 사우스웨스트 디비전
  {
    slug: "mavericks",
    name: "댈러스 매버릭스",
    abbreviation: "DAL",
    conference: "서부",
    division: "사우스웨스트",
    founded: 1980,
    arena: "아메리칸 에어라인스 센터",
    primaryColor: "#00538C",
    secondaryColor: "#002F5F",
    description:
      "덕 노비츠키를 앞세워 2011년 마이애미 히트를 꺾고 구단 역사상 첫 챔피언에 오른 팀으로, 이후 루카 돈치치 시대를 열며 서부의 강호로 자리매김했다.",
  },
  {
    slug: "rockets",
    name: "휴스턴 로키츠",
    abbreviation: "HOU",
    conference: "서부",
    division: "사우스웨스트",
    founded: 1967,
    arena: "토요타 센터",
    primaryColor: "#CE1141",
    secondaryColor: "#000000",
    description:
      "하킴 올라주원을 앞세워 1994·1995년 2연패를 달성했으며, 이후 제임스 하든 시대에는 3점슛 중심의 '모레이볼' 농구 전략으로 화제를 모았다.",
  },
  {
    slug: "grizzlies",
    name: "멤피스 그리즐리스",
    abbreviation: "MEM",
    conference: "서부",
    division: "사우스웨스트",
    founded: 1995,
    arena: "페덱스포럼",
    primaryColor: "#5D76A9",
    secondaryColor: "#12173F",
    description:
      "밴쿠버에서 창단되어 2001년 멤피스로 연고를 옮겼으며, 자 모란트 등 젊고 활기 넘치는 선수단으로 최근 빠르게 성장한 팀이다.",
  },
  {
    slug: "pelicans",
    name: "뉴올리언스 펠리컨스",
    abbreviation: "NOP",
    conference: "서부",
    division: "사우스웨스트",
    founded: 2002,
    arena: "스무디킹 센터",
    primaryColor: "#0C2340",
    secondaryColor: "#C8102E",
    description:
      "샬럿에서 창단되어 뉴올리언스로 이전했으며, 루이지애나의 상징인 펠리컨을 팀 이름으로 삼고 앤서니 데이비스 등 재능 있는 선수들을 육성해왔다.",
  },
  {
    slug: "spurs",
    name: "샌안토니오 스퍼스",
    abbreviation: "SAS",
    conference: "서부",
    division: "사우스웨스트",
    founded: 1967,
    arena: "프로스트 뱅크 센터",
    primaryColor: "#C4CED4",
    secondaryColor: "#000000",
    description:
      "팀 던컨과 그렉 포포비치 감독이 이끈 안정적인 팀 농구로 1999년부터 다섯 차례 챔피언에 오르며 '스퍼스 웨이'라는 별명을 얻었다.",
  },
];

export function getTeamBySlug(slug: string) {
  return nbaTeams.find((team) => team.slug === slug);
}
