import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_TITLE } from "@/lib/constants";
import { getRankingsPayload } from "@/lib/ranking-stats";
import { RankingTabs } from "@/components/ranking/RankingTabs";
import { RankingPageSkeleton } from "@/components/ranking/RankingPageSkeleton";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `종합 랭킹 · ${SITE_TITLE}`,
  description: "승률·KDA·챔피언 폭(고유 챔피언 수) 랭킹",
};

async function RankingData() {
  const data = await getRankingsPayload();
  if (!data) {
    return (
      <div className="rounded-xl border border-white/10 bg-[var(--op-panel)] px-4 py-10 text-center text-sm text-[var(--op-muted)]">
        랭킹 데이터를 불러오지 못했습니다. Supabase 설정을 확인해 주세요.
      </div>
    );
  }
  return <RankingTabs data={data} />;
}

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-[var(--op-page)]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-10">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--op-text)]">
          종합 랭킹
        </h1>
        <p className="mb-8 text-sm text-[var(--op-muted)]">
          승률, KDA, 챔피언 폭(고유 챔피언 수)을 탭으로 전환해 볼 수 있습니다. 데이터는 최대
          약 1시간 간격으로 갱신됩니다.
        </p>
        <Suspense fallback={<RankingPageSkeleton />}>
          <RankingData />
        </Suspense>
      </div>
    </div>
  );
}
