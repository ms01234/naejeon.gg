import { championIconUrlByName } from "@/lib/ddragon";
import {
  matchPassesFilters,
  sortMatchParticipants,
} from "@/lib/match-history-filters";
import type { LaneTab } from "@/lib/lane";
import { createPublicSupabaseClient } from "@/lib/supabaseClient";
import type {
  MatchCardUi,
  MatchParticipantRow,
  MatchRow,
  MatchWithParticipants,
  ParticipantUi,
  TeamSide,
} from "@/types/match";

/** PostgREST/JSON에서 id·match_id가 number | string | bigint로 올 수 있음 → Map 키 일치 */
function num(v: unknown): number {
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }
  return Number(v);
}

/** matches.id ↔ participants.match_id (number | string | bigint) 동일 키로 묶기 */
function matchJoinKey(v: unknown): string | null {
  const n = num(v);
  if (!Number.isFinite(n)) return null;
  return String(Math.trunc(n));
}

async function attachIcons(
  list: MatchParticipantRow[],
): Promise<ParticipantUi[]> {
  const names = [...new Set(list.map((p) => p.champion))];
  const iconByChampion = new Map<string, string | null>();
  await Promise.all(
    names.map(async (name) => {
      iconByChampion.set(name, await championIconUrlByName(name));
    }),
  );
  return list.map((p) => ({
    ...p,
    iconUrl: iconByChampion.get(p.champion) ?? null,
  }));
}

function isCompleteMatch(m: MatchWithParticipants) {
  const parts = m.match_participants ?? [];
  if (parts.length !== 10 || m.winner == null) return false;
  const blue = parts.filter((p) => p.team === "blue").length;
  const red = parts.filter((p) => p.team === "red").length;
  return blue === 5 && red === 5;
}

function rowToParticipant(
  row: Record<string, unknown>,
): MatchParticipantRow | null {
  const rawTeam = String(row.team ?? "").trim().toLowerCase();
  if (rawTeam !== "blue" && rawTeam !== "red") return null;

  return {
    id: num(row.id),
    match_id: num(row.match_id),
    team: rawTeam,
    nickname: String(row.nickname ?? ""),
    champion: String(row.champion ?? ""),
    kills: Number(row.kills ?? 0),
    deaths: Number(row.deaths ?? 0),
    assists: Number(row.assists ?? 0),
    damage: Number(row.damage ?? 0),
  };
}

function rowToMatch(row: Record<string, unknown>): MatchRow {
  return {
    id: num(row.id),
    guild_id: String(row.guild_id ?? ""),
    winner: row.winner as TeamSide,
    duration_seconds: Number(row.duration_seconds ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

export type FetchRecentCompleteMatchesInput =
  /** 홈: 완료 매치만 풀에서 뽑아 상위 limit개 */
  | { mode: "recent"; limit: number }
  /** 전적 페이지: matches 테이블 기준 range 페이지네이션 */
  | { mode: "page"; page: number; pageSize: number }
  /** 전적 페이지 필터: 최근 N건 중 조건에 맞는 매치만 (검색·라인) */
  | {
      mode: "filterPage";
      page: number;
      pageSize: number;
      playerQuery: string;
      lane: LaneTab;
      poolLimit?: number;
    };

export type FetchRecentCompleteMatchesResult =
  | { ok: true; matches: MatchWithParticipants[]; totalCount: number }
  | { ok: false; message: string };

async function countMatches(
  supabase: ReturnType<typeof createPublicSupabaseClient>,
): Promise<number | null> {
  const { count, error } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true });
  if (error) return null;
  return count ?? 0;
}

async function buildMergedWithParticipants(
  supabase: ReturnType<typeof createPublicSupabaseClient>,
  matchBases: MatchRow[],
): Promise<MatchWithParticipants[]> {
  const ids = matchBases.map((m) => m.id).filter((id) => Number.isFinite(id) && id > 0);
  if (ids.length === 0) return [];

  const { data: partRows, error: pErr } = await supabase
    .from("match_participants")
    .select(
      "id, match_id, team, nickname, champion, kills, deaths, assists, damage",
    )
    .in("match_id", ids);

  if (pErr) throw new Error(pErr.message);

  const byMatchId = new Map<string, MatchParticipantRow[]>();
  for (const raw of partRows ?? []) {
    const row = raw as Record<string, unknown>;
    const join = matchJoinKey(row.match_id);
    if (join == null) continue;
    const p = rowToParticipant(row);
    if (!p) continue;
    const list = byMatchId.get(join) ?? [];
    list.push(p);
    byMatchId.set(join, list);
  }

  return matchBases.map((m) => {
    const k = matchJoinKey(m.id);
    return {
      ...m,
      match_participants: k != null ? (byMatchId.get(k) ?? []) : [],
    };
  });
}

/**
 * 완료 매치(10인·승자 설정) 조회.
 * - `recent`: 최신순 풀에서 완료만 골라 limit개 (홈)
 * - `page`: matches `created_at` desc + PostgREST `range` (전적 전체 페이지)
 */
export async function fetchRecentCompleteMatches(
  input: FetchRecentCompleteMatchesInput,
): Promise<FetchRecentCompleteMatchesResult> {
  try {
    const supabase = createPublicSupabaseClient();

    if (input.mode === "recent") {
      const totalCount = (await countMatches(supabase)) ?? 0;
      const limit = Math.max(1, input.limit);
      const pool = Math.max(limit * 4, 20);

      const { data: matchRows, error: mErr } = await supabase
        .from("matches")
        .select("id, guild_id, winner, duration_seconds, created_at")
        .order("created_at", { ascending: false })
        .limit(pool);

      if (mErr) return { ok: false, message: mErr.message };

      const matchBases = (matchRows ?? [])
        .map((r) => rowToMatch(r as Record<string, unknown>))
        .filter((m) => Number.isFinite(m.id) && m.id > 0);

      const merged = await buildMergedWithParticipants(supabase, matchBases);
      const complete = merged.filter(isCompleteMatch).slice(0, limit);

      return { ok: true, matches: complete, totalCount };
    }

    if (input.mode === "filterPage") {
      const page = Math.max(1, input.page);
      const pageSize = Math.min(100, Math.max(1, input.pageSize));
      const poolLimit = Math.min(
        10_000,
        Math.max(50, input.poolLimit ?? 4000),
      );

      const { data: matchRows, error: mErr } = await supabase
        .from("matches")
        .select("id, guild_id, winner, duration_seconds, created_at")
        .order("created_at", { ascending: false })
        .limit(poolLimit);

      if (mErr) return { ok: false, message: mErr.message };

      const matchBases = (matchRows ?? [])
        .map((r) => rowToMatch(r as Record<string, unknown>))
        .filter((m) => Number.isFinite(m.id) && m.id > 0);

      const merged = await buildMergedWithParticipants(supabase, matchBases);
      const complete = merged.filter(isCompleteMatch);
      const filtered = complete.filter((m) =>
        matchPassesFilters(m, input.playerQuery, input.lane),
      );
      const totalCount = filtered.length;
      const from = (page - 1) * pageSize;
      const matches = filtered.slice(from, from + pageSize);
      return { ok: true, matches, totalCount };
    }

    const totalCount = (await countMatches(supabase)) ?? 0;
    const page = Math.max(1, input.page);
    const pageSize = Math.min(100, Math.max(1, input.pageSize));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: matchRows, error: mErr } = await supabase
      .from("matches")
      .select("id, guild_id, winner, duration_seconds, created_at")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (mErr) return { ok: false, message: mErr.message };

    const matchBases = (matchRows ?? [])
      .map((r) => rowToMatch(r as Record<string, unknown>))
      .filter((m) => Number.isFinite(m.id) && m.id > 0);

    const merged = await buildMergedWithParticipants(supabase, matchBases);
    const complete = merged.filter(isCompleteMatch);

    return { ok: true, matches: complete, totalCount };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return { ok: false, message: msg };
  }
}

export async function toMatchCardUi(m: MatchWithParticipants): Promise<MatchCardUi> {
  const sorted = sortMatchParticipants(m.match_participants ?? []);
  const blue = sorted.filter((p) => p.team === "blue");
  const red = sorted.filter((p) => p.team === "red");
  const [blueUi, redUi] = await Promise.all([
    attachIcons(blue),
    attachIcons(red),
  ]);
  return {
    match: {
      id: m.id,
      guild_id: m.guild_id,
      winner: m.winner,
      duration_seconds: m.duration_seconds,
      created_at: m.created_at,
    },
    blue: blueUi,
    red: redUi,
  };
}

export async function fetchDistinctPlayerNames(): Promise<
  { ok: true; names: string[] } | { ok: false; message: string }
> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("match_participants")
      .select("nickname")
      .limit(2000);

    if (error) return { ok: false, message: error.message };
    const set = new Set<string>();
    for (const row of data ?? []) {
      const n = (row as { nickname: string }).nickname?.trim();
      if (n) set.add(n);
    }
    const names = [...set].sort((a, b) => a.localeCompare(b, "ko"));
    return { ok: true, names };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return { ok: false, message: msg };
  }
}
