import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type Interaction,
} from "discord.js";

export function hasRecorderRole(
  interaction: Interaction,
  recorderRoleId: string | undefined,
): boolean {
  if (!recorderRoleId) return true;
  if (!interaction.inGuild() || !interaction.member) return false;
  const roles = interaction.member.roles;
  if ("cache" in roles) {
    return roles.cache.has(recorderRoleId);
  }
  if (Array.isArray(roles)) {
    return roles.includes(recorderRoleId);
  }
  return false;
}

/**
 * 전적 삭제: Discord **Administrator** 이거나, 설정된 `matchDeleteRoleId` 역할 보유.
 * 역할 ID가 비어 있으면 관리자 권한만 허용.
 */
export function canDeleteMatchRecord(
  interaction: ChatInputCommandInteraction,
  matchDeleteRoleId: string | undefined,
): boolean {
  if (!interaction.inGuild() || !interaction.member) return false;
  const perms = interaction.memberPermissions;
  if (perms?.has(PermissionFlagsBits.Administrator)) return true;
  if (matchDeleteRoleId) {
    return hasRecorderRole(interaction, matchDeleteRoleId);
  }
  return false;
}
