export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MoodHistoryAccordion, { DayData } from "@/components/MoodHistoryAccordion";

function formatDateLabel(dateStr: string) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
  const d = new Date(today + "T00:00:00");
  d.setDate(d.getDate() - 1);
  const yesterday = d.toLocaleDateString("en-CA");
  if (dateStr === today) return "今天";
  if (dateStr === yesterday) return "昨天";
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month)}月${parseInt(day)}日`;
}

export default async function SpacePage() {
  const { data: rawEntries } = await supabase
    .from("mood_entries")
    .select("id, date, mood, tags, ai_response, ai_personal_response, free_text, created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: true });

  // Group by date, keep entries in chronological order within each day
  const dayMap: Record<string, DayData> = {};
  for (const entry of rawEntries || []) {
    if (!dayMap[entry.date]) {
      dayMap[entry.date] = {
        date: entry.date,
        dateLabel: formatDateLabel(entry.date),
        latestMood: entry.mood,
        allTags: [],
        entryCount: 0,
        entries: [],
      };
    }
    const day = dayMap[entry.date];
    day.entries.push(entry);
    day.entryCount += 1;
    day.latestMood = entry.mood; // last in ascending order = latest
    if (entry.tags) {
      for (const tag of entry.tags) {
        if (!day.allTags.includes(tag)) day.allTags.push(tag);
      }
    }
  }
  const days = Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date));
  const totalDays = days.length;

  return (
    <div className="min-h-full pb-10">
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase mb-0.5">SherGlow</p>
        <h1 className="text-2xl font-bold text-[#3D2832]">我的空间 🌱</h1>
        <p className="text-xs text-[#9C8589] mt-1">成长与记录</p>
      </header>

      <div className="px-5 space-y-4">
        {/* Profile banner */}
        <div className="relative rounded-2xl overflow-hidden p-6"
          style={{ background: "linear-gradient(135deg, #E8A4B8 0%, #F4C4A0 100%)" }}>
          <span className="absolute top-3 right-4 text-3xl opacity-40 select-none">🌸</span>
          <p className="text-white font-bold text-lg mb-0.5">Sherry</p>
          <p className="text-white/70 text-xs">
            SherGlow 成员
            {totalDays > 0 && ` · 已记录 ${totalDays} 天心情`}
          </p>
        </div>

        {/* Mood Journal entry */}
        <Link
          href="/mood"
          className="block bg-white rounded-2xl border border-[#F9D8E4] px-5 py-5 active:opacity-70"
          style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)", textDecoration: "none" }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🌈</span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#3D2832]">心情日记</p>
              <p className="text-[12px] text-[#C4ACB4] mt-0.5">记录今天的心情，和 AI 聊几句</p>
            </div>
            <span className="text-[#D4788A] text-lg">→</span>
          </div>
        </Link>

        {/* Accordion history */}
        {days.length > 0 && <MoodHistoryAccordion days={days} />}

        {/* Phase 2 placeholder */}
        <div className="bg-white rounded-2xl p-6 border border-[#F9E8EC] flex flex-col items-center text-center gap-2 py-8">
          <span className="text-4xl">🌿</span>
          <p className="text-[14px] font-semibold text-[#3D2832]">更多功能即将上线</p>
          <p className="text-[12px] text-[#9C8589] leading-relaxed max-w-xs">
            成长记录、目标追踪等个人功能正在规划中 ✨
          </p>
        </div>
      </div>
    </div>
  );
}
