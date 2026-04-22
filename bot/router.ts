import { type Interaction } from "discord.js";
import { handleRecordPanelButton } from "./buttons/recordPanel";
import { handleMatchDeleteCommand } from "./commands/matchDelete";
import { handleRecordCommand } from "./commands/record";
import { assertGuildAdminOrReply } from "./lib/permissions";
import { handleRecordModalSubmit } from "./modals/submitRecordModal";
import type { BotContext } from "./types/context";

export async function handleInteraction(
  interaction: Interaction,
  ctx: BotContext,
): Promise<void> {
  if (interaction.isChatInputCommand() && interaction.commandName === "record") {
    if (!(await assertGuildAdminOrReply(interaction))) return;
    await handleRecordCommand(interaction, ctx);
    return;
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "match_delete") {
    if (!(await assertGuildAdminOrReply(interaction))) return;
    await handleMatchDeleteCommand(interaction, ctx);
    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith("rec:btn:")) {
    if (!(await assertGuildAdminOrReply(interaction))) return;
    const handled = await handleRecordPanelButton(interaction, ctx);
    if (handled) return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith("rec:mdl:")) {
    if (!(await assertGuildAdminOrReply(interaction))) return;
    const handled = await handleRecordModalSubmit(interaction, ctx);
    if (handled) return;
  }
}
