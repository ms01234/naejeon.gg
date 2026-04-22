import { createClient } from "@supabase/supabase-js";

/** 디스코드 봇 전용 (service_role, RLS 우회). 실행 전 `import "./env"` 로 환경 로드. */
export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 가 없습니다.",
    );
  }
  return createClient(url, key);
}
