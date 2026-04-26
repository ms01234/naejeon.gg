"use client";

import Link from "next/link";
import { useState } from "react";
import { Crosshair, Percent } from "lucide-react";
import { rankingKdaDisplayTextColorHex } from "@/lib/ranking-kda-color";
import type { KdaRankEntry, WinRateRankEntry } from "@/lib/ranking-stats";
import { HallOfFameEntryCard } from "@/components/match/HallOfFameEntryCard";

export type RankingModeClientProps = {
  winRate: WinRateRankEntry[];
  kda: KdaRankEntry[];
  winTopIcons: (string | null)[];
  kdaTopIcons: (string | null)[];
};

type Mode = "win" | "kda";

const ACTIVE_BORDER = "border-[#5CAAFF] ring-1 ring-[#5CAAFF]/40 shadow-[0_0_0_1px_rgba(92,170,255,0.25)]";

function TableScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain sm:mx-0">
      {children}
    </div>
  );
}

function rowShellClass(): string {
  return "border border-white/[0.06] bg-[var(--op-surface)]/80";
}

function formatKdaDisplay(row: KdaRankEntry): string {
  if (row.perfect) return "Perfect";
  return row.kdaValue.toFixed(2);
}

function kdaNumericForColor(row: KdaRankEntry): number {
  if (row.perfect) return row.kdaValue;
  return row.kdaValue;
}

/** 리스트 전적 표기: `26판 (17승 9패)` */
function formatWinRecordLine(r: WinRateRankEntry): string {
  return `${r.games}판 (${r.wins}승 ${r.losses}패)`;
}

function WinRateRestTable({ rows }: { rows: WinRateRankEntry[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <TableScroll>
        <table className="w-full min-w-[18rem] table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-0 sm:text-sm sm:leading-normal">
          <colgroup>
            <col className="w-10 sm:w-12" />
            <col />
            <col className="w-[4.5rem] sm:w-[5rem]" />
            <col className="w-[10.75rem] sm:w-[11.25rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wide text-[var(--op-muted)] sm:text-xs">
              <th className="px-1.5 py-2.5 text-right tabular-nums sm:px-3 sm:py-3">
                순위
              </th>
              <th className="min-w-0 px-1.5 py-2.5 sm:px-3 sm:py-3">소환사</th>
              <th className="whitespace-nowrap px-1 py-2.5 text-right tabular-nums sm:px-2 sm:py-3">
                승률
              </th>
              <th className="whitespace-nowrap py-2.5 pl-1 pr-2 text-right tabular-nums sm:py-3 sm:pr-3">
                전적
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => (
              <tr key={r.nickname} className={rowShellClass()}>
                <td className="px-1.5 py-2 text-right align-middle tabular-nums sm:px-3 sm:py-3">
                  <span className="inline-block min-w-[1.5ch] text-right font-semibold text-[var(--op-text)]">
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
                <td className="box-border whitespace-nowrap px-1 py-2 text-right align-middle font-semibold tabular-nums text-[var(--op-text)] sm:px-2 sm:py-3">
                  {r.winRatePercent.toFixed(1)}%
                </td>
                <td className="box-border whitespace-nowrap py-2 pl-1 pr-2 text-right align-middle tabular-nums text-[var(--op-muted)] sm:py-3 sm:pr-3">
                  {formatWinRecordLine(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}

function KdaRestTable({ rows }: { rows: KdaRankEntry[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <TableScroll>
        <table className="w-full min-w-[17.5rem] table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-0 sm:text-sm sm:leading-normal">
          <colgroup>
            <col className="w-10 sm:w-12" />
            <col />
            <col className="w-[4.75rem] sm:w-[5.25rem]" />
            <col className="w-[7.25rem] sm:w-[7.75rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wide text-[var(--op-muted)] sm:text-xs">
              <th className="px-1.5 py-2.5 text-right tabular-nums sm:px-3 sm:py-3">
                순위
              </th>
              <th className="min-w-0 px-1.5 py-2.5 sm:px-3 sm:py-3">소환사</th>
              <th className="whitespace-nowrap px-1 py-2.5 text-right tabular-nums sm:px-2 sm:py-3">
                KDA
              </th>
              <th className="whitespace-nowrap py-2.5 pl-1 pr-2 text-right tabular-nums sm:py-3 sm:pr-3">
                K/D/A
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => {
              const kdaColor = rankingKdaDisplayTextColorHex(kdaNumericForColor(r));
              return (
                <tr key={r.nickname} className={rowShellClass()}>
                  <td className="px-1.5 py-2 text-right align-middle tabular-nums sm:px-3 sm:py-3">
                    <span className="inline-block min-w-[1.5ch] text-right font-semibold text-[var(--op-text)]">
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
                  <td
                    className="box-border whitespace-nowrap px-1 py-2 text-right align-middle font-semibold tabular-nums sm:px-2 sm:py-3"
                    style={{ color: kdaColor }}
                  >
                    {formatKdaDisplay(r)}
                  </td>
                  <td className="box-border whitespace-nowrap py-2 pl-1 pr-2 text-right align-middle font-medium tabular-nums tracking-tight text-[var(--op-muted)] sm:py-3 sm:pr-3">
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

function WinRankingBody({
  winRate,
  winTopIcons,
}: {
  winRate: WinRateRankEntry[];
  winTopIcons: (string | null)[];
}) {
  const top = winRate.slice(0, 3);
  const rest = winRate.slice(3);

  if (winRate.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-[var(--op-panel)] px-4 py-10 text-center text-sm text-[var(--op-muted)]">
        조건을 만족하는 소환사가 없습니다. (완료 매치 9판 이상)
      </p>
    );
  }

  return (
    <>
      <ul className="mb-6 flex flex-col gap-3">
        {top.map((e, i) => (
          <li key={`${e.rank}-${e.nickname}`}>
            <HallOfFameEntryCard
              rank={e.rank as 1 | 2 | 3}
              nickname={e.nickname}
              championIconUrl={winTopIcons[i] ?? null}
              wins={e.wins}
              winRatePercent={e.winRatePercent}
              avgKda={e.avgKda}
            />
          </li>
        ))}
      </ul>
      <WinRateRestTable rows={rest} />
    </>
  );
}

function KdaRankingBody({
  kda,
  kdaTopIcons,
}: {
  kda: KdaRankEntry[];
  kdaTopIcons: (string | null)[];
}) {
  const top = kda.slice(0, 3);
  const rest = kda.slice(3);

  if (kda.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-[var(--op-panel)] px-4 py-10 text-center text-sm text-[var(--op-muted)]">
        조건을 만족하는 소환사가 없습니다. (완료 매치 5판 이상)
      </p>
    );
  }

  return (
    <>
      <ul className="mb-6 flex flex-col gap-3">
        {top.map((e, i) => {
          const cardKda = (e.kills + e.assists) / Math.max(e.deaths, 1);
          const winPct =
            e.games > 0 ? Math.round((e.wins / e.games) * 1000) / 10 : 0;
          return (
            <li key={`${e.rank}-${e.nickname}`}>
              <HallOfFameEntryCard
                rank={e.rank as 1 | 2 | 3}
                nickname={e.nickname}
                championIconUrl={kdaTopIcons[i] ?? null}
                wins={e.wins}
                winRatePercent={winPct}
                avgKda={cardKda}
                statEmphasis="kda"
              />
            </li>
          );
        })}
      </ul>
      <KdaRestTable rows={rest} />
    </>
  );
}

export function RankingModeClient({
  winRate,
  kda,
  winTopIcons,
  kdaTopIcons,
}: RankingModeClientProps) {
  const [mode, setMode] = useState<Mode>("win");

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-2 gap-2"
        role="tablist"
        aria-label="랭킹 종류 선택"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "win"}
          onClick={() => setMode("win")}
          className={[
            "flex items-center justify-center gap-2 rounded-lg border-2 bg-[var(--op-panel)] px-3 py-2.5 text-center transition-all duration-200 sm:gap-2.5 sm:rounded-xl sm:px-4 sm:py-2.5",
            mode === "win"
              ? ACTIVE_BORDER
              : "border-white/[0.08] hover:border-white/15 hover:bg-white/[0.03]",
          ].join(" ")}
        >
          <Percent
            className="size-4 shrink-0 text-[#5CAAFF] sm:size-[1.05rem]"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-sm font-semibold tracking-tight text-[var(--op-text)]">
            승률 랭킹
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === "kda"}
          onClick={() => setMode("kda")}
          className={[
            "flex items-center justify-center gap-2 rounded-lg border-2 bg-[var(--op-panel)] px-3 py-2.5 text-center transition-all duration-200 sm:gap-2.5 sm:rounded-xl sm:px-4 sm:py-2.5",
            mode === "kda"
              ? ACTIVE_BORDER
              : "border-white/[0.08] hover:border-white/15 hover:bg-white/[0.03]",
          ].join(" ")}
        >
          <Crosshair
            className="size-4 shrink-0 text-[#00E2A7] sm:size-[1.05rem]"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-sm font-semibold tracking-tight text-[var(--op-text)]">
            KDA 랭킹
          </span>
        </button>
      </div>

      <div
        key={mode}
        className="animate-ranking-fade-in"
        role="tabpanel"
        aria-live="polite"
      >
        {mode === "win" ? (
          <WinRankingBody winRate={winRate} winTopIcons={winTopIcons} />
        ) : (
          <KdaRankingBody kda={kda} kdaTopIcons={kdaTopIcons} />
        )}
      </div>
    </div>
  );
}
