-- match_drafts upsert / finalize 가 (guild_id, user_id) 기준으로 동작하려면
-- 이 두 컬럼에 대한 PRIMARY KEY 또는 UNIQUE 가 있어야 합니다.
-- 아래는 기존 테이블에 잘못된 PK만 있거나 UNIQUE 가 없을 때 보정용입니다.
-- Supabase SQL Editor 에서 한 번 실행하세요.

-- 서로 다른 이름의 PK 가 있다면 필요 시 수동으로 DROP 후 실행하세요.

ALTER TABLE public.match_drafts
  DROP CONSTRAINT IF EXISTS match_drafts_pkey;

ALTER TABLE public.match_drafts
  ADD CONSTRAINT match_drafts_pkey PRIMARY KEY (guild_id, user_id);
