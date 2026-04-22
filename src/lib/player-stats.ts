import { slotIndexToLane } from "@/lib/lane";
import type { PlayerStatRow } from "@/lib/match-stats";
import { normalizeTeamSide } from "@/lib/team";
import { createPublicSupabaseClient } from "@/lib/supabaseClient";

type PartDb = {
  id: number;
  match_id: number;
  team: string;
  nickname: string;
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
};

/**
 * 완료 매치 기준, 소환사별 참여 행 + 라인(슬롯 인덱스 0~9).
 * finalize_match_draft 가 블루 5명 후 레드 5명을 id 순으로 삽입하므로 match_id 내 id 오름차순 = 슬롯 순서.
 */
export async function loadPlayerStatRows(
  playerName: string,
): Promise<PlayerStatRow[] | null> {
  try {
    const supabase = createPublicSupabaseClient();

    const { data: mine, error: e1 } = await supabase
      .from("match_participants")
      .select(
        "id, match_id, team, nickname, champion, kills, deaths, assists",
      )
      .eq("nickname", playerName);

    if (e1) return null;
    const myRows = (mine ?? []) as PartDb[];
    if (myRows.length === 0) return [];

    const ids = [...new Set(myRows.map((p) => p.match_id))];

    const { data: ms, error: e2 } = await supabase
      .from("matches")
      .select("id, winner")
      .in("id", ids);

    if (e2) return null;
    const winBy = new Map(
      (ms ?? []).map((m: { id: number; winner: string | null }) => [
        m.id,
        m.winner,
      ]),
    );

    const completedIds = ids.filter(
      (id) => normalizeTeamSide(winBy.get(id) as string | null) != null,
    );
    if (completedIds.length === 0) return [];

    const { data: allParts, error: e3 } = await supabase
      .from("match_participants")
      .select(
        "id, match_id, team, nickname, champion, kills, deaths, assists",
      )
      .in("match_id", completedIds)
      .order("match_id", { ascending: true })
      .order("id", { ascending: true });

    if (e3) return null;

    const byMatch = new Map<number, PartDb[]>();
    for (const row of (allParts ?? []) as PartDb[]) {
      const list = byMatch.get(row.match_id) ?? [];
      list.push(row);
      byMatch.set(row.match_id, list);
    }

    const out: PlayerStatRow[] = [];

    for (const p of myRows) {
      const rawWinner = winBy.get(p.match_id);
      const winnerSide = normalizeTeamSide(rawWinner as string | null);
      const teamSide = normalizeTeamSide(p.team);
      if (winnerSide == null || teamSide == null) continue;

      const ordered = byMatch.get(p.match_id);
      if (!ordered?.length) continue;

      const sorted = [...ordered].sort((a, b) => a.id - b.id);
      const slot = sorted.findIndex(
        (r) => r.nickname === p.nickname && r.team === p.team,
      );
      if (slot < 0) continue;

      const lane = slotIndexToLane(slot);
      out.push({
        champion: p.champion,
        is_win: winnerSide === teamSide,
        lane,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
      });
    }

    return out;
  } catch {
    return null;
  }
}
