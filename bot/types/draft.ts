/** match_drafts JSON 및 finalize_match_draft가 기대하는 키 (DB 컬럼과 동일) */
export type DraftRow = {
  nickname: string;
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
};
