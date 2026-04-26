import {
  MessageFlags,
  type InteractionUpdateOptions,
  type ModalSubmitInteraction,
} from "discord.js";
import { finalizeDraftMatch } from "../actions/matches";
import { requestRankingPageRevalidate } from "../lib/revalidateRanking";
import { isDraftComplete, upsertTeamDraft } from "../actions/drafts";
import {
  buildRecordPanelDisabledRow,
  buildRecordPanelRows,
} from "../components/recordPanel";
import {
  formatDurationRecordedKr,
  formatSecondsAsClock,
} from "../lib/formatDuration";
import { parseFinalizeFields } from "./finalizeModal";
import { parseRecordModalId } from "../lib/customIds";
import { resolveGuildIdForStore } from "../lib/guild";
import { parseTeamTextBlock, teamFieldId } from "../lib/lineParser";
import type { BotContext } from "../types/context";

const EPHEMERAL = MessageFlags.Ephemeral;

/** 모달 응답: 이미 update 등으로 replied 된 경우 followUp */
async function safeReply(
  interaction: ModalSubmitInteraction,
  content: string,
) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, flags: EPHEMERAL });
    } else {
      await interaction.reply({ content, flags: EPHEMERAL });
    }
  } catch (error) {
    console.error("상세 에러 내용:", error);
  }
}

/**
 * 패널 메시지 갱신: message.edit 대신 interaction.update (Unknown Message 방지).
 * 실패 시 로그만 남기고 throw 하지 않음 — 이후 DB/응답 로직은 계속 진행.
 */
async function tryUpdatePanelFromModal(
  interaction: ModalSubmitInteraction,
  payload: InteractionUpdateOptions,
) {
  try {
    if (
      interaction.isFromMessage() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.update(payload);
      return true;
    }
  } catch (error) {
    console.error("상세 에러 내용: 패널 interaction.update 실패", error);
  }
  return false;
}

export async function handleRecordModalSubmit(
  interaction: ModalSubmitInteraction,
  ctx: BotContext,
): Promise<boolean> {
  try {
    const meta = parseRecordModalId(interaction.customId);
    if (!meta) return false;

    const storeGuildId = resolveGuildIdForStore(interaction);
    if (!storeGuildId) {
      await safeReply(
        interaction,
        "길드 ID를 확인할 수 없습니다. **서버 채널**에서 다시 시도하거나, 봇 환경 변수 **DISCORD_GUILD_ID**를 설정하세요.",
      );
      return true;
    }

    if (meta.ownerId !== interaction.user.id) {
      await safeReply(interaction, "이 패널을 연 사람만 제출할 수 있습니다.");
      return true;
    }

    const { team, ownerId } = meta;

    if (team === "blue" || team === "red") {
      try {
        const raw = interaction.fields.getTextInputValue(teamFieldId());
        const built = parseTeamTextBlock(raw);
        if (!built.ok) {
          await safeReply(interaction, built.message);
          return true;
        }
        const saved = await upsertTeamDraft(
          ctx.supabase,
          storeGuildId,
          ownerId,
          team,
          built.rows,
        );
        if (!saved.ok) {
          await safeReply(interaction, saved.message);
          return true;
        }

        const ready = await isDraftComplete(ctx.supabase, storeGuildId, ownerId);
        await tryUpdatePanelFromModal(interaction, {
          components: buildRecordPanelRows(storeGuildId, ownerId, ready),
        });

        await safeReply(
          interaction,
          `**${team === "blue" ? "블루" : "레드"}팀** 5명이 임시 저장되었습니다.`,
        );
        return true;
      } catch (error) {
        console.error("상세 에러 내용:", error);
        await safeReply(
          interaction,
          "처리 중 오류가 발생했습니다. 터미널 로그를 확인하세요.",
        );
        return true;
      }
    }

    if (team === "finalize") {
      try {
        const fin = parseFinalizeFields(
          interaction.fields.getTextInputValue("fin_winner"),
          interaction.fields.getTextInputValue("fin_duration"),
        );
        if (!fin.ok) {
          await safeReply(interaction, fin.message);
          return true;
        }

        if (!(await isDraftComplete(ctx.supabase, storeGuildId, ownerId))) {
          await safeReply(
            interaction,
            "블루·레드 5명 데이터가 모두 없습니다.",
          );
          return true;
        }

        const result = await finalizeDraftMatch(ctx.supabase, {
          guildId: storeGuildId,
          userId: ownerId,
          winner: fin.winner,
          durationSeconds: fin.durationSeconds,
        });

        if (!result.ok) {
          console.error("상세 에러 내용:", result.message);
          await safeReply(interaction, `저장 실패: ${result.message}`);
          return true;
        }

        void requestRankingPageRevalidate();

        const panelContent =
          `✅ 매치가 저장되었습니다. (\`${result.matchId}\`)\n` +
          "새 전적은 `/기록` 을 다시 실행하세요.";
        const disabled = buildRecordPanelDisabledRow(storeGuildId, ownerId);
        const panelUpdated = await tryUpdatePanelFromModal(interaction, {
          content: panelContent,
          components: [disabled],
        });

        const detail =
          `**match id**: \`${result.matchId}\` · 승: **${fin.winner === "blue" ? "블루" : "레드"}** · ${formatSecondsAsClock(fin.durationSeconds)}\n${formatDurationRecordedKr(fin.durationSeconds)}`;

        if (panelUpdated) {
          await safeReply(interaction, detail);
        } else {
          try {
            await interaction.reply({
              content: `${panelContent}\n\n${detail}`,
              flags: EPHEMERAL,
              components: [disabled],
            });
          } catch (error) {
            console.error("상세 에러 내용:", error);
          }
        }
        return true;
      } catch (error) {
        console.error("상세 에러 내용:", error);
        await safeReply(
          interaction,
          "처리 중 오류가 발생했습니다. 터미널 로그를 확인하세요.",
        );
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("상세 에러 내용:", error);
    await safeReply(
      interaction,
      "처리 중 오류가 발생했습니다. 터미널 로그를 확인하세요.",
    );
    return true;
  }
}
