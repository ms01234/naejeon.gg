import { RankingPageSkeleton } from "@/components/ranking/RankingPageSkeleton";

export default function RankingLoading() {
  return (
    <div className="min-h-screen bg-[var(--op-page)]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-10">
        <div className="mb-8 h-8 w-40 animate-pulse rounded bg-white/10" />
        <div className="mb-8 h-4 w-full max-w-lg animate-pulse rounded bg-white/10" />
        <RankingPageSkeleton />
      </div>
    </div>
  );
}
