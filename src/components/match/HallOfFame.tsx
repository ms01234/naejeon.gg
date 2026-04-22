import Link from "next/link";
import { Crown } from "lucide-react";
import { fetchHallOfFameTop3 } from "@/lib/hall-of-fame";

/** 사이트 페이지 배경과 동일 (섹션 바깥) */
const PAGE_BG = "#1C1C1F";

/** 등수별 포인트 (순위 숫자·승수) */
function rankAccentClass(rank: number): string {
  if (rank === 1) return "text-[#F52945]";
  if (rank === 2) return "text-[#A53DF5]";
  return "text-[#2CF487]";
}

function formatKda(v: number) {
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

const lightPanelClass =
  "rounded-lg border border-slate-200 bg-[#F1F5F9] px-6 py-10 text-center text-[#1E293B] shadow-sm shadow-slate-900/5 sm:px-8";

export async function HallOfFame() {
  const res = await fetchHallOfFameTop3();

  if (!res.ok) {
    return (
      <section className="w-full font-sans" style={{ backgroundColor: PAGE_BG }}>
        <h2 className="mb-3 text-left text-lg font-bold tracking-tight text-[var(--op-text)]">
          명예의 전당
        </h2>
        <div className={lightPanelClass}>
          <p className="text-sm font-semibold text-red-600">
            랭킹을 불러오지 못했습니다.
          </p>
          <p className="mt-2 text-xs text-red-600/80">{res.message}</p>
        </div>
      </section>
    );
  }

  if (res.entries.length === 0) {
    return (
      <section className="w-full font-sans" style={{ backgroundColor: PAGE_BG }}>
        <h2 className="mb-3 text-left text-lg font-bold tracking-tight text-[var(--op-text)]">
          명예의 전당
        </h2>
        <div className={`${lightPanelClass} py-12`}>
          <p className="text-sm text-[#475569]">
            집계할 전적이 아직 없습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full font-sans" style={{ backgroundColor: PAGE_BG }}>
      <h2 className="mb-3 text-left text-lg font-bold tracking-tight text-[var(--op-text)]">
        명예의 전당
      </h2>
      <ul className="flex flex-col gap-3">
        {res.entries.map((e) => {
          const isFirst = e.rank === 1;
          const accent = rankAccentClass(e.rank);
          return (
            <li key={`${e.rank}-${e.nickname}`}>
              <article className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#F1F5F9] px-3 py-3 text-[#1E293B] shadow-sm shadow-slate-900/5 sm:gap-4 sm:px-4 sm:py-3.5">
                <div className="flex w-11 shrink-0 flex-col items-center justify-center tabular-nums sm:w-12">
                  <span
                    className={`text-[1.65rem] font-bold leading-none sm:text-[1.85rem] ${accent}`}
                  >
                    {e.rank}
                  </span>
                  <span
                    className="mt-0.5 text-[10px] font-semibold leading-none text-[#1E293B] sm:text-[11px]"
                  >
                    위
                  </span>
                </div>

                <div className="shrink-0">
                  {e.championIconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.championIconUrl}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 rounded-md border border-slate-200 object-cover sm:size-12"
                    />
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-md border border-slate-200 bg-slate-200/80 text-sm font-semibold text-slate-500 sm:size-12">
                      ?
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {isFirst ? (
                      <Crown
                        className={`size-3.5 shrink-0 sm:size-4 ${accent}`}
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : null}
                    <Link
                      href={`/players/${encodeURIComponent(e.nickname)}`}
                      className={`min-w-0 flex-1 truncate font-semibold text-[#0F172A] transition-opacity hover:opacity-80 ${
                        isFirst ? "text-base sm:text-lg" : "text-sm sm:text-base"
                      }`}
                    >
                      {e.nickname}
                    </Link>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium tabular-nums text-[#1E293B] sm:text-xs">
                    <span>
                      승리{" "}
                      <strong className={`font-bold ${accent}`}>
                        {e.wins}
                      </strong>
                      회
                    </span>
                    <span>
                      평균 KDA{" "}
                      <strong className="font-semibold text-[#1E293B]">
                        {formatKda(e.avgKda)}
                      </strong>
                    </span>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
