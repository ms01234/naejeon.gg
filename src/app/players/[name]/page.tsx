import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { championIconUrlByName } from "@/lib/ddragon";
import { fetchHallOfFameRankForPlayer } from "@/lib/hall-of-fame";
import { loadPlayerStatRows } from "@/lib/player-stats";
import { PlayerChampionSection } from "@/components/player/PlayerChampionSection";
import { PlayerProfileHeader } from "@/components/player/PlayerProfileHeader";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ name: string }> };

export default async function PlayerPage({ params }: PageProps) {
  const { name: raw } = await params;
  const playerName = decodeURIComponent(raw);

  const [rows, hofRank] = await Promise.all([
    loadPlayerStatRows(playerName),
    fetchHallOfFameRankForPlayer(playerName),
  ]);

  if (rows === null) {
    return (
      <div className="mx-auto min-h-screen max-w-2xl bg-[var(--op-page)] px-4 py-20 text-sm text-[var(--op-muted)]">
        Supabase 연결을 확인할 수 없습니다.
      </div>
    );
  }
  if (rows.length === 0) {
    notFound();
  }

  const totalGames = rows.length;
  const wins = rows.filter((r) => r.is_win).length;
  const losses = Math.max(0, totalGames - wins);
  const winRate = totalGames ? wins / totalGames : 0;

  const sumK = rows.reduce((s, r) => s + r.kills, 0);
  const sumD = rows.reduce((s, r) => s + r.deaths, 0);
  const sumA = rows.reduce((s, r) => s + r.assists, 0);
  const overallKda = sumD > 0 ? (sumK + sumA) / sumD : sumK + sumA;

  const uniqueChamps = [
    ...new Set(rows.map((r) => r.champion.trim()).filter(Boolean)),
  ];
  const championIcons = Object.fromEntries(
    await Promise.all(
      uniqueChamps.map(async (champion) => {
        const icon = await championIconUrlByName(champion);
        return [champion, icon] as const;
      }),
    ),
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-[var(--op-page)] px-4 py-10">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 text-sm text-[var(--op-muted)] hover:text-[var(--op-accent)]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        홈으로
      </Link>

      <PlayerProfileHeader
        playerName={playerName}
        hofRank={hofRank}
        totalGames={totalGames}
        wins={wins}
        losses={losses}
        winRate={winRate}
        overallKda={overallKda}
      />

      <PlayerChampionSection
        rows={rows}
        totalGames={totalGames}
        championIcons={championIcons}
      />
    </div>
  );
}
