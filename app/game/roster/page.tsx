import RosterBuilder from "@/app/components/RosterBuilder";

export default function RosterPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">선발 라인업</h2>
      <RosterBuilder />
    </>
  );
}
