export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ReportItem = {
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

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const isHistory = view === "history";

  const { data: reports } = isHistory
    ? await supabase
        .from("industry_reports")
        .select("id,title,summary,tags,date,content")
        .order("date", { ascending: false })
    : await supabase
        .from("industry_reports")
        .select("id,title,summary,tags,date,content")
        .order("created_at", { ascending: false })
        .limit(10);

  const grouped: Record<string, ReportItem[]> = {};
  if (isHistory && reports) {
    for (const item of reports) {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    }
  }
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const tabClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
      active
        ? "bg-[#D4788A] text-white"
        : "bg-white border border-[#F9E8EC] text-[#9C8589]"
    }`;

  return (
    <div className="min-h-full">
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase mb-0.5">SherGlow</p>
        <h1 className="text-2xl font-bold text-[#3D2832]">研报 📊</h1>
        <p className="text-xs text-[#9C8589] mt-1">每周 AI 行业研报精选</p>
      </header>

      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <Link href="/reports" className={tabClass(!isHistory)}>最新</Link>
          <Link href="/reports?view=history" className={tabClass(isHistory)}>历史</Link>
        </div>
      </div>

      <div className="px-5 pb-6">
        {isHistory ? (
          dates.length > 0 ? (
            <div className="space-y-6">
              {dates.map((date) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-[#3D2832]">
                      {formatDateHeader(date)}
                    </span>
                    <span className="text-[11px] text-[#C4ACB4]">{date}</span>
                    <span className="text-[11px] text-[#C4ACB4] ml-auto">
                      {grouped[date].length} 篇
                    </span>
                  </div>
                  <div className="space-y-2">
                    {grouped[date].map((item) => (
                      <ReportCard key={item.id} item={item} compact />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="📊"
              title="暂无历史记录"
              desc="研报 Agent 上线后，每周二、五的研报将在这里归档。"
            />
          )
        ) : (
          <div className="space-y-3">
            {reports && reports.length > 0 ? reports.map((item) => (
              <ReportCard key={item.id} item={item} />
            )) : (
              <EmptyState
                emoji="📊"
                title="研报即将上线"
                desc="连接 AI Agent 后，每周二、周五的行业研报摘要将在这里展示，并支持按日期查看历史记录。"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ item, compact = false }: { item: ReportItem; compact?: boolean }) {
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
      {!compact && item.summary && (
        <p className="text-[12px] text-[#A89098] leading-relaxed mb-2 line-clamp-3">
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
