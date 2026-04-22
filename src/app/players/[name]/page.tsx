import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { championIconUrlByName } from "@/lib/ddragon";
import { championStatsFromParticipantRows } from "@/lib/match-stats";
import { createPublicSupabaseClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ name: string }> };

type PartRow = {
  match_id: number;
  champion: string;
  team: string;
  damage: number;
  kills: number;
  deaths: number;
  assists: number;
};

async function loadPlayerMatchRows(
  playerName: string,
): Promise<{ champion: string; is_win: boolean }[] | null> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data: parts, error: e1 } = await supabase
      .from("match_participants")
      .select(
        "match_id, champion, team, damage, kills, deaths, assists",
      )
      .eq("nickname", playerName);

    if (e1) return null;
    const list = (parts ?? []) as PartRow[];
    if (list.length === 0) return [];

    const ids = [...new Set(list.map((p) => p.match_id))];
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

    return list
      .filter((p) => winBy.get(p.match_id) != null)
      .map((p) => ({
        champion: p.champion,
        is_win: winBy.get(p.match_id) === p.team,
      }));
  } catch {
    return null;
  }
}

export default async function PlayerPage({ params }: PageProps) {
  const { name: raw } = await params;
  const playerName = decodeURIComponent(raw);

  const rows = await loadPlayerMatchRows(playerName);
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

  const champs = championStatsFromParticipantRows(rows);
  const withIcons = await Promise.all(
    champs.map(async (c) => ({
      ...c,
      icon: await championIconUrlByName(c.champion),
    })),
  );
  const maxGames = Math.max(...withIcons.map((c) => c.games), 1);
  const totalGames = rows.length;
  const wins = rows.filter((r) => r.is_win).length;
  const winRate = totalGames ? wins / totalGames : 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 bg-[var(--op-page)] px-4 py-10">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 text-sm text-[var(--op-muted)] hover:text-[var(--op-accent)]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        홈으로
      </Link>

      <header className="space-y-2 border-b border-white/5 pb-8">
        <h1 className="text-3xl font-bold text-[var(--op-text)]">{playerName}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--op-muted)]">
          <span>
            완료 매치 기준 <strong className="text-[var(--op-text)]">{totalGames}</strong>{" "}
            줄
          </span>
          <span>
            승률{" "}
            <strong className="text-[var(--op-blue-bright)]">
              {(winRate * 100).toFixed(1)}%
            </strong>
          </span>
        </div>
      </header>

      <section className="rounded-lg border border-white/5 bg-[var(--op-surface)] p-6">
        <div className="mb-6 flex items-center gap-2 text-[var(--op-text)]">
          <BarChart3 className="size-5 text-[var(--op-accent)]" aria-hidden />
          <h2 className="text-lg font-semibold">챔피언별 통계</h2>
        </div>
        <ul className="space-y-6">
          {withIcons.map((c) => (
            <li
              key={c.champion}
              className="rounded-lg border border-white/5 bg-[var(--op-elevated)]/50 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {c.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-md ring-1 ring-white/10"
                  />
                ) : null}
                <div>
                  <div className="font-medium text-[var(--op-text)]">
                    {c.champion}
                  </div>
                  <div className="text-xs text-[var(--op-muted)]">
                    {c.games}판 · 승 {c.wins} · 승률{" "}
                    {(c.win_rate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[var(--op-muted)]">
                  <span>판수 비중</span>
                  <span>
                    {c.games} / {maxGames}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--op-bg)]">
                  <div
                    className="h-full rounded-full bg-[var(--op-accent)]/80"
                    style={{ width: `${(c.games / maxGames) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
