/**
 * DB·검색에 쓰이는 정식 닉네임으로 통일 (봇 `resolveCanonicalParticipantNickname` 과 동일 규칙 유지).
 */
export function resolveCanonicalParticipantNickname(raw: string): string {
  const t = raw.trim();
  if (t === "자르반") return "자르반4세";
  if (t === "이서아") return "안녕하세용가뤼";
  return t;
}
