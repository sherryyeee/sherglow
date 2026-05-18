"use client";

import Link from "next/link";
import { MOODS } from "./MoodFaces";

export default function MoodCheckin() {
  return (
    <section className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-[#3D2832]">今天的心情如何？</p>
        <Link
          href="/mood"
          className="text-[11px] font-medium text-[#D4788A]"
        >
          记录 →
        </Link>
      </div>

      <Link
        href="/mood"
        className="block bg-white rounded-3xl py-5 px-3 border border-[#F9D8E4]"
        style={{ boxShadow: "0 2px 16px rgba(242,139,168,0.07)", textDecoration: "none" }}
      >
        <div className="flex justify-between items-start px-1">
          {MOODS.map((mood) => {
            const Face = mood.Face;
            return (
              <div key={mood.key} className="flex flex-col items-center gap-2">
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                  }}
                >
                  <Face />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "#C4ACB4" }}>
                  {mood.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[11px] mt-4 font-medium" style={{ color: "#C4ACB4" }}>
          点击开始记录今天的心情 ✨
        </p>
      </Link>
    </section>
  );
}
