import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MOODS } from "@/components/MoodFaces";

function formatDate(dateStr: string) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
  const yesterday = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toLocaleDateString("en-CA");
  if (dateStr === today) return "今天";
  if (dateStr === yStr) return "昨天";
  const [, month, day] = dateStr.split("-");
  return `${parseInt(month)}月${parseInt(day)}日`;
}

export default async function SpacePage() {
  const { data: moodHistory } = await supabase
    .from("mood_entries")
    .select("id, date, mood, tags, ai_response")
    .order("date", { ascending: false })
    .limit(20);

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
          <p className="text-white/70 text-xs">SherGlow 成员 · 已记录 {moodHistory?.length ?? 0} 天心情</p>
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

        {/* Mood history */}
        {moodHistory && moodHistory.length > 0 && (
          <div>
            <h2 className="text-[13px] font-semibold text-[#3D2832] mb-3">心情记录</h2>
            <div className="space-y-2">
              {moodHistory.map((entry) => {
                const moodData = MOODS.find((m) => m.key === entry.mood);
                const Face = moodData?.Face;
                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl px-4 py-3.5 border border-[#F9D8E4] flex items-start gap-3"
                    style={{ boxShadow: "0 1px 6px rgba(242,139,168,0.05)" }}
                  >
                    {/* Face */}
                    {Face && (
                      <div className="flex-shrink-0" style={{ width: 40, height: 40 }}>
                        <Face />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-[#3D2832]">
                          {moodData?.label ?? entry.mood}
                        </span>
                        <span className="text-[11px] text-[#C4ACB4] ml-auto">
                          {formatDate(entry.date)}
                        </span>
                      </div>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {entry.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: "#FDE8EE", color: "#F28BA8" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.ai_response && (
                        <p className="text-[12px] text-[#A89098] leading-relaxed line-clamp-2">
                          {entry.ai_response}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
