import { championIconUrlByName } from "@/lib/ddragon";
import type { RankingsPayload } from "@/lib/ranking-stats";
import { RankingModeClient } from "@/components/ranking/RankingModeClient";

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
    <RankingModeClient
      winRate={data.winRate}
      kda={data.kda}
      winTopIcons={winTopIcons}
      kdaTopIcons={kdaTopIcons}
    />
  );
}
