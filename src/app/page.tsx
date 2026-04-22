export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { HallOfFame } from "@/components/match/HallOfFame";
import { HomeLogo } from "@/components/match/HomeLogo";
import { HomeSearch } from "@/components/match/HomeSearch";
import { getSearchPlayerNames, MatchHistory } from "@/components/match/MatchHistory";

export default async function Home() {
  const players = await getSearchPlayerNames();

  return (
    <div className="min-h-screen bg-[var(--op-page)]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:pt-5">
        <div className="flex w-full justify-center">
          <HomeLogo />
        </div>

        <div className="mt-6 w-full space-y-10 sm:mt-8 sm:space-y-12">
          <div className="flex w-full justify-center">
            <HomeSearch players={players} />
          </div>

          <HallOfFame />

          <section className="w-full">
            <h2 className="mb-3 text-left text-lg font-bold tracking-tight text-[var(--op-text)]">
              최근 전적
            </h2>
            <MatchHistory />
          </section>
        </div>
      </div>
    </div>
  );
}
