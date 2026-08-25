-- Cleanup: drop the temporary policy-inspection helper from
-- 20260825120000_debug_weekly_challenges_temp.sql now that its findings
-- have been read (RLS on weekly_challenges was fine, ruled out as the cause).
DROP FUNCTION IF EXISTS public.debug_weekly_challenges_policies();
