import { MessageFlags, type ButtonInteraction } from "discord.js";
import { isDraftComplete } from "../actions/drafts";
import { buildFinalizeModal } from "../modals/finalizeModal";
import { buildTeamModal } from "../modals/teamModal";
import { parseRecordBtnId } from "../lib/customIds";
import { resolveGuildIdForStore } from "../lib/guild";
import type { BotContext } from "../types/context";

/**
 * [블루/레드팀 입력] → 단일 Paragraph 모달 표시.
 * 제출 시 `submitRecordModal`에서 `parseTeamTextBlock`으로 5줄을 검증·파싱한 뒤 `upsertTeamDraft`로 임시 저장합니다.
 */
export async function handleRecordPanelButton(
  interaction: ButtonInteraction,
  ctx: BotContext,
): Promise<boolean> {
  const parsed = parseRecordBtnId(interaction.customId);
  if (!parsed) return false;

  const storeGuildId = resolveGuildIdForStore(interaction);
  if (!storeGuildId) {
    await interaction.reply({
      content:
        "길드 ID를 확인할 수 없습니다. **서버 채널**에서 다시 시도하거나, 봇 환경 변수 **DISCORD_GUILD_ID**를 설정하세요.",
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  if (parsed.ownerId !== interaction.user.id) {
    await interaction.reply({
      content: "이 패널을 연 사람만 버튼을 사용할 수 있습니다.",
      flags: MessageFlags.Ephemeral,
    });
    return true;
  }

  const { kind, ownerId } = parsed;

  if (kind === "blue") {
    await interaction.showModal(buildTeamModal("blue", storeGuildId, ownerId));
    return true;
  }
  if (kind === "red") {
    await interaction.showModal(buildTeamModal("red", storeGuildId, ownerId));
    return true;
  }

  if (kind === "save") {
    const ok = await isDraftComplete(ctx.supabase, storeGuildId, ownerId);
    if (!ok) {
      await interaction.reply({
        content:
          "블루·레드 각 5명이 모두 입력되어야 **최종 저장**을 열 수 있습니다. 먼저 두 팀 모달을 완료하세요.",
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }
    await interaction.showModal(buildFinalizeModal(storeGuildId, ownerId));
    return true;
  }

  return false;
}
