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
          .setLabel("경기 시간 (분:초 또는 총 초)")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("32:00 또는 1920")
          .setRequired(true)
          .setMaxLength(12),
      ),
    );
}

const MIN_DURATION_SEC = 60;
const MAX_DURATION_SEC = 10800;

/**
 * `분:초` 또는 콜론 없이 **총 초**만 숫자로 입력.
 * 잘못된 문자·형식은 throw 없이 `{ ok: false }` 로 반환.
 */
function parseDurationToSeconds(
  durationRaw: string,
):
  | { ok: true; durationSeconds: number }
  | { ok: false; message: string } {
  try {
    const trimmed = durationRaw.trim();
    if (!trimmed) {
      return { ok: false, message: "경기 시간을 입력해 주세요." };
    }

    if (trimmed.includes(":")) {
      const parts = trimmed.split(":");
      if (parts.length !== 2) {
        return {
          ok: false,
          message:
            "**분:초** 형식에서는 `:` **한 번**만 사용해 주세요. (예: `32:05`) 입력을 확인해 주세요.",
        };
      }
      const left = parts[0].trim();
      const right = parts[1].trim();
      if (!/^\d+$/.test(left)) {
        return {
          ok: false,
          message:
            "`:` 앞(분)은 **숫자만** 입력해 주세요. 예: `32:00`",
        };
      }
      if (!/^\d+$/.test(right)) {
        return {
          ok: false,
          message:
            "`:` 뒤(초)는 **숫자만** 입력해 주세요. 예: `32:00`",
        };
      }
      const minutes = Number.parseInt(left, 10);
      const seconds = Number.parseInt(right, 10);
      if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
        return {
          ok: false,
          message: "분·초를 숫자로 읽을 수 없습니다. 입력을 확인해 주세요.",
        };
      }
      const total = minutes * 60 + seconds;
      if (total < MIN_DURATION_SEC || total > MAX_DURATION_SEC) {
        return {
          ok: false,
          message: `전체 시간은 **${MIN_DURATION_SEC}~${MAX_DURATION_SEC}초**(약 3시간)이어야 합니다. (지금 합산: **${total}초**) 입력을 확인해 주세요.`,
        };
      }
      return { ok: true, durationSeconds: total };
    }

    if (!/^\d+$/.test(trimmed)) {
      return {
        ok: false,
        message:
          "콜론(`:`)이 없으면 **총 초**를 숫자만 입력합니다 (예: `1920`). `분:초`로 넣으려면 예: `32:00` — 기호·문자는 제거했는지 확인해 주세요.",
      };
    }

    const durationSeconds = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(durationSeconds)) {
      return {
        ok: false,
        message: "경기 시간을 숫자로 인식할 수 없습니다. 입력을 확인해 주세요.",
      };
    }
    if (
      durationSeconds < MIN_DURATION_SEC ||
      durationSeconds > MAX_DURATION_SEC
    ) {
      const mistakenMinHint =
        durationSeconds > 0 && durationSeconds < MIN_DURATION_SEC
          ? ` **${durationSeconds}분**을 의미했다면 \`${durationSeconds}:0\` 또는 총 초 \`${durationSeconds * 60}\` 로 입력해 주세요.`
          : "";
      return {
        ok: false,
        message: `콜론 없이 입력한 값은 **총 초**로 해석합니다. **${MIN_DURATION_SEC}~${MAX_DURATION_SEC}초** 안이어야 합니다.${mistakenMinHint}`,
      };
    }
    return { ok: true, durationSeconds };
  } catch {
    return {
      ok: false,
      message:
        "경기 시간 입력을 처리하지 못했습니다. `분:초` 또는 숫자만 있는 **총 초**로 다시 입력해 주세요.",
    };
  }
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
  const parsed = parseDurationToSeconds(durationRaw);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }
  return {
    ok: true,
    winner,
    durationSeconds: parsed.durationSeconds,
  };
}
