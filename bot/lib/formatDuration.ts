/** 저장·로직은 초 단위, 디스코드 메시지 등 표시용 MM:SS */
export function formatSecondsAsClock(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
