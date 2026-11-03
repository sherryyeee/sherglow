"use client";

import { RotateCcw, RotateCw } from "lucide-react";
import type { EpisodeSummary } from "@/lib/episodes";
import { formatClock } from "@/lib/episode-format";
import { usePlayer } from "./PlayerProvider";
import PlayButton from "./PlayButton";

const RATES = [1, 1.25, 1.5, 0.8];

// 详情页的完整播放器：进度条、快退/快进 15 秒、倍速
export default function EpisodePlayer({ episode }: { episode: EpisodeSummary }) {
  const { current, time, duration, rate, seek, skip, setRate } = usePlayer();
  const isCurrent = current?.date === episode.date;
  const total = isCurrent && duration ? duration : episode.durationSec ?? 0;
  const position = isCurrent ? time : 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#F9D8E4]" style={{ boxShadow: "0 2px 12px rgba(242,139,168,0.07)" }}>
      <input
        type="range"
        min={0}
        max={Math.max(1, Math.floor(total))}
        step={1}
        value={Math.floor(position)}
        disabled={!isCurrent}
        onChange={(e) => seek(Number(e.target.value))}
        className="w-full accent-[#F28BA8]"
        aria-label="播放进度"
      />
      <div className="flex justify-between text-[11px] text-[#C4ACB4] mb-3">
        <span>{formatClock(position)}</span>
        <span>{formatClock(total)}</span>
      </div>
      <div className="flex items-center justify-center gap-7">
        <button
          onClick={() => setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length])}
          className="w-12 text-[12px] font-semibold text-[#A89098]"
          aria-label="切换倍速"
        >
          {rate}x
        </button>
        <button onClick={() => skip(-15)} disabled={!isCurrent} aria-label="后退 15 秒" className="disabled:opacity-40">
          <RotateCcw size={22} color="#A89098" />
        </button>
        <PlayButton episode={episode} size={52} />
        <button onClick={() => skip(15)} disabled={!isCurrent} aria-label="前进 15 秒" className="disabled:opacity-40">
          <RotateCw size={22} color="#A89098" />
        </button>
        <span className="w-12" />
      </div>
    </div>
  );
}
