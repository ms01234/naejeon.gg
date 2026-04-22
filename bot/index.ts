import "./env";
import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { createServiceSupabase } from "./lib/supabaseClient";
import { handleInteraction } from "./router";

const token = (
  process.env.DISCORD_BOT_TOKEN ||
  process.env.DISCORD_TOKEN ||
  ""
).trim();
const recorderRoleId = process.env.DISCORD_RECORDER_ROLE_ID;
const matchDeleteRoleId = process.env.DISCORD_MATCH_DELETE_ROLE_ID?.trim() || undefined;

if (!token) {
  console.error("DISCORD_BOT_TOKEN 이 필요합니다.");
  process.exit(1);
}

const supabase = createServiceSupabase();
const ctx = { supabase, recorderRoleId, matchDeleteRoleId };

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`봇 로그인: ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleInteraction(interaction, ctx);
  } catch (e) {
    console.error(e);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "처리 중 오류가 발생했습니다.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(token);
