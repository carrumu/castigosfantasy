-- Cleanup: drop the temporary audit helper introduced in
-- 20260821180000_debug_rls_audit_temp.sql now that its findings have been
-- read and acted on (see 20260821183000_fix_rls_isolation_gaps.sql).
DROP FUNCTION IF EXISTS public.debug_rls_audit();
