"use client";

import { useMemo, useState, type ReactNode } from "react";
import { aggregateChampionStats } from "@/lib/match-stats";
import type { PlayerStatRow } from "@/lib/match-stats";
import type { ChampionAggregate } from "@/types/match";
import {
  LANE_IDS,
  LANE_LABEL_KO,
  type LaneTab,
} from "@/lib/lane";

const WL_BAR_WIN = "#5383E8";
const WL_BAR_LOSS = "#E84057";

const TABS: { id: LaneTab; label: string }[] = [
  { id: "ALL", label: "전체" },
  ...LANE_IDS.map((id) => ({ id, label: LANE_LABEL_KO[id] })),
];

type Props = {
  rows: PlayerStatRow[];
  totalGames: number;
  championIcons: Record<string, string | null>;
};

function tabButtonClass(active: boolean, tab: LaneTab): string {
  const base =
    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition sm:text-sm";
  if (!active) {
    return `${base} border-white/10 bg-white/[0.03] text-[var(--op-muted)] hover:border-white/20 hover:text-[var(--op-text)]`;
  }
  if (tab === "ALL") {
    return `${base} border-white/20 bg-white/[0.08] text-[var(--op-text)]`;
  }
  if (tab === "TOP") {
    return `${base} border-[#F52945]/55 bg-[#F52945]/12 text-[#F52945]`;
  }
  if (tab === "JNG") {
    return `${base} border-[#A53DF5]/55 bg-[#A53DF5]/12 text-[#A53DF5]`;
  }
  if (tab === "MID") {
    return `${base} border-[#2CF487]/55 bg-[#2CF487]/12 text-[#2CF487]`;
  }
  if (tab === "ADC") {
    return `${base} border-[#F52945]/45 bg-[#F52945]/10 text-[#F52945]`;
  }
  return `${base} border-[#A53DF5]/45 bg-[#A53DF5]/10 text-[#A53DF5]`;
}

function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain sm:mx-0">
      {children}
    </div>
  );
}

function WinLossBar({ wins, losses }: { wins: number; losses: number }) {
  const games = wins + losses;
  if (games <= 0) {
    return (
      <div
        className="flex h-6 w-full min-w-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-[var(--op-muted)] sm:h-7"
        aria-hidden
      >
        —
      </div>
    );
  }

  const segClass =
    "flex min-h-0 min-w-0 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap px-0.5 text-[9px] font-semibold tabular-nums text-white shadow-inner shadow-black/10 sm:px-1 sm:text-[11px]";

  const winFlex = wins > 0 ? Math.max(wins, 1) : 0;
  const lossFlex = losses > 0 ? Math.max(losses, 1) : 0;

  return (
    <div
      className="flex h-6 w-full min-w-0 overflow-hidden rounded-md sm:h-7"
      role="img"
      aria-label={"승 " + String(wins) + " · 패 " + String(losses)}
    >
      {wins > 0 ? (
        <div
          className={segClass}
          style={{
            flexGrow: winFlex,
            flexShrink: 1,
            flexBasis: 0,
            backgroundColor: WL_BAR_WIN,
          }}
        >
          {wins}승
        </div>
      ) : null}
      {losses > 0 ? (
        <div
          className={segClass}
          style={{
            flexGrow: lossFlex,
            flexShrink: 1,
            flexBasis: 0,
            backgroundColor: WL_BAR_LOSS,
          }}
        >
          {losses}패
        </div>
      ) : null}
    </div>
  );
}

function ChampionRow({
  c,
  iconUrl,
}: {
  c: ChampionAggregate;
  iconUrl: string | null;
}) {
  const losses = Math.max(0, c.games - c.wins);
  const winRatePct = ((Number.isFinite(c.win_rate) ? c.win_rate : 0) * 100).toFixed(1);

  return (
    <li className="rounded-lg border border-white/10 bg-[var(--op-elevated)]/35 px-2 py-2 sm:px-3 sm:py-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-md ring-1 ring-white/10 sm:size-10"
          />
        ) : (
          <div className="size-9 shrink-0 rounded-md bg-black/25 ring-1 ring-white/10 sm:size-10" />
        )}

        <div className="min-w-0 flex-1 basis-[10rem] sm:basis-0 sm:min-w-[11rem]">
          <div className="truncate text-sm font-semibold text-[var(--op-text)]">
            {c.champion}
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-[var(--op-muted)] sm:text-xs">
            <span className="tabular-nums">{c.games}판</span>
            <span className="mx-1 text-white/25">·</span>
            <span className="tabular-nums">승 {c.wins}</span>
            <span className="mx-1 text-white/25">·</span>
            승률{" "}
            <span className="font-semibold text-[var(--op-blue-bright)] tabular-nums">
              {winRatePct}%
            </span>
            <span className="mx-1 text-white/25">·</span>
            KDA{" "}
            <span className="font-semibold tabular-nums text-[var(--op-text)]">
              {c.avg_kda.toFixed(2)}
            </span>
          </p>
        </div>

        <div className="w-full min-w-0 sm:ml-auto sm:w-[min(100%,13.5rem)] sm:flex-1 sm:max-w-[min(100%,16rem)]">
          <WinLossBar wins={c.wins} losses={losses} />
        </div>
      </div>
    </li>
  );
}

export function PlayerChampionSection({
  rows,
  totalGames,
  championIcons,
}: Props) {
  const [tab, setTab] = useState<LaneTab>("ALL");

  const list = useMemo(
    () => aggregateChampionStats(rows, tab, totalGames),
    [rows, tab, totalGames],
  );

  const emptyLane =
    tab !== "ALL" && list.length === 0 && rows.length > 0;

  return (
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md sm:p-5">
      <h2 className="mb-3 text-lg font-semibold text-[var(--op-text)]">
        챔피언별 통계
      </h2>

      <div
        className="mb-4 flex flex-wrap gap-2"
        role="tablist"
        aria-label="라인 필터"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={tabButtonClass(tab === id, id)}
          >
            {label}
          </button>
        ))}
      </div>

      {emptyLane ? (
        <p className="rounded-lg border border-white/5 bg-[var(--op-elevated)]/40 px-4 py-10 text-center text-sm text-[var(--op-muted)]">
          해당 라인의 기록이 없습니다.
        </p>
      ) : (
        <TableScroll>
          <ul className="flex min-w-0 flex-col gap-2 sm:gap-2">
            {list.map((c) => (
              <ChampionRow
                key={c.champion}
                c={c}
                iconUrl={championIcons[c.champion] ?? null}
              />
            ))}
          </ul>
        </TableScroll>
      )}
    </section>
  );
}
