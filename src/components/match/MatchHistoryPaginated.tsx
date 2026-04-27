import Link from "next/link";
import { redirect } from "next/navigation";
import { MatchCard } from "@/components/match/MatchCard";
import { RecentMatchesFetchedLog } from "@/components/match/RecentMatchesFetchedLog";
import type { LaneTab } from "@/lib/lane";
import { buildMatchesPageHref } from "@/lib/match-history-filters";
import {
  fetchRecentCompleteMatches,
  toMatchCardUi,
} from "@/lib/recent-matches";

const PAGE_SIZE = 10;

type Props = {
  page: number;
  playerQuery: string;
  lane: LaneTab;
};

export async function MatchHistoryPaginated({
  page,
  playerQuery,
  lane,
}: Props) {
  const filtersActive =
    playerQuery.trim().length > 0 || lane !== "ALL";

  const matchRes = filtersActive
    ? await fetchRecentCompleteMatches({
        mode: "filterPage",
        page,
        pageSize: PAGE_SIZE,
        playerQuery,
        lane,
      })
    : await fetchRecentCompleteMatches({
        mode: "page",
        page,
        pageSize: PAGE_SIZE,
      });

  const queryOpts = { q: playerQuery, lane };

  if (matchRes.ok) {
    if (matchRes.totalCount === 0 && page > 1) {
      redirect(buildMatchesPageHref(1, queryOpts));
    }
    if (matchRes.totalCount > 0) {
      const totalPages = Math.max(
        1,
        Math.ceil(matchRes.totalCount / PAGE_SIZE),
      );
      if (page > totalPages) {
        redirect(buildMatchesPageHref(totalPages, queryOpts));
      }
    }
  }

  const clientLogPayload =
    matchRes.ok === true
      ? {
          ok: true as const,
          mode: "paginated" as const,
          filtered: filtersActive,
          page,
          pageSize: PAGE_SIZE,
          matchCount: matchRes.matches.length,
          totalCount: matchRes.totalCount,
          matches: matchRes.matches.map((m) => ({
            id: m.id,
            guild_id: m.guild_id,
            winner: m.winner,
            created_at: m.created_at,
          })),
        }
      : {
          ok: false as const,
          mode: "paginated" as const,
          page,
          message: matchRes.message,
        };

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

  const totalPages = Math.max(1, Math.ceil(matchRes.totalCount / PAGE_SIZE));
  const cardUi = await Promise.all(
    matchRes.matches.map((m) => toMatchCardUi(m)),
  );

  if (cardUi.length === 0) {
    return (
      <>
        <RecentMatchesFetchedLog data={clientLogPayload} />
        <div className="rounded-xl border border-white/[0.07] bg-[var(--op-panel)] px-8 py-16 text-center shadow-inner shadow-black/25">
          <p className="text-[15px] font-semibold text-[var(--op-text)]">
            {filtersActive
              ? "해당 유저의 전적이 없습니다."
              : "아직 표시할 전적이 없습니다."}
          </p>
          {filtersActive ? (
            <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed text-[var(--op-muted)]">
              검색어·라인 조건을 바꿔 보거나 필터를 초기화해 보세요.
            </p>
          ) : null}
        </div>
      </>
    );
  }

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
      <MatchPaginationNav
        page={page}
        totalPages={totalPages}
        totalCount={matchRes.totalCount}
        playerQuery={playerQuery}
        lane={lane}
      />
    </>
  );
}

function MatchPaginationNav({
  page,
  totalPages,
  totalCount,
  playerQuery,
  lane,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  playerQuery: string;
  lane: LaneTab;
}) {
  const queryOpts = { q: playerQuery, lane };

  if (totalPages <= 1) {
    return (
      <p className="mt-8 text-center text-xs tabular-nums text-[var(--op-muted)]">
        총 {totalCount.toLocaleString("ko-KR")}경기
      </p>
    );
  }

  const prevHref =
    page > 1 ? buildMatchesPageHref(page - 1, queryOpts) : null;
  const nextHref =
    page < totalPages ? buildMatchesPageHref(page + 1, queryOpts) : null;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      aria-label="전적 페이지"
    >
      {prevHref ? (
        <Link
          href={prevHref}
          className="rounded-lg border border-[var(--op-border)] bg-[var(--op-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--op-text)] transition hover:border-[var(--op-accent)]/40 hover:text-[var(--op-accent-bright)]"
        >
          이전 페이지
        </Link>
      ) : (
        <span className="rounded-lg border border-transparent bg-black/15 px-4 py-2.5 text-sm font-medium text-[var(--op-muted)]/50">
          이전 페이지
        </span>
      )}
      <span className="min-w-[8rem] select-none text-center text-sm tabular-nums text-[var(--op-muted)]">
        <span className="font-semibold text-[var(--op-text)]">{page}</span>
        <span className="mx-1.5 text-[var(--op-muted)]">/</span>
        {totalPages}
      </span>
      {nextHref ? (
        <Link
          href={nextHref}
          className="rounded-lg border border-[var(--op-border)] bg-[var(--op-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--op-text)] transition hover:border-[var(--op-accent)]/40 hover:text-[var(--op-accent-bright)]"
        >
          다음 페이지
        </Link>
      ) : (
        <span className="rounded-lg border border-transparent bg-black/15 px-4 py-2.5 text-sm font-medium text-[var(--op-muted)]/50">
          다음 페이지
        </span>
      )}
    </nav>
  );
}
