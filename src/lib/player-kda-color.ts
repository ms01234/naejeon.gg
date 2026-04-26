/** 개인 페이지 KDA 수치 텍스트 색 (구간별) */
const KDA_GRAY = "#697873";
const KDA_GREEN = "#259A7E";
const KDA_BLUE = "#2F5BD6";
const KDA_ORANGE = "#F18C0F";

/**
 * 통산·챔피언별 평균 KDA 표시용 hex.
 * 0~1.99 회색, 2~2.99 초록, 3~3.99 파랑, 4+ 주황.
 */
export function kdaDisplayTextColorHex(kda: number): string {
  if (!Number.isFinite(kda)) return KDA_GRAY;
  if (kda < 2) return KDA_GRAY;
  if (kda < 3) return KDA_GREEN;
  if (kda < 4) return KDA_BLUE;
  return KDA_ORANGE;
}
