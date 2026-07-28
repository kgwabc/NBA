import RosterBuilder from "@/app/components/RosterBuilder";

export default function RosterPage() {
  return (
    <>
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50 sm:text-xl">선발 라인업</h2>
      <RosterBuilder />
    </>
  );
}
