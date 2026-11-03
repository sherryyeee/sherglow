import { readFileSync } from "fs";
import { supabase } from "@/lib/supabase";

// 每日新闻"节目"：news_episodes 有音频和完整深度版；更早的日子只有 news_reports，按天拼成仅文字的一期。
export type EpisodeSource = { name: string; url: string; published_date?: string };
export type EpisodeArticle = {
  title: string;
  region?: string | null;
  category?: string | null;
  industry?: string | null;
  what_happened?: string;
  key_facts?: string[];
  insights?: string[];
  summary?: string; // 旧数据只有摘要
  sources: EpisodeSource[];
};
export type EpisodeSummary = {
  date: string;
  headline: string;
  articleCount: number;
  audioUrl: string | null;
  durationSec: number | null;
};
export type Episode = EpisodeSummary & { articles: EpisodeArticle[]; observation: string | null };

type EpisodeRow = {
  date: string;
  headline: string;
  article_count: number;
  audio_url: string | null;
  duration_sec: number | null;
  content?: { articles: EpisodeArticle[]; observation: string | null };
};
type ReportRow = {
  date: string;
  title: string;
  summary: string | null;
  url: string | null;
  source_name: string | null;
  published_at: string | null;
  region: string | null;
  category: string | null;
  industry: string | null;
  rank: number | null;
};

// 本地预览用：EPISODE_FIXTURE 指向一份 news_episodes 格式的 JSON（生产环境忽略）
function fixtureRow(): EpisodeRow | null {
  const path = process.env.NODE_ENV !== "production" ? process.env.EPISODE_FIXTURE : undefined;
  if (!path) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as EpisodeRow;
}

function toSummary(row: EpisodeRow): EpisodeSummary {
  return {
    date: row.date, headline: row.headline, articleCount: row.article_count,
    audioUrl: row.audio_url, durationSec: row.duration_sec,
  };
}

export async function listEpisodes(limit = 30): Promise<EpisodeSummary[]> {
  const [episodesRes, reportsRes] = await Promise.all([
    supabase.from("news_episodes").select("date,headline,article_count,audio_url,duration_sec")
      .order("date", { ascending: false }).limit(limit),
    supabase.from("news_reports").select("date,title,rank")
      .order("date", { ascending: false }).order("rank", { ascending: true }).limit(limit * 8),
  ]);
  const byDate = new Map<string, EpisodeSummary>();
  const fixture = fixtureRow();
  for (const row of [...(fixture ? [fixture] : []), ...((episodesRes.data ?? []) as EpisodeRow[])]) {
    if (!byDate.has(row.date)) byDate.set(row.date, toSummary(row));
  }
  const reportsByDate = new Map<string, string[]>();
  for (const row of (reportsRes.data ?? []) as { date: string; title: string }[]) {
    reportsByDate.set(row.date, [...(reportsByDate.get(row.date) ?? []), row.title]);
  }
  for (const [date, titles] of reportsByDate) {
    if (!byDate.has(date)) {
      byDate.set(date, { date, headline: titles[0], articleCount: titles.length, audioUrl: null, durationSec: null });
    }
  }
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export async function getEpisode(date: string): Promise<Episode | null> {
  const fixture = fixtureRow();
  if (fixture?.date === date && fixture.content) {
    return { ...toSummary(fixture), ...fixture.content };
  }
  const { data } = await supabase.from("news_episodes")
    .select("date,headline,article_count,audio_url,duration_sec,content").eq("date", date).limit(1);
  const row = data?.[0] as EpisodeRow | undefined;
  if (row?.content) return { ...toSummary(row), ...row.content };

  const { data: reports } = await supabase.from("news_reports")
    .select("date,title,summary,url,source_name,published_at,region,category,industry,rank")
    .eq("date", date).order("rank", { ascending: true });
  const rows = (reports ?? []) as ReportRow[];
  if (!rows.length) return null;
  return {
    date, headline: rows[0].title, articleCount: rows.length, audioUrl: null, durationSec: null, observation: null,
    articles: rows.map((r) => ({
      title: r.title, region: r.region, category: r.category, industry: r.industry, summary: r.summary ?? undefined,
      sources: r.url ? [{ name: r.source_name ?? "原文", url: r.url, published_date: r.published_at?.slice(0, 10) }] : [],
    })),
  };
}
