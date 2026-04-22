import { playerProfileCardClass } from "@/lib/hall-of-fame-ui";
import { HallOfFameRankBadge } from "@/components/player/HallOfFameRankBadge";

type HofRank = 1 | 2 | 3;

type Props = {
  playerName: string;
  hofRank: HofRank | null;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
};

export function PlayerProfileHeader({
  playerName,
  hofRank,
  totalGames,
  wins,
  losses,
  winRate,
}: Props) {
  return (
    <header className={playerProfileCardClass(hofRank)}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--op-text)] sm:text-3xl">
          {playerName}
        </h1>
        {hofRank != null ? <HallOfFameRankBadge rank={hofRank} /> : null}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--op-muted)]">
        <span>
          완료 매치 기준{" "}
          <strong className="tabular-nums text-[var(--op-text)]">
            {totalGames}
          </strong>
          판{" "}
          <strong className="tabular-nums text-[var(--op-text)]">{wins}</strong>
          승{" "}
          <strong className="tabular-nums text-[var(--op-text)]">
            {losses}
          </strong>
          패
        </span>
        <span>
          승률{" "}
          <strong className="tabular-nums text-[var(--op-blue-bright)]">
            {(winRate * 100).toFixed(1)}%
          </strong>
        </span>
      </div>
    </header>
  );
}
