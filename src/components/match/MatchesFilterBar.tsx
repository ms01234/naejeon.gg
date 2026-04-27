"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LANE_IDS, LANE_LABEL_KO, type LaneId, type LaneTab } from "@/lib/lane";
import { buildMatchesPageHref, parseLaneQueryParam } from "@/lib/match-history-filters";
import { resolveCanonicalParticipantNickname } from "@/lib/participant-nickname-canonical";

const selectBaseClass =
  "h-11 w-[8.75rem] max-w-[8.75rem] shrink-0 box-border cursor-pointer appearance-none rounded-lg border-2 bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat px-2 py-0 pr-8 text-sm font-semibold outline-none transition";

const selectEnabledClass =
  `${selectBaseClass} border-white/[0.08] bg-[var(--op-panel)] text-[var(--op-text)] focus:border-[#5CAAFF]/80 focus:ring-2 focus:ring-[#5CAAFF]/35`;

const selectDisabledClass =
  `${selectBaseClass} cursor-not-allowed border-white/[0.06] bg-black/25 text-[var(--op-muted)] opacity-55 shadow-none`;

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

  /** URL 확정 검색어와 입력창 값이 모두 있을 때만 라인 선택 가능 */
  const laneSelectEnabled =
    qFromUrl.trim().length > 0 && draft.trim().length > 0;

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

  /** 라인 변경 시 현재 입력값 기준으로 URL 동기화 (활성일 때만 호출됨) */
  const onLaneChange = (lane: LaneTab) => {
    const q = resolveCanonicalParticipantNickname(draft).trim();
    navigateWithFilters(q, lane, 1);
  };

  const submitSearch = useCallback(() => {
    const canon = resolveCanonicalParticipantNickname(draft).trim();
    const lane = canon ? laneFromUrl : "ALL";
    navigateWithFilters(canon, lane, 1);
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

  const laneDisableTitle = laneSelectEnabled
    ? undefined
    : !draft.trim().length
      ? "검색창에 이름을 입력해 주세요."
      : !qFromUrl.trim().length
        ? "Enter 키로 검색을 확정하면 라인을 선택할 수 있습니다."
        : undefined;

  return (
    <div className="mb-8 flex w-full flex-col items-end gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <div className="relative w-full max-w-[min(100%,18rem)]">
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
          className="h-11 w-full box-border rounded-lg border-2 border-white/[0.08] bg-[var(--op-panel)] px-3 py-2 text-sm leading-snug text-[var(--op-text)] placeholder:text-[var(--op-muted)] outline-none ring-[var(--op-accent)] transition focus:border-[#5CAAFF]/80 focus:ring-2 focus:ring-[#5CAAFF]/35"
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

      <div className="shrink-0">
        <select
          id="matches-lane-filter"
          disabled={!laneSelectEnabled}
          value={laneFromUrl === "ALL" ? "ALL" : laneFromUrl}
          onChange={(e) => {
            const v = e.target.value;
            onLaneChange(v === "ALL" ? "ALL" : (v as LaneTab));
          }}
          style={{
            backgroundImage: laneSelectEnabled ? SELECT_CHEVRON : undefined,
          }}
          className={
            laneSelectEnabled ? selectEnabledClass : selectDisabledClass
          }
          aria-label="라인 필터"
          aria-disabled={!laneSelectEnabled}
          title={laneDisableTitle}
        >
          <option value="ALL">전체</option>
          {LANE_IDS.map((id: LaneId) => (
            <option key={id} value={id}>
              {LANE_LABEL_KO[id]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
