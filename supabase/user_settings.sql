-- Nodrog Logistics — per-user preferences (theme)
-- Run once in the Supabase SQL Editor. Lets each user save their own theme,
-- remembered across devices and future logins. RLS limits each user to their
-- own row, and the only column is the theme (no roles/permissions here, so
-- there's no privilege-escalation risk).

create table if not exists public.user_settings (
  id          uuid primary key references auth.users(id) on delete cascade,
  theme       text,
  updated_at  timestamptz default now()
);

alter table public.user_settings enable row level security;

create policy "own settings read"   on public.user_settings for select
  using ( id = auth.uid() );
create policy "own settings insert" on public.user_settings for insert
  with check ( id = auth.uid() );
create policy "own settings update" on public.user_settings for update
  using ( id = auth.uid() ) with check ( id = auth.uid() );
