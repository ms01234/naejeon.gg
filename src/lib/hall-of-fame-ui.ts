/**
 * 명예의 전당 UI — 색·글로우는 globals.css `:root` 의 `--hof-*` 와 동기화.
 */

export function formatHallOfFameKda(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

export function hofRankAccentClass(rank: number): string {
  if (rank === 1) return "text-[color:var(--hof-rank-1)]";
  if (rank === 2) return "text-[color:var(--hof-rank-2)]";
  return "text-[color:var(--hof-rank-3)]";
}

/** 왼쪽 4px 포인트 보더 (border-l-4 + 등수 색) */
export function hofRankLeftBorderClass(rank: number): string {
  if (rank === 1) return "border-l-[color:var(--hof-rank-1)]";
  if (rank === 2) return "border-l-[color:var(--hof-rank-2)]";
  return "border-l-[color:var(--hof-rank-3)]";
}

/** 순위 숫자·승수 등 — 보석 느낌 은은한 네온 */
export function hofRankGlowClass(rank: number): string {
  if (rank === 1) {
    return "[filter:drop-shadow(0_0_10px_rgba(245,41,69,0.55))_drop-shadow(0_0_22px_rgba(245,41,69,0.28))]";
  }
  if (rank === 2) {
    return "[filter:drop-shadow(0_0_10px_rgba(165,61,245,0.5))_drop-shadow(0_0_22px_rgba(165,61,245,0.25))]";
  }
  return "[filter:drop-shadow(0_0_10px_rgba(22,201,127,0.5))_drop-shadow(0_0_22px_rgba(22,201,127,0.25))]";
}

/** 1등 카드 외곽 은은한 레드 광채 */
export function hofFirstPlaceOuterGlowClass(): string {
  return "shadow-[0_0_36px_-8px_rgba(245,41,69,0.42),0_0_72px_-20px_rgba(245,41,69,0.18)]";
}

const HOF_GLASS_FRAME =
  "relative overflow-hidden rounded-xl border border-white/10 backdrop-blur-md";

const HOF_CARD_HOVER =
  "transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/[0.08]";

/** 에러·빈 상태 패널 (호버 들림 없음) */
export const HOF_PANEL_BASE = `${HOF_GLASS_FRAME} bg-[color:var(--hof-surface)] px-6 py-10 text-center sm:px-8`;

/** 랭킹 행 카드 */
export function hofEntryCardBaseClass(rank: number): string {
  const bg =
    rank === 1
      ? "bg-white/10"
      : "bg-[color:var(--hof-surface)]";
  return `${HOF_GLASS_FRAME} ${HOF_CARD_HOVER} ${bg} flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5 border-l-4 ${hofRankLeftBorderClass(rank)}`;
}

/**
 * 개인 페이지 상단 프로필 박스 — 명예의 전당 카드와 동일 글래스 + 왼쪽 4px 스트립.
 * TOP3: 홈 명예의 전당과 동일 등수색, 그 외: 하늘색 스트립.
 */
export function playerProfileCardClass(hofRank: 1 | 2 | 3 | null): string {
  const bg =
    hofRank === 1
      ? "bg-white/10"
      : "bg-[color:var(--hof-surface)]";
  const stripe =
    hofRank == null
      ? "border-l-sky-400/75"
      : hofRankLeftBorderClass(hofRank);
  const glow = hofRank === 1 ? hofFirstPlaceOuterGlowClass() : "";
  return [
    HOF_GLASS_FRAME,
    HOF_CARD_HOVER,
    "w-full flex flex-col gap-3 p-5 sm:gap-3 sm:p-6",
    bg,
    "border-l-4",
    stripe,
    glow,
  ]
    .filter(Boolean)
    .join(" ");
}
