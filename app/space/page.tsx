export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, string> = {
  学习: "📖", 成长: "🌱", 生活: "☕", 运动: "🎾", 情绪: "🐻", 成就: "⭐",
};

function formatDateLabel(dateStr: string, todayStr: string, yesterdayStr: string) {
  if (dateStr === todayStr) return "今天";
  if (dateStr === yesterdayStr) return "昨天";
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month)}月${parseInt(day)}日`;
}

export default async function SpacePage() {
  const now = new Date();
  const sydneyDate = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  const todayStr = `${sydneyDate.getFullYear()}-${String(sydneyDate.getMonth() + 1).padStart(2, "0")}-${String(sydneyDate.getDate()).padStart(2, "0")}`;
  const yDate = new Date(sydneyDate);
  yDate.setDate(yDate.getDate() - 1);
  const yesterdayStr = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, "0")}-${String(yDate.getDate()).padStart(2, "0")}`;

  const [recordsResult, glowResult] = await Promise.all([
    supabase.from("growth_records").select("id,date,category,content").order("date", { ascending: false }).order("created_at", { ascending: true }),
    supabase.from("glow_daily").select("date,response").order("date", { ascending: false }),
  ]);

  const allRecords = (recordsResult.data ?? []) as { id: number; date: string; category: string; content: string }[];
  const allGlow = (glowResult.data ?? []) as { date: string; response: string }[];

  // 按日期分组记录
  const recordsByDate: Record<string, { id: number; category: string; content: string }[]> = {};
  for (const r of allRecords) {
    if (!recordsByDate[r.date]) recordsByDate[r.date] = [];
    recordsByDate[r.date].push({ id: r.id, category: r.category, content: r.content });
  }

  const glowByDate: Record<string, string> = {};
  for (const g of allGlow) glowByDate[g.date] = g.response;

  const allDates = [...new Set(allRecords.map((r) => r.date))].sort((a, b) => b.localeCompare(a));
  const totalDays = allDates.length;

  const todayRecords = recordsByDate[todayStr] ?? [];
  const todayGlow = glowByDate[todayStr] ?? null;
  const historyDates = allDates.filter((d) => d !== todayStr);

  return (
    <div className="min-h-full pb-10">

      {/* ── Banner ── */}
      <div className="px-5 pt-12 pb-4">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ background: "#FADADD", minHeight: "160px" }}
        >
          {/* Glow 插图：右侧 */}
          <img
            src="/glow/glow-space-banner.png"
            alt="Glow"
            className="absolute right-0 bottom-0 h-full object-cover object-right"
            style={{ maxWidth: "70%" }}
          />
          {/* 左侧文字区（渐变遮住图片左边，让文字清晰） */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, #FADADD 42%, transparent 70%)" }}
          />
          {/* 文字内容 */}
          <div className="relative z-10 p-6 pr-0" style={{ maxWidth: "58%" }}>
            <p className="font-bold text-[#C4607A] text-[17px] mb-1">Hi, Sherry 🌹</p>
            <p className="text-[#D4809A] text-[12px] leading-relaxed mb-3">
              欢迎来到你的成长空间
            </p>
            <p className="text-[#D4809A] text-[11px] italic leading-relaxed mb-3">
              每一次记录，<br />都是在靠近更好的自己 ✨
            </p>
            {totalDays > 0 && (
              <div className="inline-block bg-white/60 rounded-full px-3 py-1">
                <p className="text-[#C4607A] text-[11px] font-semibold">已记录 {totalDays} 天</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">

        {/* ── 今日成长卡片 ── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[15px] font-bold text-[#3D2832]">今日成长</h2>
            <Link href="/record" className="text-[12px] text-[#F28BA8] font-medium">
              {todayRecords.length > 0 ? "继续记录 →" : "去记录 →"}
            </Link>
          </div>

          <Link
            href="/record"
            className="block bg-white rounded-2xl p-4 border border-[#F9D8E4] active:opacity-70"
            style={{ boxShadow: "0 2px 12px rgba(242,139,168,0.07)", textDecoration: "none" }}
          >
            {todayRecords.length === 0 ? (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: "#F0FAF0" }}>
                  🌱
                </div>
                <p className="text-[13px] leading-relaxed text-[#A89098] pt-1">
                  今天还没有记录，点击写下今天的第一件事 →
                </p>
              </div>
            ) : (
              <div>
                {todayGlow && (
                  <div className="rounded-xl px-3 py-2.5 mb-3"
                    style={{ background: "linear-gradient(135deg, #FDE8EE 0%, #F0E8FA 100%)" }}>
                    <p className="text-[11px] text-[#C4607A] font-semibold mb-1">🌸 Glow 想对你说</p>
                    <p className="text-[13px] text-[#6B3050] leading-relaxed">{todayGlow}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  {todayRecords.map((r) => (
                    <div key={r.id} className="flex items-start gap-2">
                      <span className="text-sm leading-none mt-0.5">{CATEGORY_ICONS[r.category] ?? "✨"}</span>
                      <p className="text-[13px] text-[#3D2832] leading-snug">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* ── 历史记录 ── */}
        {historyDates.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold text-[#3D2832] mb-2">往日成长</h2>
            <div className="space-y-3">
              {historyDates.map((date) => {
                const dayRecords = recordsByDate[date] ?? [];
                const dayGlow = glowByDate[date] ?? null;
                const label = formatDateLabel(date, todayStr, yesterdayStr);
                return (
                  <div key={date}
                    className="bg-white rounded-2xl p-4 border border-[#F9D8E4]"
                    style={{ boxShadow: "0 1px 6px rgba(242,139,168,0.06)" }}>
                    <p className="text-[12px] font-semibold text-[#C4ACB4] mb-2">{label}</p>
                    {dayGlow && (
                      <div className="rounded-xl px-3 py-2.5 mb-2.5"
                        style={{ background: "linear-gradient(135deg, #FDE8EE 0%, #F0E8FA 100%)" }}>
                        <p className="text-[11px] text-[#C4607A] font-semibold mb-1">🌸 Glow 想对你说</p>
                        <p className="text-[13px] text-[#6B3050] leading-relaxed">{dayGlow}</p>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {dayRecords.map((r) => (
                        <div key={r.id} className="flex items-start gap-2">
                          <span className="text-sm leading-none mt-0.5">{CATEGORY_ICONS[r.category] ?? "✨"}</span>
                          <p className="text-[13px] text-[#3D2832] leading-snug">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 从未记录过时 */}
        {totalDays === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[#F9D8E4] flex flex-col items-center text-center gap-2 py-8">
            <span className="text-4xl">🌱</span>
            <p className="text-[14px] font-semibold text-[#3D2832]">从今天开始记录吧</p>
            <p className="text-[12px] text-[#A89098] leading-relaxed">
              每一个小瞬间都值得被看见
            </p>
            <Link href="/record"
              className="mt-2 px-5 py-2 rounded-full text-[13px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #F28BA8 0%, #D4A0C8 100%)" }}>
              写下今天的第一条
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
