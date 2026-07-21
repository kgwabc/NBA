import DeckBuilder from "@/app/components/DeckBuilder";

export default function DeckPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">덱 빌더</h2>
      <DeckBuilder />
    </>
  );
}
