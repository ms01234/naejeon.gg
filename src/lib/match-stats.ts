import type { ChampionAggregate } from "@/types/match";

/** 챔피언별 집계 (승 = 해당 판에서 소환사 팀이 승리팀과 같을 때) */
export function championStatsFromParticipantRows(
  rows: { champion: string; is_win: boolean }[],
): ChampionAggregate[] {
  const map = new Map<string, { games: number; wins: number }>();
  for (const r of rows) {
    const c = r.champion.trim();
    if (!c) continue;
    const cur = map.get(c) ?? { games: 0, wins: 0 };
    cur.games += 1;
    if (r.is_win) cur.wins += 1;
    map.set(c, cur);
  }
  const list: ChampionAggregate[] = [...map.entries()].map(
    ([champion, s]) => ({
      champion,
      games: s.games,
      wins: s.wins,
      win_rate: s.games ? s.wins / s.games : 0,
    }),
  );
  list.sort((a, b) => b.games - a.games);
  return list;
}
