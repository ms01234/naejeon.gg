export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import { MatchHistoryPaginated } from "@/components/match/MatchHistoryPaginated";
import { MatchesFilterBar } from "@/components/match/MatchesFilterBar";
import { parseLaneQueryParam } from "@/lib/match-history-filters";

type SearchParams = Promise<{ page?: string; q?: string; lane?: string }>;

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const raw = parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(raw) && raw >= 1 ? raw : 1;
  const playerQuery = typeof sp.q === "string" ? sp.q : "";
  const lane = parseLaneQueryParam(
    typeof sp.lane === "string" ? sp.lane : undefined,
  );

  return (
    <div className="min-h-screen bg-[var(--op-page)]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-10">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--op-text)]">
          전적
        </h1>
        <p className="mb-6 text-sm text-[var(--op-muted)]">
          완료된 내전 매치를 최신순으로 확인할 수 있습니다.
        </p>

        <Suspense
          fallback={
            <div
              className="mb-8 h-28 animate-pulse rounded-xl bg-white/[0.06]"
              aria-hidden
            />
          }
        >
          <MatchesFilterBar initialQuery={playerQuery} />
        </Suspense>

        <MatchHistoryPaginated
          page={page}
          playerQuery={playerQuery}
          lane={lane}
        />
      </div>
    </div>
  );
}
