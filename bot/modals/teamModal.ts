import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { recordModalId } from "../lib/customIds";
import { teamFieldId } from "../lib/lineParser";

export function buildTeamModal(
  side: "blue" | "red",
  guildId: string,
  ownerId: string,
) {
  const title = side === "blue" ? "블루팀 5명 입력" : "레드팀 5명 입력";
  const example =
    "닉네임과 챔피언은 / 로만 구분, 나머지는 공백\n" +
    "광운대 민석/리신 10 2 5 25000\n" +
    "소환사2/가렌 3 4 9 18000\n" +
    "… (총 5줄)";

  return new ModalBuilder()
    .setCustomId(recordModalId(side, guildId, ownerId))
    .setTitle(title)
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(teamFieldId())
          .setLabel("5줄 · 닉네임/챔피언 K D A 딜량 (닉/챔만 /, 나머지 공백)")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder(example)
          .setRequired(true)
          .setMinLength(15)
          .setMaxLength(4000),
      ),
    );
}
