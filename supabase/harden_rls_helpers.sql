-- Nodrog Logistics — RLS helper hardening
-- Applied to the live project; kept here so a fresh setup stays advisor-clean.
--
-- can_see_fleet() and is_admin() are SECURITY DEFINER helpers used inside the
-- RLS policies (see rls_policies.sql). Created in `public`, they were:
--   * flagged for a mutable search_path, and
--   * callable by anon/authenticated via PostgREST RPC (/rest/v1/rpc/...).
--
-- Moving them into a non-exposed `private` schema removes the RPC surface while
-- keeping RLS working — policies depend on the function OIDs, which are preserved
-- by ALTER FUNCTION ... SET SCHEMA, so no policy needs to change. Pinning the
-- search_path resolves the remaining linter warning. Safe to re-run.

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.can_see_fleet(text) set schema private;
alter function public.is_admin()        set schema private;

alter function private.can_see_fleet(text) set search_path = '';
alter function private.is_admin()          set search_path = '';

-- Note: the auth "leaked password protection" advisor is a dashboard setting —
-- enable it under Authentication → Policies (it checks HaveIBeenPwned).
