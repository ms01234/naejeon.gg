import { hallOfFameNicknameKey } from "@/lib/hall-of-fame";
import { normalizeTeamSide } from "@/lib/team";
import { createPublicSupabaseClient } from "@/lib/supabaseClient";

/** 승률 랭킹 최소 완료 매치 판수 */
const MIN_GAMES_WIN_RATE = 9;
/** KDA 랭킹 최소 완료 매치 판수 */
const MIN_GAMES_KDA_RANK = 5;

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
  created_at?: string | null;
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
  champGames: Map<string, number>;
  champLastWinAt: Map<string, string>;
};

function pickShowcaseChampion(agg: Agg): string {
  let best = "";
  let bestGames = -1;
  let bestLast = "";
  for (const [ch, games] of agg.champGames) {
    const last = agg.champLastWinAt.get(ch) ?? "";
    if (
      games > bestGames ||
      (games === bestGames && last.localeCompare(bestLast) > 0)
    ) {
      bestGames = games;
      bestLast = last;
      best = ch;
    }
  }
  return best;
}

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
  const winByMatch = new Map<
    string,
    { winner: "blue" | "red"; created_at: string }
  >();
  for (const m of mRes) {
    const k = matchJoinKey(m.id);
    const w = normalizeTeamSide(m.winner);
    if (k == null || w == null) continue;
    winByMatch.set(k, {
      winner: w,
      created_at: m.created_at ?? "",
    });
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
    const meta = winByMatch.get(mk)!;
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
          champGames: new Map(),
          champLastWinAt: new Map(),
        };
        byNick.set(nickKey, agg);
      }

      const ch = (p.champion ?? "").trim() || "—";
      agg.games += 1;
      agg.kills += Number(p.kills ?? 0);
      agg.deaths += Number(p.deaths ?? 0);
      agg.assists += Number(p.assists ?? 0);
      agg.champGames.set(ch, (agg.champGames.get(ch) ?? 0) + 1);

      const won = meta.winner === team;
      if (won) {
        agg.wins += 1;
        const prev = agg.champLastWinAt.get(ch) ?? "";
        if (meta.created_at.localeCompare(prev) > 0) {
          agg.champLastWinAt.set(ch, meta.created_at);
        }
      }
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
  /** 명예의 전당 카드용 (K+A)/max(D,1) */
  avgKda: number;
  /** 대표 챔피언(썸네일) */
  showcaseChampion: string;
};

export type KdaRankEntry = {
  rank: number;
  nickname: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  perfect: boolean;
  /** perfect 가 아닐 때 (K+A)/D */
  kdaValue: number;
  showcaseChampion: string;
};

export type RankingsPayload = {
  winRate: WinRateRankEntry[];
  kda: KdaRankEntry[];
};

export async function getRankingsPayload(): Promise<RankingsPayload | null> {
  try {
    const [mRes, pRes] = await Promise.all([
      fetchAllRows<MatchRow>("matches", "id, winner, created_at"),
      fetchAllRows<PartRow>(
        "match_participants",
        "match_id, nickname, team, champion, kills, deaths, assists",
      ),
    ]);

    if (!mRes.ok || !pRes.ok) return null;

    const byNick = aggregateFromCompleteMatches(mRes.rows, pRes.rows);
    const qualifiedKda = [...byNick.values()].filter(
      (a) => a.games >= MIN_GAMES_KDA_RANK,
    );
    const qualifiedWin = [...byNick.values()].filter(
      (a) => a.games >= MIN_GAMES_WIN_RATE,
    );

    const winRate = qualifiedWin
      .map((a) => {
        const rate = a.games > 0 ? (a.wins / a.games) * 100 : 0;
        const avgKda = (a.kills + a.assists) / Math.max(a.deaths, 1);
        return {
          nickname: a.displayNickname,
          games: a.games,
          wins: a.wins,
          losses: Math.max(0, a.games - a.wins),
          winRatePercent: Math.round(rate * 10) / 10,
          avgKda,
          showcaseChampion: pickShowcaseChampion(a),
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
        avgKda: r.avgKda,
        showcaseChampion: r.showcaseChampion,
      }));

    const kda = qualifiedKda
      .map((a) => {
        const perfect = a.deaths === 0;
        const kdaValue = perfect
          ? a.kills + a.assists
          : (a.kills + a.assists) / a.deaths;
        return {
          nickname: a.displayNickname,
          games: a.games,
          wins: a.wins,
          kills: a.kills,
          deaths: a.deaths,
          assists: a.assists,
          perfect,
          kdaValue,
          showcaseChampion: pickShowcaseChampion(a),
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
        const kdaDiff = B.kdaValue - A.kdaValue;
        if (Math.abs(kdaDiff) > 1e-9) return kdaDiff;
        if (B.games !== A.games) return B.games - A.games;
        return A.nickname.localeCompare(B.nickname, "ko");
      })
      .map((r, i) => ({
        rank: i + 1,
        nickname: r.nickname,
        games: r.games,
        wins: r.wins,
        kills: r.kills,
        deaths: r.deaths,
        assists: r.assists,
        perfect: r.perfect,
        kdaValue: r.kdaValue,
        showcaseChampion: r.showcaseChampion,
      }));

    return { winRate, kda };
  } catch {
    return null;
  }
}
