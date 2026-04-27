"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LANE_IDS, LANE_LABEL_KO, type LaneId, type LaneTab } from "@/lib/lane";
import { buildMatchesPageHref, parseLaneQueryParam } from "@/lib/match-history-filters";
import { resolveCanonicalParticipantNickname } from "@/lib/participant-nickname-canonical";

const selectBaseClass =
  "min-h-11 min-w-[11rem] cursor-pointer appearance-none rounded-lg border-2 border-white/[0.08] bg-[var(--op-panel)] bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat py-2 pl-3 pr-9 text-sm font-semibold text-[var(--op-text)] outline-none transition focus:border-[#5CAAFF]/80 focus:ring-2 focus:ring-[#5CAAFF]/35";

/** Chevron 다크용 (svg data URL) */
const SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23a8b0c4' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")";

export function MatchesFilterBar({
  initialQuery,
  nicknames,
}: {
  initialQuery: string;
  nicknames: string[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const laneFromUrl = parseLaneQueryParam(sp.get("lane") ?? undefined);
  const qFromUrl = sp.get("q") ?? "";

  const [draft, setDraft] = useState(initialQuery);
  const [searchFocused, setSearchFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      if (blurTimer.current != null) clearTimeout(blurTimer.current);
    };
  }, []);

  const navigateWithFilters = useCallback(
    (q: string, lane: LaneTab, page: number) => {
      router.replace(buildMatchesPageHref(page, { q, lane }));
    },
    [router],
  );

  /** 라인만 바꿀 때는 확정된 검색어(URL q) 유지 — Enter 검색만 q 갱신 */
  const onLaneChange = (lane: LaneTab) => {
    navigateWithFilters(qFromUrl.trim(), lane, 1);
  };

  const submitSearch = useCallback(() => {
    const canon = resolveCanonicalParticipantNickname(draft).trim();
    navigateWithFilters(canon, laneFromUrl, 1);
    setDraft(canon);
  }, [draft, laneFromUrl, navigateWithFilters]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
    if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  const suggestions = useMemo(() => {
    const raw = draft.trim().toLowerCase();
    if (!raw) return [];
    const canonTarget = resolveCanonicalParticipantNickname(draft.trim());
    const base = nicknames.filter((n) =>
      n.toLowerCase().includes(raw),
    );
    const merged = [...base];
    if (
      canonTarget !== draft.trim() &&
      !merged.some((n) => n === canonTarget)
    ) {
      merged.unshift(canonTarget);
    }
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of merged) {
      if (!seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
      if (out.length >= 12) break;
    }
    return out;
  }, [draft, nicknames]);

  const pickSuggestion = (name: string) => {
    const canon = resolveCanonicalParticipantNickname(name).trim();
    navigateWithFilters(canon, laneFromUrl, 1);
    setDraft(canon);
  };

  const clearBlurTimer = () => {
    if (blurTimer.current != null) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  };

  const onSearchBlur = () => {
    clearBlurTimer();
    blurTimer.current = setTimeout(() => setSearchFocused(false), 140);
  };

  const onSearchFocus = () => {
    clearBlurTimer();
    setSearchFocused(true);
  };

  const showSuggestions =
    searchFocused &&
    draft.trim().length > 0 &&
    suggestions.length > 0;

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex shrink-0 flex-col gap-1.5">
        <label
          htmlFor="matches-lane-filter"
          className="text-[11px] font-medium uppercase tracking-wide text-[var(--op-muted)]"
        >
          라인
        </label>
        <select
          id="matches-lane-filter"
          value={laneFromUrl === "ALL" ? "ALL" : laneFromUrl}
          onChange={(e) => {
            const v = e.target.value;
            onLaneChange(v === "ALL" ? "ALL" : (v as LaneTab));
          }}
          style={{ backgroundImage: SELECT_CHEVRON }}
          className={selectBaseClass}
          aria-label="라인 필터"
        >
          <option value="ALL">전체</option>
          {LANE_IDS.map((id: LaneId) => (
            <option key={id} value={id}>
              {LANE_LABEL_KO[id]}
            </option>
          ))}
        </select>
      </div>

      <div className="relative w-full sm:max-w-[min(100%,20rem)]">
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
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          autoComplete="off"
          className="min-h-11 w-full rounded-lg border-2 border-white/[0.08] bg-[var(--op-panel)] px-3 py-2 text-sm text-[var(--op-text)] placeholder:text-[var(--op-muted)] outline-none ring-[var(--op-accent)] transition focus:border-[#5CAAFF]/80 focus:ring-2 focus:ring-[#5CAAFF]/35"
        />

        {showSuggestions ? (
          <ul
            className="absolute right-0 z-30 mt-1 max-h-60 min-w-full overflow-auto rounded-lg border border-white/10 bg-[var(--op-panel)] py-1 shadow-lg shadow-black/40"
            role="listbox"
          >
            {suggestions.map((name) => (
              <li key={name} role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-[var(--op-text)] transition hover:bg-white/[0.06]"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickSuggestion(name);
                  }}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
