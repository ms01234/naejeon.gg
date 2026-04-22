import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { recordBtnId } from "../lib/customIds";

export function buildRecordPanelRows(
  guildId: string,
  ownerId: string,
  readyToSave: boolean,
) {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(recordBtnId("blue", guildId, ownerId))
        .setLabel("블루팀 입력")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(recordBtnId("red", guildId, ownerId))
        .setLabel("레드팀 입력")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(recordBtnId("save", guildId, ownerId))
        .setLabel("최종 저장")
        .setStyle(ButtonStyle.Success)
        .setDisabled(!readyToSave),
    ),
  ];
}

export function buildRecordPanelDisabledRow(guildId: string, ownerId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(recordBtnId("blue", guildId, ownerId))
      .setLabel("블루팀 입력")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(recordBtnId("red", guildId, ownerId))
      .setLabel("레드팀 입력")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(recordBtnId("save", guildId, ownerId))
      .setLabel("최종 저장")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
  );
}
