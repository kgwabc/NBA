import BattleSimulator from "@/app/components/BattleSimulator";

export default function BattlePage() {
  return (
    <>
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50 sm:text-xl">배틀</h2>
      <BattleSimulator />
    </>
  );
}
