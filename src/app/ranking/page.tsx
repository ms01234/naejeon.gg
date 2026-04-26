import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_TITLE } from "@/lib/constants";
import { getRankingsPayload } from "@/lib/ranking-stats";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { RankingPageSkeleton } from "@/components/ranking/RankingPageSkeleton";

export const metadata: Metadata = {
  title: `종합 랭킹 · ${SITE_TITLE}`,
  description: "승률·KDA 랭킹. 전적이 저장되면 곧바로 반영됩니다.",
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
  return <RankingBoard data={data} />;
}

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-[var(--op-page)]">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:pt-10">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--op-text)]">
          종합 랭킹
        </h1>
        <p className="mb-8 text-sm text-[var(--op-muted)]">
          승률과 KDA를 나란히 확인할 수 있습니다. 새 전적이 확정되면 이 페이지가 곧바로
          갱신됩니다.
        </p>
        <Suspense fallback={<RankingPageSkeleton />}>
          <RankingData />
        </Suspense>
      </div>
    </div>
  );
}
