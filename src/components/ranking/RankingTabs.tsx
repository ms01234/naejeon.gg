"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Medal } from "lucide-react";
import {
  RANK_MEDAL_BRONZE,
  RANK_MEDAL_GOLD,
  RANK_MEDAL_SILVER,
} from "@/lib/constants";
import type {
  AllRounderRankEntry,
  KdaRankEntry,
  RankingsPayload,
  WinRateRankEntry,
} from "@/lib/ranking-stats";

type TabId = "win" | "kda" | "pool";

const RANKING_HINT =
  "완료된 내전(양 팀 5인·승자 확정)만 집계합니다. 승률은 최소 5판, KDA·챔피언 폭은 최소 3판 이상 출전한 소환사만 포함됩니다.";

const TABS: { id: TabId; label: string }[] = [
  { id: "win", label: "승률" },
  { id: "kda", label: "KDA" },
  { id: "pool", label: "챔피언 폭" },
];

/** 좁은 화면에서 표가 깨지지 않도록 가로 스크롤 + 살짝 작은 글자 */
function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain sm:mx-0">
      {children}
    </div>
  );
}

function medalColor(rank: number): string | null {
  if (rank === 1) return RANK_MEDAL_GOLD;
  if (rank === 2) return RANK_MEDAL_SILVER;
  if (rank === 3) return RANK_MEDAL_BRONZE;
  return null;
}

function rowShellClass(rank: number): string {
  if (rank <= 3) {
    return "border border-white/[0.12] bg-[var(--op-surface)] shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]";
  }
  return "border border-white/[0.06] bg-[var(--op-surface)]/80";
}

function formatKdaDisplay(row: KdaRankEntry): string {
  if (row.perfect) return "Perfect";
  return row.kdaValue.toFixed(2);
}

function WinRateTable({ rows }: { rows: WinRateRankEntry[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-[var(--op-panel)] px-4 py-8 text-center text-sm text-[var(--op-muted)]">
        조건을 만족하는 소환사가 없습니다. (승률 랭킹: 완료 매치 5판 이상)
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <TableScroll>
        <table className="w-full min-w-[20.5rem] table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-0 sm:text-sm sm:leading-normal">
          <colgroup>
            <col className="w-11 sm:w-14" />
            <col className="w-[32%] sm:w-[30%]" />
            <col className="w-[4.25rem] sm:w-24" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wide text-[var(--op-muted)] sm:text-xs">
              <th className="px-1.5 py-2.5 sm:px-3 sm:py-3">순위</th>
              <th className="min-w-0 px-1.5 py-2.5 sm:px-3 sm:py-3">소환사</th>
              <th className="whitespace-nowrap px-1.5 py-2.5 text-right sm:px-3 sm:py-3">
                승률
              </th>
              <th className="whitespace-nowrap px-1.5 py-2.5 pr-2 text-right sm:px-3 sm:py-3">
                전적
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => {
              const mc = medalColor(r.rank);
              return (
                <tr key={r.nickname} className={rowShellClass(r.rank)}>
                  <td className="px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                    <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-[var(--op-text)] sm:gap-1.5">
                      {mc ? (
                        <Medal
                          className="size-3.5 shrink-0 sm:size-4"
                          style={{ color: mc }}
                          aria-hidden
                        />
                      ) : null}
                      {r.rank}
                    </span>
                  </td>
                  <td className="min-w-0 max-w-0 px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                    <Link
                      href={`/players/${encodeURIComponent(r.nickname)}`}
                      className="block truncate font-medium text-[var(--op-accent-bright)] hover:underline"
                      title={r.nickname}
                    >
                      {r.nickname}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2 text-right font-semibold tabular-nums text-[var(--op-text)] sm:px-3 sm:py-3">
                    {r.winRatePercent.toFixed(1)}%
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2 pr-2 text-right tabular-nums text-[var(--op-muted)] sm:px-3 sm:py-3">
                    {r.wins}승{r.losses}패·{r.games}판
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}

function KdaTable({ rows }: { rows: KdaRankEntry[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-[var(--op-panel)] px-4 py-8 text-center text-sm text-[var(--op-muted)]">
        조건을 만족하는 소환사가 없습니다. (완료 매치 3판 이상)
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <TableScroll>
        <table className="w-full min-w-[19rem] table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-0 sm:text-sm sm:leading-normal">
          <colgroup>
            <col className="w-11 sm:w-14" />
            <col className="w-[34%] sm:w-[32%]" />
            <col className="w-[3.75rem] sm:w-24" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wide text-[var(--op-muted)] sm:text-xs">
              <th className="px-1.5 py-2.5 sm:px-3 sm:py-3">순위</th>
              <th className="min-w-0 px-1.5 py-2.5 sm:px-3 sm:py-3">소환사</th>
              <th className="whitespace-nowrap px-1.5 py-2.5 text-right sm:px-3 sm:py-3">
                KDA
              </th>
              <th className="whitespace-nowrap px-1.5 py-2.5 pr-2 text-right sm:px-3 sm:py-3">
                K/D/A
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => {
              const mc = medalColor(r.rank);
              return (
                <tr key={r.nickname} className={rowShellClass(r.rank)}>
                  <td className="px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                    <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-[var(--op-text)] sm:gap-1.5">
                      {mc ? (
                        <Medal
                          className="size-3.5 shrink-0 sm:size-4"
                          style={{ color: mc }}
                          aria-hidden
                        />
                      ) : null}
                      {r.rank}
                    </span>
                  </td>
                  <td className="min-w-0 max-w-0 px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                    <Link
                      href={`/players/${encodeURIComponent(r.nickname)}`}
                      className="block truncate font-medium text-[var(--op-accent-bright)] hover:underline"
                      title={r.nickname}
                    >
                      {r.nickname}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2 text-right font-semibold tabular-nums text-[var(--op-text)] sm:px-3 sm:py-3">
                    {formatKdaDisplay(r)}
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2 pr-2 text-right tabular-nums text-[var(--op-muted)] sm:px-3 sm:py-3">
                    {r.kills}/{r.deaths}/{r.assists}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}

function PoolTable({ rows }: { rows: AllRounderRankEntry[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-[var(--op-panel)] px-4 py-8 text-center text-sm text-[var(--op-muted)]">
        조건을 만족하는 소환사가 없습니다. (완료 매치 3판 이상)
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <TableScroll>
        <table className="w-full min-w-[22.5rem] table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-0 sm:text-sm sm:leading-normal">
          <colgroup>
            <col className="w-11 sm:w-14" />
            <col className="w-[30%] sm:w-[28%]" />
            <col />
            <col className="w-12 sm:w-16" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wide text-[var(--op-muted)] sm:text-xs">
              <th className="px-1.5 py-2.5 sm:px-3 sm:py-3">순위</th>
              <th className="min-w-0 px-1.5 py-2.5 sm:px-3 sm:py-3">소환사</th>
              <th className="px-1.5 py-2.5 sm:px-3 sm:py-3">챔피언 폭</th>
              <th className="whitespace-nowrap px-1.5 py-2.5 pr-2 text-right sm:px-3 sm:py-3">
                판수
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => {
              const mc = medalColor(r.rank);
              return (
                <tr key={r.nickname} className={rowShellClass(r.rank)}>
                  <td className="px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                    <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-[var(--op-text)] sm:gap-1.5">
                      {mc ? (
                        <Medal
                          className="size-3.5 shrink-0 sm:size-4"
                          style={{ color: mc }}
                          aria-hidden
                        />
                      ) : null}
                      {r.rank}
                    </span>
                  </td>
                  <td className="min-w-0 max-w-0 px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                    <Link
                      href={`/players/${encodeURIComponent(r.nickname)}`}
                      className="block truncate font-medium text-[var(--op-accent-bright)] hover:underline"
                      title={r.nickname}
                    >
                      {r.nickname}
                    </Link>
                  </td>
                  <td className="min-w-0 whitespace-nowrap px-1.5 py-2 text-[var(--op-muted)] sm:px-3 sm:py-3">
                    총 {r.uniqueChampionCount}종의 챔피언 사용
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2 pr-2 text-right tabular-nums text-[var(--op-text)] sm:px-3 sm:py-3">
                    {r.games}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}

export function RankingTabs({ data }: { data: RankingsPayload }) {
  const [tab, setTab] = useState<TabId>("win");

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-[var(--op-panel)] p-1.5"
        role="tablist"
        aria-label="랭킹 종류"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={[
                "min-w-[5.5rem] flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                active
                  ? "bg-[var(--op-accent)] text-white shadow-sm"
                  : "text-[var(--op-muted)] hover:bg-white/[0.06] hover:text-[var(--op-text)]",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-[var(--op-muted)]">{RANKING_HINT}</p>

      {tab === "win" ? <WinRateTable rows={data.winRate} /> : null}
      {tab === "kda" ? <KdaTable rows={data.kda} /> : null}
      {tab === "pool" ? <PoolTable rows={data.allRounder} /> : null}
    </div>
  );
}
