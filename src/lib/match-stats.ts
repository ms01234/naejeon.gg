import type { ChampionAggregate } from "@/types/match";
import type { LaneId, LaneTab } from "@/lib/lane";

export type PlayerStatRow = {
  champion: string;
  is_win: boolean;
  lane: LaneId;
  kills: number;
  deaths: number;
  assists: number;
};

type Agg = { games: number; wins: number; k: number; d: number; a: number };

/**
 * 라인 필터 적용 후 챔피언별 집계.
 * 승률은 행의 is_win(팀 vs winner, 대소문자 무시 정규화는 loadPlayerStatRows) 기준.
 * pick_rate = (챔피언 판수) / totalGames × 100 — totalGames 는 필터와 무관한 전체 참여 판수.
 */
export function aggregateChampionStats(
  rows: PlayerStatRow[],
  laneFilter: LaneTab,
  totalGames: number,
): ChampionAggregate[] {
  const filtered =
    laneFilter === "ALL" ? rows : rows.filter((r) => r.lane === laneFilter);

  const map = new Map<string, Agg>();
  for (const r of filtered) {
    const c = r.champion.trim();
    if (!c) continue;
    const cur = map.get(c) ?? { games: 0, wins: 0, k: 0, d: 0, a: 0 };
    cur.games += 1;
    if (r.is_win) cur.wins += 1;
    cur.k += r.kills;
    cur.d += r.deaths;
    cur.a += r.assists;
    map.set(c, cur);
  }

  const denom = Math.max(1, totalGames);

  const list: ChampionAggregate[] = [...map.entries()].map(
    ([champion, s]) => {
      const avg_kda = s.d > 0 ? (s.k + s.a) / s.d : s.k + s.a;
      return {
        champion,
        games: s.games,
        wins: s.wins,
        win_rate: s.games > 0 ? s.wins / s.games : 0,
        pick_rate: (s.games / denom) * 100,
        avg_kda,
      };
    },
  );

  list.sort((a, b) => b.games - a.games);
  return list;
}
