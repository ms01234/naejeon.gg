/** Suspense fallback — 랭킹 탭·표 골격 */
export function RankingPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="랭킹 불러오는 중">
      <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-[var(--op-panel)] p-1.5">
        <div className="h-10 flex-1 rounded-lg bg-white/10 sm:max-w-[7rem]" />
        <div className="h-10 flex-1 rounded-lg bg-white/10 sm:max-w-[7rem]" />
        <div className="h-10 flex-1 rounded-lg bg-white/10 sm:max-w-[7rem]" />
      </div>
      <div className="h-4 w-full max-w-xl rounded bg-white/10" />
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[var(--op-panel)]">
        <div className="border-b border-white/10 px-3 py-3">
          <div className="flex gap-4">
            <div className="h-3 w-10 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="ml-auto hidden h-3 w-20 rounded bg-white/10 sm:block" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-white/[0.05] px-3 py-4 last:border-0"
          >
            <div className="h-4 w-8 rounded bg-white/10" />
            <div className="h-4 flex-1 max-w-[10rem] rounded bg-white/10" />
            <div className="h-4 w-14 rounded bg-white/10" />
            <div className="hidden h-4 w-24 rounded bg-white/10 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
