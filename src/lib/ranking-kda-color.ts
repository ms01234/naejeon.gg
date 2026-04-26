/** 랭킹 페이지 표시용 KDA 텍스트 색 (개인 페이지 `kdaDisplayTextColorHex` 와 구간 동일, 4+ 만 골드) */
const KDA_GRAY = "#686868";
const KDA_MINT = "#00E2A7";
const KDA_BLUE = "#5CAAFF";
const KDA_TOP = "#FFDC00";

export function rankingKdaDisplayTextColorHex(kda: number): string {
  if (!Number.isFinite(kda)) return KDA_GRAY;
  if (kda < 2) return KDA_GRAY;
  if (kda < 3) return KDA_MINT;
  if (kda < 4) return KDA_BLUE;
  return KDA_TOP;
}
