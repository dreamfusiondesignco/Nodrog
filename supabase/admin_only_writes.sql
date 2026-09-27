-- ============================================================================
-- Nodrog Logistics — admin-only writes
-- Run AFTER rls_policies.sql (and harden_rls_helpers.sql). Safe to re-run.
--
-- Only the main users (Orlando & Rolando — profiles.is_admin = true) may add,
-- edit or delete trucks, issues, weekly checks, service history, parts and
-- part usage, or upload media. Everyone else keeps read access to their
-- fleets but is read-only. Fleets, invoices and profiles were already
-- admin-only. To give someone edit rights later, set is_admin = true on
-- their profile.
-- ============================================================================

-- ---------- TRUCKS ----------------------------------------------------------
drop policy if exists "write trucks in my fleets" on public.trucks;
drop policy if exists "admin write trucks" on public.trucks;
create policy "admin write trucks" on public.trucks for all
  using ( private.is_admin() and private.can_see_fleet(fleet) )
  with check ( private.is_admin() and private.can_see_fleet(fleet) );

-- ---------- PARTS -----------------------------------------------------------
drop policy if exists "write parts in my fleets" on public.parts;
drop policy if exists "admin write parts" on public.parts;
create policy "admin write parts" on public.parts for all
  using ( private.is_admin() and private.can_see_fleet(fleet) )
  with check ( private.is_admin() and private.can_see_fleet(fleet) );

-- ---------- PART USAGE ------------------------------------------------------
drop policy if exists "write usage in my fleets" on public.part_usage;
drop policy if exists "admin write usage" on public.part_usage;
create policy "admin write usage" on public.part_usage for all
  using ( private.is_admin() and exists (select 1 from public.trucks t where t.id = truck_id and private.can_see_fleet(t.fleet)) )
  with check ( private.is_admin() and exists (select 1 from public.trucks t where t.id = truck_id and private.can_see_fleet(t.fleet)) );

-- ---------- ISSUES ----------------------------------------------------------
drop policy if exists "write issues in my fleets" on public.issues;
drop policy if exists "admin write issues" on public.issues;
create policy "admin write issues" on public.issues for all
  using ( private.is_admin() and private.can_see_fleet(fleet) )
  with check ( private.is_admin() and private.can_see_fleet(fleet) );

-- ---------- INSPECTIONS (weekly checks) -------------------------------------
drop policy if exists "write inspections in my fleets" on public.inspections;
drop policy if exists "admin write inspections" on public.inspections;
create policy "admin write inspections" on public.inspections for all
  using ( private.is_admin() and private.can_see_fleet(fleet) )
  with check ( private.is_admin() and private.can_see_fleet(fleet) );

-- ---------- SERVICE HISTORY -------------------------------------------------
drop policy if exists "write service history in my fleets" on public.service_history;
drop policy if exists "admin write service history" on public.service_history;
create policy "admin write service history" on public.service_history for all
  using ( private.is_admin() and exists (select 1 from public.trucks t where t.id = truck_id and private.can_see_fleet(t.fleet)) )
  with check ( private.is_admin() and exists (select 1 from public.trucks t where t.id = truck_id and private.can_see_fleet(t.fleet)) );

-- ---------- STORAGE (photos & videos) ---------------------------------------
-- Only admins upload or delete media; everyone can view via the public URL.
drop policy if exists "auth upload media" on storage.objects;
drop policy if exists "admin upload media" on storage.objects;
create policy "admin upload media" on storage.objects for insert to authenticated
  with check ( bucket_id = 'media' and private.is_admin() );
drop policy if exists "admin delete media" on storage.objects;
create policy "admin delete media" on storage.objects for delete to authenticated
  using ( bucket_id = 'media' and private.is_admin() );
