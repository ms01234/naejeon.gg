require("./load-env");

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const token = (
  process.env.DISCORD_BOT_TOKEN ||
  process.env.DISCORD_TOKEN ||
  ""
).trim();
const appId = (
  process.env.DISCORD_APPLICATION_ID ||
  process.env.DISCORD_CLIENT_ID ||
  ""
).trim();
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !appId) {
  console.error(
    "필수: DISCORD_BOT_TOKEN 과 DISCORD_APPLICATION_ID (또는 DISCORD_CLIENT_ID) 를 .env.local 에 설정하세요.",
  );
  process.exit(1);
}

const record = new SlashCommandBuilder()
  .setName("record")
  .setNameLocalization("ko", "기록")
  .setDescription("Open post-game record panel (buttons + modals)")
  .setDescriptionLocalization(
    "ko",
    "버튼으로 블루·레드·결과 저장을 입력합니다 (모달).",
  );

const matchDelete = new SlashCommandBuilder()
  .setName("match_delete")
  .setNameLocalization("ko", "전적삭제")
  .setDescription("Delete a completed match by matches.id (participants CASCADE)")
  .setDescriptionLocalization(
    "ko",
    "매치 ID로 전적을 삭제합니다. 참가자 행은 DB CASCADE로 함께 삭제됩니다.",
  )
  .addIntegerOption((opt) =>
    opt
      .setName("match_id")
      .setNameLocalization("ko", "매치id")
      .setDescription("matches.id to delete")
      .setDescriptionLocalization("ko", "삭제할 경기의 매치 ID (matches.id)")
      .setRequired(true)
      .setMinValue(1),
  );

const rest = new REST({ version: "10" }).setToken(token);

async function main() {
  const body = [record.toJSON(), matchDelete.toJSON()];
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(appId, guildId), {
      body,
    });
    console.log(
      `✓ 길드 ${guildId} 에 /기록(record), /전적삭제(match_delete) 명령을 등록했습니다.`,
    );
  } else {
    await rest.put(Routes.applicationCommands(appId), { body });
    console.log("✓ 전역으로 /기록(record), /전적삭제(match_delete) 명령을 등록했습니다.");
  }
  console.log("  /기록: [블루팀 입력] [레드팀 입력] [최종 저장] 패널");
  console.log("  /전적삭제: match_id — 관리자 또는 DISCORD_MATCH_DELETE_ROLE_ID");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
