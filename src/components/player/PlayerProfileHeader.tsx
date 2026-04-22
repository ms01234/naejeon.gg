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
  /** 통산 (K+A)/D, D=0이면 K+A */
  overallKda: number;
};

export function PlayerProfileHeader({
  playerName,
  hofRank,
  totalGames,
  wins,
  losses,
  winRate,
  overallKda,
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
          {" · "}
          KDA{" "}
          <strong className="tabular-nums text-[var(--op-text)]">
            {Number.isFinite(overallKda) ? overallKda.toFixed(2) : "—"}
          </strong>
        </span>
      </div>
    </header>
  );
}
