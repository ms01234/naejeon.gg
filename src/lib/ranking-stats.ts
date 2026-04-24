import { unstable_cache } from "next/cache";
import { hallOfFameNicknameKey } from "@/lib/hall-of-fame";
import { normalizeTeamSide } from "@/lib/team";
import { createPublicSupabaseClient } from "@/lib/supabaseClient";

const MIN_GAMES = 3;

type PartRow = {
  match_id: unknown;
  nickname: string;
  team: string;
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
};

type MatchRow = {
  id: unknown;
  winner: string | null;
};

function num(v: unknown): number {
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }
  return Number(v);
}

function matchJoinKey(v: unknown): string | null {
  const n = num(v);
  if (!Number.isFinite(n)) return null;
  return String(Math.trunc(n));
}

type Agg = {
  displayNickname: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  champions: Set<string>;
};

async function fetchAllRows<T>(
  table: "matches" | "match_participants",
  select: string,
): Promise<{ ok: true; rows: T[] } | { ok: false; message: string }> {
  const supabase = createPublicSupabaseClient();
  const pageSize = 1000;
  const out: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) return { ok: false, message: error.message };
    const chunk = (data ?? []) as T[];
    out.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
  }
  return { ok: true, rows: out };
}

function aggregateFromCompleteMatches(
  mRes: MatchRow[],
  pRes: PartRow[],
): Map<string, Agg> {
  const winByMatch = new Map<string, "blue" | "red">();
  for (const m of mRes) {
    const k = matchJoinKey(m.id);
    const w = normalizeTeamSide(m.winner);
    if (k == null || w == null) continue;
    winByMatch.set(k, w);
  }

  const partsByMatch = new Map<string, PartRow[]>();
  for (const p of pRes) {
    const mk = matchJoinKey(p.match_id);
    if (mk == null) continue;
    const list = partsByMatch.get(mk) ?? [];
    list.push(p);
    partsByMatch.set(mk, list);
  }

  const completeMatchIds = new Set<string>();
  for (const [mk, list] of partsByMatch) {
    if (list.length !== 10) continue;
    const blue = list.filter((x) => normalizeTeamSide(x.team) === "blue").length;
    const red = list.filter((x) => normalizeTeamSide(x.team) === "red").length;
    if (blue === 5 && red === 5 && winByMatch.has(mk)) {
      completeMatchIds.add(mk);
    }
  }

  const byNick = new Map<string, Agg>();

  for (const mk of completeMatchIds) {
    const winner = winByMatch.get(mk)!;
    const list = partsByMatch.get(mk) ?? [];
    for (const p of list) {
      const nickKey = hallOfFameNicknameKey(String(p.nickname ?? ""));
      if (nickKey == null) continue;
      const team = normalizeTeamSide(p.team);
      if (team == null) continue;

      let agg = byNick.get(nickKey);
      if (!agg) {
        agg = {
          displayNickname: String(p.nickname ?? "").trim() || nickKey,
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          champions: new Set(),
        };
        byNick.set(nickKey, agg);
      }

      const ch = (p.champion ?? "").trim();
      if (ch) agg.champions.add(ch);

      agg.games += 1;
      agg.kills += Number(p.kills ?? 0);
      agg.deaths += Number(p.deaths ?? 0);
      agg.assists += Number(p.assists ?? 0);
      if (winner === team) agg.wins += 1;
    }
  }

  return byNick;
}

export type WinRateRankEntry = {
  rank: number;
  nickname: string;
  games: number;
  wins: number;
  losses: number;
  /** 표시용 % (소수 첫째) */
  winRatePercent: number;
};

export type KdaRankEntry = {
  rank: number;
  nickname: string;
  games: number;
  kills: number;
  deaths: number;
  assists: number;
  perfect: boolean;
  /** perfect 가 아닐 때 (K+A)/D */
  kdaValue: number;
};

export type AllRounderRankEntry = {
  rank: number;
  nickname: string;
  games: number;
  uniqueChampionCount: number;
};

export type RankingsPayload = {
  winRate: WinRateRankEntry[];
  kda: KdaRankEntry[];
  allRounder: AllRounderRankEntry[];
};

async function buildRankingsPayload(): Promise<RankingsPayload | null> {
  try {
    const [mRes, pRes] = await Promise.all([
      fetchAllRows<MatchRow>("matches", "id, winner"),
      fetchAllRows<PartRow>(
        "match_participants",
        "match_id, nickname, team, champion, kills, deaths, assists",
      ),
    ]);

    if (!mRes.ok || !pRes.ok) return null;

    const byNick = aggregateFromCompleteMatches(mRes.rows, pRes.rows);
    const qualified = [...byNick.values()].filter((a) => a.games >= MIN_GAMES);

    const winRate = [...qualified]
      .map((a) => {
        const rate = a.games > 0 ? (a.wins / a.games) * 100 : 0;
        return {
          nickname: a.displayNickname,
          games: a.games,
          wins: a.wins,
          losses: Math.max(0, a.games - a.wins),
          winRatePercent: Math.round(rate * 10) / 10,
          _sortRate: a.games > 0 ? a.wins / a.games : 0,
        };
      })
      .sort((A, B) => {
        if (B._sortRate !== A._sortRate) return B._sortRate - A._sortRate;
        if (B.games !== A.games) return B.games - A.games;
        return A.nickname.localeCompare(B.nickname, "ko");
      })
      .map((r, i) => ({
        rank: i + 1,
        nickname: r.nickname,
        games: r.games,
        wins: r.wins,
        losses: r.losses,
        winRatePercent: r.winRatePercent,
      }));

    const kda = [...qualified]
      .map((a) => {
        const perfect = a.deaths === 0;
        const kdaValue = perfect
          ? a.kills + a.assists
          : (a.kills + a.assists) / a.deaths;
        return {
          nickname: a.displayNickname,
          games: a.games,
          kills: a.kills,
          deaths: a.deaths,
          assists: a.assists,
          perfect,
          kdaValue,
          _ka: a.kills + a.assists,
        };
      })
      .sort((A, B) => {
        if (A.perfect !== B.perfect) return A.perfect ? -1 : 1;
        if (A.perfect && B.perfect) {
          if (B._ka !== A._ka) return B._ka - A._ka;
          if (B.games !== A.games) return B.games - A.games;
          return A.nickname.localeCompare(B.nickname, "ko");
        }
        if (B.kdaValue !== A.kdaValue) return B.kdaValue - A.kdaValue;
        if (B.games !== A.games) return B.games - A.games;
        return A.nickname.localeCompare(B.nickname, "ko");
      })
      .map((r, i) => ({
        rank: i + 1,
        nickname: r.nickname,
        games: r.games,
        kills: r.kills,
        deaths: r.deaths,
        assists: r.assists,
        perfect: r.perfect,
        kdaValue: r.kdaValue,
      }));

    const allRounder = [...qualified]
      .map((a) => ({
        nickname: a.displayNickname,
        games: a.games,
        uniqueChampionCount: a.champions.size,
      }))
      .sort((A, B) => {
        if (B.uniqueChampionCount !== A.uniqueChampionCount) {
          return B.uniqueChampionCount - A.uniqueChampionCount;
        }
        if (B.games !== A.games) return B.games - A.games;
        return A.nickname.localeCompare(B.nickname, "ko");
      })
      .map((r, i) => ({
        rank: i + 1,
        nickname: r.nickname,
        games: r.games,
        uniqueChampionCount: r.uniqueChampionCount,
      }));

    return { winRate, kda, allRounder };
  } catch {
    return null;
  }
}

export const getRankingsPayload = unstable_cache(buildRankingsPayload, ["rankings-payload-v1"], {
  revalidate: 60,
});
