"use client";

import Link from "next/link";
import { useState } from "react";

type GlossaryTerm = {
  term: string;
  english?: string;
  description: string;
};

type Category = {
  id: string;
  label: string;
  terms: GlossaryTerm[];
};

const categories: Category[] = [
  {
    id: "basic",
    label: "기본 용어",
    terms: [
      {
        term: "필드골 (FG)",
        english: "Field Goal",
        description: "자유투를 제외한 모든 성공한 슛. 성공률은 FG%로 표기합니다.",
      },
      {
        term: "어시스트",
        english: "Assist",
        description: "동료의 득점으로 직접 연결되는 패스를 기록한 선수에게 주어지는 스탯.",
      },
      {
        term: "리바운드",
        english: "Rebound",
        description: "슛이 빗나간 후 공을 잡아내는 것. 자기 팀 공격 실패 후 잡으면 공격 리바운드, 상대 슛 실패 후 잡으면 수비 리바운드.",
      },
      {
        term: "턴오버",
        english: "Turnover",
        description: "공격권을 상대에게 넘겨주는 실책성 플레이 (패스 미스, 트래블링, 더블 드리블 등으로 발생).",
      },
      {
        term: "더블더블 / 트리플더블",
        english: "Double-Double / Triple-Double",
        description: "득점·리바운드·어시스트·스틸·블록 중 두 부문에서 두 자릿수를 기록하면 더블더블, 세 부문이면 트리플더블.",
      },
      {
        term: "픽앤롤",
        english: "Pick and Roll",
        description: "볼 핸들러의 수비수를 동료가 스크린(픽)으로 막아준 뒤, 스크린을 건 선수가 골대 쪽으로 파고드는(롤) 공격 전술.",
      },
      {
        term: "존 디펜스",
        english: "Zone Defense",
        description: "특정 선수를 전담 마크하는 대신 코트의 구역을 나눠 맡는 수비 방식. NBA에서는 일리걸 디펜스 규정 폐지 이후 허용됨.",
      },
      {
        term: "매치업 존",
        english: "Matchup Zone",
        description: "존 디펜스와 맨투맨 수비를 혼합한 방식으로, 구역을 지키면서도 근처 상대 선수를 함께 견제하는 수비.",
      },
    ],
  },
  {
    id: "violation",
    label: "바이얼레이션",
    terms: [
      {
        term: "트래블링",
        english: "Traveling",
        description: "공을 든 채로 규정된 걸음 수(피벗 포함 2보) 이상을 이동하는 바이얼레이션.",
      },
      {
        term: "더블 드리블",
        english: "Double Dribble",
        description: "드리블을 멈춘 후 다시 드리블을 시작하거나, 양손으로 동시에 드리블하는 바이얼레이션.",
      },
      {
        term: "백코트 바이얼레이션",
        english: "Backcourt Violation",
        description: "공격 팀이 프론트코트로 넘어온 공을 다시 백코트로 되돌리면 선언되는 바이얼레이션 (8초 룰과 연관).",
      },
      {
        term: "골텐딩",
        english: "Goaltending",
        description: "슛이 최고점을 지나 하강 중이거나 림 위에 있을 때, 또는 림 안에 있을 때 공을 건드리는 수비 반칙성 바이얼레이션. 성공 처리되어 득점이 인정됩니다.",
      },
      {
        term: "3초 룰",
        english: "3-Second Violation",
        description: "공격 선수가 상대 진영의 페인트존(제한구역) 안에 3초를 초과해 머무를 수 없는 규정.",
      },
      {
        term: "5초 룰",
        english: "5-Second Violation",
        description: "밀착 수비를 당하는 선수가 5초 안에 패스, 드리블, 슛 중 하나를 하지 않으면 선언되는 바이얼레이션.",
      },
      {
        term: "8초 룰",
        english: "8-Second Violation",
        description: "공격 팀이 8초 안에 공을 백코트에서 프론트코트로 넘겨야 하는 규정.",
      },
      {
        term: "24초 룰 (샷클락)",
        english: "24-Second Shot Clock",
        description: "공격 팀은 24초 안에 슛을 시도해야 하며, 림에 맞지 않고 시간이 만료되면 바이얼레이션으로 공격권이 넘어갑니다.",
      },
      {
        term: "고스텐딩",
        english: "Kicked Ball / Goaltending 관련 오해 방지용",
        description: "발로 의도적으로 공을 건드리는 킥볼 바이얼레이션과 골텐딩은 다른 규정이니 혼동에 주의.",
      },
    ],
  },
  {
    id: "foul",
    label: "파울",
    terms: [
      {
        term: "퍼스널 파울",
        english: "Personal Foul",
        description: "신체 접촉으로 인한 일반적인 반칙. 한 경기에서 개인 6회 파울을 기록하면 퇴장(파울 아웃)됩니다.",
      },
      {
        term: "오펜스 파울",
        english: "Offensive Foul",
        description: "공격 선수가 저지르는 반칙 (차징, 일리걸 스크린 등). 턴오버로 기록되며 득점은 무효.",
      },
      {
        term: "차징",
        english: "Charging",
        description: "이미 자리를 잡은 수비수를 공격 선수가 밀치고 지나가는 오펜스 파울.",
      },
      {
        term: "블로킹",
        english: "Blocking",
        description: "수비수가 자리를 잡지 못한 상태에서 공격 선수의 진로를 막아 발생하는 디펜스 파울.",
      },
      {
        term: "테크니컬 파울",
        english: "Technical Foul",
        description: "비신사적 행위(항의, 트래시토크, 벤치 이탈 등)에 대한 파울로, 상대에게 자유투 1개와 공격권이 주어집니다.",
      },
      {
        term: "플래그런트 파울",
        english: "Flagrant Foul",
        description: "불필요하거나 과도한 신체 접촉에 대한 파울. 1단계(과도한 접촉)와 2단계(퇴장 대상의 매우 위험한 접촉)로 구분됩니다.",
      },
      {
        term: "루즈볼 파울",
        english: "Loose Ball Foul",
        description: "누구의 소유도 아닌 공을 다투는 과정에서 발생하는 파울.",
      },
      {
        term: "팀 파울 / 보너스",
        english: "Team Foul / Bonus",
        description: "한 쿼터에 팀 파울이 규정 횟수(5회)를 넘으면 이후 파울마다 상대에게 보너스 자유투가 주어집니다.",
      },
    ],
  },
  {
    id: "gameplay",
    label: "경기 운영",
    terms: [
      {
        term: "타임아웃",
        english: "Timeout",
        description: "감독이 요청해 경기를 잠시 중단시키는 것. 팀당 정규시즌 기준 사용 가능 횟수가 정해져 있습니다.",
      },
      {
        term: "챌린지 제도",
        english: "Coach's Challenge",
        description: "감독이 특정 판정에 대해 비디오 판독을 요청할 수 있는 제도. 팀당 1회 보유하며, 판정이 뒤집히면 챌린지 기회를 유지합니다.",
      },
      {
        term: "인바운드 패스",
        english: "Inbound Pass",
        description: "사이드라인이나 엔드라인 밖에서 경기를 재개할 때 코트 안으로 넣는 첫 패스.",
      },
      {
        term: "버저비터",
        english: "Buzzer Beater",
        description: "쿼터 또는 경기 종료 버저가 울리기 직전에 성공시킨 슛.",
      },
      {
        term: "클러치 타임",
        english: "Clutch Time",
        description: "4쿼터(또는 연장) 마지막 5분 이내, 점수 차가 5점 이하인 접전 상황.",
      },
      {
        term: "연장전",
        english: "Overtime (OT)",
        description: "정규 4쿼터 종료 시 동점이면 진행하는 5분간의 추가 경기.",
      },
      {
        term: "일라이지빌리티 (사치세)",
        english: "Luxury Tax",
        description: "샐러리캡 상한선을 초과한 팀 연봉 총액에 부과되는 벌금 성격의 제도로, 전력 균형을 유도합니다.",
      },
    ],
  },
];

export default function GlossaryPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const current =
    categories.find((c) => c.id === selectedCategory) ?? categories[0];

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
          📖 NBA 용어 & 규정 사전
        </h1>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={
                category.id === selectedCategory
                  ? "shrink-0 rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
                  : "shrink-0 rounded-full border border-black/[.08] px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {current.terms.map((entry) => (
            <section
              key={entry.term}
              className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {entry.term}
                {entry.english && (
                  <span className="ml-2 text-xs font-normal text-teal-600 dark:text-teal-400">
                    {entry.english}
                  </span>
                )}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {entry.description}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
