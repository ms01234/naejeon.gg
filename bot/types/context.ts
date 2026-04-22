import type { SupabaseClient } from "@supabase/supabase-js";

export type BotContext = {
  supabase: SupabaseClient;
  recorderRoleId: string | undefined;
  /** 비우면 전적 삭제는 Discord 관리자(Administrator)만 */
  matchDeleteRoleId: string | undefined;
};
