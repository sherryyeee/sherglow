-- 收紧数据库权限（2026-11-03）。在 Supabase SQL Editor 中手动执行，必须在日记密码锁版本上线之后。
-- 服务器（service key）和 GitHub Actions 的两个 Agent 不受 RLS 限制，照常读写。

-- 1. 私人表：开启 RLS 并删除所有已有策略 → 匿名完全不能读写
do $$
declare t text; p record;
begin
  foreach t in array array['mood_entries', 'growth_records', 'glow_daily'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
  end loop;
end $$;

-- 2. 公开内容表：开启 RLS，只允许读取，不允许匿名写入或删除
do $$
declare t text; p record;
begin
  foreach t in array array['news_reports', 'industry_reports', 'daily_highlights'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;
