/** 디스코드 봇 입력 순: 블루 0~4, 레드 5~9 = 탑·정글·미드·원딜·서폿 각각 대응 */
export type LaneId = "TOP" | "JNG" | "MID" | "ADC" | "SUP";

export type LaneTab = "ALL" | LaneId;

export const LANE_IDS: LaneId[] = ["TOP", "JNG", "MID", "ADC", "SUP"];

export const LANE_LABEL_KO: Record<LaneId, string> = {
  TOP: "탑",
  JNG: "정글",
  MID: "미드",
  ADC: "원딜",
  SUP: "서폿",
};

/** match_participants 를 match 내 id 오름차순으로 정렬했을 때의 0~9 인덱스 */
export function slotIndexToLane(index: number): LaneId {
  return LANE_IDS[index % 5]!;
}
