-- LOL 내전 5v5 + 임시 초안 (디스코드 팀별 입력)
-- matches.id = SERIAL, 경기 길이는 duration_seconds(초)만 사용
-- Supabase SQL 에디터에서 실행 (기존 DB는 백업 후 마이그레이션 필요)

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL,
  winner TEXT NOT NULL CHECK (winner IN ('blue', 'red')),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_participants (
  id BIGSERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches (id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('blue', 'red')),
  nickname TEXT NOT NULL,
  champion TEXT NOT NULL,
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  damage INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_matches_created ON matches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_guild ON matches (guild_id);
CREATE INDEX IF NOT EXISTS idx_participants_match ON match_participants (match_id);
CREATE INDEX IF NOT EXISTS idx_participants_nickname ON match_participants (nickname);

CREATE TABLE IF NOT EXISTS match_drafts (
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  blue_team JSONB,
  red_team JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (guild_id, user_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_public"
  ON matches FOR SELECT USING (true);

CREATE POLICY "match_participants_select_public"
  ON match_participants FOR SELECT USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON matches TO anon, authenticated;
GRANT SELECT ON match_participants TO anon, authenticated;

REVOKE ALL ON TABLE match_drafts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_drafts TO service_role;

-- 원자적 최종 저장: 초안 검증 후 matches + participants 일괄 삽입
CREATE OR REPLACE FUNCTION public.finalize_match_draft(
  p_guild_id text,
  p_user_id text,
  p_winner text,
  p_duration_seconds int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  d match_drafts%ROWTYPE;
  v_match_id int;
  i int;
  b jsonb;
  r jsonb;
BEGIN
  IF p_winner IS NULL OR p_winner NOT IN ('blue', 'red') THEN
    RAISE EXCEPTION 'invalid_winner';
  END IF;
  IF p_duration_seconds IS NULL OR p_duration_seconds < 60 OR p_duration_seconds > 10800 THEN
    RAISE EXCEPTION 'invalid_duration';
  END IF;

  SELECT * INTO d
  FROM match_drafts
  WHERE guild_id = p_guild_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'draft_not_found';
  END IF;

  b := d.blue_team;
  r := d.red_team;

  IF b IS NULL OR r IS NULL THEN
    RAISE EXCEPTION 'incomplete_draft';
  END IF;

  IF jsonb_array_length(b) <> 5 OR jsonb_array_length(r) <> 5 THEN
    RAISE EXCEPTION 'need_five_per_team';
  END IF;

  FOR i IN 0..4 LOOP
    IF length(trim(COALESCE(b->i->>'nickname', ''))) < 1
       OR length(trim(COALESCE(b->i->>'champion', ''))) < 1 THEN
      RAISE EXCEPTION 'empty_blue_slot';
    END IF;
    IF length(trim(COALESCE(r->i->>'nickname', ''))) < 1
       OR length(trim(COALESCE(r->i->>'champion', ''))) < 1 THEN
      RAISE EXCEPTION 'empty_red_slot';
    END IF;
  END LOOP;

  INSERT INTO matches (guild_id, winner, duration_seconds)
  VALUES (p_guild_id, p_winner, p_duration_seconds)
  RETURNING id INTO v_match_id;

  FOR i IN 0..4 LOOP
    INSERT INTO match_participants (
      match_id, team,
      nickname, champion,
      kills, deaths, assists, damage
    ) VALUES (
      v_match_id,
      'blue',
      trim(b->i->>'nickname'),
      trim(b->i->>'champion'),
      (b->i->>'kills')::int,
      (b->i->>'deaths')::int,
      (b->i->>'assists')::int,
      (b->i->>'damage')::int
    );
  END LOOP;

  FOR i IN 0..4 LOOP
    INSERT INTO match_participants (
      match_id, team,
      nickname, champion,
      kills, deaths, assists, damage
    ) VALUES (
      v_match_id,
      'red',
      trim(r->i->>'nickname'),
      trim(r->i->>'champion'),
      (r->i->>'kills')::int,
      (r->i->>'deaths')::int,
      (r->i->>'assists')::int,
      (r->i->>'damage')::int
    );
  END LOOP;

  DELETE FROM match_drafts WHERE guild_id = p_guild_id AND user_id = p_user_id;

  RETURN v_match_id;
END;
$func$;

REVOKE ALL ON FUNCTION public.finalize_match_draft(text, text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_match_draft(text, text, text, int) TO service_role;
