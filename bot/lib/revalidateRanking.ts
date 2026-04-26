/**
 * Next.js `/ranking` 경로를 즉시 갱신하도록 요청합니다.
 * `RANKING_REVALIDATE_BASE_URL`(또는 `NEXT_PUBLIC_SITE_URL`) + `REVALIDATE_SECRET` 이 모두 있을 때만 호출됩니다.
 */
export async function requestRankingPageRevalidate(): Promise<void> {
  const base =
    process.env.RANKING_REVALIDATE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!base || !secret) return;

  const url = `${base.replace(/\/$/, "")}/api/revalidate-ranking`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.error(
        "랭킹 revalidate 요청 실패:",
        res.status,
        await res.text().catch(() => ""),
      );
    }
  } catch (e) {
    console.error("랭킹 revalidate 요청 오류:", e);
  }
}
