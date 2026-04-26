import { championIconUrlByName } from "@/lib/ddragon";
import type { RankingsPayload } from "@/lib/ranking-stats";
import { RankingModeClient } from "@/components/ranking/RankingModeClient";

const RANKING_HINT =
  "완료된 내전(양 팀 5인·승자 확정)만 집계합니다. 승률 랭킹은 9판 이상, KDA 랭킹은 5판 이상 출전한 소환사만 포함됩니다.";

async function resolveTopIcons(
  entries: { showcaseChampion: string }[],
): Promise<(string | null)[]> {
  return Promise.all(
    entries.map(async (e) => {
      const name = (e.showcaseChampion ?? "").trim();
      if (!name || name === "—") return null;
      return championIconUrlByName(name);
    }),
  );
}

export async function RankingBoard({ data }: { data: RankingsPayload }) {
  const winTop = data.winRate.slice(0, 3);
  const kdaTop = data.kda.slice(0, 3);
  const [winTopIcons, kdaTopIcons] = await Promise.all([
    resolveTopIcons(winTop),
    resolveTopIcons(kdaTop),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-xs leading-relaxed text-[var(--op-muted)]">{RANKING_HINT}</p>
      <RankingModeClient
        winRate={data.winRate}
        kda={data.kda}
        winTopIcons={winTopIcons}
        kdaTopIcons={kdaTopIcons}
      />
    </div>
  );
}
