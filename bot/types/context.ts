import type { SupabaseClient } from "@supabase/supabase-js";

export type BotContext = {
  supabase: SupabaseClient;
};
