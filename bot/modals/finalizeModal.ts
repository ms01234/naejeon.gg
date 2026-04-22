import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { recordModalId } from "../lib/customIds";

export function buildFinalizeModal(guildId: string, ownerId: string) {
  return new ModalBuilder()
    .setCustomId(recordModalId("finalize", guildId, ownerId))
    .setTitle("최종 저장")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("fin_winner")
          .setLabel("승리 팀 (blue 또는 red)")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("blue")
          .setRequired(true)
          .setMinLength(3)
          .setMaxLength(5),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("fin_duration")
          .setLabel("경기 시간 (초, 60~10800)")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("1920")
          .setRequired(true)
          .setMaxLength(5),
      ),
    );
}

/** 저장은 항상 초 단위 정수 */
export function parseFinalizeFields(winnerRaw: string, durationRaw: string): {
  ok: true;
  winner: "blue" | "red";
  durationSeconds: number;
} | { ok: false; message: string } {
  const w = winnerRaw.trim().toLowerCase();
  const winner =
    w === "blue" || w === "b" ? "blue" : w === "red" || w === "r" ? "red" : null;
  if (!winner) {
    return { ok: false, message: "승리 팀은 `blue` 또는 `red` 로 입력하세요." };
  }
  const durationSeconds = Number(durationRaw.trim());
  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 60 ||
    durationSeconds > 10800
  ) {
    return {
      ok: false,
      message:
        "경기 시간은 **60~10800초** 범위의 정수로 입력하세요. (예: 32분 → `1920`)",
    };
  }
  return { ok: true, winner, durationSeconds: Math.floor(durationSeconds) };
}
