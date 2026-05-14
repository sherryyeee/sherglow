export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

export default async function NewsPage() {
  const { data: newsItems } = await supabase
    .from("news_reports")
    .select("id,title,summary,tags,date,content")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-full">
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase mb-0.5">SherGlow</p>
        <h1 className="text-2xl font-bold text-[#3D2832]">新闻 📰</h1>
        <p className="text-xs text-[#9C8589] mt-1">每日 AI 新闻速递</p>
      </header>

      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-full bg-[#D4788A] text-white text-xs font-medium">
            最新
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white border border-[#F9E8EC] text-[#9C8589] text-xs font-medium">
            历史
          </button>
        </div>
      </div>

      <div className="px-5 pb-6 space-y-3">
        {newsItems && newsItems.length > 0 ? newsItems.map((item) => (
          <a
            key={item.id}
            href={item.content || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl px-4 py-4 border border-[#F9D8E4] active:opacity-70"
            style={{ boxShadow: "0 1px 6px rgba(242,139,168,0.06)", textDecoration: "none" }}
          >
            <p className="text-[13px] font-semibold text-[#3D2832] leading-snug mb-2">
              {item.title}
            </p>
            <p className="text-[12px] text-[#A89098] leading-relaxed mb-2 line-clamp-3">
              {item.summary}
            </p>
            <div className="flex items-center gap-2">
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
        )) : (
          <div className="bg-white rounded-2xl p-6 border border-[#F9E8EC] flex flex-col items-center text-center gap-3 py-12">
            <span className="text-5xl">📰</span>
            <p className="text-base font-semibold text-[#3D2832]">今日新闻加载中</p>
            <p className="text-sm text-[#9C8589] leading-relaxed max-w-xs">
              Agent 每天早上 9 点自动生成，请稍后再来查看。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
