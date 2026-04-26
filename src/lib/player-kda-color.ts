/** 개인 페이지 KDA 수치 텍스트 색 (구간별) */
const KDA_GRAY = "#686868";
const KDA_MINT = "#00E2A7";
const KDA_BLUE = "#5CAAFF";
const KDA_TOP = "#F18C0F";

/**
 * 통산·챔피언별 평균 KDA 표시용 hex.
 * 0~1.99 어두운 회색, 2~2.99 민트, 3~3.99 밝은 파랑, 4+ 주황.
 */
export function kdaDisplayTextColorHex(kda: number): string {
  if (!Number.isFinite(kda)) return KDA_GRAY;
  if (kda < 2) return KDA_GRAY;
  if (kda < 3) return KDA_MINT;
  if (kda < 4) return KDA_BLUE;
  return KDA_TOP;
}
