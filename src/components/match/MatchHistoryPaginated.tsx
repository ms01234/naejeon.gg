import Link from "next/link";
import { redirect } from "next/navigation";
import { MatchCard } from "@/components/match/MatchCard";
import { RecentMatchesFetchedLog } from "@/components/match/RecentMatchesFetchedLog";
import {
  fetchRecentCompleteMatches,
  toMatchCardUi,
} from "@/lib/recent-matches";

const PAGE_SIZE = 10;

type Props = { page: number };

export async function MatchHistoryPaginated({ page }: Props) {
  const matchRes = await fetchRecentCompleteMatches({
    mode: "page",
    page,
    pageSize: PAGE_SIZE,
  });

  if (matchRes.ok && matchRes.totalCount > 0) {
    const totalPages = Math.max(1, Math.ceil(matchRes.totalCount / PAGE_SIZE));
    if (page > totalPages) {
      redirect(`/matches?page=${totalPages}`);
    }
  }

  const clientLogPayload =
    matchRes.ok === true
      ? {
          ok: true as const,
          mode: "paginated" as const,
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
        <div className="rounded-xl border-0 bg-[var(--op-panel)] px-6 py-14 text-center shadow-inner shadow-black/20">
          <p className="text-sm text-[var(--op-muted)]">
            아직 표시할 전적이 없습니다.
          </p>
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
      />
    </>
  );
}

function MatchPaginationNav({
  page,
  totalPages,
  totalCount,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
}) {
  if (totalPages <= 1) {
    return (
      <p className="mt-8 text-center text-xs text-[var(--op-muted)]">
        총 {totalCount.toLocaleString("ko-KR")}경기
      </p>
    );
  }

  const prevHref = page > 1 ? `/matches?page=${page - 1}` : null;
  const nextHref = page < totalPages ? `/matches?page=${page + 1}` : null;

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
