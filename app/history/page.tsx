import Link from "next/link";

type Section = {
  title: string;
  body: string;
};

const sections: Section[] = [
  {
    title: "1946 — BAA 창설",
    body: "1946년, 미국과 캐나다의 대형 아레나 소유주들이 모여 농구 리그 'BAA(Basketball Association of America)'를 만들었습니다. 이 BAA가 훗날 NBA의 뿌리가 됩니다.",
  },
  {
    title: "1949 — NBA 출범",
    body: "BAA가 경쟁 리그였던 NBL(National Basketball League)과 합병하면서 지금의 이름인 NBA(National Basketball Association)가 탄생했습니다.",
  },
  {
    title: "1950~60년대 — 셀틱스 왕조",
    body: "빌 러셀을 앞세운 보스턴 셀틱스가 1957년부터 1969년까지 13시즌 동안 11번의 우승을 차지하며 초창기 NBA를 지배했습니다. 프로 스포츠 역사상 손꼽히는 왕조로 평가받습니다.",
  },
  {
    title: "1954 — 24초 샷클락 도입",
    body: "경기가 지나치게 느려지는 것을 막기 위해 24초 샷클락이 도입되며 NBA는 지금과 같은 빠른 템포의 경기 방식을 갖추게 되었습니다.",
  },
  {
    title: "1979 — 3점슛 도입",
    body: "1979-80 시즌부터 3점슛 라인이 정식 도입되었습니다. 처음엔 파격적인 규칙으로 여겨졌지만, 이후 NBA 전술과 득점 방식을 근본적으로 바꾸는 계기가 되었습니다.",
  },
  {
    title: "1980년대 — 매직 vs 버드",
    body: "매직 존슨(LA 레이커스)과 래리 버드(보스턴 셀틱스)의 라이벌 구도가 리그 전체 인기를 견인했습니다. 두 팀은 이 시기 NBA 파이널을 여러 차례 양분하며 '쇼타임' 시대를 열었습니다.",
  },
  {
    title: "1990년대 — 조던의 시대",
    body: "마이클 조던과 시카고 불스가 1990년대 두 차례의 3연패(1991~1993, 1996~1998)를 달성하며 NBA를 전 세계적인 인기 스포츠로 끌어올렸습니다.",
  },
  {
    title: "2000년대 이후 — 현대 NBA",
    body: "코비 브라이언트, 팀 던컨을 거쳐 르브론 제임스, 스테픈 커리 등이 활약하며 3점슛 중심의 공간 농구가 자리 잡았습니다. 데이터 분석과 국제화가 진행되며 NBA는 지금도 계속 진화하고 있습니다.",
  },
];

export default function HistoryPage() {
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

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 pb-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 sm:text-3xl">
          🏀 NBA HISTORY
        </h1>

        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
