-- Capa editorial: TMDB sigue siendo el catálogo.
-- Solo se guarda lo que vos corrijas (sinopsis, póster, trailer, etc.).

create table if not exists public.movie_overrides (
  tmdb_id integer primary key,
  title_en text,
  overview_en text,
  tagline_en text,
  poster_url text,
  backdrop_url text,
  trailer_youtube_key text,
  director_name text,
  notes text,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_movie_overrides_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists movie_overrides_updated_at on public.movie_overrides;
create trigger movie_overrides_updated_at
before update on public.movie_overrides
for each row
execute function public.touch_movie_overrides_updated_at();

alter table public.movie_overrides enable row level security;

drop policy if exists "Public read movie overrides" on public.movie_overrides;
create policy "Public read movie overrides"
  on public.movie_overrides
  for select
  to anon, authenticated
  using (true);

grant select, insert, update, delete on public.movie_overrides to anon, authenticated;
grant all on public.movie_overrides to service_role;

drop policy if exists "Public insert movie overrides" on public.movie_overrides;
create policy "Public insert movie overrides"
  on public.movie_overrides
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public update movie overrides" on public.movie_overrides;
create policy "Public update movie overrides"
  on public.movie_overrides
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Public delete movie overrides" on public.movie_overrides;
create policy "Public delete movie overrides"
  on public.movie_overrides
  for delete
  to anon, authenticated
  using (true);

-- Lectura pública de afiches subidos a Storage.
insert into storage.buckets (id, name, public)
values ('movie-media', 'movie-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read movie media" on storage.objects;
create policy "Public read movie media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'movie-media');

drop policy if exists "Public upload movie media" on storage.objects;
create policy "Public upload movie media"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'movie-media');

drop policy if exists "Public update movie media" on storage.objects;
create policy "Public update movie media"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'movie-media')
  with check (bucket_id = 'movie-media');

insert into public.movie_overrides (tmdb_id, title_en, overview_en)
values (
  107586,
  'A Matter of Faith',
  'Two saint makers are ordered by a gangster to construct a Virgin and deliver it to a town in the jungle. Accompanied by their friend, a gambler, they proceed to have misadventures which test their respective faiths in God and gambling.'
)
on conflict (tmdb_id) do update
set
  title_en = excluded.title_en,
  overview_en = excluded.overview_en;
