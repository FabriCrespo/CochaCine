-- Auth real para el editor: sesión de Supabase, no una contraseña en el front.
-- Lectura pública. Escritura solo si auth.uid() está en public.editors.

create table if not exists public.editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.editors enable row level security;

drop policy if exists "Editors read themselves" on public.editors;
create policy "Editors read themselves"
  on public.editors
  for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.editors to authenticated;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.editors where user_id = auth.uid()
  );
$$;

revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to authenticated;

-- movie_overrides: anon already could write. Close that.
drop policy if exists "Public insert movie overrides" on public.movie_overrides;
drop policy if exists "Public update movie overrides" on public.movie_overrides;
drop policy if exists "Public delete movie overrides" on public.movie_overrides;

revoke insert, update, delete on public.movie_overrides from anon;

drop policy if exists "Editors insert movie overrides" on public.movie_overrides;
create policy "Editors insert movie overrides"
  on public.movie_overrides
  for insert
  to authenticated
  with check (public.is_editor());

drop policy if exists "Editors update movie overrides" on public.movie_overrides;
create policy "Editors update movie overrides"
  on public.movie_overrides
  for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists "Editors delete movie overrides" on public.movie_overrides;
create policy "Editors delete movie overrides"
  on public.movie_overrides
  for delete
  to authenticated
  using (public.is_editor());

-- catalog_manual
drop policy if exists "Public insert catalog manual" on public.catalog_manual;
drop policy if exists "Public update catalog manual" on public.catalog_manual;
drop policy if exists "Public delete catalog manual" on public.catalog_manual;

revoke insert, update, delete on public.catalog_manual from anon;

drop policy if exists "Editors insert catalog manual" on public.catalog_manual;
create policy "Editors insert catalog manual"
  on public.catalog_manual
  for insert
  to authenticated
  with check (public.is_editor());

drop policy if exists "Editors update catalog manual" on public.catalog_manual;
create policy "Editors update catalog manual"
  on public.catalog_manual
  for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists "Editors delete catalog manual" on public.catalog_manual;
create policy "Editors delete catalog manual"
  on public.catalog_manual
  for delete
  to authenticated
  using (public.is_editor());

-- storage: posters
drop policy if exists "Public upload movie media" on storage.objects;
drop policy if exists "Public update movie media" on storage.objects;

drop policy if exists "Editors upload movie media" on storage.objects;
create policy "Editors upload movie media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'movie-media' and public.is_editor());

drop policy if exists "Editors update movie media" on storage.objects;
create policy "Editors update movie media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'movie-media' and public.is_editor())
  with check (bucket_id = 'movie-media' and public.is_editor());

-- Primer usuario autenticado ocupa el asiento. Los siguientes hay que
-- insertarlos a mano en public.editors.
create or replace function public.claim_editor()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if exists (select 1 from public.editors where user_id = auth.uid()) then
    return true;
  end if;

  if exists (select 1 from public.editors) then
    return false;
  end if;

  insert into public.editors (user_id) values (auth.uid());
  return true;
end;
$$;

revoke all on function public.claim_editor() from public;
grant execute on function public.claim_editor() to authenticated;
