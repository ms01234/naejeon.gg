/**
 * Data Dragon `champion.json` 의 `id` 필드 값 (파일명과 동일).
 * 한글 별칭·줄임말·영문 약어 등은 normalize 후 매칭됩니다.
 */
export const CHAMPION_ALIAS_TO_ID: Record<string, string> = {
  // 자주 쓰는 한국어 줄임
  트페: "TwistedFate",
  트위치: "Twitch",
  딩거: "Heimerdinger",
  하임: "Heimerdinger",
  문도: "DrMundo",
  // 직스(Ziggs) / 징크스(Jinx) 혼동 방지: 별칭은 반드시 정확히 매핑
  직스: "Ziggs",
  케틀: "Katarina",
  케이틀: "Katarina",
  바드: "Bard",
  케인: "Kayn",
  아지르: "Azir",
  렝가: "Rengar",
  카직스: "Khazix",
  카직: "Khazix",
  렉사이: "RekSai",
  벨베스: "Belveth",
  나르: "Gnar",
  니달리: "Nidalee",
  니달: "Nidalee",
  케넨: "Kennen",
  // 영문 약어
  tf: "TwistedFate",
  mf: "MissFortune",
  gp: "Gangplank",
  xin: "XinZhao",
  xinzhao: "XinZhao",
  lee: "LeeSin",
  leesin: "LeeSin",
  // 띄어쓰기/표기 흔한 변형 (id는 Riot 표준)
  "리시": "LeeSin",
  "리신": "LeeSin",
  가랜: "Garen",
  가렝: "Garen",
};
