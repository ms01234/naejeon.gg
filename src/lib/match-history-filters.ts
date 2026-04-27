import type { LaneId, LaneTab } from "@/lib/lane";
import { slotIndexToLane } from "@/lib/lane";
import type {
  MatchParticipantRow,
  MatchWithParticipants,
} from "@/types/match";

/** MatchCard·toMatchCardUi 와 동일: 블루 먼저, 팀 내 id 오름차순 → 슬롯 0~9 */
export function sortMatchParticipants(list: MatchParticipantRow[]) {
  return [...list].sort((a, b) => {
    if (a.team !== b.team) return a.team === "blue" ? -1 : 1;
    return a.id - b.id;
  });
}

export function participantLane(
  p: MatchParticipantRow,
  allInMatch: MatchParticipantRow[],
): LaneId {
  const sorted = sortMatchParticipants(allInMatch);
  const idx = sorted.findIndex((x) => x.id === p.id);
  if (idx < 0) return "TOP";
  return slotIndexToLane(idx);
}

function nicknameMatchesQuery(nickname: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return nickname.toLowerCase().includes(q);
}

/**
 * 전적 목록 필터.
 * - 검색만: 닉네임 부분 일치 소환사가 한 명이라도 있는 매치
 * - 라인만: 해당 라인으로 플레이한 소환사가 한 명이라도 있는 매치
 * - 검색+라인: 같은 소환사가 검색에 맞고 그 라인으로 출전한 매치
 */
export function matchPassesFilters(
  m: MatchWithParticipants,
  query: string,
  lane: LaneTab,
): boolean {
  const parts = m.match_participants ?? [];
  const q = query.trim();

  if (lane === "ALL" && !q) return true;

  if (lane === "ALL") {
    return parts.some((p) => nicknameMatchesQuery(p.nickname, q));
  }

  if (!q) {
    return parts.some((p) => participantLane(p, parts) === lane);
  }

  return parts.some(
    (p) =>
      nicknameMatchesQuery(p.nickname, q) && participantLane(p, parts) === lane,
  );
}

export function parseLaneQueryParam(raw: string | undefined): LaneTab {
  const u = (raw ?? "").toUpperCase();
  if (u === "TOP" || u === "JNG" || u === "MID" || u === "ADC" || u === "SUP") {
    return u as LaneId;
  }
  return "ALL";
}

/** 전적 페이지 링크 (페이지네이션·필터 유지) */
export function buildMatchesPageHref(
  page: number,
  opts: { q?: string; lane?: LaneTab },
): string {
  const params = new URLSearchParams();
  params.set("page", String(Math.max(1, page)));
  const qt = (opts.q ?? "").trim();
  if (qt) params.set("q", qt);
  const lane = opts.lane ?? "ALL";
  if (lane !== "ALL") params.set("lane", lane);
  return `/matches?${params.toString()}`;
}
