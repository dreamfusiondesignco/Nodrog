-- ============================================================================
-- Nodrog Logistics — Fleet Maintenance
-- Supabase / PostgreSQL schema
-- Run this in the Supabase SQL editor (Project → SQL → New query).
-- Then run rls_policies.sql.
-- ============================================================================

-- ---------- FLEETS ----------------------------------------------------------
create table public.fleets (
  id          text primary key,            -- short code, e.g. 'IGL', 'MASSY'
  name        text not null,               -- short display name
  full_name   text not null,               -- full legal name
  created_at  timestamptz default now()
);

-- ---------- PROFILES (one row per user, linked to Supabase Auth) ------------
-- Supabase Auth stores credentials in auth.users. This table holds the app
-- role + which fleets each user may see.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null default 'Mechanic',     -- 'Mechanic' | 'Lead Mechanic' | 'Fleet Admin'
  is_admin    boolean not null default false,
  all_fleets  boolean not null default false,       -- true = sees every fleet (admins & lead mechanics)
  fleet_ids   text[] not null default '{}',         -- explicit fleets for non-all_fleets users
  created_at  timestamptz default now()
);

-- ---------- TRUCKS ----------------------------------------------------------
create table public.trucks (
  id            uuid primary key default gen_random_uuid(),
  fleet         text not null references public.fleets(id),
  plate         text not null,
  model         text,
  segment       text,
  chassis       text,
  capacity      text,
  driver        text,
  location      text,
  status        text not null default 'ok',         -- 'ok' | 'due' | 'overdue' | 'oos'
  odometer      numeric default 0,
  idle_hrs      numeric default 0,
  last_check    date,
  photo_url     text,                                -- Supabase Storage path
  -- service tracking (mirrors the prototype's nested service object)
  service       jsonb default '{}'::jsonb,           -- { engine:{lastMiles,lastIdleHrs,date,nextDueMiles,nextDueHrs}, transmission:{...}, airFilter:{...}, frontDiff:{...}, rearDiff:{...} }
  -- document expiries
  fire_ext_date     date,
  insurance_exp     date,
  fitness_exp       date,
  mv_reg_exp        date,
  carrier_lic_exp   date,
  created_at    timestamptz default now()
);
create index on public.trucks (fleet);

-- ---------- PARTS (inventory) -----------------------------------------------
create table public.parts (
  id          uuid primary key default gen_random_uuid(),
  fleet       text not null default 'SHARED',        -- 'SHARED' or a fleet id
  name        text not null,
  sku         text,
  qty         integer not null default 0,
  min_level   integer not null default 0,
  location    text,
  created_at  timestamptz default now()
);
create index on public.parts (fleet);

-- ---------- PART USAGE (parts fitted to a truck) ----------------------------
create table public.part_usage (
  id          uuid primary key default gen_random_uuid(),
  part_id     uuid references public.parts(id) on delete set null,
  truck_id    uuid references public.trucks(id) on delete cascade,
  qty         integer not null default 1,
  note        text,
  used_on     date default now(),
  by_user     uuid references public.profiles(id),
  by_name     text,
  created_at  timestamptz default now()
);

-- ---------- ISSUES ----------------------------------------------------------
create table public.issues (
  id            uuid primary key default gen_random_uuid(),
  fleet         text not null references public.fleets(id),
  truck_id      uuid references public.trucks(id) on delete cascade,
  title         text not null,
  detail        text,
  severity      text default 'medium',               -- 'low' | 'medium' | 'high' | 'critical'
  status        text default 'open',                 -- 'open' | 'resolved'
  serious       boolean default false,
  oos           boolean default false,               -- took truck out of service
  parts_needed  text,
  media         jsonb default '[]'::jsonb,           -- array of Storage paths (photos AND videos)
  date          date default now(),
  by_user       uuid references public.profiles(id),
  by_name       text,
  created_at    timestamptz default now()
);
create index on public.issues (truck_id);
create index on public.issues (fleet);

-- ---------- INSPECTIONS (saved weekly reports) ------------------------------
create table public.inspections (
  id          uuid primary key default gen_random_uuid(),
  truck_id    uuid references public.trucks(id) on delete cascade,
  fleet       text not null references public.fleets(id),
  date        date default now(),
  attn        integer default 0,                     -- count of "needs attention" items
  missing     text,
  general     text,
  results     jsonb default '{}'::jsonb,             -- { "<line key>": "ok" | "attn" }
  notes       jsonb default '{}'::jsonb,             -- { "<line key>": "free-text note" }
  media       jsonb default '[]'::jsonb,
  by_user     uuid references public.profiles(id),
  by_name     text,
  created_at  timestamptz default now()
);
create index on public.inspections (truck_id);
create index on public.inspections (fleet);

-- ---------- SERVICE HISTORY (completed work log per truck) -------------------
create table public.service_history (
  id          uuid primary key default gen_random_uuid(),
  truck_id    uuid references public.trucks(id) on delete cascade,
  date        date default now(),
  type        text not null,                        -- e.g. 'Engine service + air filter'
  miles       numeric,                              -- odometer at time of service
  notes       text,
  by_user     uuid references public.profiles(id),
  by_name     text,
  created_at  timestamptz default now()
);
create index on public.service_history (truck_id);

-- ---------- INVOICES --------------------------------------------------------
create table public.invoices (
  id          uuid primary key default gen_random_uuid(),
  number      text not null,
  fleet       text not null references public.fleets(id),
  truck_id    uuid references public.trucks(id) on delete set null,
  party       text,                                  -- vendor or customer
  kind        text default 'Payable',                -- 'Payable' | 'Receivable'
  date        date default now(),
  due_date    date,
  status      text default 'draft',                  -- 'draft' | 'sent' | 'paid'
  items       jsonb default '[]'::jsonb,             -- [{ desc, qty, unit }]
  notes       text,
  created_at  timestamptz default now()
);
create index on public.invoices (fleet);

-- ---------- updated_at convenience (optional) -------------------------------
-- Add triggers if you want automatic updated_at columns.

-- ============================================================================
-- SEED DATA (optional) — two fleets to start. Import your real data after.
-- ============================================================================
insert into public.fleets (id, name, full_name) values
  ('IGL',   'IGL',   'Industrial Gases Ltd'),
  ('MASSY', 'Massy', 'Massy Distribution')
on conflict (id) do nothing;

-- After creating users in Auth, insert matching profiles, e.g.:
-- insert into public.profiles (id, name, role, is_admin, all_fleets, fleet_ids)
-- values ('<auth-user-uuid>', 'Andre Gordon', 'Fleet Admin', true, true, '{}');
-- insert into public.profiles (id, name, role, is_admin, all_fleets, fleet_ids)
-- values ('<auth-user-uuid>', 'Kemar Brown', 'Mechanic', false, false, '{MASSY}');
