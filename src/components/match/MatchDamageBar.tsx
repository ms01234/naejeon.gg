type Tone = "blue" | "red";

type Props = {
  value: number;
  max: number;
  align: "left" | "right";
  tone: Tone;
  heightClass?: string;
};

export function MatchDamageBar({
  value,
  max,
  align,
  tone,
  heightClass = "h-2",
}: Props) {
  const pct = Math.min(100, Math.round((value / max) * 1000) / 10);
  const fill =
    tone === "blue"
      ? "bg-gradient-to-r from-orange-600/95 to-orange-400/92 shadow-[0_0_14px_rgba(249,115,22,0.48)]"
      : "bg-gradient-to-l from-orange-600/95 to-orange-400/92 shadow-[0_0_14px_rgba(249,115,22,0.42)]";
  return (
    <div
      className={`${heightClass} w-full overflow-hidden rounded-full bg-black/45 ring-1 ring-black/20 ${
        align === "right" ? "flex justify-end" : ""
      }`}
    >
      <div
        className={`h-full max-w-full rounded-full ${fill}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
