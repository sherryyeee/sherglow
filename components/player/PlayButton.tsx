"use client";

import { Pause, Play } from "lucide-react";
import type { EpisodeSummary } from "@/lib/episodes";
import { usePlayer } from "./PlayerProvider";

// 节目卡片上的播放按钮；没有音频的旧节目显示"仅文字"
export default function PlayButton({ episode, size = 40 }: { episode: EpisodeSummary; size?: number }) {
  const { current, playing, play, toggle } = usePlayer();
  if (!episode.audioUrl) {
    return <span className="text-[11px] text-[#C4ACB4] flex-shrink-0">仅文字</span>;
  }
  const isCurrent = current?.date === episode.date;
  const showPause = isCurrent && playing;
  const icon = Math.round(size * 0.4);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (isCurrent) toggle();
        else play(episode);
      }}
      aria-label={showPause ? "暂停" : "播放"}
      className="rounded-full flex items-center justify-center flex-shrink-0 active:opacity-70"
      style={{ width: size, height: size, background: "linear-gradient(135deg, #F28BA8 0%, #D4A0C8 100%)" }}
    >
      {showPause
        ? <Pause size={icon} color="white" fill="white" />
        : <Play size={icon} color="white" fill="white" className="ml-0.5" />}
    </button>
  );
}
