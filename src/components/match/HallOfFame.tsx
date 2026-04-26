import { fetchHallOfFameTop3 } from "@/lib/hall-of-fame";
import { HOF_PANEL_BASE } from "@/lib/hall-of-fame-ui";
import { HallOfFameEntryCard } from "@/components/match/HallOfFameEntryCard";

function HallOfFameShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full bg-[var(--op-page)] font-sans">
      <h2 className="mb-3 text-left text-lg font-bold tracking-tight text-[var(--op-text)]">
        명예의 전당
      </h2>
      {children}
    </section>
  );
}

export async function HallOfFame() {
  const res = await fetchHallOfFameTop3();

  if (!res.ok) {
    return (
      <HallOfFameShell>
        <div className={`${HOF_PANEL_BASE} text-[color:var(--hof-charcoal)]`}>
          <p className="text-sm font-semibold text-red-400">
            랭킹을 불러오지 못했습니다.
          </p>
          <p className="mt-2 text-xs text-red-400/85">{res.message}</p>
        </div>
      </HallOfFameShell>
    );
  }

  if (res.entries.length === 0) {
    return (
      <HallOfFameShell>
        <div className={`${HOF_PANEL_BASE} py-12`}>
          <p className="text-sm text-[color:var(--hof-muted)]">
            집계할 전적이 아직 없습니다.
          </p>
        </div>
      </HallOfFameShell>
    );
  }

  return (
    <HallOfFameShell>
      <ul className="flex flex-col gap-3">
        {res.entries.map((e) => (
          <li key={`${e.rank}-${e.nickname}`}>
            <HallOfFameEntryCard
              rank={e.rank as 1 | 2 | 3}
              nickname={e.nickname}
              championIconUrl={e.championIconUrl}
              wins={e.wins}
              winRatePercent={e.winRatePercent}
              avgKda={e.avgKda}
            />
          </li>
        ))}
      </ul>
    </HallOfFameShell>
  );
}
