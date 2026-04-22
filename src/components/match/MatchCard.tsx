import Link from "next/link";
import { MatchDamageBar } from "@/components/match/MatchDamageBar";
import type { MatchCardUi, ParticipantUi } from "@/types/match";

/** 승리 팀 / 패배 팀 배경 (지시문 색상) */
const WIN_BG = "#28344E";
const LOSE_BG = "#59343B";
const HEADER_BG = "#31313C";

/** 피해량 라벨과 동일한 크기·두께 */
const DAMAGE_LABEL_CLASS = "text-[11px] font-medium tabular-nums";

function formatDuration(sec: number | null) {
  if (sec == null || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** 「KDA」라벨 + 숫자 · 피해량과 같은 text-[11px] · font-medium */
function KdaInline({ p, side }: { p: ParticipantUi; side: "blue" | "red" }) {
  return (
    <span
      className={`font-sans inline-flex shrink-0 items-center gap-1.5 ${DAMAGE_LABEL_CLASS} leading-none text-white/90 ${
        side === "blue" ? "mr-2.5" : "ml-2.5"
      }`}
    >
      <span className="shrink-0 text-white/90">KDA</span>
      <span className="inline-flex items-center gap-0 tabular-nums">
        <span className="text-white">{p.kills}</span>
        <span className="text-white/40">/</span>
        <span className="text-red-500">{p.deaths}</span>
        <span className="text-white/40">/</span>
        <span className="text-white">{p.assists}</span>
      </span>
    </span>
  );
}

function LaneCell({
  p,
  side,
  matchMaxDamage,
}: {
  p: ParticipantUi;
  side: "blue" | "red";
  matchMaxDamage: number;
}) {
  const align = side === "blue" ? "left" : "right";
  const maxD = Math.max(1, matchMaxDamage);

  const img = p.iconUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.iconUrl}
      alt=""
      width={40}
      height={40}
      className="size-10 shrink-0 rounded-md border border-white/20 object-cover ring-1 ring-black/15"
    />
  ) : (
    <div className="size-10 shrink-0 rounded-md border border-white/20 bg-black/25 ring-1 ring-black/15" />
  );

  const damageRow = (
    <div
      className={`flex w-full min-w-0 max-w-full items-center gap-1.5 ${
        side === "red" ? "flex-row-reverse" : ""
      }`}
    >
      <span className={`shrink-0 ${DAMAGE_LABEL_CLASS} text-white/90`}>
        피해량 {p.damage.toLocaleString("ko-KR")}
      </span>
      <div className="min-w-0 flex-1 basis-0">
        <MatchDamageBar
          value={p.damage}
          max={maxD}
          align={align}
          tone={side}
          heightClass="h-1.5"
        />
      </div>
    </div>
  );

  /** 1행: 닉네임 + KDA(같은 높이) · 2행: 피해량(라벨+바) — 바는 열 끝까지 flex-1 */
  const nickDamageCluster = (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-1.5 ${
        side === "red" ? "text-right" : "text-left"
      }`}
    >
      <div
        className={`flex w-full min-w-0 max-w-full items-end gap-2 ${
          side === "red" ? "flex-row-reverse" : ""
        }`}
      >
        <Link
          href={`/players/${encodeURIComponent(p.nickname)}`}
          className={`min-w-0 flex-1 basis-0 truncate text-sm font-semibold leading-tight text-white hover:text-white/90 ${
            side === "red" ? "text-right" : "text-left"
          }`}
        >
          {p.nickname}
        </Link>
        <KdaInline p={p} side={side} />
      </div>
      {damageRow}
    </div>
  );

  /** 블루: [이미지] | 닉+KDA / 피해량(전폭) */
  /** 레드: 닉+KDA / 피해량(전폭) | [이미지] */
  const body =
    side === "blue" ? (
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0">{img}</div>
        {nickDamageCluster}
      </div>
    ) : (
      <div className="flex min-w-0 items-center gap-3">
        {nickDamageCluster}
        <div className="shrink-0">{img}</div>
      </div>
    );

  return (
    <div className="min-w-0 flex-1 px-3 py-2 sm:px-3 sm:py-2.5">{body}</div>
  );
}

type Props = { data: MatchCardUi };

export function MatchCard({ data }: Props) {
  const { match, blue, red } = data;
  const blueWon = match.winner === "blue";
  const played = new Date(match.created_at);
  const matchMaxDamage = Math.max(
    1,
    ...[...blue, ...red].map((p) => p.damage),
  );

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/40">
      <header
        className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/10 px-3 py-2 text-xs sm:text-[13px]"
        style={{ backgroundColor: HEADER_BG }}
      >
        <time dateTime={match.created_at} className="font-medium tabular-nums text-white">
          {played.toLocaleString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
        <span className="hidden h-3 w-px bg-white/20 sm:inline" aria-hidden />
        <span className="tabular-nums text-white/85">
          플레이 {formatDuration(match.duration_seconds)}
        </span>
      </header>

      <div className="divide-y divide-white/[0.08]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:items-stretch"
          >
            <div
              className="border-b border-white/[0.06] sm:border-b-0 sm:border-r sm:border-white/[0.06]"
              style={{ backgroundColor: blueWon ? WIN_BG : LOSE_BG }}
            >
              <LaneCell
                p={blue[i]!}
                side="blue"
                matchMaxDamage={matchMaxDamage}
              />
            </div>

            <div style={{ backgroundColor: blueWon ? LOSE_BG : WIN_BG }}>
              <LaneCell
                p={red[i]!}
                side="red"
                matchMaxDamage={matchMaxDamage}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
