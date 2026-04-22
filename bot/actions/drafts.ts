import type { SupabaseClient } from "@supabase/supabase-js";
import type { DraftRow } from "../types/draft";

/** DB 컬럼 guild_id — 카멜케이스 키로 보내지 않도록 주의 */
function normalizeGuildId(guildId: string): string | null {
  const g = guildId?.trim();
  return g && g.length > 0 ? g : null;
}

export async function isDraftComplete(
  sb: SupabaseClient,
  guildId: string,
  userId: string,
): Promise<boolean> {
  try {
    const gid = normalizeGuildId(guildId);
    const uid = userId?.trim();
    if (!gid || !uid) {
      return false;
    }

    const { data, error } = await sb
      .from("match_drafts")
      .select("blue_team, red_team")
      .eq("guild_id", gid)
      .eq("user_id", uid)
      .maybeSingle();

    if (error) {
      console.error("상세 에러 내용:", error);
      return false;
    }
    if (!data) return false;
    const b = data.blue_team as DraftRow[] | null;
    const r = data.red_team as DraftRow[] | null;
    return Array.isArray(b) && b.length === 5 && Array.isArray(r) && r.length === 5;
  } catch (error) {
    console.error("상세 에러 내용:", error);
    return false;
  }
}

/** match_drafts 행 — 컬럼명은 DB와 동일하게 snake_case만 사용 */
type MatchDraftRow = {
  guild_id: string;
  user_id: string;
  blue_team: DraftRow[] | null;
  red_team: DraftRow[] | null;
  updated_at: string;
};

/**
 * match_drafts 저장: update → 없으면 insert.
 */
export async function upsertTeamDraft(
  sb: SupabaseClient,
  guildId: string,
  userId: string,
  team: "blue" | "red",
  rows: DraftRow[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const gid = normalizeGuildId(guildId);
    const uid = userId?.trim();
    if (!gid) {
      return { ok: false, message: "guild_id가 비어 있어 임시 저장할 수 없습니다." };
    }
    if (!uid) {
      return { ok: false, message: "user_id가 비어 있어 임시 저장할 수 없습니다." };
    }

    const key = team === "blue" ? "blue_team" : "red_team";
    const { data: prev, error: readErr } = await sb
      .from("match_drafts")
      .select("blue_team, red_team")
      .eq("guild_id", gid)
      .eq("user_id", uid)
      .maybeSingle();

    if (readErr) {
      console.error("상세 에러 내용:", readErr);
      return { ok: false, message: `임시 저장 조회 실패: ${readErr.message}` };
    }

    const blue_team =
      key === "blue_team" ? rows : ((prev?.blue_team as DraftRow[] | null) ?? null);
    const red_team =
      key === "red_team" ? rows : ((prev?.red_team as DraftRow[] | null) ?? null);

    const updated_at = new Date().toISOString();
    const patch = { blue_team, red_team, updated_at };

    const { data: updatedRow, error: upErr } = await sb
      .from("match_drafts")
      .update(patch)
      .eq("guild_id", gid)
      .eq("user_id", uid)
      .select("guild_id")
      .maybeSingle();

    if (upErr) {
      console.error("상세 에러 내용:", upErr);
      return { ok: false, message: `임시 저장 실패: ${upErr.message}` };
    }

    if (updatedRow) {
      return { ok: true };
    }

    const insertRow: MatchDraftRow = {
      guild_id: gid,
      user_id: uid,
      blue_team,
      red_team,
      updated_at,
    };

    const { error: insErr } = await sb.from("match_drafts").insert(insertRow);

    if (insErr) {
      console.error("상세 에러 내용:", insErr);
      if (insErr.code === "23505") {
        const { error: retryErr } = await sb
          .from("match_drafts")
          .update(patch)
          .eq("guild_id", gid)
          .eq("user_id", uid);
        if (retryErr) {
          console.error("상세 에러 내용:", retryErr);
          return { ok: false, message: `임시 저장 실패: ${retryErr.message}` };
        }
        return { ok: true };
      }
      return { ok: false, message: `임시 저장 실패: ${insErr.message}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("상세 에러 내용:", error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "임시 저장 중 알 수 없는 오류",
    };
  }
}
