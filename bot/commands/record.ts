import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { isDraftComplete } from "../actions/drafts";
import { buildRecordPanelRows } from "../components/recordPanel";
import { resolveGuildIdForStore } from "../lib/guild";
import type { BotContext } from "../types/context";

export async function handleRecordCommand(
  interaction: ChatInputCommandInteraction,
  ctx: BotContext,
): Promise<void> {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: "이 명령은 서버(길드) 채널에서만 사용할 수 있습니다.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const storeGuildId = resolveGuildIdForStore(interaction);
  if (!storeGuildId) {
    await interaction.reply({
      content:
        "길드 ID를 확인할 수 없습니다. **DISCORD_GUILD_ID** 환경 변수를 설정했는지 확인하세요.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const userId = interaction.user.id;
  const ready = await isDraftComplete(ctx.supabase, storeGuildId, userId);

  await interaction.reply({
    content:
      "**내전 전적 입력**\n" +
      "1) **블루팀 입력** → 2) **레드팀 입력** → 3) **최종 저장** 순으로 진행하세요.\n\n" +
      "팀 입력 모달에는 **5줄**을 넣습니다. 각 줄 (닉/챔은 **/** 로만 구분):\n" +
      "`닉네임/챔피언 K D A 딜량` (예: `Hide on bush/제이스 7 2 5 45231`)\n\n" +
      "※ **최종 저장**은 블루·레드가 모두 채워진 뒤에만 누를 수 있습니다. 경기 시간은 **분:초**(예: `32:00`) 또는 **총 초** 60~10800(예: `1920`)로 입력합니다.",
    components: buildRecordPanelRows(storeGuildId, userId, ready),
    flags: MessageFlags.Ephemeral,
  });
}
