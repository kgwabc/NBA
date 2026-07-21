import CollectionGrid from "@/app/components/CollectionGrid";

export default function CollectionPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">내 카드 컬렉션</h2>
      <CollectionGrid />
    </>
  );
}
