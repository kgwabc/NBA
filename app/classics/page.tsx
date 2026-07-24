"use client";

import Link from "next/link";
import { useState } from "react";

type ClassicGame = {
  id: string;
  date: string;
  title: string;
  matchup: string;
  boxScore: string;
  youtubeUrl?: string;
};

type Era = {
  id: string;
  label: string;
  games: ClassicGame[];
};

const eras: Era[] = [
  {
    id: "1960s-1970s",
    label: "1960~70년대",
    games: [
      {
        id: "wilt-100",
        date: "1962.03.02",
        title: "윌트 체임벌린, 100득점",
        matchup: "필라델피아 워리어스 169 : 147 뉴욕 닉스",
        boxScore: "체임벌린 100득점(FG 36/63, FT 28/32) 25리바운드. NBA 역사상 한 경기 최다 득점 기록으로, 지금까지도 깨지지 않고 있습니다. 당시 경기 영상은 대부분 소실되어 라디오 중계와 일부 사진만 남아있습니다.",
      },
      {
        id: "willis-reed",
        date: "1970.05.08",
        title: "윌리스 리드의 투혼 복귀 (파이널 7차전)",
        matchup: "뉴욕 닉스 113 : 99 LA 레이커스",
        boxScore: "대퇴부 부상으로 결장이 유력했던 리드가 워밍업 직전 코트에 나타나 경기 시작 첫 두 슛을 모두 성공(4득점). 이후 리드는 뛰지 못했지만 팀 사기를 끌어올렸고, 월트 프레이저가 36득점 19어시스트로 닉스의 창단 첫 우승을 이끌었습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=bHzxM69qm50",
      },
    ],
  },
  {
    id: "1990s",
    label: "1990년대",
    games: [
      {
        id: "jordan-shrug",
        date: "1992.06.03",
        title: "조던의 '으쓱(Shrug)' 게임 (파이널 1차전)",
        matchup: "시카고 불스 122 : 89 포틀랜드 트레일블레이저스",
        boxScore: "마이클 조던이 전반에만 3점슛 6개를 몰아넣으며 35득점(전반 기준), 최종 39득점을 기록. 여섯 번째 3점슛을 성공시킨 뒤 코트 위에서 어깨를 으쓱했던 장면이 '더 슈러그'로 유명합니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=03GT8q3BCZY",
      },
      {
        id: "jordan-flu-game",
        date: "1997.06.11",
        title: "조던의 '독감 경기' (파이널 5차전)",
        matchup: "시카고 불스 90 : 88 유타 재즈",
        boxScore: "식중독(독감으로 알려짐) 증세로 컨디션이 최악이었던 조던이 38득점 7리바운드 5어시스트를 기록. 종료 25초 전 결승 3점슛을 꽂아넣으며 팀 승리를 이끌었습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=h27FKVS8DbM",
      },
      {
        id: "jordan-last-shot",
        date: "1998.06.14",
        title: "조던의 '라스트 샷' (파이널 6차전)",
        matchup: "시카고 불스 87 : 86 유타 재즈",
        boxScore: "조던 45득점. 종료 18.9초 전 칼 말론에게서 스틸을 뺏어낸 뒤, 5.2초를 남기고 바이런 러셀을 앞에 두고 결승 점프슛을 성공시켜 불스의 두 번째 3연패(통산 6번째 우승)를 완성했습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=vdPQ3QxDZ1s",
      },
    ],
  },
  {
    id: "2000s",
    label: "2000년대",
    games: [
      {
        id: "mcgrady-13-in-33",
        date: "2004.12.09",
        title: "맥그레디, 33초 13득점",
        matchup: "휴스턴 로키츠 81 : 80 샌안토니오 스퍼스",
        boxScore: "종료 35초를 남기고 6점차로 뒤지던 상황에서 트레이시 맥그레디가 연속 3점슛 4방(그중 하나는 4점 플레이)을 몰아넣으며 33초 만에 13득점, 팀의 대역전승을 완성했습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=Ij7b38pch3c",
      },
      {
        id: "kobe-81",
        date: "2006.01.22",
        title: "코비 브라이언트, 81득점",
        matchup: "LA 레이커스 122 : 104 토론토 랩터스",
        boxScore: "코비 브라이언트 81득점(FG 28/46, 3P 7/13, FT 18/20). 전반 18점차로 뒤지던 레이커스가 후반에만 코비 55득점을 앞세워 대역전승. 조던의 단일 경기 63득점을 넘어 NBA 역대 2위 단일 경기 득점 기록입니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=0RvPKROSXEQ",
      },
    ],
  },
  {
    id: "2010s",
    label: "2010년대",
    games: [
      {
        id: "ray-allen-game6",
        date: "2013.06.18",
        title: "레이 알렌의 6차전 3점슛",
        matchup: "마이애미 히트 103 : 100 (OT) 샌안토니오 스퍼스",
        boxScore: "종료 5.2초 전, 3점차로 뒤진 상황에서 레이 알렌이 코너에서 동점 3점슛을 성공시키며 연장으로 경기를 끌고 갔습니다. 히트는 연장전 승리로 시리즈를 7차전까지 끌고 가 결국 우승을 차지했습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=tr6XsZVb-ZE",
      },
      {
        id: "curry-12-threes",
        date: "2016.02.27",
        title: "커리, OKC전 3점슛 12개",
        matchup: "골든스테이트 워리어스 121 : 118 (OT) 오클라호마시티 썬더",
        boxScore: "스테픈 커리 46득점(3P 12/16), 한 경기 최다 3점슛 타이 기록. 연장 종료 0.6초 전 하프코트 부근에서 던진 3점슛이 그대로 꽂히며 결승골이 됐습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=lgrKkNzRkGw",
      },
      {
        id: "lebron-kyrie-game7",
        date: "2016.06.19",
        title: "르브론의 '더 블록' & 카이리의 '더 샷' (파이널 7차전)",
        matchup: "클리블랜드 캐벌리어스 93 : 89 골든스테이트 워리어스",
        boxScore: "89-89로 맞선 종료 1분 50초 전, 르브론 제임스가 안드레 이궈달라의 레이업을 뒤에서 쫓아가 블록. 이어 종료 53초 전 카이리 어빙이 스테픈 커리를 상대로 결승 3점슛을 성공시키며 클리블랜드 프랜차이즈 첫 우승을 확정지었습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=kIF8zcj_J4Y",
      },
      {
        id: "lillard-bad-shot",
        date: "2019.04.23",
        title: "데미안 릴라드의 '배드 샷' (1라운드 5차전)",
        matchup: "포틀랜드 트레일블레이저스 118 : 115 오클라호마시티 썬더",
        boxScore: "데미안 릴라드 50득점. 종료 직전 폴 조지를 앞에 두고 던진 37피트 3점슛이 그대로 들어가며 시리즈를 4승 1패로 마무리. 경기 후 조지가 \"나쁜 슛이었다\"고 평했고 릴라드도 이를 인정하면서 '배드 샷'이라는 별명이 붙었습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=f_EXSf2teB0",
      },
      {
        id: "kawhi-buzzer-beater",
        date: "2019.05.12",
        title: "카와이 레너드의 7차전 버저비터",
        matchup: "토론토 랩터스 92 : 90 필라델피아 세븐티식서스",
        boxScore: "카와이 레너드 41득점. 종료 버저와 동시에 던진 코너 점프슛이 림을 네 번 맞고 들어가며 시리즈를 매듭지었습니다. NBA 플레이오프 역사상 최초의 7차전 버저비터 승리로 기록됐습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=sazwLeaXdEQ",
      },
    ],
  },
  {
    id: "2020s",
    label: "2020년대",
    games: [
      {
        id: "haliburton-finals-game1",
        date: "2025.06.05",
        title: "할리버튼의 파이널 1차전 위닝샷",
        matchup: "인디애나 페이서스 111 : 110 오클라호마시티 썬더",
        boxScore: "플레이오프 시작 전 선수 투표에서 '가장 과대평가된 선수' 1위에 오른 타이리스 할리버튼이, 4쿼터 한때 15점차로 뒤지던 팀을 대역전승으로 이끌었습니다. 종료 0.3초 전 던진 21피트 점프슛이 경기 유일한 페이서스 리드를 만들며 그대로 승부를 갈랐습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=xJtJR6qrg-I",
      },
      {
        id: "anunoby-tip-in",
        date: "2026.06.10",
        title: "아누노비의 팁인 (파이널 4차전)",
        matchup: "뉴욕 닉스 107 : 106 샌안토니오 스퍼스",
        boxScore: "3쿼터 한때 29점차로 뒤지던 닉스가 파이널 역사상 최대 점수차 역전승을 완성. 종료 1.2초 전 오G 아누노비의 팁인이 결승골이 되며 닉스는 시리즈 3승 1패로 앞서갔고, 이후 시리즈를 우승하며 53년 만에 챔피언에 올랐습니다.",
        youtubeUrl: "https://www.youtube.com/watch?v=sOQKRjP3ZJk",
      },
    ],
  },
];

export default function ClassicsPage() {
  const [selectedEra, setSelectedEra] = useState(eras[0].id);
  const current = eras.find((e) => e.id === selectedEra) ?? eras[0];

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
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 sm:text-3xl">
            🕰️ 전설의 명경기 타임머신
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            역사에 남은 NBA 명경기의 박스스코어와 유튜브 하이라이트를 연도별로 모았습니다.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {eras.map((era) => (
            <button
              key={era.id}
              type="button"
              onClick={() => setSelectedEra(era.id)}
              className={
                era.id === selectedEra
                  ? "shrink-0 rounded-full bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
                  : "shrink-0 rounded-full border border-black/[.08] px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
              }
            >
              {era.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {current.games.map((game) => (
            <section
              key={game.id}
              className="flex flex-col gap-2 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {game.date}
              </p>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {game.title}
              </h2>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {game.matchup}
              </p>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {game.boxScore}
              </p>
              {game.youtubeUrl && (
                <a
                  href={game.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-500"
                >
                  ▶ 유튜브 하이라이트 보기
                </a>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
