import { MessageFlags, type Interaction } from "discord.js";
import { handleRecordPanelButton } from "./buttons/recordPanel";
import { handleMatchDeleteCommand } from "./commands/matchDelete";
import { handleRecordCommand } from "./commands/record";
import { canDeleteMatchRecord, hasRecorderRole } from "./lib/permissions";
import { handleRecordModalSubmit } from "./modals/submitRecordModal";
import type { BotContext } from "./types/context";

export async function handleInteraction(
  interaction: Interaction,
  ctx: BotContext,
): Promise<void> {
  if (interaction.isChatInputCommand() && interaction.commandName === "record") {
    if (!hasRecorderRole(interaction, ctx.recorderRoleId)) {
      await interaction.reply({
        content: "전적 기록 권한이 있는 역할만 사용할 수 있습니다.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await handleRecordCommand(interaction, ctx);
    return;
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "match_delete") {
    if (!canDeleteMatchRecord(interaction, ctx.matchDeleteRoleId)) {
      await interaction.reply({
        content:
          "전적 삭제는 **서버 관리자(Administrator)** 또는 설정된 삭제 전용 역할만 사용할 수 있습니다.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await handleMatchDeleteCommand(interaction, ctx);
    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith("rec:btn:")) {
    if (!hasRecorderRole(interaction, ctx.recorderRoleId)) {
      await interaction.reply({
        content: "전적 기록 권한이 있는 역할만 사용할 수 있습니다.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const handled = await handleRecordPanelButton(interaction, ctx);
    if (handled) return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith("rec:mdl:")) {
    if (!hasRecorderRole(interaction, ctx.recorderRoleId)) {
      await interaction.reply({
        content: "전적 기록 권한이 있는 역할만 사용할 수 있습니다.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const handled = await handleRecordModalSubmit(interaction, ctx);
    if (handled) return;
  }
}
