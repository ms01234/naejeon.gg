/** Suspense fallback — 모드 선택 상자 + 랭킹 골격 */
export function RankingPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="랭킹 불러오는 중">
      <div className="h-4 w-full max-w-2xl rounded bg-white/10" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-xl border-2 border-white/10 bg-[var(--op-panel)] sm:h-32" />
        <div className="h-28 rounded-xl border-2 border-white/10 bg-[var(--op-panel)] sm:h-32" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[var(--op-panel)] px-3 py-4 sm:gap-4"
          >
            <div className="h-10 w-8 rounded bg-white/10" />
            <div className="size-11 shrink-0 rounded-md bg-white/10 sm:size-12" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 max-w-[10rem] rounded bg-white/10" />
              <div className="h-3 max-w-[14rem] rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[var(--op-panel)]">
        <div className="border-b border-white/10 px-3 py-3">
          <div className="flex gap-4">
            <div className="h-3 w-10 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="ml-auto hidden h-3 w-20 rounded bg-white/10 sm:block" />
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-white/[0.05] px-3 py-3.5 last:border-0"
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
