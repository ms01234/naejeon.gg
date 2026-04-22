/**
 * match_drafts 등 저장/조회에 쓸 길드 ID.
 * 1) interaction.guildId (서버 채널에서의 값)
 * 2) 없으면 DISCORD_GUILD_ID 환경 변수 (단일 길드 봇)
 *
 * DB 컬럼은 항상 snake_case `guild_id` — 여기서는 문자열만 반환.
 */
export function resolveGuildIdForStore(interaction: {
  guildId: string | null;
}): string | null {
  try {
    const fromInteraction = interaction.guildId?.trim();
    if (fromInteraction) {
      return fromInteraction;
    }

    const rawEnv = process.env.DISCORD_GUILD_ID;
    const fromEnv = (rawEnv ?? "").trim();
    if (!fromEnv) {
      console.error(
        "상세 에러 내용:",
        "resolveGuildIdForStore: interaction.guildId 가 비어 있고 DISCORD_GUILD_ID 환경 변수도 비어 있음.",
        { rawEnvPresent: rawEnv !== undefined, rawEnvLength: rawEnv?.length ?? 0 },
      );
      return null;
    }

    console.warn(
      "[resolveGuildIdForStore] interaction.guildId 없음 → DISCORD_GUILD_ID 사용 (길이:",
      fromEnv.length,
      ")",
    );
    return fromEnv;
  } catch (error) {
    console.error("상세 에러 내용:", error);
    return null;
  }
}
