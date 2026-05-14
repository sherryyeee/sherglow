export const dynamic = "force-dynamic";

import MoodCheckin from "@/components/MoodCheckin";
import { supabase } from "@/lib/supabase";

interface Landscape {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  sunColor: string;
  hillBack: string;
  hillMid: string;
  hillFront: string;
  textColor: string;
  attrColor: string;
}

// One theme per day of week (Sun=0 … Sat=6)
const LANDSCAPES: Landscape[] = [
  { // Sunday — lavender mist
    skyTop: "#E4C8F0", skyMid: "#F0D8E8", skyBottom: "#FFE8DA",
    sunColor: "rgba(255,211,122,0.42)",
    hillBack: "rgba(218,172,216,0.65)", hillMid: "rgba(198,148,200,0.72)", hillFront: "rgba(188,126,194,0.82)",
    textColor: "#5C2D60", attrColor: "rgba(118,58,128,0.72)",
  },
  { // Monday — sakura pink
    skyTop: "#FDC8D4", skyMid: "#FDDEC8", skyBottom: "#FFF0E0",
    sunColor: "rgba(255,211,122,0.50)",
    hillBack: "rgba(252,198,213,0.65)", hillMid: "rgba(248,168,193,0.72)", hillFront: "rgba(240,137,167,0.82)",
    textColor: "#6B2D3E", attrColor: "rgba(154,70,93,0.75)",
  },
  { // Tuesday — peach sunset
    skyTop: "#F8D4B0", skyMid: "#FCE8C8", skyBottom: "#FFF6E8",
    sunColor: "rgba(255,200,100,0.55)",
    hillBack: "rgba(244,193,153,0.65)", hillMid: "rgba(238,168,128,0.72)", hillFront: "rgba(228,143,116,0.82)",
    textColor: "#6B3820", attrColor: "rgba(146,78,50,0.75)",
  },
  { // Wednesday — rose gold
    skyTop: "#F4D0D0", skyMid: "#F8DCC8", skyBottom: "#FFF4EE",
    sunColor: "rgba(255,200,140,0.52)",
    hillBack: "rgba(236,186,180,0.65)", hillMid: "rgba(228,160,160,0.72)", hillFront: "rgba(216,138,146,0.82)",
    textColor: "#6B2530", attrColor: "rgba(143,63,78,0.75)",
  },
  { // Thursday — classic blush (today)
    skyTop: "#FDC8D8", skyMid: "#FDDEC8", skyBottom: "#FFF0E0",
    sunColor: "rgba(255,211,122,0.50)",
    hillBack: "rgba(252,198,213,0.65)", hillMid: "rgba(248,168,193,0.72)", hillFront: "rgba(240,137,167,0.82)",
    textColor: "#6B2D3E", attrColor: "rgba(154,70,93,0.75)",
  },
  { // Friday — periwinkle dream
    skyTop: "#C8D4F4", skyMid: "#D8E4F8", skyBottom: "#F0F4FF",
    sunColor: "rgba(255,220,180,0.48)",
    hillBack: "rgba(188,208,243,0.65)", hillMid: "rgba(166,190,236,0.72)", hillFront: "rgba(146,172,226,0.82)",
    textColor: "#2A3560", attrColor: "rgba(70,83,156,0.75)",
  },
  { // Saturday — dusty rose
    skyTop: "#F0C4D4", skyMid: "#F5D0DC", skyBottom: "#FFF0F4",
    sunColor: "rgba(255,200,150,0.50)",
    hillBack: "rgba(233,173,198,0.65)", hillMid: "rgba(218,150,180,0.72)", hillFront: "rgba(198,126,163,0.82)",
    textColor: "#6B2040", attrColor: "rgba(146,56,96,0.75)",
  },
];

const DAILY_QUOTES = [
  { text: "你正在成为\n你想成为的那个人。", attr: "相信自己，你比你想象的更强大" },
  { text: "每一天都是\n全新的起点。",       attr: "温柔地勇敢，持续地发光" },
  { text: "你的努力\n从未被辜负。",         attr: "相信过程，结果自然到来" },
  { text: "做自己最好的\n那个版本。",       attr: "每一步都算数，每天一点点" },
  { text: "你正在成为\n你想成为的那个人。", attr: "相信自己，你比你想象的更强大" },
  { text: "保持好奇\n保持成长。",           attr: "知识是最好的投资" },
  { text: "你的光芒\n无法被掩盖。",         attr: "Women with Power — 持续发光" },
];

function getGreeting(hour: number) {
  if (hour < 6)  return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default async function DailyGlowPage() {
  const now        = new Date();
  const sydneyDate = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  const day        = sydneyDate.getDay();
  const hour       = sydneyDate.getHours();
  const land   = LANDSCAPES[day];
  const quote  = DAILY_QUOTES[day];

  const [newsResult, highlightResult] = await Promise.all([
    supabase.from("news_reports").select("id,title,summary,tags,date,content").order("created_at", { ascending: false }).limit(3),
    supabase.from("daily_highlights").select("title,summary").order("created_at", { ascending: false }).limit(1),
  ]);

  console.log("news_reports:", JSON.stringify(newsResult));
  console.log("daily_highlights:", JSON.stringify(highlightResult));

  const newsItems = newsResult.data as { id: number; title: string; summary: string; tags: string[]; date: string; content: string }[] | null;
  const highlights = highlightResult.data;

  const todayHighlight = highlights?.[0] ?? null;

  const skyGradient = `linear-gradient(180deg, ${land.skyTop} 0%, ${land.skyMid} 48%, ${land.skyBottom} 100%)`;

  return (
    <div className="min-h-full">

      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-2">
        <div className="flex justify-between items-center mb-5">
          <span
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "28px",
              color: "#C4607A",
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            SherGlow ✨
          </span>
          <button
            className="w-9 h-9 rounded-full bg-white border border-[#F0D8E0] flex items-center justify-center text-sm"
            style={{ boxShadow: "0 2px 8px rgba(242,139,168,0.10)" }}
            aria-label="通知"
          >
            🔔
          </button>
        </div>

        <h1 className="text-[22px] font-bold text-[#3D2832]">
          {getGreeting(hour)}, Sherry 🌷
        </h1>
        <p className="text-[13px] text-[#A89098] mt-1">今天也要好好爱自己哦！</p>
      </header>

      {/* ── Daily Glow Hero Card ── */}
      <div className="px-5 mt-4 mb-5">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ height: "224px", background: skyGradient }}
        >
          {/* Sun glow — top right */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 160, height: 160,
              right: -10, top: -40,
              background: `radial-gradient(circle, ${land.sunColor} 0%, transparent 70%)`,
              borderRadius: "50%",
            }}
          />

          {/* SVG: clouds + rolling hills + tiny flowers */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 400 130"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Clouds */}
            <ellipse cx="58"  cy="28" rx="30" ry="13" fill="rgba(255,255,255,0.62)" />
            <ellipse cx="84"  cy="22" rx="22" ry="10" fill="rgba(255,255,255,0.62)" />
            <ellipse cx="42"  cy="35" rx="18" ry="8"  fill="rgba(255,255,255,0.52)" />
            <ellipse cx="308" cy="22" rx="26" ry="11" fill="rgba(255,255,255,0.56)" />
            <ellipse cx="330" cy="16" rx="20" ry="9"  fill="rgba(255,255,255,0.56)" />

            {/* Back hill */}
            <path
              d="M0,88 Q80,36 160,70 Q240,106 320,54 Q362,32 400,60 L400,130 L0,130 Z"
              fill={land.hillBack}
            />
            {/* Mid hill */}
            <path
              d="M0,106 Q60,70 148,94 Q238,118 310,86 Q356,70 400,90 L400,130 L0,130 Z"
              fill={land.hillMid}
            />
            {/* Front hill */}
            <path
              d="M0,120 Q100,98 200,116 Q300,134 400,108 L400,130 L0,130 Z"
              fill={land.hillFront}
            />

            {/* Tiny flower dots on hills */}
            <circle cx="72"  cy="108" r="2.5" fill="rgba(255,255,255,0.88)" />
            <circle cx="115" cy="104" r="2"   fill="rgba(255,255,255,0.78)" />
            <circle cx="178" cy="114" r="2.5" fill="rgba(255,245,248,0.92)" />
            <circle cx="248" cy="110" r="2"   fill="rgba(255,255,255,0.78)" />
            <circle cx="312" cy="106" r="2.5" fill="rgba(255,255,255,0.88)" />
            <circle cx="358" cy="116" r="2"   fill="rgba(255,245,248,0.82)" />
          </svg>

          {/* Text overlay — all centered */}
          <div className="absolute inset-0 flex flex-col justify-start items-center p-5 pt-6 z-10 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="text-sm leading-none">💗</span>
              <p
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: land.attrColor }}
              >
                每日鼓舞
              </p>
            </div>

            <p
              className="leading-snug whitespace-pre-line"
              style={{
                fontFamily: '"LXGW WenKai GB Medium", serif',
                fontSize: "1.3rem",
                color: land.textColor,
                textShadow: "0 1px 16px rgba(255,235,240,0.85)",
              }}
            >
              {quote.text}
            </p>

            <p
              className="text-[11px] mt-3"
              style={{ color: land.attrColor }}
            >
              — {quote.attr}
            </p>
          </div>
        </div>
      </div>

      {/* ── Mood Check-in ── */}
      <MoodCheckin />

      {/* ── 今日精选 ── */}
      <section className="px-5 mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-bold text-[#3D2832]">今日精选</h2>
          <a href="/highlight" className="text-[12px] text-[#F28BA8] font-medium">
            查看全部
          </a>
        </div>

        <a
          href="/highlight"
          className="block bg-white rounded-2xl p-4 border border-[#F9D8E4] active:opacity-70"
          style={{ boxShadow: "0 2px 12px rgba(242,139,168,0.07)", textDecoration: "none" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: "#FDE8EE" }}>
              ⭐
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#3D2832] mb-1">
                {todayHighlight ? todayHighlight.title : "AI 为你精选"}
              </p>
              <p className="text-[12px] leading-relaxed text-[#A89098]">
                {todayHighlight ? todayHighlight.summary : "Agent 接入后将在此展示今日最值得关注的一条内容。"}
              </p>
              {todayHighlight && (
                <p className="text-[11px] text-[#F28BA8] mt-2">查看详情 →</p>
              )}
            </div>
          </div>
        </a>
      </section>

      {/* ── AI 相关新闻 (list feed) ── */}
      <section className="px-5 mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-bold text-[#3D2832]">AI 相关新闻</h2>
          <a href="/news" className="text-[12px] text-[#F28BA8] font-medium">
            更多 →
          </a>
        </div>

        <div className="space-y-2">
          {newsItems && newsItems.length > 0 ? newsItems.map((item) => (
            <a
              key={item.id}
              href={item.content || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl px-4 py-3 border border-[#F9D8E4] flex items-start gap-3 active:opacity-70"
              style={{ boxShadow: "0 1px 6px rgba(242,139,168,0.06)", textDecoration: "none", display: "flex" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: "#FDE8EE" }}>
                📰
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#3D2832] leading-snug line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-[#C4ACB4]">{item.date}</span>
                  {item.tags?.[0] && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "#FDE8EE", color: "#F28BA8" }}
                    >
                      {item.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            </a>
          )) : (
            <div className="bg-white rounded-2xl px-4 py-3 border border-[#F9D8E4] text-center text-[12px] text-[#C4ACB4]">
              今日新闻加载中…
            </div>
          )}
        </div>
      </section>

      {/* ── 最新行业研究报告 (compact) ── */}
      <section className="px-5 mb-12">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-bold text-[#3D2832]">最新行业研究报告</h2>
          <a href="/reports" className="text-[12px] text-[#F28BA8] font-medium">
            更多 →
          </a>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#F9D8E4]"
          style={{ boxShadow: "0 2px 12px rgba(242,139,168,0.07)" }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: "#FDE8EE" }}>
              📊
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-[13px] font-semibold text-[#3D2832]">每周行业分析报告</p>
                <span className="text-[10px] text-[#C4ACB4] ml-2 flex-shrink-0">每周二、五</span>
              </div>
              <p className="text-[12px] text-[#A89098] mt-1 leading-relaxed">
                研报接入后展示最新一期一句话摘要
              </p>
              <a href="/reports"
                className="text-[12px] font-medium mt-2 inline-block"
                style={{ color: "#F28BA8" }}
              >
                进入详情 →
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
