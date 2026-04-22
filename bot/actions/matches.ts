import type { SupabaseClient } from "@supabase/supabase-js";

export async function finalizeDraftMatch(
  sb: SupabaseClient,
  params: {
    guildId: string;
    userId: string;
    winner: "blue" | "red";
    durationSeconds: number;
  },
): Promise<{ ok: true; matchId: string } | { ok: false; message: string }> {
  try {
    const { data, error } = await sb.rpc("finalize_match_draft", {
      p_guild_id: params.guildId,
      p_user_id: params.userId,
      p_winner: params.winner,
      p_duration_seconds: params.durationSeconds,
    });

    if (error) {
      console.error("상세 에러 내용:", error);
      return { ok: false, message: error.message };
    }
    return { ok: true, matchId: String(data) };
  } catch (error) {
    console.error("상세 에러 내용:", error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "finalize_match_draft 호출 실패",
    };
  }
}
