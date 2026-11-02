-- Additive migration for the canonical daily AI news digest.
-- Review and apply manually in Supabase SQL Editor after approving this PR.
alter table public.news_reports
  add column if not exists article_key text,
  add column if not exists url text,
  add column if not exists source_name text,
  add column if not exists published_at timestamptz,
  add column if not exists region text,
  add column if not exists category text,
  add column if not exists industry text,
  add column if not exists company text,
  add column if not exists rank integer;

update public.news_reports
set url = content
where url is null
  and content ~* '^https://';

create unique index if not exists news_reports_article_key_uidx
  on public.news_reports (article_key)
  where article_key is not null;

create table if not exists public.daily_news_digests (
  date date primary key,
  observation text not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.daily_news_digests enable row level security;

drop policy if exists "Daily digests are readable by app users"
  on public.daily_news_digests;
create policy "Daily digests are readable by app users"
  on public.daily_news_digests
  for select
  to anon, authenticated
  using (true);

grant select on public.daily_news_digests to anon, authenticated;
