"use client";

import Link from "next/link";
import { useState } from "react";
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
  "완료된 내전(양 팀 5인·승자 확정)만 집계합니다. 모든 랭킹은 최소 3판 이상 출전한 소환사만 포함됩니다.";

const TABS: { id: TabId; label: string }[] = [
  { id: "win", label: "승률" },
  { id: "kda", label: "KDA" },
  { id: "pool", label: "올라운더" },
];

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
        조건을 만족하는 소환사가 없습니다. (완료 매치 3판 이상)
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[var(--op-muted)]">
            <th className="w-14 px-3 py-3 font-medium">순위</th>
            <th className="px-3 py-3 font-medium">소환사</th>
            <th className="w-24 px-3 py-3 text-right font-medium">승률</th>
            <th className="hidden w-28 px-3 py-3 text-right font-medium sm:table-cell">
              전적
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((r) => {
            const mc = medalColor(r.rank);
            return (
              <tr key={r.nickname} className={rowShellClass(r.rank)}>
                <td className="px-3 py-3 align-middle">
                  <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-[var(--op-text)]">
                    {mc ? (
                      <Medal className="size-4 shrink-0" style={{ color: mc }} aria-hidden />
                    ) : null}
                    {r.rank}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/players/${encodeURIComponent(r.nickname)}`}
                    className="font-medium text-[var(--op-accent-bright)] hover:underline"
                  >
                    {r.nickname}
                  </Link>
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-[var(--op-text)]">
                  {r.winRatePercent.toFixed(1)}%
                </td>
                <td className="hidden px-3 py-3 text-right tabular-nums text-[var(--op-muted)] sm:table-cell">
                  {r.wins}승 {r.losses}패 · {r.games}판
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[var(--op-muted)]">
            <th className="w-14 px-3 py-3 font-medium">순위</th>
            <th className="px-3 py-3 font-medium">소환사</th>
            <th className="w-28 px-3 py-3 text-right font-medium">KDA</th>
            <th className="hidden w-36 px-3 py-3 text-right font-medium md:table-cell">
              K / D / A
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((r) => {
            const mc = medalColor(r.rank);
            return (
              <tr key={r.nickname} className={rowShellClass(r.rank)}>
                <td className="px-3 py-3 align-middle">
                  <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-[var(--op-text)]">
                    {mc ? (
                      <Medal className="size-4 shrink-0" style={{ color: mc }} aria-hidden />
                    ) : null}
                    {r.rank}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/players/${encodeURIComponent(r.nickname)}`}
                    className="font-medium text-[var(--op-accent-bright)] hover:underline"
                  >
                    {r.nickname}
                  </Link>
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-[var(--op-text)]">
                  {formatKdaDisplay(r)}
                </td>
                <td className="hidden px-3 py-3 text-right tabular-nums text-[var(--op-muted)] md:table-cell">
                  {r.kills} / {r.deaths} / {r.assists}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[var(--op-muted)]">
            <th className="w-14 px-3 py-3 font-medium">순위</th>
            <th className="px-3 py-3 font-medium">소환사</th>
            <th className="px-3 py-3 font-medium">챔피언 풀</th>
            <th className="w-20 px-3 py-3 text-right font-medium">판수</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((r) => {
            const mc = medalColor(r.rank);
            return (
              <tr key={r.nickname} className={rowShellClass(r.rank)}>
                <td className="px-3 py-3 align-middle">
                  <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-[var(--op-text)]">
                    {mc ? (
                      <Medal className="size-4 shrink-0" style={{ color: mc }} aria-hidden />
                    ) : null}
                    {r.rank}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/players/${encodeURIComponent(r.nickname)}`}
                    className="font-medium text-[var(--op-accent-bright)] hover:underline"
                  >
                    {r.nickname}
                  </Link>
                </td>
                <td className="px-3 py-3 text-[var(--op-muted)]">
                  총 {r.uniqueChampionCount}종의 챔피언 사용
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--op-text)]">
                  {r.games}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
