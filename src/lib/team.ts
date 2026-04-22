/**
 * DB·외부 입력에서 blue/red 가 대소문자 섞여 들어와도 동일하게 비교.
 */
export function normalizeTeamSide(
  t: string | null | undefined,
): "blue" | "red" | null {
  const s = String(t ?? "")
    .trim()
    .toLowerCase();
  if (s === "blue") return "blue";
  if (s === "red") return "red";
  return null;
}
