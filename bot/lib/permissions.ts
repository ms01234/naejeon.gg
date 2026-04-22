import {
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  type Interaction,
  type PermissionResolvable,
} from "discord.js";

/** 서버에서 '관리자' 역할로 쓰는 역할 이름 (역할 이름 정확 일치) */
const ADMIN_ROLE_NAME = "관리자";

export const GUILD_ADMIN_ONLY_MESSAGE =
  "❌ 이 명령어는 '관리자' 역할이 있는 사용자만 사용할 수 있습니다.";

/**
 * Discord **Administrator** 권한이 있거나, 서버 역할 이름이 정확히 `관리자`인 역할을 하나라도 가진 경우.
 * (APIInteractionGuildMember / GuildMember 모두 처리)
 */
export function hasGuildAdminAccess(interaction: Interaction): boolean {
  if (!interaction.inGuild() || !interaction.guild || !interaction.member) {
    return false;
  }
  const guild = interaction.guild;
  const mem = interaction.member;

  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  try {
    const p = new PermissionsBitField(mem.permissions as PermissionResolvable);
    if (p.has(PermissionFlagsBits.Administrator)) return true;
  } catch {
    // ignore
  }

  if ("cache" in mem.roles) {
    return mem.roles.cache.some((r) => r.name === ADMIN_ROLE_NAME);
  }

  const ids = mem.roles as readonly string[];
  if (!Array.isArray(ids)) return false;
  for (const id of ids) {
    const role = guild.roles.cache.get(id);
    if (role?.name === ADMIN_ROLE_NAME) return true;
  }
  return false;
}

/**
 * 권한이 없으면 ephemeral 로 거절 메시지를 보내고 `false`, 있으면 `true`.
 */
export async function assertGuildAdminOrReply(
  interaction: Interaction,
): Promise<boolean> {
  if (hasGuildAdminAccess(interaction)) return true;

  if (
    interaction.isRepliable() &&
    !interaction.replied &&
    !interaction.deferred
  ) {
    await interaction.reply({
      content: GUILD_ADMIN_ONLY_MESSAGE,
      flags: MessageFlags.Ephemeral,
    });
  }
  return false;
}
