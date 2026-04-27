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
  /**
   * `kda`: KDA 랭킹 상단 카드 — 승·승률은 약한 스타일, KDA만 등수색 강조.
   * 생략 시(홈 명예의 전당·승률 랭킹): 승·승률 강조, KDA는 보조 스타일.
   */
  statEmphasis?: "default" | "kda";
  /**
   * 랭킹 Top3: 메인 수치 옆에 상세를 한 줄로 붙임.
   * `win-top`일 때 `losses` 필요(승률 % (N승 N패)).
   * `kda-top`일 때 `kdaTotals` 필요 — 괄호 안은 리스트와 동일한 누적 K/D/A.
   */
  rankingCardVariant?: "none" | "win-top" | "kda-top";
  losses?: number;
  kdaTotals?: {
    kills: number;
    deaths: number;
    assists: number;
    games: number;
  };
};

const hofPlainStatStrongClass =
  "text-xs font-medium tabular-nums text-[color:var(--hof-charcoal)] sm:text-[13px]";

/** 홈 명예의 전당과 동일 계열 — 강조 수치(승·승률 등) */
const hofAccentStatMainClass =
  "text-xs font-bold tabular-nums sm:text-[13px]";

/** 랭킹 승률 Top3: 메인 승률 줄을 한 단계 키워 승패와 균형 */
const rankingWinRateMainClass =
  "text-sm font-bold tabular-nums sm:text-[15px]";

/** 랭킹 KDA Top3: 메인 KDA 수치 — 홈 강조보다 한 단계 크게 */
const rankingKdaMainValueClass =
  "text-[15px] font-bold tabular-nums leading-none sm:text-[1.0625rem]";

/** 랭킹 KDA Top3: 괄호 안 누적 K/D/A (4등 이하 표와 동일 의미) */
const rankingKdaTotalsParenClass =
  "text-xs font-bold tabular-nums sm:text-[13px]";

function formatTotalKdaSlash(t: {
  kills: number;
  deaths: number;
  assists: number;
}): string {
  return `${t.kills}/${t.deaths}/${t.assists}`;
}

export function HallOfFameEntryCard({
  rank,
  nickname,
  championIconUrl,
  wins,
  winRatePercent,
  avgKda,
  statEmphasis = "default",
  rankingCardVariant = "none",
  losses,
  kdaTotals,
}: HallOfFameEntryCardProps) {
  const isFirst = rank === 1;
  const accent = hofRankAccentClass(rank);
  const glow = hofRankGlowClass(rank);
  const emphasizeKda = statEmphasis === "kda";
  const winTop = rankingCardVariant === "win-top" && losses != null;
  const kdaTop =
    rankingCardVariant === "kda-top" &&
    kdaTotals != null &&
    kdaTotals.games > 0;
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
        <div
          className={[
            "mt-1.5 flex flex-wrap items-baseline font-normal tabular-nums text-[color:var(--hof-muted)]",
            winTop || kdaTop
              ? "gap-x-3 gap-y-1.5 text-[10px] sm:gap-x-4 sm:text-[11px]"
              : "gap-x-4 gap-y-1 text-[10px] sm:text-[11px]",
          ].join(" ")}
        >
          {winTop ? (
            <>
              <span className="min-w-0">
                승률{" "}
                <strong className={`${rankingWinRateMainClass} ${accent} ${glow}`}>
                  {winRatePercent.toFixed(1)}% ({wins}승 {losses}패)
                </strong>
              </span>
              <span className="min-w-0">
                평균 KDA{" "}
                <strong className="text-xs font-medium tabular-nums text-[color:var(--hof-charcoal)] sm:text-[13px]">
                  {formatHallOfFameKda(avgKda)}
                </strong>
              </span>
            </>
          ) : kdaTop ? (
            <>
              <span className="min-w-0 shrink-0">
                승리{" "}
                <strong className={hofPlainStatStrongClass}>{wins}</strong>
                <span className="font-medium"> 회</span>
                <span className="mx-1 text-[color:var(--hof-muted)]/80 sm:mx-1.5">
                  ·
                </span>
                승률{" "}
                <strong className={hofPlainStatStrongClass}>
                  {winRatePercent.toFixed(1)}%
                </strong>
              </span>
              <span className="min-w-0">
                <span className="text-[10px] sm:text-[11px]">평균 KDA </span>
                <strong
                  className={`inline-flex flex-wrap items-baseline gap-x-1 tabular-nums ${accent} ${glow}`}
                >
                  <span className={rankingKdaMainValueClass}>
                    {formatHallOfFameKda(avgKda)}
                  </span>
                  <span className={`${rankingKdaTotalsParenClass} shrink-0`}>
                    ({formatTotalKdaSlash(kdaTotals)})
                  </span>
                </strong>
              </span>
            </>
          ) : (
            <>
              <span>
                승리{" "}
                <strong
                  className={
                    emphasizeKda
                      ? hofPlainStatStrongClass
                      : `${hofAccentStatMainClass} ${accent} ${glow}`
                  }
                >
                  {wins}
                </strong>
                <span className="font-medium"> 회</span>
              </span>
              <span>
                승률{" "}
                <strong
                  className={
                    emphasizeKda
                      ? hofPlainStatStrongClass
                      : `${hofAccentStatMainClass} ${accent} ${glow}`
                  }
                >
                  {winRatePercent.toFixed(1)}%
                </strong>
              </span>
              <span>
                평균 KDA{" "}
                <strong
                  className={
                    emphasizeKda
                      ? `${hofAccentStatMainClass} ${accent} ${glow}`
                      : "font-medium text-[color:var(--hof-charcoal)]"
                  }
                >
                  {formatHallOfFameKda(avgKda)}
                </strong>
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
