-- =============================================================================
-- 일회성: match_participants.nickname '이서아' → '안녕하세용가뤼'
--
-- ※ 잘못된 예: UPDATE matches SET playerName = ...  (이 프로젝트에는 해당 컬럼 없음)
-- ※ 올바른 테이블·컬럼: public.match_participants → nickname (TEXT)
--
-- Supabase Dashboard → SQL Editor 에서 postgres 권한으로 실행.
-- 실행 전 스냅샷·백업 권장.
--
-- 다른 이름으로 바꿀 때는 작은따옴표 안 문자열만 교체하면 됩니다.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0) 실행 전 확인 (먼저만 실행해서 행 수·표본 확인)
-- ---------------------------------------------------------------------------
SELECT COUNT(*) AS rows_to_rename
FROM match_participants
WHERE nickname = '이서아';

SELECT mp.id, mp.match_id, mp.team, mp.nickname, mp.champion, m.created_at
FROM match_participants mp
JOIN matches m ON m.id = mp.match_id
WHERE mp.nickname = '이서아'
ORDER BY m.created_at DESC
LIMIT 20;

-- ---------------------------------------------------------------------------
-- 1) 변경 (점검 만족 후에만 실행)
-- ---------------------------------------------------------------------------
BEGIN;

UPDATE match_participants
SET nickname = '안녕하세용가뤼'
WHERE nickname = '이서아';

COMMIT;

-- ---------------------------------------------------------------------------
-- 2) 실행 후 확인
-- ---------------------------------------------------------------------------
SELECT COUNT(*) FROM match_participants WHERE nickname = '이서아';       -- 0 기대
SELECT COUNT(*) FROM match_participants WHERE nickname = '안녕하세용가뤼'; -- 위 0과 같은 총합 기대
