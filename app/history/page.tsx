"use client";

import Link from "next/link";
import { useState } from "react";

const WIKI = "https://upload.wikimedia.org/wikipedia/commons";

const PLAYERS = {
  kareem: { name: "카림 압둘자바", photoUrl: `${WIKI}/thumb/a/a0/Kareem_Abdul-Jabbar_May_2014.jpg/330px-Kareem_Abdul-Jabbar_May_2014.jpg` },
  wilt: { name: "윌트 체임벌린", photoUrl: `${WIKI}/thumb/1/11/Wilt_Chamberlain_1960_%28cropped%29_%28cropped%29.jpg/330px-Wilt_Chamberlain_1960_%28cropped%29_%28cropped%29.jpg` },
  erving: { name: "줄리어스 어빙", photoUrl: `${WIKI}/thumb/0/0d/Julius_Erving_2016.jpg/330px-Julius_Erving_2016.jpg` },
  magic: { name: "매직 존슨", photoUrl: `${WIKI}/thumb/2/29/Magic_Johnson_at_SXSW_2022_%2851958828669%29_%28cropped%29.jpg/330px-Magic_Johnson_at_SXSW_2022_%2851958828669%29_%28cropped%29.jpg` },
  bird: { name: "래리 버드", photoUrl: `${WIKI}/thumb/b/bb/Larrybird.jpg/330px-Larrybird.jpg` },
  jordan: { name: "마이클 조던", photoUrl: `${WIKI}/thumb/a/ae/Michael_Jordan_in_2014.jpg/330px-Michael_Jordan_in_2014.jpg` },
  isiah: { name: "이사이아 토마스", photoUrl: `${WIKI}/thumb/1/1e/Isiah_Thomas_2007_%28cropped%29.jpg/330px-Isiah_Thomas_2007_%28cropped%29.jpg` },
  duncan: { name: "팀 던컨", photoUrl: `${WIKI}/thumb/c/cb/Tim_Duncan_Walks_Verizon_Center%27s_Floor_%28cropped%29_%28cropped%29.jpg/330px-Tim_Duncan_Walks_Verizon_Center%27s_Floor_%28cropped%29_%28cropped%29.jpg` },
  kobe: { name: "코비 브라이언트", photoUrl: `${WIKI}/thumb/3/36/Kobe_Bryant_Dec_2014.jpg/330px-Kobe_Bryant_Dec_2014.jpg` },
  lebron: { name: "르브론 제임스", photoUrl: `${WIKI}/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/330px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg` },
  billups: { name: "챈시 빌럽스", photoUrl: `${WIKI}/thumb/a/ab/Billups_coach_%28cropped%29.jpg/330px-Billups_coach_%28cropped%29.jpg` },
  pierce: { name: "폴 피어스", photoUrl: `${WIKI}/thumb/e/e3/Paul_Pierce_2008-01-13_%28cropped%29.jpg/330px-Paul_Pierce_2008-01-13_%28cropped%29.jpg` },
  nowitzki: { name: "덕 노비츠키", photoUrl: `${WIKI}/thumb/1/1d/Dirk_Nowitzki_2_%28cropped%29.jpg/330px-Dirk_Nowitzki_2_%28cropped%29.jpg` },
  curry: { name: "스테픈 커리", photoUrl: `${WIKI}/thumb/5/52/Stephen_Curry%2C_Olympic_Games_2024_%28cropped%29.jpg/330px-Stephen_Curry%2C_Olympic_Games_2024_%28cropped%29.jpg` },
  durant: { name: "케빈 듀란트", photoUrl: `${WIKI}/thumb/d/d3/Kevin_Durant%2C_Paris_2024_%28cropped%29.jpg/330px-Kevin_Durant%2C_Paris_2024_%28cropped%29.jpg` },
  kawhi: { name: "카와이 레너드", photoUrl: `${WIKI}/thumb/a/a9/Kawhi_Leonard_%287440607%29_%28cropped%29.jpg/330px-Kawhi_Leonard_%287440607%29_%28cropped%29.jpg` },
  giannis: { name: "야니스 아데토쿤보", photoUrl: `${WIKI}/thumb/9/9c/Giannis_Antetokounmpo_%2851915153421%29_%28cropped%29.jpg/330px-Giannis_Antetokounmpo_%2851915153421%29_%28cropped%29.jpg` },
  jokic: { name: "니콜라 요키치", photoUrl: `${WIKI}/thumb/7/7e/Nikola_Jokic_free_throw_%28cropped%29.jpg/330px-Nikola_Jokic_free_throw_%28cropped%29.jpg` },
  tatum: { name: "제이슨 테이텀", photoUrl: `${WIKI}/thumb/8/84/Celtics_at_Wizards_2024-12-044_%28cropped_2%29.jpg/330px-Celtics_at_Wizards_2024-12-044_%28cropped_2%29.jpg` },
  sga: { name: "셰이 길저스알렉산더", photoUrl: `${WIKI}/thumb/8/8c/2023-08-09_Deutschland_gegen_Kanada_%28Basketball-L%C3%A4nderspiel%29_by_Sandro_Halank%E2%80%93109.jpg/330px-2023-08-09_Deutschland_gegen_Kanada_%28Basketball-L%C3%A4nderspiel%29_by_Sandro_Halank%E2%80%93109.jpg` },
} as const;

type YearEntry = {
  year: number;
  title: string;
  body: string;
  player: (typeof PLAYERS)[keyof typeof PLAYERS];
};

type Decade = {
  id: string;
  label: string;
  years: YearEntry[];
};

const decades: Decade[] = [
  {
    id: "1970s",
    label: "1970년대",
    years: [
      {
        year: 1971,
        title: "카림 압둘자바, 밀워키에 첫 우승 안기다",
        body: "밀워키 벅스의 카림 압둘자바(당시 이름 루 알신도)가 압도적인 스카이훅 슛으로 팀을 창단 3년 만에 첫 우승으로 이끌었습니다. 그는 이후 20년 가까이 NBA 최고의 센터 자리를 지키며 역대 최다 정규시즌 득점 기록을 세우게 됩니다.",
        player: PLAYERS.kareem,
      },
      {
        year: 1972,
        title: "LA 레이커스, 33연승과 우승",
        body: "윌트 체임벌린이 이끈 LA 레이커스가 정규시즌 33연승이라는, 지금까지도 깨지지 않은 4대 프로스포츠 최장 연승 기록을 세우며 69승을 거뒀고, 그 해 파이널 우승까지 차지했습니다.",
        player: PLAYERS.wilt,
      },
      {
        year: 1976,
        title: "NBA-ABA 합병",
        body: "경쟁 리그였던 ABA(American Basketball Association)가 NBA에 흡수 합병되며 뉴욕 네츠, 덴버 너기츠, 인디애나 페이서스, 샌안토니오 스퍼스가 NBA에 합류했습니다. ABA의 스타였던 줄리어스 어빙(닥터 J)은 이후 필라델피아 세븐티식서스에서 화려한 덩크와 쇼맨십으로 NBA 인기를 끌어올렸습니다.",
        player: PLAYERS.erving,
      },
      {
        year: 1979,
        title: "3점슛 도입, 그리고 매직 vs 버드의 시작",
        body: "1979-80시즌부터 3점슛 라인이 정식 도입되며 NBA의 득점 방식이 근본적으로 바뀌기 시작했습니다. 같은 해 매직 존슨(LA 레이커스)과 래리 버드(보스턴 셀틱스)가 나란히 리그에 데뷔했고, 대학 시절부터 이어진 두 사람의 라이벌 구도는 1980년대 내내 NBA 인기를 견인하는 원동력이 됩니다.",
        player: PLAYERS.magic,
      },
    ],
  },
  {
    id: "1980s",
    label: "1980년대",
    years: [
      {
        year: 1980,
        title: "매직 존슨의 전설적인 신인 파이널",
        body: "신인이었던 매직 존슨은 파이널 6차전에서 부상당한 카림 압둘자바를 대신해 센터 포지션까지 소화하며 42득점 15리바운드 7어시스트를 기록, 레이커스의 우승을 확정지었습니다. 신인 선수가 파이널 MVP를 차지한 것도 이때가 처음이었습니다.",
        player: PLAYERS.magic,
      },
      {
        year: 1984,
        title: "마이클 조던, NBA에 입성하다",
        body: "시카고 불스가 드래프트 3순위로 노스캐롤라이나 대학 출신의 마이클 조던을 지명했습니다. 당시에는 휴스턴이 하킴 올라주원을, 포틀랜드가 샘 보위를 먼저 뽑아 화제가 됐지만, 조던은 이후 NBA 역사상 가장 위대한 선수로 평가받게 됩니다.",
        player: PLAYERS.jordan,
      },
      {
        year: 1986,
        title: "역대 최강급 셀틱스, 우승",
        body: "래리 버드, 케빈 맥헤일, 로버트 패리시가 이끈 보스턴 셀틱스가 정규시즌 67승을 거두고 파이널까지 제패하며, 지금도 역대 최고의 팀 중 하나로 꼽히는 시즌을 완성했습니다.",
        player: PLAYERS.bird,
      },
      {
        year: 1989,
        title: "디트로이트 피스톤즈의 '배드 보이즈'",
        body: "이사이아 토마스를 필두로 한 디트로이트 피스톤즈가 거칠고 강력한 수비를 앞세운 '배드 보이즈' 농구로 매직 존슨의 레이커스를 꺾고 첫 우승을 차지했습니다. 이듬해에도 우승하며 2연패를 달성합니다.",
        player: PLAYERS.isiah,
      },
    ],
  },
  {
    id: "1990s",
    label: "1990년대",
    years: [
      {
        year: 1991,
        title: "불스, 첫 우승을 맛보다",
        body: "마이클 조던과 스카티 피펜이 이끈 시카고 불스가 매직 존슨의 레이커스를 꺾고 프랜차이즈 첫 우승을 차지했습니다. 이는 이후 이어질 두 차례 3연패의 시작점이었습니다.",
        player: PLAYERS.jordan,
      },
      {
        year: 1992,
        title: "드림팀, 바르셀로나를 정복하다",
        body: "조던, 매직 존슨, 래리 버드 등 당대 최고의 선수들이 모인 미국 대표팀 '드림팀'이 바르셀로나 올림픽에서 압도적인 경기력으로 금메달을 차지하며 전 세계에 NBA 농구의 인기를 확산시켰습니다.",
        player: PLAYERS.jordan,
      },
      {
        year: 1993,
        title: "불스 첫 3연패, 그리고 조던의 은퇴",
        body: "불스가 3년 연속 우승(3-peat)을 완성한 직후, 마이클 조던은 아버지의 갑작스러운 죽음을 겪은 뒤 돌연 은퇴를 선언하고 야구 선수로 전향하는 파격적인 행보를 보였습니다.",
        player: PLAYERS.jordan,
      },
      {
        year: 1995,
        title: "'I'm back', 조던의 복귀",
        body: "야구에서 별다른 성과를 내지 못한 조던은 짧은 성명 하나로 NBA 복귀를 알렸습니다. 복귀 첫 시즌은 우승에 이르지 못했지만, 이는 곧이어 펼쳐질 두 번째 3연패의 서막이었습니다.",
        player: PLAYERS.jordan,
      },
      {
        year: 1996,
        title: "72승, 역대 최고 승률 시즌",
        body: "복귀 후 완전체가 된 불스는 정규시즌 72승 10패라는 당시 역대 최다승 기록을 세우며 우승까지 차지했습니다. 이 기록은 2016년 골든스테이트 워리어스가 73승을 거두기 전까지 20년간 깨지지 않았습니다.",
        player: PLAYERS.jordan,
      },
      {
        year: 1998,
        title: "'라스트 샷'과 불스의 6번째 우승",
        body: "유타 재즈와의 파이널 6차전, 마이클 조던이 경기 종료 직전 결승 점프슛을 성공시키며 불스의 두 번째 3연패를 완성했습니다. 이 장면은 조던 커리어를 상징하는 순간으로 남았습니다.",
        player: PLAYERS.jordan,
      },
      {
        year: 1999,
        title: "스퍼스, 첫 우승을 신고하다",
        body: "직장폐쇄(lockout)로 단축된 시즌, 팀 던컨과 데이비드 로빈슨의 '트윈 타워'를 앞세운 샌안토니오 스퍼스가 프랜차이즈 첫 우승을 차지하며 이후 이어질 스퍼스 왕조의 시작을 알렸습니다.",
        player: PLAYERS.duncan,
      },
    ],
  },
  {
    id: "2000s",
    label: "2000년대",
    years: [
      {
        year: 2000,
        title: "레이커스 3연패의 시작",
        body: "샤킬 오닐과 코비 브라이언트가 이끄는 LA 레이커스가 2000년부터 2002년까지 3년 연속 우승하며 새로운 왕조를 열었습니다. 두 스타의 파괴적인 조합은 리그 최강 전력으로 군림했습니다.",
        player: PLAYERS.kobe,
      },
      {
        year: 2003,
        title: "르브론 제임스, 드래프트 전체 1순위",
        body: "고교 시절부터 전국적인 화제를 모았던 르브론 제임스가 클리블랜드 캐벌리어스에 전체 1순위로 지명되며 NBA에 데뷔했습니다. 이후 20년 넘게 리그를 지배할 커리어의 시작이었습니다.",
        player: PLAYERS.lebron,
      },
      {
        year: 2004,
        title: "피스톤즈의 이변, '팀 농구'의 승리",
        body: "스타 군단으로 꼽히던 레이커스(샤킬 오닐·코비 브라이언트·칼 말론·게리 페이튼)를 상대로, 스타성보다 조직력을 앞세운 디트로이트 피스톤즈가 파이널에서 승리하며 챈시 빌럽스가 파이널 MVP를 차지했습니다.",
        player: PLAYERS.billups,
      },
      {
        year: 2008,
        title: "셀틱스 '빅3', 우승을 합작하다",
        body: "폴 피어스, 케빈 가넷, 레이 알렌 세 스타가 뭉친 보스턴 셀틱스가 파이널에서 라이벌 LA 레이커스를 꺾고 22년 만에 우승을 차지했습니다. 폴 피어스가 파이널 MVP에 올랐습니다.",
        player: PLAYERS.pierce,
      },
      {
        year: 2009,
        title: "코비, 자신의 첫 파이널 MVP",
        body: "샤킬 오닐 없이도 레이커스를 우승으로 이끈 코비 브라이언트가 생애 첫 파이널 MVP를 수상하며, 오닐의 그늘에서 벗어나 자신만의 커리어를 증명했습니다.",
        player: PLAYERS.kobe,
      },
    ],
  },
  {
    id: "2010s",
    label: "2010년대",
    years: [
      {
        year: 2010,
        title: "르브론의 '디시전'",
        body: "자유계약선수가 된 르브론 제임스가 생방송 특별 프로그램을 통해 마이애미 히트 이적을 발표한 '디시전(The Decision)'은 NBA 역사상 가장 논란이 컸던 이적 발표로 남았습니다.",
        player: PLAYERS.lebron,
      },
      {
        year: 2011,
        title: "노비츠키, 매버릭스에 첫 우승을 안기다",
        body: "덕 노비츠키가 이끄는 댈러스 매버릭스가 르브론·웨이드·보쉬의 '빅3' 마이애미 히트를 꺾는 이변을 연출하며 프랜차이즈 첫 우승을 차지했습니다.",
        player: PLAYERS.nowitzki,
      },
      {
        year: 2012,
        title: "히트, 첫 번째 우승",
        body: "르브론 제임스, 드웨인 웨이드, 크리스 보쉬가 결성한 마이애미 히트가 마침내 첫 우승을 차지하며 '빅3' 프로젝트의 결실을 맺었습니다. 이듬해에도 우승하며 2연패를 완성합니다.",
        player: PLAYERS.lebron,
      },
      {
        year: 2015,
        title: "워리어스 왕조의 시작",
        body: "스테픈 커리의 정교한 3점슛을 앞세운 골든스테이트 워리어스가 첫 우승을 차지하며, 이후 몇 년간 이어질 '스몰볼' 왕조의 문을 열었습니다.",
        player: PLAYERS.curry,
      },
      {
        year: 2016,
        title: "캐벌리어스, 1승 3패를 뒤집다",
        body: "정규시즌 73승이라는 역대 최다승 기록을 세운 워리어스를 상대로, 르브론 제임스의 클리블랜드 캐벌리어스가 파이널 1승 3패 열세를 뒤집고 우승하며 고향 클리블랜드에 첫 우승을 안겼습니다.",
        player: PLAYERS.lebron,
      },
      {
        year: 2017,
        title: "듀란트 합류, 워리어스 2연패",
        body: "케빈 듀란트가 워리어스에 합류하며 리그 전력 불균형 논란을 낳았지만, 워리어스는 2017년과 2018년 연속 우승하며 듀란트가 2년 연속 파이널 MVP를 차지했습니다.",
        player: PLAYERS.durant,
      },
      {
        year: 2019,
        title: "랩터스, 캐나다에 첫 우승을",
        body: "카와이 레너드가 이적 첫 시즌 만에 토론토 랩터스를 파이널 우승으로 이끌며, 미국 밖 구단으로는 최초로 NBA 우승을 안겼습니다. 이 시즌을 끝으로 워리어스 왕조는 주요 선수들의 부상 속에 저물었습니다.",
        player: PLAYERS.kawhi,
      },
    ],
  },
  {
    id: "2020s",
    label: "2020년대",
    years: [
      {
        year: 2020,
        title: "코비 브라이언트의 별세, 그리고 '버블' 우승",
        body: "1월 코비 브라이언트가 헬기 사고로 갑작스레 세상을 떠나며 전 세계 농구팬들에게 큰 충격을 안겼습니다. 같은 해, 코로나19로 중단됐던 시즌은 올랜도의 격리 시설('버블')에서 재개됐고, 르브론 제임스가 이끈 LA 레이커스가 코비를 추모하며 우승을 차지했습니다.",
        player: PLAYERS.lebron,
      },
      {
        year: 2021,
        title: "야니스, 밀워키에 첫 우승을",
        body: "야니스 아데토쿤보가 파이널 6차전에서 50득점을 폭발시키며 밀워키 벅스에 1971년 이후 50년 만의 우승을 안겼습니다.",
        player: PLAYERS.giannis,
      },
      {
        year: 2022,
        title: "커리, 네 번째 우승",
        body: "스테픈 커리가 이끄는 골든스테이트 워리어스가 부상 여파를 딛고 다시 정상에 올라 왕조의 네 번째 우승을 완성했고, 커리는 생애 첫 파이널 MVP를 수상했습니다.",
        player: PLAYERS.curry,
      },
      {
        year: 2023,
        title: "요키치, 너기츠에 첫 우승을",
        body: "독특한 패스 센스로 '조커'라 불리는 니콜라 요키치가 덴버 너기츠를 프랜차이즈 첫 우승으로 이끌며 파이널 MVP를 차지했습니다.",
        player: PLAYERS.jokic,
      },
      {
        year: 2024,
        title: "셀틱스, 역대 최다 18번째 우승",
        body: "제이슨 테이텀과 제일런 브라운이 이끄는 보스턴 셀틱스가 우승하며, 라이벌 LA 레이커스와 함께 나눠 가졌던 역대 최다 우승 타이 기록(17회)을 넘어 단독 1위인 18번째 우승을 달성했습니다.",
        player: PLAYERS.tatum,
      },
      {
        year: 2025,
        title: "썬더, 젊은 왕조의 시작",
        body: "셰이 길저스알렉산더가 이끄는 오클라호마시티 썬더가 인디애나 페이서스와의 7차전 접전 끝에 우승하며 프랜차이즈에 새로운 전성기를 열었습니다. 길저스알렉산더는 파이널 MVP를 수상했습니다.",
        player: PLAYERS.sga,
      },
    ],
  },
];

export default function HistoryPage() {
  const [selectedDecade, setSelectedDecade] = useState(decades[0].id);
  const current = decades.find((d) => d.id === selectedDecade) ?? decades[0];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← 홈
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 sm:text-3xl">
          🏀 NBA HISTORY
        </h1>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {decades.map((decade) => (
            <button
              key={decade.id}
              type="button"
              onClick={() => setSelectedDecade(decade.id)}
              className={
                decade.id === selectedDecade
                  ? "shrink-0 rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
                  : "shrink-0 rounded-full border border-black/[.08] px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
              }
            >
              {decade.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {current.years.map((entry) => (
            <section
              key={entry.year}
              className="flex gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <img
                src={entry.player.photoUrl}
                alt={entry.player.name}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-orange-600">
                  {entry.year} · {entry.player.name}
                </p>
                <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                  {entry.title}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {entry.body}
                </p>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
