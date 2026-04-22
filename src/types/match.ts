export type TeamSide = "blue" | "red";

/** public.matches — DB 컬럼과 동일 */
export type MatchRow = {
  id: number;
  guild_id: string;
  winner: TeamSide;
  duration_seconds: number;
  created_at: string;
};

/** public.match_participants — DB 컬럼과 동일 */
export type MatchParticipantRow = {
  id: number;
  match_id: number;
  team: TeamSide;
  nickname: string;
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
};

export type MatchWithParticipants = MatchRow & {
  match_participants: MatchParticipantRow[];
};

/** UI용: 아이콘 URL 포함 */
export type ParticipantUi = MatchParticipantRow & {
  iconUrl: string | null;
};

export type MatchCardUi = {
  match: MatchRow;
  blue: ParticipantUi[];
  red: ParticipantUi[];
};

export type ChampionAggregate = {
  champion: string;
  games: number;
  wins: number;
  win_rate: number;
  /** (해당 챔피언 판수) / (소환사 전체 완료 매치 참여 수) × 100 */
  pick_rate: number;
  /** 집계 K+A 대 D (D=0이면 K+A) */
  avg_kda: number;
};
