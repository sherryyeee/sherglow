"use client";

import Link from "next/link";
import { MOODS } from "./MoodFaces";

export default function MoodCheckin({ todayMood }: { todayMood?: string | null }) {
  const recorded = MOODS.find(m => m.key === todayMood);

  return (
    <section className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-[#3D2832]">今天的心情如何？</p>
        <Link href="/mood" className="text-[11px] font-medium text-[#D4788A]">
          {recorded ? "查看记录 →" : "记录 →"}
        </Link>
      </div>

      <Link
        href="/mood"
        className="block bg-white rounded-3xl py-5 px-3 border border-[#F9D8E4]"
        style={{ boxShadow: "0 2px 16px rgba(242,139,168,0.07)", textDecoration: "none" }}
      >
        <div className="flex justify-between items-start px-1">
          {MOODS.map((mood) => {
            const active = todayMood === mood.key;
            const Face = mood.Face;
            return (
              <div
                key={mood.key}
                className="flex flex-col items-center gap-2"
                style={{
                  transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: active ? "scale(1.14) translateY(-4px)" : "scale(1)",
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", overflow: "hidden",
                  boxShadow: active
                    ? `0 0 0 2.5px ${mood.ring}, 0 8px 24px ${mood.glow}`
                    : "0 2px 10px rgba(0,0,0,0.07)",
                  transition: "box-shadow 0.25s ease",
                }}>
                  <Face />
                </div>
                <span className="text-[11px] font-semibold"
                  style={{ color: active ? "#3D2832" : "#C4ACB4", transition: "color 0.2s ease" }}>
                  {mood.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] mt-4 font-medium" style={{ color: "#C4ACB4" }}>
          {recorded
            ? `今日已记录 · ${recorded.label} · 点击查看`
            : "点击开始记录今天的心情 ✨"}
        </p>
      </Link>
    </section>
  );
}
