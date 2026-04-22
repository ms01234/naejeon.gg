import Link from "next/link";
import { MatchCard } from "@/components/match/MatchCard";
import { RecentMatchesFetchedLog } from "@/components/match/RecentMatchesFetchedLog";
import {
  fetchDistinctPlayerNames,
  fetchRecentCompleteMatches,
  toMatchCardUi,
} from "@/lib/recent-matches";

const HOME_RECENT_LIMIT = 4;

export async function getSearchPlayerNames(): Promise<string[]> {
  const res = await fetchDistinctPlayerNames();
  return res.ok ? res.names : [];
}

/** 홈: 최근 완료 매치 최대 4개 + 더보기(/matches) */
export async function MatchHistory() {
  const matchRes = await fetchRecentCompleteMatches({
    mode: "recent",
    limit: HOME_RECENT_LIMIT,
  });

  const clientLogPayload =
    matchRes.ok === true
      ? {
          ok: true as const,
          mode: "home" as const,
          limit: HOME_RECENT_LIMIT,
          matchCount: matchRes.matches.length,
          totalCount: matchRes.totalCount,
          matches: matchRes.matches.map((m) => ({
            id: m.id,
            guild_id: m.guild_id,
            winner: m.winner,
            duration_seconds: m.duration_seconds,
            created_at: m.created_at,
            participantCount: m.match_participants.length,
            teams: {
              blue: m.match_participants.filter((p) => p.team === "blue").length,
              red: m.match_participants.filter((p) => p.team === "red").length,
            },
          })),
        }
      : { ok: false as const, mode: "home" as const, message: matchRes.message };

  if (!matchRes.ok) {
    return (
      <>
        <RecentMatchesFetchedLog data={clientLogPayload} />
        <div className="rounded-xl border-0 bg-[var(--op-panel)] px-6 py-12 text-center shadow-inner shadow-black/10">
          <p className="text-sm font-semibold text-red-400">
            전적 데이터를 불러오는데 실패했습니다.
          </p>
          <p className="mt-2 text-xs text-red-400/70">{matchRes.message}</p>
        </div>
      </>
    );
  }

  const cardUi = await Promise.all(
    matchRes.matches.map((m) => toMatchCardUi(m)),
  );

  if (cardUi.length === 0) {
    return (
      <>
        <RecentMatchesFetchedLog data={clientLogPayload} />
        <div className="rounded-xl border-0 bg-[var(--op-panel)] px-6 py-14 text-center shadow-inner shadow-black/20">
          <p className="text-sm text-[var(--op-muted)]">
            아직 표시할 전적이 없습니다.
          </p>
        </div>
      </>
    );
  }

  const showMore = matchRes.totalCount > HOME_RECENT_LIMIT;

  return (
    <>
      <RecentMatchesFetchedLog data={clientLogPayload} />
      <ul className="flex flex-col gap-6">
        {cardUi.map((data) => (
          <li key={data.match.id}>
            <MatchCard data={data} />
          </li>
        ))}
      </ul>
      {showMore ? (
        <div className="mt-5 flex justify-center">
          <Link
            href="/matches"
            className="inline-flex w-full max-w-md items-center justify-center rounded-xl border border-[var(--op-border)] bg-[var(--op-elevated)] px-5 py-3.5 text-sm font-semibold text-[var(--op-text)] shadow-inner shadow-black/20 transition hover:border-[var(--op-accent)]/35 hover:bg-[var(--op-panel)] hover:text-[var(--op-accent-bright)]"
          >
            더보기
          </Link>
        </div>
      ) : null}
    </>
  );
}
