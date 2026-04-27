"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LANE_IDS, LANE_LABEL_KO, type LaneId, type LaneTab } from "@/lib/lane";
import { buildMatchesPageHref, parseLaneQueryParam } from "@/lib/match-history-filters";

const ACTIVE_TAB =
  "border-[#5CAAFF] ring-1 ring-[#5CAAFF]/40 shadow-[0_0_0_1px_rgba(92,170,255,0.25)]";

export function MatchesFilterBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  const laneFromUrl = parseLaneQueryParam(sp.get("lane") ?? undefined);
  const qFromUrl = sp.get("q") ?? "";

  const [draft, setDraft] = useState(initialQuery);

  useEffect(() => {
    setDraft(qFromUrl);
  }, [qFromUrl]);

  const navigateWithFilters = useCallback(
    (q: string, lane: LaneTab, page: number) => {
      router.replace(buildMatchesPageHref(page, { q, lane }));
    },
    [router],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = draft.trim();
      const cur = qFromUrl.trim();
      if (next === cur) return;
      navigateWithFilters(next, laneFromUrl, 1);
    }, 380);
    return () => window.clearTimeout(id);
  }, [draft, laneFromUrl, navigateWithFilters, qFromUrl]);

  const setLane = (lane: LaneTab) => {
    if (lane === laneFromUrl) return;
    navigateWithFilters(draft.trim(), lane, 1);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigateWithFilters(draft.trim(), laneFromUrl, 1);
    }
  };

  const tabs: { id: LaneTab; label: string }[] = [
    { id: "ALL", label: "전체" },
    ...LANE_IDS.map((id: LaneId) => ({
      id,
      label: LANE_LABEL_KO[id],
    })),
  ];

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <label className="sr-only" htmlFor="matches-player-search">
          소환사 이름 검색
        </label>
        <input
          id="matches-player-search"
          type="search"
          enterKeyHint="search"
          placeholder="소환사 이름 검색…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onSearchKeyDown}
          className="min-h-11 w-full rounded-lg border-2 border-white/[0.08] bg-[var(--op-panel)] px-3 py-2 text-sm text-[var(--op-text)] placeholder:text-[var(--op-muted)] outline-none ring-[var(--op-accent)] transition focus:border-[#5CAAFF]/80 focus:ring-2 focus:ring-[#5CAAFF]/35 sm:max-w-xs"
          autoComplete="off"
        />
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="라인 필터"
      >
        {tabs.map((t) => {
          const active =
            t.id === "ALL"
              ? laneFromUrl === "ALL"
              : laneFromUrl === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setLane(t.id)}
              className={[
                "rounded-lg border-2 px-3 py-2 text-sm font-semibold tracking-tight transition-colors duration-200 sm:rounded-xl sm:px-4 sm:py-2",
                active
                  ? [ACTIVE_TAB, "bg-[var(--op-panel)] text-[var(--op-text)]"].join(
                      " ",
                    )
                  : "border-white/[0.08] bg-[var(--op-panel)] text-[var(--op-muted)] hover:border-white/15 hover:bg-white/[0.03] hover:text-[var(--op-text)]",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
