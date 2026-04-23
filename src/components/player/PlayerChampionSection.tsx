"use client";

import { useMemo, useState } from "react";
import { aggregateChampionStats } from "@/lib/match-stats";
import type { PlayerStatRow } from "@/lib/match-stats";
import {
  LANE_IDS,
  LANE_LABEL_KO,
  type LaneTab,
} from "@/lib/lane";

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
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--op-text)]">
        챔피언별 통계
      </h2>

      <div
        className="mb-5 flex flex-wrap gap-2"
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
        <ul className="space-y-4">
          {list.map((c) => (
            <li
              key={c.champion}
              className="rounded-lg border border-white/10 bg-[var(--op-elevated)]/35 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {championIcons[c.champion] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={championIcons[c.champion]!}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-md ring-1 ring-white/10"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[#F8FAFC]">{c.champion}</div>
                  <div className="mt-0.5 text-xs text-[#CBD5E1]">
                    {c.games}판 · 승 {c.wins} · 승률{" "}
                    <span className="font-semibold text-[var(--op-blue-bright)]">
                      {((Number.isFinite(c.win_rate) ? c.win_rate : 0) * 100).toFixed(
                        1,
                      )}
                      %
                    </span>
                    {" · "}
                    KDA{" "}
                    <span className="font-semibold text-[#E2E8F0]">
                      {c.avg_kda.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#94A3B8]">
                  <span>판수 비중</span>
                  <span className="tabular-nums font-medium text-[#F1F5F9]">
                    {c.pick_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--op-bg)]">
                  <div
                    className="h-full max-w-full rounded-full bg-gradient-to-r from-[#F52945]/90 via-[#A53DF5]/85 to-[#2CF487]/90"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Number.isFinite(c.pick_rate) ? c.pick_rate : 0,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
