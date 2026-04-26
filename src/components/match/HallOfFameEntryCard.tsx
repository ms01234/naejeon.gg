import Link from "next/link";
import { Crown } from "lucide-react";
import {
  formatHallOfFameKda,
  hofEntryCardBaseClass,
  hofFirstPlaceOuterGlowClass,
  hofRankAccentClass,
  hofRankGlowClass,
} from "@/lib/hall-of-fame-ui";

function ChampionThumb({
  iconUrl,
  nickname,
}: {
  iconUrl: string | null;
  nickname: string;
}) {
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={`${nickname} 챔피언`}
        width={44}
        height={44}
        className="size-11 rounded-md border border-white/15 object-cover ring-1 ring-white/10 sm:size-12"
      />
    );
  }
  return (
    <div
      className="flex size-11 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] text-sm font-semibold text-white/45 sm:size-12"
      aria-hidden
    >
      ?
    </div>
  );
}

export type HallOfFameEntryCardProps = {
  rank: 1 | 2 | 3;
  nickname: string;
  championIconUrl: string | null;
  wins: number;
  winRatePercent: number;
  avgKda: number;
};

export function HallOfFameEntryCard({
  rank,
  nickname,
  championIconUrl,
  wins,
  winRatePercent,
  avgKda,
}: HallOfFameEntryCardProps) {
  const isFirst = rank === 1;
  const accent = hofRankAccentClass(rank);
  const glow = hofRankGlowClass(rank);
  const cardClass = [
    hofEntryCardBaseClass(rank),
    isFirst ? hofFirstPlaceOuterGlowClass() : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      <div className="flex w-11 shrink-0 flex-col items-center justify-center tabular-nums sm:w-12">
        <span
          className={`text-[1.65rem] font-bold leading-none sm:text-[1.85rem] ${accent} ${glow}`}
        >
          {rank}
        </span>
        <span className="mt-0.5 text-[10px] font-medium leading-none text-[color:var(--hof-muted)] sm:text-[11px]">
          위
        </span>
      </div>

      <div className="shrink-0">
        <ChampionThumb iconUrl={championIconUrl} nickname={nickname} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          {isFirst ? (
            <Crown
              className={`size-3.5 shrink-0 drop-shadow-[0_0_8px_rgba(245,41,69,0.45)] sm:size-4 ${accent}`}
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
          <Link
            href={`/players/${encodeURIComponent(nickname)}`}
            className={`min-w-0 flex-1 truncate font-semibold text-[color:var(--hof-nickname)] transition-opacity hover:opacity-90 ${
              isFirst ? "text-base sm:text-lg" : "text-sm sm:text-base"
            }`}
          >
            {nickname}
          </Link>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-normal tabular-nums text-[color:var(--hof-muted)] sm:text-[11px]">
          <span>
            승리{" "}
            <strong
              className={`text-xs font-bold tabular-nums sm:text-[13px] ${accent} ${glow}`}
            >
              {wins}
            </strong>
            <span className="font-medium"> 회</span>
          </span>
          <span>
            승률{" "}
            <strong
              className={`text-xs font-bold tabular-nums sm:text-[13px] ${accent} ${glow}`}
            >
              {winRatePercent.toFixed(1)}%
            </strong>
          </span>
          <span>
            평균 KDA{" "}
            <strong className="font-medium text-[color:var(--hof-charcoal)]">
              {formatHallOfFameKda(avgKda)}
            </strong>
          </span>
        </div>
      </div>
    </article>
  );
}
