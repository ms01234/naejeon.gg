import { championIconUrlByName } from "@/lib/ddragon";
import { normalizeTeamSide } from "@/lib/team";
import { createPublicSupabaseClient } from "@/lib/supabaseClient";

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

/** 동일 인물 표기 차이를 줄이기 위한 닉네임 집계 키 (명예의 전당·개인 배지 매칭에 동일 사용) */
export function hallOfFameNicknameKey(raw: string): string | null {
  const s = raw.normalize("NFKC").trim();
  return s.length > 0 ? s : null;
}

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
  created_at: string;
};

export type HallOfFameEntry = {
  rank: number;
  nickname: string;
  wins: number;
  /** (승리 / 완료 매치 참여 수) × 100 */
  winRatePercent: number;
  avgKda: number;
  championIconUrl: string | null;
};

type Agg = {
  /** 표시용 닉네임(첫 등장 문자열) */
  displayNickname: string;
  /** 완료 매치(10인·승자 확정) 참여 횟수 */
  games: number;
  /** 완료 매치 통산 승리 수 (챔피언 무관) */
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  /** 챔피언별 출전 수(썸네일용) */
  champGames: Map<string, number>;
  champLastWinAt: Map<string, string>;
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

function aggregateKdaScore(k: number, d: number, a: number): number {
  return (k + a) / Math.max(d, 1);
}

/**
 * 완료 매치(승자 있음·양팀 5인)만 집계.
 * 승·KDA는 닉네임(정규화 키) 단위 통산, 썸네일만 챔피언 출전 비중으로 선택.
 */
export async function fetchHallOfFameTop3(): Promise<
  | { ok: true; entries: HallOfFameEntry[] }
  | { ok: false; message: string }
> {
  const [mRes, pRes] = await Promise.all([
    fetchAllRows<MatchRow>("matches", "id, winner, created_at"),
    fetchAllRows<PartRow>(
      "match_participants",
      "match_id, nickname, team, champion, kills, deaths, assists",
    ),
  ]);

  if (!mRes.ok) return { ok: false, message: mRes.message };
  if (!pRes.ok) return { ok: false, message: pRes.message };

  const winByMatch = new Map<
    string,
    { winner: "blue" | "red"; created_at: string }
  >();
  for (const m of mRes.rows) {
    const k = matchJoinKey(m.id);
    const w = normalizeTeamSide(m.winner);
    if (k == null || w == null) continue;
    winByMatch.set(k, { winner: w, created_at: m.created_at ?? "" });
  }

  const partsByMatch = new Map<string, PartRow[]>();
  for (const p of pRes.rows) {
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

  const sorted = [...byNick.entries()].sort((a, b) => {
    const [ka, A] = a;
    const [kb, B] = b;
    if (B.wins !== A.wins) return B.wins - A.wins;
    const kdaA = aggregateKdaScore(A.kills, A.deaths, A.assists);
    const kdaB = aggregateKdaScore(B.kills, B.deaths, B.assists);
    if (kdaB !== kdaA) return kdaB - kdaA;
    return ka.localeCompare(kb, "ko");
  });

  const top = sorted.slice(0, 3);
  const entries: HallOfFameEntry[] = [];

  for (let i = 0; i < top.length; i++) {
    const [, agg] = top[i]!;
    const avgKda = aggregateKdaScore(agg.kills, agg.deaths, agg.assists);
    const showChamp = pickShowcaseChampion(agg);
    const championIconUrl = showChamp
      ? await championIconUrlByName(showChamp)
      : null;

    const winRatePercent =
      agg.games > 0 ? (agg.wins / agg.games) * 100 : 0;

    entries.push({
      rank: i + 1,
      nickname: agg.displayNickname,
      wins: agg.wins,
      winRatePercent,
      avgKda,
      championIconUrl,
    });
  }

  return { ok: true, entries };
}

/** 개인 페이지 배지용 — 전체 승수 TOP3 안에 있으면 1·2·3, 아니면 null */
export async function fetchHallOfFameRankForPlayer(
  playerName: string,
): Promise<1 | 2 | 3 | null> {
  const res = await fetchHallOfFameTop3();
  if (!res.ok) return null;
  const key = hallOfFameNicknameKey(playerName);
  if (!key) return null;
  const i = res.entries.findIndex(
    (e) => hallOfFameNicknameKey(e.nickname) === key,
  );
  if (i < 0) return null;
  return (i + 1) as 1 | 2 | 3;
}
