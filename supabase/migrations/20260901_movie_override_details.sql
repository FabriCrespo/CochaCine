-- Extra editorial fields for movie pages.
-- Empty values keep TMDB. Non-empty values win on the title page.

alter table public.movie_overrides
  add column if not exists release_date date,
  add column if not exists runtime_minutes integer,
  add column if not exists certification text,
  add column if not exists writers text,
  add column if not exists production text,
  add column if not exists countries text,
  add column if not exists languages text,
  add column if not exists genres text,
  add column if not exists highlights_en text,
  add column if not exists plot_en text;
