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

-- A normal UNIQUE index allows multiple legacy NULL values and supports
-- PostgREST upsert(on_conflict=article_key).
create unique index if not exists news_reports_article_key_uidx
  on public.news_reports (article_key);
