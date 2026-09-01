-- Manual catalog titles (IMDb/TMDB). These IDs are always included
-- even if discover/keyword would skip them.

create table if not exists public.catalog_manual (
  tmdb_id integer primary key,
  imdb_id text,
  created_at timestamptz not null default now()
);

alter table public.catalog_manual enable row level security;

drop policy if exists "Public read catalog manual" on public.catalog_manual;
create policy "Public read catalog manual"
  on public.catalog_manual
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public insert catalog manual" on public.catalog_manual;
create policy "Public insert catalog manual"
  on public.catalog_manual
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public update catalog manual" on public.catalog_manual;
create policy "Public update catalog manual"
  on public.catalog_manual
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Public delete catalog manual" on public.catalog_manual;
create policy "Public delete catalog manual"
  on public.catalog_manual
  for delete
  to anon, authenticated
  using (true);

grant select, insert, update, delete on public.catalog_manual to anon, authenticated;
grant all on public.catalog_manual to service_role;
