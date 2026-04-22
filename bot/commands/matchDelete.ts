import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { BotContext } from "../types/context";

export async function handleMatchDeleteCommand(
  interaction: ChatInputCommandInteraction,
  ctx: BotContext,
): Promise<void> {
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({
      content: "이 명령은 서버(길드)에서만 사용할 수 있습니다.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const raw = interaction.options.getInteger("match_id", true);
  const matchId = Math.trunc(raw);
  if (!Number.isFinite(matchId) || matchId < 1) {
    await interaction.reply({
      content: "올바른 매치 ID(양의 정수)를 입력하세요.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const { data: existing, error: selErr } = await ctx.supabase
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .eq("guild_id", guildId)
    .maybeSingle();

  if (selErr) {
    await interaction.reply({
      content: `조회에 실패했습니다: ${selErr.message}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!existing) {
    await interaction.reply({
      content: `ID **${matchId}** 매치를 찾을 수 없거나, 이 서버에 속한 전적이 아닙니다.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const { error: delErr } = await ctx.supabase
    .from("matches")
    .delete()
    .eq("id", matchId)
    .eq("guild_id", guildId);

  if (delErr) {
    await interaction.reply({
      content: `삭제에 실패했습니다: ${delErr.message}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    content:
      `매치 **#${matchId}** 를 삭제했습니다. ` +
      `(\`match_participants\` 는 DB 외래키 CASCADE 로 함께 제거됩니다.)`,
    flags: MessageFlags.Ephemeral,
  });
}
