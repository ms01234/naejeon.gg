import Link from "next/link";
import { championIconUrlByName } from "@/lib/ddragon";
import { rankingKdaDisplayTextColorHex } from "@/lib/ranking-kda-color";
import type { KdaRankEntry, RankingsPayload, WinRateRankEntry } from "@/lib/ranking-stats";
import { HallOfFameEntryCard } from "@/components/match/HallOfFameEntryCard";

const RANKING_HINT =
  "완료된 내전(양 팀 5인·승자 확정)만 집계합니다. 승률 랭킹은 9판 이상, KDA 랭킹은 5판 이상 출전한 소환사만 포함됩니다.";

function TableScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain sm:mx-0">
      {children}
    </div>
  );
}

function rowShellClass(): string {
  return "border border-white/[0.06] bg-[var(--op-surface)]/80";
}

function formatKdaDisplay(row: KdaRankEntry): string {
  if (row.perfect) return "Perfect";
  return row.kdaValue.toFixed(2);
}

function kdaNumericForColor(row: KdaRankEntry): number {
  if (row.perfect) return row.kdaValue;
  return row.kdaValue;
}

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

function WinRateRestTable({ rows }: { rows: WinRateRankEntry[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <TableScroll>
        <table className="w-full min-w-[20.5rem] table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-0 sm:text-sm sm:leading-normal">
          <colgroup>
            <col className="w-11 sm:w-14" />
            <col className="w-[32%] sm:w-[30%]" />
            <col className="w-[4.25rem] sm:w-24" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wide text-[var(--op-muted)] sm:text-xs">
              <th className="px-1.5 py-2.5 sm:px-3 sm:py-3">순위</th>
              <th className="min-w-0 px-1.5 py-2.5 sm:px-3 sm:py-3">소환사</th>
              <th className="whitespace-nowrap px-1.5 py-2.5 text-right sm:px-3 sm:py-3">
                승률
              </th>
              <th className="whitespace-nowrap px-1.5 py-2.5 pr-2 text-right sm:px-3 sm:py-3">
                전적
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => (
              <tr key={r.nickname} className={rowShellClass()}>
                <td className="px-1.5 py-2 align-middle tabular-nums sm:px-3 sm:py-3">
                  <span className="font-semibold text-[var(--op-text)]">{r.rank}</span>
                </td>
                <td className="min-w-0 max-w-0 px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                  <Link
                    href={`/players/${encodeURIComponent(r.nickname)}`}
                    className="block truncate font-medium text-[var(--op-accent-bright)] hover:underline"
                    title={r.nickname}
                  >
                    {r.nickname}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-1.5 py-2 text-right font-semibold tabular-nums text-[var(--op-text)] sm:px-3 sm:py-3">
                  {r.winRatePercent.toFixed(1)}%
                </td>
                <td className="whitespace-nowrap px-1.5 py-2 pr-2 text-right tabular-nums text-[var(--op-muted)] sm:px-3 sm:py-3">
                  {r.wins}승{r.losses}패·{r.games}판
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}

function KdaRestTable({ rows }: { rows: KdaRankEntry[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--op-panel)]">
      <TableScroll>
        <table className="w-full min-w-[19rem] table-fixed border-collapse text-left text-[11px] leading-snug sm:min-w-0 sm:text-sm sm:leading-normal">
          <colgroup>
            <col className="w-11 sm:w-14" />
            <col className="w-[34%] sm:w-[32%]" />
            <col className="w-[3.75rem] sm:w-24" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-medium uppercase tracking-wide text-[var(--op-muted)] sm:text-xs">
              <th className="px-1.5 py-2.5 sm:px-3 sm:py-3">순위</th>
              <th className="min-w-0 px-1.5 py-2.5 sm:px-3 sm:py-3">소환사</th>
              <th className="whitespace-nowrap px-1.5 py-2.5 text-right sm:px-3 sm:py-3">
                KDA
              </th>
              <th className="whitespace-nowrap px-1.5 py-2.5 pr-2 text-right sm:px-3 sm:py-3">
                K/D/A
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => {
              const kdaColor = rankingKdaDisplayTextColorHex(kdaNumericForColor(r));
              return (
                <tr key={r.nickname} className={rowShellClass()}>
                  <td className="px-1.5 py-2 align-middle tabular-nums sm:px-3 sm:py-3">
                    <span className="font-semibold text-[var(--op-text)]">{r.rank}</span>
                  </td>
                  <td className="min-w-0 max-w-0 px-1.5 py-2 align-middle sm:px-3 sm:py-3">
                    <Link
                      href={`/players/${encodeURIComponent(r.nickname)}`}
                      className="block truncate font-medium text-[var(--op-accent-bright)] hover:underline"
                      title={r.nickname}
                    >
                      {r.nickname}
                    </Link>
                  </td>
                  <td
                    className="whitespace-nowrap px-1.5 py-2 text-right font-semibold tabular-nums sm:px-3 sm:py-3"
                    style={{ color: kdaColor }}
                  >
                    {formatKdaDisplay(r)}
                  </td>
                  <td className="whitespace-nowrap px-1.5 py-2 pr-2 text-right tabular-nums text-[var(--op-muted)] sm:px-3 sm:py-3">
                    {r.kills}/{r.deaths}/{r.assists}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}

async function WinRateColumn({ winRate }: { winRate: WinRateRankEntry[] }) {
  const top = winRate.slice(0, 3);
  const rest = winRate.slice(3);
  const icons = await resolveTopIcons(top);

  if (winRate.length === 0) {
    return (
      <section className="min-w-0">
        <h2 className="mb-3 text-lg font-bold tracking-tight text-[var(--op-text)]">
          승률 TOP 랭킹
        </h2>
        <p className="rounded-lg border border-white/10 bg-[var(--op-panel)] px-4 py-8 text-center text-sm text-[var(--op-muted)]">
          조건을 만족하는 소환사가 없습니다. (완료 매치 9판 이상)
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0">
      <h2 className="mb-3 text-lg font-bold tracking-tight text-[var(--op-text)]">
        승률 TOP 랭킹
      </h2>
      <ul className="mb-4 flex flex-col gap-3">
        {top.map((e, i) => (
          <li key={`${e.rank}-${e.nickname}`}>
            <HallOfFameEntryCard
              rank={e.rank as 1 | 2 | 3}
              nickname={e.nickname}
              championIconUrl={icons[i] ?? null}
              wins={e.wins}
              winRatePercent={e.winRatePercent}
              avgKda={e.avgKda}
            />
          </li>
        ))}
      </ul>
      <WinRateRestTable rows={rest} />
    </section>
  );
}

async function KdaColumn({ kda }: { kda: KdaRankEntry[] }) {
  const top = kda.slice(0, 3);
  const rest = kda.slice(3);
  const icons = await resolveTopIcons(top);

  if (kda.length === 0) {
    return (
      <section className="min-w-0">
        <h2 className="mb-3 text-lg font-bold tracking-tight text-[var(--op-text)]">
          KDA TOP 랭킹
        </h2>
        <p className="rounded-lg border border-white/10 bg-[var(--op-panel)] px-4 py-8 text-center text-sm text-[var(--op-muted)]">
          조건을 만족하는 소환사가 없습니다. (완료 매치 5판 이상)
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0">
      <h2 className="mb-3 text-lg font-bold tracking-tight text-[var(--op-text)]">
        KDA TOP 랭킹
      </h2>
      <ul className="mb-4 flex flex-col gap-3">
        {top.map((e, i) => {
          const cardKda = (e.kills + e.assists) / Math.max(e.deaths, 1);
          const winPct =
            e.games > 0 ? Math.round((e.wins / e.games) * 1000) / 10 : 0;
          return (
            <li key={`${e.rank}-${e.nickname}`}>
              <HallOfFameEntryCard
                rank={e.rank as 1 | 2 | 3}
                nickname={e.nickname}
                championIconUrl={icons[i] ?? null}
                wins={e.wins}
                winRatePercent={winPct}
                avgKda={cardKda}
              />
            </li>
          );
        })}
      </ul>
      <KdaRestTable rows={rest} />
    </section>
  );
}

export async function RankingBoard({ data }: { data: RankingsPayload }) {
  return (
    <div className="space-y-6">
      <p className="text-xs leading-relaxed text-[var(--op-muted)]">{RANKING_HINT}</p>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
        <WinRateColumn winRate={data.winRate} />
        <KdaColumn kda={data.kda} />
      </div>
    </div>
  );
}
