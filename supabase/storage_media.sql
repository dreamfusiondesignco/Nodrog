-- Nodrog Logistics — media storage (issue/inspection photos & video)
--
-- STEP 1 (in the dashboard, not SQL): Supabase → Storage → New bucket
--   name:  media
--   Public bucket:  ON   ← required so images display across devices via public URLs
--
-- STEP 2: run this in the SQL Editor to let signed-in users upload, and anyone
-- with the (unguessable) link read. Safe to re-run.

-- uploads: any authenticated user can add files to the media bucket
drop policy if exists "auth upload media" on storage.objects;
create policy "auth upload media" on storage.objects for insert to authenticated
  with check ( bucket_id = 'media' );

-- reads: public (bucket is public; this makes the intent explicit)
drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects for select
  using ( bucket_id = 'media' );
