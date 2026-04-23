-- =============================================================================
-- 일회성: 닉네임 '진짜'(공백 없음) → '진 짜'(공백 포함) 병합
-- Supabase SQL Editor 등에서 postgres 권한으로 실행.
-- 실행 전 백업 권장: match_participants 해당 행만 export 또는 DB 스냅샷.
--
-- 참고: match_participants.id 는 행마다 고유 PK 입니다. "진 짜 행의 id 로
--       바꾼다"는 요구는, 실제로는 nickname 문자열을 표준으로 통일하는
--       것과 동일한 효과입니다. FK 로 다른 테이블을 가리키지 않습니다.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0) 사전 점검 (주석 해제 후 실행)
-- ---------------------------------------------------------------------------
-- SELECT nickname, COUNT(*) FROM match_participants
-- WHERE nickname IN ('진짜', '진 짜') GROUP BY nickname;

-- 같은 경기·같은 팀에 두 닉네임이 동시에 있으면(한 판에 중복 기록) 아래
-- DELETE 단계에서 '진짜' 행만 제거하고 '진 짜' 행을 유지합니다.
-- SELECT mp.match_id, mp.team,
--        COUNT(*) FILTER (WHERE mp.nickname = '진짜') AS n_wrong,
--        COUNT(*) FILTER (WHERE mp.nickname = '진 짜') AS n_canon
-- FROM match_participants mp
-- WHERE mp.nickname IN ('진짜', '진 짜')
-- GROUP BY mp.match_id, mp.team
-- HAVING COUNT(*) FILTER (WHERE mp.nickname = '진짜') > 0
--    AND COUNT(*) FILTER (WHERE mp.nickname = '진 짜') > 0;

-- ---------------------------------------------------------------------------
-- 1) 일회성 본 작업 (한 번만 실행)
-- ---------------------------------------------------------------------------

BEGIN;

DELETE FROM match_participants AS wrong
USING match_participants AS canon
WHERE wrong.nickname = '진짜'
  AND canon.nickname = '진 짜'
  AND canon.match_id = wrong.match_id
  AND canon.team = wrong.team;

UPDATE match_participants
SET nickname = '진 짜'
WHERE nickname = '진짜';

COMMIT;

-- ---------------------------------------------------------------------------
-- 2) 사후 확인 (주석 해제 후 실행)
-- ---------------------------------------------------------------------------
-- SELECT COUNT(*) FROM match_participants WHERE nickname = '진짜';  -- 0 기대
-- SELECT COUNT(*) FROM match_participants WHERE nickname = '진 짜';

-- =============================================================================
-- 3) 선택: 범용 관리자 함수 (재사용·다른 오타에도 사용 가능)
--    제거: DROP FUNCTION public.admin_merge_participant_nicknames(text, text);
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_merge_participant_nicknames(
  p_wrong_nickname text,
  p_canonical_nickname text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_deleted bigint;
  v_updated bigint;
BEGIN
  IF p_wrong_nickname IS NULL OR btrim(p_wrong_nickname) = '' THEN
    RAISE EXCEPTION 'p_wrong_nickname required';
  END IF;
  IF p_canonical_nickname IS NULL OR btrim(p_canonical_nickname) = '' THEN
    RAISE EXCEPTION 'p_canonical_nickname required';
  END IF;
  IF p_wrong_nickname = p_canonical_nickname THEN
    RAISE EXCEPTION 'nicknames must differ';
  END IF;

  DELETE FROM match_participants AS wrong
  USING match_participants AS canon
  WHERE wrong.nickname = p_wrong_nickname
    AND canon.nickname = p_canonical_nickname
    AND canon.match_id = wrong.match_id
    AND canon.team = wrong.team;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  UPDATE match_participants
  SET nickname = p_canonical_nickname
  WHERE nickname = p_wrong_nickname;
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'deleted_duplicate_wrong_rows', v_deleted,
    'updated_rows', v_updated
  );
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_merge_participant_nicknames(text, text) FROM PUBLIC;
-- Supabase 에서 Edge Function 등으로 호출하려면:
-- GRANT EXECUTE ON FUNCTION public.admin_merge_participant_nicknames(text, text) TO service_role;

-- 동일 작업을 함수로만 수행할 때 (위 BEGIN~COMMIT 을 실행하지 않은 경우):
-- SELECT public.admin_merge_participant_nicknames('진짜', '진 짜');
