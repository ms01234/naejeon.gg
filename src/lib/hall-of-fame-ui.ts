/**
 * 명예의 전당 UI 전용 — 색은 globals.css `:root` 의 `--hof-*` 와 맞출 것.
 */

export function formatHallOfFameKda(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

/** 순위 숫자·승수·1위 왕관 등 포인트 컬러 (Tailwind + CSS 변수) */
export function hofRankAccentClass(rank: number): string {
  if (rank === 1) return "text-[color:var(--hof-rank-1)]";
  if (rank === 2) return "text-[color:var(--hof-rank-2)]";
  return "text-[color:var(--hof-rank-3)]";
}

/** 에러·빈 상태 등 중앙 패널 */
export const HOF_PANEL_BASE =
  "rounded-lg border border-slate-200 bg-[color:var(--hof-surface)] px-6 py-10 text-center text-[color:var(--hof-charcoal)] shadow-sm shadow-slate-900/5 sm:px-8";

/** 랭킹 1행 카드 */
export const HOF_ENTRY_CARD =
  "flex items-center gap-3 rounded-lg border border-slate-200 bg-[color:var(--hof-surface)] px-3 py-3 text-[color:var(--hof-charcoal)] shadow-sm shadow-slate-900/5 sm:gap-4 sm:px-4 sm:py-3.5";
