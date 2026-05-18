export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type NewsItem = {
  id: number;
  title: string;
  summary: string;
  tags: string[] | null;
  date: string;
  content: string | null;
};

function formatDateHeader(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "今天";
  if (dateStr === yesterday) return "昨天";
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month)}月${parseInt(day)}日`;
}

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
  const isHistory = view === "history";
  const isSearch = view === "search";

  let newsItems: NewsItem[] | null = null;
  const grouped: Record<string, NewsItem[]> = {};
  let dates: string[] = [];

  if (isSearch) {
    let query = supabase
      .from("news_reports")
      .select("id,title,summary,tags,date,content");
    if (date) {
      query = query.eq("date", date);
    } else if (q && q.trim()) {
      const keyword = q.trim();
      query = query.or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%`);
    }
    const { data } = await query.order("date", { ascending: false }).limit(50);
    newsItems = data;
  } else if (isHistory) {
    const { data } = await supabase
      .from("news_reports")
      .select("id,title,summary,tags,date,content")
      .order("date", { ascending: false });
    if (data) {
      for (const item of data) {
        if (!grouped[item.date]) grouped[item.date] = [];
        grouped[item.date].push(item);
      }
    }
    dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  } else {
    const { data } = await supabase
      .from("news_reports")
      .select("id,title,summary,tags,date,content")
      .order("created_at", { ascending: false })
      .limit(20);
    newsItems = data;
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
        <p className="text-xs text-[#9C8589] mt-1">每日 AI 新闻速递</p>
      </header>

      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <Link href="/news" className={tabClass(!isHistory && !isSearch)}>最新</Link>
          <Link href="/news?view=history" className={tabClass(isHistory)}>历史</Link>
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
              <EmptyState emoji="🔍" title="输入关键词开始搜索" desc="可搜索新闻标题和摘要，或在历史页点击日期直接筛选" />
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
        ) : isHistory ? (
          dates.length > 0 ? (
            <div className="space-y-6">
              {dates.map((d) => (
                <div key={d}>
                  <div className="flex items-center gap-2 mb-3">
                    <Link
                      href={`/news?view=search&date=${d}`}
                      className="text-sm font-semibold text-[#3D2832] hover:text-[#D4788A] transition-colors"
                    >
                      {formatDateHeader(d)}
                    </Link>
                    <span className="text-[11px] text-[#C4ACB4]">{d}</span>
                    <Link
                      href={`/news?view=search&date=${d}`}
                      className="text-[11px] text-[#C4ACB4] ml-auto"
                    >
                      {grouped[d].length} 条 →
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {grouped[d].map((item) => (
                      <NewsCard key={item.id} item={item} compact />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState emoji="📰" title="暂无历史记录" desc="每天早上 8 点自动更新" />
          )
        ) : (
          <div className="space-y-3">
            {newsItems && newsItems.length > 0 ? (
              newsItems.map((item) => (
                <NewsCard key={item.id} item={item} showSummary />
              ))
            ) : (
              <EmptyState emoji="📰" title="今日新闻加载中" desc="Agent 每天早上 8 点自动生成，请稍后再来查看。" />
            )}
          </div>
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
      href={item.content || undefined}
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
        {item.tags?.map((tag: string) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "#FDE8EE", color: "#F28BA8" }}
          >
            {tag}
          </span>
        ))}
        {item.content && (
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
