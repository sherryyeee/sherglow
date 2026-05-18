"use client";

import { useState } from "react";
import { MOODS } from "./MoodFaces";

type MoodEntry = {
  id: number;
  mood: string;
  tags: string[] | null;
  free_text: string | null;
  ai_response: string | null;
  ai_personal_response: string | null;
  created_at: string;
};

export type DayData = {
  date: string;
  dateLabel: string;
  latestMood: string;
  allTags: string[];
  entryCount: number;
  entries: MoodEntry[];
};

function getTimeStr(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString("zh-CN", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function MoodTimeline({ entries }: { entries: MoodEntry[] }) {
  return (
    <div className="relative pt-1">
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        const moodData = MOODS.find((m) => m.key === entry.mood);
        const Face = moodData?.Face;
        const timeStr = getTimeStr(entry.created_at);
        const aiText = entry.ai_personal_response || entry.ai_response;

        return (
          <div key={entry.id} className="relative pl-7 pb-5">
            {/* Vertical line */}
            {!isLast && (
              <div
                className="absolute left-[5px] top-4 w-[2px]"
                style={{ height: "calc(100% - 4px)", background: "#F9D8E4" }}
              />
            )}
            {/* Dot */}
            <div
              className="absolute top-[5px] left-0 w-3 h-3 rounded-full"
              style={{
                background: moodData?.ring || "#F28BA8",
                boxShadow: `0 0 0 2px white, 0 0 0 3.5px ${moodData?.ring || "#F28BA8"}`,
              }}
            />

            {/* Time + mood face + label */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[11px] text-[#C4ACB4] font-medium tabular-nums">
                {timeStr}
              </span>
              {Face && (
                <div className="flex-shrink-0" style={{ width: 20, height: 20 }}>
                  <Face />
                </div>
              )}
              <span className="text-[12px] font-semibold text-[#3D2832]">
                {moodData?.label}
              </span>
            </div>

            {/* User text */}
            {entry.free_text && (
              <p
                className="text-[12px] text-[#3D2832] leading-relaxed mb-1.5 pl-2 border-l-[2px]"
                style={{ borderColor: moodData?.ring || "#F28BA8" }}
              >
                「{entry.free_text}」
              </p>
            )}

            {/* AI response */}
            {aiText && (
              <p className="text-[12px] text-[#A89098] leading-relaxed">
                ✦ {aiText}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MoodHistoryAccordion({ days }: { days: DayData[] }) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggle = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  if (days.length === 0) return null;

  return (
    <div>
      <h2 className="text-[13px] font-semibold text-[#3D2832] mb-3">心情记录</h2>
      <div className="space-y-2">
        {days.map((day) => {
          const isOpen = expandedDates.has(day.date);
          const moodData = MOODS.find((m) => m.key === day.latestMood);
          const Face = moodData?.Face;

          return (
            <div
              key={day.date}
              className="bg-white rounded-2xl border border-[#F9D8E4] overflow-hidden"
              style={{ boxShadow: "0 1px 6px rgba(242,139,168,0.05)" }}
            >
              {/* Header row */}
              <button
                onClick={() => toggle(day.date)}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left active:opacity-70"
              >
                {Face && (
                  <div className="flex-shrink-0" style={{ width: 36, height: 36 }}>
                    <Face />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#3D2832]">
                      {moodData?.label ?? day.latestMood}
                    </span>
                    {day.allTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "#FDE8EE", color: "#F28BA8" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#C4ACB4] mt-0.5">
                    {day.dateLabel} · {day.entryCount} 次倾诉
                  </p>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{
                    flexShrink: 0,
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                >
                  <path d="M6 4l4 4-4 4" stroke="#C4ACB4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#FDE8EE]">
                  <MoodTimeline entries={day.entries} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
