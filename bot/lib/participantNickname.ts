/**
 * 전적 입력(봇) → DB에 저장될 소환사 닉네임.
 * 흔한 별칭을 사이트·랭킹에서 쓰는 정식 표기으로 통일합니다.
 */
export function resolveCanonicalParticipantNickname(raw: string): string {
  const t = raw.trim();
  if (t === "자르반") return "자르반4세";
  return t;
}
