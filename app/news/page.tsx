export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { beijingDate, beijingMonthDay } from "@/lib/date";
import { listEpisodes, type EpisodeSummary } from "@/lib/episodes";
import { dateLabel, formatMinutes } from "@/lib/episode-format";
import PlayButton from "@/components/player/PlayButton";
import { ChevronRight } from "lucide-react";

type NewsItem = {
  id: number;
  title: string;
  summary: string;
  tags: string[] | null;
  date: string;
  content: string | null;
  url?: string | null;
  source_name?: string | null;
  published_at?: string | null;
  region?: string | null;
  category?: string | null;
  industry?: string | null;
};

function formatDateLabel(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month)}月${parseInt(day)}日`;
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; date?: string }>;
}) {
  const { view, q, date } = await searchParams;
  const isSearch = view === "search";

  let newsItems: NewsItem[] | null = null;
  let episodes: EpisodeSummary[] = [];

  if (isSearch) {
    let query = supabase
      .from("news_reports")
      .select("id,title,summary,tags,date,content,url,source_name,published_at,region,category,industry");
    if (date) {
      query = query.eq("date", date);
    } else if (q && q.trim()) {
      const keyword = q.trim();
      query = query.or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`);
    }
    const { data } = await query.order("date", { ascending: false }).limit(50);
    newsItems = data;
  } else {
    episodes = await listEpisodes();
  }

  const tabClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
      active
        ? "bg-[#D4788A] text-white"
        : "bg-white border border-[#F9E8EC] text-[#9C8589]"
    }`;

  return (
    <div className="min-h-full">
      <header className="px-5 pt-12 pb-4">
        <span style={{
          fontFamily: "var(--font-cormorant)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "28px",
          color: "#C4607A",
          letterSpacing: "0.02em",
          lineHeight: 1,
          display: "block",
          marginBottom: "6px",
        }}>SherGlow ✨</span>
        <h1 className="text-2xl font-bold text-[#3D2832]">新闻 📰</h1>
        <p className="text-xs text-[#9C8589] mt-1">每天一期，可以听，也可以看</p>
      </header>

      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <Link href="/news" className={tabClass(!isSearch)}>节目</Link>
          <Link href="/news?view=search" className={tabClass(isSearch)}>搜索</Link>
        </div>
      </div>

      <div className="px-5 pb-6">
        {isSearch ? (
          <div>
            <form action="/news" method="GET" className="mb-4">
              <input type="hidden" name="view" value="search" />
              <div className="flex gap-2">
                <input
                  type="text"
                  name="q"
                  defaultValue={q || ""}
                  placeholder="搜索新闻标题或摘要…"
                  className="flex-1 bg-white border border-[#F9D8E4] rounded-2xl px-4 py-2.5 text-sm text-[#3D2832] placeholder-[#C4ACB4] outline-none focus:border-[#D4788A]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl text-sm font-medium text-white"
                  style={{ background: "#D4788A" }}
                >
                  搜索
                </button>
              </div>
            </form>

            {date ? (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-[#3D2832] font-medium">
                  📅 {formatDateLabel(date)} 的新闻
                </span>
                <Link
                  href="/news?view=search"
                  className="text-[11px] text-[#C4ACB4] underline ml-auto"
                >
                  清除
                </Link>
              </div>
            ) : q && q.trim() ? (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-[#3D2832] font-medium">
                  「{q.trim()}」的结果 · {newsItems?.length ?? 0} 条
                </span>
                <Link
                  href="/news?view=search"
                  className="text-[11px] text-[#C4ACB4] underline ml-auto"
                >
                  清除
                </Link>
              </div>
            ) : null}

            {!q && !date ? (
              <EmptyState emoji="🔍" title="输入关键词开始搜索" desc="可搜索新闻标题和摘要" />
            ) : newsItems && newsItems.length > 0 ? (
              <div className="space-y-3">
                {newsItems.map((item) => (
                  <NewsCard key={item.id} item={item} showSummary />
                ))}
              </div>
            ) : (
              <EmptyState emoji="📭" title="没有找到相关新闻" desc="换个关键词试试？" />
            )}
          </div>
        ) : episodes.length > 0 ? (
          <EpisodeList episodes={episodes} />
        ) : (
          <EmptyState emoji="📰" title="今日节目准备中" desc="Agent 每天北京时间上午 9 点自动生成，请稍后再来。" />
        )}
      </div>
    </div>
  );
}

function NewsCard({
  item,
  compact = false,
  showSummary = false,
}: {
  item: NewsItem;
  compact?: boolean;
  showSummary?: boolean;
}) {
  return (
    <a
      href={item.url || item.content || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl px-4 border border-[#F9D8E4] active:opacity-70"
      style={{
        paddingTop: compact ? "12px" : "16px",
        paddingBottom: compact ? "12px" : "16px",
        boxShadow: "0 1px 6px rgba(242,139,168,0.06)",
        textDecoration: "none",
      }}
    >
      <p className="text-[13px] font-semibold text-[#3D2832] leading-snug mb-1.5">
        {item.title}
      </p>
      {showSummary && item.summary && (
        <p className="text-[12px] text-[#A89098] leading-relaxed mb-2">
          {item.summary}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-[#C4ACB4]">{item.date}</span>
        {item.source_name && <span className="text-[11px] text-[#C4ACB4]">来源：{item.source_name}</span>}
        {item.published_at && <span className="text-[11px] text-[#C4ACB4]">发布时间：{beijingMonthDay(item.published_at)}</span>}
        {(item.region || item.category || item.industry) && <span className="text-[10px] text-[#C4607A]">{[item.region, item.category, item.industry].filter(Boolean).join(" · ")}</span>}
        {item.tags?.map((tag: string) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "#FDE8EE", color: "#F28BA8" }}
          >
            {tag}
          </span>
        ))}
        {(item.url || item.content) && (
          <span className="ml-auto text-[11px] text-[#F28BA8]">阅读原文 →</span>
        )}
      </div>
    </a>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#F9E8EC] flex flex-col items-center text-center gap-3 py-12">
      <span className="text-5xl">{emoji}</span>
      <p className="text-base font-semibold text-[#3D2832]">{title}</p>
      <p className="text-sm text-[#9C8589] leading-relaxed max-w-xs">{desc}</p>
    </div>
  );
}

function EpisodeList({ episodes }: { episodes: EpisodeSummary[] }) {
  const [latest, ...past] = episodes;
  const meta = (e: EpisodeSummary) => [`${e.articleCount} 条新闻`, formatMinutes(e.durationSec)].filter(Boolean).join(" · ");
  return (
    <div>
      {/* 今日一期 */}
      <Link
        href={`/news/${latest.date}`}
        className="block bg-white rounded-3xl p-5 border border-[#F9D8E4] active:opacity-80"
        style={{ boxShadow: "0 2px 16px rgba(242,139,168,0.10)", textDecoration: "none" }}
      >
        <p className="text-[11px] font-semibold text-[#D4788A] mb-1.5">
          {latest.date === beijingDate() ? "今日一期" : "最新一期"} · {dateLabel(latest.date)}
        </p>
        <p className="text-[17px] font-bold text-[#3D2832] leading-snug mb-1.5">{latest.headline}</p>
        <p className="text-[12px] text-[#A89098] mb-4">{meta(latest)}</p>
        <div className="flex items-center gap-3">
          <PlayButton episode={latest} size={44} />
          <span className="ml-auto flex items-center gap-0.5 text-[13px] text-[#F28BA8] font-medium">
            看文字 <ChevronRight size={14} />
          </span>
        </div>
      </Link>

      {/* 往期 */}
      {past.length > 0 && (
        <>
          <h2 className="text-[13px] font-semibold text-[#A89098] mt-6 mb-2">往期</h2>
          <div className="bg-white rounded-2xl border border-[#F9D8E4] divide-y divide-[#F9E8EC]">
            {past.map((e) => (
              <Link key={e.date} href={`/news/${e.date}`} className="flex items-center gap-3 px-4 py-3 active:opacity-70"
                style={{ textDecoration: "none" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#3D2832] truncate">{e.headline}</p>
                  <p className="text-[11px] text-[#C4ACB4] mt-0.5">{dateLabel(e.date)} · {meta(e)}</p>
                </div>
                <PlayButton episode={e} size={32} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
