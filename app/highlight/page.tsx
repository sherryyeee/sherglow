export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

export default async function HighlightPage() {
  const { data: highlights } = await supabase
    .from("daily_highlights")
    .select("id,date,title,summary,why_important")
    .order("created_at", { ascending: false })
    .limit(20);

  const today = highlights?.[0] ?? null;
  const past = highlights?.slice(1) ?? [];

  return (
    <div className="min-h-full">
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase mb-0.5">SherGlow</p>
        <h1 className="text-2xl font-bold text-[#3D2832]">今日精选 ⭐</h1>
        <p className="text-xs text-[#9C8589] mt-1">AI 为你挑选的最值得读的内容</p>
      </header>

      <div className="px-5 pb-6 space-y-3">
        {today ? (
          <>
            {/* 今日精选主卡 */}
            <div
              className="bg-white rounded-2xl p-5 border border-[#F9D8E4]"
              style={{ boxShadow: "0 2px 16px rgba(242,139,168,0.09)" }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm">⭐</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#F28BA8]">
                  今日精选 · {today.date}
                </span>
              </div>
              <p className="text-[15px] font-bold text-[#3D2832] leading-snug mb-2">
                {today.title}
              </p>
              <p className="text-[13px] text-[#A89098] leading-relaxed mb-3">
                {today.summary}
              </p>
              {today.why_important && today.why_important !== today.summary && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: "#FDE8EE" }}
                >
                  <p className="text-[11px] font-bold text-[#F28BA8] uppercase tracking-wide mb-1">为什么重要</p>
                  <p className="text-[12px] text-[#3D2832] leading-relaxed">{today.why_important}</p>
                </div>
              )}
            </div>

            {/* 历史精选 */}
            {past.length > 0 && (
              <>
                <p className="text-[12px] font-semibold text-[#C4ACB4] pt-2 px-1">往期精选</p>
                {past.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl px-4 py-3 border border-[#F9D8E4]"
                    style={{ boxShadow: "0 1px 6px rgba(242,139,168,0.06)" }}
                  >
                    <p className="text-[10px] text-[#C4ACB4] mb-1">{item.date}</p>
                    <p className="text-[13px] font-semibold text-[#3D2832] leading-snug mb-1">{item.title}</p>
                    <p className="text-[12px] text-[#A89098] leading-relaxed line-clamp-2">{item.summary}</p>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-[#F9E8EC] flex flex-col items-center text-center gap-3 py-12">
            <span className="text-5xl">🌸</span>
            <p className="text-base font-semibold text-[#3D2832]">今日精选加载中</p>
            <p className="text-sm text-[#9C8589] leading-relaxed max-w-xs">
              Agent 每天早上 9 点自动生成，请稍后再来查看。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
