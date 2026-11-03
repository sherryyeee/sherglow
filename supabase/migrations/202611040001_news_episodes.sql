-- 每日新闻"节目"（语音版）。在 Supabase SQL Editor 中手动执行一次（2026-11）。
-- 新闻 Agent 用 service key 写入；Glow 用公开 key 只读。

-- 1. 节目表：每天一期，文字版（完整深度版）和音频地址都在这里
create table if not exists public.news_episodes (
  id bigint generated always as identity primary key,
  date date not null unique,
  headline text not null,
  article_count int not null,
  content jsonb not null,
  script text,
  audio_url text,
  duration_sec int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news_episodes enable row level security;
drop policy if exists "public read" on public.news_episodes;
create policy "public read" on public.news_episodes for select to anon, authenticated using (true);

-- 2. 音频存储桶：公开读取（任何人可播放），只有 service key 能上传
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('podcasts', 'podcasts', true, 20971520, array['audio/mpeg'])
on conflict (id) do nothing;
