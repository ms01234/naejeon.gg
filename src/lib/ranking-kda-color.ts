/**
 * 랭킹 리스트 KDA 텍스트 색.
 * 0~1.99 #686868, 2~2.99 #00E2A7, 3~3.99 #5CAAFF, 4+ #FFDC00
 */
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
