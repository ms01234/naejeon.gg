import { Crown } from "lucide-react";

type Rank = 1 | 2 | 3;

const crown = (
  <Crown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
);

export function HallOfFameRankBadge({ rank }: { rank: Rank }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#F52945]/45 bg-[#F52945]/14 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#F52945] sm:text-xs">
        {crown}
        <span>1st</span>
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#A53DF5]/45 bg-[#A53DF5]/14 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#A53DF5] sm:text-xs">
        {crown}
        <span>2nd</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#2CF487]/45 bg-[#2CF487]/14 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#2CF487] sm:text-xs">
      {crown}
      <span>3rd</span>
    </span>
  );
}
