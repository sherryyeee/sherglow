export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ChevronRight, CalendarDays, Sprout, BookOpen, Coffee, Dumbbell, Smile, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CategoryConfig = { Icon: LucideIcon; color: string; bg: string };
const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  学习: { Icon: BookOpen, color: "#E0708A", bg: "#FDEEF2" },
  成长: { Icon: Sprout,   color: "#5CAB78", bg: "#E8F8EE" },
  生活: { Icon: Coffee,   color: "#D4836A", bg: "#FEF3E8" },
  运动: { Icon: Dumbbell, color: "#9070C8", bg: "#EEE8F8" },
  心情: { Icon: Smile,    color: "#C878A8", bg: "#FDEEF6" },
  情绪: { Icon: Smile,    color: "#C878A8", bg: "#FDEEF6" },
  成就: { Icon: Star,     color: "#C8922A", bg: "#FEF8E6" },
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

  // 时段 & Banner 配置
  const hour = sydneyDate.getHours();
  type Period = "morning" | "afternoon" | "night";
  const period: Period = hour >= 6 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "night";
  const msgIdx = sydneyDate.getDate() % 3;

  const BANNER_CONFIG: Record<Period, {
    gradient: string; textPrimary: string; textSecondary: string;
    greeting: string; messages: string[]; bgPosition: string;
  }> = {
    morning: {
      gradient: "linear-gradient(to right, rgba(245,185,195,0.96) 0%, rgba(245,185,195,0.88) 35%, rgba(245,185,195,0.4) 60%, transparent 78%)",
      textPrimary: "#8B3050", textSecondary: "#A04060",
      greeting: "🌸",
      messages: [
        "早安 🌸 新的一天，\n把美好都记下来吧",
        "早上好 ✨ 每一个清晨，\n都是全新的开始",
        "晨光里的你最闪亮 🌷\n今天也要好好记录哦",
      ],
      bgPosition: "right top",
    },
    afternoon: {
      gradient: "linear-gradient(to right, rgba(240,195,175,0.96) 0%, rgba(240,195,175,0.88) 35%, rgba(240,195,175,0.4) 60%, transparent 78%)",
      textPrimary: "#7B3828", textSecondary: "#9A5038",
      greeting: "🌼",
      messages: [
        "下午好，Sherry ☕\n今天有没有让你微笑的小事？",
        "午后时光 🌼\n停下来，给自己的成长留个痕迹",
        "嘿，Sherry 💕\n今天过得怎么样？记下来吧",
      ],
      bgPosition: "right 50%",
    },
    night: {
      gradient: "linear-gradient(to right, rgba(140,115,195,0.96) 0%, rgba(140,115,195,0.88) 35%, rgba(140,115,195,0.4) 60%, transparent 78%)",
      textPrimary: "#2E1A5A", textSecondary: "#4A3478",
      greeting: "🌙",
      messages: [
        "夜晚了，Sherry 🌙\n今天辛苦啦，把故事留在这里",
        "夜色温柔 ✨\n记录今天，明天继续发光",
        "好好休息 🌟\n今天的你，已经很棒了",
      ],
      bgPosition: "right bottom",
    },
  };

  const bannerCfg = BANNER_CONFIG[period];

  return (
    <div className="min-h-full pb-10">

      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-2">
        <span style={{
          fontFamily: "var(--font-cormorant)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "28px",
          color: "#C4607A",
          letterSpacing: "0.02em",
          lineHeight: 1,
          display: "block",
        }}>
          SherGlow ✨
        </span>
      </header>

      {/* ── Banner ── */}
      <div className="px-5 pt-3 pb-4">
        <div className="relative rounded-3xl overflow-hidden" style={{ height: "180px" }}>
          {/* 背景图 — 按时段定位不同区域 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(/glow/glow-banners-combined.png)",
              backgroundSize: "auto 300%",
              backgroundPosition: bannerCfg.bgPosition,
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* 渐变叠层 */}
          <div className="absolute inset-0" style={{ background: bannerCfg.gradient }} />
          {/* 文字内容 */}
          <div className="relative z-10 h-full flex flex-col justify-center pl-5 pr-0" style={{ maxWidth: "56%" }}>
            <p className="font-bold text-[17px] mb-2" style={{ color: bannerCfg.textPrimary }}>
              Hi, Sherry {bannerCfg.greeting}
            </p>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: bannerCfg.textSecondary, whiteSpace: "pre-line" }}>
              {bannerCfg.messages[msgIdx]}
            </p>
            {totalDays > 0 && (
              <div className="w-fit bg-white/50 rounded-full px-3 py-1" style={{ backdropFilter: "blur(4px)" }}>
                <p className="text-[11px] font-semibold" style={{ color: bannerCfg.textPrimary }}>已记录 {totalDays} 天</p>
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
            <Link href="/record" className="flex items-center gap-0.5 text-[12px] text-[#F28BA8] font-medium">
              {todayRecords.length > 0 ? "继续记录" : "去记录"}<ChevronRight size={13} />
            </Link>
          </div>

          <Link
            href="/record"
            className="block bg-white rounded-2xl p-4 border border-[#F9D8E4] active:opacity-70"
            style={{ boxShadow: "0 2px 12px rgba(242,139,168,0.07)", textDecoration: "none" }}
          >
            {todayRecords.length === 0 ? (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#F0FAF0" }}>
                  <Sprout size={18} color="#6DBF8A" />
                </div>
                <div className="flex items-center gap-1 pt-2.5">
                  <p className="text-[13px] leading-relaxed text-[#A89098]">
                    今天还没有记录，点击写下今天的第一件事
                  </p>
                  <ChevronRight size={14} color="#C4ACB4" />
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-1.5">
                  {todayRecords.map((r) => {
                    const cfg = CATEGORY_CONFIG[r.category];
                    const Icon = cfg?.Icon;
                    return (
                      <div key={r.id} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: cfg?.bg ?? "#FEF3F6" }}>
                          {Icon ? <Icon size={13} color={cfg!.color} strokeWidth={2} /> : <span className="text-xs">✨</span>}
                        </div>
                        <p className="text-[13px] text-[#3D2832] leading-snug">{r.content}</p>
                      </div>
                    );
                  })}
                </div>
                {todayGlow && (
                  <div className="rounded-xl px-3 py-2.5 mt-3"
                    style={{ background: "linear-gradient(135deg, #FDE8EE 0%, #F0E8FA 100%)" }}>
                    <p className="text-[11px] text-[#C4607A] font-semibold mb-1">🌸 Glow 想对你说</p>
                    <p className="text-[13px] text-[#6B3050] leading-relaxed">{todayGlow}</p>
                  </div>
                )}
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
                    <div className="flex items-center gap-1.5 mb-2">
                      <CalendarDays size={12} color="#C4ACB4" />
                      <p className="text-[12px] font-semibold text-[#C4ACB4]">{label}</p>
                    </div>
                    {dayGlow && (
                      <div className="rounded-xl px-3 py-2.5 mb-2.5"
                        style={{ background: "linear-gradient(135deg, #FDE8EE 0%, #F0E8FA 100%)" }}>
                        <p className="text-[11px] text-[#C4607A] font-semibold mb-1">🌸 Glow 想对你说</p>
                        <p className="text-[13px] text-[#6B3050] leading-relaxed">{dayGlow}</p>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {dayRecords.map((r) => {
                        const cfg = CATEGORY_CONFIG[r.category];
                        const Icon = cfg?.Icon;
                        return (
                          <div key={r.id} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: cfg?.bg ?? "#FEF3F6" }}>
                              {Icon ? <Icon size={13} color={cfg!.color} strokeWidth={2} /> : <span className="text-xs">✨</span>}
                            </div>
                            <p className="text-[13px] text-[#3D2832] leading-snug">{r.content}</p>
                          </div>
                        );
                      })}
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
