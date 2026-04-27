export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MatchHistoryPaginated } from "@/components/match/MatchHistoryPaginated";
import { MatchesFilterBar } from "@/components/match/MatchesFilterBar";
import {
  buildMatchesPageHref,
  parseLaneQueryParam,
} from "@/lib/match-history-filters";
import { resolveCanonicalParticipantNickname } from "@/lib/participant-nickname-canonical";
import { fetchDistinctPlayerNames } from "@/lib/recent-matches";

type SearchParams = Promise<{ page?: string; q?: string; lane?: string }>;

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const raw = parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(raw) && raw >= 1 ? raw : 1;
  const lane = parseLaneQueryParam(
    typeof sp.lane === "string" ? sp.lane : undefined,
  );
  const qParam = typeof sp.q === "string" ? sp.q : "";
  const trimmedQ = qParam.trim();
  const resolvedQ = trimmedQ
    ? resolveCanonicalParticipantNickname(trimmedQ)
    : "";

  if (trimmedQ && resolvedQ !== trimmedQ) {
    redirect(buildMatchesPageHref(page, { q: resolvedQ, lane }));
  }

  const playerQuery = resolvedQ;
  const namesRes = await fetchDistinctPlayerNames();
  const nicknames = namesRes.ok ? namesRes.names : [];

  return (
    <div className="min-h-screen bg-[var(--op-page)]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-[var(--op-text)]">
          전적
        </h1>

        <Suspense
          fallback={
            <div
              className="mb-8 h-14 animate-pulse rounded-xl bg-white/[0.06]"
              aria-hidden
            />
          }
        >
          <MatchesFilterBar
            initialQuery={playerQuery}
            nicknames={nicknames}
          />
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
