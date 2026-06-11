-- ============================================================================
-- Nodrog Logistics — Row-Level Security (RLS) policies
-- Run AFTER schema.sql.
--
-- Goal: a user only ever sees fleets they're allowed to see.
--   * Admins & lead mechanics → all_fleets = true  → see everything
--   * Fleet mechanics          → fleet_ids = '{IGL}' (or '{MASSY}') → that fleet only
--   * SHARED parts are visible to everyone
-- The database enforces this — a Massy-only login physically cannot read IGL rows.
-- ============================================================================

-- ---------- helper: does the current user have access to a fleet? -----------
create or replace function public.can_see_fleet(target_fleet text)
returns boolean
language sql
security definer
stable
as $$
  select
    target_fleet = 'SHARED'
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and ( p.all_fleets = true or target_fleet = any(p.fleet_ids) )
    );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true);
$$;

-- ---------- enable RLS on every table ---------------------------------------
alter table public.fleets       enable row level security;
alter table public.profiles     enable row level security;
alter table public.trucks       enable row level security;
alter table public.parts        enable row level security;
alter table public.part_usage   enable row level security;
alter table public.issues       enable row level security;
alter table public.inspections  enable row level security;
alter table public.service_history enable row level security;
alter table public.invoices     enable row level security;

-- ---------- PROFILES --------------------------------------------------------
-- A user can read their own profile; admins can read all.
create policy "read own profile"  on public.profiles for select
  using ( id = auth.uid() or public.is_admin() );
create policy "admin manage profiles" on public.profiles for all
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ---------- FLEETS ----------------------------------------------------------
-- Everyone signed in can read the fleet list; only admins create/edit.
create policy "read fleets" on public.fleets for select
  using ( auth.role() = 'authenticated' );
create policy "admin write fleets" on public.fleets for all
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ---------- TRUCKS ----------------------------------------------------------
create policy "read trucks in my fleets" on public.trucks for select
  using ( public.can_see_fleet(fleet) );
create policy "write trucks in my fleets" on public.trucks for all
  using ( public.can_see_fleet(fleet) ) with check ( public.can_see_fleet(fleet) );

-- ---------- PARTS (SHARED visible to all) -----------------------------------
create policy "read parts in my fleets" on public.parts for select
  using ( public.can_see_fleet(fleet) );
create policy "write parts in my fleets" on public.parts for all
  using ( public.can_see_fleet(fleet) ) with check ( public.can_see_fleet(fleet) );

-- ---------- PART USAGE (scoped via the truck's fleet) -----------------------
create policy "read usage in my fleets" on public.part_usage for select
  using ( exists (select 1 from public.trucks t where t.id = truck_id and public.can_see_fleet(t.fleet)) );
create policy "write usage in my fleets" on public.part_usage for all
  using ( exists (select 1 from public.trucks t where t.id = truck_id and public.can_see_fleet(t.fleet)) )
  with check ( exists (select 1 from public.trucks t where t.id = truck_id and public.can_see_fleet(t.fleet)) );

-- ---------- ISSUES ----------------------------------------------------------
create policy "read issues in my fleets" on public.issues for select
  using ( public.can_see_fleet(fleet) );
create policy "write issues in my fleets" on public.issues for all
  using ( public.can_see_fleet(fleet) ) with check ( public.can_see_fleet(fleet) );

-- ---------- INSPECTIONS -----------------------------------------------------
create policy "read inspections in my fleets" on public.inspections for select
  using ( public.can_see_fleet(fleet) );
create policy "write inspections in my fleets" on public.inspections for all
  using ( public.can_see_fleet(fleet) ) with check ( public.can_see_fleet(fleet) );

-- ---------- SERVICE HISTORY (scoped via the truck's fleet) ------------------
create policy "read service history in my fleets" on public.service_history for select
  using ( exists (select 1 from public.trucks t where t.id = truck_id and public.can_see_fleet(t.fleet)) );
create policy "write service history in my fleets" on public.service_history for all
  using ( exists (select 1 from public.trucks t where t.id = truck_id and public.can_see_fleet(t.fleet)) )
  with check ( exists (select 1 from public.trucks t where t.id = truck_id and public.can_see_fleet(t.fleet)) );

-- ---------- INVOICES (admin-managed, fleet-scoped for reads) ----------------
create policy "read invoices in my fleets" on public.invoices for select
  using ( public.can_see_fleet(fleet) );
create policy "admin write invoices" on public.invoices for all
  using ( public.is_admin() ) with check ( public.is_admin() );

-- ============================================================================
-- STORAGE (photos & videos)
-- In Supabase → Storage, create a bucket called 'media' (private).
-- Then add policies so authenticated users can upload/read. Example:
--
--   create policy "auth read media"  on storage.objects for select
--     using ( bucket_id = 'media' and auth.role() = 'authenticated' );
--   create policy "auth write media" on storage.objects for insert
--     with check ( bucket_id = 'media' and auth.role() = 'authenticated' );
--
-- Store the returned object path on the issue/inspection/truck row.
-- ============================================================================
