-- Housekeeping del catálogo: títulos ocultos y la vitrina "Most beloved".
-- Lectura pública. Escritura solo si public.is_editor().

create table if not exists public.catalog_hidden (
  tmdb_id integer primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_beloved (
  tmdb_id integer primary key,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.catalog_hidden enable row level security;
alter table public.catalog_beloved enable row level security;

drop policy if exists "Public read catalog hidden" on public.catalog_hidden;
create policy "Public read catalog hidden"
  on public.catalog_hidden
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Editors insert catalog hidden" on public.catalog_hidden;
create policy "Editors insert catalog hidden"
  on public.catalog_hidden
  for insert
  to authenticated
  with check (public.is_editor());

drop policy if exists "Editors delete catalog hidden" on public.catalog_hidden;
create policy "Editors delete catalog hidden"
  on public.catalog_hidden
  for delete
  to authenticated
  using (public.is_editor());

drop policy if exists "Public read catalog beloved" on public.catalog_beloved;
create policy "Public read catalog beloved"
  on public.catalog_beloved
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Editors insert catalog beloved" on public.catalog_beloved;
create policy "Editors insert catalog beloved"
  on public.catalog_beloved
  for insert
  to authenticated
  with check (public.is_editor());

drop policy if exists "Editors update catalog beloved" on public.catalog_beloved;
create policy "Editors update catalog beloved"
  on public.catalog_beloved
  for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists "Editors delete catalog beloved" on public.catalog_beloved;
create policy "Editors delete catalog beloved"
  on public.catalog_beloved
  for delete
  to authenticated
  using (public.is_editor());

grant select on public.catalog_hidden to anon, authenticated;
grant insert, delete on public.catalog_hidden to authenticated;
grant all on public.catalog_hidden to service_role;

grant select on public.catalog_beloved to anon, authenticated;
grant insert, update, delete on public.catalog_beloved to authenticated;
grant all on public.catalog_beloved to service_role;
